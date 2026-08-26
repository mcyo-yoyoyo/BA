/**
 * 评估过程册：用工作台快照还原七步结论，生成可发给客户的独立 HTML。
 * 文字是矢量的，可放大、可复制。
 */
(function (global) {
    const STEPS = [
        { id: 1, short: '画布', title: '商业画布蓝图' },
        { id: 2, short: '流程', title: '价值流程诊断' },
        { id: 3, short: '架构', title: '业务能力架构' },
        { id: 4, short: '差距', title: '能力差距分析' },
        { id: 5, short: '热力', title: '能力热力分布' },
        { id: 6, short: '举措', title: '变革举措规划' },
        { id: 7, short: '路标', title: '变革路标计划' }
    ];
    const BMC = [
        { k: 'keyPartners', l: '重要伙伴', cls: 'kp' },
        { k: 'keyActivities', l: '关键业务', cls: 'ka' },
        { k: 'keyResources', l: '核心资源', cls: 'kr' },
        { k: 'valuePropositions', l: '价值主张', cls: 'vp' },
        { k: 'customerRelationships', l: '客户关系', cls: 'cr' },
        { k: 'channels', l: '渠道通路', cls: 'ch' },
        { k: 'customerSegments', l: '客户细分', cls: 'cs' },
        { k: 'costStructure', l: '成本结构', cls: 'cost' },
        { k: 'revenueStreams', l: '收入来源', cls: 'rev' }
    ];
    const VS_DIMS = [
        { k: 'dEff', l: '效率' },
        { k: 'dQual', l: '质量' },
        { k: 'dCost', l: '成本' },
        { k: 'dRisk', l: '风险' },
        { k: 'dCx', l: '体验' }
    ];
    const GAP = [
        { k: 'gapOrg', l: '组织' },
        { k: 'gapProc', l: '流程' },
        { k: 'gapData', l: '数据' },
        { k: 'gapIt', l: '系统' }
    ];

    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function text(s, empty) {
        const t = String(s == null ? '' : s).trim();
        return t ? esc(t) : (empty || '尚未填写');
    }

    function nl(s) {
        return text(s, '尚未填写').replace(/\n/g, '<br>');
    }

    function num(v, fb) {
        const n = Number(v);
        return isNaN(n) ? (fb == null ? 0 : fb) : n;
    }

    function heatOf(c) {
        const vals = GAP.map(function (g) { return num(c[g.k], 3); });
        const le2 = vals.filter(function (x) { return x <= 2; }).length;
        if (vals.some(function (x) { return x === 0; }) || le2 >= 2) return 'red';
        if (le2 === 1) return 'yellow';
        return 'green';
    }

    function heatLabel(h) {
        if (h === 'red') return '优先短板';
        if (h === 'yellow') return '纳入计划';
        return '相对健康';
    }

    function phaseOrder(p) {
        return p === 'P0' ? 0 : p === 'P1' ? 1 : 2;
    }

    function formatWhen(iso) {
        try {
            return new Date(iso).toLocaleString('zh-CN', { hour12: false });
        } catch (e) {
            return String(iso || '');
        }
    }

    function addMonths(ym, offset) {
        const m = String(ym || '').match(/^(\d{4})-(\d{1,2})/);
        if (!m) return '';
        const d = new Date(Number(m[1]), Number(m[2]) - 1 + offset, 1);
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    }

    function linkedVs(c) {
        const v = c.linkedVs;
        if (Array.isArray(v)) return v.filter(Boolean).join('、');
        return String(v || c.vsStage || c.stage || '').trim();
    }

    function sortInis(list) {
        return (list || []).slice().sort(function (a, b) {
            return phaseOrder(a.phase) - phaseOrder(b.phase) || (Number(a.id) || 0) - (Number(b.id) || 0);
        });
    }

    function snippet(s, n) {
        const t = String(s || '').replace(/\s+/g, ' ').trim();
        if (!t) return '';
        return t.length > n ? t.slice(0, n) + '…' : t;
    }

    function isAssignedOwner(s) {
        const t = String(s || '').trim();
        return !!(t && !/^待指定/.test(t) && t !== '待定' && t !== '—' && t !== '-');
    }

    function exportableP0s(st) {
        return sortInis((st && st.initiatives) || []).filter(function (i) {
            return i.phase === 'P0' && isAssignedOwner(i.owner);
        }).slice(0, 3);
    }

    function missingProcessBookGate(st) {
        const miss = [];
        const wm = (st && st.workspaceMeta) || {};
        if (!String(wm.organizationName || '').trim()) miss.push('企业名称');
        if (!String(wm.projectName || '').trim()) miss.push('评估项目');
        if (!String(wm.planningHorizon || '').trim()) miss.push('规划周期');
        if (!String(wm.sponsor || '').trim()) miss.push('负责人');
        const p0s = ((st && st.initiatives) || []).filter(function (i) { return i.phase === 'P0'; });
        if (!p0s.length) miss.push('至少一条近半年 P0 举措（步骤 6）');
        else if (!p0s.some(function (i) { return isAssignedOwner(i.owner); })) miss.push('至少一条 P0 写明责任人（步骤 6）');
        return miss;
    }

    function weakestStage(st) {
        const stages = (st && st.vsStages) || [];
        let worst = null;
        let worstAvg = 99;
        stages.forEach(function (s) {
            const vals = [];
            VS_DIMS.forEach(function (d) {
                const on = !(s.dimActive && s.dimActive[d.k] === false);
                if (!on) return;
                const n = num(s[d.k], 0);
                if (n) vals.push(n);
            });
            if (!vals.length) return;
            const avg = vals.reduce(function (a, b) { return a + b; }, 0) / vals.length;
            if (avg < worstAvg) {
                worstAvg = avg;
                worst = s;
            }
        });
        return worst;
    }

    function buildFindings(st) {
        const findings = [];
        const fw = (st && st.capabilityFramework) || [];
        const reds = fw.filter(function (c) { return heatOf(c) === 'red'; });
        if (reds.length) {
            const names = reds.slice(0, 2).map(function (c) { return c.l3 || c.l2 || '未命名能力'; }).join('、');
            const extra = reds.length > 2 ? '等 ' + reds.length + ' 项' : '';
            findings.push({
                k: '能力短板',
                t: '优先短板在「' + names + '」' + extra + '。组织 / 流程 / 数据 / 系统中至少两维偏弱，或有一维为零。'
            });
        }
        const weak = weakestStage(st);
        if (weak && findings.length < 3) {
            const dims = VS_DIMS.filter(function (d) {
                const on = !(weak.dimActive && weak.dimActive[d.k] === false);
                if (!on) return false;
                return num(weak[d.k], 0) && num(weak[d.k], 0) <= 2;
            }).map(function (d) { return d.l; });
            findings.push({
                k: '流程关口',
                t: '价值流「' + ((st && st.valueStreamName) || '本流') + '」里，「' + (weak.name || '未命名阶段') + '」健康度最低' +
                    (dims.length ? '，弱在' + dims.join('、') : '') + '。'
            });
        }
        const r = st && st.bmcReport;
        if (findings.length < 3 && r && r.risks && r.risks[0]) {
            findings.push({ k: '商业模式', t: snippet(r.risks[0], 80) });
        }
        if (findings.length < 3) {
            const vp = snippet(((st && st.bmc) || {}).valuePropositions, 48);
            if (vp) {
                findings.push({
                    k: '价值主张',
                    t: '价值主张写的是「' + vp + '」。后续举措应对齐这条，而不是另起一套说法。'
                });
            }
        }
        if (findings.length < 3) {
            const empty = BMC.filter(function (c) {
                return !String(((st && st.bmc) || {})[c.k] || '').trim();
            }).slice(0, 2);
            if (empty.length) {
                findings.push({
                    k: '画布缺口',
                    t: '商业画布「' + empty.map(function (c) { return c.l; }).join('、') + '」尚未填写，对外口径还不完整。'
                });
            }
        }
        if (findings.length < 3) {
            const p0 = ((st && st.initiatives) || []).filter(function (i) { return i.phase === 'P0'; }).length;
            findings.push({
                k: '节奏',
                t: p0
                    ? '近半年只压 ' + p0 + ' 件 P0，其余进 P1 / P2，避免同时铺开。'
                    : '尚未标出近半年 P0。保存前请在步骤 6 把最急的一条标成 P0 并写责任人。'
            });
        }
        return findings.slice(0, 3);
    }

    function roadmapOneLiner(st) {
        const wm = (st && st.workspaceMeta) || {};
        const months = Math.max(6, Math.min(48, num(st && st.roadmapMonths, 24)));
        const start = (st && st.roadmapStartYm) || '';
        const p0s = exportableP0s(st);
        const titles = p0s.map(function (i) { return i.title || '未命名'; }).slice(0, 2).join('、');
        const horizon = String(wm.planningHorizon || '').trim();
        let s = horizon ? ('按「' + horizon + '」规划，') : '';
        s += (start ? start + ' 起、' : '') + months + ' 个月跨度';
        if (titles) s += '，先落地「' + titles + '」' + (p0s.length > 2 ? '等 P0' : '');
        s += '。';
        return s;
    }

    function briefHtml(st, meta) {
        const finds = buildFindings(st);
        const p0s = exportableP0s(st);
        const findList = finds.map(function (f, i) {
            return '<li><b>发现 ' + (i + 1) + '　' + esc(f.k) + '</b><p>' + esc(f.t) + '</p></li>';
        }).join('');
        const p0Cards = p0s.map(function (i) {
            const bits = [
                i.owner ? '责任人：' + i.owner : '',
                i.gate ? '关口：' + i.gate : '',
                i.kpi ? '验收：' + snippet(i.kpi, 60) : ''
            ].filter(Boolean);
            return '<article><span class="ph">P0</span><h3>' + text(i.title, '未命名举措') + '</h3>' +
                '<p class="muted">' + bits.map(esc).join('　') + '</p></article>';
        }).join('');
        return '<section class="yr-brief" id="brief">' +
            '<p class="yr-kicker">出门结论</p>' +
            '<h2>这一次先讲什么</h2>' +
            '<p class="yr-lead">' + esc(meta.org) + ' · ' + esc(meta.project) +
            (meta.owner ? ' · 负责人 ' + esc(meta.owner) : '') +
            '。下面三条发现和近半年 P0，是给决策人的一页纸。</p>' +
            '<ol class="yr-find">' + findList + '</ol>' +
            (p0Cards ? '<div class="yr-p0">' + p0Cards + '</div>' : '') +
            '<p class="yr-line">' + esc(roadmapOneLiner(st)) + '</p>' +
            '</section>';
    }

    function css() {
        return [
            ':root{--ink:#161513;--muted:#4f4b45;--dim:#6e695f;--line:rgba(22,21,19,.12);--canvas:#f4f1ea;--surface:#f7f5f0;--sage:#3d534b;--sand:#ebe4d6;--soft:#dce6e1}',
            '*{box-sizing:border-box}',
            'html,body{margin:0;color:var(--ink);background:var(--surface);font:16px/1.55 -apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei UI","Noto Sans SC",sans-serif}',
            'a{color:inherit}',
            '.yr{display:flex;min-height:100vh}',
            '.yr-nav{position:sticky;top:0;align-self:flex-start;width:168px;flex:none;padding:20px 12px;height:100vh;overflow:auto;background:var(--canvas);border-right:1px solid var(--line)}',
            '.yr-nav .brand{display:flex;align-items:baseline;margin:0 0 18px;text-decoration:none}',
            '.yr-nav .brand b{font-size:15px;font-weight:650}',
            '.yr-nav .brand i{font-style:normal;margin-left:8px;padding-left:8px;border-left:1px solid var(--line);font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:var(--dim)}',
            '.yr-nav a{display:block;padding:7px 8px;margin-bottom:2px;font-size:13px;text-decoration:none;color:var(--muted);border-radius:2px}',
            '.yr-nav a:hover,.yr-nav a:focus{background:#fff;color:var(--ink)}',
            '.yr-nav em{font-style:normal;display:inline-block;width:1.4em;color:var(--sage);font-weight:650;font-size:11px}',
            '.yr-main{flex:1;min-width:0;padding:28px 36px 64px;max-width:1080px}',
            '.yr-cover{min-height:72vh;display:flex;flex-direction:column;justify-content:flex-end;padding:8px 0 36px}',
            '.yr-kicker{margin:0 0 10px;font-size:13px;font-weight:650;color:var(--sage)}',
            'h1{margin:0;font-size:clamp(32px,5vw,48px);font-weight:600;letter-spacing:-.03em;line-height:1.15}',
            '.yr-sub{margin:14px 0 0;font-size:18px;color:var(--muted);max-width:36rem}',
            '.yr-meta{margin:28px 0 0;display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px 20px}',
            '.yr-meta span{display:block;font-size:11px;color:var(--dim);letter-spacing:.06em}',
            '.yr-meta b{display:block;margin-top:4px;font-size:15px;font-weight:600}',
            '.yr-toc{margin:36px 0 0;padding:0;list-style:none;display:grid;gap:8px}',
            '.yr-toc a{display:flex;justify-content:space-between;gap:16px;padding:10px 0;border-bottom:1px solid var(--line);text-decoration:none}',
            '.yr-toc i{font-style:normal;color:var(--dim)}',
            '.yr-note{margin:22px 0 0;font-size:13px;color:var(--dim);max-width:40rem}',
            '.yr-brief{padding:36px 0 8px;border-top:1px solid var(--line);margin-top:12px}',
            '.yr-brief h2{margin:0 0 8px;font-size:26px;font-weight:600;letter-spacing:-.02em}',
            '.yr-brief .yr-lead{margin:0 0 20px}',
            '.yr-find{margin:0;padding:0;list-style:none;display:grid;gap:12px}',
            '.yr-find li{background:#fff;border:1px solid var(--line);padding:14px 16px}',
            '.yr-find b{display:block;font-size:11px;letter-spacing:.08em;color:var(--sage);margin-bottom:6px}',
            '.yr-find p{margin:0;font-size:15px;line-height:1.55}',
            '.yr-p0{margin:20px 0 0;display:grid;gap:10px}',
            '.yr-p0 article{background:#fff;border:1px solid var(--line);padding:14px 16px}',
            '.yr-p0 .ph{display:inline-block;font-size:11px;font-weight:650;letter-spacing:.08em;color:var(--sage);margin-bottom:6px}',
            '.yr-p0 h3{margin:0 0 6px;font-size:16px}',
            '.yr-p0 .muted{margin:0;color:var(--muted);font-size:13px}',
            '.yr-line{margin:18px 0 0;padding:14px 16px;background:var(--sand);font-size:16px;line-height:1.5}',
            '.yr-sec{padding:36px 0 8px;border-top:1px solid var(--line);margin-top:28px}',
            '.yr-sec h2{margin:0 0 6px;font-size:26px;font-weight:600;letter-spacing:-.02em}',
            '.yr-lead{margin:0 0 18px;color:var(--muted);font-size:15px}',
            '.bmc{display:grid;grid-template-columns:repeat(10,minmax(0,1fr));grid-template-rows:auto auto auto;gap:1px;background:#b9b2a4;border:1px solid #b9b2a4}',
            '.bmc article{background:#f7f3ea;padding:10px 12px 12px;min-height:120px}',
            '.bmc .vp{background:#fffef8}',
            '.bmc span{display:block;font-size:11px;font-weight:650;letter-spacing:.06em;color:var(--dim);margin-bottom:8px}',
            '.bmc p{margin:0;font-size:13px;line-height:1.5;white-space:pre-wrap;word-break:break-word}',
            '.bmc .kp{grid-column:1/3;grid-row:1/3}',
            '.bmc .ka{grid-column:3/5;grid-row:1}',
            '.bmc .kr{grid-column:3/5;grid-row:2}',
            '.bmc .vp{grid-column:5/7;grid-row:1/3}',
            '.bmc .cr{grid-column:7/9;grid-row:1}',
            '.bmc .ch{grid-column:7/9;grid-row:2}',
            '.bmc .cs{grid-column:9/11;grid-row:1/3}',
            '.bmc .cost{grid-column:1/6;grid-row:3;min-height:80px}',
            '.bmc .rev{grid-column:6/11;grid-row:3;min-height:80px}',
            '.diag{margin-top:16px;background:var(--ink);color:#f7f6f2;padding:16px 18px}',
            '.diag h3{margin:0 0 8px;font-size:15px}',
            '.diag ul{margin:0;padding-left:1.1em;font-size:13px}',
            '.flow{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 18px}',
            '.flow span{background:#fff;border:1px solid var(--line);padding:8px 12px;font-size:13px;font-weight:600}',
            '.cards{display:grid;gap:12px}',
            '.card{background:#fff;border:1px solid var(--line);padding:14px 16px}',
            '.card h3{margin:0 0 6px;font-size:16px}',
            '.card .muted{color:var(--muted);font-size:13px;white-space:pre-wrap}',
            '.dims{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0 0}',
            '.dims i{font-style:normal;font-size:12px;padding:3px 8px;background:var(--sand)}',
            '.dims i.weak{background:#f3e0d6;color:#8d4a3a}',
            'table{width:100%;border-collapse:collapse;background:#fff;font-size:13px}',
            'th,td{border:1px solid var(--line);padding:8px 10px;text-align:left;vertical-align:top}',
            'th{background:var(--canvas);font-weight:650;color:var(--dim);font-size:12px}',
            '.heat{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px}',
            '.tile{padding:14px 14px 12px;color:#f7f6f2;min-height:88px}',
            '.tile b{display:block;font-size:15px}',
            '.tile i{display:block;margin-top:6px;font-style:normal;font-size:12px;opacity:.88}',
            '.is-r{background:#8d4a3a}',
            '.is-y{background:#b0893e}',
            '.is-g{background:#3d534b}',
            '.legend{display:flex;gap:14px;margin:0 0 14px;font-size:12px;color:var(--dim)}',
            '.legend u{display:inline-block;width:10px;height:10px;margin-right:5px;text-decoration:none}',
            '.ini{display:grid;gap:10px}',
            '.ini article{background:#fff;border:1px solid var(--line);padding:14px 16px}',
            '.ini .ph{display:inline-block;font-size:11px;font-weight:650;letter-spacing:.08em;color:var(--sage);margin-bottom:6px}',
            '.gantt{display:grid;gap:8px}',
            '.grow{display:grid;grid-template-columns:9.5rem 1fr;gap:10px;align-items:center}',
            '.grow b{font-size:13px}',
            '.track{position:relative;height:26px;background:var(--sand)}',
            '.bar{position:absolute;top:5px;height:16px;background:var(--sage);min-width:4px}',
            '.bar.p1{background:#6d7f78}',
            '.bar.p2{background:#a8b4ae}',
            '.axis{display:flex;justify-content:space-between;font-size:11px;color:var(--dim);margin:0 0 8px 9.5rem}',
            '.empty{padding:18px;border:1px dashed var(--line);color:var(--dim);font-size:14px}',
            '.yr-4a{margin-top:28px;padding-top:18px;border-top:1px solid var(--line)}',
            '.yr-4a h3{margin:8px 0 10px;font-size:17px;font-weight:600}',
            '.yr-4a .yr-kicker{margin:20px 0 0}',
            '.yr-4a .yr-kicker:first-child{margin-top:0}',
            '.yr-4a table{margin-top:0}',
            '.yr-foot{margin-top:40px;padding-top:16px;border-top:1px solid var(--line);font-size:12px;color:var(--dim)}',
            '@media(max-width:860px){.yr-nav{display:none}.yr-main{padding:20px 16px 48px}.bmc{display:block}.bmc article{min-height:0;margin-bottom:1px}.grow{grid-template-columns:1fr}.axis{margin-left:0}}',
            '@media print{body{background:#fff}.yr-nav{display:none}.yr-main{max-width:none;padding:0}.yr-cover,.yr-brief,.yr-sec{break-inside:avoid;page-break-after:always}.yr-sec:last-of-type,.yr-foot{page-break-after:auto}a{text-decoration:none}table{font-size:11px}th,td{padding:6px 7px}.tile{break-inside:avoid}}',
            '@page{size:A4;margin:14mm}'
        ].join('');
    }

    function coverHtml(meta, counts) {
        const toc = STEPS.map(function (s) {
            return '<li><a href="#s' + s.id + '"><span>' + s.id + '　' + esc(s.title) + '</span><i>' + esc(counts[s.id] || '') + '</i></a></li>';
        }).join('');
        return '<section class="yr-cover" id="cover">' +
            '<p class="yr-kicker">友为 · Yoway　评估过程册</p>' +
            '<h1>' + esc(meta.org) + '</h1>' +
            '<p class="yr-sub">' + esc(meta.project) + '。按七步还原当时的评估结论，可放大阅读，下载 HTML 即可发给客户。</p>' +
            '<div class="yr-meta">' +
                pair('行业', meta.industry) +
                pair('规划周期', meta.horizon) +
                pair('负责人', meta.owner) +
                pair('保存时间', meta.saved) +
            '</div>' +
            '<ol class="yr-toc">' +
                '<li><a href="#brief"><span>结论</span><i>先讲发现与 P0</i></a></li>' +
                toc +
            '</ol>' +
            '<p class="yr-note">本册由工作台快照生成，不是界面截图，所以字不会糊。数字是评估当时的判断，对外使用前请用贵司经营数据确认。</p>' +
            '</section>';
    }

    function pair(k, v) {
        return '<div><span>' + esc(k) + '</span><b>' + text(v, '—') + '</b></div>';
    }

    function sec(id, title, lead, body) {
        return '<section class="yr-sec" id="s' + id + '">' +
            '<p class="yr-kicker">步骤 ' + id + ' / 7</p>' +
            '<h2>' + esc(title) + '</h2>' +
            '<p class="yr-lead">' + esc(lead) + '</p>' + body +
            '</section>';
    }

    function step1(st) {
        const bmc = st.bmc || {};
        const cells = BMC.map(function (c) {
            return '<article class="' + c.cls + '"><span>' + c.l + '</span><p>' + nl(bmc[c.k]) + '</p></article>';
        }).join('');
        let extra = '';
        const r = st.bmcReport;
        if (r && (r.score != null || (r.risks && r.risks.length) || (r.suggestions && r.suggestions.length))) {
            extra = '<div class="diag"><h3>画布诊断　' + (r.score != null ? esc(r.score) + ' 分' : '') + '</h3>';
            if (r.risks && r.risks.length) extra += '<ul>' + r.risks.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>';
            if (r.suggestions && r.suggestions.length) extra += '<ul>' + r.suggestions.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>';
            extra += '</div>';
        }
        return sec(1, '商业画布蓝图', '客群、价值、渠道与成本结构，评估当时怎么说。',
            '<div class="bmc">' + cells + '</div>' + extra);
    }

    function step2(st) {
        const stages = st.vsStages || [];
        if (!stages.length) return sec(2, '价值流程诊断', '端到端阶段与五维健康度。', '<p class="empty">步骤 2 尚未生成价值流阶段。</p>');
        const flow = '<div class="flow">' + stages.map(function (s, i) {
            return '<span>' + (i + 1) + '　' + text(s.name, '未命名阶段') + '</span>';
        }).join('') + '</div>';
        const cards = '<div class="cards">' + stages.map(function (s) {
            const dims = VS_DIMS.map(function (d) {
                const on = !(s.dimActive && s.dimActive[d.k] === false);
                if (!on) return '';
                const n = num(s[d.k], 0);
                return '<i class="' + (n && n <= 2 ? 'weak' : '') + '">' + d.l + ' ' + (n || '—') + '</i>';
            }).join('');
            const kpis = [];
            VS_DIMS.forEach(function (d) {
                const rows = (s.dimKpiRows && s.dimKpiRows[d.k]) || [];
                rows.forEach(function (row) {
                    if (!row || !String(row.name || '').trim()) return;
                    kpis.push(d.l + ' · ' + row.name +
                        (row.current ? '　现状 ' + row.current : '') +
                        (row.target ? '　目标 ' + row.target : ''));
                });
            });
            return '<article class="card"><h3>' + text(s.name, '未命名阶段') + (s.type === 'wait' ? '　关口' : '') + '</h3>' +
                (s.valDesc ? '<p class="muted">' + nl(s.valDesc) + '</p>' : '') +
                (s.components ? '<p class="muted">业务组件：' + esc(s.components) + '</p>' : '') +
                '<div class="dims">' + dims + '</div>' +
                (kpis.length ? '<p class="muted" style="margin-top:10px">' + kpis.map(esc).join('<br>') + '</p>' : '') +
                '</article>';
        }).join('') + '</div>';
        return sec(2, '价值流程诊断',
            (st.valueStreamName || '价值流') + ' · ' + stages.length + ' 个阶段。',
            flow + cards);
    }

    function fourASection(kicker, title, headers, rows) {
        const head = '<p class="yr-kicker">' + esc(kicker) + '</p><h3>' + esc(title) + '</h3>';
        if (!rows.length) {
            return head + '<p class="empty">未填。不填则路标悬空，举措绑不到这一域。</p>';
        }
        return head +
            '<table><thead><tr>' + headers.map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('') +
            '</tr></thead><tbody>' + rows.join('') + '</tbody></table>';
    }

    function fourAHtml(st) {
        const a = (st && st.architecture4a) || {};
        const data = a.dataObjects || [];
        const sys = a.systems || [];
        const tech = a.techConstraints || [];
        if (!data.length && !sys.length && !tech.length) {
            return '<div class="yr-4a"><p class="yr-kicker">IA · AA · TA</p><h3>四域约束</h3>' +
                '<p class="empty">数据对象、系统、技术约束尚未填写。不填则路标悬空，举措绑不到口径和系统上。</p></div>';
        }
        const dataRows = data.map(function (r) {
            return '<tr><td>' + text(r.name) + '</td><td>' + text(r.owner) + '</td><td>' + text(r.quality) +
                '</td><td>' + text(r.systems) + '</td><td>' + text(r.note) + '</td></tr>';
        });
        const sysRows = sys.map(function (r) {
            return '<tr><td>' + text(r.name) + '</td><td>' + text(r.domain) + '</td><td>' + text(r.integrations) +
                '</td><td>' + text(r.bound) + '</td></tr>';
        });
        const techRows = tech.map(function (r) {
            return '<tr><td>' + text(r.title) + '</td><td>' + text(r.type) + '</td><td>' + text(r.impact) +
                '</td><td>' + (r.blocks ? '限制排期' : '不卡节奏') + '</td></tr>';
        });
        return '<div class="yr-4a">' +
            fourASection('IA 数据', '数据对象', ['数据对象', '所有权', '质量现状', '落在哪些系统', '说明'], dataRows) +
            fourASection('AA 应用', '系统与集成', ['系统', '前后台', '集成点', '主要绑在哪段业务'], sysRows) +
            fourASection('TA 技术', '技术与合规约束', ['约束', '类型', '对路标的影响', '卡住节奏'], techRows) +
            '</div>';
    }

    function step3(st) {
        const fw = st.capabilityFramework || [];
        const ba = fw.length
            ? ('<table><thead><tr><th>L1</th><th>L2</th><th>L3</th><th>做什么</th><th>所属阶段</th><th>参考系统</th></tr></thead><tbody>' +
                fw.map(function (c) {
                    return '<tr><td>' + text(c.l1, '—') + '</td><td>' + text(c.l2, '—') + '</td><td>' + text(c.l3, '—') +
                        '</td><td>' + nl(c.desc) + '</td><td>' + text(linkedVs(c), '—') + '</td><td>' + text(c.sys, '—') + '</td></tr>';
                }).join('') + '</tbody></table>')
            : '<p class="empty">步骤 3 尚未生成能力清单（BA）。</p>';
        const lead = fw.length
            ? ('共 ' + fw.length + ' 项能力块（BA 业务），下面还原 IA 数据、AA 应用、TA 技术。')
            : 'BA 能力清单尚未生成。下面的 IA / AA / TA 仍按当时填写还原；不填则路标悬空。';
        return sec(3, '业务能力架构', lead, ba + fourAHtml(st));
    }

    function step4(st) {
        const fw = st.capabilityFramework || [];
        if (!fw.length) return sec(4, '能力差距分析', '组织 / 流程 / 数据 / 系统 四维 0–5 分。', '<p class="empty">步骤 4 尚未打分。</p>');
        const rows = fw.map(function (c) {
            const vals = GAP.map(function (g) { return num(c[g.k], 0); });
            const avg = Math.round((vals.reduce(function (a, b) { return a + b; }, 0) / 4) * 10) / 10;
            return '<tr><td>' + text(c.l3, '—') + '</td>' +
                vals.map(function (n) { return '<td>' + n + '</td>'; }).join('') +
                '<td>' + avg + '</td></tr>';
        }).join('');
        return sec(4, '能力差距分析', '分数越高越成熟；≤2 视为该维偏弱。',
            '<table><thead><tr><th>能力 L3</th><th>组织</th><th>流程</th><th>数据</th><th>系统</th><th>均分</th></tr></thead><tbody>' +
            rows + '</tbody></table>');
    }

    function step5(st) {
        const fw = st.capabilityFramework || [];
        if (!fw.length) return sec(5, '能力热力分布', '按四维差距着色。', '<p class="empty">步骤 5 尚无热力数据。</p>');
        let r = 0, y = 0, g = 0;
        const tiles = fw.map(function (c) {
            const h = heatOf(c);
            if (h === 'red') r++; else if (h === 'yellow') y++; else g++;
            const weak = GAP.filter(function (d) { return num(c[d.k], 3) <= 2; }).map(function (d) { return d.l + num(c[d.k], 0); });
            return '<div class="tile is-' + h.charAt(0) + '"><b>' + text(c.l3, '能力') + '</b><i>' +
                heatLabel(h) + (weak.length ? '　' + esc(weak.join(' / ')) : '') + '</i></div>';
        }).join('');
        return sec(5, '能力热力分布',
            '红 ' + r + '　黄 ' + y + '　绿 ' + g + '。任一维为 0 或至少两维 ≤2 为优先短板。',
            '<div class="legend"><span><u class="is-r"></u>优先短板</span><span><u class="is-y"></u>纳入计划</span><span><u class="is-g"></u>相对健康</span></div>' +
            '<div class="heat">' + tiles + '</div>');
    }

    function step6(st) {
        const inis = sortInis(st.initiatives);
        if (!inis.length) return sec(6, '变革举措规划', '按 P0 / P1 / P2 排列的事项。', '<p class="empty">步骤 6 尚未生成变革举措。</p>');
        const cards = inis.map(function (i) {
            const bits = [
                (i.caps || []).length ? '关联能力：' + (i.caps || []).join('、') : '',
                (i.gaps || []).length ? '待补维度：' + (i.gaps || []).join('、') : '',
                i.window ? '窗口：' + i.window : '',
                i.benefit ? '收益：' + i.benefit : '',
                i.cost ? '难易：' + i.cost : '',
                i.owner ? '责任人：' + i.owner : '',
                i.kpi ? '验收：' + i.kpi : '',
                i.budget ? '预算：' + i.budget : '',
                i.deps ? '依赖：' + i.deps : '',
                i.boundSystem ? '系统：' + i.boundSystem : ''
            ].filter(Boolean);
            return '<article><p class="ph">' + text(i.phase, 'P') + '</p><h3 style="margin:0 0 8px;font-size:16px">' +
                text(i.title, '未命名举措') + '</h3><p class="muted">' + bits.map(esc).join('<br>') + '</p></article>';
        }).join('');
        const p0 = inis.filter(function (i) { return i.phase === 'P0'; }).length;
        return sec(6, '变革举措规划',
            inis.length + ' 条 · 其中近半年 P0 ' + p0 + ' 条。',
            '<div class="ini">' + cards + '</div>');
    }

    function step7(st) {
        const inis = sortInis(st.initiatives);
        const months = Math.max(6, Math.min(48, num(st.roadmapMonths, 24)));
        const start = st.roadmapStartYm || '';
        if (!inis.length) return sec(7, '变革路标计划', '甘特与时间片。', '<p class="empty">步骤 7 尚无路标数据。</p>');
        const axis = [];
        for (let i = 0; i < 3; i++) {
            const m = Math.round(i * months / 2);
            axis.push(start ? addMonths(start, m) : ('第 ' + (m + 1) + ' 月'));
        }
        const rows = inis.map(function (ini) {
            const streams = Array.isArray(ini.streams) && ini.streams.length
                ? ini.streams
                : [{ label: ini.title, start: ini.phase === 'P0' ? 0 : ini.phase === 'P1' ? Math.floor(months / 3) : Math.floor(months * 2 / 3), len: Math.max(2, Math.floor(months / 4)) }];
            const bars = streams.map(function (s) {
                const left = (num(s.start, 0) / months) * 100;
                const w = (Math.max(1, num(s.len, 1)) / months) * 100;
                const ph = (ini.phase || 'P2').toLowerCase();
                return '<i class="bar ' + ph + '" style="left:' + left + '%;width:' + w + '%" title="' + esc(s.label || ini.title) + '"></i>';
            }).join('');
            return '<div class="grow"><b>' + text(ini.title, '举措') + '</b><div class="track">' + bars + '</div></div>';
        }).join('');
        const table = '<table style="margin-top:18px"><thead><tr><th>举措</th><th>优先级</th><th>时间片</th></tr></thead><tbody>' +
            inis.map(function (ini) {
                const streams = ini.streams || [];
                const span = streams.length
                    ? streams.map(function (s) {
                        const a = num(s.start, 0);
                        const b = a + Math.max(1, num(s.len, 1));
                        const from = start ? addMonths(start, a) : ('第 ' + (a + 1) + ' 月');
                        const to = start ? addMonths(start, b - 1) : ('第 ' + b + ' 月');
                        return (s.label || '子路标') + '　' + from + ' → ' + to;
                    }).join('；')
                    : (ini.window || '—');
                return '<tr><td>' + text(ini.title, '—') + '</td><td>' + text(ini.phase, '—') + '</td><td>' + esc(span) + '</td></tr>';
            }).join('') + '</tbody></table>';
        return sec(7, '变革路标计划',
            (start ? start + ' 起 · ' : '') + months + ' 个月跨度。',
            '<div class="axis">' + axis.map(esc).join('') + '</div><div class="gantt">' + rows + '</div>' + table);
    }

    function countsOf(st) {
        const fw = st.capabilityFramework || [];
        const inis = st.initiatives || [];
        const red = fw.filter(function (c) { return heatOf(c) === 'red'; }).length;
        const a = st.architecture4a || {};
        const a4n = (a.dataObjects || []).length + (a.systems || []).length + (a.techConstraints || []).length;
        const step3count = fw.length
            ? (fw.length + ' 项能力' + (a4n ? ' · 4A 已填' : ' · 4A 未填'))
            : (a4n ? '4A 已填' : '待生成');
        return {
            1: Object.keys(st.bmc || {}).some(function (k) { return String((st.bmc || {})[k] || '').trim(); }) ? '已填九宫格' : '待填',
            2: (st.vsStages || []).length ? ((st.vsStages || []).length + ' 阶段') : '待生成',
            3: step3count,
            4: fw.length ? '四维已填' : '待打分',
            5: fw.length ? ('红 ' + red) : '待着色',
            6: inis.length ? (inis.length + ' 条举措') : '待生成',
            7: inis.length ? ((st.roadmapMonths || 24) + ' 个月') : '待排期'
        };
    }

    function buildHtml(state, opts) {
        const st = state || {};
        const o = opts || {};
        const wm = st.workspaceMeta || {};
        const meta = {
            org: wm.organizationName || o.org || '评估对象',
            project: o.title || wm.projectName || st.valueStreamName || '数字化转型评估',
            industry: st.workflowIndustry || '',
            horizon: wm.planningHorizon || ((st.roadmapMonths || 24) + ' 个月'),
            owner: wm.sponsor || '',
            saved: o.savedAt ? formatWhen(o.savedAt) : ''
        };
        const body = coverHtml(meta, countsOf(st)) +
            briefHtml(st, meta) +
            step1(st) + step2(st) + step3(st) + step4(st) + step5(st) + step6(st) + step7(st) +
            '<p class="yr-foot">友为 Yoway · 评估过程册　' + esc(meta.project) +
            '　本文件可直接发给客户。</p>';
        const nav = '<nav class="yr-nav"><a class="brand" href="#cover"><b>友为</b><i>Yoway</i></a>' +
            '<a href="#cover">封面</a>' +
            '<a href="#brief"><em>·</em>结论</a>' +
            STEPS.map(function (s) {
                return '<a href="#s' + s.id + '"><em>' + s.id + '</em>' + esc(s.short) + '</a>';
            }).join('') + '</nav>';
        return '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8">' +
            '<meta name="viewport" content="width=device-width,initial-scale=1">' +
            '<title>' + esc(meta.project) + ' · 评估过程册</title>' +
            '<style>' + css() + '</style></head><body><div class="yr">' + nav +
            '<main class="yr-main">' + body + '</main></div></body></html>';
    }

    global.YouweiReport = {
        buildHtml: buildHtml,
        missingProcessBookGate: missingProcessBookGate,
        isAssignedOwner: isAssignedOwner
    };
})(window);
