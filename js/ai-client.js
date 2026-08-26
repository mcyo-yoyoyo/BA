/**
 * 评估助手调用：本机同源代理 → 3847 代理 → 直连。
 * DeepSeek 官方接口不开放浏览器 CORS，直连会失败。
 */
(function (global) {
    const LS = 'archipro-ai-assistant-v1';
    const KEY_SS = 'youwei_ai_key_session_v1';
    const OPS_LS = 'youwei_ops_v1';
    const PROVIDERS = {
        deepseek: { id: 'deepseek', name: 'DeepSeek', endpoint: 'https://api.deepseek.com', model: 'deepseek-v4-flash' },
        siliconflow: { id: 'siliconflow', name: '硅基流动', endpoint: 'https://api.siliconflow.cn/v1', model: 'deepseek-ai/DeepSeek-V3' },
        openai: { id: 'openai', name: 'OpenAI', endpoint: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
        openrouter: { id: 'openrouter', name: 'OpenRouter', endpoint: 'https://openrouter.ai/api/v1', model: 'deepseek/deepseek-chat' }
    };
    let lastAssistantRaw = '';
    let lastRoute = null;

    function sanitizeApiKey(raw) {
        let k = String(raw || '').trim();
        k = k.replace(/^['"“”‘’]+|['"“”‘’]+$/g, '').trim();
        k = k.replace(/^Bearer\s+/i, '').trim();
        return k;
    }

    function emptyLocal() {
        return { endpoint: '', apiKey: '', model: '', provider: '' };
    }

    function readSessionKey() {
        try {
            return sanitizeApiKey(sessionStorage.getItem(KEY_SS));
        } catch (e) {
            return '';
        }
    }

    function writeSessionKey(key) {
        const k = sanitizeApiKey(key);
        try {
            if (k) sessionStorage.setItem(KEY_SS, k);
            else sessionStorage.removeItem(KEY_SS);
        } catch (e) { /* ignore */ }
        return k;
    }

    function persistPlatform(cfg) {
        const endpoint = String((cfg && cfg.endpoint) || '').trim();
        const provider = String((cfg && cfg.provider) || '').trim()
            || ((providerOf(endpoint) || {}).id || '');
        const preset = PROVIDERS[provider];
        const safe = {
            endpoint: endpoint,
            model: String((cfg && cfg.model) || '').trim() || (preset && preset.model) || '',
            provider: provider
        };
        try {
            localStorage.setItem(LS, JSON.stringify(safe));
        } catch (e) { /* ignore */ }
        return safe;
    }

    function takeLegacyKey(raw) {
        const k = sanitizeApiKey(raw);
        if (!k) return '';
        if (!readSessionKey()) writeSessionKey(k);
        return k;
    }

    function migrateOpsKey() {
        try {
            const raw = localStorage.getItem(OPS_LS);
            if (!raw) return;
            const o = JSON.parse(raw);
            if (!o || !o.ai || !o.ai.apiKey) return;
            takeLegacyKey(o.ai.apiKey);
            o.ai.apiKey = '';
            if (global.YouweiOps && typeof global.YouweiOps.patch === 'function') {
                global.YouweiOps.patch({ ai: { apiKey: '' } });
            } else {
                localStorage.setItem(OPS_LS, JSON.stringify(o));
            }
        } catch (e) { /* ignore */ }
    }

    function loadLocal() {
        migrateOpsKey();
        try {
            const raw = localStorage.getItem(LS);
            if (!raw) {
                return Object.assign(emptyLocal(), { apiKey: readSessionKey() });
            }
            const o = JSON.parse(raw);
            if (o && o.apiKey) {
                takeLegacyKey(o.apiKey);
                persistPlatform({
                    endpoint: o.endpoint,
                    model: o.model,
                    provider: o.provider
                });
            }
            return {
                endpoint: String(o.endpoint || '').trim(),
                apiKey: readSessionKey(),
                model: String(o.model || '').trim(),
                provider: String(o.provider || '').trim()
            };
        } catch (e) {
            return Object.assign(emptyLocal(), { apiKey: readSessionKey() });
        }
    }

    function saveLocal(cfg) {
        persistPlatform(cfg);
        const typed = sanitizeApiKey(cfg && cfg.apiKey);
        if (typed) writeSessionKey(typed);
    }

    function clearKey() {
        writeSessionKey('');
        try {
            const raw = localStorage.getItem(LS);
            if (raw) {
                const o = JSON.parse(raw);
                persistPlatform({
                    endpoint: o && o.endpoint,
                    model: o && o.model,
                    provider: o && o.provider
                });
            }
        } catch (e) { /* ignore */ }
        try {
            if (global.YouweiOps && typeof global.YouweiOps.patch === 'function') {
                global.YouweiOps.patch({ ai: { apiKey: '' } });
            } else {
                migrateOpsKey();
            }
        } catch (e) { /* ignore */ }
    }

    function hasSessionKey() {
        return !!readSessionKey();
    }

    function guessFromKey(key) {
        const k = sanitizeApiKey(key);
        if (/^sk-or-/.test(k)) return PROVIDERS.openrouter;
        if (/^sk-proj-/.test(k)) return PROVIDERS.openai;
        return null;
    }

    function guessProvider(key, endpoint) {
        return guessFromKey(key) || providerOf(endpoint);
    }

    function providerOf(endpoint) {
        const ep = String(endpoint || '').toLowerCase();
        if (/openrouter\.ai/i.test(ep)) return PROVIDERS.openrouter;
        if (/api\.openai\.com/i.test(ep)) return PROVIDERS.openai;
        if (/siliconflow/i.test(ep)) return PROVIDERS.siliconflow;
        if (/api\.deepseek\.com/i.test(ep)) return PROVIDERS.deepseek;
        return null;
    }

    function loadConfig() {
        const local = loadLocal();
        const ops = global.YouweiOps && typeof global.YouweiOps.getAi === 'function' ? global.YouweiOps.getAi() : {};
        const cfg = {
            endpoint: local.endpoint || (ops && ops.endpoint) || '',
            apiKey: local.apiKey || sanitizeApiKey(ops && ops.apiKey) || '',
            model: local.model || (ops && ops.model) || '',
            provider: local.provider || (ops && ops.provider) || '',
            needsProvider: false
        };
        const keyGuess = guessFromKey(cfg.apiKey);
        if (keyGuess) {
            cfg.provider = keyGuess.id;
            if (!cfg.endpoint || isDeepSeek(cfg.endpoint)) {
                cfg.endpoint = keyGuess.endpoint;
                if (!cfg.model || /^(deepseek-chat|deepseek-reasoner|deepseek-v4-flash)$/i.test(cfg.model)) {
                    cfg.model = keyGuess.model;
                }
            }
        }
        if (cfg.provider && PROVIDERS[cfg.provider]) {
            const p = PROVIDERS[cfg.provider];
            if (!cfg.endpoint) cfg.endpoint = p.endpoint;
            if (!cfg.model) cfg.model = p.model;
        } else {
            const fromEp = providerOf(cfg.endpoint);
            if (fromEp && fromEp.id !== 'deepseek') {
                cfg.provider = fromEp.id;
                if (!cfg.model) cfg.model = fromEp.model;
            } else if (cfg.apiKey && (!cfg.endpoint || isDeepSeek(cfg.endpoint))) {
                // 旧版只要有 Key 就默认塞官方 DeepSeek，硅基/OpenAI 的 Key 会一直 401
                cfg.needsProvider = true;
                cfg.endpoint = '';
                cfg.provider = '';
            }
        }
        if (isDeepSeek(cfg.endpoint) && /^(deepseek-chat|deepseek-reasoner)$/i.test(cfg.model)) {
            cfg.model = 'deepseek-v4-flash';
        }
        if (!cfg.model && cfg.endpoint) {
            const p = providerOf(cfg.endpoint);
            if (p) cfg.model = p.model;
        }
        return cfg;
    }

    function isDeepSeek(endpoint) {
        return /api\.deepseek\.com/i.test(String(endpoint || ''));
    }

    function officialUrl(endpoint) {
        let base = String(endpoint || '').trim().replace(/\/+$/, '');
        if (!base) throw new Error('未配置 API 地址');
        if (/\/chat\/completions$/i.test(base)) return base;
        const low = base.toLowerCase();
        if (low.includes('api.deepseek.com')) {
            return base.replace(/\/v1$/i, '') + '/chat/completions';
        }
        if (/\/v1$/i.test(base)) return base + '/chat/completions';
        return base + '/v1/chat/completions';
    }

    function isCorsLike(err) {
        const m = String(err && err.message ? err.message : err || '');
        return /failed to fetch|networkerror|cors|load failed|network request failed/i.test(m);
    }

    async function probe(url, ms) {
        try {
            const ctrl = new AbortController();
            const t = setTimeout(function () { ctrl.abort(); }, ms || 600);
            const r = await fetch(url, { method: 'GET', signal: ctrl.signal, cache: 'no-store' });
            clearTimeout(t);
            return r.status < 500;
        } catch (e) {
            return false;
        }
    }

    async function resolveRoute(cfg) {
        if (await probe('/api/ai/health', 500)) {
            lastRoute = { kind: 'same-origin', url: '/api/ai/chat', label: '本站代理' };
            return lastRoute;
        }
        if (await probe('http://127.0.0.1:3847/health', 500)) {
            lastRoute = { kind: 'local-proxy', url: 'http://127.0.0.1:3847/v1/chat/completions', label: '本机 3847 代理' };
            return lastRoute;
        }
        const ep = (cfg && cfg.endpoint) || '';
        if (!ep) {
            lastRoute = { kind: 'none', url: '', label: '未配置' };
            return lastRoute;
        }
        lastRoute = { kind: 'direct', url: officialUrl(ep), label: isDeepSeek(ep) ? '直连（可能被浏览器拦截）' : '直连' };
        return lastRoute;
    }

    function parseSseDelta(payload) {
        if (!payload || payload === '[DONE]') return '';
        try {
            const json = JSON.parse(payload);
            const ch = json.choices && json.choices[0];
            if (!ch) return '';
            if (ch.delta && ch.delta.content != null) return String(ch.delta.content);
            if (ch.message && ch.message.content != null) return String(ch.message.content);
        } catch (e) { /* ignore */ }
        return '';
    }

    function readMessage(data) {
        const msg = data && data.choices && data.choices[0] && data.choices[0].message;
        if (!msg) return '';
        let txt = msg.content != null ? String(msg.content).trim() : '';
        const reason = msg.reasoning_content != null ? String(msg.reasoning_content).trim() : '';
        if (!txt && reason) return reason;
        if (reason) return txt + '\n\n——\n【推理过程】\n' + reason;
        return txt;
    }

    async function readResponse(res, onDelta) {
        const ctype = String(res.headers.get('content-type') || '');
        if (res.body && typeof res.body.getReader === 'function' && /event-stream|octet-stream|text\/plain/i.test(ctype)) {
            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let acc = '';
            let buffer = '';
            let sawSse = false;
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                if (buffer.indexOf('data:') !== -1) sawSse = true;
                const lines = buffer.split(/\r?\n/);
                buffer = lines.pop() || '';
                lines.forEach(function (line) {
                    const t = line.trim();
                    if (!t.startsWith('data:')) return;
                    const delta = parseSseDelta(t.slice(5).trim());
                    if (delta) {
                        acc += delta;
                        if (onDelta) onDelta(acc);
                    }
                });
            }
            if (buffer.trim().startsWith('data:')) {
                const delta = parseSseDelta(buffer.trim().slice(5).trim());
                if (delta) {
                    acc += delta;
                    if (onDelta) onDelta(acc);
                }
            }
            if (acc) return acc;
            if (!sawSse && buffer) {
                try {
                    const data = JSON.parse(buffer);
                    return readMessage(data) || '（模型返回为空）';
                } catch (e) { /* ignore */ }
            }
        }
        const raw = await res.text();
        try {
            const data = JSON.parse(raw);
            return readMessage(data) || '（模型返回为空）';
        } catch (e) {
            return raw || '（模型返回为空）';
        }
    }

    function upstreamHost(cfg, route) {
        try {
            const ep = (cfg && cfg.endpoint) || 'https://api.deepseek.com';
            return new URL(officialUrl(ep)).host;
        } catch (e) {
            return (route && route.label) || 'api.deepseek.com';
        }
    }

    async function postChat(url, cfg, body, onDelta, route) {
        const headers = {
            'Content-Type': 'application/json',
            ...(cfg.apiKey ? { Authorization: 'Bearer ' + sanitizeApiKey(cfg.apiKey) } : {})
        };
        if (route && (route.kind === 'same-origin' || route.kind === 'local-proxy') && cfg.endpoint) {
            headers['X-Youwei-Upstream'] = officialUrl(cfg.endpoint);
        }
        const res = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
        });
        if (!res.ok) {
            const t = await res.text();
            const err = new Error(t.slice(0, 240) || res.statusText);
            err.status = res.status;
            throw err;
        }
        return readResponse(res, onDelta);
    }

    function parseApiErrorBlob(err) {
        const raw = String((err && err.message) || err || '');
        const tryParse = (s) => {
            try {
                const o = JSON.parse(s);
                const inner = o.error || o;
                return {
                    message: String(inner.message || ''),
                    type: String(inner.type || ''),
                    code: String(inner.code || '')
                };
            } catch (e) {
                return null;
            }
        };
        let parsed = tryParse(raw);
        if (!parsed) {
            const m = raw.match(/\{[\s\S]*"error"[\s\S]*\}/);
            if (m) parsed = tryParse(m[0]);
        }
        return parsed || { message: raw, type: '', code: '' };
    }

    function friendlyError(err, route, cfg) {
        if (err && err.message === 'NO_CONFIG') {
            return '还没有可用的模型连接。请在齿轮里填写 Key 后保存，或先改左侧内容。';
        }
        if (err && err.message === 'NO_PROVIDER') {
            return '请先在齿轮里点选 Key 所属平台（硅基流动 / OpenAI / OpenRouter / DeepSeek），再保存并试连。Cursor 订阅不能当 API Key。';
        }
        if (err && err.message === 'CORS_BLOCKED') {
            return '浏览器不能直连 DeepSeek。请另开终端运行 npm run ai-proxy，或用本仓库的开发服务启动后再试。';
        }
        if (isCorsLike(err) && route && (route.kind === 'direct' || isDeepSeek(cfg && cfg.endpoint))) {
            return '浏览器拦截了对 DeepSeek 的直连。请另开终端运行 npm run ai-proxy，或用本仓库的开发服务启动网站。';
        }
        const parsed = parseApiErrorBlob(err);
        const blob = (parsed.message + ' ' + parsed.type + ' ' + parsed.code).toLowerCase();
        if (/authentication|invalid.*api key|api key.*invalid|unauthorized/.test(blob) || parsed.type === 'authentication_error' || (err && err.status === 401)) {
            const p = providerOf(cfg && cfg.endpoint);
            const name = (p && p.name) || upstreamHost(cfg, route);
            return name + ' 不认这份 Key。请在齿轮里改选您开 Key 的平台（硅基流动 / OpenAI / OpenRouter / DeepSeek），再点「保存并试连」。Cursor 订阅不能当 API Key。';
        }
        if (/insufficient|quota|balance|payment/.test(blob) || (err && err.status === 402)) {
            return '模型额度不足。请检查账户余额，或先用左侧手工填写。';
        }
        if (/rate.?limit|too many/.test(blob) || (err && err.status === 429)) {
            return '请求过于频繁，请稍后再试。';
        }
        if (/your api key|authentication fails|"error"\s*:/.test(parsed.message)) {
            return '智能助手连接失败。请在齿轮里检查 Key，或先继续改左侧内容。';
        }
        const clean = String(parsed.message || '').replace(/your api key:\s*\S+/ig, '').trim();
        return (clean || '智能助手暂时连不上。').slice(0, 160);
    }

    async function chat(opts) {
        const cfg = loadConfig();
        if (!cfg.endpoint && !cfg.apiKey) {
            const e = new Error('NO_CONFIG');
            e.friendly = friendlyError(e);
            throw e;
        }
        if (cfg.needsProvider || (cfg.apiKey && !cfg.endpoint)) {
            const e = new Error('NO_PROVIDER');
            e.friendly = friendlyError(e);
            throw e;
        }
        const route = await resolveRoute(cfg);
        if (route.kind === 'none') {
            const e = new Error('NO_CONFIG');
            e.friendly = friendlyError(e);
            throw e;
        }
        const model = cfg.model || (providerOf(cfg.endpoint) || PROVIDERS.deepseek).model;
        const messages = [];
        if (opts && opts.system) messages.push({ role: 'system', content: opts.system });
        (opts && opts.history ? opts.history : []).slice(-6).forEach(function (m) {
            if (m.role === 'user' || m.role === 'assistant') {
                messages.push({ role: m.role, content: String(m.text || m.content || '').slice(0, 4000) });
            }
        });
        if (opts && opts.user) messages.push({ role: 'user', content: opts.user });
        const body = {
            model: model,
            messages: messages,
            temperature: opts && opts.temperature != null ? opts.temperature : 0.4,
            stream: opts && opts.stream === false ? false : true
        };
        const ml = String(model).toLowerCase();
        if (isDeepSeek(cfg.endpoint) && ml.startsWith('deepseek')) {
            const thinkOn = ml.includes('reasoner') || (opts && opts.thinking === 'enabled');
            body.thinking = { type: thinkOn ? 'enabled' : 'disabled' };
            if (thinkOn) body.reasoning_effort = 'high';
        }
        try {
            const text = await postChat(route.url, cfg, body, opts && opts.onDelta, route);
            lastAssistantRaw = text;
            return text;
        } catch (e) {
            if (e && e.status === 400 && body.thinking) {
                delete body.thinking;
                delete body.reasoning_effort;
                try {
                    const text = await postChat(route.url, cfg, body, opts && opts.onDelta, route);
                    lastAssistantRaw = text;
                    return text;
                } catch (e2) {
                    e2.friendly = friendlyError(e2, route, cfg);
                    throw e2;
                }
            }
            if (isCorsLike(e) && (route.kind === 'direct' || isDeepSeek(cfg.endpoint))) {
                const blocked = new Error('CORS_BLOCKED');
                blocked.friendly = friendlyError(blocked, route, cfg);
                throw blocked;
            }
            e.friendly = friendlyError(e, route, cfg);
            throw e;
        }
    }

    global.YouweiAi = {
        loadConfig: loadConfig,
        loadLocal: loadLocal,
        saveLocal: saveLocal,
        clearKey: clearKey,
        hasSessionKey: hasSessionKey,
        officialUrl: officialUrl,
        resolveRoute: resolveRoute,
        lastRoute: function () { return lastRoute; },
        lastRaw: function () { return lastAssistantRaw; },
        setLastRaw: function (t) { lastAssistantRaw = String(t || ''); },
        chat: chat,
        probeConnection: async function () {
            const cfg = loadConfig();
            if (!sanitizeApiKey(cfg.apiKey)) {
                return { ok: false, message: '还没有 Key。请先在齿轮里粘贴后保存。' };
            }
            if (cfg.needsProvider || !cfg.endpoint) {
                return { ok: false, message: friendlyError(new Error('NO_PROVIDER'), lastRoute, cfg) };
            }
            try {
                await chat({
                    system: '只回复一个字：好',
                    user: '好',
                    stream: false,
                    temperature: 0
                });
                return { ok: true, message: '已连通「' + upstreamHost(cfg, lastRoute) + '」' };
            } catch (e) {
                return { ok: false, message: (e && e.friendly) || friendlyError(e, lastRoute, cfg) };
            }
        },
        friendlyError: function (err) { return friendlyError(err, lastRoute, loadConfig()); },
        isDeepSeek: isDeepSeek,
        providers: PROVIDERS,
        guessProvider: guessProvider,
        providerOf: providerOf
    };
})(window);
