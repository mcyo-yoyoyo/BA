/**
 * 桌面版本机服务：静态页 + DeepSeek 同源代理。
 * 逻辑对齐 scripts/dev.mjs，不改仓库里的页面文件。
 */
import http from 'http';
import fs from 'fs';
import path from 'path';

const UPSTREAM = String(process.env.AI_UPSTREAM || 'https://api.deepseek.com').replace(/\/+$/, '');

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon',
    '.woff2': 'font/woff2',
    '.map': 'application/json'
};

function chatUrlFromBase(base) {
    const raw = String(base || '').trim();
    if (!/^https?:\/\/[^\s]+$/i.test(raw)) return '';
    try {
        const u = new URL(raw);
        if (u.protocol === 'http:' && !/^(localhost|127\.0\.0\.1)$/i.test(u.hostname)) return '';
        if (/\/chat\/completions$/i.test(u.href.replace(/\/+$/, ''))) return u.href.replace(/\/+$/, '');
        if (/api\.deepseek\.com/i.test(u.host)) return u.origin.replace(/\/+$/, '') + '/chat/completions';
        const originPath = (u.origin + u.pathname).replace(/\/+$/, '');
        return /\/v1$/i.test(originPath) ? `${originPath}/chat/completions` : `${originPath}/v1/chat/completions`;
    } catch (e) {
        return '';
    }
}

function upstreamChatUrl(req) {
    const fromClient = req && chatUrlFromBase(req.headers['x-youwei-upstream']);
    if (fromClient) return fromClient;
    return /api\.deepseek\.com/i.test(UPSTREAM)
        ? `${UPSTREAM}/chat/completions`
        : `${UPSTREAM}/v1/chat/completions`;
}

function safeJoin(root, urlPath) {
    const raw = decodeURIComponent((urlPath || '/').split('?')[0]);
    const rel = raw === '/' ? 'index.html' : raw.replace(/^\/+/, '');
    const abs = path.normalize(path.join(root, rel));
    const rootNorm = path.normalize(root);
    const prefix = rootNorm.endsWith(path.sep) ? rootNorm : rootNorm + path.sep;
    if (abs !== rootNorm && !abs.startsWith(prefix)) return null;
    return abs;
}

function send(res, status, headers, body) {
    res.writeHead(status, headers);
    res.end(body);
}

async function proxyChat(req, res) {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const buf = Buffer.concat(chunks);
    try {
        const r = await fetch(upstreamChatUrl(req), {
            method: 'POST',
            headers: {
                'Content-Type': req.headers['content-type'] || 'application/json',
                ...(req.headers.authorization ? { Authorization: req.headers.authorization } : {})
            },
            body: buf.length ? buf : undefined
        });
        const headers = {
            'Content-Type': r.headers.get('content-type') || 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-store'
        };
        res.writeHead(r.status, headers);
        res.end(await r.text());
    } catch (e) {
        send(res, 502, { 'Content-Type': 'text/plain; charset=utf-8' }, `Upstream error: ${e && e.message ? e.message : e}`);
    }
}

function serveFile(root, req, res) {
    const file = safeJoin(root, req.url || '/');
    if (!file) return send(res, 403, { 'Content-Type': 'text/plain' }, 'Forbidden');
    let target = file;
    if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
        target = path.join(target, 'index.html');
    }
    if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
        return send(res, 404, { 'Content-Type': 'text/plain; charset=utf-8' }, 'Not Found');
    }
    const ext = path.extname(target).toLowerCase();
    send(res, 200, {
        'Content-Type': MIME[ext] || 'application/octet-stream',
        'Cache-Control': 'no-store'
    }, fs.readFileSync(target));
}

function createServer(root) {
    return http.createServer(async (req, res) => {
        const url = new URL(req.url || '/', 'http://127.0.0.1');
        const p = url.pathname;

        if (req.method === 'OPTIONS' && p.startsWith('/api/ai/')) {
            return send(res, 204, {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Youwei-Upstream'
            }, '');
        }
        if (req.method === 'GET' && p.startsWith('/api/ai/health')) {
            return send(res, 200, { 'Content-Type': 'application/json; charset=utf-8' }, JSON.stringify({ ok: true, proxy: 'youwei', upstream: upstreamChatUrl() }));
        }
        if (req.method === 'POST' && p.replace(/\/$/, '') === '/api/ai/chat') {
            return proxyChat(req, res);
        }
        if (req.method !== 'GET' && req.method !== 'HEAD') {
            return send(res, 405, { 'Content-Type': 'text/plain' }, 'Method Not Allowed');
        }
        serveFile(root, req, res);
    });
}

export async function probeYouwei(port) {
    try {
        const ctrl = new AbortController();
        const t = setTimeout(function () { ctrl.abort(); }, 400);
        const r = await fetch('http://127.0.0.1:' + port + '/api/ai/health', { signal: ctrl.signal, cache: 'no-store' });
        clearTimeout(t);
        if (r.status !== 200) return false;
        const o = await r.json();
        return !!(o && o.ok);
    } catch (e) {
        return false;
    }
}

export function startYouweiServer(opts) {
    const root = path.resolve((opts && opts.root) || process.cwd());
    let tryPort = Number((opts && opts.port) || 8765);
    const max = tryPort + 20;
    return new Promise(function (resolve, reject) {
        const attempt = function () {
            const server = createServer(root);
            const onError = function (err) {
                if (err && err.code === 'EADDRINUSE' && tryPort < max) {
                    tryPort += 1;
                    attempt();
                    return;
                }
                reject(err);
            };
            server.once('error', onError);
            server.listen(tryPort, '127.0.0.1', function () {
                server.removeListener('error', onError);
                resolve({
                    server: server,
                    port: tryPort,
                    url: 'http://127.0.0.1:' + tryPort
                });
            });
        };
        attempt();
    });
}
