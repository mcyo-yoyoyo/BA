/**
 * 首页 / 带走页中英切换。语言记在本机。
 */
(function (root) {
    const KEY = 'youwei_lang_v1';

    const zh = {
        docTitle: '友为 · 从战略到路标',
        navMethod: '诊断方法',
        navScenes: '行业案例',
        navTake: '评估成果',
        cta: '唤醒 YOWAY',
        ctaShort: 'YOWAY',
        wakeVerb: '唤醒',
        heroKicker: '从战略到执行',
        heroTitle: '把经营战略，解码成<br>能落地的变革路标。',
        heroLead: '先对齐商业模式和业务规划，再审视业务痛点与能力差距，<br>最后明确变革举措和路标规划。',
        heroNote: '本站可浏览行业案例并登录试用。模型助手与完整交付请用桌面版。',
        footerLegal: '使用与隐私',
        footerInstall: '安装说明',
        seeScenes: '看行业案例',
        methodTitle: '诊断方法',
        methodLead: '先厘清商业模式，再定位流程中的慢、贵、险与能力差距，最后排入月份计划。',
        bandAim: '定方向',
        bandArch: '建架构',
        bandLand: '抓落地',
        scenesTitle: '行业案例',
        scenesLead: '先确认所属行业课题，再看评估如何拆解。',
        takeTitle: '评估成果',
        takeLead: '规划完成后生成四份材料：商业模式、能力差距、优先事项与整份底稿。以下为形态。',
        open: '打开 →',
        thisScene: '打开这条 →',
        prev: '上一条',
        next: '下一条',
        modules: '业务模块',
        closeTitle: '把经营战略，解码成能落地的变革路标。',
        footerLeft: '友为 · 从战略到路标',
        footerRight: '公开资料仅供行业对照，不构成业绩承诺。请以贵司经营数据核验。',
        sampleNote: '规划完成后生成。以下为形态，数字请以贵司经营数据核验。',
        backTake: '返回',
        missing: '没有这份材料',
        home: '回到首页继续浏览。',
        loginKicker: '从战略到执行',
        loginTitle: '唤醒 YOWAY',
        loginLead: '登录后进入评估：先厘清商业模式，再定位流程与能力差距，最后排入月份计划。',
        loginIdle: '已因闲置退出，请重新登录。',
        loginPath: '定方向 · 建架构 · 抓落地',
        loginUser: '账号',
        loginPass: '密码',
        loginUserPh: '请输入账号',
        loginPassPh: '请输入密码',
        loginErr: '账号或密码不正确。',
        loginCancel: '取消',
        loginSubmit: '进入评估',
        loginAdminKicker: '运营',
        loginAdminTitle: '进入管理台',
        loginAdminLead: '改首页、模型与评估规则。',
        loginAdminSubmit: '进入',
        leadKicker: '还没有账号',
        leadLead: '可留下姓名与手机，供顾问在本机查看。公开网页不会向友为发送线索。',
        leadNamePh: '姓名',
        leadPhonePh: '手机',
        leadNotePh: '行业与希望评估的卡点（选填）',
        leadSubmit: '留下',
        leadContact: '联系我们',
        leadOk: '已记在这台电脑。顾问可在管理台导出。需要对接请直接联系顾问。',
        leadNeed: '请留下姓名和手机。',
        steps: [
            { short: '画布', line: '先厘清商业模式与收入来源。' },
            { short: '流程', line: '定位流程中的慢、贵、险。' },
            { short: '架构', line: '明确所需能力，以及系统与数据如何支撑。' },
            { short: '差距', line: '识别组织、流程、数据与系统差距。' },
            { short: '热力', line: '用红黄绿标出优先补齐项。' },
            { short: '举措', line: '近半年只压优先事项。' },
            { short: '路标', line: '排入月份，战略落到执行。' }
        ],
        ind: {
            '3c': { name: '消费电子', lead: '产品操盘、科学营销、品牌电商、亲和力服务、渠道交易、全渠道零售。' },
            auto: { name: '汽车', lead: '集客营销、到店零售、金融成交、交车交付、进厂服务、经销交易。' },
            appliance: { name: '家电', lead: '换新营销、送装电商、工程交易、安装服务、旺季操盘、场景零售。' }
        },
        dels: {
            briefing: {
                title: '商业画布', blurb: '一张图写清：服务谁、如何创造价值、收入从何而来、成本在何处。',
                kicker: '评估成果 · 第一步',
                audience: '适合需要先厘清商业模式的团队',
                situation: '尚未写清付费对象与回本节奏时，后续流程与系统讨论容易各说各话。',
                goal: '九个格子写的是贵司自身业务，而不是套用对照品牌的故事。',
                fig: '空模板：九个格子，用于填写贵司商业模式',
                how1t: '这张图是什么', how1d: '九个格子：客群、价值、渠道、关系、收入、资源、活动、合作、成本。用于描述贵司如何创造与获取收入。',
                how2t: '评估时如何使用', how2d: '按贵司业务填写，不要抄写行业案例中的对照品牌。格子对齐后，后续步骤才有依据。',
                how3t: '完成后的下一步', how3d: '商业模式写清后，再看流程中的慢、贵、险，以及近半年优先事项。'
            },
            heatmap: {
                title: '能力架构', blurb: '把待补齐的能力展开，用颜色标出近半年优先项。',
                kicker: '评估成果 · 第三到五步',
                audience: '适合已识别痛点、但尚未确定优先补齐项的团队',
                situation: '团队能描述问题，却难以对齐：是组织不到位、流程中断、数据口径不一，还是系统无法支撑。',
                goal: '一张图标出短板所在层级：红色优先改进，黄色纳入计划，绿色持续观察。',
                fig: '空模板：四层架构、打分表、红黄绿优先级',
                how1t: '这张图是什么', how1d: '将所需能力放入同一张图：业务如何拆分、数据能否核算、系统如何支撑、现网能否承载。',
                how2t: '评估时如何使用', how2d: '组织、流程、数据、系统分别打分，定位短板所在层级，而不是笼统归因为系统问题。',
                how3t: '颜色表示优先级', how3d: '红：近半年优先。黄：纳入计划。绿：持续观察。颜色不是已达成的成绩。'
            },
            roadmap: {
                title: '变革路标', blurb: '近半年、一年、一年半，将优先事项排入月份。',
                kicker: '评估成果 · 第七步',
                audience: '适合需要将优先事项提交会议决策的负责人',
                situation: '事项清单很长，但缺少月份、责任人与先后顺序。',
                goal: '近半年只压优先事项，其余排入一年与一年半，可调整、可跟踪。',
                fig: '空模板：近、中、远三档时间条',
                how1t: '这张图是什么', how1d: '一条时间轴：近半年、一年、一年半。条表示先后，不是已经立项的项目名。',
                how2t: '评估时如何使用', how2d: '近期、中期、后期。每条可调整跨度，避免写成愿望清单。',
                how3t: '会后如何使用', how3d: '带到会上核对月份和责任人。数字与项目名用贵司数据填写。'
            },
            export: {
                title: '评估底稿', blurb: '七步汇成一份，可导出，可带入会议。',
                kicker: '评估成果 · 整份',
                audience: '适合需要将评估结果带离工作台、供多人审阅的人',
                situation: '评估分散在七个步骤中，会议上难以连续对照。',
                goal: '一份连续底稿：从商业模式到路标，结构先行，数字后填。',
                fig: '空模板：七步按顺序成册',
                how1t: '这份是什么', how1d: '画布、流程、架构、差距、优先级、优先事项、月份路标，按诊断顺序汇编。',
                how2t: '如何导出', how2d: '评估后从工作台导出整份快照，便于会后对照，不是一页口号。',
                how3t: '数字后填', how3d: '模板只定结构。成交、时长、人数等经营数字，用贵司经营数据回写。'
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
        fourA: [
            { k: 'BA', t: '业务架构', d: '能力如何拆分' },
            { k: 'IA', t: '数据架构', d: '口径能否核算' },
            { k: 'AA', t: '应用架构', d: '系统如何支撑' },
            { k: 'TA', t: '技术架构', d: '现网能否承载' }
        ],
        how1t: '先看形态',
        how1d: '下图是评估完成后的材料形态，不是愿望清单。',
        how2t: '按贵司业务填写',
        how3t: '进入评估生成',
        how3d: '开始评估后，可从工作台打开或导出这份材料。',
        tocPage: '本页',
        caseMissing: '没有这条案例',
        caseMissingLead: '返回首页继续浏览。',
        backHome: '返回首页',
        startCase: '按本案例启动评估',
        backCases: '返回',
        moreCases: '返回',
        caseNow: '行业现状',
        casePain: '关键痛点',
        caseGoal: '评估目标',
        caseFacts: '行业对照',
        casePath: '评估路径',
        caseDone: '预期成果',
        caseFit: '适用判断',
        caseStart: '开始评估',
        caseNowH2: '当前行业所处的经营局面',
        casePainH2: '问题通常出在协同与数据，而不只是系统',
        caseGoalH2: '评估要回答的问题，以及启动时机',
        caseFactsH2: '头部企业的公开做法',
        caseFactsNote: '对照用于评估，不是代言，也不是友为客户案例。数字请以贵司经营数据核验。',
        casePathH2: '七步评估如何拆解本案例',
        caseDoneH2: '近半年优先事项，以及经营上可见的变化',
        caseFitH2: '以下情形是否与贵司现状相符',
        caseFitLead: '请勾选与贵司现状相符的情形。勾选两项及以上，建议按本案例启动评估。',
        caseFitPicked: '已勾选 {n} 项',
        caseFitReady: '已达到启动建议。可进入评估。',
        caseStartH2: '用贵司的组织名称与经营数据改写',
        caseStartLead: '公开对照只说明行业可行。进入评估后，将按贵司的名称、责任人与经营数据，写成能力图与月份计划。',
        painOps: '业务运营',
        painOrg: '组织协同',
        painData: '数据与账实',
        painOrgFallback: '跨部门各自记录，检查依赖邮件与即时通讯。',
        painDataFallback: '口径不一致，现状与目标均难以核算。',
        goalCard: '评估目标',
        windowCard: '启动时机',
        metricNow: '当前常见情况',
        metricTarget: '目标状态',
        evConfirmed: '已确认',
        evAssumption: '评估目标，不是贵司成绩',
        evNote: '以下为评估目标，请以贵司数据核验。',
        phaseNear: '近期',
        phaseMid: '中期',
        phaseLater: '后期',
        caseSteps: [
            { n: '01', name: '厘清商业模式', hint: '商业画布' },
            { n: '02', name: '定位流程中的慢、贵、险', hint: '流程诊断' },
            { n: '03', name: '明确所需能力', hint: '能力架构' },
            { n: '04', name: '识别组织与系统差距', hint: '差距分析' },
            { n: '05', name: '确定近半年优先项', hint: '先后排序' },
            { n: '06', name: '形成可派工事项', hint: '先做清单' },
            { n: '07', name: '排入月份计划', hint: '变革路标' }
        ],
        delWhat: '成果说明',
        delHow: '使用方式',
        delLook: '模板形态',
        delStart: '开始评估',
        delWhatH2: '评估完成后生成的材料形态',
        delNotWhat: '使用边界',
        delNotWhatD: '空模板，用于评估填写，不是已验证的经营成绩。数字请以贵司经营数据核验。',
        delHowH2: '三项说明，再进入评估生成',
        delLookH2: '空模板示意',
        delStartH2: '用贵司的组织名称与经营数据填写',
        delStartLead: '行业案例用于选题，诊断方法说明路径。本成果需在评估中按贵司业务生成。',
        delMore: '返回',
        backOutputs: '返回',
        legalTitle: '使用与隐私',
        legalLead: '使用友为工作台前请阅读。公开网页用于浏览行业案例；完整评估、模型助手与过程册以桌面版或本机启动为准。',
        legalUseT: '使用约定',
        legalUse1: '本工具供顾问带场评估，不替代贵司决策，也不保证经营结果。',
        legalUse2: '过程册、底稿中的结论由当场填写的数据生成。公开资料仅供对照，数字请以贵司数据核验。',
        legalUse3: '未获书面授权，请勿转售或再分发软件、账号表或过程册模板。',
        legalUse4: '绑定授权后，请使用该客户的本机账号表；演示账号仅供未绑定的试用。',
        legalUse5: '授权到期后仍可查看本机底稿，但不能再生成新的过程册。',
        legalDataT: '数据存放位置',
        legalData1: '评估草稿、已保存底稿与线索默认只存在这台电脑的浏览器存储中，并按登录账号分开。',
        legalData2: '桌面版或本机启动时，线索还会追加到本机 data/leads.json，方便顾问导出。公开网页不会把线索发到友为。',
        legalData3: '模型 Key 只保留在本会话，退出或闲置退出即清除。请勿将 Key 提供给无关人员。',
        legalData4: '登录、保存、导出等操作记在本机操作日志，可从管理台导出。友为无法查看这份日志。',
        legalData5: '更换电脑、清除站点数据或卸载前，请先在管理台导出底稿、线索和需要带走的运营包。',
        legalNoT: '我们不收集什么',
        legalNo: '没有账号服务器，也不会自动把评估内容上传到友为。除非顾问自行导出或配置了本机线索接口，友为看不到画布、路标和手机号。',
        legalPackT: '过程册',
        legalPack: '过程册由工作台生成，版权归友为。可用于与客户讨论；不得将册子当作友为对第三方的担保或认证。',
        legalToInstall: '安装、升级与授权文件',
        installTitle: '安装、升级与授权',
        installLead: '桌面版是当前可完整使用的交付。公开网页适合浏览案例并登录试用本机工作台；模型助手需要桌面版或本机启动。',
        installH1: '安装',
        install1: '发给客户使用 Youwei-1.0.0-Setup.exe。双击安装后，桌面和开始菜单会出现「友为」。',
        install2: '安装包尚未做代码签名。Windows 可能提示「未知发布者」，选择「仍要运行」即可。',
        install3: '不必管理员权限，安装在当前用户目录。',
        installH2: '覆盖升级',
        install4: '再次运行新的 Setup 即可覆盖。本机底稿、线索、模型连接仍保留在这台电脑的浏览器存储中。',
        install5: '升级前如需换电脑，请先在管理台导出底稿和线索。',
        install6: '在「应用和功能」中卸载。卸载不会自动删除已导出的 HTML / Excel。',
        installH3: '每单授权',
        install7: '将 license.example.json 复制为站点目录下的 license.json，填写客户名称、到期日、授权码、席位数，以及可选的 home、brand / brandEn，并将 bound 设为 true。',
        install8: '绑定后，过程册封面、页脚和导航使用客户名称与域名；演示用客户端账号不可登录。请同时放置该客户的 js/accounts.local.js（仓库不收录）。',
        install9: '到期后仍可打开已保存底稿，但不能再在步骤 7 生成新过程册。',
        installH4: '本机软件清单',
        install10: '工作台样式在 css/workshop-tw.css，图标在 vendor/fontawesome/，表格在 js/xlsx.min.js。断网也可评估、可导出 Excel。',
        install11: '管理台闲置 15 分钟、工作台闲置 30 分钟会退出，并清除本会话的模型 Key。绝对会话最长 12 小时。',
        install12: '登录、保存过程册、导出导入记在本机操作日志，可在「评估底稿」导出。',
        installH5: '数据存放位置',
        install13: '评估草稿、底稿、线索、操作日志：这台电脑的浏览器存储，按登录账号分开。',
        install14: '桌面版留下的线索还会写入程序旁的 data/leads.json。可设置环境变量 LEAD_WEBHOOK，将线索 POST 到贵司表格或 CRM。',
        installToLegal: '使用与隐私',
        ganttRows: [
            { k: 'P0', d: '近半年优先 · 制约经营的能力' },
            { k: 'P1', d: '中期承接 · 组织与系统跟上' },
            { k: 'P2', d: '远期铺开 · 机制固化与复盘' }
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
        navMethod: 'Diagnosis',
        navScenes: 'Cases',
        navTake: 'Outputs',
        cta: 'Wake YOWAY',
        ctaShort: 'YOWAY',
        wakeVerb: 'Wake',
        heroKicker: 'Strategy to execution',
        heroTitle: 'Decode strategy into<br>a change roadmap that lands.',
        heroLead: 'Align the business model and plan first, then examine pain points and capability gaps,<br>and finally lock the change moves and roadmap.',
        heroNote: 'This site is for browsing and a local trial. Use the desktop app for the assistant and full delivery.',
        footerLegal: 'Terms & privacy',
        footerInstall: 'Install',
        seeScenes: 'Browse cases',
        methodTitle: 'Diagnosis',
        methodLead: 'Clarify the business model, locate slow, costly and risky steps, then place first moves on a calendar.',
        bandAim: 'Direction',
        bandArch: 'Architecture',
        bandLand: 'Landing',
        scenesTitle: 'Industry cases',
        scenesLead: 'Confirm the industry problem, then see how the assessment unpacks it.',
        takeTitle: 'Outputs',
        takeLead: 'Four materials are generated after planning: the business model, capability gaps, first moves, and the full pack. Below is the form only.',
        open: 'Open →',
        thisScene: 'Open this →',
        prev: 'Previous',
        next: 'Next',
        modules: 'Modules',
        closeTitle: 'Decode strategy into a change roadmap that lands.',
        footerLeft: 'Yoway · Strategy to roadmap',
        footerRight: 'Public sources are for industry contrast, not a performance claim. Verify with your operating data.',
        sampleNote: 'Generated after planning. Below is the form only. Verify numbers with your operating data.',
        backTake: 'Back',
        how1t: 'See the form',
        how1d: 'The figure below is the output shape after assessment, not a wish list.',
        how2t: 'Map to your business',
        how3t: 'Generate it',
        how3d: 'Start the assessment to open or export this from the workbench.',
        missing: 'Material not found',
        home: 'Return home to continue.',
        loginKicker: 'Strategy to execution',
        loginTitle: 'Wake YOWAY',
        loginLead: 'Sign in to assess: clarify the business model, locate process and capability gaps, then place first moves on a calendar.',
        loginIdle: 'Signed out after idle. Please sign in again.',
        loginPath: 'Direction · Architecture · Landing',
        loginUser: 'Account',
        loginPass: 'Password',
        loginUserPh: 'Account',
        loginPassPh: 'Password',
        loginErr: 'Account or password is incorrect.',
        loginCancel: 'Cancel',
        loginSubmit: 'Enter assessment',
        loginAdminKicker: 'Ops',
        loginAdminTitle: 'Admin',
        loginAdminLead: 'Home, models and assessment rules.',
        loginAdminSubmit: 'Enter',
        leadKicker: 'No account yet',
        leadLead: 'Leave a name and mobile for the facilitator on this computer. The public site does not send leads to Yoway.',
        leadNamePh: 'Name',
        leadPhonePh: 'Mobile',
        leadNotePh: 'Industry and the stuck link (optional)',
        leadSubmit: 'Leave',
        leadContact: 'Contact us',
        leadOk: 'Saved on this computer. Export it from the console. Contact your facilitator if you need a callback.',
        leadNeed: 'Name and mobile, please.',
        steps: [
            { short: 'Canvas', line: 'How the business makes money.' },
            { short: 'Flow', line: 'Where it is slow, costly, or risky.' },
            { short: 'Arch', line: 'What you must be able to do, and what systems hold it.' },
            { short: 'Gap', line: 'People, process, data, systems.' },
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
                title: 'Business canvas', blurb: 'One page: who pays, how you make money, where cash comes in, where cost sits.',
                kicker: 'Output · Step 1',
                audience: 'For teams that still need to say how the business makes money',
                situation: 'If who pays and how you recoup is unclear, later process and system talks will drift.',
                goal: 'Nine cells written as your business, not a borrowed industry story.',
                fig: 'Empty template: nine cells for your own business',
                how1t: 'What this is', how1d: 'Nine cells: customers, value, channels, relationships, revenue, resources, activities, partners, cost. Empty, for how you make money.',
                how2t: 'How you use it', how2d: 'Fill your own business. Do not copy a brand from the case pages.',
                how3t: 'What follows', how3d: 'Once the business is said, you can see where the flow is slow and what to fix first.'
            },
            heatmap: {
                title: 'Capability map', blurb: 'Lay out what must work, then color what to fix in the next six months.',
                kicker: 'Output · Steps 3–5',
                audience: 'For teams that feel the pain but cannot say what to fix first',
                situation: 'Everyone can name the pain, but not whether people, process, data, or systems are thin.',
                goal: 'One picture of which layer is thin: red first, yellow next, green watch.',
                fig: 'Empty template: four layers, scores, red-yellow-green',
                how1t: 'What this is', how1d: 'What you must be able to do, whether the numbers add up, what systems hold it, and whether the current stack can carry it.',
                how2t: 'How you use it', how2d: 'Score people, process, data, and systems separately. Not just “the system is bad”.',
                how3t: 'Color is order', how3d: 'Red: fix in six months. Yellow: schedule. Green: watch. Not proven results.'
            },
            roadmap: {
                title: 'Change roadmap', blurb: 'Six months, one year, eighteen months — what first, what next, on a calendar.',
                kicker: 'Output · Step 7',
                audience: 'For leaders who need a few first moves to take into a meeting',
                situation: 'The wish list is long, with no months, no owners, and no order.',
                goal: 'A few first moves in six months; the rest on a one-year and eighteen-month span you can change.',
                fig: 'Empty template: near, mid, later bars',
                how1t: 'What this is', how1d: 'A timeline: six months, one year, eighteen months. Bars are order, not named projects.',
                how2t: 'How you use it', how2d: 'First, next, later. Spans can change. Not a wish list.',
                how3t: 'After the meeting', how3d: 'Bring months and owners to the room. Names and figures come from your books.'
            },
            export: {
                title: 'Assessment pack', blurb: 'All seven steps in one file you can export and take to a meeting.',
                kicker: 'Output · Full pack',
                audience: 'For anyone who needs to take the assessment off the workbench',
                situation: 'The work sits in seven steps and is hard to walk through in a room.',
                goal: 'One continuous pack from how you make money to the roadmap. Structure now, figures later.',
                fig: 'Empty template: seven steps in order',
                how1t: 'What this is', how1d: 'Canvas, flow, map, gaps, order, first moves, roadmap — bound in diagnosis order.',
                how2t: 'How you take it', how2d: 'Export a full snapshot after assessment, not a one-page slogan.',
                how3t: 'Fill numbers later', how3d: 'The pack holds structure. Operating figures come from your own data.'
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
        ],
        how1t: 'See the form',
        how1d: 'The figure is the output shape after assessment, not a wish list.',
        how2t: 'Fill with your business',
        how3t: 'Generate in assessment',
        how3d: 'Start the assessment to open or export this from the workbench.',
        tocPage: 'On this page',
        caseMissing: 'Case not found',
        caseMissingLead: 'Return home to continue.',
        backHome: 'Back to home',
        startCase: 'Start with this case',
        backCases: 'Back',
        moreCases: 'Back',
        caseNow: 'Industry context',
        casePain: 'Key issues',
        caseGoal: 'Assessment goal',
        caseFacts: 'Industry contrast',
        casePath: 'Assessment path',
        caseDone: 'Expected outcome',
        caseFit: 'Fit check',
        caseStart: 'Start assessment',
        caseNowH2: 'The operating situation in this industry',
        casePainH2: 'Issues usually sit in coordination and data, not only systems',
        caseGoalH2: 'What the assessment must answer, and why now',
        caseFactsH2: 'How leading firms describe the work in public',
        caseFactsNote: 'Contrast is for assessment, not endorsement or a Yoway client story. Verify figures with your data.',
        casePathH2: 'How the seven steps unpack this case',
        caseDoneH2: 'What to move first in six months, and what the business should see',
        caseFitH2: 'Whether these conditions match your current state',
        caseFitLead: 'Check the conditions that match your current state. Two or more suggest starting this assessment.',
        caseFitPicked: '{n} selected',
        caseFitReady: 'Enough to start. Continue to assessment.',
        caseStartH2: 'Rewrite it with your name and operating data',
        caseStartLead: 'Public contrast only shows the industry can do it. In assessment, names, owners and figures become your capability map and monthly plan.',
        painOps: 'Operations',
        painOrg: 'Coordination',
        painData: 'Data and books',
        painOrgFallback: 'Teams keep separate records; checks stay in mail and chat.',
        painDataFallback: 'Definitions do not match; current state and target cannot be reconciled.',
        goalCard: 'Assessment goal',
        windowCard: 'Why now',
        metricNow: 'Common current state',
        metricTarget: 'Target state',
        evConfirmed: 'Confirmed',
        evAssumption: 'Assessment target, not your result',
        evNote: 'The figures below are assessment targets. Verify with your data.',
        phaseNear: 'Near',
        phaseMid: 'Mid',
        phaseLater: 'Later',
        caseSteps: [
            { n: '01', name: 'Clarify the business model', hint: 'Canvas' },
            { n: '02', name: 'Locate slow, costly and risky steps', hint: 'Flow' },
            { n: '03', name: 'Name the required capabilities', hint: 'Architecture' },
            { n: '04', name: 'Identify org and system gaps', hint: 'Gap' },
            { n: '05', name: 'Set six-month priorities', hint: 'Order' },
            { n: '06', name: 'Form assignable moves', hint: 'First list' },
            { n: '07', name: 'Place them on a calendar', hint: 'Roadmap' }
        ],
        delWhat: 'What it is',
        delHow: 'How to use it',
        delLook: 'Template form',
        delStart: 'Start assessment',
        delWhatH2: 'The material produced after assessment',
        delNotWhat: 'Boundary',
        delNotWhatD: 'An empty template for the assessment, not a proven result. Verify figures with your data.',
        delHowH2: 'Three notes, then generate it in assessment',
        delLookH2: 'Empty template',
        delStartH2: 'Fill it with your name and operating data',
        delStartLead: 'Cases help you pick the problem; the method shows the path. This output is generated in assessment from your business.',
        delMore: 'Back',
        backOutputs: 'Back',
        legalTitle: 'Terms and privacy',
        legalLead: 'Read this before using the Yoway workbench. The public site is for browsing cases. Full assessment, the assistant and process books require the desktop app or a local start.',
        legalUseT: 'Terms of use',
        legalUse1: 'The tool supports facilitated assessment. It does not replace your decisions or guarantee operating results.',
        legalUse2: 'Conclusions in books and packs come from data entered in the session. Public sources are for contrast. Verify figures with your data.',
        legalUse3: 'Do not resell or redistribute the software, account table or book templates without written permission.',
        legalUse4: 'After a bound license, use that client’s local account table. Demo accounts are for unbound trials only.',
        legalUse5: 'After expiry you can still open local packs, but you cannot generate a new process book.',
        legalDataT: 'Where data lives',
        legalData1: 'Drafts, saved packs and leads stay in this computer’s browser storage, split by account.',
        legalData2: 'On desktop or a local start, leads are also appended to data/leads.json for export. The public site does not send leads to Yoway.',
        legalData3: 'Model keys stay in this session and are cleared on sign-out or idle. Do not share keys with unrelated people.',
        legalData4: 'Sign-in, save and export are logged on this computer and can be exported from the console. Yoway cannot see that log.',
        legalData5: 'Before changing computers, clearing site data or uninstalling, export packs, leads and any ops bundle you need.',
        legalNoT: 'What we do not collect',
        legalNo: 'There is no account server and no automatic upload of assessment content to Yoway. Unless a facilitator exports or configures a local lead hook, Yoway cannot see your canvas, roadmap or phone number.',
        legalPackT: 'Process book',
        legalPack: 'The process book is generated by the workbench. Copyright stays with Yoway. You may share it for discussion. Do not treat it as a Yoway guarantee or certification to a third party.',
        legalToInstall: 'Install, upgrade and license files',
        installTitle: 'Install, upgrade and license',
        installLead: 'The desktop app is the complete delivery. The public site is for browsing cases and a local trial. The assistant needs the desktop app or a local start.',
        installH1: 'Install',
        install1: 'Send clients Youwei-1.0.0-Setup.exe. After a double-click install, Yoway appears on the desktop and Start menu.',
        install2: 'The installer is not code-signed. Windows may warn about an unknown publisher; choose Run anyway.',
        install3: 'Administrator rights are not required. It installs in the current user directory.',
        installH2: 'In-place upgrade',
        install4: 'Run the new Setup to overwrite. Packs, leads and model settings stay in this computer’s browser storage.',
        install5: 'If you will change computers before upgrade, export packs and leads from the console first.',
        install6: 'Uninstall from Apps and features. Uninstall does not delete exported HTML or Excel.',
        installH3: 'Per-engagement license',
        install7: 'Copy license.example.json to license.json in the site folder. Fill client name, expiry, code, seats, optional home and brand / brandEn, and set bound to true.',
        install8: 'After binding, book covers, footers and navigation use the client name and domain. Demo client accounts cannot sign in. Also place that client’s js/accounts.local.js (not kept in the repo).',
        install9: 'After expiry you can still open saved packs, but you cannot generate a new book at step 7.',
        installH4: 'What ships locally',
        install10: 'Workbench styles live in css/workshop-tw.css, icons in vendor/fontawesome/, tables in js/xlsx.min.js. Assessment and Excel export work offline.',
        install11: 'The console signs out after 15 minutes idle, the workbench after 30, and clears the session model key. Absolute session length is 12 hours.',
        install12: 'Sign-in, book save, export and import are logged on this computer and can be exported from the assessment pack.',
        installH5: 'Where data lives',
        install13: 'Drafts, packs, leads and the audit log: this computer’s browser storage, split by account.',
        install14: 'Desktop leads are also written to data/leads.json next to the app. You may set LEAD_WEBHOOK to POST leads to your sheet or CRM.',
        installToLegal: 'Terms and privacy',
        leadLead: 'You may leave a name and mobile for the facilitator on this computer. The public site does not send leads to Yoway.'
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

    function localizeCase(item) {
        if (!item) return item;
        const pack = (root.WENDAO_CASE_EN || {})[item.id];
        if (!pack || lang() !== 'en') return item;
        const evidence = Object.assign({}, item.evidence || {}, pack.evidence || {});
        if (pack.sourceNote && /[\u4e00-\u9fff]/.test(String(evidence.note || ''))) {
            evidence.note = pack.sourceNote;
        }
        return Object.assign({}, item, pack, {
            pains: Object.assign({}, item.pains || {}, pack.pains || {}),
            metric: Object.assign({}, item.metric || {}, pack.metric || {}),
            evidence: evidence,
            steps: pack.steps || item.steps,
            empathy: pack.empathy || item.empathy,
            publicFacts: pack.publicFacts || item.publicFacts,
            sourceNote: pack.sourceNote || item.sourceNote,
            initiativesPreview: pack.initiativesPreview || item.initiativesPreview
        });
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
        if (t('docTitle') && !/deliverable|case|legal|install/i.test(location.pathname)) document.title = t('docTitle');
        document.querySelectorAll('.yoway-wake').forEach(function (el) {
            if (el.classList.contains('is-login') || el.classList.contains('is-rail')) return;
            el.setAttribute('aria-label', t('cta'));
            el.setAttribute('title', t('cta'));
        });
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
        bmcInner: bmcInner,
        localizeCase: localizeCase
    };
})(typeof window !== 'undefined' ? window : globalThis);
