/**
 * P0 信任层：项目头条、演示预填、AI 回写版本与撤回。
 * 依赖 workshop.html 全局函数与 currentState。
 */
(function (root) {
    const SLICE_KEYS = [
        'bmc', 'bmcReport', 'workflowIndustry', 'valueStreamName', 'vsDimWeights',
        'vsSelectedStageId', 'vsStages', 'selectedTemplateId', 'capabilityFramework',
        'initiatives', 'itFeatures', 'roadmapStartYm', 'roadmapMonths', 'roadmapExpandedIniIds', 'architecture4a'
    ];

    function $(id) { return document.getElementById(id); }

    function studioQuery() {
        try { return new URLSearchParams(location.search); } catch (e) { return new URLSearchParams(); }
    }

    function captureWorkflowSlice() {
        const state = root.currentState;
        if (!state) return null;
        const snap = {};
        SLICE_KEYS.forEach((k) => {
            try { snap[k] = JSON.parse(JSON.stringify(state[k])); } catch (e) { snap[k] = state[k]; }
        });
        return snap;
    }

    function restoreWorkflowSlice(snap) {
        const state = root.currentState;
        if (!state || !snap) return;
        SLICE_KEYS.forEach((k) => {
            if (snap[k] === undefined) return;
            try { state[k] = JSON.parse(JSON.stringify(snap[k])); } catch (e) { state[k] = snap[k]; }
        });
        if (typeof root.renderNav === 'function') root.renderNav();
        if (typeof root.renderStepProgress === 'function') root.renderStepProgress();
        if (typeof root.renderStep === 'function') root.renderStep();
        if (typeof renderEngagementChrome === 'function') renderEngagementChrome();
    }

    function pushPatchVersion(summary, beforeSlice) {
        const state = root.currentState;
        if (!state || !beforeSlice) return;
        if (!Array.isArray(state.patchHistory)) state.patchHistory = [];
        state.patchHistory.push({
            id: Date.now(),
            ts: new Date().toISOString(),
            summary: String(summary || '工作流回写'),
            snapshot: beforeSlice
        });
        if (state.patchHistory.length > 12) state.patchHistory = state.patchHistory.slice(-12);
        renderPatchUndoBar();
    }

    function undoLastPatch() {
        const state = root.currentState;
        if (!state || !state.patchHistory || !state.patchHistory.length) {
            if (typeof root.toast === 'function') root.toast('没有可撤回的回写', 'error');
            return;
        }
        const last = state.patchHistory.pop();
        state.lastAiWrite = null;
        restoreWorkflowSlice(last.snapshot);
        renderPatchUndoBar();
        if (typeof root.toast === 'function') root.toast('已撤回上一次 YOWAY 写入：' + (last.summary || '上一版'));
    }

    function hidePatchUndoBar() {
        const bar = $('p0-undo-bar');
        if (bar) {
            bar.classList.remove('is-on');
            bar.innerHTML = '';
        }
    }

    function escBar(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function renderPatchUndoBar() {
        const hist = (root.currentState && root.currentState.patchHistory) || [];
        let bar = $('p0-undo-bar');
        if (!hist.length) {
            hidePatchUndoBar();
            return;
        }
        if (!bar) {
            bar = document.createElement('div');
            bar.id = 'p0-undo-bar';
            document.body.appendChild(bar);
        }
        const last = hist[hist.length - 1];
        const summary = String(last.summary || '上一版').slice(0, 36);
        bar.className = 'is-on';
        bar.innerHTML = '<span>可撤销上一次 YOWAY 写入 · ' + escBar(summary) + '</span>' +
            '<button type="button" id="p0-undo-go">撤销</button>' +
            '<button type="button" id="p0-undo-hide">收起</button>';
        const go = bar.querySelector('#p0-undo-go');
        const hide = bar.querySelector('#p0-undo-hide');
        if (go) go.onclick = undoLastPatch;
        if (hide) hide.onclick = hidePatchUndoBar;
    }

    function applyEngagement(partial, opts) {
        const state = root.currentState;
        if (!state) return;
        if (!state.workspaceMeta || typeof state.workspaceMeta !== 'object') state.workspaceMeta = {};
        const wm = state.workspaceMeta;
        const onlyEmpty = !!(opts && opts.onlyEmpty);
        Object.keys(partial || {}).forEach((k) => {
            const val = partial[k] != null ? String(partial[k]).trim() : '';
            if (!val) return;
            if (onlyEmpty && String(wm[k] || '').trim()) return;
            wm[k] = val;
        });
    }

    function seedEngagement(partial) {
        applyEngagement(partial, { onlyEmpty: true });
    }

    function applyIndustryFromQuery() {
        const q = studioQuery();
        const industry = q.get('industry');
        if (industry && root.WORKFLOW_INDUSTRIES && root.WORKFLOW_INDUSTRIES.indexOf(industry) !== -1) {
            root.currentState.workflowIndustry = industry;
        }
    }

    function seedFromCaseOrDemo() {
        const q = studioQuery();
        const caseId = q.get('case') || '';
        const mode = q.get('mode') || '';
        const item = root.getWendaoCaseById && caseId ? root.getWendaoCaseById(caseId) : null;
        if (item) {
            seedEngagement({
                organizationName: '示例企业（消费电子）',
                businessUnit: '中国区营销与服务',
                projectName: item.title,
                planningHorizon: '2026–2027',
                sponsor: '业务负责人'
            });
            if (mode === 'demo') applyEngagement({ confidentiality: '体验预览' });
        } else if (mode === 'demo') {
            seedEngagement({
                organizationName: '示例企业（消费电子）',
                businessUnit: '中国区营销与服务',
                projectName: '营销与服务数字化评估',
                planningHorizon: '2026–2027',
                sponsor: '业务负责人',
                confidentiality: '体验预览'
            });
        }
    }

        function renderEngagementChrome() {
        const bar = $('p0-engage-bar');
        if (bar) {
            bar.style.display = 'none';
            bar.innerHTML = '';
        }
        if (typeof root.syncHeaderOffset === 'function') root.syncHeaderOffset();
    }

    function wrapPatchApply() {
        const orig = root.applyWorkflowPatchObject;
        if (!orig || orig.__p0Wrapped) return;
        root.applyWorkflowPatchObject = function (wp) {
            const before = captureWorkflowSlice();
            const r = orig(wp);
            if (r && r.ok) {
                pushPatchVersion(r.summary || '对话写入', before);
                if (typeof root.markAiWrite === 'function') root.markAiWrite('dialog', r.summary || '当前步骤');
            }
            return r;
        };
        root.applyWorkflowPatchObject.__p0Wrapped = true;
    }

    function wrapBmcDraft() {
        const orig = root.refineBmcFromUserText;
        if (!orig || orig.__p0Wrapped) return;
        root.refineBmcFromUserText = function (msg) {
            const before = captureWorkflowSlice();
            const ok = orig(msg);
            if (ok) {
                pushPatchVersion('本地草稿 · 画布', before);
                if (typeof root.markAiWrite === 'function') root.markAiWrite('draft', '画布');
            }
            return ok;
        };
        root.refineBmcFromUserText.__p0Wrapped = true;
    }

    function bootstrapP0Trust() {
        if (!root.currentState) return;
        if (typeof root.ensureArchitectureEvolutionDefaults === 'function') {
            root.ensureArchitectureEvolutionDefaults();
        }
        applyIndustryFromQuery();
        seedFromCaseOrDemo();
        renderEngagementChrome();
        wrapPatchApply();
        wrapBmcDraft();
        renderPatchUndoBar();
    }

    function afterStudioReady() {
        renderEngagementChrome();
        renderPatchUndoBar();
    }

    root.captureWorkflowSlice = captureWorkflowSlice;
    root.pushPatchVersion = pushPatchVersion;
    root.undoLastPatch = undoLastPatch;
    root.renderPatchUndoBar = renderPatchUndoBar;
    root.hidePatchUndoBar = hidePatchUndoBar;
    root.renderEngagementChrome = renderEngagementChrome;
    root.bootstrapP0Trust = bootstrapP0Trust;
    root.seedEngagement = seedEngagement;
    root.applyEngagement = applyEngagement;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootstrapP0Trust);
    } else {
        bootstrapP0Trust();
    }
    window.addEventListener('load', function () {
        setTimeout(afterStudioReady, 0);
    });
})(window);
