/**
 * 一键启动：静态站点 + DeepSeek 同源代理
 * 浏览器打开 http://127.0.0.1:8765
 */
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleContentApi } from './content-store.mjs';

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
    '.woff': 'font/woff',
    '.map': 'application/json'
};

const ALLOWED_UPSTREAM = [
    'api.deepseek.com',
    'api.siliconflow.cn',
    'api.openai.com',
    'openrouter.ai'
];

function hostAllowed(hostname) {
    const h = String(hostname || '').toLowerCase();
    if (h === 'localhost' || h === '127.0.0.1') return true;
    let envHost = '';
    try { envHost = new URL(UPSTREAM).hostname.toLowerCase(); } catch (e) { /* ignore */ }
    if (envHost && h === envHost) return true;
    return ALLOWED_UPSTREAM.some((a) => h === a || h.endsWith('.' + a));
}

function chatUrlFromBase(base) {
    const raw = String(base || '').trim();
    if (!/^https?:\/\/[^\s]+$/i.test(raw)) return '';
    try {
        const u = new URL(raw);
        if (u.protocol === 'http:' && !/^(localhost|127\.0\.0\.1)$/i.test(u.hostname)) return '';
        if (!hostAllowed(u.hostname)) return '';
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

function leadsPath() {
    return path.join(ROOT, 'data', 'leads.json');
}

function readLeads() {
    try {
        const arr = JSON.parse(fs.readFileSync(leadsPath(), 'utf8'));
        return Array.isArray(arr) ? arr : [];
    } catch (e) {
        return [];
    }
}

async function handleLeads(req, res) {
    const headers = {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store'
    };
    if (req.method === 'OPTIONS') {
        return send(res, 204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }, '');
    }
    if (req.method === 'GET') {
        return send(res, 200, headers, JSON.stringify(readLeads()));
    }
    if (req.method !== 'POST') {
        return send(res, 405, headers, JSON.stringify({ ok: false }));
    }
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    let row = {};
    try { row = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'); } catch (e) { row = {}; }
    const rec = {
        name: String((row && row.name) || '').trim().slice(0, 80),
        phone: String((row && row.phone) || '').trim().slice(0, 40),
        note: String((row && row.note) || '').trim().slice(0, 400),
        at: String((row && row.at) || new Date().toISOString())
    };
    if (!rec.name || !rec.phone) {
        return send(res, 400, headers, JSON.stringify({ ok: false, message: 'need name and phone' }));
    }
    fs.mkdirSync(path.join(ROOT, 'data'), { recursive: true });
    const list = readLeads();
    list.push(rec);
    fs.writeFileSync(leadsPath(), JSON.stringify(list, null, 2));
    const hook = String(process.env.LEAD_WEBHOOK || '').trim();
    if (/^https:\/\//i.test(hook)) {
        fetch(hook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(rec) }).catch(() => {});
    }
    return send(res, 200, headers, JSON.stringify({ ok: true }));
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
    if (p.replace(/\/$/, '') === '/api/leads') {
        return handleLeads(req, res);
    }
    if (await handleContentApi(ROOT, req, res, p)) {
        return;
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
    console.log(`[youwei] 内容库  data/content.json  /api/ops`);
    console.log(`[youwei] AI 代理 /api/ai/chat  ->  ${upstreamChatUrl()}`);
    console.log('');
});
