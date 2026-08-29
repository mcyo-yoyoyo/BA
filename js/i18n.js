/**
 * 首页 / 带走页中英切换。语言记在本机。
 */
(function (root) {
    const KEY = 'youwei_lang_v1';

    const zh = {
        docTitle: '友为 · 从战略到路标',
        navMethod: '方法',
        navScenes: '场景',
        navTake: '带走',
        cta: '开始评估',
        heroKicker: '从战略到执行',
        heroTitle: '把经营战略，解码成<br>能落地的变革路标。',
        heroLead: '先对齐商业模式和业务规划，再审视业务痛点与能力差距，<br>最后明确变革举措和路标规划。',
        seeScenes: '看行业场景',
        methodTitle: '方法',
        methodLead: '定方向、建架构、抓落地。七步对齐战略到执行。',
        bandAim: '定方向',
        bandArch: '建架构',
        bandLand: '抓落地',
        scenesTitle: '场景',
        takeTitle: '带走',
        takeLead: '画布、架构、路标、底稿，评估后都能打开。',
        open: '打开 →',
        thisScene: '这条场景 →',
        prev: '上一条',
        next: '下一条',
        modules: '业务模块',
        closeTitle: '把经营战略，解码成能落地的变革路标。',
        footerLeft: '友为 · 从战略到路标',
        footerRight: '公开报道与官网信息仅供对照，请用贵司经营数据确认。',
        sampleNote: '上图为空模板形态，数字请用贵司经营数据确认。',
        backTake: '返回',
        how1t: '先看形态',
        how1d: '下图是评估后的样子，不是愿望清单。',
        how2t: '对照贵司',
        how3t: '去评估生成',
        how3d: '开始评估后，这份材料从工作台直接打开或导出。',
        missing: '没有这份材料',
        home: '回到首页继续浏览。',
        loginKicker: '从战略到执行',
        loginTitle: '开始评估',
        loginLead: '先对齐商业模式和业务规划，再审视业务痛点与能力差距，最后明确变革举措和路标规划。',
        loginPath: '定方向 · 建架构 · 抓落地',
        loginUser: '账号',
        loginPass: '密码',
        loginUserPh: '请输入账号',
        loginPassPh: '请输入密码',
        loginErr: '账号或密码不正确。',
        loginCancel: '取消',
        loginSubmit: '开始评估',
        loginAdminKicker: '运营',
        loginAdminTitle: '进入管理台',
        loginAdminLead: '改首页、模型与评估规则。',
        loginAdminSubmit: '进入',
        leadKicker: '还没有账号',
        leadLead: '留下姓名与手机，我们会约评估。',
        leadNamePh: '姓名',
        leadPhonePh: '手机',
        leadNotePh: '行业与希望评估的卡点（选填）',
        leadSubmit: '留下',
        leadContact: '联系我们',
        leadOk: '已记下，我们会联系您。',
        leadNeed: '请留下姓名和手机。',
        steps: [
            { short: '画布', line: '战略怎么赚钱，先写清。' },
            { short: '流程', line: '慢、贵、险卡在哪一段。' },
            { short: '架构', line: '流程拆成能力与 BA、IA、AA、TA。' },
            { short: '差距', line: '组织、流程、数据、系统打分。' },
            { short: '热力', line: '红黄绿看见先补哪块。' },
            { short: '举措', line: '近半年只压先做的几件。' },
            { short: '路标', line: '排进月份，战略落到执行。' }
        ],
        ind: {
            '3c': { name: '消费电子', lead: '产品操盘、科学营销、品牌电商、亲和力服务、渠道交易、全渠道零售。' },
            auto: { name: '汽车', lead: '集客营销、到店零售、金融成交、交车交付、进厂服务、经销交易。' },
            appliance: { name: '家电', lead: '换新营销、送装电商、工程交易、安装服务、旺季操盘、场景零售。' }
        },
        dels: {
            briefing: {
                title: '商业画布', blurb: '客群、渠道、收入与成本，战略怎么说。', kicker: '带走 · 步骤 1',
                fig: '方法 · 用九宫格写清经营逻辑',
                how1t: '先读格子', how1d: '九宫格是经营逻辑的空模：客群、价值、渠道、关系、收支、资源、活动、合作与成本。',
                how2t: '再写成贵司', how2d: '格子留白，是为了按贵司业务填写，而不是套某一条行业故事。',
                how3t: '从画布往下走', how3d: '画布对齐后，才进入流程诊断、能力架构和路标。'
            },
            heatmap: {
                title: '能力架构', blurb: 'BA、IA、AA、TA，加上差距与热力，一张图看清补哪块。', kicker: '带走 · 步骤 3–5',
                fig: '方法 · 四域、四维打分、红黄绿排序',
                how1t: '先看四域', how1d: 'BA 业务、IA 数据、AA 应用、TA 技术，把能力放进同一张架构。',
                how2t: '再打四维', how2d: '组织、流程、数据、系统分别打分，看见短板在哪一层。',
                how3t: '热力只标先后', how3d: '红先补、黄纳入计划、绿观察。色块是方法，不是预设的业务模块。'
            },
            roadmap: {
                title: '变革路标', blurb: '甘特排出近、中、远期怎么走。', kicker: '带走 · 步骤 7',
                fig: '方法 · 近、中、远三档节奏',
                how1t: '先切时间', how1d: '近半年、一年、十八个月，战略先落到可排期的跨度。',
                how2t: '再压优先级', how2d: 'P0 先做、P1 承接、P2 铺开。条是举措档位，不是具体项目名。',
                how3t: '路标可改', how3d: '评估后可改跨度与子路标，避免写成愿望清单。'
            },
            export: {
                title: '评估底稿', blurb: '七步整份，可导出带回讨论。', kicker: '带走 · 资产快照',
                fig: '方法 · 七步连续归档',
                how1t: '一份七步', how1d: '画布、流程、架构、差距、热力、举措、路标，按方法顺序成册。',
                how2t: '可带走讨论', how2d: '导出的是整份快照，方便会后对照，而不是单页摘要。',
                how3t: '数字后填', how3d: '模板只定结构，经营数字用贵司数据回写。'
            }
        },
        gapHead: ['能力域', '组织', '流程', '数据', '系统'],
        gapRows: [
            ['经营主链', '—', '—', '—', '—'],
            ['运营支撑', '—', '—', '—', '—'],
            ['使能基础', '—', '—', '—', '—']
        ],
        heatTiles: [
            { t: '优先短板', d: '红 · 先补' },
            { t: '计划事项', d: '黄 · 纳入计划' },
            { t: '稳态观察', d: '绿 · 观察' }
        ],
        ganttAxis: ['近半年', '一年', '十八个月'],
        ganttRows: [
            { k: 'P0', d: '近半年先做 · 卡住经营的能力' },
            { k: 'P1', d: '中期承接 · 组织与系统跟上' },
            { k: 'P2', d: '远期铺开 · 机制固化与复盘' }
        ],
        fourA: [
            { k: 'BA', t: '业务架构', d: '能力块怎么拆' },
            { k: 'IA', t: '数据架构', d: '口径能否算清' },
            { k: 'AA', t: '应用架构', d: '系统怎么托住' },
            { k: 'TA', t: '技术架构', d: '现网能否承载' }
        ],
        bmc: [
            ['kp', '重要合作'],
            ['ka', '关键业务'],
            ['vp', '价值主张'],
            ['cr', '客户关系'],
            ['cs', '客户细分'],
            ['kr', '核心资源'],
            ['ch', '渠道通路'],
            ['cost', '成本结构'],
            ['rev', '收入来源']
        ]
    };

    const en = {
        docTitle: 'Yoway · Strategy to roadmap',
        navMethod: 'Method',
        navScenes: 'Scenarios',
        navTake: 'Takeaways',
        cta: 'Start',
        heroKicker: 'Strategy to execution',
        heroTitle: 'Decode strategy into<br>a change roadmap that lands.',
        heroLead: 'Align the business model and plan first, then examine pain points and capability gaps,<br>and finally lock the change moves and roadmap.',
        seeScenes: 'Browse scenarios',
        methodTitle: 'Method',
        methodLead: 'Set direction, build architecture, land change. Seven steps from strategy to execution.',
        bandAim: 'Direction',
        bandArch: 'Architecture',
        bandLand: 'Landing',
        scenesTitle: 'Scenarios',
        takeTitle: 'Takeaways',
        takeLead: 'Canvas, architecture, roadmap, dossier — open after the assessment.',
        open: 'Open →',
        thisScene: 'This scenario →',
        prev: 'Previous',
        next: 'Next',
        modules: 'Modules',
        closeTitle: 'Decode strategy into a change roadmap that lands.',
        footerLeft: 'Yoway · Strategy to roadmap',
        footerRight: 'Public sources are for contrast. Confirm with your own operating data.',
        sampleNote: 'Empty template. Confirm figures with your own data.',
        backTake: 'Back',
        how1t: 'See the form',
        how1d: 'The figure below is the output shape after assessment, not a wish list.',
        how2t: 'Map to your business',
        how3t: 'Generate it',
        how3d: 'Start the assessment to open or export this from the workbench.',
        missing: 'Material not found',
        home: 'Return home to continue.',
        loginKicker: 'Strategy to execution',
        loginTitle: 'Start',
        loginLead: 'Align the business model and plan, examine pain points and capability gaps, then lock the change moves and roadmap.',
        loginPath: 'Direction · Architecture · Landing',
        loginUser: 'Account',
        loginPass: 'Password',
        loginUserPh: 'Account',
        loginPassPh: 'Password',
        loginErr: 'Account or password is incorrect.',
        loginCancel: 'Cancel',
        loginSubmit: 'Start',
        loginAdminKicker: 'Ops',
        loginAdminTitle: 'Admin',
        loginAdminLead: 'Home, models and assessment rules.',
        loginAdminSubmit: 'Enter',
        leadKicker: 'No account yet',
        leadLead: 'Leave a name and mobile. We will schedule an assessment.',
        leadNamePh: 'Name',
        leadPhonePh: 'Mobile',
        leadNotePh: 'Industry and the stuck link (optional)',
        leadSubmit: 'Leave',
        leadContact: 'Contact us',
        leadOk: 'Noted. We will be in touch.',
        leadNeed: 'Name and mobile, please.',
        steps: [
            { short: 'Canvas', line: 'How the business makes money.' },
            { short: 'Flow', line: 'Where it is slow, costly, or risky.' },
            { short: 'Arch', line: 'Capabilities plus BA, IA, AA, TA.' },
            { short: 'Gap', line: 'Org, process, data, systems.' },
            { short: 'Heat', line: 'Red first, then yellow, then green.' },
            { short: 'Moves', line: 'Few bets for the next six months.' },
            { short: 'Road', line: 'Strategy placed on a timeline.' }
        ],
        ind: {
            '3c': { name: 'Consumer electronics', lead: 'Product ops, marketing, brand commerce, service, trade, retail.' },
            auto: { name: 'Auto', lead: 'Lead marketing, showroom retail, financed deals, handover, workshop service, dealer trade.' },
            appliance: { name: 'Appliances', lead: 'Trade-in marketing, delivery commerce, project trade, install service, peak-season ops, scene retail.' }
        },
        dels: {
            briefing: {
                title: 'Business canvas', blurb: 'Customers, channels, revenue and cost — how strategy is said.', kicker: 'Takeaway · Step 1',
                fig: 'Method · nine blocks for how the business works',
                how1t: 'Read the grid', how1d: 'An empty canvas: customers, value, channels, relationships, revenue, resources, activities, partners, cost.',
                how2t: 'Write yours', how2d: 'Cells stay blank so you fill your own business, not a borrowed industry story.',
                how3t: 'Then go on', how3d: 'After the canvas is aligned, flow, architecture and roadmap follow.'
            },
            heatmap: {
                title: 'Capability architecture', blurb: 'BA, IA, AA, TA, plus gaps and heat — what to fix first.', kicker: 'Takeaway · Steps 3–5',
                fig: 'Method · four domains, four scores, red-yellow-green',
                how1t: 'Four domains', how1d: 'BA business, IA information, AA application, TA technology — one architecture for capabilities.',
                how2t: 'Four scores', how2d: 'Org, process, data, systems. See which layer is thin.',
                how3t: 'Heat is order', how3d: 'Red first, yellow next, green watch. Colors are method, not preset modules.'
            },
            roadmap: {
                title: 'Change roadmap', blurb: 'A Gantt for near, mid and later moves.', kicker: 'Takeaway · Step 7',
                fig: 'Method · near, mid and later cadence',
                how1t: 'Cut time', how1d: 'Six months, one year, eighteen months — strategy on a span you can schedule.',
                how2t: 'Set priority', how2d: 'P0 first, P1 next, P2 later. Bars are priority bands, not project names.',
                how3t: 'Keep it editable', how3d: 'Span and streams can change after assessment. Not a wish list.'
            },
            export: {
                title: 'Assessment pack', blurb: 'All seven steps, exportable for discussion.', kicker: 'Takeaway · Snapshot',
                fig: 'Method · seven steps in one pack',
                how1t: 'Seven in order', how1d: 'Canvas, flow, architecture, gap, heat, moves, roadmap — filed as one method.',
                how2t: 'Take it to the room', how2d: 'A full snapshot for discussion, not a one-page teaser.',
                how3t: 'Fill numbers later', how3d: 'The pack holds structure. Operating figures come from your data.'
            }
        },
        gapHead: ['Domain', 'Org', 'Process', 'Data', 'Systems'],
        gapRows: [
            ['Value chain', '—', '—', '—', '—'],
            ['Operations', '—', '—', '—', '—'],
            ['Enablers', '—', '—', '—', '—']
        ],
        heatTiles: [
            { t: 'Fix first', d: 'Red · now' },
            { t: 'Plan next', d: 'Yellow · schedule' },
            { t: 'Watch', d: 'Green · observe' }
        ],
        ganttAxis: ['6 months', '12 months', '18 months'],
        ganttRows: [
            { k: 'P0', d: 'Near term · capabilities that block the business' },
            { k: 'P1', d: 'Mid term · org and systems catch up' },
            { k: 'P2', d: 'Later · lock the mechanism and review' }
        ],
        fourA: [
            { k: 'BA', t: 'Business architecture', d: 'How capabilities are cut' },
            { k: 'IA', t: 'Information architecture', d: 'Can the numbers reconcile' },
            { k: 'AA', t: 'Application architecture', d: 'Which systems hold it' },
            { k: 'TA', t: 'Technology architecture', d: 'Can the stack carry it' }
        ],
        bmc: [
            ['kp', 'Key partners'],
            ['ka', 'Key activities'],
            ['vp', 'Value proposition'],
            ['cr', 'Customer relationships'],
            ['cs', 'Customer segments'],
            ['kr', 'Key resources'],
            ['ch', 'Channels'],
            ['cost', 'Cost structure'],
            ['rev', 'Revenue streams']
        ]
    };

    function lang() {
        try { return localStorage.getItem(KEY) === 'en' ? 'en' : 'zh'; } catch (e) { return 'zh'; }
    }

    function setLang(next) {
        try { localStorage.setItem(KEY, next === 'en' ? 'en' : 'zh'); } catch (e) { /* ignore */ }
    }

    function dict() {
        return lang() === 'en' ? en : zh;
    }

    function t(key) {
        const d = dict();
        return d[key] != null ? d[key] : (zh[key] != null ? zh[key] : key);
    }

    function applyStatic(scope) {
        const rootEl = scope || document;
        rootEl.querySelectorAll('[data-i18n]').forEach(function (el) {
            const v = t(el.getAttribute('data-i18n'));
            if (typeof v === 'string') el.textContent = v;
        });
        rootEl.querySelectorAll('[data-i18n-html]').forEach(function (el) {
            const v = t(el.getAttribute('data-i18n-html'));
            if (typeof v === 'string') el.innerHTML = v;
        });
        document.documentElement.lang = lang() === 'en' ? 'en' : 'zh-CN';
        const sw = document.getElementById('lang-sw');
        if (sw) {
            sw.textContent = lang() === 'en' ? 'CN' : 'EN';
            sw.setAttribute('aria-label', lang() === 'en' ? 'Switch to Chinese' : 'Switch to English');
        }
        if (t('docTitle') && !/deliverable|case/i.test(location.pathname)) document.title = t('docTitle');
        if (root.YouweiAuth && typeof root.YouweiAuth.syncModal === 'function') root.YouweiAuth.syncModal();
    }

    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
    }

    function bmcInner(mini) {
        const by = {};
        (dict().bmc || []).forEach(function (pair) { by[pair[0]] = pair[1]; });
        const head = mini
            ? ''
            : `<div class="bmc-head"><b>${esc(lang() === 'en' ? 'Business model canvas' : '商业模式画布')}</b><i>BMC</i></div>`;
        const keys = ['kp', 'ka', 'vp', 'cr', 'cs', 'kr', 'ch', 'cost', 'rev'];
        return `${head}<div class="bmc-grid">${keys.map(function (k) {
            return `<article class="bmc-cell ${k}"><span>${esc(by[k] || '')}</span></article>`;
        }).join('')}</div>`;
    }

    function bindToggle(onChange) {
        const sw = document.getElementById('lang-sw');
        if (!sw || sw._bound) return;
        sw._bound = true;
        sw.addEventListener('click', function () {
            setLang(lang() === 'en' ? 'zh' : 'en');
            applyStatic();
            if (typeof onChange === 'function') onChange();
        });
    }

    root.YouweiI18n = {
        lang: lang,
        setLang: setLang,
        t: t,
        dict: dict,
        applyStatic: applyStatic,
        bindToggle: bindToggle,
        bmcInner: bmcInner
    };
})(typeof window !== 'undefined' ? window : globalThis);
