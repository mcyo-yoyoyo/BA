/**
 * 本机内容库：data/content.json
 * 管理台写入，公开页 / 工作台只读。不进浏览器缓存。
 */
import fs from 'fs';
import path from 'path';
import { URL } from 'url';

const BLOCKED_HOST = /^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\]|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+|169\.254\.\d+\.\d+|metadata\.google\.internal)$/i;

function dbPath(root) {
    return path.join(root, 'data', 'content.json');
}

function emptyDb() {
    return { version: 1, updatedAt: '', ops: null, catalog: null };
}

export function readDb(root) {
    try {
        const raw = fs.readFileSync(dbPath(root), 'utf8');
        const o = JSON.parse(raw);
        if (!o || typeof o !== 'object') return emptyDb();
        return {
            version: 1,
            updatedAt: o.updatedAt || '',
            ops: o.ops && typeof o.ops === 'object' ? o.ops : null,
            catalog: o.catalog && typeof o.catalog === 'object' ? o.catalog : null
        };
    } catch (e) {
        return emptyDb();
    }
}

export function writeDb(root, next) {
    const dir = path.join(root, 'data');
    fs.mkdirSync(dir, { recursive: true });
    const cur = readDb(root);
    const out = {
        version: 1,
        updatedAt: new Date().toISOString(),
        ops: next && next.ops != null ? next.ops : cur.ops,
        catalog: next && Object.prototype.hasOwnProperty.call(next, 'catalog') ? next.catalog : cur.catalog
    };
    const file = dbPath(root);
    const tmp = file + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(out, null, 2));
    try {
        fs.renameSync(tmp, file);
    } catch (e) {
        fs.writeFileSync(file, JSON.stringify(out, null, 2));
        try { fs.unlinkSync(tmp); } catch (err) { /* ignore */ }
    }
    return out;
}

function jsonHeaders() {
    return {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store'
    };
}

function send(res, status, body) {
    res.writeHead(status, jsonHeaders());
    res.end(JSON.stringify(body));
}

async function readBody(req) {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const raw = Buffer.concat(chunks).toString('utf8') || '{}';
    try {
        return JSON.parse(raw);
    } catch (e) {
        return {};
    }
}

function htmlToText(html) {
    const titleM = String(html || '').match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleM ? titleM[1].replace(/\s+/g, ' ').trim().slice(0, 180) : '';
    const text = String(html || '')
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();
    return { title, text: text.slice(0, 12000) };
}

function assertPublicHttps(raw) {
    const href = String(raw || '').trim();
    if (!/^https:\/\//i.test(href)) throw new Error('只允许 https 信源');
    const u = new URL(href);
    if (BLOCKED_HOST.test(u.hostname)) throw new Error('不允许内网地址');
    if (u.username || u.password) throw new Error('不允许带账号的地址');
    return u.href;
}

export async function fetchSourcePage(rawUrl) {
    const href = assertPublicHttps(rawUrl);
    const ctrl = new AbortController();
    const timer = setTimeout(function () { ctrl.abort(); }, 8000);
    try {
        const r = await fetch(href, {
            signal: ctrl.signal,
            redirect: 'follow',
            headers: {
                'User-Agent': 'YowayContentBot/1.0 (local source review)',
                'Accept': 'text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.1'
            }
        });
        const buf = Buffer.from(await r.arrayBuffer());
        if (buf.length > 400 * 1024) throw new Error('页面过大');
        const ctype = String(r.headers.get('content-type') || '');
        if (ctype && !/html|text|xml|json/i.test(ctype)) throw new Error('不是可读页面');
        const parsed = htmlToText(buf.toString('utf8'));
        if (!parsed.text) throw new Error('页面没有可读正文');
        return {
            ok: true,
            url: href,
            status: r.status,
            title: parsed.title,
            text: parsed.text,
            fetchedAt: new Date().toISOString()
        };
    } finally {
        clearTimeout(timer);
    }
}

export async function handleContentApi(root, req, res, pathname) {
    const p = String(pathname || '').replace(/\/$/, '') || '/';
    if (req.method === 'OPTIONS' && (p === '/api/ops' || p === '/api/content/fetch' || p === '/api/content')) {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, PUT, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        });
        res.end('');
        return true;
    }
    if (p === '/api/content' && req.method === 'GET') {
        const db = readDb(root);
        send(res, 200, { ok: true, updatedAt: db.updatedAt, file: 'data/content.json', ops: db.ops, catalog: db.catalog });
        return true;
    }
    if (p === '/api/ops' && req.method === 'GET') {
        const db = readDb(root);
        send(res, 200, { ok: true, updatedAt: db.updatedAt, ops: db.ops, catalog: db.catalog });
        return true;
    }
    if (p === '/api/ops' && req.method === 'PUT') {
        const body = await readBody(req);
        const db = writeDb(root, { ops: body.ops || null, catalog: body.catalog != null ? body.catalog : undefined });
        send(res, 200, { ok: true, updatedAt: db.updatedAt });
        return true;
    }
    if (p === '/api/content/fetch' && req.method === 'POST') {
        const body = await readBody(req);
        try {
            send(res, 200, await fetchSourcePage(body && body.url));
        } catch (e) {
            send(res, 400, { ok: false, message: (e && e.message) || '抓取失败' });
        }
        return true;
    }
    return false;
}
