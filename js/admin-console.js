(function () {
    const NAV = [
        {
            group: '公开站点',
            items: [
                { id: 'home', title: '场景上架', lead: '行业与案例写入本机后台库 data/content.json，首页直接读取，不进浏览器缓存。编号列请勿改。' }
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
                { id: 'assets', title: '评估底稿', lead: '本机已保存的评估。也可导出运营包和操作日志。换电脑请先导出。' }
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
        if (window.YouweiStore && YouweiStore.loadLeads) return YouweiStore.loadLeads();
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

    function audit(action, detail) {
        if (window.YouweiAudit) YouweiAudit.add(action, detail || '');
    }

    function bindExcel(expId, exporter, impId, importer) {
        const exp = $(expId);
        if (exp) exp.onclick = function () {
            try {
                exporter();
                audit('export_excel', expId);
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
                audit('import_excel', impId);
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
                <p class="hint">${list.length} 条。按当前登录账号存在这台电脑；桌面版还会写入 data/leads.json。换电脑请先导出。</p>
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
            if (window.YouweiStore && YouweiStore.saveLeads) YouweiStore.saveLeads([]);
            else localStorage.removeItem(LEADS_LS);
            audit('clear_leads', '');
            toast('已清空');
            render();
        };
    }

    function factsText(arr) {
        return (arr || []).join('\n');
    }

    function parseLines(s, max) {
        return String(s || '').split(/\n/).map(function (x) { return x.trim(); }).filter(Boolean).slice(0, max || 8);
    }

    function refsText(arr) {
        return (arr || []).map(function (r) {
            return String((r && r.label) || '') + ' | ' + String((r && r.url) || '');
        }).join('\n');
    }

    function parseRefs(s) {
        return parseLines(s, 8).map(function (line) {
            const parts = line.split('|');
            const url = (parts.length > 1 ? parts.slice(1).join('|') : parts[0]).trim();
            const label = (parts.length > 1 ? parts[0] : url).trim();
            return url ? { label: label || url, url: url } : null;
        }).filter(Boolean);
    }

    function backendHint() {
        if (YouweiOps.backendOk && YouweiOps.backendOk()) {
            return '当前读后台库 data/content.json。保存后刷新首页即可看到。';
        }
        return '本机后台未启动，页面只显示内置种子，保存会失败。请用 npm run dev 或桌面版打开。';
    }

    function renderHome() {
        const inds = YouweiOps.getIndustries({ includeHidden: true });
        const cases = YouweiOps.getCases({ includeHidden: true });
        $('admin-body').innerHTML = `
            <div class="page-bar">
                <button type="button" class="btn" id="save-home">写入后台库</button>
                ${excelBtns('exp-home', 'imp-home')}
            </div>
            <p class="hint">${esc(backendHint())}</p>
            <div class="card">
                <h2>行业</h2>
                <p class="hint">上架后出现在首页行业栏。顺序数字越小越靠前。名称会显示在前台。</p>
                <div class="stack">${inds.map(function (ind) {
                    return '<article class="edit-card">' +
                        '<div class="edit-head">' +
                        '<label class="switch"><input type="checkbox" data-ind-pub="' + esc(ind.id) + '"' + (ind.published !== false ? ' checked' : '') + '><span>上架</span></label>' +
                        '<span class="who">' + esc(ind.id) + '</span>' +
                        '<label class="ord"><span>顺序</span><input type="number" data-ind-ord="' + esc(ind.id) + '" value="' + esc(ind.order) + '"></label>' +
                        '</div>' +
                        '<div class="row2">' +
                        '<label class="field"><span>名称</span><input type="text" data-ind-name="' + esc(ind.id) + '" value="' + esc(ind.name || '') + '"></label>' +
                        '<label class="field"><span>短标</span><input type="text" data-ind-kicker="' + esc(ind.id) + '" value="' + esc(ind.kicker || '') + '"></label>' +
                        '</div>' +
                        '<label class="field"><span>行业说明</span><textarea rows="2" data-ind-blurb="' + esc(ind.id) + '">' + esc(ind.blurb || '') + '</textarea></label>' +
                        '<label class="field"><span>课题导语</span><textarea rows="2" data-ind-lead="' + esc(ind.id) + '">' + esc(ind.casesLead || '') + '</textarea></label>' +
                        '</article>';
                }).join('')}</div>
            </div>
            <div class="card">
                <h2>案例</h2>
                <p class="hint">标题、摘要、配图进入首页轮播；对照事实与出处进入案例页和工作台选题备忘。信源刷新只起草，须点「采纳」再保存。</p>
                <div class="stack">${cases.map(function (c) {
                    const refs = c.references || [];
                    const urls = (c.sourceUrls && c.sourceUrls.length)
                        ? c.sourceUrls.join('\n')
                        : refs.map(function (r) { return r.url; }).filter(Boolean).join('\n');
                    return '<article class="edit-card" id="case-card-' + esc(c.id) + '">' +
                        '<div class="edit-head">' +
                        '<label class="switch"><input type="checkbox" data-c-pub="' + esc(c.id) + '"' + (c.published !== false ? ' checked' : '') + '><span>上架</span></label>' +
                        '<span class="who">' + esc(c.id) + ' · ' + esc(c.industry || '') + '</span>' +
                        '<label class="ord"><span>顺序</span><input type="number" data-c-ord="' + esc(c.id) + '" value="' + esc(c.order) + '"></label>' +
                        '</div>' +
                        '<label class="field"><span>标题</span><textarea class="title-box" rows="2" data-c-title="' + esc(c.id) + '">' + esc(c.title || '') + '</textarea></label>' +
                        '<div class="row2">' +
                        '<label class="field"><span>首页标签</span><input type="text" data-c-kicker="' + esc(c.id) + '" value="' + esc(c.kicker || '') + '"></label>' +
                        '<label class="field"><span>配图路径</span><input type="text" data-c-image="' + esc(c.id) + '" value="' + esc(c.image || '') + '"></label>' +
                        '</div>' +
                        '<label class="field"><span>副题</span><textarea rows="2" data-c-sub="' + esc(c.id) + '">' + esc(c.subtitle || c.tagline || '') + '</textarea></label>' +
                        '<label class="field"><span>场景摘要</span><textarea class="sit-box" rows="4" data-c-sit="' + esc(c.id) + '">' + esc(c.situation || '') + '</textarea></label>' +
                        '<label class="field"><span>对照事实（一行一条，最多 3～8 条）</span><textarea rows="4" data-c-facts="' + esc(c.id) + '">' + esc(factsText(c.publicFacts)) + '</textarea></label>' +
                        '<label class="field"><span>出处说明</span><textarea rows="2" data-c-srcnote="' + esc(c.id) + '">' + esc(c.sourceNote || '') + '</textarea></label>' +
                        '<label class="field"><span>出处（名称 | 网址，一行一条）</span><textarea rows="3" data-c-refs="' + esc(c.id) + '">' + esc(refsText(refs)) + '</textarea></label>' +
                        '<label class="field"><span>刷新用信源网址（一行一条，可与出处相同）</span><textarea rows="3" data-c-urls="' + esc(c.id) + '">' + esc(urls) + '</textarea></label>' +
                        '<div class="actions">' +
                        '<button type="button" class="btn ghost" data-refresh="' + esc(c.id) + '">从信源起草对照</button>' +
                        '</div>' +
                        '<div class="fact-draft hidden" id="draft-' + esc(c.id) + '"></div>' +
                        '</article>';
                }).join('')}</div>
            </div>
            <div class="page-bar">
                <button type="button" class="btn" id="save-home-2">写入后台库</button>
            </div>`;
        $('save-home').onclick = saveShelf;
        $('save-home-2').onclick = saveShelf;
        document.querySelectorAll('[data-refresh]').forEach(function (btn) {
            btn.onclick = function () { refreshCaseFacts(btn.getAttribute('data-refresh')); };
        });
        bindExcel('exp-home', exportShelfExcel, 'imp-home', importShelfExcel);
    }

    function exportShelfExcel() {
        const Ex = YouweiExcel;
        const inds = YouweiOps.getIndustries({ includeHidden: true });
        const cases = YouweiOps.getCases({ includeHidden: true });
        Ex.download('youwei-shelf.xlsx', [
            {
                name: '行业',
                cols: [12, 14, 8, 8, 16, 40, 36],
                rows: [['id', '名称', '上架', '顺序', '短标', '行业说明', '课题导语']].concat(inds.map(function (ind) {
                    return [ind.id, ind.name, Ex.yesNo(ind.published !== false), ind.order, ind.kicker || '', ind.blurb || '', ind.casesLead || ''];
                }))
            },
            {
                name: '案例',
                cols: [14, 8, 8, 36, 14, 28, 40, 28, 48, 36, 40],
                rows: [['id', '上架', '顺序', '标题', '首页标签', '副题', '场景摘要', '配图', '对照事实', '出处说明', '出处']].concat(cases.map(function (c) {
                    return [
                        c.id,
                        Ex.yesNo(c.published !== false),
                        c.order,
                        c.title || '',
                        c.kicker || '',
                        c.subtitle || '',
                        c.situation || '',
                        c.image || '',
                        factsText(c.publicFacts),
                        c.sourceNote || '',
                        refsText(c.references)
                    ];
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
                order: Number(Ex.pick(r, ['顺序']) || 0),
                name: Ex.pick(r, ['名称']),
                kicker: Ex.pick(r, ['短标']),
                blurb: Ex.pick(r, ['行业说明']),
                casesLead: Ex.pick(r, ['课题导语'])
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
                kicker: Ex.pick(r, ['首页标签', '标签']),
                subtitle: Ex.pick(r, ['副题']),
                situation: Ex.pick(r, ['场景摘要', '摘要']),
                image: Ex.pick(r, ['配图']),
                publicFacts: parseLines(Ex.pick(r, ['对照事实']), 8),
                sourceNote: Ex.pick(r, ['出处说明']),
                references: parseRefs(Ex.pick(r, ['出处']))
            };
        });
        if (!Object.keys(industries).length && !Object.keys(cases).length) {
            throw new Error('没有识别到可导入的行业或案例，请勿改编号列');
        }
        YouweiOps.patch({ industries: industries, cases: cases }).then(function () {
            toast('已导入并写入后台库');
        }).catch(function (e) {
            toast(e.message || '导入失败');
        });
    }

    function collectShelf() {
        const industries = {};
        document.querySelectorAll('[data-ind-pub]').forEach(function (el) {
            const id = el.getAttribute('data-ind-pub');
            industries[id] = {
                published: el.checked,
                order: Number((document.querySelector('[data-ind-ord="' + id + '"]') || {}).value || 0),
                name: (document.querySelector('[data-ind-name="' + id + '"]') || {}).value,
                kicker: (document.querySelector('[data-ind-kicker="' + id + '"]') || {}).value,
                blurb: (document.querySelector('[data-ind-blurb="' + id + '"]') || {}).value,
                casesLead: (document.querySelector('[data-ind-lead="' + id + '"]') || {}).value
            };
        });
        const cases = {};
        document.querySelectorAll('[data-c-pub]').forEach(function (el) {
            const id = el.getAttribute('data-c-pub');
            cases[id] = {
                published: el.checked,
                order: Number((document.querySelector('[data-c-ord="' + id + '"]') || {}).value || 0),
                title: (document.querySelector('[data-c-title="' + id + '"]') || {}).value,
                kicker: (document.querySelector('[data-c-kicker="' + id + '"]') || {}).value,
                subtitle: (document.querySelector('[data-c-sub="' + id + '"]') || {}).value,
                situation: (document.querySelector('[data-c-sit="' + id + '"]') || {}).value,
                image: (document.querySelector('[data-c-image="' + id + '"]') || {}).value,
                publicFacts: parseLines((document.querySelector('[data-c-facts="' + id + '"]') || {}).value, 8),
                sourceNote: (document.querySelector('[data-c-srcnote="' + id + '"]') || {}).value,
                references: parseRefs((document.querySelector('[data-c-refs="' + id + '"]') || {}).value),
                sourceUrls: parseLines((document.querySelector('[data-c-urls="' + id + '"]') || {}).value, 8)
            };
        });
        return { industries: industries, cases: cases };
    }

    function saveShelf() {
        const shelf = collectShelf();
        YouweiOps.patch(shelf).then(function () {
            audit('admin_save', 'shelf');
            toast('已写入后台库，刷新首页即可');
        }).catch(function (e) {
            toast(e.message || '写入失败');
        });
    }

    function parseDraftJson(raw) {
        const text = String(raw || '');
        const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
        const blob = fence ? fence[1] : text;
        const start = blob.indexOf('{');
        const end = blob.lastIndexOf('}');
        if (start < 0 || end <= start) return null;
        try {
            return JSON.parse(blob.slice(start, end + 1));
        } catch (e) {
            return null;
        }
    }

    function showDraft(id, draft) {
        const box = document.getElementById('draft-' + id);
        if (!box) return;
        const facts = (draft.facts || []).map(function (x) { return String(x || '').trim(); }).filter(Boolean);
        const note = String(draft.sourceNote || '').trim();
        const excerpts = draft.excerpts || [];
        box.classList.remove('hidden');
        box.innerHTML =
            '<p class="hint">' + esc(draft.hint || '以下为起草稿，不会自动上首页。点采纳后写入表单，再点「写入后台库」。') + '</p>' +
            (facts.length ? '<p><b>拟写对照</b></p><ul>' + facts.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '') +
            (note ? '<p>' + esc(note) + '</p>' : '') +
            (excerpts.length ? '<p class="hint">已抓到 ' + excerpts.length + ' 个页面，可对照改写。</p>' : '') +
            '<div class="actions">' +
            '<button type="button" class="btn" data-accept="' + esc(id) + '">采纳到表单</button>' +
            '<button type="button" class="btn ghost" data-dismiss="' + esc(id) + '">弃掉</button>' +
            '</div>';
        box._draft = { facts: facts, sourceNote: note };
        const acc = box.querySelector('[data-accept]');
        const dis = box.querySelector('[data-dismiss]');
        if (acc) acc.onclick = function () {
            const factsEl = document.querySelector('[data-c-facts="' + id + '"]');
            const noteEl = document.querySelector('[data-c-srcnote="' + id + '"]');
            if (factsEl && facts.length) factsEl.value = facts.join('\n');
            if (noteEl && note) noteEl.value = note;
            toast('已采纳到表单，请再点「写入后台库」');
            box.classList.add('hidden');
        };
        if (dis) dis.onclick = function () { box.classList.add('hidden'); box.innerHTML = ''; };
    }

    async function refreshCaseFacts(id) {
        const urls = parseLines((document.querySelector('[data-c-urls="' + id + '"]') || {}).value, 4);
        const refs = parseRefs((document.querySelector('[data-c-refs="' + id + '"]') || {}).value);
        refs.forEach(function (r) {
            if (r.url && urls.indexOf(r.url) === -1 && urls.length < 4) urls.push(r.url);
        });
        if (!urls.length) {
            toast('请先填写信源网址');
            return;
        }
        if (!YouweiOps.backendOk || !YouweiOps.backendOk()) {
            toast('本机后台未启动，无法抓取信源');
            return;
        }
        toast('正在抓取信源…');
        const pages = [];
        for (let i = 0; i < urls.length; i += 1) {
            try {
                pages.push(await YouweiOps.fetchSource(urls[i]));
            } catch (e) {
                pages.push({ ok: false, url: urls[i], message: e.message || '失败' });
            }
        }
        const okPages = pages.filter(function (p) { return p.ok && p.text; });
        if (!okPages.length) {
            toast((pages[0] && pages[0].message) || '信源抓不到');
            return;
        }
        const title = (document.querySelector('[data-c-title="' + id + '"]') || {}).value || id;
        const oldFacts = (document.querySelector('[data-c-facts="' + id + '"]') || {}).value || '';
        const pack = okPages.map(function (p, i) {
            return (i + 1) + '. ' + (p.title || p.url) + '\n' + p.url + '\n' + String(p.text || '').slice(0, 2800);
        }).join('\n\n');
        if (!window.YouweiAi || !YouweiAi.chat) {
            showDraft(id, { facts: [], sourceNote: '', excerpts: okPages, hint: '未加载模型连接。下面是抓到的正文，请手工改对照。' });
            return;
        }
        try {
            const reply = await YouweiAi.chat({
                stream: false,
                temperature: 0.2,
                system: '你是行业对照编辑。只根据给定公开网页写对照事实，不是友为客户案例，不是品牌授权。禁止编造经营数字、占比、人数、金额。每条事实必须能追溯到给定网址。简体中文。只输出 JSON：{"facts":["...","...","..."],"sourceNote":"..."}。facts 2到3条，每条不超过80字。sourceNote 须点明对照品牌与「不是授权、请用贵司数据确认」。',
                user: '课题：' + title + '\n现有对照（可作语气参考，勿照抄过期句）：\n' + oldFacts + '\n\n信源摘录：\n' + pack
            });
            const parsed = parseDraftJson(reply);
            if (!parsed || !Array.isArray(parsed.facts) || !parsed.facts.length) {
                showDraft(id, { facts: [], sourceNote: '', excerpts: okPages, hint: '模型未给出可用 JSON。已抓到信源，请手工改对照。' });
                return;
            }
            showDraft(id, {
                facts: parsed.facts.slice(0, 3),
                sourceNote: parsed.sourceNote || '',
                excerpts: okPages
            });
            toast('起草完成，请审阅后采纳');
        } catch (e) {
            showDraft(id, {
                facts: [],
                sourceNote: '',
                excerpts: okPages,
                hint: (e && e.friendly) || e.message || '模型未通。已抓到信源，请手工改对照。'
            });
        }
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
            if (YouweiOps.saveCatalog) YouweiOps.saveCatalog({ templates: null, rules: null, at: '' });
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
        if (window.YouweiStore && YouweiStore.loadHistory) return YouweiStore.loadHistory();
        try {
            const raw = localStorage.getItem(HISTORY_LS);
            const arr = raw ? JSON.parse(raw) : [];
            return Array.isArray(arr) ? arr : [];
        } catch (e) { return []; }
    }

    function writeHistory(list) {
        if (window.YouweiStore && YouweiStore.saveHistory) YouweiStore.saveHistory(list);
        else localStorage.setItem(HISTORY_LS, JSON.stringify(list));
    }

    function renderAssets() {
        const a = YouweiOps.getAssets();
        const list = loadHistory();
        const logs = (window.YouweiAudit && YouweiAudit.load) ? YouweiAudit.load().slice(-8).reverse() : [];
        $('admin-body').innerHTML = `
            <div class="page-bar">
                <button type="button" class="btn ghost" id="exp-hist">导出底稿</button>
                <label class="btn ghost xfer-file">导入底稿<input id="imp-hist" type="file" accept="application/json"></label>
                <button type="button" class="btn ghost" id="exp-pack">导出运营包</button>
                <label class="btn ghost xfer-file">导入运营包<input id="imp-pack" type="file" accept="application/json"></label>
                <button type="button" class="btn ghost" id="exp-audit">导出操作日志</button>
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
            </div>
            <div class="card">
                <h2>操作留痕</h2>
                <p class="hint">登录、保存、导出记在这台电脑，按账号分开。带走点上面的「导出操作日志」。</p>
                <div class="stack">${logs.map(function (r) {
                    return '<div class="list-row"><div><b>' + esc((YouweiAudit.labelOf && YouweiAudit.labelOf(r.action)) || r.action || '') + '</b>' +
                        (r.detail ? '<p>' + esc(r.detail) + '</p>' : '') + '</div>' +
                        '<span class="meta">' + esc(String(r.at || '').replace('T', ' ').slice(0, 16)) + '</span></div>';
                }).join('') || '<p class="empty">还没有操作记录。</p>'}</div>
            </div>`;
        $('save-assets').onclick = function () {
            YouweiOps.patch({
                assets: {
                    historyMax: Math.max(4, Number(val('a-max') || 40)),
                    titlePattern: val('a-pat') || '{org} · {project} · {date}',
                    allowClientDelete: checked('a-del')
                }
            });
            audit('admin_save', 'assets');
            toast('资产策略已保存');
        };
        $('exp-hist').onclick = function () {
            downloadText('youwei-assessments.json', JSON.stringify(loadHistory(), null, 2));
            audit('export_history', String(list.length));
            toast('已下载本机底稿');
        };
        $('exp-pack').onclick = function () {
            try {
                downloadText('youwei-ops-pack.json', YouweiOps.exportPack());
                audit('export_pack', '');
                toast('已下载运营包');
            } catch (e) {
                toast(e.message || '导出失败');
            }
        };
        $('imp-pack').onchange = function () {
            const file = this.files && this.files[0];
            this.value = '';
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function () {
                try {
                    YouweiOps.importPack(String(reader.result || ''));
                    audit('import_pack', file.name);
                    toast('已导入运营包');
                    render();
                } catch (e) {
                    toast(e.message || '导入失败');
                }
            };
            reader.readAsText(file, 'utf-8');
        };
        $('exp-audit').onclick = function () {
            const rows = (window.YouweiAudit && YouweiAudit.load) ? YouweiAudit.load() : [];
            const sheet = [['时间', '账号', '动作', '说明']].concat(rows.map(function (r) {
                return [
                    String(r.at || '').replace('T', ' ').slice(0, 19),
                    r.user || '',
                    (YouweiAudit.labelOf && YouweiAudit.labelOf(r.action)) || r.action || '',
                    r.detail || ''
                ];
            }));
            YouweiExcel.download('youwei-audit.xlsx', [{ name: '操作日志', rows: sheet, cols: [20, 14, 16, 28] }]);
            audit('export_audit', String(rows.length));
            toast('已下载操作日志');
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
                    writeHistory(merged);
                    audit('import_history', String(arr.length));
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
                writeHistory(next);
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
            audit('admin_save', 'assess');
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
                <p class="hint">先点开 Key 的平台，再粘贴 Key。Key 只留在本会话，退出或闲置后清除。官方 DeepSeek 请在本机用 npm run dev 启动后再试。</p>
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
            audit('admin_save', 'ai');
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

    function paintLicense() {
        const host = document.getElementById('admin-license');
        const lic = window.YouweiLicense;
        if (!host || !lic || !lic.status) return;
        const st = lic.status();
        const extra = st.expired
            ? '授权已到期，不能再生成新过程册。'
            : (st.bound ? '过程册将带上客户名称。' : '未绑定授权，演示账号可用。正式交付请放 license.json 与本机账号表。');
        host.textContent = st.label + '　' + extra;
    }

    function boot() {
        const go = function () {
            if (YouweiAuth.mountAccountMenu) YouweiAuth.mountAccountMenu();
            render();
            paintLicense();
            if (window.YouweiLicense && YouweiLicense.ready) {
                YouweiLicense.ready.then(function () {
                    render();
                    paintLicense();
                });
            }
        };
        if (window.YouweiOps && YouweiOps.ready) YouweiOps.ready().then(go).catch(go);
        else go();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
})();
