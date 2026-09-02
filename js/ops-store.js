/**
 * B 端运营配置（本机浏览器）。C 端首页 / 工作台只读这里的覆盖层。
 * 内置文案与案例仍以 js/cases-data.js、工作台默认模型为底稿。
 */
(function (global) {
    const OPS_KEY = 'youwei_ops_v1';
    const CATALOG_KEY = 'youwei_ops_catalog_v1';

    function clone(v) {
        try { return JSON.parse(JSON.stringify(v)); } catch (e) { return v; }
    }

    function seedHome() {
        return {
            kicker: '从战略到执行',
            title: '把经营战略，解码成能落地的变革路标。',
            lead: '先对齐商业模式和业务规划，再审视业务痛点与能力差距，最后明确变革举措和路标规划。',
            audiences: [],
            methodTitle: '方法',
            methodLead: '定方向、建架构、抓落地。七步对齐战略到执行。',
            methodNote: '',
            industriesTitle: '',
            industriesLead: '',
            casesTitle: '场景',
            casesLead: '先选行业，对照卡住的那一环。',
            deliverablesTitle: '带走',
            deliverablesLead: '画布、架构、路标、底稿，评估后都能打开。',
            closeTitle: '把经营战略，解码成能落地的变革路标。',
            closeLead: '',
            ctaLabel: '开始评估',
            ctaHref: 'workshop.html?mode=pro',
            secondaryLabel: '看行业场景',
            secondaryHref: '#cases',
            footerLeft: '友为 · 从战略到路标',
            footerRight: '公开资料仅供行业对照，不构成业绩承诺。请以贵司经营数据核验。'
        };
    }

    function seedAssessment() {
        return { p0Cap: 3, heatTopN: 5, rules: null };
    }

    function seedAssets() {
        return {
            historyMax: 40,
            titlePattern: '{org} · {project} · {date}',
            allowClientDelete: true
        };
    }

    function seedAi() {
        return { endpoint: '', apiKey: '', model: '', provider: '' };
    }

    function emptyOps() {
        return {
            version: 1,
            updatedAt: '',
            home: seedHome(),
            method: null,
            industries: {},
            cases: {},
            deliverables: null,
            models: { templates: null, defaultByIndustry: { '3C': 'hwcb_5a' } },
            assessment: seedAssessment(),
            assets: seedAssets(),
            ai: seedAi()
        };
    }

    function load() {
        try {
            const raw = localStorage.getItem(OPS_KEY);
            if (!raw) return emptyOps();
            const o = JSON.parse(raw);
            const base = emptyOps();
            return {
                version: 1,
                updatedAt: o.updatedAt || '',
                home: Object.assign(base.home, o.home || {}),
                method: o.method || null,
                industries: o.industries && typeof o.industries === 'object' ? o.industries : {},
                cases: o.cases && typeof o.cases === 'object' ? o.cases : {},
                deliverables: o.deliverables || null,
                models: Object.assign(base.models, o.models || {}),
                assessment: Object.assign(base.assessment, o.assessment || {}),
                assets: Object.assign(base.assets, o.assets || {}),
                ai: Object.assign(base.ai, o.ai || {})
            };
        } catch (e) {
            return emptyOps();
        }
    }

    function stripAiKey(ops) {
        if (!ops || !ops.ai) return ops;
        if (ops.ai.apiKey) ops.ai = Object.assign({}, ops.ai, { apiKey: '' });
        return ops;
    }

    function save(next) {
        const cur = Object.assign(emptyOps(), load(), next || {});
        stripAiKey(cur);
        cur.version = 1;
        cur.updatedAt = new Date().toISOString();
        localStorage.setItem(OPS_KEY, JSON.stringify(cur));
        return cur;
    }

    function patch(partial) {
        const cur = load();
        Object.keys(partial || {}).forEach(function (k) {
            if (partial[k] == null) return;
            if (typeof partial[k] === 'object' && !Array.isArray(partial[k]) && typeof cur[k] === 'object' && cur[k]) {
                cur[k] = Object.assign({}, cur[k], partial[k]);
            } else {
                cur[k] = partial[k];
            }
        });
        return save(cur);
    }

    function resetAll() {
        localStorage.removeItem(OPS_KEY);
        return load();
    }

    function loadCatalog() {
        try {
            const raw = localStorage.getItem(CATALOG_KEY);
            if (!raw) return { templates: null, rules: null, at: '' };
            const o = JSON.parse(raw);
            return { templates: o.templates || null, rules: o.rules || null, at: o.at || '' };
        } catch (e) {
            return { templates: null, rules: null, at: '' };
        }
    }

    function saveCatalog(cat) {
        localStorage.setItem(CATALOG_KEY, JSON.stringify({
            templates: cat.templates || null,
            rules: cat.rules || null,
            at: cat.at || new Date().toISOString()
        }));
    }

    function ingestWorkshopCatalog(payload) {
        const cur = loadCatalog();
        if (cur.templates && Object.keys(cur.templates).length) return cur;
        if (!payload || !payload.templates) return cur;
        saveCatalog({
            templates: clone(payload.templates),
            rules: payload.rules ? clone(payload.rules) : null,
            at: new Date().toISOString()
        });
        return loadCatalog();
    }

    function getHome() {
        const seed = seedHome();
        const home = clone(load().home);
        if (home.ctaHref === 'workshop.html?mode=guide') home.ctaHref = 'workshop.html?mode=pro';
        if (!home.title || /先看清|营销服|收成能上会|能拍板的路标/.test(home.title)) home.title = seed.title;
        if (!home.kicker || /企业数字化转型评估|营销 · 零售 · 服务|营销、零售、服务/.test(home.kicker)) home.kicker = seed.kicker;
        if (!home.lead || /不必登录|再进入工作台|先看方法|用您自己的业务走一遍|近半年投哪三件|七步评估。近半年只压|怎么赚钱|能力差在哪|近半年先做/.test(home.lead)) home.lead = seed.lead;
        home.methodTitle = seed.methodTitle;
        if (!home.methodLead || /能力短板|经营全貌|四步|从画布收到路标|从画布看到路标/.test(home.methodLead)) home.methodLead = seed.methodLead;
        home.methodNote = seed.methodNote;
        if (!home.casesTitle || /同行通常|情景/.test(home.casesTitle)) home.casesTitle = seed.casesTitle;
        if (home.casesLead && /评估目标|六条情景/.test(home.casesLead)) home.casesLead = seed.casesLead;
        if (!home.closeTitle || /用您自己的业务|营销服|收成能上会|能拍板的路标/.test(home.closeTitle)) home.closeTitle = seed.closeTitle;
        home.closeLead = seed.closeLead;
        if (home.footerRight && /案例为行业情景|评估目标请用/.test(home.footerRight)) home.footerRight = seed.footerRight;
        if (!home.footerLeft || /把转型做成路标/.test(home.footerLeft)) home.footerLeft = seed.footerLeft;
        if (home.deliverablesLead && /游客|登录|本页展开|可讨论的材料|评估走完|四份具名|热力、三件/.test(home.deliverablesLead)) home.deliverablesLead = seed.deliverablesLead;
        if (!home.deliverablesTitle || /您将带走|评估结束后/.test(home.deliverablesTitle)) home.deliverablesTitle = seed.deliverablesTitle;
        home.secondaryLabel = seed.secondaryLabel;
        home.secondaryHref = seed.secondaryHref;
        home.audiences = [];
        return home;
    }

    function getMethod() {
        const seed = clone(global.WENDAO_METHOD_CELLS || global.WENDAO_STEPS || []);
        const ops = load();
        const first = ops.method && ops.method[0];
        const stale = !Array.isArray(ops.method)
            || ops.method.length !== seed.length
            || (first && /看清现状|排出优先/.test(first.dste || ''));
        if (stale) return seed;
        return ops.method.map(function (row, i) {
            const s = seed[i] || {};
            return Object.assign({}, s, row, {
                short: (row && row.short) || s.short,
                line: (row && row.line) || s.line,
                tags: (row && row.tags && row.tags.length) ? row.tags : s.tags
            });
        });
    }

    function mergeIndustry(seed, ov) {
        const out = Object.assign({}, seed, ov || {});
        if (ov && ov.published === false) out.published = false;
        else out.published = true;
        out.order = seed.order != null ? seed.order : out.order;
        out.name = seed.name;
        out.caseIds = seed.caseIds;
        out.casesLead = seed.casesLead;
        if (!ov || !ov.blurb || /下沉分货|车型上市、投放|同一套六/.test(ov.blurb)) out.blurb = seed.blurb;
        if (!ov || !ov.kicker || /送装与换新|线索到交车/.test(ov.kicker)) out.kicker = seed.kicker;
        return out;
    }

    function getIndustries(opts) {
        const includeHidden = !!(opts && opts.includeHidden);
        const ops = load();
        const seeds = global.WENDAO_INDUSTRIES || [];
        const list = seeds.map(function (ind, i) {
            const ov = ops.industries[ind.id] || {};
            const row = mergeIndustry(ind, ov);
            if (row.order == null) row.order = i;
            return row;
        });
        list.sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
        return includeHidden ? list : list.filter(function (x) { return x.published !== false; });
    }

    const STALE_CASE_KICKERS = {
        'GTM · IPMS': '产品操盘',
        'MKT · Campaign': '科学营销',
        '电商 · 5A': '品牌电商',
        '服务 · ITR': '亲和力服务',
        '渠道 · 交易': '渠道交易',
        '零售 · O2O': '全渠道零售',
        '旺季 · 供应': '旺季操盘',
        '换新 · 国补': '换新营销',
        '送装 · 履约': '送装电商',
        '安装 · 服务': '安装服务',
        '工程 · 精装': '工程交易',
        '专卖 · 场景': '场景零售',
        '成交 · 金融': '金融成交',
        '集客 · 线索': '集客营销',
        '到店 · 试驾': '到店零售',
        '售后 · 进厂': '进厂服务',
        '库存 · 返利': '经销交易',
        '交车 · 上牌': '交车交付'
    };

    function mergeCase(seed, ov) {
        const out = Object.assign({}, seed);
        if (!ov) {
            out.published = true;
            return out;
        }
        ['title', 'kicker', 'subtitle', 'tagline', 'situation', 'blurb'].forEach(function (k) {
            if (ov[k] != null && String(ov[k]).trim()) out[k] = ov[k];
        });
        if (STALE_CASE_KICKERS[out.kicker]) out.kicker = seed.kicker || STALE_CASE_KICKERS[out.kicker];
        out.published = ov.published !== false;
        if (ov.order != null) out.order = ov.order;
        return out;
    }

    function getCases(opts) {
        const includeHidden = !!(opts && opts.includeHidden);
        const ops = load();
        const seeds = global.WENDAO_CASES || [];
        const list = seeds.map(function (c, i) {
            const row = mergeCase(c, ops.cases[c.id]);
            if (row.order == null) row.order = i;
            return row;
        });
        list.sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
        return includeHidden ? list : list.filter(function (x) { return x.published !== false; });
    }

    function getCasesByIndustry(industryId) {
        const industries = getIndustries();
        const ind = industries.find(function (x) { return x.id === String(industryId || '').trim(); }) || industries[0];
        if (!ind) return [];
        const byId = {};
        getCases().forEach(function (c) { byId[c.id] = c; });
        const ids = ind.caseIds && ind.caseIds.length
            ? ind.caseIds
            : (global.getWendaoCasesByIndustry ? global.getWendaoCasesByIndustry(ind.id).map(function (c) { return c.id; }) : []);
        return ids.map(function (id) { return byId[id]; }).filter(Boolean);
    }

    function getDeliverables() {
        const seed = clone(global.WENDAO_DELIVERABLES || []);
        const ops = load();
        let list = (Array.isArray(ops.deliverables) && ops.deliverables.length) ? clone(ops.deliverables) : seed;
        const remap = {
            '汇报稿与董事会包': '商业画布',
            '投资规划': '商业画布',
            '上会材料': '商业画布',
            '能力短板图': '能力架构',
            '能力视图': '能力架构',
            '能力热力': '能力架构',
            '变革节奏图': '变革路标',
            '变革规划': '变革路标',
            '可下载的评估底稿': '评估底稿',
            '评估方案': '评估底稿'
        };
        list = list.map(function (d) {
            const s = seed.find(function (x) { return x.id === d.id; });
            if (remap[d.title]) d.title = remap[d.title];
            if (s) {
                if (s.page) d.page = s.page;
                if (s.image) d.image = s.image;
                if (s.figure) d.figure = s.figure;
                if (s.blurb) d.blurb = s.blurb;
                if (s.title) d.title = s.title;
                if (s.kicker) d.kicker = s.kicker;
                if (s.use) d.use = s.use;
                d.href = s.href || ('deliverable.html?id=' + encodeURIComponent(d.id));
            } else {
                d.href = d.href || ('deliverable.html?id=' + encodeURIComponent(d.id));
            }
            return d;
        });
        return list;
    }

    function getAssessment() {
        return clone(load().assessment);
    }

    function getAssets() {
        return clone(load().assets);
    }

    function getAi() {
        const ai = clone(load().ai) || seedAi();
        ai.apiKey = '';
        return ai;
    }

    function getTemplates() {
        const ops = load();
        if (ops.models && ops.models.templates && Object.keys(ops.models.templates).length) {
            return clone(ops.models.templates);
        }
        const cat = loadCatalog();
        return cat.templates ? clone(cat.templates) : null;
    }

    function getDefaultRules() {
        const ops = load();
        if (ops.assessment && Array.isArray(ops.assessment.rules) && ops.assessment.rules.length) {
            return clone(ops.assessment.rules);
        }
        const cat = loadCatalog();
        return cat.rules ? clone(cat.rules) : null;
    }

    function applyToWorkshop(state) {
        if (!state) return;
        const tpls = getTemplates();
        const ops = load();
        if (tpls) state.templates = tpls;
        const rules = getDefaultRules();
        if (rules && rules.length) state.rules = rules;
        if (ops.models && ops.models.defaultByIndustry && ops.models.defaultByIndustry[state.workflowIndustry]) {
            const pref = ops.models.defaultByIndustry[state.workflowIndustry];
            if (state.templates && state.templates[pref]) state.selectedTemplateId = pref;
        }
    }

    function wrapCaseLookup() {
        const orig = global.getWendaoCaseById;
        if (!orig || orig.__opsWrapped) return;
        global.getWendaoCaseById = function (id) {
            const item = orig(id);
            if (!item) return null;
            const ops = load();
            const merged = mergeCase(item, ops.cases[item.id]);
            if (merged.published === false) return null;
            return merged;
        };
        global.getWendaoCaseById.__opsWrapped = true;
    }

    function exportPack() {
        const ops = stripAiKey(clone(load()));
        return JSON.stringify({ ops: ops, catalog: loadCatalog() }, null, 2);
    }

    function importPack(raw) {
        const o = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (!o || !o.ops) throw new Error('不是有效的运营包');
        save(stripAiKey(o.ops));
        if (o.catalog) saveCatalog(o.catalog);
        return load();
    }

    wrapCaseLookup();

    global.YouweiOps = {
        load: load,
        save: save,
        patch: patch,
        resetAll: resetAll,
        getHome: getHome,
        getMethod: getMethod,
        getIndustries: getIndustries,
        getCases: getCases,
        getCasesByIndustry: getCasesByIndustry,
        getDeliverables: getDeliverables,
        getDeliverableById: function (id) {
            const list = getDeliverables();
            return list.find(function (d) { return d.id === String(id || '').trim(); }) || null;
        },
        getAssessment: getAssessment,
        getAssets: getAssets,
        getAi: getAi,
        getTemplates: getTemplates,
        getDefaultRules: getDefaultRules,
        applyToWorkshop: applyToWorkshop,
        ingestWorkshopCatalog: ingestWorkshopCatalog,
        loadCatalog: loadCatalog,
        saveCatalog: saveCatalog,
        exportPack: exportPack,
        importPack: importPack,
        seedHome: seedHome
    };
})(window);
