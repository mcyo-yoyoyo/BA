/**
 * P2 闭环：季度再评估、路标偏差、跨项目资产库对标、行业场景对照。
 * 不新增步骤，挂在步骤 5 / 7 与资产库。
 */
(function (root) {
    function $(id) { return document.getElementById(id); }

    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    const BENCH = {
        '3C': { redShare: 0.28, watchShare: 0.20, common: ['问询承接', '库存占用', '会员回流'], note: '消费电子营销服场景，短板多集中在问询、履约与拥护。' },
        '家电': { redShare: 0.24, watchShare: 0.18, common: ['送装协同', '网点服务', '分货节奏'], note: '家电渠道更长，短板多在送装与网点一次解决。' },
        '汽车': { redShare: 0.30, watchShare: 0.18, common: ['线索超时', '按揭审批', '交车预约'], note: '经销与服务链路上，获客到交车的等待最伤体验。' }
    };

    function industryOf(state) {
        const ind = (state && state.workflowIndustry) || '3C';
        return BENCH[ind] ? ind : '3C';
    }

    function ensureOps() {
        const state = root.currentState;
        if (!state) return null;
        if (!state.continuousOps || typeof state.continuousOps !== 'object') {
            state.continuousOps = { version: 1, initiativeCheckpoints: [], maturityRuns: [], dashboardPrefs: { pinnedMetrics: [] } };
        }
        const co = state.continuousOps;
        if (!Array.isArray(co.initiativeCheckpoints)) co.initiativeCheckpoints = [];
        if (!Array.isArray(co.maturityRuns)) co.maturityRuns = [];
        if (!co.dashboardPrefs || typeof co.dashboardPrefs !== 'object') co.dashboardPrefs = { pinnedMetrics: [] };
        if (!co.visitPlan || typeof co.visitPlan !== 'object') co.visitPlan = null;
        if (!state.knowledgeRefs || typeof state.knowledgeRefs !== 'object') {
            state.knowledgeRefs = { version: 1, anonymizedCaseIds: [], linkedAssetRecordIds: [] };
        }
        if (!Array.isArray(state.knowledgeRefs.linkedAssetRecordIds)) state.knowledgeRefs.linkedAssetRecordIds = [];
        return co;
    }

    function currentHeatStats(fw) {
        const blocks = fw || (root.currentState && root.currentState.capabilityFramework) || [];
        if (!blocks.length) return { red: 0, watch: 0, yellow: 0, green: 0, total: 0, avgCur: 0, avgTgt: 0 };
        const count = typeof root.countHeatStats === 'function'
            ? root.countHeatStats(blocks, '', { prioritize: true })
            : { red: 0, watch: 0, yellow: 0, green: 0, total: blocks.length };
        let sumCur = 0;
        let sumTgt = 0;
        blocks.forEach(function (c) {
            sumCur += Number(c.curMat) || 0;
            sumTgt += Number(c.tgtMat) || 0;
        });
        return {
            red: count.red || 0,
            watch: count.watch || 0,
            yellow: count.yellow || 0,
            green: count.green || 0,
            total: count.total || blocks.length,
            avgCur: blocks.length ? Math.round((sumCur / blocks.length) * 10) / 10 : 0,
            avgTgt: blocks.length ? Math.round((sumTgt / blocks.length) * 10) / 10 : 0
        };
    }

    function snapshotCaps(fw) {
        const ids = root.getPriorityRedIdSet ? root.getPriorityRedIdSet(fw) : null;
        return (fw || []).map(function (c) {
            const cat = root.heatDisplayCategory ? root.heatDisplayCategory(c, ids) : (root.heatCategory ? root.heatCategory(c) : '');
            return { id: c.id, l3: c.l3, curMat: c.curMat, tgtMat: c.tgtMat, cat: cat };
        });
    }

    function defaultQuarterLabel() {
        const d = new Date();
        return d.getFullYear() + ' Q' + Math.ceil((d.getMonth() + 1) / 3);
    }

    function captureMaturityRun(optionalLabel, opts) {
        const silent = !!(opts && opts.silent);
        const state = root.currentState;
        const co = ensureOps();
        if (!state || !co) return;
        const fw = state.capabilityFramework || [];
        if (!fw.length) {
            if (!silent && typeof root.toast === 'function') root.toast('请先生成能力清单与热力，再记录本季', 'error');
            return;
        }
        const label = (typeof optionalLabel === 'string' && optionalLabel.trim())
            ? optionalLabel.trim()
            : defaultQuarterLabel();
        const stats = currentHeatStats(fw);
        const payload = {
            id: Date.now(),
            label: label,
            capturedAt: new Date().toISOString(),
            industry: industryOf(state),
            stats: stats,
            caps: snapshotCaps(fw)
        };
        const same = co.maturityRuns.findIndex(function (r) { return r && r.label === label; });
        if (same >= 0) {
            payload.id = co.maturityRuns[same].id;
            co.maturityRuns[same] = payload;
            if (!silent && typeof root.toast === 'function') root.toast('已更新「' + label + '」热力快照');
        } else {
            co.maturityRuns.push(payload);
            if (!silent && typeof root.toast === 'function') root.toast('已记录本季热力，可与上一季对照');
        }
        if (co.maturityRuns.length > 8) co.maturityRuns = co.maturityRuns.slice(-8);
        if (!silent && typeof root.renderStep5 === 'function' && state.step === 5) root.renderStep5();
    }

    function saveRunLabel() {
        const d = new Date();
        return '保存 · ' + d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }

    function ymdPlusDays(days) {
        const d = new Date();
        d.setDate(d.getDate() + days);
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }

    function formatWhen(iso) {
        try {
            return new Date(iso).toLocaleString('zh-CN', { hour12: false, month: 'numeric', day: 'numeric' });
        } catch (e) {
            return '';
        }
    }

    function previousHistorySnapshot() {
        const load = root.loadBlueprintHistoryList;
        if (typeof load !== 'function') return null;
        const list = load() || [];
        const nowCaps = snapshotCaps();
        const nowKey = nowCaps.map(function (c) { return c.l3 + ':' + c.cat; }).join('|');
        for (let i = 0; i < list.length; i++) {
            const rec = list[i];
            const fw = rec.snapshot && rec.snapshot.capabilityFramework;
            if (!fw || !fw.length) continue;
            const caps = snapshotCaps(fw);
            const key = caps.map(function (c) { return c.l3 + ':' + c.cat; }).join('|');
            if (key && key === nowKey) continue;
            return {
                label: rec.title || ('上次 · ' + formatWhen(rec.savedAt)),
                savedAt: rec.savedAt,
                stats: currentHeatStats(fw),
                caps: caps,
                initiatives: rec.snapshot.initiatives || []
            };
        }
        const pair = lastTwoRuns();
        return pair.prev || null;
    }

    function heatDiff(prevCaps, nowFw) {
        const now = snapshotCaps(nowFw);
        const nowMap = {};
        now.forEach(function (c) { nowMap[c.l3] = c; });
        const turned = [];
        const still = [];
        (prevCaps || []).forEach(function (c) {
            if (c.cat !== 'red') return;
            const n = nowMap[c.l3];
            if (!n) return;
            if (n.cat === 'red') still.push(c.l3);
            else turned.push(c.l3);
        });
        const fresh = now.filter(function (c) {
            if (c.cat !== 'red') return false;
            return !(prevCaps || []).some(function (p) { return p.l3 === c.l3 && p.cat === 'red'; });
        }).map(function (c) { return c.l3; });
        return { turned: turned, still: still, fresh: fresh };
    }

    function buildVisitPlan(state) {
        const st = state || root.currentState || {};
        const p0s = (st.initiatives || []).filter(function (i) { return i.phase === 'P0'; }).slice(0, 3).map(function (i) {
            return { title: i.title || '未命名', owner: i.owner || '', gate: i.gate || '' };
        });
        const reds = snapshotCaps(st.capabilityFramework).filter(function (c) { return c.cat === 'red'; }).slice(0, 5).map(function (c) { return c.l3; });
        return {
            savedAt: new Date().toISOString(),
            dueLabel: ymdPlusDays(90),
            p0s: p0s,
            reds: reds
        };
    }

    function hideVisitPlanOverlay() {
        const host = $('p2-visit-host');
        if (host && host.parentNode) host.parentNode.removeChild(host);
    }

    function showVisitPlanOverlay(plan, diff) {
        hideVisitPlanOverlay();
        const p = plan || {};
        const host = document.createElement('div');
        host.id = 'p2-visit-host';
        const p0 = (p.p0s || []).length
            ? '<ol>' + (p.p0s || []).map(function (i) {
                return '<li>' + esc(i.title) + (i.owner ? '　' + esc(i.owner) : '') + (i.gate ? '　' + esc(i.gate) : '') + '</li>';
            }).join('') + '</ol>'
            : '<p class="p2-muted">这次没有标 P0。下次先确认近半年只压哪一件。</p>';
        const reds = (p.reds || []).length
            ? '<ul>' + (p.reds || []).map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('') + '</ul>'
            : '<p class="p2-muted">当前没有优先短板红格。</p>';
        let diffHtml = '';
        if (diff && (diff.turned.length || diff.still.length || diff.fresh.length)) {
            diffHtml = '<p class="p2-kicker" style="margin-top:16px">和上次保存比</p><ul>'
                + (diff.turned.length ? '<li>已转绿 / 降级：' + esc(diff.turned.join('、')) + '</li>' : '')
                + (diff.still.length ? '<li>仍是红格：' + esc(diff.still.join('、')) + '</li>' : '')
                + (diff.fresh.length ? '<li>新出现的红格：' + esc(diff.fresh.join('、')) + '</li>' : '')
                + '</ul>';
        }
        host.innerHTML = '<div class="p2-visit" role="dialog" aria-label="90天回访清单">'
            + '<p class="p2-kicker">回访</p>'
            + '<h2>90 天后再看这些</h2>'
            + '<p class="p2-muted">约 ' + esc(p.dueLabel || '') + ' 回来。对照下面的 P0 和红格，不另开模块，也不接外部工单。</p>'
            + '<p class="p2-kicker" style="margin-top:16px">近半年 P0</p>' + p0
            + '<p class="p2-kicker" style="margin-top:16px">下次看哪些热力是否转绿</p>' + reds
            + diffHtml
            + '<div class="p2-visit-actions">'
            + '<button type="button" class="p2-btn" id="p2-visit-ok">知道了</button>'
            + '<button type="button" class="p2-btn p2-btn-ghost" id="p2-visit-heat">去热力</button>'
            + '</div></div>';
        document.body.appendChild(host);
        host.querySelector('#p2-visit-ok').onclick = hideVisitPlanOverlay;
        host.querySelector('#p2-visit-heat').onclick = function () {
            hideVisitPlanOverlay();
            if (typeof root.setStep === 'function') root.setStep(5);
        };
        host.addEventListener('click', function (e) {
            if (e.target === host) hideVisitPlanOverlay();
        });
    }

    function afterSaveVisit() {
        const state = root.currentState;
        const co = ensureOps();
        if (!state || !co) return;
        captureMaturityRun(saveRunLabel(), { silent: true });
        const plan = buildVisitPlan(state);
        co.visitPlan = plan;
        const prior = previousHistorySnapshot();
        const diff = prior ? heatDiff(prior.caps, state.capabilityFramework) : null;
        showVisitPlanOverlay(plan, diff);
    }

    function lastTwoRuns() {
        const co = ensureOps();
        const runs = (co && co.maturityRuns) || [];
        const prev = runs.length > 1 ? runs[runs.length - 2] : null;
        const last = runs.length ? runs[runs.length - 1] : null;
        return { prev: prev, last: last, n: runs.length };
    }

    function deltaText(a, b, invert) {
        if (a == null || b == null) return '—';
        const d = Math.round((b - a) * 10) / 10;
        if (!d) return '持平';
        const better = invert ? d < 0 : d > 0;
        const sign = d > 0 ? '+' + d : String(d);
        return sign + (better ? '（改善）' : '（变差）');
    }

    function libraryStats(industry) {
        const load = root.loadBlueprintHistoryList;
        if (typeof load !== 'function') return { n: 0, redShare: null, projects: [] };
        const list = load() || [];
        const rows = [];
        list.forEach(function (rec) {
            const snap = rec.snapshot || {};
            const ind = snap.workflowIndustry || '3C';
            if (industry && ind !== industry) return;
            const fw = snap.capabilityFramework || [];
            if (!fw.length) return;
            const st = currentHeatStats(fw);
            rows.push({
                id: rec.id,
                title: rec.title,
                industry: ind,
                redShare: st.total ? st.red / st.total : 0,
                stats: st
            });
        });
        if (!rows.length) return { n: 0, redShare: null, projects: [] };
        const avg = rows.reduce(function (s, r) { return s + r.redShare; }, 0) / rows.length;
        return { n: rows.length, redShare: Math.round(avg * 1000) / 1000, projects: rows.slice(0, 6) };
    }

    function checkpointOf(iniId) {
        const co = ensureOps();
        const list = (co && co.initiativeCheckpoints) || [];
        return list.find(function (x) { return Number(x.iniId) === Number(iniId); }) || null;
    }

    function setCheckpoint(iniId, status) {
        const co = ensureOps();
        if (!co) return;
        let row = checkpointOf(iniId);
        if (!row) {
            row = { iniId: iniId, status: status, note: '', updatedAt: new Date().toISOString() };
            co.initiativeCheckpoints.push(row);
        } else {
            row.status = status;
            row.updatedAt = new Date().toISOString();
        }
    }

    function deviateSummary() {
        const inis = (root.currentState && root.currentState.initiatives) || [];
        const tally = { notstarted: 0, ontrack: 0, delayed: 0, done: 0 };
        inis.forEach(function (ini) {
            const c = checkpointOf(ini.id);
            const st = (c && c.status) || 'notstarted';
            if (tally[st] == null) tally.notstarted += 1;
            else tally[st] += 1;
        });
        return tally;
    }

    function step5PanelHtml() {
        const state = root.currentState || {};
        const fw = state.capabilityFramework || [];
        if (!fw.length) return '';
        const now = currentHeatStats(fw);
        const pair = lastTwoRuns();
        const bench = BENCH[industryOf(state)] || BENCH['3C'];
        const share = now.total ? now.red / now.total : 0;
        const vsBench = share - bench.redShare;
        const lib = libraryStats(industryOf(state));
        const prior = previousHistorySnapshot();
        const plan = (state.continuousOps && state.continuousOps.visitPlan) || null;
        let compare = '';
        if (prior && prior.stats) {
            const diff = heatDiff(prior.caps, fw);
            compare = `<div class="p2-compare">
                <p>${esc(prior.label)} → 本次</p>
                <ul>
                    <li>优先短板 ${prior.stats.red} → ${now.red}　${esc(deltaText(prior.stats.red, now.red, true))}</li>
                    <li>平均成熟度 ${prior.stats.avgCur} → ${now.avgCur}　${esc(deltaText(prior.stats.avgCur, now.avgCur, false))}</li>
                    ${diff.turned.length ? '<li>已转绿 / 降级：' + esc(diff.turned.join('、')) + '</li>' : ''}
                    ${diff.still.length ? '<li>仍是红格：' + esc(diff.still.join('、')) + '</li>' : ''}
                    ${diff.fresh.length ? '<li>新出现的红格：' + esc(diff.fresh.join('、')) + '</li>' : ''}
                </ul>
            </div>`;
        } else if (pair.last && pair.prev) {
            compare = `<div class="p2-compare">
                <p>${esc(pair.prev.label)} → ${esc(pair.last.label)}</p>
                <ul>
                    <li>优先短板 ${pair.prev.stats.red} → ${pair.last.stats.red}　${esc(deltaText(pair.prev.stats.red, pair.last.stats.red, true))}</li>
                    <li>平均成熟度 ${pair.prev.stats.avgCur} → ${pair.last.stats.avgCur}　${esc(deltaText(pair.prev.stats.avgCur, pair.last.stats.avgCur, false))}</li>
                    <li>观察项 ${pair.prev.stats.watch || 0} → ${pair.last.stats.watch || 0}</li>
                </ul>
            </div>`;
        } else if (plan && (plan.reds || []).length) {
            compare = `<p class="p2-muted">已记下本次热力。约 ${esc(plan.dueLabel || '90 天后')} 回来看这些红格是否转绿：${esc((plan.reds || []).join('、'))}。</p>`;
        } else if (pair.last) {
            compare = `<p class="p2-muted">已记下 ${esc(pair.last.label)}。下次保存后即可对照红格有没有转绿。</p>`;
        } else {
            compare = `<p class="p2-muted">步骤 7 保存后会自动记下热力。第二次评估时，这里会直接对照上次红格。</p>`;
        }
        const libLine = lib.n
            ? `本地资产库同行业 ${lib.n} 条，平均优先短板占比 ${Math.round(lib.redShare * 100)}%。当前 ${Math.round(share * 100)}%${share > lib.redShare + 0.02 ? '，高于库内平均。' : share < lib.redShare - 0.02 ? '，低于库内平均。' : '，与库内接近。'}`
            : '资产库里还没有同行业版本。保存路标后，即可做跨项目对照。';
        const benchTone = vsBench > 0.04 ? '偏高' : vsBench < -0.04 ? '偏低' : '接近';
        const open = foldOpen(FOLD_KEYS.ops);
        return `<section id="p2-ops-panel" class="p2-panel p2-fold shrink-0${open ? '' : ' is-collapsed'}">
            <div class="p2-head">
                <div>
                    <p class="p2-kicker">闭环 · 再评估</p>
                    <p class="p2-lead">本季优先短板 ${now.red} / ${now.total}　平均成熟度 ${now.avgCur}（目标 ${now.avgTgt}）</p>
                </div>
                <button type="button" class="p2-btn p2-btn-ghost" data-p2-fold aria-expanded="${open ? 'true' : 'false'}" aria-controls="p2-ops-body">${open ? '收起' : '展开'}</button>
            </div>
            <div id="p2-ops-body" class="p2-fold-body">
                <div class="p2-actions">
                    <button type="button" class="p2-btn" onclick="YouweiP2.captureMaturityRun()">记录本季</button>
                    <button type="button" class="p2-btn p2-btn-ghost" onclick="YouweiP2.exportOpsExcel()">下载对照表</button>
                </div>
                ${compare}
                <div class="p2-bench">
                    <p><strong>行业场景对照</strong>（${esc(industryOf(state))}）：同行常见优先短板约占 ${Math.round(bench.redShare * 100)}%，当前 ${Math.round(share * 100)}%，${benchTone}。</p>
                    <p>${esc(bench.note)} 常见卡点：${esc(bench.common.join('、'))}。</p>
                    <p>${esc(libLine)}</p>
                </div>
            </div>
        </section>`;
    }

    function statusLabel(st) {
        return { notstarted: '未开始', ontrack: '按期', delayed: '延期', done: '已完成' }[st] || '未开始';
    }

    function step7PanelHtml() {
        const inis = (root.currentState && root.currentState.initiatives) || [];
        if (!inis.length) return '';
        const tally = deviateSummary();
        const sorted = typeof root.sortInitiativesByPhase === 'function' ? root.sortInitiativesByPhase(inis.slice()) : inis.slice();
        const rows = sorted.map(function (ini) {
            const cur = (checkpointOf(ini.id) && checkpointOf(ini.id).status) || 'notstarted';
            const opts = ['notstarted', 'ontrack', 'delayed', 'done'].map(function (st) {
                return `<option value="${st}" ${st === cur ? 'selected' : ''}>${statusLabel(st)}</option>`;
            }).join('');
            return `<tr>
                <td>${esc(ini.title || '未命名')}</td>
                <td>${esc(ini.phase || '—')}</td>
                <td><select onchange="YouweiP2.setCheckpoint(${ini.id}, this.value)">${opts}</select></td>
            </tr>`;
        }).join('');
        const plan = (root.currentState && root.currentState.continuousOps && root.currentState.continuousOps.visitPlan) || null;
        const prior = previousHistorySnapshot();
        const priorP0 = prior && prior.initiatives
            ? (prior.initiatives || []).filter(function (i) { return i.phase === 'P0'; }).map(function (i) { return i.title || '未命名'; })
            : [];
        const visit = plan
            ? `<p class="p2-muted">90 天回访约 ${esc(plan.dueLabel || '')}。先核这些 P0：${esc((plan.p0s || []).map(function (i) { return i.title; }).join('、') || '尚未标 P0')}。</p>`
            : `<p class="p2-muted">步骤 7 保存后会给出 90 天回访清单。有上次保存时，这里对照 P0 有没有换题。</p>`;
        const priorLine = priorP0.length
            ? `<p class="p2-muted">上次 P0：${esc(priorP0.join('、'))}。</p>`
            : '';
        const open = foldOpen(FOLD_KEYS.deviate);
        return `<section id="p2-deviate-panel" class="p2-panel p2-fold shrink-0${open ? '' : ' is-collapsed'}">
            <div class="p2-head">
                <div>
                    <p class="p2-kicker">闭环 · 路标偏差</p>
                    <p class="p2-lead">按期 ${tally.ontrack}　延期 ${tally.delayed}　已完成 ${tally.done}　未开始 ${tally.notstarted}</p>
                </div>
                <button type="button" class="p2-btn p2-btn-ghost" data-p2-fold aria-expanded="${open ? 'true' : 'false'}" aria-controls="p2-deviate-body">${open ? '收起' : '展开'}</button>
            </div>
            <div id="p2-deviate-body" class="p2-fold-body">
                ${visit}${priorLine}
                <table class="p2-table">
                    <thead><tr><th>举措</th><th>波次</th><th>进展</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
                <p class="p2-muted">延期项在甘特上标红。请回到步骤六核对关口与责任人，再改跨度。</p>
                <button type="button" class="p2-btn p2-btn-ghost" onclick="YouweiP2.exportOpsExcel()">下载对照表</button>
            </div>
        </section>`;
    }

    const FOLD_KEYS = {
        ops: 'youwei_p2_ops_open_v1',
        deviate: 'youwei_p2_deviate_open_v1'
    };

    function foldOpen(key) {
        try { return sessionStorage.getItem(key) === '1'; } catch (e) { return false; }
    }

    function applyFold(panel, key, open) {
        try { sessionStorage.setItem(key, open ? '1' : '0'); } catch (e) { /* ignore */ }
        if (!panel) return;
        panel.classList.toggle('is-collapsed', !open);
        const btn = panel.querySelector('[data-p2-fold]');
        if (btn) {
            btn.setAttribute('aria-expanded', open ? 'true' : 'false');
            btn.textContent = open ? '收起' : '展开';
        }
    }

    function bindFold(panel, key) {
        const btn = panel && panel.querySelector('[data-p2-fold]');
        if (!btn || btn.dataset.bound === '1') return;
        btn.dataset.bound = '1';
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            applyFold(panel, key, !foldOpen(key));
        });
    }

    function assetsCompareHtml() {
        const load = root.loadBlueprintHistoryList;
        const list = typeof load === 'function' ? (load() || []) : [];
        if (!list.length) {
            return `<section class="p2-panel p2-assets-bench">
                <p class="p2-kicker">跨项目对标</p>
                <p class="p2-lead">本地还没有保存的路标。在步骤七点保存后，即可按行业看优先短板占比，对照本次评估。</p>
            </section>`;
        }
        const byInd = {};
        list.forEach(function (rec) {
            const snap = rec.snapshot || {};
            const ind = snap.workflowIndustry || '3C';
            if (!byInd[ind]) byInd[ind] = [];
            const st = currentHeatStats(snap.capabilityFramework || []);
            if (st.total) byInd[ind].push(st);
        });
        const lines = Object.keys(byInd).map(function (ind) {
            const arr = byInd[ind];
            const red = arr.reduce(function (s, x) { return s + (x.total ? x.red / x.total : 0); }, 0) / arr.length;
            const bench = BENCH[ind] || BENCH['3C'];
            return `${ind}　${arr.length} 条资产　优先短板平均 ${Math.round(red * 100)}%　场景参考 ${Math.round(bench.redShare * 100)}%`;
        });
        return `<section class="p2-panel p2-assets-bench">
            <p class="p2-kicker">跨项目对标</p>
            <p class="p2-lead">本地资产库 ${list.length} 条。按行业看优先短板占比，便于对照本次评估，不是对外公布成绩。</p>
            <ul class="p2-ul">${lines.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('')}</ul>
        </section>`;
    }

    function injectStep5() {
        const host = $('step-5');
        if (!host || host.querySelector('#p2-ops-panel')) return;
        const mount = document.createElement('div');
        mount.innerHTML = step5PanelHtml();
        if (!mount.firstElementChild) return;
        const panel = mount.firstElementChild;
        const body = host.querySelector('.overflow-y-auto.overscroll-contain') || host.querySelector('.overflow-y-auto') || host;
        body.insertAdjacentElement('afterbegin', panel);
        bindFold(panel, FOLD_KEYS.ops);
    }

    function injectStep7() {
        const host = $('step-7');
        if (!host || host.querySelector('#p2-deviate-panel')) return;
        const mount = document.createElement('div');
        mount.innerHTML = step7PanelHtml();
        if (!mount.firstElementChild) return;
        const toolbar = host.querySelector('#p1-constraint-strip') || host.querySelector('#wendao-brief-strip');
        const panel = mount.firstElementChild;
        if (toolbar && toolbar.parentNode) toolbar.insertAdjacentElement('beforebegin', panel);
        else {
            const body = host.querySelector('.flex.flex-col.flex-1.min-h-0.min-w-0') || host;
            body.insertAdjacentElement('afterbegin', panel);
        }
        bindFold(panel, FOLD_KEYS.deviate);
    }

    function injectAssetsCompare() {
        const ov = $('assets-standalone-overlay');
        if (!ov || ov.querySelector('.p2-assets-bench')) return;
        const html = assetsCompareHtml();
        if (!html) return;
        const mount = document.createElement('div');
        mount.innerHTML = html;
        const tableWrap = ov.querySelector('.mx-auto');
        if (tableWrap) tableWrap.insertAdjacentElement('afterbegin', mount.firstElementChild);
        else ov.appendChild(mount.firstElementChild);
    }

    function extraSlides(state, brief, pack) {
        if (pack !== 'board' && pack !== 'investment') return [];
        const st = state || root.currentState || {};
        const fw = st.capabilityFramework || [];
        const now = currentHeatStats(fw);
        const runs = (st.continuousOps && st.continuousOps.maturityRuns) || [];
        const last = runs.length ? runs[runs.length - 1] : null;
        const prev = runs.length > 1 ? runs[runs.length - 2] : null;
        const slides = [];
        if (last && prev) {
            slides.push({
                kicker: '闭环　再评估',
                title: prev.label + ' → ' + last.label,
                bullets: [
                    '优先短板 ' + prev.stats.red + ' → ' + last.stats.red + '　' + deltaText(prev.stats.red, last.stats.red, true),
                    '平均成熟度 ' + prev.stats.avgCur + ' → ' + last.stats.avgCur + '　' + deltaText(prev.stats.avgCur, last.stats.avgCur, false),
                    '观察项 ' + (prev.stats.watch || 0) + ' → ' + (last.stats.watch || 0)
                ],
                note: '对照来自工作台季度快照，数字仍待贵司确认。',
                kind: 'list'
            });
        } else {
            slides.push({
                kicker: '闭环　再评估',
                title: '本季热力',
                bullets: [
                    '优先短板 ' + now.red + ' / ' + now.total,
                    '平均成熟度 ' + now.avgCur + '（目标 ' + now.avgTgt + '）',
                    last ? '已记录 ' + last.label + '。下一季再评一次即可对照。' : '尚未记录季度快照。规划定稿后在热力页点「记录本季」。'
                ],
                kind: 'list'
            });
        }
        const inis = st.initiatives || [];
        const tally = { notstarted: 0, ontrack: 0, delayed: 0, done: 0 };
        const delayed = [];
        inis.forEach(function (ini) {
            const list = (st.continuousOps && st.continuousOps.initiativeCheckpoints) || [];
            const row = list.find(function (x) { return Number(x.iniId) === Number(ini.id); });
            const s = (row && row.status) || 'notstarted';
            if (tally[s] != null) tally[s] += 1;
            else tally.notstarted += 1;
            if (s === 'delayed') delayed.push((ini.title || '未命名') + ' · ' + (ini.phase || '') + ' · ' + (ini.owner || '责任人待定'));
        });
        slides.push({
            kicker: '闭环　路标偏差',
            title: '哪些还按期，哪些延期',
            bullets: delayed.length
                ? delayed.slice(0, 6)
                : ['目前没有标为延期的举措。'],
            note: '按期 ' + tally.ontrack + '　延期 ' + tally.delayed + '　已完成 ' + tally.done + '　未开始 ' + tally.notstarted + '。延期项应先核关口，再改甘特。',
            kind: 'list'
        });
        return slides;
    }

    function appendOpsSheets(wb) {
        if (typeof XLSX === 'undefined' || !wb) return;
        const state = root.currentState || {};
        const runs = ((state.continuousOps && state.continuousOps.maturityRuns) || []).slice();
        const heatHead = ['季度', '记录时间', '行业', '优先短板', '观察', '纳入计划', '相对健康', '合计', '平均成熟度', '目标成熟度'];
        const heatRows = runs.length ? runs.map(function (r) {
            const s = r.stats || {};
            return [r.label, (r.capturedAt || '').slice(0, 10), r.industry || '', s.red, s.watch, s.yellow, s.green, s.total, s.avgCur, s.avgTgt];
        }) : [['尚未记录', '', '', '', '', '', '', '', '', '']];
        const wsHeat = XLSX.utils.aoa_to_sheet([heatHead].concat(heatRows));
        wsHeat['!cols'] = [{ wch: 12 }, { wch: 14 }, { wch: 8 }, { wch: 10 }, { wch: 8 }, { wch: 10 }, { wch: 10 }, { wch: 8 }, { wch: 12 }, { wch: 12 }];
        XLSX.utils.book_append_sheet(wb, wsHeat, '季度再评估');
        const inis = typeof root.sortInitiativesByPhase === 'function'
            ? root.sortInitiativesByPhase((state.initiatives || []).slice())
            : (state.initiatives || []);
        const devHead = ['举措', '波次', '进展', '责任人', '关口', '验收指标'];
        const devRows = inis.length ? inis.map(function (ini) {
            const c = checkpointOf(ini.id);
            return [ini.title || '', ini.phase || '', statusLabel((c && c.status) || 'notstarted'), ini.owner || '', ini.gate || '', ini.kpi || ''];
        }) : [['暂无举措', '', '', '', '', '']];
        const wsDev = XLSX.utils.aoa_to_sheet([devHead].concat(devRows));
        wsDev['!cols'] = [{ wch: 28 }, { wch: 8 }, { wch: 10 }, { wch: 12 }, { wch: 22 }, { wch: 36 }];
        XLSX.utils.book_append_sheet(wb, wsDev, '路标偏差');
        const note = [
            ['使用说明'],
            ['1. 「季度再评估」来自热力页「记录本季」，同季再记会覆盖，不会另开一行。'],
            ['2. 「路标偏差」来自步骤七进展下拉。延期项请回步骤六核关口后再改甘特。'],
            ['3. 数字为评估目标，带入内部讨论前请用贵司经营数据确认。']
        ];
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(note), '闭环说明');
    }

    function exportOpsExcel() {
        if (typeof XLSX === 'undefined') {
            if (typeof root.toast === 'function') root.toast('未加载表格库，请检查网络后重试', 'error');
            return;
        }
        const stamp = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, '');
        const wb = XLSX.utils.book_new();
        appendOpsSheets(wb);
        const wm = (root.currentState && root.currentState.workspaceMeta) || {};
        const base = (wm.organizationName || '评估').replace(/[\\/:*?"<>|]/g, '_');
        XLSX.writeFile(wb, base + '_闭环对照_' + stamp + '.xlsx');
        if (typeof root.toast === 'function') root.toast('已下载对照表（季度再评估 + 路标偏差）');
    }

    function checkpointStatus(iniId) {
        const c = checkpointOf(iniId);
        return (c && c.status) || 'notstarted';
    }

    function decorateGantt() {
        const host = $('step-7');
        if (!host) return;
        host.querySelectorAll('[data-ini-id]').forEach(function (row) {
            const st = checkpointStatus(row.getAttribute('data-ini-id'));
            row.classList.toggle('p2-row-delayed', st === 'delayed');
            row.classList.toggle('p2-row-done', st === 'done');
            row.classList.toggle('p2-row-ontrack', st === 'ontrack');
            const bar = row.querySelector('.roadmap-gantt-bar:not(.roadmap-gantt-bar-stream)');
            if (bar) {
                bar.classList.toggle('p2-bar-delayed', st === 'delayed');
                bar.classList.toggle('p2-bar-done', st === 'done');
                bar.classList.toggle('p2-bar-ontrack', st === 'ontrack');
            }
        });
    }

    function wrap(name, after) {
        const orig = root[name];
        if (!orig || orig.__p2Wrapped) return;
        root[name] = function () {
            const r = orig.apply(this, arguments);
            try { after(); } catch (e) { console.error(e); }
            return r;
        };
        root[name].__p2Wrapped = true;
    }

    function linkLatestAsset() {
        const load = root.loadBlueprintHistoryList;
        if (typeof load !== 'function' || !root.currentState) return;
        const list = load() || [];
        if (!list.length) return;
        ensureOps();
        const kr = root.currentState.knowledgeRefs;
        const id = list[0].id;
        if (kr.linkedAssetRecordIds.indexOf(id) === -1) {
            kr.linkedAssetRecordIds.unshift(id);
            kr.linkedAssetRecordIds = kr.linkedAssetRecordIds.slice(0, 20);
        }
    }

    function bootstrapP2() {
        if (!root.currentState) return;
        ensureOps();
        wrap('renderStep5', injectStep5);
        wrap('renderStep7', function () {
            injectStep7();
            decorateGantt();
        });
        wrap('renderAssetsStandaloneContent', injectAssetsCompare);
        wrap('saveBlueprintHistory', linkLatestAsset);
        if (root.currentState.activePanel === 'workflow') {
            if (root.currentState.step === 5) injectStep5();
        }
        wrapExcel();
        if (typeof root.isAssetsStandaloneMode === 'function' && root.isAssetsStandaloneMode()) injectAssetsCompare();
        if (root.currentState.step === 7) {
            injectStep7();
            decorateGantt();
        }
    }

    function wrapExcel() {
        const orig = root.exportCapabilityFrameworkExcel;
        if (!orig || orig.__p2Excel) return;
        root.exportCapabilityFrameworkExcel = function () {
            const book_append = typeof XLSX !== 'undefined' ? XLSX.utils.book_append_sheet : null;
            const writeFile = typeof XLSX !== 'undefined' ? XLSX.writeFile : null;
            if (book_append && writeFile) {
                const origAppend = XLSX.utils.book_append_sheet;
                const origWrite = XLSX.writeFile;
                XLSX.writeFile = function (wb, name) {
                    try { appendOpsSheets(wb); } catch (e) { console.error(e); }
                    return origWrite.apply(this, arguments);
                };
                try { return orig.apply(this, arguments); }
                finally { XLSX.writeFile = origWrite; XLSX.utils.book_append_sheet = origAppend; }
            }
            return orig.apply(this, arguments);
        };
        root.exportCapabilityFrameworkExcel.__p2Excel = true;
    }

    root.YouweiP2 = {
        captureMaturityRun: captureMaturityRun,
        afterSaveVisit: afterSaveVisit,
        hideVisitPlan: hideVisitPlanOverlay,
        setCheckpoint: function (id, status) {
            setCheckpoint(id, status);
            if (typeof root.renderStep7 === 'function') root.renderStep7();
        },
        checkpointStatus: checkpointStatus,
        extraSlides: extraSlides,
        exportOpsExcel: exportOpsExcel,
        toggleDeviate: function () {
            const panel = $('p2-deviate-panel');
            applyFold(panel, FOLD_KEYS.deviate, !foldOpen(FOLD_KEYS.deviate));
        },
        toggleOps: function () {
            const panel = $('p2-ops-panel');
            applyFold(panel, FOLD_KEYS.ops, !foldOpen(FOLD_KEYS.ops));
        },
        appendOpsSheets: appendOpsSheets,
        currentHeatStats: currentHeatStats,
        libraryStats: libraryStats
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootstrapP2);
    else bootstrapP2();
    window.addEventListener('load', function () { setTimeout(bootstrapP2, 0); });
})(window);
