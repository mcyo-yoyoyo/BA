/**
 * 七步评估稿：把步骤 1–7 收成一份 16:9 HTML，作为 PPT 汇报底稿。
 * 本机可翻页、下载独立 HTML、写入资产库后再打开。
 */
(function (global) {
    const BRIEF_LS = 'youwei_briefing_html_v1';
    const FIELD_MAP = {
        customerSegments: '客户细分',
        valuePropositions: '价值主张',
        channels: '渠道通路',
        customerRelationships: '客户关系',
        revenueStreams: '收入来源',
        keyResources: '核心资源',
        keyActivities: '关键业务',
        keyPartners: '重要伙伴',
        costStructure: '成本结构'
    };
    const FIELD_ORDER = Object.keys(FIELD_MAP);
    const GAP_LABELS = { gapOrg: '组织', gapProc: '流程', gapData: '数据', gapIt: '系统' };
    const VS_DIMS = [
        { k: 'dEff', l: '效率' },
        { k: 'dQual', l: '质量' },
        { k: 'dCost', l: '成本' },
        { k: 'dRisk', l: '风险' },
        { k: 'dCx', l: '体验' }
    ];

    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function clip(s, n) {
        const t = String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
        if (!t) return '';
        return t.length > n ? t.slice(0, n) + '…' : t;
    }

    function titlesOf(list) {
        return (Array.isArray(list) ? list : []).map(function (x) {
            if (!x) return '';
            if (typeof x === 'string') return x.trim();
            return String(x.title || x.name || x.l3 || '').trim();
        }).filter(Boolean);
    }

    function packLabel(pack) {
        if (pack === 'board') return '董事会包';
        if (pack === 'investment') return '投资案';
        return '评估稿';
    }

    function heatOf(state, cap) {
        const fw = (state && state.capabilityFramework) || [];
        const ids = global.getPriorityRedIdSet ? global.getPriorityRedIdSet(fw) : null;
        if (global.heatDisplayCategory) return global.heatDisplayCategory(cap, ids);
        return '';
    }

    function collectSnapshot(state, brief) {
        const st = state || {};
        const b = brief || {};
        const wm = st.workspaceMeta || {};
        const bmc = st.bmc || {};
        const stages = st.vsStages || [];
        const fw = st.capabilityFramework || [];
        const inis = (typeof global.sortInitiativesByPhase === 'function'
            ? global.sortInitiativesByPhase((st.initiatives || []).slice())
            : (st.initiatives || []).slice());
        const reds = fw.filter(function (c) { return heatOf(st, c) === 'red'; }).map(function (c) { return c.l3; }).filter(Boolean);
        const watches = fw.filter(function (c) { return heatOf(st, c) === 'watch'; }).map(function (c) { return c.l3; }).filter(Boolean);
        const yels = fw.filter(function (c) { return heatOf(st, c) === 'yellow'; }).map(function (c) { return c.l3; }).filter(Boolean);
        const greens = fw.filter(function (c) { return heatOf(st, c) === 'green'; }).map(function (c) { return c.l3; }).filter(Boolean);
        const weak = fw.map(function (c) {
            const bits = ['gapOrg', 'gapProc', 'gapData', 'gapIt'].map(function (k) {
                const n = Number(c[k]);
                return isNaN(n) ? null : { k: k, n: n };
            }).filter(Boolean);
            const low = bits.filter(function (x) { return x.n <= 2; });
            return {
                l3: c.l3,
                text: (c.l3 || '能力') + '　' + bits.map(function (x) { return GAP_LABELS[x.k] + x.n; }).join(' / '),
                weak: low.length
            };
        }).filter(function (x) { return x.weak; });
        const p0 = inis.filter(function (i) { return i.phase === 'P0'; });
        const p1 = inis.filter(function (i) { return i.phase === 'P1'; });
        const p2 = inis.filter(function (i) { return i.phase === 'P2'; });
        const months = st.roadmapMonths || b.months || 18;
        return {
            org: wm.organizationName || '评估对象',
            project: wm.projectName || st.valueStreamName || '数字化转型评估',
            industry: (st.workflowIndustry === '3C' || st.workflowIndustry === '3c') ? '消费电子' : (st.workflowIndustry || ''),
            horizon: wm.planningHorizon || (months + ' 个月'),
            owner: wm.sponsor || '',
            vsName: st.valueStreamName || '价值流',
            startYm: st.roadmapStartYm || '',
            months: months,
            bmc: bmc,
            stages: stages,
            fw: fw,
            reds: reds.length ? reds : titlesOf(b.reds),
            watches: watches,
            yels: yels,
            greens: greens,
            weak: weak,
            inis: inis,
            p0: p0,
            p1: p1,
            p2: p2,
            waves: Array.isArray(b.waves) ? b.waves : [],
            script: Array.isArray(b.script) ? b.script : [],
            watchCount: watches.length || b.watchCount || 0,
            yellowCount: yels.length || b.yellowCount || 0
        };
    }

    function iniLine(ini) {
        const title = ini.title || '未命名';
        const extra = [ini.benefit, ini.deps, ini.owner].filter(Boolean).map(function (x) { return clip(x, 28); });
        return (ini.phase ? ini.phase + '　' : '') + title + (extra.length ? '　' + extra.join(' · ') : '');
    }

    function streamSpan(ini) {
        const streams = ini.streams || [];
        if (!streams.length) return '';
        let minS = 99;
        let maxE = 0;
        streams.forEach(function (s) {
            minS = Math.min(minS, Number(s.start) || 0);
            maxE = Math.max(maxE, (Number(s.start) || 0) + (Number(s.len) || 1));
        });
        return '第 ' + (minS + 1) + '–' + maxE + ' 月';
    }

    function buildSlides(state, brief, pack, shots) {
        const snap = collectSnapshot(state, brief);
        if (Array.isArray(shots) && shots.length) {
            const shotSlides = [
                {
                    kicker: '友为 · 从战略到路标',
                    title: snap.org,
                    sub: snap.project + (snap.industry ? '　' + snap.industry : '') + (snap.horizon ? '　' + snap.horizon : ''),
                    footer: (snap.owner ? '负责人 ' + snap.owner + '　' : '') + '以下各页是工作台原页截图',
                    kind: 'cover'
                }
            ];
            shots.forEach(function (shot) {
                shotSlides.push({
                    kind: 'shot',
                    kicker: '步骤 ' + shot.step,
                    title: shot.title,
                    src: shot.dataUrl
                });
            });
            shotSlides.push({
                kicker: '收口',
                title: '请确认三件事',
                bullets: [
                    '画布和价值流，是否就是贵司当下的经营说法。',
                    '优先短板与 P0，负责人与验收口径是否站得住。',
                    '路标跨度内，哪些必须见效、哪些可以观察。'
                ],
                note: '各页截自工作台当时画面。数字请用经营数据确认后再上会。',
                kind: 'list'
            });
            return shotSlides;
        }
        const bmcCells = FIELD_ORDER.map(function (k) {
            return { label: FIELD_MAP[k], text: clip(snap.bmc[k], 72) || '尚未填写' };
        });
        const vsBullets = snap.stages.length
            ? snap.stages.slice(0, 8).map(function (s) {
                const weak = VS_DIMS.filter(function (d) { return Number(s[d.k]) > 0 && Number(s[d.k]) <= 2; })
                    .map(function (d) { return d.l + s[d.k]; });
                return (s.name || '阶段') + (s.type === 'wait' ? '（关口）' : '') +
                    (weak.length ? '　弱项 ' + weak.join('、') : '') +
                    (s.valDesc ? '　' + clip(s.valDesc, 36) : '');
            })
            : ['步骤 2 尚未生成价值流阶段。'];
        if (snap.stages.length > 8) vsBullets.push('另有 ' + (snap.stages.length - 8) + ' 个阶段，见工作台。');

        const capBullets = snap.fw.length
            ? snap.fw.slice(0, 8).map(function (c) {
                return [c.l1, c.l2, c.l3].filter(Boolean).join(' · ') + (c.desc ? '　' + clip(c.desc, 32) : '');
            })
            : ['步骤 3 尚未生成能力清单。'];
        if (snap.fw.length > 8) capBullets.push('共 ' + snap.fw.length + ' 项，此处只列前八项。');

        const gapBullets = snap.weak.length
            ? snap.weak.slice(0, 7).map(function (x) { return x.text; })
            : (snap.fw.length ? ['四维差距已填，暂无 ≤2 的明显短板维。'] : ['步骤 4 尚未打分。']);

        const heatBullets = snap.reds.length
            ? snap.reds.slice(0, 6)
            : ['热力页尚未形成优先短板。'];
        const heatNote = '优先短板 ' + snap.reds.length +
            '　观察 ' + snap.watchCount +
            '　纳入计划 ' + snap.yellowCount +
            (snap.greens.length ? '　相对健康 ' + snap.greens.length : '') +
            '。数字为评估目标，请用贵司数据确认。';

        const p0Bullets = snap.p0.length
            ? snap.p0.slice(0, 5).map(iniLine)
            : (snap.inis.length ? snap.inis.slice(0, 3).map(iniLine) : ['步骤 6 尚未生成变革举措。']);
        const later = snap.p1.concat(snap.p2);
        const laterBullets = later.length ? later.slice(0, 7).map(iniLine) : [];

        const roadBullets = snap.inis.length
            ? snap.inis.slice(0, 8).map(function (ini) {
                return (ini.phase || '') + '　' + (ini.title || '未命名') + (streamSpan(ini) ? '　' + streamSpan(ini) : '');
            })
            : ['步骤 7 尚未排出时间轴。'];
        const roadNote = (snap.startYm ? snap.startYm + ' 起 · ' : '') + snap.months + ' 个月' +
            (snap.waves.length ? '。' + snap.waves.map(function (w) {
                return (w.label || '') + '：' + ((w.items || []).filter(Boolean).join('、') || '—');
            }).join('　') : '');

        const overview = [
            '1 画布　' + (clip(snap.bmc.valuePropositions, 42) || clip(snap.bmc.customerSegments, 42) || '待填写'),
            '2 价值流　' + snap.vsName + ' · ' + (snap.stages.length ? snap.stages.length + ' 个阶段' : '未生成'),
            '3 架构　' + (snap.fw.length ? snap.fw.length + ' 项能力' : '未生成'),
            '4 差距　' + (snap.weak.length ? snap.weak.length + ' 项偏弱维' : (snap.fw.length ? '已填、无明显短板维' : '未打分')),
            '5 热力　优先短板 ' + snap.reds.length + ' · 观察 ' + snap.watchCount,
            '6 举措　' + (snap.inis.length ? (snap.inis.length + ' 条 · P0 ' + snap.p0.length + ' / P1 ' + snap.p1.length + ' / P2 ' + snap.p2.length) : '未生成'),
            '7 路标　' + (snap.startYm ? snap.startYm + ' 起 · ' : '') + snap.months + ' 个月'
        ];

        const slides = [
            {
                kicker: '友为 · 从战略到路标',
                title: snap.org,
                sub: snap.project + (snap.industry ? '　' + snap.industry : '') + (snap.horizon ? '　' + snap.horizon : ''),
                footer: (snap.owner ? '负责人 ' + snap.owner + '　' : '') + '七步评估快照 · 内部汇报底稿',
                kind: 'cover'
            },
            {
                kicker: '目录',
                title: '这一份里有什么',
                bullets: overview,
                note: '按工作台步骤 1 到 7 原样收录，便于改成正式 PPT。',
                kind: 'list'
            },
            {
                kicker: '步骤 1　商业画布蓝图',
                title: '经营怎么说',
                cells: bmcCells,
                note: '九宫格来自工作台第一步，空白格请回画布补。',
                kind: 'grid'
            },
            {
                kicker: '步骤 2　价值流程诊断',
                title: snap.vsName,
                bullets: vsBullets,
                note: snap.stages.length ? '弱项指五维评分 ≤2 的环节。' : '',
                kind: 'list'
            },
            {
                kicker: '步骤 3　业务能力架构',
                title: '补哪几块能力',
                bullets: capBullets,
                kind: 'list'
            },
            {
                kicker: '步骤 4　能力差距分析',
                title: '组织 / 流程 / 数据 / 系统',
                bullets: gapBullets,
                note: '只列出任一维 ≤2 的能力。',
                kind: 'list'
            },
            {
                kicker: '步骤 5　能力热力分布',
                title: '先补哪几块',
                bullets: heatBullets,
                note: heatNote,
                kind: 'list'
            },
            {
                kicker: '步骤 6　变革举措规划',
                title: '近半年先做',
                bullets: p0Bullets,
                kind: 'list'
            }
        ];
        if (laterBullets.length) {
            slides.push({
                kicker: '步骤 6　变革举措规划',
                title: '随后承接的事项',
                bullets: laterBullets,
                kind: 'list'
            });
        }
        slides.push({
            kicker: '步骤 7　变革路标计划',
            title: '排进哪几个月',
            bullets: roadBullets,
            note: roadNote,
            kind: 'list'
        });
        if (snap.script.length) {
            slides.push({
                kicker: '口头对齐',
                title: '会上可以这样讲',
                bullets: snap.script,
                kind: 'list'
            });
        }
        slides.push({
            kicker: '收口',
            title: '请确认三件事',
            bullets: [
                '画布和价值流，是否就是贵司当下的经营说法。',
                '优先短板与 P0，负责人与验收口径是否站得住。',
                '路标跨度内，哪些必须见效、哪些可以观察。'
            ],
            note: '本页是工作台快照，不是对外承诺。数字请用经营数据确认后再上会。',
            kind: 'list'
        });

        const extra = [];
        if (pack === 'board' || pack === 'investment') {
            const p1x = global.YouweiP1;
            if (p1x && typeof p1x.extraSlides === 'function') extra.push.apply(extra, p1x.extraSlides(state, brief, pack) || []);
            const p2x = global.YouweiP2;
            if (p2x && typeof p2x.extraSlides === 'function') extra.push.apply(extra, p2x.extraSlides(state, brief, pack) || []);
        }
        return slides.concat(extra);
    }

    function slideInner(slide, index, total) {
        const foot = '<p class="ppt-foot">友为 · 七步评估稿　' + (index + 1) + ' / ' + total + '</p>';
        if (slide.kind === 'cover') {
            return `<section class="ppt-slide ppt-cover" data-i="${index}">
                <p class="ppt-kicker">${esc(slide.kicker)}</p>
                <h1>${esc(slide.title)}</h1>
                <p class="ppt-sub">${esc(slide.sub)}</p>
                <p class="ppt-foot">${esc(slide.footer)}　${index + 1} / ${total}</p>
            </section>`;
        }
        if (slide.kind === 'shot') {
            return `<section class="ppt-slide ppt-shot" data-i="${index}">
                <p class="ppt-kicker">${esc(slide.kicker)}　${esc(slide.title)}</p>
                <div class="ppt-shot-box"><img alt="${esc(slide.title)}" src="${String(slide.src || '').replace(/"/g, '')}"></div>
                ${foot}
            </section>`;
        }
        if (slide.kind === 'grid') {
            return `<section class="ppt-slide" data-i="${index}">
                <p class="ppt-kicker">${esc(slide.kicker)}</p>
                <h2>${esc(slide.title)}</h2>
                <div class="ppt-grid">${(slide.cells || []).map(function (c) {
                    return '<div class="ppt-cell"><b>' + esc(c.label) + '</b><p>' + esc(c.text) + '</p></div>';
                }).join('')}</div>
                ${slide.note ? '<p class="ppt-note">' + esc(slide.note) + '</p>' : ''}
                ${foot}
            </section>`;
        }
        return `<section class="ppt-slide" data-i="${index}">
            <p class="ppt-kicker">${esc(slide.kicker)}</p>
            <h2>${esc(slide.title)}</h2>
            <ul>${(slide.bullets || []).map(function (item) { return '<li>' + esc(item) + '</li>'; }).join('')}</ul>
            ${slide.note ? '<p class="ppt-note">' + esc(slide.note) + '</p>' : ''}
            ${foot}
        </section>`;
    }

    function pptCss() {
        return `
:root{--ink:#2c2a26;--muted:#6b6760;--sage:#4f6b62;--paper:#f7f5f1}
*{box-sizing:border-box}
html,body{margin:0;height:100%;background:#2c2a26;font-family:"PingFang SC","Noto Sans SC","Microsoft YaHei",sans-serif;color:var(--ink)}
.ppt-stage{min-height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px 16px 72px}
.ppt-frame{width:min(96vw,1280px);aspect-ratio:16/9;background:var(--paper);border:1px solid rgba(243,241,236,.12);box-shadow:0 18px 50px rgba(0,0,0,.35);position:relative;overflow:hidden}
.ppt-slide{position:absolute;inset:0;padding:6% 6% 10%;display:none;flex-direction:column}
.ppt-slide.is-on{display:flex}
.ppt-kicker{margin:0 0 14px;font-size:clamp(12px,1.5vw,16px);letter-spacing:.16em;color:var(--sage);font-weight:650}
.ppt-cover h1,.ppt-slide h2{margin:0 0 14px;font-family:Georgia,"Songti SC","Noto Serif SC",serif;font-weight:500;letter-spacing:-.03em;line-height:1.2}
.ppt-cover h1{font-size:clamp(32px,5vw,64px)}
.ppt-slide h2{font-size:clamp(22px,3vw,36px)}
.ppt-sub{margin:0;font-size:clamp(15px,2vw,22px);color:var(--muted);max-width:38em}
.ppt-slide ul{margin:4px 0 0;padding:0;list-style:none;flex:1;overflow:auto}
.ppt-slide li{position:relative;padding:8px 0 8px 20px;font-size:clamp(14px,1.7vw,20px);line-height:1.4;border-bottom:1px solid rgba(44,42,38,.08)}
.ppt-slide li:before{content:"";position:absolute;left:0;top:1.05em;width:8px;height:1px;background:var(--sage)}
.ppt-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;flex:1;min-height:0}
.ppt-cell{background:rgba(79,107,98,.07);border:1px solid rgba(44,42,38,.08);padding:10px 12px;overflow:hidden}
.ppt-cell b{display:block;font-size:clamp(11px,1.2vw,13px);color:var(--sage);margin:0 0 6px;font-weight:650}
.ppt-cell p{margin:0;font-size:clamp(12px,1.35vw,15px);line-height:1.4}
.ppt-note{margin:10px 0 0;font-size:clamp(12px,1.4vw,15px);color:var(--muted)}
.ppt-shot{padding:4% 4% 8%}
.ppt-shot-box{flex:1;min-height:0;overflow:auto;background:#fff;border:1px solid rgba(44,42,38,.08)}
.ppt-shot-box img{display:block;width:100%;height:auto}
.ppt-foot{position:absolute;left:6%;right:6%;bottom:4.5%;margin:0;font-size:12px;letter-spacing:.06em;color:var(--muted)}
.ppt-bar{position:fixed;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;gap:10px;padding:12px;background:rgba(44,42,38,.92);color:#f3f1ec}
.ppt-bar button{border:1px solid rgba(243,241,236,.25);background:transparent;color:#f3f1ec;border-radius:3px;padding:6px 12px;cursor:pointer;font-size:13px}
.ppt-bar .primary{background:#4f6b62;border-color:#4f6b62}
`;
    }

    function deckScript() {
        return `
(function(){
  var slides=[].slice.call(document.querySelectorAll('.ppt-slide'));
  var i=0;
  function show(n){i=(n+slides.length)%slides.length;slides.forEach(function(s,idx){s.classList.toggle('is-on',idx===i)});}
  show(0);
  document.getElementById('ppt-prev').onclick=function(){show(i-1)};
  document.getElementById('ppt-next').onclick=function(){show(i+1)};
  document.addEventListener('keydown',function(e){
    if(e.key==='ArrowRight'||e.key==='PageDown'||e.key===' ') {e.preventDefault();show(i+1);}
    if(e.key==='ArrowLeft'||e.key==='PageUp') {e.preventDefault();show(i-1);}
  });
})();`;
    }

    function fullHtml(slides, title) {
        const inner = slides.map(function (s, i) { return slideInner(s, i, slides.length); }).join('');
        return `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${esc(title)}</title><style>${pptCss()}</style></head><body>
<!-- youwei-briefing v1 steps=1-7 -->
<div class="ppt-stage"><div class="ppt-frame">${inner}</div></div>
<div class="ppt-bar">
  <button type="button" id="ppt-prev">上一页</button>
  <button type="button" id="ppt-next">下一页</button>
  <span>方向键翻页 · 16:9 HTML 汇报底稿</span>
</div>
<script>${deckScript()}<\/script>
</body></html>`;
    }

    function persistLatest(html, meta) {
        storeDeck('latest', html, (meta && meta.title) || '评估稿');
        try {
            localStorage.setItem(BRIEF_LS, JSON.stringify({
                savedAt: new Date().toISOString(),
                title: (meta && meta.title) || '评估稿',
                stored: 'idb'
            }));
        } catch (e) { /* quota */ }
    }

    function loadLatest() {
        return loadDeck('latest').then(function (html) {
            return html ? { html: html, title: '评估稿' } : null;
        });
    }

    function openIdb() {
        return new Promise(function (resolve, reject) {
            const req = indexedDB.open('youwei_briefing_v1', 1);
            req.onupgradeneeded = function () {
                if (!req.result.objectStoreNames.contains('decks')) req.result.createObjectStore('decks');
            };
            req.onsuccess = function () { resolve(req.result); };
            req.onerror = function () { reject(req.error); };
        });
    }

    function storeDeck(id, html, title) {
        return openIdb().then(function (db) {
            return new Promise(function (resolve, reject) {
                const tx = db.transaction('decks', 'readwrite');
                tx.objectStore('decks').put({
                    html: html,
                    title: title || '评估稿',
                    savedAt: new Date().toISOString()
                }, String(id));
                tx.oncomplete = function () { resolve(id); };
                tx.onerror = function () { reject(tx.error); };
            });
        });
    }

    function loadDeck(id) {
        return openIdb().then(function (db) {
            return new Promise(function (resolve, reject) {
                const tx = db.transaction('decks', 'readonly');
                const r = tx.objectStore('decks').get(String(id));
                r.onsuccess = function () {
                    resolve(r.result && r.result.html ? r.result.html : '');
                };
                r.onerror = function () { reject(r.error); };
            });
        });
    }

    function downloadText(html, title) {
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = String(title || '评估稿').replace(/[\\/:*?"<>|]/g, '_') + '.html';
        a.click();
        URL.revokeObjectURL(a.href);
    }

    function bindChrome(host, getHtml, title) {
        const nodes = host.querySelectorAll('.ppt-slide');
        let i = 0;
        function show(n) {
            if (!nodes.length) return;
            i = (n + nodes.length) % nodes.length;
            nodes.forEach(function (s, idx) { s.classList.toggle('is-on', idx === i); });
        }
        function close() {
            if (host._onKey) document.removeEventListener('keydown', host._onKey);
            host.innerHTML = '';
            document.body.classList.remove('youwei-ppt-open');
        }
        show(0);
        const prev = host.querySelector('#ppt-prev');
        const next = host.querySelector('#ppt-next');
        if (prev) prev.onclick = function () { show(i - 1); };
        if (next) next.onclick = function () { show(i + 1); };
        host.querySelector('#youwei-ppt-close').onclick = close;
        host.querySelector('#youwei-ppt-download').onclick = function () {
            downloadText(getHtml(), title);
            if (typeof global.toast === 'function') global.toast('已下载 HTML 汇报底稿');
        };
        const saveBtn = host.querySelector('#youwei-ppt-save');
        if (saveBtn) {
            saveBtn.onclick = function () {
                if (typeof global.saveBriefingHtmlRecord === 'function') {
                    global.saveBriefingHtmlRecord(getHtml(), title);
                } else {
                    persistLatest(getHtml(), { title: title });
                    if (typeof global.toast === 'function') global.toast('已写入本机评估稿');
                }
            };
        }
        host._onKey = function (e) {
            if (!host.innerHTML) return;
            if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); show(i + 1); }
            if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); show(i - 1); }
            if (e.key === 'Escape') close();
        };
        document.addEventListener('keydown', host._onKey);
        return close;
    }

    function ensureHost() {
        let host = document.getElementById('youwei-ppt-host');
        if (host && host._onKey) document.removeEventListener('keydown', host._onKey);
        if (!host) {
            host = document.createElement('div');
            host.id = 'youwei-ppt-host';
            document.body.appendChild(host);
        }
        document.body.classList.add('youwei-ppt-open');
        return host;
    }

    function overlayShell(label, frameHtml) {
        return `
            <div class="youwei-ppt-overlay">
                <div class="youwei-ppt-toolbar">
                    <span>16:9 ${esc(label)} · 工作台原页截图 · 可下载后当 PPT 底稿</span>
                    <div>
                        <button type="button" id="youwei-ppt-save">存入底稿</button>
                        <button type="button" id="youwei-ppt-download">下载 HTML</button>
                        <button type="button" id="youwei-ppt-close">关闭</button>
                    </div>
                </div>
                <div class="ppt-stage youwei-ppt-stage">
                    <div class="ppt-frame" id="youwei-ppt-frame">${frameHtml}</div>
                </div>
                <div class="ppt-bar youwei-ppt-bar">
                    <button type="button" id="ppt-prev">上一页</button>
                    <button type="button" id="ppt-next">下一页</button>
                    <span>方向键翻页</span>
                </div>
            </div>
            <style>
            ${pptCss()}
            .youwei-ppt-overlay{position:fixed;inset:0;z-index:90;background:#1f1e1b;display:flex;flex-direction:column}
            .youwei-ppt-toolbar{flex:none;display:flex;justify-content:space-between;align-items:center;padding:10px 16px;color:#f3f1ec;font-size:13px}
            .youwei-ppt-toolbar button{margin-left:8px;border:1px solid rgba(243,241,236,.28);background:transparent;color:#f3f1ec;border-radius:3px;padding:6px 12px;cursor:pointer}
            .youwei-ppt-toolbar #youwei-ppt-download,.youwei-ppt-toolbar #youwei-ppt-save{background:#4f6b62;border-color:#4f6b62}
            .youwei-ppt-stage{flex:1;padding:8px 16px 64px}
            .youwei-ppt-bar{position:absolute}
            </style>`;
    }

    function openDeck(state, brief, opts) {
        const pack = (opts && opts.pack) || 'briefing';
        const slides = buildSlides(state, brief, pack, opts && opts.shots);
        const wm = (state && state.workspaceMeta) || {};
        const title = (wm.organizationName || '评估') + ' · ' + packLabel(pack);
        const html = fullHtml(slides, title);
        persistLatest(html, { title: title });
        const host = ensureHost();
        host.innerHTML = overlayShell(packLabel(pack), slides.map(function (s, i) {
            return slideInner(s, i, slides.length);
        }).join(''));
        bindChrome(host, function () { return html; }, title);
    }

    function openHtml(html, title) {
        const name = title || '评估稿';
        persistLatest(html, { title: name });
        const host = ensureHost();
        const parsed = document.createElement('div');
        parsed.innerHTML = html;
        const frame = parsed.querySelector('.ppt-frame');
        host.innerHTML = overlayShell(name, frame ? frame.innerHTML : '');
        bindChrome(host, function () { return html; }, name);
    }

    global.YouweiPpt = {
        openDeck: openDeck,
        openHtml: openHtml,
        buildSlides: buildSlides,
        fullHtml: fullHtml,
        persistLatest: persistLatest,
        loadLatest: loadLatest,
        storeDeck: storeDeck,
        loadDeck: loadDeck,
        collectSnapshot: collectSnapshot
    };
})(window);
