#!/usr/bin/env python3
"""Static site + same-origin LLM proxy (avoids DeepSeek browser CORS)."""
from __future__ import annotations

import json
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

PORT = int(os.environ.get("PORT", "8765"))
UPSTREAM = os.environ.get("AI_UPSTREAM", "https://api.deepseek.com").rstrip("/")
ROOT = os.path.dirname(os.path.abspath(__file__))


def chat_url_from_base(base: str) -> str:
    raw = (base or "").strip()
    if not raw.startswith(("http://", "https://")):
        return ""
    try:
        from urllib.parse import urlparse
        u = urlparse(raw)
        if u.scheme == "http" and u.hostname not in ("localhost", "127.0.0.1"):
            return ""
        path = (u.path or "").rstrip("/")
        if path.endswith("/chat/completions"):
            return raw.rstrip("/")
        if "api.deepseek.com" in (u.netloc or ""):
            return f"{u.scheme}://{u.netloc}/chat/completions"
        if path.endswith("/v1"):
            return f"{u.scheme}://{u.netloc}{path}/chat/completions"
        return f"{u.scheme}://{u.netloc}{path}/v1/chat/completions"
    except Exception:
        return ""


def upstream_chat_url(header_value: str = "") -> str:
    from_client = chat_url_from_base(header_value)
    if from_client:
        return from_client
    low = UPSTREAM.lower()
    if "api.deepseek.com" in low:
        return UPSTREAM + "/chat/completions"
    return UPSTREAM + "/v1/chat/completions"


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_OPTIONS(self):
        if self.path.startswith("/api/ai/"):
            self.send_response(204)
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Youwei-Upstream")
            self.end_headers()
            return
        self.send_error(404)

    def do_GET(self):
        if self.path.startswith("/api/ai/health"):
            body = json.dumps({"ok": True, "upstream": upstream_chat_url()}).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(body)
            return
        return SimpleHTTPRequestHandler.do_GET(self)

    def do_POST(self):
        if self.path.rstrip("/") != "/api/ai/chat":
            self.send_error(404)
            return
        length = int(self.headers.get("Content-Length") or 0)
        payload = self.rfile.read(length) if length else b"{}"
        req = Request(upstream_chat_url(self.headers.get("X-Youwei-Upstream") or ""), data=payload, method="POST")
        req.add_header("Content-Type", self.headers.get("Content-Type") or "application/json")
        auth = self.headers.get("Authorization")
        if auth:
            req.add_header("Authorization", auth)
        try:
            with urlopen(req, timeout=180) as resp:
                data = resp.read()
                self.send_response(resp.status)
                self.send_header("Content-Type", resp.headers.get("Content-Type") or "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(data)
        except HTTPError as e:
            err = e.read() if e.fp else (e.reason or "").encode("utf-8")
            self.send_response(e.code)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(err or json.dumps({"error": str(e.reason)}).encode("utf-8"))
        except URLError as e:
            self.send_response(502)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(("Upstream error: " + str(e.reason)).encode("utf-8"))


if __name__ == "__main__":
    httpd = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    print("[youwei] http://127.0.0.1:%s  proxy -> %s" % (PORT, upstream_chat_url()))
    httpd.serve_forever()
