/**
 * 一键启动：静态站点 + DeepSeek 同源代理
 * 浏览器打开 http://127.0.0.1:8765
 */
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT || 8765);
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

function safeJoin(urlPath) {
    const raw = decodeURIComponent((urlPath || '/').split('?')[0]);
    const rel = raw === '/' ? 'index.html' : raw.replace(/^\/+/, '');
    const abs = path.normalize(path.join(ROOT, rel));
    if (!abs.startsWith(ROOT)) return null;
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
        const text = await r.text();
        res.end(text);
    } catch (e) {
        send(res, 502, { 'Content-Type': 'text/plain; charset=utf-8' }, `Upstream error: ${e && e.message ? e.message : e}`);
    }
}

function serveFile(req, res) {
    const file = safeJoin(req.url || '/');
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

const server = http.createServer(async (req, res) => {
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
        return send(res, 200, { 'Content-Type': 'application/json; charset=utf-8' }, JSON.stringify({ ok: true, upstream: upstreamChatUrl() }));
    }
    if (req.method === 'POST' && p.replace(/\/$/, '') === '/api/ai/chat') {
        return proxyChat(req, res);
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
        return send(res, 405, { 'Content-Type': 'text/plain' }, 'Method Not Allowed');
    }
    serveFile(req, res);
});

server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
        console.error(`[youwei] 端口 ${PORT} 已被占用。请先关闭占用该端口的窗口，或浏览器直接打开 http://127.0.0.1:${PORT}/`);
        process.exit(1);
    }
    console.error(err);
    process.exit(1);
});

server.listen(PORT, '127.0.0.1', () => {
    console.log('');
    console.log(`[youwei] 已启动  http://127.0.0.1:${PORT}/`);
    console.log(`[youwei] 工作台  http://127.0.0.1:${PORT}/workshop.html`);
    console.log(`[youwei] 管理台  http://127.0.0.1:${PORT}/admin.html`);
    console.log(`[youwei] AI 代理 /api/ai/chat  ->  ${upstreamChatUrl()}`);
    console.log('');
});
