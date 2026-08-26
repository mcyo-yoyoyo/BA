/**
 * P1：4A 四域约束（数据 / 系统 / 技术）+ DSTE 解码（KPI / 责任 / 预算 / 关口）。
 * 不新增步骤，挂在现有步骤 3、6。路标页只保留甘特。
 */
(function (root) {
    function $(id) { return document.getElementById(id); }

    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function industryKey() {
        const ind = (root.currentState && root.currentState.workflowIndustry) || '3C';
        if (ind === '汽车') return 'auto';
        if (ind === '家电') return 'appliance';
        return '3c';
    }

    const SEEDS = {
        '3c': {
            dataObjects: [
                { name: '客户 / 会员', owner: '会员运营', quality: '线上下口径不一', systems: 'CRM、会员中台', note: '积分与复购回不到投放' },
                { name: '线索', owner: '营销', quality: '难归因', systems: '投放、客服会话', note: '问询等待按天计' },
                { name: '订单', owner: '交易', quality: '路径分裂', systems: '商城、OMS', note: '以旧换新与分期不在同一单' },
                { name: '库存', owner: '履约', quality: '线上下打架', systems: 'OMS、门店', note: '占用与释放不同步' },
                { name: '工单', owner: '服务', quality: '三套账', systems: '热线、App、IoT', note: 'VOC 回不到产品' }
            ],
            systems: [
                { name: '电商与投放', domain: '前台', integrations: '广告平台、会话、内容库', bound: '营销战役' },
                { name: 'OMS / 库存', domain: '中台', integrations: '门店核销、快递、以旧换新', bound: '履约' },
                { name: '会员中台', domain: '中台', integrations: '积分、UGC、投放回流', bound: '拥护' },
                { name: '服务台 / 工单', domain: '后台', integrations: '备件、NSS、产品缺陷', bound: 'ITR' }
            ],
            techConstraints: [
                { title: '现网改造窗口有限', type: '现网', impact: '近半年 P0 不宜并行超过三件', blocks: true },
                { title: '会员同意与个保需先齐', type: '合规', impact: '拥护与裂变不得早于同意中心', blocks: true },
                { title: '支付与风控走现有通道', type: '安全', impact: '新成交路径必须复用现网支付', blocks: false }
            ]
        },
        appliance: {
            dataObjects: [
                { name: '客户 / 网点', owner: '零售运营', quality: '经销与直营各记各的', systems: '经销商系统、CRM', note: '服务半径大于门店覆盖' },
                { name: '订单', owner: '履约', quality: '安装与物流拆单', systems: 'OMS、安装预约', note: '送装不同步' },
                { name: '库存', owner: '供应', quality: '渠道库存滞后', systems: '分货、WMS', note: '大促易断货或压货' },
                { name: '工单', owner: '服务', quality: '网点反馈慢', systems: '服务热线、配件', note: '一次解决率难核验' }
            ],
            systems: [
                { name: '经销与分货', domain: '前台', integrations: '要货、价盘、返利', bound: '渠道' },
                { name: '送装一体', domain: '中台', integrations: '物流、安装师傅', bound: '履约' },
                { name: '服务网点', domain: '后台', integrations: '配件、质保', bound: '售后' }
            ],
            techConstraints: [
                { title: '网点系统改造周期长', type: '现网', impact: 'P0 先打通订单与预约，再铺网点 App', blocks: true },
                { title: '家电安装涉及进户合规', type: '合规', impact: '路标需预留验收与保险条款', blocks: false }
            ]
        },
        auto: {
            dataObjects: [
                { name: '线索', owner: '营销', quality: '超时再分配弱', systems: '投放、CRM', note: '垂媒与到店对不上' },
                { name: '商机 / 订单', owner: '销售', quality: '按揭审批拉长', systems: '订单中心、金融', note: '合同与库存未锁死' },
                { name: '车辆库存', owner: '交付', quality: '配车可见性差', systems: '库存、PDI、物流', note: '交车预约反复改' },
                { name: '维保工单', owner: '售后', quality: '索赔口径不一', systems: '维修、配件', note: '回流线索弱' }
            ],
            systems: [
                { name: 'CRM / 线索', domain: '前台', integrations: '垂媒、外呼、企微', bound: '获客' },
                { name: '订单与金融', domain: '中台', integrations: '电子合同、按揭、限购', bound: '成交' },
                { name: '库存与交付', domain: '中台', integrations: 'PDI、物流、上牌', bound: '交车' }
            ],
            techConstraints: [
                { title: '金融机构接口窗口固定', type: '现网', impact: '成交路径改造需对齐对端发版', blocks: true },
                { title: '限购与合规校验不可绕开', type: '合规', impact: '路标不得把校验后置到交车', blocks: true }
            ]
        }
    };

    function blankFourA() {
        return { uiTab: 'data', dataObjects: [], systems: [], techConstraints: [], seeded: false };
    }

    function ensureArchitecture4a() {
        const state = root.currentState;
        if (!state) return blankFourA();
        if (!state.architecture4a || typeof state.architecture4a !== 'object') state.architecture4a = blankFourA();
        const a = state.architecture4a;
        if (!Array.isArray(a.dataObjects)) a.dataObjects = [];
        if (!Array.isArray(a.systems)) a.systems = [];
        if (!Array.isArray(a.techConstraints)) a.techConstraints = [];
        if (!a.uiTab) a.uiTab = 'data';
        return a;
    }

    function seedArchitecture4aIfEmpty(force) {
        const a = ensureArchitecture4a();
        if (!force && a.seeded && (a.dataObjects.length || a.systems.length || a.techConstraints.length)) return a;
        const seed = SEEDS[industryKey()] || SEEDS['3c'];
        if (!a.dataObjects.length || force) {
            a.dataObjects = seed.dataObjects.map(function (x, i) { return Object.assign({ id: i + 1 }, x); });
        }
        if (!a.systems.length || force) {
            a.systems = seed.systems.map(function (x, i) { return Object.assign({ id: i + 1 }, x); });
        }
        if (!a.techConstraints.length || force) {
            a.techConstraints = seed.techConstraints.map(function (x, i) { return Object.assign({ id: i + 1 }, x); });
        }
        a.seeded = true;
        return a;
    }

    function seedInitiativeDecode(ini) {
        if (!ini) return ini;
        const wm = (root.currentState && root.currentState.workspaceMeta) || {};
        const sponsor = String(wm.sponsor || '').trim();
        if (!String(ini.kpi || '').trim()) {
            ini.kpi = ini.benefit
                ? '验收：' + String(ini.benefit).replace(/\s+/g, ' ').slice(0, 42)
                : '验收：相关优先短板降为观察，且可用经营数据核验';
        }
        if (!String(ini.owner || '').trim()) {
            ini.owner = sponsor || '待指定负责人';
        }
        if (!String(ini.budget || '').trim()) {
            ini.budget = ini.phase === 'P0' ? '近半年重点投入' : ini.phase === 'P1' ? '中期排期' : '观察，不单列预算';
        }
        if (!String(ini.gate || '').trim()) {
            ini.gate = ini.phase === 'P0' ? 'M2 关口：指标可核验才铺开' : '季度复盘后再加码';
        }
        if (!String(ini.boundSystem || '').trim()) {
            ini.boundSystem = String(ini.tech || '').split(/[+·]/)[0].trim() || '待绑定系统';
        }
        return ini;
    }

    function seedAllInitiativeDecode() {
        const list = (root.currentState && root.currentState.initiatives) || [];
        list.forEach(seedInitiativeDecode);
    }

    function setTab(tab) {
        const a = ensureArchitecture4a();
        a.uiTab = tab === 'sys' || tab === 'tech' ? tab : 'data';
        refreshVisiblePanel();
    }

    function refreshVisiblePanel() {
        const step = root.currentState && root.currentState.step;
        if (step === 3 && typeof root.renderStep3 === 'function') root.renderStep3();
        else if (step === 3) injectFourAPanel(3);
    }

    function updateRow(kind, idx, field, value) {
        const a = ensureArchitecture4a();
        const list = kind === 'sys' ? a.systems : kind === 'tech' ? a.techConstraints : a.dataObjects;
        if (!list[idx]) return;
        if (field === 'blocks') list[idx].blocks = !!value;
        else list[idx][field] = value;
    }

    function addRow(kind) {
        const a = ensureArchitecture4a();
        if (kind === 'sys') a.systems.push({ id: Date.now(), name: '', domain: '中台', integrations: '', bound: '' });
        else if (kind === 'tech') a.techConstraints.push({ id: Date.now(), title: '', type: '现网', impact: '', blocks: false });
        else a.dataObjects.push({ id: Date.now(), name: '', owner: '', quality: '', systems: '', note: '' });
        refreshVisiblePanel();
    }

    function removeRow(kind, idx) {
        const a = ensureArchitecture4a();
        const list = kind === 'sys' ? a.systems : kind === 'tech' ? a.techConstraints : a.dataObjects;
        list.splice(idx, 1);
        refreshVisiblePanel();
    }

    function fourAPanelHtml() {
        const a = seedArchitecture4aIfEmpty();
        const tab = a.uiTab || 'data';
        const tabBtn = function (id, label) {
            return `<button type="button" class="p1-tab ${tab === id ? 'is-on' : ''}" onclick="YouweiP1.setTab('${id}')">${label}</button>`;
        };
        let body = '';
        if (tab === 'data') {
            body = `<table class="p1-table"><thead><tr><th>数据对象</th><th>所有权</th><th>质量现状</th><th>落在哪些系统</th><th>说明</th><th></th></tr></thead><tbody>`
                + a.dataObjects.map(function (row, i) {
                    return `<tr>
                        <td><input value="${esc(row.name)}" onchange="YouweiP1.updateRow('data',${i},'name',this.value)"></td>
                        <td><input value="${esc(row.owner)}" onchange="YouweiP1.updateRow('data',${i},'owner',this.value)"></td>
                        <td><input value="${esc(row.quality)}" onchange="YouweiP1.updateRow('data',${i},'quality',this.value)"></td>
                        <td><input value="${esc(row.systems)}" onchange="YouweiP1.updateRow('data',${i},'systems',this.value)"></td>
                        <td><input value="${esc(row.note)}" onchange="YouweiP1.updateRow('data',${i},'note',this.value)"></td>
                        <td><button type="button" class="p1-x" onclick="YouweiP1.removeRow('data',${i})" title="删除">×</button></td>
                    </tr>`;
                }).join('')
                + `</tbody></table>
                <button type="button" class="p1-add" onclick="YouweiP1.addRow('data')">增加数据对象</button>`;
        } else if (tab === 'sys') {
            body = `<table class="p1-table"><thead><tr><th>系统</th><th>前后台</th><th>集成点</th><th>主要绑在哪段业务</th><th></th></tr></thead><tbody>`
                + a.systems.map(function (row, i) {
                    return `<tr>
                        <td><input value="${esc(row.name)}" onchange="YouweiP1.updateRow('sys',${i},'name',this.value)"></td>
                        <td><input value="${esc(row.domain)}" onchange="YouweiP1.updateRow('sys',${i},'domain',this.value)"></td>
                        <td><input value="${esc(row.integrations)}" onchange="YouweiP1.updateRow('sys',${i},'integrations',this.value)"></td>
                        <td><input value="${esc(row.bound)}" onchange="YouweiP1.updateRow('sys',${i},'bound',this.value)"></td>
                        <td><button type="button" class="p1-x" onclick="YouweiP1.removeRow('sys',${i})" title="删除">×</button></td>
                    </tr>`;
                }).join('')
                + `</tbody></table>
                <button type="button" class="p1-add" onclick="YouweiP1.addRow('sys')">增加系统</button>`;
        } else {
            body = `<table class="p1-table"><thead><tr><th>约束</th><th>类型</th><th>对路标的影响</th><th>卡住节奏</th><th></th></tr></thead><tbody>`
                + a.techConstraints.map(function (row, i) {
                    return `<tr>
                        <td><input value="${esc(row.title)}" onchange="YouweiP1.updateRow('tech',${i},'title',this.value)"></td>
                        <td><input value="${esc(row.type)}" onchange="YouweiP1.updateRow('tech',${i},'type',this.value)"></td>
                        <td><input value="${esc(row.impact)}" onchange="YouweiP1.updateRow('tech',${i},'impact',this.value)"></td>
                        <td class="p1-check"><label><input type="checkbox" ${row.blocks ? 'checked' : ''} onchange="YouweiP1.updateRow('tech',${i},'blocks',this.checked)"> 限制排期</label></td>
                        <td><button type="button" class="p1-x" onclick="YouweiP1.removeRow('tech',${i})" title="删除">×</button></td>
                    </tr>`;
                }).join('')
                + `</tbody></table>
                <button type="button" class="p1-add" onclick="YouweiP1.addRow('tech')">增加约束</button>`;
        }
        return `<section id="p1-4a-panel" class="p1-4a-panel shrink-0">
            <div class="p1-4a-head">
                <div>
                    <p class="p1-kicker">IA · AA · TA</p>
                    <p class="p1-lead">BA 业务能力在上方。这里补 IA 数据、AA 应用、TA 技术，避免路标悬空。</p>
                </div>
                <div class="p1-tabs">${tabBtn('data', 'IA 数据')}${tabBtn('sys', 'AA 应用')}${tabBtn('tech', 'TA 技术')}</div>
            </div>
            <div class="p1-4a-body">${body}</div>
        </section>`;
    }

    function constraintStripHtml() {
        const a = ensureArchitecture4a();
        const blockers = (a.techConstraints || []).filter(function (c) { return c.blocks && String(c.title || '').trim(); });
        if (!blockers.length) return '';
        return `<div id="p1-constraint-strip" class="p1-constraint-strip shrink-0">
            <div class="p1-4a-head">
                <p class="p1-kicker">技术与合规正在限制节奏</p>
                <button type="button" class="p1-add" onclick="setStep(3)">步骤三可改</button>
            </div>
            <div class="p1-chips">${blockers.map(function (c) {
                return `<span>${esc(c.title)} · ${esc(c.impact)}</span>`;
            }).join('')}</div>
        </div>`;
    }

    function decodeFieldsHtml(ini) {
        seedInitiativeDecode(ini);
        const id = ini.id;
        const p0 = ini.phase === 'P0';
        return `<div class="p1-decode mt-3 grid sm:grid-cols-2 gap-3 border-t border-black/[0.06] pt-3">
            <p class="sm:col-span-2 text-[11px] font-semibold text-ink-tertiary uppercase tracking-wide">${p0 ? '近半年解码（P0 须写责任人，否则过程册不能保存）' : '解码（可选）'}</p>
            <label class="grid gap-1.5 text-[11px] font-semibold text-ink-tertiary">验收指标
                <textarea class="w-full min-h-[48px] rounded-[10px] border border-black/[0.10] bg-canvas/50 px-3 py-2 text-[13px] text-ink" rows="2" onchange="updateInitiativeField(${id},'kpi',this.value)">${esc(ini.kpi)}</textarea></label>
            <label class="grid gap-1.5 text-[11px] font-semibold text-ink-tertiary">责任人
                <input class="w-full rounded-[10px] border border-black/[0.10] bg-canvas/50 px-3 py-2 text-[13px] text-ink" value="${esc(ini.owner)}" onchange="updateInitiativeField(${id},'owner',this.value)"></label>
            <label class="grid gap-1.5 text-[11px] font-semibold text-ink-tertiary">预算带
                <input class="w-full rounded-[10px] border border-black/[0.10] bg-canvas/50 px-3 py-2 text-[13px] text-ink" value="${esc(ini.budget)}" onchange="updateInitiativeField(${id},'budget',this.value)"></label>
            <label class="grid gap-1.5 text-[11px] font-semibold text-ink-tertiary">关口
                <input class="w-full rounded-[10px] border border-black/[0.10] bg-canvas/50 px-3 py-2 text-[13px] text-ink" value="${esc(ini.gate)}" onchange="updateInitiativeField(${id},'gate',this.value)"></label>
            <label class="sm:col-span-2 grid gap-1.5 text-[11px] font-semibold text-ink-tertiary">绑定系统 / 接口
                <input class="w-full rounded-[10px] border border-black/[0.10] bg-canvas/50 px-3 py-2 text-[13px] text-ink" value="${esc(ini.boundSystem)}" onchange="updateInitiativeField(${id},'boundSystem',this.value)" placeholder="如 OMS、会员中台、支付通道"></label>
        </div>`;
    }

    function injectFourAPanel(stepId) {
        if (Number(stepId) !== 3) return;
        const host = $('step-' + stepId);
        if (!host || host.querySelector('#p1-4a-panel')) return;
        const mount = document.createElement('div');
        mount.innerHTML = fourAPanelHtml();
        const panel = mount.firstElementChild;
        const scroll = host.querySelector('.overflow-y-auto, .flex.flex-col.flex-1.min-h-0.min-w-0') || host;
        if (scroll && scroll !== host) scroll.insertAdjacentElement('afterbegin', panel);
        else host.appendChild(panel);
    }

    function injectStep7Extras() {
        const host = $('step-7');
        if (!host) return;
        const existingFourA = host.querySelector('#p1-4a-panel');
        if (existingFourA) existingFourA.remove();
        if (!host.querySelector('#p1-constraint-strip')) {
            const stripMount = document.createElement('div');
            stripMount.innerHTML = constraintStripHtml();
            if (stripMount.firstElementChild) {
                const toolbar = host.querySelector('.roadmap-gantt-scroll')
                    || host.querySelector('.rounded-\\[14px\\].border')
                    || host.querySelector('#wendao-brief-strip');
                if (toolbar && toolbar.parentNode) toolbar.insertAdjacentElement('beforebegin', stripMount.firstElementChild);
                else {
                    const body = host.querySelector('.flex.flex-col.flex-1.min-h-0.min-w-0') || host;
                    body.insertAdjacentElement('afterbegin', stripMount.firstElementChild);
                }
            }
        }
    }

    function injectStep6Decode() {
        const host = $('step-6');
        if (!host) return;
        host.querySelectorAll('[data-ini-card]').forEach(function () { /* cards rebuilt in html */ });
        if (host.querySelector('.p1-decode')) return;
        const cards = host.querySelectorAll('#step-6 .rounded-\\[14px\\].border.border-black\\/\\[0\\.06\\]');
        const inis = (root.currentState && root.currentState.initiatives) || [];
        const sorted = typeof root.sortInitiativesByPhase === 'function' ? root.sortInitiativesByPhase(inis) : inis;
        cards.forEach(function (card, idx) {
            const ini = sorted[idx];
            if (!ini || card.querySelector('.p1-decode')) return;
            card.insertAdjacentHTML('beforeend', decodeFieldsHtml(ini));
        });
    }

    function wrap(name, after) {
        const orig = root[name];
        if (!orig || orig.__p1Wrapped) return;
        root[name] = function () {
            const r = orig.apply(this, arguments);
            try { after(); } catch (e) { console.error(e); }
            return r;
        };
        root[name].__p1Wrapped = true;
    }

    function openPack(pack) {
        const state = root.currentState;
        if (!(state && (state.initiatives || []).length)) {
            if (typeof root.toast === 'function') root.toast('请先生成优先事项，再导出材料', 'error');
            return;
        }
        seedArchitecture4aIfEmpty();
        seedAllInitiativeDecode();
        const brief = typeof root.buildBossBriefing === 'function' ? root.buildBossBriefing() : {};
        if (root.YouweiPpt && typeof root.YouweiPpt.openDeck === 'function') {
            root.YouweiPpt.openDeck(state, brief, { pack: pack });
        }
    }

    function extraSlides(state, brief, pack) {
        if (pack !== 'board' && pack !== 'investment') return [];
        const st = state || {};
        const a = st.architecture4a || {};
        const inis = ((st.initiatives || []).filter(function (i) { return i.phase === 'P0'; })).slice(0, 3);
        const slides = [];
        slides.push({
            kicker: '06　今年怎么拆',
            title: 'P0 解码：指标、责任、关口',
            bullets: inis.length ? inis.map(function (i) {
                return (i.title || '未命名') + ' · ' + (i.owner || '待指定') + ' · ' + (i.gate || '待设关口');
            }) : ['请在步骤六为 P0 补责任人与关口'],
            note: inis.map(function (i) { return i.kpi; }).filter(Boolean).slice(0, 2).join('；'),
            kind: 'list'
        });
        const dataBullets = (a.dataObjects || []).slice(0, 5).map(function (d) {
            return (d.name || '对象') + ' — ' + (d.quality || d.note || '');
        });
        slides.push({
            kicker: '07　数据对象',
            title: '先对齐哪些口径',
            bullets: dataBullets.length ? dataBullets : ['请在步骤三补数据对象'],
            kind: 'list'
        });
        const sysBullets = (a.systems || []).slice(0, 5).map(function (s) {
            return (s.name || '系统') + ' · ' + (s.integrations || s.domain || '');
        });
        slides.push({
            kicker: '08　系统与集成',
            title: '路标绑在哪些系统上',
            bullets: sysBullets.length ? sysBullets : ['请在步骤三补系统依赖'],
            kind: 'list'
        });
        const cons = (a.techConstraints || []).map(function (c) {
            return (c.title || '约束') + (c.impact ? ' — ' + c.impact : '');
        });
        slides.push({
            kicker: '09　技术与合规',
            title: '哪些约束在限制节奏',
            bullets: cons.length ? cons : ['尚未填写技术约束'],
            kind: 'list'
        });
        if (pack === 'investment') {
            slides.push({
                kicker: '10　投资案',
                title: '近半年为什么投这三件',
                bullets: inis.length ? inis.map(function (i) {
                    return (i.title || '未命名') + ' · ' + (i.budget || '预算待估') + (i.benefit ? ' — ' + i.benefit : '');
                }) : ['请先确认 P0 三件与预算带'],
                note: '数字为评估目标，需用贵司经营数据确认后再立项。',
                kind: 'list'
            });
        }
        return slides;
    }

    function bootstrapP1() {
        if (!root.currentState) return;
        ensureArchitecture4a();
        seedArchitecture4aIfEmpty();
        seedAllInitiativeDecode();
        wrap('renderStep3', function () { injectFourAPanel(3); });
        wrap('renderStep7', injectStep7Extras);
        wrap('renderStep6', function () {
            seedAllInitiativeDecode();
            injectStep6Decode();
        });
        wrap('applyInitiativesFromAiPatch', function () {
            seedArchitecture4aIfEmpty();
            seedAllInitiativeDecode();
        });
        wrap('runLocalFullPlan', function () {
            seedArchitecture4aIfEmpty(true);
            seedAllInitiativeDecode();
        });
        if (root.currentState.activePanel === 'workflow') {
            if (root.currentState.step === 3) injectFourAPanel(3);
            if (root.currentState.step === 6) injectStep6Decode();
            if (root.currentState.step === 7) injectStep7Extras();
        }
    }

    root.YouweiP1 = {
        setTab: setTab,
        updateRow: updateRow,
        addRow: addRow,
        removeRow: removeRow,
        ensureArchitecture4a: ensureArchitecture4a,
        seedArchitecture4aIfEmpty: seedArchitecture4aIfEmpty,
        seedInitiativeDecode: seedInitiativeDecode,
        extraSlides: extraSlides,
        fourAPanelHtml: fourAPanelHtml,
        decodeFieldsHtml: decodeFieldsHtml
    };
    root.openBoardPack = function () { openPack('board'); };
    root.openInvestmentCase = function () { openPack('investment'); };
    root.ensureArchitecture4a = ensureArchitecture4a;

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootstrapP1);
    else bootstrapP1();
    window.addEventListener('load', function () { setTimeout(bootstrapP1, 0); });
})(window);
