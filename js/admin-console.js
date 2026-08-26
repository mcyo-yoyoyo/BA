(function () {
    const TABS = [
        { id: 'leads', title: '线索', lead: '登录弹窗留下的姓名和手机，只存在这台电脑的浏览器。' },
        { id: 'home', title: '场景上架', lead: '只控制行业和案例是否出现。标题、导语、七步改 js/i18n.js。' },
        { id: 'models', title: '工作台模型', lead: '价值流模板给评估工作台用。先打开一次工作台可同步内置模型。' },
        { id: 'assets', title: '评估底稿', lead: '评估项目只存在这台电脑。换电脑请先导出，再在那边导入。' },
        { id: 'assess', title: '评估配置', lead: '画布诊断规则、优先短板条数、近半年 P0 上限。' },
        { id: 'connect', title: '连接', lead: '先选开 Key 的平台，再粘贴 Key。工作台右侧助手会沿用这份连接。' }
    ];

    const HISTORY_LS = 'archipro-blueprint-history-v1';
    const LEADS_LS = 'youwei_leads_v1';
    let tab = 'leads';

    function $(id) { return document.getElementById(id); }

    function toast(msg) {
        const el = $('admin-toast');
        if (!el) return;
        el.textContent = msg;
        el.classList.add('on');
        setTimeout(function () { el.classList.remove('on'); }, 2200);
    }

    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
    }

    function val(id) {
        const el = $(id);
        return el ? el.value : '';
    }

    function checked(id) {
        const el = $(id);
        return !!(el && el.checked);
    }

    function renderNav() {
        $('admin-nav').innerHTML = TABS.map(function (t) {
            return '<button type="button" data-tab="' + t.id + '" class="' + (t.id === tab ? 'is-on' : '') + '">' + t.title + '</button>';
        }).join('');
        $('admin-nav').onclick = function (e) {
            const btn = e.target.closest('button[data-tab]');
            if (!btn) return;
            tab = btn.getAttribute('data-tab');
            render();
        };
    }

    function loadLeads() {
        try {
            const raw = localStorage.getItem(LEADS_LS);
            const arr = raw ? JSON.parse(raw) : [];
            return Array.isArray(arr) ? arr.slice().reverse() : [];
        } catch (e) { return []; }
    }

    function fmtWhen(at) {
        const s = String(at || '');
        return s ? s.replace('T', ' ').slice(0, 16) : '—';
    }

    function downloadText(filename, text) {
        const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 800);
    }

    function renderLeads() {
        const list = loadLeads();
        $('admin-body').innerHTML = `
            <div class="card">
                <h2>本机线索（${list.length}）</h2>
                <p class="hint">来自登录弹窗「留下」。换电脑或清站点数据会丢，跟进前请导出。</p>
                <table class="grid">
                    <thead><tr><th>时间</th><th>姓名</th><th>手机</th><th>备注</th></tr></thead>
                    <tbody>${list.map(function (r) {
                        return '<tr><td>' + esc(fmtWhen(r.at)) + '</td><td>' + esc(r.name || '') + '</td><td>' + esc(r.phone || '') + '</td><td>' + esc(r.note || '') + '</td></tr>';
                    }).join('') || '<tr><td colspan="4">还没有人留下姓名和手机。</td></tr>'}</tbody>
                </table>
                <div class="actions">
                    <button type="button" class="btn ghost" id="exp-leads">导出 JSON</button>
                    <button type="button" class="btn danger" id="clear-leads">清空本机线索</button>
                </div>
            </div>`;
        $('exp-leads').onclick = function () {
            downloadText('youwei-leads.json', JSON.stringify(loadLeads(), null, 2));
            toast('已下载本机线索');
        };
        $('clear-leads').onclick = function () {
            if (!list.length) return;
            if (!confirm('清空这台电脑上的线索？')) return;
            localStorage.removeItem(LEADS_LS);
            toast('已清空');
            render();
        };
    }

    function renderHome() {
        const inds = YouweiOps.getIndustries({ includeHidden: true });
        const cases = YouweiOps.getCases({ includeHidden: true });
        $('admin-body').innerHTML = `
            <div class="card">
                <h2>公开文案不在这里改</h2>
                <p class="hint">首页标题、导语、七步、带走说明以仓库 <code>js/i18n.js</code> 为准。下面只控制场景是否出现。</p>
            </div>
            <div class="card">
                <h2>行业</h2>
                <table class="grid">
                    <thead><tr><th>上架</th><th>序</th><th>名称</th></tr></thead>
                    <tbody>${inds.map(function (ind) {
                        return '<tr>' +
                            '<td><input type="checkbox" data-ind-pub="' + esc(ind.id) + '"' + (ind.published !== false ? ' checked' : '') + '></td>' +
                            '<td><input type="number" style="width:64px" data-ind-ord="' + esc(ind.id) + '" value="' + esc(ind.order) + '"></td>' +
                            '<td>' + esc(ind.name) + '</td></tr>';
                    }).join('')}</tbody>
                </table>
            </div>
            <div class="card">
                <h2>案例</h2>
                <table class="grid">
                    <thead><tr><th>上架</th><th>序</th><th>标题</th><th>场景摘要</th></tr></thead>
                    <tbody>${cases.map(function (c) {
                        return '<tr>' +
                            '<td><input type="checkbox" data-c-pub="' + esc(c.id) + '"' + (c.published !== false ? ' checked' : '') + '></td>' +
                            '<td><input type="number" style="width:64px" data-c-ord="' + esc(c.id) + '" value="' + esc(c.order) + '"></td>' +
                            '<td><input data-c-title="' + esc(c.id) + '" value="' + esc(c.title) + '"></td>' +
                            '<td><input data-c-sit="' + esc(c.id) + '" value="' + esc(c.situation || c.subtitle || '') + '"></td></tr>';
                    }).join('')}</tbody>
                </table>
                <div class="actions">
                    <button type="button" class="btn" id="save-home">保存上架</button>
                    <button type="button" class="btn ghost" id="preview-home">打开首页</button>
                </div>
            </div>`;
        $('save-home').onclick = saveShelf;
        $('preview-home').onclick = function () { window.open('index.html', '_blank'); };
    }

    function saveShelf() {
        const industries = {};
        document.querySelectorAll('[data-ind-pub]').forEach(function (el) {
            const id = el.getAttribute('data-ind-pub');
            industries[id] = {
                published: el.checked,
                order: Number((document.querySelector('[data-ind-ord="' + id + '"]') || {}).value || 0)
            };
        });
        const cases = {};
        document.querySelectorAll('[data-c-pub]').forEach(function (el) {
            const id = el.getAttribute('data-c-pub');
            cases[id] = {
                published: el.checked,
                order: Number((document.querySelector('[data-c-ord="' + id + '"]') || {}).value || 0),
                title: (document.querySelector('[data-c-title="' + id + '"]') || {}).value,
                situation: (document.querySelector('[data-c-sit="' + id + '"]') || {}).value
            };
        });
        YouweiOps.patch({ industries: industries, cases: cases });
        toast('上架已保存，刷新首页即可');
    }

    function renderModels() {
        const tpls = YouweiOps.getTemplates() || {};
        const keys = Object.keys(tpls);
        const cat = YouweiOps.loadCatalog();
        const ops = YouweiOps.load();
        const defMap = (ops.models && ops.models.defaultByIndustry) || {};
        if (!keys.length) {
            $('admin-body').innerHTML = `
                <div class="card">
                    <p class="hint">还没有同步到内置价值流模板。请用同一浏览器先打开一次工作台，再回到这里。</p>
                    <div class="actions">
                        <a class="btn" href="workshop.html?mode=pro">打开工作台同步</a>
                    </div>
                </div>`;
            return;
        }
        const first = keys[0];
        $('admin-body').innerHTML = `
            <div class="card">
                <h2>模板清单</h2>
                <p class="hint">${cat.at ? '已于 ' + cat.at.replace('T', ' ').slice(0, 16) + ' 从工作台同步。' : '正在使用已保存的运营覆盖。'}</p>
                <label class="field"><span>编辑哪一套</span>
                    <select id="tpl-key">${keys.map(function (k) {
                        return '<option value="' + esc(k) + '">' + esc((tpls[k] && tpls[k].name) || k) + ' · ' + esc(k) + '</option>';
                    }).join('')}</select>
                </label>
                <div id="tpl-editor"></div>
                <div class="row2">
                    <label class="field"><span>3C 默认模板 key</span><input id="def-3c" type="text" value="${esc(defMap['3C'] || 'hwcb_5a')}"></label>
                    <label class="field"><span>汽车默认模板 key</span><input id="def-auto" type="text" value="${esc(defMap['汽车'] || '')}"></label>
                </div>
                <div class="actions">
                    <button type="button" class="btn" id="save-tpl">保存当前模板</button>
                    <button type="button" class="btn ghost" id="reset-tpl">恢复工作台内置</button>
                </div>
            </div>`;
        function drawEditor(key) {
            const t = tpls[key] || { name: '', industries: [], stages: [] };
            const stages = t.stages || [];
            $('tpl-editor').innerHTML = `
                <div class="row2">
                    <label class="field"><span>名称</span><input id="tpl-name" type="text" value="${esc(t.name)}"></label>
                    <label class="field"><span>适用行业（逗号）</span><input id="tpl-inds" type="text" value="${esc((t.industries || []).join('，'))}"></label>
                </div>
                <table class="grid">
                    <thead><tr><th>阶段</th><th>类型</th><th>时长</th><th>场景</th><th>组件</th></tr></thead>
                    <tbody>${stages.map(function (s, i) {
                        return '<tr>' +
                            '<td><input data-st="' + i + '" data-sk="name" value="' + esc(s.name) + '"></td>' +
                            '<td><select data-st="' + i + '" data-sk="type"><option value="process"' + (s.type !== 'wait' ? ' selected' : '') + '>过程</option><option value="wait"' + (s.type === 'wait' ? ' selected' : '') + '>关口</option></select></td>' +
                            '<td><input data-st="' + i + '" data-sk="defaultTime" type="number" style="width:72px" value="' + esc(s.defaultTime != null ? s.defaultTime : s.actualTime || '') + '"></td>' +
                            '<td><input data-st="' + i + '" data-sk="scenarios" value="' + esc(s.scenarios || '') + '"></td>' +
                            '<td><input data-st="' + i + '" data-sk="components" value="' + esc(s.components || '') + '"></td></tr>';
                    }).join('')}</tbody>
                </table>`;
        }
        drawEditor(first);
        $('tpl-key').onchange = function () { drawEditor(this.value); };
        $('save-tpl').onclick = function () {
            const key = val('tpl-key');
            const stages = [];
            document.querySelectorAll('[data-st]').forEach(function (el) {
                const i = Number(el.getAttribute('data-st'));
                const k = el.getAttribute('data-sk');
                if (!stages[i]) stages[i] = Object.assign({}, (tpls[key].stages || [])[i] || { id: i + 1 });
                stages[i][k] = k === 'defaultTime' ? Number(el.value || 0) : el.value;
            });
            tpls[key] = {
                name: val('tpl-name'),
                industries: val('tpl-inds').split(/[,，、]/).map(function (s) { return s.trim(); }).filter(Boolean),
                stages: stages
            };
            const models = YouweiOps.load().models || {};
            models.templates = tpls;
            models.defaultByIndustry = { '3C': val('def-3c'), '汽车': val('def-auto'), '家电': val('def-3c') };
            YouweiOps.patch({ models: models });
            toast('模板已写入工作台覆盖层');
        };
        $('reset-tpl').onclick = function () {
            const models = YouweiOps.load().models || {};
            models.templates = null;
            YouweiOps.patch({ models: models });
            localStorage.removeItem('youwei_ops_catalog_v1');
            toast('已清空覆盖。打开一次工作台后重新同步。');
            render();
        };
    }

    function loadHistory() {
        try {
            const raw = localStorage.getItem(HISTORY_LS);
            const arr = raw ? JSON.parse(raw) : [];
            return Array.isArray(arr) ? arr : [];
        } catch (e) { return []; }
    }

    function renderAssets() {
        const a = YouweiOps.getAssets();
        const list = loadHistory();
        $('admin-body').innerHTML = `
            <div class="card">
                <h2>保存策略</h2>
                <div class="row2">
                    <label class="field"><span>最多保留份数</span><input id="a-max" type="number" min="4" max="200" value="${esc(a.historyMax)}"></label>
                    <label class="field"><span>标题格式</span><input id="a-pat" type="text" value="${esc(a.titlePattern)}"></label>
                </div>
                <label class="field"><span><input id="a-del" type="checkbox"${a.allowClientDelete !== false ? ' checked' : ''}> 允许评估用户在资产库删除自己的底稿</span></label>
                <div class="actions"><button type="button" class="btn" id="save-assets">保存资产策略</button></div>
            </div>
            <div class="card">
                <h2>本机已存底稿（${list.length}）</h2>
                <p class="hint">只存在这台电脑的浏览器。换电脑或清站点数据会丢。带走请先导出，到另一台电脑后点导入。</p>
                <table class="grid">
                    <thead><tr><th>标题</th><th>时间</th><th></th></tr></thead>
                    <tbody>${list.map(function (r) {
                        return '<tr><td>' + esc(r.title || r.name || ('#' + r.id)) + '</td><td>' + esc((r.savedAt || r.at || '').toString().slice(0, 19)) + '</td>' +
                            '<td><button type="button" class="btn danger" data-del-hist="' + esc(r.id) + '">删除</button></td></tr>';
                    }).join('') || '<tr><td colspan="3">还没有保存的评估底稿。</td></tr>'}</tbody>
                </table>
                <div class="actions">
                    <button type="button" class="btn ghost" id="exp-hist">导出底稿</button>
                    <label class="btn ghost" style="cursor:pointer">导入底稿
                        <input id="imp-hist" type="file" accept="application/json" style="display:none">
                    </label>
                </div>
            </div>`;
        $('save-assets').onclick = function () {
            YouweiOps.patch({
                assets: {
                    historyMax: Math.max(4, Number(val('a-max') || 40)),
                    titlePattern: val('a-pat') || '{org} · {project} · {date}',
                    allowClientDelete: checked('a-del')
                }
            });
            toast('资产策略已保存');
        };
        $('exp-hist').onclick = function () {
            downloadText('youwei-assessments.json', JSON.stringify(loadHistory(), null, 2));
            toast('已下载本机底稿');
        };
        $('imp-hist').onchange = function () {
            const file = this.files && this.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function () {
                try {
                    const arr = JSON.parse(String(reader.result || ''));
                    if (!Array.isArray(arr)) throw new Error('不是底稿列表');
                    const cur = loadHistory();
                    const seen = {};
                    cur.forEach(function (r) { if (r && r.id != null) seen[String(r.id)] = true; });
                    const merged = cur.slice();
                    arr.forEach(function (r) {
                        if (!r || typeof r !== 'object') return;
                        if (r.id != null && seen[String(r.id)]) return;
                        merged.push(r);
                    });
                    localStorage.setItem(HISTORY_LS, JSON.stringify(merged));
                    toast('已导入 ' + arr.length + ' 条，当前共 ' + merged.length + ' 条');
                    render();
                } catch (e) {
                    toast(e.message || '导入失败');
                }
            };
            reader.readAsText(file, 'utf-8');
        };
        $('admin-body').addEventListener('click', function (e) {
            const btn = e.target.closest('[data-del-hist]');
            if (!btn) return;
            const id = Number(btn.getAttribute('data-del-hist'));
            const next = loadHistory().filter(function (r) { return Number(r.id) !== id; });
            localStorage.setItem(HISTORY_LS, JSON.stringify(next));
            toast('已删除该底稿');
            render();
        });
    }

    function renderAssess() {
        const a = YouweiOps.getAssessment();
        const rules = YouweiOps.getDefaultRules() || [];
        $('admin-body').innerHTML = `
            <div class="card">
                <h2>热力与路标约束</h2>
                <div class="row2">
                    <label class="field"><span>优先短板最多几项（红区）</span><input id="as-heat" type="number" min="1" max="12" value="${esc(a.heatTopN)}"></label>
                    <label class="field"><span>近半年 P0 上限</span><input id="as-p0" type="number" min="1" max="8" value="${esc(a.p0Cap)}"></label>
                </div>
            </div>
            <div class="card">
                <h2>画布诊断规则（${rules.length}）</h2>
                <p class="hint">空着则沿用工作台内置三条。保存后新开的评估会话会带上这套规则。</p>
                <table class="grid">
                    <thead><tr><th>字段</th><th>关键词</th><th>联动字段</th><th>联动词</th><th>扣分</th><th>提示</th></tr></thead>
                    <tbody id="rule-body">${(rules.length ? rules : [{ field: 'costStructure', keyword: '', compareField: 'none', compareKeyword: '', score: 10, message: '' }]).map(function (r, i) {
                        return '<tr>' +
                            '<td><input data-r="' + i + '" data-rk="field" value="' + esc(r.field || '') + '"></td>' +
                            '<td><input data-r="' + i + '" data-rk="keyword" value="' + esc(r.keyword || '') + '"></td>' +
                            '<td><input data-r="' + i + '" data-rk="compareField" value="' + esc(r.compareField || 'none') + '"></td>' +
                            '<td><input data-r="' + i + '" data-rk="compareKeyword" value="' + esc(r.compareKeyword || '') + '"></td>' +
                            '<td><input data-r="' + i + '" data-rk="score" type="number" style="width:64px" value="' + esc(r.score || 0) + '"></td>' +
                            '<td><input data-r="' + i + '" data-rk="message" value="' + esc(r.message || '') + '"></td></tr>';
                    }).join('')}</tbody>
                </table>
                <div class="actions">
                    <button type="button" class="btn ghost" id="add-rule">加一行</button>
                    <button type="button" class="btn" id="save-assess">保存评估配置</button>
                </div>
            </div>`;
        $('add-rule').onclick = function () {
            const tb = $('rule-body');
            const i = tb.querySelectorAll('tr').length;
            const tr = document.createElement('tr');
            tr.innerHTML = '<td><input data-r="' + i + '" data-rk="field"></td><td><input data-r="' + i + '" data-rk="keyword"></td><td><input data-r="' + i + '" data-rk="compareField" value="none"></td><td><input data-r="' + i + '" data-rk="compareKeyword"></td><td><input data-r="' + i + '" data-rk="score" type="number" value="10"></td><td><input data-r="' + i + '" data-rk="message"></td>';
            tb.appendChild(tr);
        };
        $('save-assess').onclick = function () {
            const rows = [];
            document.querySelectorAll('[data-r]').forEach(function (el) {
                const i = Number(el.getAttribute('data-r'));
                const k = el.getAttribute('data-rk');
                if (!rows[i]) rows[i] = { id: Date.now() + i };
                rows[i][k] = k === 'score' ? Number(el.value || 0) : el.value;
            });
            const clean = rows.filter(function (r) { return r && (r.keyword || r.message); });
            YouweiOps.patch({
                assessment: {
                    heatTopN: Math.max(1, Number(val('as-heat') || 5)),
                    p0Cap: Math.max(1, Number(val('as-p0') || 3)),
                    rules: clean
                }
            });
            toast('评估配置已保存');
        };
    }

    async function renderConnect() {
        const cfg = YouweiAi.loadConfig();
        const providers = YouweiAi.providers || {};
        const chips = Object.keys(providers).map(function (id) {
            const p = providers[id];
            return '<button type="button" class="chip" data-ai-provider="' + esc(id) + '">' + esc(p.name) + '</button>';
        }).join('');
        $('admin-body').innerHTML = `
            <div class="card">
                <h2>模型连接</h2>
                <p class="hint">先点开 Key 的平台，再粘贴 Key。Cursor 订阅不能当 API Key。Key 只在本标签会话有效，关页或清站点即消失，也不会写入运营包。官方 DeepSeek 请用 npm run dev 走本站代理。</p>
                <div class="ai-provider-row">${chips}</div>
                <label class="field"><span>API Key</span><input id="ai-key" type="password" autocomplete="off" value="" placeholder="${cfg.apiKey ? '已在本会话保存，改写则覆盖' : '不要带引号或 Bearer'}"></label>
                <label class="field"><span>接口根地址</span><input id="ai-ep" type="url" value="${esc(cfg.endpoint)}" placeholder="点平台会自动填"></label>
                <label class="field"><span>模型</span><input id="ai-md" type="text" value="${esc(cfg.model)}" placeholder="点平台会自动填"></label>
                <p class="status${cfg.needsProvider ? ' bad' : ''}" id="ai-status">${cfg.needsProvider ? '旧配置把 Key 误送到了 DeepSeek。请改选平台后保存并试连。' : '正在检测通道…'}</p>
                <div class="actions">
                    <button type="button" class="btn" id="save-ai">保存并试连</button>
                    <button type="button" class="btn ghost" id="clear-ai-key">清除 Key</button>
                </div>
            </div>
            <div class="card">
                <h2>配置进出</h2>
                <p class="hint">把整包运营配置拷到另一台机器：导出 JSON，再在那边导入。</p>
                <div class="actions">
                    <button type="button" class="btn ghost" id="exp-ops">导出运营包</button>
                    <button type="button" class="btn ghost" id="imp-ops">导入运营包</button>
                    <button type="button" class="btn danger" id="reset-ops">清空本机运营覆盖</button>
                </div>
                <textarea id="ops-pack" placeholder="粘贴运营包 JSON"></textarea>
            </div>`;
        async function refreshStatus() {
            const st = $('ai-status');
            try {
                const route = await YouweiAi.resolveRoute(YouweiAi.loadConfig());
                st.className = 'status ' + (route.kind === 'direct' && YouweiAi.isDeepSeek(val('ai-ep') || YouweiAi.loadConfig().endpoint) ? 'bad' : 'ok');
                if (route.kind === 'none') {
                    st.textContent = '尚未配置可用通道。';
                    st.className = 'status';
                } else if (route.kind === 'direct' && YouweiAi.isDeepSeek(YouweiAi.loadConfig().endpoint)) {
                    st.textContent = '当前会直连官方接口，浏览器多半拦下。请运行 npm run ai-proxy 或 python serve.py。';
                } else {
                    st.textContent = '通道：' + route.label;
                }
            } catch (e) {
                st.textContent = '通道检测失败';
                st.className = 'status bad';
            }
        }
        function syncChips(id) {
            const pid = id || ((YouweiAi.providerOf && YouweiAi.providerOf(val('ai-ep'))) || {}).id;
            document.querySelectorAll('[data-ai-provider]').forEach(function (btn) {
                btn.classList.toggle('is-on', btn.getAttribute('data-ai-provider') === pid);
            });
        }
        document.querySelectorAll('[data-ai-provider]').forEach(function (btn) {
            btn.onclick = function () {
                const p = providers[btn.getAttribute('data-ai-provider')];
                if (!p) return;
                $('ai-ep').value = p.endpoint;
                $('ai-md').value = p.model;
                syncChips(p.id);
                toast('已选「' + p.name + '」。粘贴该平台的 Key，再点保存并试连');
            };
        });
        $('ai-key').oninput = function () {
            const guessed = YouweiAi.guessProvider && YouweiAi.guessProvider(val('ai-key'));
            if (guessed) {
                $('ai-ep').value = guessed.endpoint;
                if (!val('ai-md')) $('ai-md').value = guessed.model;
                syncChips(guessed.id);
            }
        };
        if (!cfg.needsProvider) refreshStatus();
        else syncChips();
        syncChips();
        $('save-ai').onclick = async function () {
            const endpoint = val('ai-ep').trim();
            const apiKey = val('ai-key').trim();
            const model = val('ai-md').trim();
            if (apiKey && !endpoint) {
                toast('请先点选 Key 所属平台');
                return;
            }
            const provider = ((YouweiAi.providerOf && YouweiAi.providerOf(endpoint)) || {}).id || '';
            const keyToUse = apiKey || (YouweiAi.loadConfig().apiKey || '');
            const payload = { endpoint: endpoint, apiKey: keyToUse, model: model, provider: provider };
            YouweiOps.patch({ ai: { endpoint: endpoint, model: model, provider: provider } });
            YouweiAi.saveLocal(payload);
            const st = $('ai-status');
            st.className = 'status';
            st.textContent = '正在试连…';
            const r = await YouweiAi.probeConnection();
            st.className = 'status ' + (r.ok ? 'ok' : 'bad');
            st.textContent = r.message;
            toast(r.ok ? '已连通，工作台右侧助手可用' : r.message);
            if (r.ok) refreshStatus();
        };
        $('clear-ai-key').onclick = function () {
            if (YouweiAi.clearKey) YouweiAi.clearKey();
            $('ai-key').value = '';
            $('ai-key').placeholder = '不要带引号或 Bearer';
            toast('已清除本会话 Key');
            refreshStatus();
        };
        $('exp-ops').onclick = function () {
            $('ops-pack').value = YouweiOps.exportPack();
            toast('已填入下方文本框，请复制保存');
        };
        $('imp-ops').onclick = function () {
            try {
                YouweiOps.importPack(val('ops-pack'));
                toast('运营包已导入');
                render();
            } catch (e) {
                toast(e.message || '导入失败');
            }
        };
        $('reset-ops').onclick = function () {
            if (!confirm('清空本机运营覆盖？首页和工作台将回到内置文案与模型。')) return;
            YouweiOps.resetAll();
            toast('已清空');
            render();
        };
    }

    function render() {
        const meta = TABS.find(function (t) { return t.id === tab; }) || TABS[0];
        $('admin-title').textContent = meta.title;
        $('admin-lead').textContent = meta.lead;
        renderNav();
        if (tab === 'leads') renderLeads();
        else if (tab === 'home') renderHome();
        else if (tab === 'models') renderModels();
        else if (tab === 'assets') renderAssets();
        else if (tab === 'assess') renderAssess();
        else renderConnect();
    }

    function boot() {
        if (YouweiAuth.mountAccountMenu) YouweiAuth.mountAccountMenu();
        render();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
})();
