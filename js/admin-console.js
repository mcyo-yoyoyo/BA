(function () {
    const NAV = [
        {
            group: '公开站点',
            items: [
                { id: 'home', title: '场景上架', lead: '控制首页行业与案例是否出现。也可导出 Excel，改完再导入；编号列请勿改。' }
            ]
        },
        {
            group: '评估工作台',
            items: [
                { id: 'models', title: '价值模板', lead: '步骤 2 用的价值流模板。可导出 Excel 改完再导入。' },
                { id: 'assess', title: '规则配置', lead: '画布诊断、优先短板条数、近半年 P0 上限。可导出 Excel 改完再导入。' },
                { id: 'connect', title: '模型连接', lead: '先选开 Key 的平台，再粘贴 Key。工作台右侧助手沿用这份连接。' }
            ]
        },
        {
            group: '本机数据',
            items: [
                { id: 'leads', title: '本机线索', lead: '登录时留下的姓名和手机，只存在这台电脑。可导出 Excel。' },
                { id: 'assets', title: '评估底稿', lead: '本机已保存的评估。换电脑请先导出，再到那边导入。' }
            ]
        }
    ];

    const HISTORY_LS = 'archipro-blueprint-history-v1';
    const LEADS_LS = 'youwei_leads_v1';
    let tab = 'home';

    function $(id) { return document.getElementById(id); }

    function allTabs() {
        return NAV.reduce(function (acc, g) { return acc.concat(g.items); }, []);
    }

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
        $('admin-nav').innerHTML = NAV.map(function (g) {
            return '<p class="side-group">' + esc(g.group) + '</p>' + g.items.map(function (t) {
                return '<button type="button" data-tab="' + t.id + '" class="' + (t.id === tab ? 'is-on' : '') + '">' + t.title + '</button>';
            }).join('');
        }).join('');
        $('admin-nav').onclick = function (e) {
            const btn = e.target.closest('button[data-tab]');
            if (!btn) return;
            tab = btn.getAttribute('data-tab');
            render();
        };
    }

    function loadLeadsRaw() {
        try {
            const raw = localStorage.getItem(LEADS_LS);
            const arr = raw ? JSON.parse(raw) : [];
            return Array.isArray(arr) ? arr : [];
        } catch (e) { return []; }
    }

    function loadLeads() {
        return loadLeadsRaw().slice().reverse();
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

    function excelBtns(expId, impId) {
        return '<button type="button" class="btn ghost" id="' + expId + '">导出 Excel</button>' +
            (impId
                ? '<label class="btn ghost xfer-file">导入 Excel<input id="' + impId + '" type="file" accept=".xlsx,.xls,.csv"></label>'
                : '');
    }

    function bindExcel(expId, exporter, impId, importer) {
        const exp = $(expId);
        if (exp) exp.onclick = function () {
            try {
                exporter();
                toast('已下载 Excel 模板');
            } catch (e) {
                toast(e.message || '导出失败');
            }
        };
        if (!impId) return;
        const inp = $(impId);
        if (!inp) return;
        inp.onchange = function () {
            const file = this.files && this.files[0];
            this.value = '';
            if (!file) return;
            YouweiExcel.readFile(file).then(function (wb) {
                importer(wb);
                render();
            }).catch(function (e) {
                toast(e.message || '导入失败');
            });
        };
    }

    function renderLeads() {
        const list = loadLeads();
        $('admin-body').innerHTML = `
            <div class="page-bar">
                ${excelBtns('exp-leads')}
            </div>
            <div class="card">
                <h2>线索一览</h2>
                <p class="hint">${list.length} 条。来自登录弹窗。换电脑或清站点数据会丢。</p>
                <div class="stack">${list.map(function (r) {
                    return '<div class="list-row"><div><b>' + esc(r.name || '未留姓名') + '</b>' +
                        '<p>' + esc(r.phone || '未留手机') + (r.note ? ' · ' + esc(r.note) : '') + '</p></div>' +
                        '<span class="meta">' + esc(fmtWhen(r.at)) + '</span></div>';
                }).join('') || '<p class="empty">还没有人留下姓名和手机。</p>'}</div>
                <div class="actions">
                    <button type="button" class="btn danger" id="clear-leads">清空本机线索</button>
                </div>
            </div>`;
        bindExcel('exp-leads', function () {
            const rows = [['姓名', '手机', '备注', '时间']].concat(loadLeads().map(function (r) {
                return [r.name || '', r.phone || '', r.note || '', fmtWhen(r.at)];
            }));
            YouweiExcel.download('youwei-leads.xlsx', [{ name: '线索', rows: rows, cols: [16, 16, 28, 20] }]);
        });
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
            <div class="page-bar">
                <button type="button" class="btn" id="save-home">保存上架</button>
                ${excelBtns('exp-home', 'imp-home')}
            </div>
            <div class="card">
                <h2>行业</h2>
                <p class="hint">勾选后出现在首页行业栏。顺序数字越小越靠前。</p>
                <div class="stack">${inds.map(function (ind) {
                    return '<div class="row-item">' +
                        '<label class="switch"><input type="checkbox" data-ind-pub="' + esc(ind.id) + '"' + (ind.published !== false ? ' checked' : '') + '><span>上架</span></label>' +
                        '<span class="row-name">' + esc(ind.name) + '</span>' +
                        '<label class="ord"><span>顺序</span><input type="number" data-ind-ord="' + esc(ind.id) + '" value="' + esc(ind.order) + '"></label>' +
                        '</div>';
                }).join('')}</div>
            </div>
            <div class="card">
                <h2>案例</h2>
                <p class="hint">每条单独成卡。标题和摘要用整行书写，保存后首页轮播会更新。</p>
                <div class="stack">${cases.map(function (c) {
                    return '<article class="edit-card">' +
                        '<div class="edit-head">' +
                        '<label class="switch"><input type="checkbox" data-c-pub="' + esc(c.id) + '"' + (c.published !== false ? ' checked' : '') + '><span>上架</span></label>' +
                        '<label class="ord"><span>顺序</span><input type="number" data-c-ord="' + esc(c.id) + '" value="' + esc(c.order) + '"></label>' +
                        '</div>' +
                        '<label class="field"><span>标题</span><textarea class="title-box" rows="2" data-c-title="' + esc(c.id) + '">' + esc(c.title) + '</textarea></label>' +
                        '<label class="field"><span>场景摘要</span><textarea class="sit-box" rows="5" data-c-sit="' + esc(c.id) + '">' + esc(c.situation || c.subtitle || '') + '</textarea></label>' +
                        '</article>';
                }).join('')}</div>
            </div>
            <div class="page-bar">
                <button type="button" class="btn" id="save-home-2">保存上架</button>
            </div>`;
        $('save-home').onclick = saveShelf;
        $('save-home-2').onclick = saveShelf;
        bindExcel('exp-home', exportShelfExcel, 'imp-home', importShelfExcel);
    }

    function exportShelfExcel() {
        const Ex = YouweiExcel;
        const inds = YouweiOps.getIndustries({ includeHidden: true });
        const cases = YouweiOps.getCases({ includeHidden: true });
        Ex.download('youwei-shelf.xlsx', [
            {
                name: '行业',
                cols: [16, 16, 8, 8],
                rows: [['id', '名称', '上架', '顺序']].concat(inds.map(function (ind) {
                    return [ind.id, ind.name, Ex.yesNo(ind.published !== false), ind.order];
                }))
            },
            {
                name: '案例',
                cols: [14, 8, 8, 40, 72],
                rows: [['id', '上架', '顺序', '标题', '场景摘要']].concat(cases.map(function (c) {
                    return [c.id, Ex.yesNo(c.published !== false), c.order, c.title || '', c.situation || c.subtitle || ''];
                }))
            }
        ]);
    }

    function importShelfExcel(wb) {
        const Ex = YouweiExcel;
        const knownInd = {};
        YouweiOps.getIndustries({ includeHidden: true }).forEach(function (ind) { knownInd[ind.id] = true; });
        const knownCase = {};
        YouweiOps.getCases({ includeHidden: true }).forEach(function (c) { knownCase[c.id] = true; });
        const industries = {};
        Ex.rowsOf(wb, '行业', ['名称', 'id']).forEach(function (r) {
            const id = Ex.pick(r, ['id', '编号', '行业编号']);
            if (!id || !knownInd[id]) return;
            industries[id] = {
                published: Ex.isYes(Ex.pick(r, ['上架'])),
                order: Number(Ex.pick(r, ['顺序']) || 0)
            };
        });
        const cases = {};
        Ex.rowsOf(wb, '案例', ['标题', '场景摘要']).forEach(function (r) {
            const id = Ex.pick(r, ['id', '编号', '案例编号']);
            if (!id || !knownCase[id]) return;
            cases[id] = {
                published: Ex.isYes(Ex.pick(r, ['上架'])),
                order: Number(Ex.pick(r, ['顺序']) || 0),
                title: Ex.pick(r, ['标题']),
                situation: Ex.pick(r, ['场景摘要', '摘要'])
            };
        });
        if (!Object.keys(industries).length && !Object.keys(cases).length) {
            throw new Error('没有识别到可导入的行业或案例，请勿改编号列');
        }
        YouweiOps.patch({ industries: industries, cases: cases });
        toast('已导入场景上架');
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
                <div class="page-bar">
                    <a class="btn" href="workshop.html?mode=pro">打开工作台同步</a>
                    ${excelBtns('exp-tpl', 'imp-tpl')}
                </div>
                <div class="card">
                    <p class="hint">还没有同步到内置价值流模板。请用同一浏览器先打开一次工作台，或导入已填好的 Excel。</p>
                </div>`;
            bindExcel('exp-tpl', exportTplExcel, 'imp-tpl', importTplExcel);
            return;
        }
        const first = keys[0];
        $('admin-body').innerHTML = `
            <div class="page-bar">
                ${excelBtns('exp-tpl', 'imp-tpl')}
            </div>
            <div class="card">
                <h2>价值流模板</h2>
                <p class="hint">${cat.at ? '已于 ' + cat.at.replace('T', ' ').slice(0, 16) + ' 从工作台同步。' : '正在使用已保存的运营覆盖。'}</p>
                <label class="field"><span>编辑哪一套</span>
                    <select id="tpl-key">${keys.map(function (k) {
                        return '<option value="' + esc(k) + '">' + esc((tpls[k] && tpls[k].name) || k) + ' · ' + esc(k) + '</option>';
                    }).join('')}</select>
                </label>
                <div id="tpl-editor"></div>
                <div class="row2" style="margin-top:20px">
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
                <div class="stack" style="margin-top:14px">${stages.map(function (s, i) {
                    return '<article class="edit-card">' +
                        '<div class="row2">' +
                        '<label class="field"><span>阶段</span><input data-st="' + i + '" data-sk="name" value="' + esc(s.name) + '"></label>' +
                        '<label class="field"><span>类型</span><select data-st="' + i + '" data-sk="type"><option value="process"' + (s.type !== 'wait' ? ' selected' : '') + '>过程</option><option value="wait"' + (s.type === 'wait' ? ' selected' : '') + '>关口</option></select></label>' +
                        '</div>' +
                        '<div class="row2">' +
                        '<label class="field"><span>时长</span><input data-st="' + i + '" data-sk="defaultTime" type="number" value="' + esc(s.defaultTime != null ? s.defaultTime : s.actualTime || '') + '"></label>' +
                        '<label class="field"><span>场景</span><textarea rows="2" data-st="' + i + '" data-sk="scenarios">' + esc(s.scenarios || '') + '</textarea></label>' +
                        '</div>' +
                        '<label class="field"><span>组件</span><textarea rows="2" data-st="' + i + '" data-sk="components">' + esc(s.components || '') + '</textarea></label>' +
                        '</article>';
                }).join('')}</div>`;
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
        bindExcel('exp-tpl', exportTplExcel, 'imp-tpl', importTplExcel);
    }

    function stageTypeLabel(t) {
        return t === 'wait' ? '关口' : '过程';
    }

    function stageTypeValue(v) {
        const s = String(v || '').trim();
        return /关口|wait/i.test(s) ? 'wait' : 'process';
    }

    function exportTplExcel() {
        const tpls = YouweiOps.getTemplates() || {};
        const ops = YouweiOps.load();
        const defMap = (ops.models && ops.models.defaultByIndustry) || {};
        const keys = Object.keys(tpls);
        const meta = [['key', '名称', '适用行业']].concat(keys.map(function (k) {
            const t = tpls[k] || {};
            return [k, t.name || '', (t.industries || []).join('，')];
        }));
        const stages = [['模板key', '序号', '阶段', '类型', '时长', '场景', '组件']];
        keys.forEach(function (k) {
            (tpls[k].stages || []).forEach(function (s, i) {
                stages.push([
                    k,
                    i + 1,
                    s.name || '',
                    stageTypeLabel(s.type),
                    s.defaultTime != null ? s.defaultTime : (s.actualTime || ''),
                    s.scenarios || '',
                    s.components || ''
                ]);
            });
        });
        const defs = [['行业', '模板key']].concat(['3C', '汽车', '家电'].map(function (ind) {
            return [ind, defMap[ind] || (ind === '家电' ? (defMap['3C'] || '') : '')];
        }));
        YouweiExcel.download('youwei-templates.xlsx', [
            { name: '模板', rows: meta, cols: [18, 22, 24] },
            { name: '阶段', rows: stages, cols: [16, 8, 16, 8, 8, 36, 36] },
            { name: '默认', rows: defs, cols: [12, 18] }
        ]);
    }

    function importTplExcel(wb) {
        const Ex = YouweiExcel;
        const tpls = YouweiOps.getTemplates() || {};
        Ex.rowsOf(wb, '模板', ['key', '名称']).forEach(function (r) {
            const key = Ex.pick(r, ['key', '模板key', '编号']);
            if (!key) return;
            if (!tpls[key]) tpls[key] = { name: '', industries: [], stages: [] };
            const name = Ex.pick(r, ['名称']);
            const inds = Ex.pick(r, ['适用行业', '行业']);
            if (name) tpls[key].name = name;
            if (inds) tpls[key].industries = inds.split(/[,，、]/).map(function (s) { return s.trim(); }).filter(Boolean);
        });
        const byKey = {};
        Ex.rowsOf(wb, '阶段', ['阶段', '模板key']).forEach(function (r) {
            const key = Ex.pick(r, ['模板key', 'key']);
            if (!key) return;
            if (!byKey[key]) byKey[key] = [];
            const i = Math.max(0, Number(Ex.pick(r, ['序号']) || byKey[key].length + 1) - 1);
            const prev = (tpls[key] && tpls[key].stages && tpls[key].stages[i]) || { id: i + 1 };
            byKey[key][i] = Object.assign({}, prev, {
                name: Ex.pick(r, ['阶段', '名称']) || prev.name,
                type: stageTypeValue(Ex.pick(r, ['类型'])),
                defaultTime: Number(Ex.pick(r, ['时长']) || prev.defaultTime || 0),
                scenarios: Ex.pick(r, ['场景']) || prev.scenarios || '',
                components: Ex.pick(r, ['组件']) || prev.components || ''
            });
        });
        Object.keys(byKey).forEach(function (key) {
            if (!tpls[key]) tpls[key] = { name: key, industries: [], stages: [] };
            tpls[key].stages = byKey[key].filter(Boolean);
        });
        if (!Object.keys(tpls).length) throw new Error('表格里没有可导入的模板');
        const models = YouweiOps.load().models || {};
        models.templates = tpls;
        const defMap = Object.assign({}, models.defaultByIndustry || {});
        Ex.rowsOf(wb, '默认', ['行业']).forEach(function (r) {
            const ind = Ex.pick(r, ['行业']);
            const key = Ex.pick(r, ['模板key', 'key']);
            if (ind && key) defMap[ind] = key;
        });
        models.defaultByIndustry = defMap;
        YouweiOps.patch({ models: models });
        toast('已导入价值模板');
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
            <div class="page-bar">
                <button type="button" class="btn ghost" id="exp-hist">导出底稿</button>
                <label class="btn ghost xfer-file">导入底稿<input id="imp-hist" type="file" accept="application/json"></label>
            </div>
            <div class="card">
                <h2>保存规则</h2>
                <div class="row2">
                    <label class="field"><span>最多保留份数</span><input id="a-max" type="number" min="4" max="200" value="${esc(a.historyMax)}"></label>
                    <label class="field"><span>标题格式</span><input id="a-pat" type="text" value="${esc(a.titlePattern)}"></label>
                </div>
                <label class="switch" style="margin:12px 0 0"><input id="a-del" type="checkbox"${a.allowClientDelete !== false ? ' checked' : ''}><span>允许评估用户在资产库删除自己的底稿</span></label>
                <div class="actions"><button type="button" class="btn" id="save-assets">保存资产策略</button></div>
            </div>
            <div class="card">
                <h2>本机已存</h2>
                <p class="hint">${list.length} 份。只存在这台电脑。带走请先导出。</p>
                <div class="stack">${list.map(function (r) {
                    return '<div class="list-row"><div><b>' + esc(r.title || r.name || ('#' + r.id)) + '</b></div>' +
                        '<span class="meta">' + esc((r.savedAt || r.at || '').toString().slice(0, 19)) + '</span>' +
                        '<button type="button" class="btn danger" data-del-hist="' + esc(r.id) + '">删除</button></div>';
                }).join('') || '<p class="empty">还没有保存的评估底稿。</p>'}</div>
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
        document.querySelectorAll('[data-del-hist]').forEach(function (btn) {
            btn.onclick = function () {
                const id = Number(btn.getAttribute('data-del-hist'));
                const next = loadHistory().filter(function (r) { return Number(r.id) !== id; });
                localStorage.setItem(HISTORY_LS, JSON.stringify(next));
                toast('已删除该底稿');
                render();
            };
        });
    }

    function ruleCard(r, i) {
        return '<article class="edit-card" data-rule-card="' + i + '">' +
            '<div class="row2">' +
            '<label class="field"><span>字段</span><input data-r="' + i + '" data-rk="field" value="' + esc(r.field || '') + '"></label>' +
            '<label class="field"><span>关键词</span><input data-r="' + i + '" data-rk="keyword" value="' + esc(r.keyword || '') + '"></label>' +
            '</div>' +
            '<div class="row2">' +
            '<label class="field"><span>联动字段</span><input data-r="' + i + '" data-rk="compareField" value="' + esc(r.compareField || 'none') + '"></label>' +
            '<label class="field"><span>联动词</span><input data-r="' + i + '" data-rk="compareKeyword" value="' + esc(r.compareKeyword || '') + '"></label>' +
            '</div>' +
            '<div class="row-score">' +
            '<label class="field"><span>扣分</span><input data-r="' + i + '" data-rk="score" type="number" value="' + esc(r.score || 0) + '"></label>' +
            '<label class="field"><span>提示</span><textarea rows="2" data-r="' + i + '" data-rk="message">' + esc(r.message || '') + '</textarea></label>' +
            '</div></article>';
    }

    function renderAssess() {
        const a = YouweiOps.getAssessment();
        const rules = YouweiOps.getDefaultRules() || [];
        const seed = rules.length ? rules : [{ field: 'costStructure', keyword: '', compareField: 'none', compareKeyword: '', score: 10, message: '' }];
        $('admin-body').innerHTML = `
            <div class="page-bar">
                ${excelBtns('exp-assess', 'imp-assess')}
            </div>
            <div class="card">
                <h2>热力与路标</h2>
                <div class="row2">
                    <label class="field field-num"><span>优先短板最多几项</span><input id="as-heat" type="number" min="1" max="12" value="${esc(a.heatTopN)}"></label>
                    <label class="field field-num"><span>近半年 P0 上限</span><input id="as-p0" type="number" min="1" max="8" value="${esc(a.p0Cap)}"></label>
                </div>
            </div>
            <div class="card">
                <h2>画布诊断</h2>
                <p class="hint">空着则沿用工作台内置三条。保存后新开的评估会话会带上这套规则。</p>
                <div class="stack" id="rule-body">${seed.map(ruleCard).join('')}</div>
                <div class="actions">
                    <button type="button" class="btn ghost" id="add-rule">加一条</button>
                    <button type="button" class="btn" id="save-assess">保存评估配置</button>
                </div>
            </div>`;
        $('add-rule').onclick = function () {
            const host = $('rule-body');
            const i = host.querySelectorAll('[data-rule-card]').length;
            host.insertAdjacentHTML('beforeend', ruleCard({ field: '', keyword: '', compareField: 'none', compareKeyword: '', score: 10, message: '' }, i));
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
        bindExcel('exp-assess', exportAssessExcel, 'imp-assess', importAssessExcel);
    }

    function exportAssessExcel() {
        const a = YouweiOps.getAssessment();
        const rules = YouweiOps.getDefaultRules() || [];
        const seed = rules.length ? rules : [{ field: 'costStructure', keyword: '', compareField: 'none', compareKeyword: '', score: 10, message: '' }];
        YouweiExcel.download('youwei-rules.xlsx', [
            {
                name: '参数',
                cols: [22, 10],
                rows: [['项', '值'], ['优先短板最多几项', a.heatTopN], ['近半年P0上限', a.p0Cap]]
            },
            {
                name: '规则',
                cols: [18, 16, 16, 16, 8, 40],
                rows: [['字段', '关键词', '联动字段', '联动词', '扣分', '提示']].concat(seed.map(function (r) {
                    return [r.field || '', r.keyword || '', r.compareField || 'none', r.compareKeyword || '', r.score || 0, r.message || ''];
                }))
            }
        ]);
    }

    function importAssessExcel(wb) {
        const Ex = YouweiExcel;
        let heatTopN = Number(val('as-heat') || 5);
        let p0Cap = Number(val('as-p0') || 3);
        Ex.rowsOf(wb, '参数', ['项', '值']).forEach(function (r) {
            const name = Ex.pick(r, ['项', '名称']);
            const num = Number(Ex.pick(r, ['值']) || 0);
            if (/短板/.test(name) && num) heatTopN = num;
            if (/P0|p0/.test(name) && num) p0Cap = num;
        });
        const rules = Ex.rowsOf(wb, '规则', ['字段', '关键词', '提示']).map(function (r, i) {
            return {
                id: Date.now() + i,
                field: Ex.pick(r, ['字段']),
                keyword: Ex.pick(r, ['关键词']),
                compareField: Ex.pick(r, ['联动字段']) || 'none',
                compareKeyword: Ex.pick(r, ['联动词']),
                score: Number(Ex.pick(r, ['扣分']) || 0),
                message: Ex.pick(r, ['提示'])
            };
        }).filter(function (r) { return r.keyword || r.message; });
        if (!rules.length && !Ex.rowsOf(wb, '参数', ['项']).length) {
            throw new Error('表格里没有可导入的规则或参数');
        }
        YouweiOps.patch({
            assessment: {
                heatTopN: Math.max(1, heatTopN),
                p0Cap: Math.max(1, p0Cap),
                rules: rules.length ? rules : YouweiOps.getDefaultRules()
            }
        });
        toast('已导入规则配置');
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
                <h2>通道</h2>
                <p class="hint">先点开 Key 的平台，再粘贴 Key。官方 DeepSeek 请在本机用 npm run dev 启动后再试。</p>
                <div class="ai-provider-row">${chips}</div>
                <label class="field"><span>API Key</span><input id="ai-key" type="password" autocomplete="off" value="" placeholder="${cfg.apiKey ? '已在本会话保存，改写则覆盖' : '不要带引号或 Bearer'}"></label>
                <label class="field"><span>接口根地址</span><input id="ai-ep" type="url" value="${esc(cfg.endpoint)}" placeholder="点平台会自动填"></label>
                <label class="field"><span>模型</span><input id="ai-md" type="text" value="${esc(cfg.model)}" placeholder="点平台会自动填"></label>
                <p class="status${cfg.needsProvider ? ' bad' : ''}" id="ai-status">${cfg.needsProvider ? '旧配置把 Key 误送到了 DeepSeek。请改选平台后保存并试连。' : '正在检测通道…'}</p>
                <div class="actions">
                    <button type="button" class="btn" id="save-ai">保存并试连</button>
                    <button type="button" class="btn ghost" id="clear-ai-key">清除 Key</button>
                </div>
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
    }

    function render() {
        const meta = allTabs().find(function (t) { return t.id === tab; }) || allTabs()[0];
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
