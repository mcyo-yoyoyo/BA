/**
 * 首页 / 案例页 / 工作台共用案例库。
 * 公开做法来自官网与可信报道，供对照评估；不是华为官方授权，也不是已验证的贵司成绩。
 */
(function (root) {
    function ref(label, url) {
        return { label: label, url: url };
    }

    const CASES = [
        {
            id: 'ipms',
            kicker: '产品操盘',
            category: '上市操盘',
            title: '上市是一套关口，不是一场发布会',
            subtitle: '单品从立项到退市，供应、价盘、培训样机在同一张作战图上签字',
            tagline: '发布会日期锁定之前，渠道政策与首销分货已经过关。',
            templateId: 'hwcb_ipms',
            industry: '3C',
            valueStreamName: 'GTM：IPMS',
            tone: 'light',
            accent: '#3d5a4c',
            metric: { value: 'GR', label: '上市关口可审计', evidence: 'assumption' },
            situation: '消费电子新品要同时对齐研发就绪、供应爬坡、渠道政策、培训样机与价盘。很多团队有 Charter，关口却在发布会日期锁定之后才补签字。',
            complication: 'DCP / GR 形式化，首销超卖与断货同时出现，退市清库伤害价盘。',
            publicFacts: [
                '行业公开复盘中，华为终端 C 端把 IPMS（集成产品营销与销售）作为单品全生命周期操盘主流程，与研发 IPD 的决策点互锁，而不是只开一场发布会。',
                '常见组织是 PCT（产品商业化组）周例会，加上更高一层的 GTM 操盘委员会；例行决策多集中在开工会、启动市场拓展（GR2）和启动上市（GR4）。',
                '一线常称「四马车」：零售、营销、营销运作（把研发语言译成卖点）、产品线，要求关键节点同时在场。'
            ],
            sourceNote: '以下为行业对华为终端 IPMS/GTM 的公开复盘，不是华为官网白皮书，也不是友为代理华为。请用贵司实际上市流程对照。',
            references: [
                ref('IPMS 与 IPD 互锁、PCT / 操盘委员会（行业复盘）', 'https://news.qq.com/rain/a/20240423A09B8C00'),
                ref('IPMS 作为 C 端上市主干流程的说明（行业复盘）', 'https://www.growthhk.cn/quan/42783.html')
            ],
            evidence: {
                status: 'assumption',
                baseline: '关口纪要分散在邮件；供应与营销无联合签字',
                target: '立项、拓展、上市三项关口可审计（评估目标）',
                note: '关口设计供对照，请用贵司实际上市流程确认'
            },
            brief: '我们是消费电子品牌，新品上市要对齐供应、渠道政策、培训样机与价盘。痛点是关口形式化，发布会日期锁定后政策还在改。希望按 IPMS 把操盘做成可排期的路标。',
            painStages: ['DCP2', '上市销售'],
            challenge: '发布会日期锁定后，渠道政策、培训样机、分货规则仍在邮件里改。首销超卖与断货同时出现。',
            approach: '沿「立项—前置拓展—上市就绪—首销—退市」看关口是否挡住未就绪投入，并核对零售、营销、供应是否在同一张作战图上。',
            outcome: '上市前必须联合供应与营销签字；首销分货有看板；退市与备件策略提前进入路标。',
            highlights: ['关口与研发节点互锁', 'PCT / 操盘委员会', '首销分货与退市价盘'],
            initiativesPreview: [
                { phase: 'P0', title: '上市关口清单与跨部门联合签字' },
                { phase: 'P1', title: '首销作战室：分货、价盘、激活' },
                { phase: 'P2', title: '退市操盘与渠道清库策略' }
            ]
        },
        {
            id: 'mkt',
            kicker: '科学营销',
            category: '精准营销',
            title: '投放要对得上人群，而不是只堆曝光',
            subtitle: '预热、发布、首销分阶段；人群标签、素材与订单在同一套节奏里',
            tagline: '每一次大促留下可复用的战役资产，而不是一堆文件夹。',
            templateId: 'industry_marketing',
            industry: '3C',
            valueStreamName: 'MKT：营销流',
            tone: 'dark',
            accent: '#5c4a32',
            metric: { value: '品效', label: '人群与订单可对上', evidence: 'assumption' },
            situation: '旗舰发布要同时产出门店、电商、短视频与海外站点物料。品牌广告与效果广告常常两套归因。',
            complication: '版本靠共享盘，版权与多语言混乱；投放报表对不齐 SKU 订单。',
            publicFacts: [
                '华为广告平台「鲸鸿动能」官网案例：智慧屏 Mate TV 按预热 / 发布 / 首销分阶段投放，公开披露触达 6000 万+、曝光 2 亿+、首销 2 万+ 台（平台案例数，非友为测算）。',
                '同一平台公开的豪华汽车投放：人群迭代后线索有效率较基线提升 17%，站内 CTR 提升 60%、CPC 下降 38%。',
                '做法要点是终端与生态标签做人群分层，再把站外种草人群回传站内追投，而不是只买大曝光。'
            ],
            sourceNote: '数字来自华为鲸鸿动能官网案例页，供精准营销对照。请用贵司投放与订单数据校准。',
            references: [
                ref('鲸鸿动能 · 智慧屏 Mate TV 案例', 'https://ads.huawei.com/cn/case-studies/article-052'),
                ref('鲸鸿动能 · 豪华汽车精准获客案例', 'https://ads.huawei.com/cn/case-studies/article-054')
            ],
            evidence: {
                status: 'assumption',
                baseline: '物料周期按周；品牌与效果报表对不齐订单',
                target: '战役人群、素材、SKU 订单可对上（评估目标）',
                note: '评估目标，请用贵司内容库与归因口径确认'
            },
            brief: '3C 品牌营销：人群洞察、战役策略、多终端素材与 ROI 复盘。痛点是内容周期长、品牌与效果两套归因。希望建设内容中台与战役看板。',
            painStages: ['内容管理', '效果评估'],
            challenge: '旗舰发布要同时产出门店、电商、短视频物料。归因在媒介报表里对不齐订单。',
            approach: '按洞察—策略—素材—投放—复盘拆战役，核对人群体验标签能否回流订单。',
            outcome: '模板化生产缩短准备周期；品牌与效果双看板对得上 SKU。',
            highlights: ['分阶段战役节奏', '人群标签可回流', '品牌+效果双归因'],
            initiativesPreview: [
                { phase: 'P0', title: '内容中台、版权与多终端版本' },
                { phase: 'P1', title: 'Campaign 执行与媒介采买可视' },
                { phase: 'P2', title: '归因分析与滚动优化' }
            ]
        },
        {
            id: '5a',
            kicker: '品牌电商',
            category: '电商成交',
            title: '自营商城与平台旗舰店要走同一条成交路径',
            subtitle: '华为商城、京东 / 天猫 / 抖音官方店，问询、以旧换新、履约能对上同一会员',
            tagline: '曝光不再掉进黑盒。问询有人接，成交能归因，拥护能裂变。',
            templateId: 'hwcb_5a',
            industry: '3C',
            valueStreamName: '电商：5A链路',
            tone: 'dark',
            accent: '#3d5a4c',
            metric: { value: '一体', label: '多店成交可归因', evidence: 'assumption' },
            situation: '3C 品牌同时经营自营商城与京东、天猫、抖音官方店，海外常见再叠加当地主流平台。投放、客服、履约、会员往往各记各的。',
            complication: 'Ask 问询等待按天计，以旧换新与分期不在同一下单路径，评价与复购回不到投放。',
            publicFacts: [
                '华为消费者官网零售页与商城帮助中心显示：华为商城（Vmall）是品牌自营主阵地，并在天猫、京东等平台设官方旗舰店，新品可多渠道同步预订。',
                '海外市场常见再叠加当地主流电商与官网直销，核心仍是统一商品、价格与售后口径，避免「同一款机、三套承诺」。',
                '评估时按 5A（认知—吸引—问询—行动—拥护）看漏斗，而不是只看单店 GMV。'
            ],
            sourceNote: '渠道布局依据华为消费者官网零售与商城公开说明。转化数字为评估目标，请用贵司各店数据确认。',
            references: [
                ref('华为官网 · 旗舰店与门店服务', 'https://consumer.huawei.com/cn/retail/'),
                ref('华为商城 · 发货与配送说明', 'https://www.vmall.com/help/faq-16732.html')
            ],
            evidence: {
                status: 'assumption',
                baseline: '问询等待按天；线索、预约、订单三套账号',
                target: '多店问询到下单可归因（评估目标）',
                note: '评估目标，请用贵司经营数据确认'
            },
            brief: '我们是 3C 品牌，线上走商城与京东 / 天猫 / 抖音。痛点是投放与成交断层，客服与门店预约不通。希望按 5A 打通线索、导购与会员。',
            painStages: ['Ask 问询', 'Advocate 拥护'],
            challenge: '旗舰发布期投放集中，线索在咨询、比价、以旧换新流失。三套系统互不相认。',
            approach: '以 5A 为主轴，把媒介、问询、支付履约、会员映射为可打分能力。',
            outcome: '问询有人接；以旧换新与分期在同一路径；评价回流投放。',
            highlights: ['自营+平台统一口径', '问询到下单', '会员与复购回流'],
            initiativesPreview: [
                { phase: 'P0', title: '问询中台：客服、导购知识库与线索分配' },
                { phase: 'P1', title: '以旧换新与分期进入同一成交路径' },
                { phase: 'P2', title: '会员积分、评价与投放闭环' }
            ]
        },
        {
            id: 'itr',
            kicker: '亲和力服务',
            category: '消费者服务',
            title: '报障之后，还要改进',
            subtitle: '热线、App、小程序、寄修与授权服务中心走同一张工单',
            tagline: '一次解决率上升，差评不再沉在工单海里。',
            templateId: 'hwcb_itr',
            industry: '3C',
            valueStreamName: '服务：ITR',
            tone: 'dark',
            accent: '#2f4a5c',
            metric: { value: '一单', label: '全渠道工单到底', evidence: 'assumption' },
            situation: '热线、在线、App 与寄修并存。工单、备件、满意度分属服务台、物流与客服三套账。',
            complication: '同一故障重复建单，备件承诺给不到顾客，差评被客服消化、产品看不到根因。',
            publicFacts: [
                '华为消费者官网：寄修可在官网、我的华为 App、终端客户服务小程序、热线 950800 申请；承诺双向物流费用全免，进度可用账号 / SN 查询。',
                '官网服务范围写明：距服务中心超过 30 公里建议寄修；全国授权服务中心统一收费可查。',
                '华为 2025 年报英文版：全球授权服务中心超过 3100 家、覆盖 70 个国家和地区，当年与消费者互动超过 1 亿次（公司年报口径）。'
            ],
            sourceNote: '服务政策来自华为消费者官网；网络规模来自华为 2025 年报。友为不代言这些成绩，只作服务链对照。',
            references: [
                ref('华为官网 · 寄修服务指南', 'https://consumer.huawei.com/cn/support/content/zh-cn15885011/'),
                ref('华为官网 · 服务范围', 'https://consumer.huawei.com/cn/support/service-area/'),
                ref('Huawei Annual Report 2025', 'https://www.huawei.com/en/annual-report/2025')
            ],
            evidence: {
                status: 'assumption',
                baseline: '一次解决率靠经验；VOC 不进月度改进会',
                target: '全渠道一单到底、差评能回流产品（评估目标）',
                note: '请用贵司售后质检样本确认'
            },
            brief: '3C 售后：热线、App、寄修并存。痛点是工单定级靠经验，备件不可视，差评不回流。希望按 ITR 做成可治理的服务流。',
            painStages: ['服务受理', 'NSS评估'],
            challenge: '同一故障在热线、门店、寄修重复建单。备件承诺无法给到顾客。',
            approach: '用 ITR 五段拆 SLA、知识库、备件与 VOC，把「能远程解决」和「必须寄修」分开治理。',
            outcome: '远程解决率上升，寄修时效可承诺；TOP 问题进入月度改进会。',
            highlights: ['多入口一单到底', '寄修进度可查', 'VOC 回流产品'],
            initiativesPreview: [
                { phase: 'P0', title: '全渠道工单与知识库推荐' },
                { phase: 'P1', title: '备件可视与寄修时效承诺' },
                { phase: 'P2', title: '满意度 / VOC 驱动的改进专题' }
            ]
        },
        {
            id: 'trade',
            kicker: '渠道交易',
            category: '渠道交易',
            title: '分货与价盘，比促销更决定利润',
            subtitle: '国包 / 省包要货、市场秩序、激励结算一次对齐',
            tagline: '紧俏机按规则分，窜货有据可查，返利不再靠对账战争。',
            templateId: 'industry_trade',
            industry: '3C',
            valueStreamName: '渠道：交易流',
            tone: 'light',
            accent: '#3a3a36',
            metric: { value: '秩序', label: '分货与窜货可闭环', evidence: 'assumption' },
            situation: '手机等消费电子常见国包接货、省包分销、地市经销出货。要货、签收、价盘巡查、紧俏品分货与返利结算不在同一节奏。',
            complication: '区域价盘被低价冲货打穿，紧俏旗舰在头部囤积，激励台阶滞后一个季度。',
            publicFacts: [
                '公开报道中，华为手机线下长期以国包（如天音、中邮、普天太力等）接货，再分到省包与授权店；厂家直营店比例低，授权体系承担资金与物流。',
                '2019 年前后公开口径：大中华区直营加授权门店约 7500 家，并曾推进「千县计划」把网点铺到县域。数字是历史报道，不是当前承诺。',
                '评估对照的是：分货权重可解释、窜货工单能闭环、激励按台阶计提——而不是再买一套报表。'
            ],
            sourceNote: '渠道层级来自行业报道对华为 / 荣耀国包体系的公开描述，不是华为官方渠道白皮书。请用贵司合同与进销存校准。',
            references: [
                ref('品玩 · 国包 / 省包与授权店结构', 'https://www.pingwest.com/a/223131'),
                ref('通信世界网 · 国代与授权专卖店分工', 'https://www.cww.net.cn/article?id=418127')
            ],
            evidence: {
                status: 'assumption',
                baseline: '分货靠经验；窜货取证难；返利对账按季度',
                target: '秩序与分货列为近半年优先（规划取舍）',
                note: '优先级来自能力短板评估，请用经营结果校准'
            },
            brief: '3C 渠道：国包省包要货、价盘巡查、紧俏品分货、返利结算。痛点是窜货难取证、激励滞后。希望建设分货引擎与结算中心。',
            painStages: ['市场秩序', '分货'],
            challenge: '区域价盘被低价冲货打穿。紧俏机在头部囤积。返利对账周期长。',
            approach: '沿计划—履约—秩序—分货—实销—结算看六段，红区直接映射治理举措。',
            outcome: '分货权重可解释；窜货工单闭环；激励按台阶自动计提。',
            highlights: ['国包省包分货规则', '价盘与窜货闭环', '激励结算中心'],
            initiativesPreview: [
                { phase: 'P0', title: '市场秩序规则、稽查与申诉' },
                { phase: 'P1', title: '分货引擎与渠道等级权重' },
                { phase: 'P2', title: '返利台阶与结算中心' }
            ]
        },
        {
            id: 'o2o',
            kicker: '全渠道零售',
            category: '门店零售',
            title: '旗舰店既是体验场，也是履约节点',
            subtitle: '线上下单到店自提、门店闪送，与库存占用共用一张订单网',
            tagline: '顾客在店里摸到的机器，线上也能立刻锁库、立刻提。',
            templateId: 'retail',
            industry: '3C',
            valueStreamName: '零售：预测到交付',
            tone: 'light',
            accent: '#3d5a4c',
            metric: { value: '30′', label: '到店自提可承诺', evidence: 'assumption' },
            situation: '旗舰店与授权店同时承担体验和提货。库存占用、信用审核与订单履约常常不在一张网。',
            complication: '大促时门店有货线上显示无货；加急审批靠微信群；自提与快递改派互相覆盖。',
            publicFacts: [
                '华为消费者官网零售页：在华为商城购买指定商品，可「线上下单、到店即取」，公开表述最快约 30 分钟到店取货；也可付费「门店闪送」，公开表述最快约 1 小时送达。',
                '同页提供到店以旧换新、免息分期等权益，门店不只是展陈。',
                '华为 2025 年报：全球旗舰店 16 家、大型智能生活馆 480 家（年报口径，随门店开业变化）。'
            ],
            sourceNote: '时效与门店数字来自华为官网零售页与 2025 年报。请用贵司门店库存与 OMS 实测校准。',
            references: [
                ref('华为官网 · 旗舰店 / 到店自提 / 闪送', 'https://consumer.huawei.com/cn/retail/'),
                ref('Huawei Annual Report 2025', 'https://www.huawei.com/en/annual-report/2025')
            ],
            evidence: {
                status: 'assumption',
                baseline: '审批等待按天；线上下库存各记各的',
                target: '指定门店自提时效可承诺（评估目标）',
                note: '请用贵司现网测时确认'
            },
            brief: '3C 体验零售：旗舰店承担体验和提货。痛点是预测与门店库存脱节，自提与快递改派混乱。希望打通库存、审核与 OMS。',
            painStages: ['库存与审批', '全渠道交付'],
            challenge: '大促期间门店有货线上显示无货。加急审批靠微信群。',
            approach: '沿预测—审批—在途—到店自提 / 闪送看五维健康度，把库存占用与核销标为优先。',
            outcome: '自提与闪送共用库存池；加急通道有规则而不是人情。',
            highlights: ['全渠道库存一张网', '到店自提 / 闪送', '门店核销'],
            initiativesPreview: [
                { phase: 'P0', title: 'OMS + 全渠道库存占用与释放' },
                { phase: 'P1', title: '到店自提与门店闪送规则' },
                { phase: 'P2', title: '需求预测与门店补货闭环' }
            ]
        },

        {
            id: 'appl-gtm',
            kicker: '旺季操盘',
            category: '旺季供应',
            title: '空调旺季看的是区域仓和安装运力，不是发布会日期',
            subtitle: '大家电按安装半径和出货窗口备货，断货与压货会同时出现',
            tagline: '旺季窗口一到，仓里没货和师傅没档期会一起爆。',
            templateId: 'hwcb_ipms',
            industry: '家电',
            valueStreamName: '家电：上市与旺季',
            metric: { value: '半径', label: '安装半径内可承诺', evidence: 'assumption' },
            situation: '冰箱、空调、厨电的上市要同时对齐模具、区域仓、安装队伍和地产精装节点。',
            complication: '总部按发布会备货，工地按竣工要货，安装师傅排期不在同一张表上。',
            publicFacts: [
                '家电是耐消品：换机周期长，旺季（如空调）和精装房交付会把供应与安装挤在同一窗口。',
                '评估看的是：区域仓、安装运力、工程单承诺能否在上市前过关。'
            ],
            sourceNote: '家电场景按行业通行的旺季 / 工程交付节奏编写，供对照，不是单一品牌官方案例。',
            references: [],
            evidence: {
                status: 'assumption',
                baseline: '上市日锁定后安装运力仍按经验调',
                target: '旺季与工程单的供应、安装可联合签字',
                note: '请用贵司区域仓与安装排程确认'
            },
            brief: '家电品牌，痛点是旺季和精装工程单把供应与安装挤爆。希望把上市关口和安装半径一起评估。',
            painStages: ['上市销售'],
            challenge: '发布节奏与工地竣工不同步，安装一次上门合格率掉下去。',
            approach: '把上市关口加上「安装运力、区域仓、工程承诺」三项硬条件。',
            outcome: '旺季不断货、工程单不违约、退市不清库伤价。',
            highlights: ['旺季备货', '精装工程节点', '安装运力'],
            initiativesPreview: [
                { phase: 'P0', title: '上市关口增加安装与区域仓签字' },
                { phase: 'P1', title: '工程单与零售单分池供货' },
                { phase: 'P2', title: '退市与以旧换新回收协同' }
            ]
        },
        {
            id: 'appl-mkt',
            kicker: '换新营销',
            category: '以旧换新',
            title: '以旧换新政策，要能落到门店话术',
            subtitle: '国补、品牌补贴、回收一口价若对不齐，投放越猛投诉越多',
            tagline: '广告许诺的「三免」，门店和师傅必须能兑现。',
            templateId: 'industry_marketing',
            industry: '家电',
            valueStreamName: '家电：换新战役',
            metric: { value: '口径', label: '投放与门店话术一致', evidence: 'assumption' },
            situation: '家电营销高度绑定以旧换新和政府补贴。投放、门店、回收商各念各的政策。',
            complication: '线上一口价，上门加收拆机费；素材承诺「一次上门」，实际要跑两趟。',
            publicFacts: [
                '京东帮助中心把家电以旧换新拆成多种上门模式：先收后送、先送后收、送新同时收旧等，费用以页面为准。',
                '公开报道：京东曾提出旧机免费上门 / 拆卸 / 搬运，并推动送、装、拆、清一体化，缩短上门次数。'
            ],
            sourceNote: '政策与服务模式来自京东帮助中心及中国经济网等公开报道，供战役口径对照。',
            references: [
                ref('京东帮助中心 · 家电以旧换新', 'https://help.jd.com/user/issue/389-4465.html'),
                ref('中国经济网 · 京东以旧换新投入', 'http://www.ce.cn/cysc/zgjd/kx/202405/13/t20240513_39000731.shtml')
            ],
            evidence: {
                status: 'assumption',
                baseline: '投放、门店、回收商三套口径',
                target: '战役承诺与上门作业一致',
                note: '请用贵司活动页与工单抽检确认'
            },
            brief: '家电营销绑定以旧换新。痛点是广告承诺与上门作业不一致。希望统一战役口径。',
            painStages: ['内容管理'],
            challenge: '国补叠加品牌补贴后，门店算不清顾客实付，回收商加收拆机费。',
            approach: '把政策、素材、门店话术、师傅作业说明书做成同一套战役包。',
            outcome: '投放可兑现，客诉下降，回收与新品订单能对上。',
            highlights: ['国补与品牌补贴对齐', '上门模式说清', '门店话术'],
            initiativesPreview: [
                { phase: 'P0', title: '战役口径：补贴、回收、上门次数' },
                { phase: 'P1', title: '门店与师傅作业说明书' },
                { phase: 'P2', title: '投放与回收订单对账' }
            ]
        },
        {
            id: 'appl-ecom',
            kicker: '送装电商',
            category: '送装一体',
            title: '大家电成交，看的是送装一次能否完成',
            subtitle: '京东 / 苏宁 / 天猫下单后，送货、安装、拆旧要能预约到同一天',
            tagline: '顾客买的不是箱子，是「明天能用」。',
            templateId: 'hwcb_5a',
            industry: '家电',
            valueStreamName: '家电：电商送装',
            metric: { value: '一次', label: '送装预约可承诺', evidence: 'assumption' },
            situation: '大家电电商成交后还有安装、拆旧、高空、打孔。平台与品牌服务商两套预约。',
            complication: '货到了师傅没档期；安装环境不符又要二次上门。',
            publicFacts: [
                '京东把「送装一体」定义为指定区域送货并同步安装，免费 / 付费以商详为准，辅材和高空另计。',
                '公开报道称部分品类已做到拆送装一体，等待使用时长可明显缩短；覆盖城市与品类仍在扩大。'
            ],
            sourceNote: '送装规则来自京东帮助中心及公开报道。请用贵司预约履约率确认。',
            references: [
                ref('京东帮助中心 · 送装一体', 'https://help.jd.com/user/issue/942-4513.html')
            ],
            evidence: {
                status: 'assumption',
                baseline: '送货与安装两张单，二次上门常见',
                target: '主销品类预约一次完成率可测',
                note: '请用贵司安装工单确认'
            },
            brief: '家电电商看送装。痛点是货到师傅未到。希望把预约与安装合格纳入电商漏斗。',
            painStages: ['Act 成交'],
            challenge: '平台预约与品牌师傅排程不通，高空打孔现场加价引发客诉。',
            approach: '把预约、一次安装合格、二次上门成本写进电商价值流。',
            outcome: '主销品类能承诺送装日；异常单有升级路径。',
            highlights: ['送装一体预约', '一次安装合格', '辅材收费透明'],
            initiativesPreview: [
                { phase: 'P0', title: '平台预约与师傅排程打通' },
                { phase: 'P1', title: '一次安装合格率看板' },
                { phase: 'P2', title: '高空 / 辅材标准报价' }
            ]
        },
        {
            id: 'appl-svc',
            kicker: '安装服务',
            category: '安装服务网',
            title: '安装师傅就是服务触点',
            subtitle: '预约、一次合格、配件、回访要能回到产品与网点考核',
            tagline: '差评往往出在第二次上门，而不是第一次通话。',
            templateId: 'hwcb_itr',
            industry: '家电',
            valueStreamName: '家电：安装服务',
            metric: { value: '合格', label: '一次安装可考核', evidence: 'assumption' },
            situation: '家电售后半径大，安装与维修依赖服务商。工单、配件、回访不在一张网。',
            complication: '同一故障多次上门；配件承诺口头化；差评到客服为止。',
            publicFacts: [
                '以旧换新公开报道里，门店「无忧换新」强调免费上门、拆卸、搬运、拖旧送新一体，本质是把安装服务当成成交条件。',
                '评估按 ITR：请求—受理—上门交付—评估—改进，而不是只看出勤量。'
            ],
            sourceNote: '上门体验对照公开的以旧换新服务改进报道。请用贵司一次上门合格率确认。',
            references: [
                ref('中国经济网 · 北京以旧换新与门店服务', 'http://district.ce.cn/newarea/roll/202406/25/t20240625_39048518.shtml')
            ],
            evidence: {
                status: 'assumption',
                baseline: '一次安装合格靠抽检；配件承诺口头化',
                target: '一次上门合格与二次上门成本可看板',
                note: '请用贵司服务商结算数据确认'
            },
            brief: '家电安装售后半径大。痛点是二次上门和配件不透明。希望按服务流考核网点。',
            painStages: ['服务受理'],
            challenge: '师傅即触点，但工单关了就看不见根因。',
            approach: '把一次合格、配件时效、差评回流写成四维能力。',
            outcome: '二次上门下降；TOP 安装缺陷进月度改进。',
            highlights: ['预约可信', '一次安装合格', '配件与回访'],
            initiativesPreview: [
                { phase: 'P0', title: '上门工单一单到底' },
                { phase: 'P1', title: '配件承诺与二次上门结算' },
                { phase: 'P2', title: '安装缺陷回流产品' }
            ]
        },
        {
            id: 'appl-trade',
            kicker: '工程交易',
            category: '工程精装',
            title: '精装房和工程单，按竣工节点交货，不是按零售促销',
            subtitle: '地产精装、物业团购与零售单要分池，安装窗口跟工地走',
            tagline: '工地要货的日子，和门店大促撞车时，两边都会违约。',
            templateId: 'industry_trade',
            industry: '家电',
            valueStreamName: '家电：工程精装',
            metric: { value: '节点', label: '竣工窗口可承诺', evidence: 'assumption' },
            situation: '厨电、空调、热水器大量走精装房和工程渠道。要货按竣工，安装按工地，结算按批次。',
            complication: '总部按零售大促备货，工地按竣工要货，两套单抢同一批库存。',
            publicFacts: [
                '家电工程 / 精装与零售是两条生意：批次交付、验收节点、质保起算都不同。',
                '评估看工程单与零售单是否分池，以及安装是否跟得上竣工窗口。'
            ],
            sourceNote: '工程精装场景按家电地产精装 / 团购通行做法编写，不是单一开发商官方案例。',
            references: [],
            evidence: {
                status: 'assumption',
                baseline: '工程单与零售单抢同一批库存',
                target: '竣工窗口内供货与安装可联合签字',
                note: '请用贵司工程批次与安装排程确认'
            },
            brief: '家电工程精装。痛点是工地竣工与零售大促抢货。希望把工程单分池评估。',
            painStages: ['分货'],
            challenge: '精装验收日到了，货还在门店大促里。',
            approach: '工程批次、零售库存、安装运力三张表分开，再看冲突窗口。',
            outcome: '工程不违约，零售不断货。',
            highlights: ['工程与零售分池', '竣工节点', '批次验收'],
            initiativesPreview: [
                { phase: 'P0', title: '工程单与零售单分池' },
                { phase: 'P1', title: '竣工窗口与安装排程互锁' },
                { phase: 'P2', title: '批次验收与质保起算' }
            ]
        },
        {
            id: 'appl-retail',
            kicker: '场景零售',
            category: '场景专卖',
            title: '专卖店和设计师渠道，卖的是场景不是单品',
            subtitle: '厨电、全屋需要样板间与设计师联合推荐，库存和预约要跟得上',
            tagline: '顾客在样板间看中的套系，下单后不能再等两周齐套。',
            templateId: 'retail',
            industry: '家电',
            valueStreamName: '家电：门店场景',
            metric: { value: '齐套', label: '套系交付可承诺', evidence: 'assumption' },
            situation: '家电零售除卖场外，还有品牌专卖、装修公司和物业推荐。套系销售依赖样板间。',
            complication: '样板间型号与仓库型号不一致；设计师推荐后无库存承诺。',
            publicFacts: [
                '家电零售越来越接近场景方案：烟灶、洗碗机、冰箱要齐套交付。',
                '评估看样板、库存、安装预约是否同一套承诺。'
            ],
            sourceNote: '门店场景按厨电 / 全屋零售通行做法编写。',
            references: [],
            evidence: {
                status: 'assumption',
                baseline: '样板型号与可售库存不一致',
                target: '套系下单后安装日可承诺',
                note: '请用贵司专卖店订单确认'
            },
            brief: '家电专卖与设计师渠道。痛点是样板与库存脱节。希望把齐套交付纳入零售评估。',
            painStages: ['全渠道交付'],
            challenge: '顾客拍了样板间，仓库缺其中一件，整单延期。',
            approach: '样板 SKU、可售库存、安装预约三张表合一。',
            outcome: '套系承诺可兑现，设计师渠道可复购。',
            highlights: ['样板与库存一致', '设计师联合推荐', '齐套安装'],
            initiativesPreview: [
                { phase: 'P0', title: '样板 SKU 与可售库存对齐' },
                { phase: 'P1', title: '设计师订单承诺规则' },
                { phase: 'P2', title: '齐套安装排程' }
            ]
        },

        {
            id: 'auto-gtm',
            kicker: '金融成交',
            category: '报价成交',
            title: '报价、贷款和置换，要能在店里一次谈完',
            subtitle: '车价、置换、金融、保险不能各算各的，店长口头价撑不住高峰',
            tagline: '贷款批不下来，试驾再顺利也只是把人送到竞品店。',
            templateId: 'hwcb_ipms',
            industry: '汽车',
            valueStreamName: '汽车：成交与金融',
            metric: { value: '一次', label: '报价与金融可同屏', evidence: 'assumption' },
            situation: '4S 店成交要把车价、置换评估、贷款、保险、装潢算成一张单。顾问、金融专员、店长各持一表。',
            complication: '高峰时口头折扣对不上系统价；贷款驳回后没有备选方案。',
            publicFacts: [
                '汽车零售成交通常同时谈主机厂金融、银行贷款、厂家贴息和保险捆绑。',
                '评估看报价、审批、金融预审是否同一条商机，而不是微信里改来改去。'
            ],
            sourceNote: '成交与金融场景按经销店零售通行做法编写，不是单一主机厂官方 KPI。',
            references: [],
            evidence: {
                status: 'assumption',
                baseline: '报价在微信，金融在另一套系统',
                target: '报价、置换、贷款可同屏审批',
                note: '请用贵司成交单与金融通过率确认'
            },
            brief: '汽车店端成交卡在报价和贷款。希望把金融预审和折扣审批纳入评估。',
            painStages: ['Act 成交'],
            challenge: '贷款驳回后顾问只能让顾客再来一趟。',
            approach: '把报价、置换、金融、保险写成成交价值流的必过关口。',
            outcome: '高峰也能给得出可兑现的总价，驳回有备选。',
            highlights: ['同屏报价', '金融预审', '折扣可审计'],
            initiativesPreview: [
                { phase: 'P0', title: '报价 / 置换 / 金融同屏' },
                { phase: 'P1', title: '折扣与店长审批进系统' },
                { phase: 'P2', title: '贷款驳回备选方案' }
            ]
        },
        {
            id: 'auto-mkt',
            kicker: '集客营销',
            category: '集客获客',
            title: '垂媒花出去的钱，要回到本店可跟的线索',
            subtitle: '汽车之家、懂车帝、信息流与到店客，去重后按时效分配',
            tagline: '线索不是留资条数，是 T+0 有没有人接。',
            templateId: 'industry_marketing',
            industry: '汽车',
            valueStreamName: '汽车：投放线索',
            metric: { value: 'T+0', label: '线索响应可考核', evidence: 'assumption' },
            situation: '经销店在垂媒、短视频、车展同时获客。线索分散，撞单和超时流失同时存在。',
            complication: '广告报表很漂亮，店端说「都是假号」；离职顾问把高意向客带走。',
            publicFacts: [
                '汽车 CRM 实践普遍要求：官网、垂媒、社媒、到店线索统一去重，按门店与时效分配。',
                '行业方案常见 SOP：高意向 15 分钟内响应，试驾后 24 小时回访；超时系统预警。'
            ],
            sourceNote: '线索时效对照汽车 CRM / SCRM 公开实践，不是单一主机厂官方 KPI。',
            references: [
                ref('汽车 CRM 全链路能力说明（行业）', 'https://www.jiandaoyun.com/nblog/401615/')
            ],
            evidence: {
                status: 'assumption',
                baseline: '多渠道线索各记各的，超时无预警',
                target: '去重后 T+0 响应可看板',
                note: '请用贵司 CRM 与广告后台对账'
            },
            brief: '汽车经销投放分散。痛点是假线索和超时。希望把投放和店端跟进收成一条链。',
            painStages: ['效果评估'],
            challenge: '72 小时无人跟的线索被当消耗打掉。',
            approach: '投放—去重—分配—试驾邀约写成营销价值流。',
            outcome: '单线索成本可解释，店端不再抱怨假号。',
            highlights: ['多源去重', '时效分配', '试驾邀约'],
            initiativesPreview: [
                { phase: 'P0', title: '线索中台去重与 T+0 分配' },
                { phase: 'P1', title: '投放与动销对账' },
                { phase: 'P2', title: '低意向私域培育' }
            ]
        },
        {
            id: 'auto-lead',
            kicker: '到店零售',
            category: '到店试驾',
            title: '从线索到试驾到订单，店里要有同一条商机',
            subtitle: '顾问跟进、试驾车排程、报价审批、竞品记录不能散在微信',
            tagline: '试驾开了，回访断了，等于把广告费开到竞品店。',
            templateId: 'hwcb_5a',
            industry: '汽车',
            valueStreamName: '汽车：线索到订单',
            metric: { value: '商机', label: '试驾后回访闭环', evidence: 'assumption' },
            situation: '4S 店成交依赖顾问个人。试驾预约、车况、报价、金融在多个小程序里。',
            complication: '高峰试驾车冲突；试驾后无回访；价格审批靠店长口头。',
            publicFacts: [
                '成熟汽车 CRM 把预约、试驾车况、竞品、金融方案、交车清单做成阶段必填。',
                '公开实践包括线上签试驾协议、高峰限流、试驾反馈采集。'
            ],
            sourceNote: '商机阶段对照汽车 CRM 公开模块，请用贵司店端转化漏斗确认。',
            references: [
                ref('汽车 CRM 功能边界（行业）', 'https://www.jiandaoyun.com/nblog/401615/')
            ],
            evidence: {
                status: 'assumption',
                baseline: '试驾记录在微信；回访靠自觉',
                target: '试驾后 24 小时回访可抽检',
                note: '请用贵司试驾台账确认'
            },
            brief: '汽车店端成交断在试驾后。希望把商机阶段做成可考核的价值流。',
            painStages: ['Ask 问询', 'Act 成交'],
            challenge: '顾问离职，高意向客从个人微信消失。',
            approach: '线索—到店—试驾—报价—订单五段，客户资产归店不归个人。',
            outcome: '试驾转化可解释，店长能看见超时单。',
            highlights: ['商机阶段', '试驾车排程', '客户资产归店'],
            initiativesPreview: [
                { phase: 'P0', title: '试驾预约与回访强制闭环' },
                { phase: 'P1', title: '报价 / 金融审批进系统' },
                { phase: 'P2', title: '客户资产防流失' }
            ]
        },
        {
            id: 'auto-svc',
            kicker: '进厂服务',
            category: '售后进厂',
            title: '交车不是终点，保养和索赔才是留存',
            subtitle: '预约、车间进度、索赔、延保要让车主看得见',
            tagline: '第一次保养失约，下一次置换就不会回本店。',
            templateId: 'hwcb_itr',
            industry: '汽车',
            valueStreamName: '汽车：售后服务',
            metric: { value: '预约', label: '进厂预约可承诺', evidence: 'assumption' },
            situation: '售后是经销利润中心。预约、车间、配件、索赔、回访常分属 DMS 与纸质单。',
            complication: '车主反复打电话问进度；索赔被主机厂驳回无人解释。',
            publicFacts: [
                '汽车服务链公开实践：购车后自动触发首保提醒、保养到期触达、延保与置换培育。',
                '部分门店用影像车间让进度对车主可见，减少「等消息」。'
            ],
            sourceNote: '售后节点对照汽车数字化服务公开实践。请用贵司进厂与索赔数据确认。',
            references: [],
            evidence: {
                status: 'assumption',
                baseline: '进度靠电话问；索赔解释靠顾问',
                target: '预约到竣工进度对车主可见',
                note: '请用贵司售后满意度确认'
            },
            brief: '汽车售后预约与索赔不透明。希望按服务流评估进厂体验。',
            painStages: ['服务受理'],
            challenge: '车间忙时爽约，索赔驳回没有标准话术。',
            approach: '预约—接待—作业—质检—交车—回访，索赔单单独闭环。',
            outcome: '进厂守时，索赔可解释，延保可推荐。',
            highlights: ['预约守时', '车间进度', '索赔闭环'],
            initiativesPreview: [
                { phase: 'P0', title: '进厂预约与进度可视' },
                { phase: 'P1', title: '索赔工单与话术' },
                { phase: 'P2', title: '保养到期与延保自动化' }
            ]
        },
        {
            id: 'auto-trade',
            kicker: '经销交易',
            category: '库存返利',
            title: '库存占资和返利，比单月销量更伤经销',
            subtitle: '主机厂压库、金融占资、返利台阶要对得上实销',
            tagline: '出货很好看，库龄一过，返利和利息把利润吃掉。',
            templateId: 'industry_trade',
            industry: '汽车',
            valueStreamName: '汽车：库存结算',
            metric: { value: '库龄', label: '库存与返利可对上', evidence: 'assumption' },
            situation: '经销集团同时面对多品牌配额、库存融资和季度返利。财务与销售对账周期长。',
            complication: '为冲返利进货，热销车没有、滞销车占库。',
            publicFacts: [
                '汽车经销利润对库存天数和返利政策极度敏感。',
                '评估看配额、库龄、返利计提是否同一套账。'
            ],
            sourceNote: '库存与返利场景按经销集团通行财务节奏编写。',
            references: [],
            evidence: {
                status: 'assumption',
                baseline: '销售看出货，财务看利息，两套会',
                target: '库龄与返利台阶一张看板',
                note: '请用贵司进销存与融资账确认'
            },
            brief: '汽车经销库存占资高。痛点是为返利压货。希望把库存和结算纳入评估。',
            painStages: ['分货'],
            challenge: '季度末突击进货，下季度利息和促销两头打。',
            approach: '配额—在库—实销—返利—融资五段对账。',
            outcome: '进货有规则，返利可预期。',
            highlights: ['库龄看板', '返利计提', '配额纪律'],
            initiativesPreview: [
                { phase: 'P0', title: '库龄与占资周报' },
                { phase: 'P1', title: '返利按实销计提' },
                { phase: 'P2', title: '滞销车处置策略' }
            ]
        },
        {
            id: 'auto-retail',
            kicker: '交车交付',
            category: '交车上牌',
            title: '交车、上牌、保险要能一次办完',
            subtitle: 'PDI、金融、上牌、精品安装散落，交车仪式就只是合影',
            tagline: '车主记住的是等上牌的那一周，不是发布会。',
            templateId: 'retail',
            industry: '汽车',
            valueStreamName: '汽车：交车交付',
            metric: { value: '一次', label: '交车清单可闭环', evidence: 'assumption' },
            situation: '展厅成交后还有 PDI、保险、上牌、装潢。顾客多次往返。',
            complication: 'PDI 问题到交车当天才暴露；上牌材料不全。',
            publicFacts: [
                '汽车零售数字化把交车清单做成阶段任务：财务、PDI、保险、上牌、培训。',
                '部分地区推进「新车上牌一件事」，评估仍以店内承诺能否兑现为准。'
            ],
            sourceNote: '交车清单对照汽车零售 SOP 公开实践。请用贵司交车周期确认。',
            references: [],
            evidence: {
                status: 'assumption',
                baseline: '交车当天补材料、补PDI',
                target: '交车清单项项闭环后再合影',
                note: '请用贵司交车周期确认'
            },
            brief: '汽车交车上牌多次往返。希望把交付清单纳入零售评估。',
            painStages: ['全渠道交付'],
            challenge: '金融批了车没到，或车到了上牌窗口排不上。',
            approach: '订单—配车—PDI—金融保险—上牌—交车仪式做成可视清单。',
            outcome: '交车周期可承诺，投诉下降。',
            highlights: ['PDI 提前', '上牌材料一次齐', '交车清单'],
            initiativesPreview: [
                { phase: 'P0', title: '交车清单强制闭环' },
                { phase: 'P1', title: 'PDI 与配车可视' },
                { phase: 'P2', title: '上牌 / 保险并行作业' }
            ]
        }
    ];

    const INDUSTRIES = [
        {
            id: '3c',
            order: 1,
            name: '消费电子',
            kicker: '对照最深',
            blurb: '上市、投放、电商、服务、渠道、门店。公开做法主要对照华为终端零售与服务。',
            casesLead: '上市、投放、电商、服务、渠道、门店，对照卡住的一环。',
            href: 'index.html#cases',
            workshop: 'workshop.html?industry=3C&mode=pro',
            flagshipCase: 'ipms',
            caseIds: ['ipms', 'mkt', '5a', 'itr', 'trade', 'o2o']
        },
        {
            id: 'auto',
            order: 2,
            name: '汽车',
            kicker: '集客到交车',
            blurb: '集客线索、到店试驾、成交金融、交车上牌、售后进厂、库存返利。',
            casesLead: '集客、试驾、成交、交车、售后、库存，对照卡住的一环。',
            href: 'index.html#cases',
            workshop: 'workshop.html?industry=汽车&mode=pro',
            flagshipCase: 'auto-lead',
            caseIds: ['auto-mkt', 'auto-lead', 'auto-gtm', 'auto-retail', 'auto-svc', 'auto-trade']
        },
        {
            id: 'appliance',
            order: 3,
            name: '家电',
            kicker: '换新与送装',
            blurb: '以旧换新、送装一体、工程精装、安装服务、旺季供应、场景专卖。',
            casesLead: '换新、送装、工程、安装、旺季、专卖，对照卡住的一环。',
            href: 'index.html#cases',
            workshop: 'workshop.html?industry=家电&mode=pro',
            flagshipCase: 'appl-ecom',
            caseIds: ['appl-mkt', 'appl-ecom', 'appl-trade', 'appl-svc', 'appl-gtm', 'appl-retail']
        }
    ];

    const DELIVERABLES = [
        {
            id: 'briefing',
            title: '商业画布',
            blurb: '客群、渠道、收入与成本，战略怎么说。',
            image: 'img/takeaway/invest.png',
            figure: 'canvas',
            href: 'deliverable.html?id=briefing',
            kicker: '带走 · 步骤 1',
            use: '工作台第一步九宫格，可导出 Excel、运行诊断。'
        },
        {
            id: 'heatmap',
            title: '能力架构',
            blurb: 'BA、IA、AA、TA，加上差距与热力，一张图看清补哪块。',
            image: 'img/takeaway/capability.png',
            figure: 'architecture',
            href: 'deliverable.html?id=heatmap',
            kicker: '带走 · 步骤 3–5',
            use: '能力块、4A 约束、四维打分与热力着色在工作台连续完成。'
        },
        {
            id: 'roadmap',
            title: '变革路标',
            blurb: '甘特排出近、中、远期怎么走。',
            image: 'img/takeaway/roadmap.png',
            figure: 'roadmap',
            href: 'deliverable.html?id=roadmap',
            kicker: '带走 · 步骤 7',
            use: '举措排进月份，可改跨度与子路标，不是愿望清单。'
        },
        {
            id: 'export',
            title: '评估底稿',
            blurb: '七步整份，可导出带回讨论。',
            image: 'img/takeaway/dossier.png',
            figure: 'export',
            href: 'deliverable.html?id=export',
            kicker: '带走 · 资产快照',
            use: '保存后从资产库导出 HTML 快照，含画布到路标全文。'
        }
    ];

    const METHOD_CELLS = [
        { id: 1, short: '画布', group: '定方向', dste: '商业画布蓝图', line: '战略怎么赚钱，先写清。', ba: '客群、渠道、收入与成本', aa: '现有系统边界', da: '关键经营口径', ta: '合规与现网约束', tags: ['业务', '系统', '数据'] },
        { id: 2, short: '流程', group: '定方向', dste: '价值流程诊断', line: '慢、贵、险卡在哪一段。', ba: '五维看慢贵险体验', aa: '阶段系统与接口', da: '阶段 KPI', ta: '合规与风险点', tags: ['业务', '系统', '数据'] },
        { id: 3, short: '架构', group: '建架构', dste: '业务能力架构', line: '流程拆成能力与 BA、IA、AA、TA。', ba: '能力块清单', aa: '系统对照', da: '能力数据对象', ta: '现网约束', tags: ['业务', '系统', '数据'] },
        { id: 4, short: '差距', group: '建架构', dste: '能力差距分析', line: '组织、流程、数据、系统打分。', ba: '组织与流程差距', aa: '系统成熟度', da: '数据成熟度', ta: '技术债', tags: ['业务', '系统', '数据'] },
        { id: 5, short: '热力', group: '建架构', dste: '能力热力分布', line: '红黄绿看见先补哪块。', ba: '优先补的能力', aa: '系统热点', da: '口径是否可算', ta: '上线条件', tags: ['业务', '系统', '数据'] },
        { id: 6, short: '举措', group: '抓落地', dste: '变革举措规划', line: '近半年只压先做的几件。', ba: '近半年三件', aa: '系统与接口依赖', da: '口径与责任人', ta: '安全与上线', tags: ['业务', '系统', '数据'] },
        { id: 7, short: '路标', group: '抓落地', dste: '变革路标计划', line: '排进月份，战略落到执行。', ba: '十八个月节奏', aa: '上线关口', da: '数据质量', ta: '运行情况', tags: ['业务', '关口', '数据'] }
    ];

    CASES.forEach(function (c) {
        if (!c.image) c.image = 'img/cases/' + c.id + '.png';
    });

    function getCaseById(id) {
        return CASES.find((c) => c.id === String(id || '').trim()) || null;
    }

    function getCasesByIndustry(industryId) {
        const ind = resolveIndustryRecord(industryId);
        if (!ind) return CASES.filter((c) => c.industry === '3C');
        return (ind.caseIds || []).map(getCaseById).filter(Boolean);
    }

    function resolveIndustryRecord(industry) {
        const raw = String(industry || '').trim();
        if (!raw) return INDUSTRIES.find(function (x) { return x.id === '3c'; });
        if (raw === '汽车') return INDUSTRIES.find(function (x) { return x.id === 'auto'; });
        if (raw === '家电') return INDUSTRIES.find(function (x) { return x.id === 'appliance'; });
        if (raw === '3C' || raw === '消费电子' || raw.toLowerCase() === '3c') {
            return INDUSTRIES.find(function (x) { return x.id === '3c'; });
        }
        return INDUSTRIES.find(function (x) {
            return x.id === raw || x.id === raw.toLowerCase() || x.name === raw;
        }) || INDUSTRIES.find(function (x) { return x.id === '3c'; });
    }

    /** 当前行业 6 个业务域短描述，供 YOWAY 对照；不是贵司成绩 */
    function getIndustryDomainBriefs(industry) {
        const ind = resolveIndustryRecord(industry) || INDUSTRIES[0];
        const cases = (ind.caseIds || []).map(getCaseById).filter(Boolean).slice(0, 6);
        return {
            id: ind.id,
            name: ind.name,
            lead: ind.casesLead || ind.blurb || '',
            domains: cases.map(function (c) {
                return {
                    id: c.id,
                    kicker: c.kicker || '',
                    title: c.title || '',
                    line: c.subtitle || c.tagline || c.title || ''
                };
            })
        };
    }

    function formatIndustryDomainPrompt(industry) {
        const pack = getIndustryDomainBriefs(industry);
        const lines = pack.domains.map(function (d, i) {
            return (i + 1) + '. ' + d.kicker + '：' + d.line;
        });
        return '【行业对照 · ' + pack.name + '】回复必须落到下列业务域的说法，不要串到其它行业套话。这些是公开对照，不是贵司成绩。\n'
            + lines.join('\n')
            + '\n【数字纪律】禁止编造贵司经营数字（成交量、转化率、金额、人数、时长、占比等）。只许用：用户刚说的、工作台已填格子、以及公开对照里已写明出处的数字。空画布或用户没给数字时写「待贵司数据确认」，不要填假数。';
    }

    function getDeliverableById(id) {
        return DELIVERABLES.find((d) => d.id === String(id || '').trim()) || null;
    }

    root.WENDAO_CASES = CASES;
    root.WENDAO_INDUSTRIES = INDUSTRIES;
    root.WENDAO_DELIVERABLES = DELIVERABLES;
    root.WENDAO_STEPS = METHOD_CELLS;
    root.WENDAO_METHOD_CELLS = METHOD_CELLS;
    root.getWendaoCaseById = getCaseById;
    root.getWendaoCasesByIndustry = getCasesByIndustry;
    root.getWendaoIndustryRecord = resolveIndustryRecord;
    root.getWendaoIndustryDomainBriefs = getIndustryDomainBriefs;
    root.formatWendaoIndustryDomainPrompt = formatIndustryDomainPrompt;
    root.getWendaoDeliverableById = getDeliverableById;
})(typeof window !== 'undefined' ? window : globalThis);
