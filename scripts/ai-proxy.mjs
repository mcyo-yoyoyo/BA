/**
 * 极简转发代理：浏览器 -> http://127.0.0.1:3847/v1/chat/completions -> 上游 LLM
 *
 * 环境变量：
 *   AI_PROXY_PORT   默认 3847
 *   AI_UPSTREAM     默认 https://api.deepseek.com（可改为 https://api.openai.com 等）
 *
 * DeepSeek 官方路径为 /chat/completions；OpenAI 为 /v1/chat/completions，脚本会自动选择。
 */
import http from 'http';
import { URL } from 'url';

const PORT = Number(process.env.AI_PROXY_PORT || 3847);
const UPSTREAM = String(process.env.AI_UPSTREAM || 'https://api.deepseek.com').trim().replace(/\/+$/, '');

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
    const low = UPSTREAM.toLowerCase();
    if (low.includes('api.deepseek.com')) return `${UPSTREAM}/chat/completions`;
    return `${UPSTREAM}/v1/chat/completions`;
}

function finish(res, status, headers, body) {
    res.writeHead(status, headers);
    res.end(body);
}

const server = http.createServer(async (req, res) => {
    const origin = req.headers.origin || '*';
    const cors = {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Youwei-Upstream',
        'Access-Control-Max-Age': '86400'
    };

    if (req.method === 'OPTIONS') {
        return finish(res, 204, cors, '');
    }

    const u = new URL(req.url || '/', 'http://127.0.0.1');
    const path = u.pathname || '';
    if (req.method === 'GET' && (path === '/health' || path === '/api/ai/health')) {
        return finish(res, 200, { ...cors, 'Content-Type': 'application/json; charset=utf-8' }, JSON.stringify({ ok: true, upstream: upstreamChatUrl() }));
    }
    const allowed = path === '/v1/chat/completions' || path === '/chat/completions';
    if (!allowed || req.method !== 'POST') {
        return finish(res, 404, { ...cors, 'Content-Type': 'text/plain; charset=utf-8' }, 'Not Found — use POST /v1/chat/completions');
    }

    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const buf = Buffer.concat(chunks);
    const target = upstreamChatUrl(req);

    try {
        const r = await fetch(target, {
            method: 'POST',
            headers: {
                'Content-Type': req.headers['content-type'] || 'application/json',
                ...(req.headers.authorization ? { Authorization: req.headers.authorization } : {})
            },
            body: buf.length ? buf : undefined
        });
        const headers = {
            ...cors,
            'Content-Type': r.headers.get('content-type') || 'application/json',
            'Cache-Control': 'no-cache'
        };
        res.writeHead(r.status, headers);
        if (!r.body || typeof r.body.getReader !== 'function') {
            const text = await r.text();
            return res.end(text);
        }
        const reader = r.body.getReader();
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value && value.length) res.write(Buffer.from(value));
        }
        res.end();
    } catch (e) {
        finish(res, 502, { ...cors, 'Content-Type': 'text/plain; charset=utf-8' }, `Upstream error: ${e && e.message ? e.message : e}`);
    }
});

server.listen(PORT, '127.0.0.1', () => {
    console.log(`[ai-proxy] http://127.0.0.1:${PORT}  ->  ${upstreamChatUrl()}`);
});
