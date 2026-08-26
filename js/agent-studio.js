/**
 * 【问道】工作台升级：引导层 + Agent 一键规划 + 对话调优回填
 * 依赖 workshop.html 中的全局状态与函数（currentState、applyWorkflowPatchObject 等）
 */
(function (root) {
    const GUIDE_LS = 'archipro-guide-dismissed-v2';
    let aiChatHistory = [];
    let studioBooted = false;

    function $(id) { return document.getElementById(id); }

    function studioQuery() {
        try { return new URLSearchParams(location.search); } catch (e) { return new URLSearchParams(); }
    }

    function inferTemplateFromBrief(text) {
        const t = String(text || '');
        if (/售后|ITR|维修|报障|NSS|寄修|客服工单/i.test(t)) return 'hwcb_itr';
        if (/GTM|上市|IPMS|DCP|发布会|退市|首销/i.test(t)) return 'hwcb_ipms';
        if (/窜货|分货|价盘|经销|返利|渠道秩序/i.test(t)) return 'industry_trade';
        if (/投放|Campaign|内容中台|种草|素材|归因|战役/i.test(t) && !/5A|电商下单/i.test(t)) return 'industry_marketing';
        if (/门店|体验店|自提|核销|O2O|全渠道交付|库存审批/i.test(t)) return 'retail';
        if (/IPD|Charter|研发|TR评审/i.test(t)) return 'hwcb_ipd';
        return 'hwcb_5a';
    }

    function applyTemplateSilent(templateId) {
        if (templateId && root.currentState.templates[templateId]) {
            root.currentState.selectedTemplateId = templateId;
        }
        const tpl = root.currentState.templates[root.currentState.selectedTemplateId];
        if (!tpl || !tpl.stages.length) return false;
        root.currentState.vsStages = tpl.stages.map((s, idx) => {
            const base = { ...root.defaultVsStageExtra(), ...s };
            return {
                ...base,
                id: idx + 1,
                actualTime: s.defaultTime != null ? s.defaultTime : (parseInt(s.actualTime, 10) || 1),
                scenarios: s.scenarios || '',
                components: s.components || '',
                valDesc: s.valDesc || ''
            };
        });
        root.currentState.vsStages.forEach(root.ensureVsStageShape);
        root.currentState.vsSelectedStageId = root.currentState.vsStages[0] ? root.currentState.vsStages[0].id : null;
        root.calcVSMetrics();
        return true;
    }

    function applyPainScores(brief, painStages) {
        const blob = (String(brief || '') + ' ' + (painStages || []).join(' ')).toLowerCase();
        (root.currentState.vsStages || []).forEach((s) => {
            const name = String(s.name || '');
            const hit = (painStages || []).some((p) => name.indexOf(p) !== -1)
                || blob.indexOf(name.toLowerCase()) !== -1;
            if (hit) {
                s.dEff = Math.min(s.dEff || 3, 2);
                s.dCx = Math.min(s.dCx || 3, 2);
                if (/问询|受理|审批|秩序|DCP/i.test(name)) s.dRisk = Math.min(s.dRisk || 3, 2);
                s.valDesc = (s.valDesc || '') || `${name}：当前为端到端瓶颈，优先补流程规则、数据贯通与系统承载。`;
            } else {
                s.dEff = s.dEff || 3;
                s.dQual = s.dQual || 4;
                s.dCost = s.dCost || 3;
                s.dRisk = s.dRisk || 3;
                s.dCx = s.dCx || 4;
            }
        });
        root.calcVSMetrics();
    }

    function annotateBmcWithBrief(brief) {
        const t = String(brief || '').trim();
        if (!t) return;
        const note = `\n\n【本次规划输入】\n${t.slice(0, 800)}`;
        const vp = String(root.currentState.bmc.valuePropositions || '');
        if (vp.indexOf('【本次规划输入】') === -1) {
            root.currentState.bmc.valuePropositions = vp + note;
        }
        root.currentState.bmcReport = null;
    }

    function applyCaseContext(caseId) {
        const item = root.getWendaoCaseById && root.getWendaoCaseById(caseId);
        const state = root.currentState;
        if (!item || !state) return item || null;
        state.workflowIndustry = item.industry || '3C';
        state.selectedTemplateId = item.templateId;
        state.valueStreamName = item.valueStreamName;
        if (state.workspaceMeta) {
            if (!String(state.workspaceMeta.projectName || '').trim()) {
                state.workspaceMeta.projectName = item.title;
            }
        }
        return item;
    }

    const THEME_CATALOG = [
        { test: /客服|线索|导购|问询|知识库|座席/, title: '问询与线索中台', tech: '全渠道会话 + 知识库 + 线索分配引擎', benefit: '缩短 Ask 等待，提升问询到下单转化', window: '近期（0–6 月）', cost: '中' },
        { test: /会员|NPS|社群|拥护|裂变|积分/, title: '会员拥护与复购闭环', tech: '会员中台 + NPS + 推荐激励', benefit: '把一次性成交做成可经营的复购与口碑', window: '中期（6–18 月）', cost: '中' },
        { test: /库存|OMS|交付|履约|核销|自提/, title: '全渠道库存与履约', tech: 'OMS/库存占用释放 + 门店核销', benefit: '消灭线上下库存打架，缩短交付承诺偏差', window: '近期（0–6 月）', cost: '难' },
        { test: /工单|备件|NSS|服务受理|ITR|寄修/, title: '服务 ITR 闭环', tech: '工单一单到底 + 备件可视 + VOC', benefit: '提升一次解决率，差评回流产品与流程', window: '近期（0–6 月）', cost: '中' },
        { test: /分货|价盘|秩序|窜货|返利|结算/, title: '渠道秩序与分货治理', tech: '分货引擎 + 秩序稽查 + 结算中心', benefit: '紧俏机按规则分，价盘可守，激励及时', window: '中期（6–18 月）', cost: '难' },
        { test: /投放|媒介|内容|DAM|归因|战役|素材|达人|种草|品牌创意|创意/, title: '内容中台与战役归因', tech: 'DAM + 战役看板 + 双归因', benefit: '缩短物料周期，品牌与效果对得上订单', window: '中期（6–18 月）', cost: '中' },
        { test: /DCP|上市|GTM|Charter|作战室|退市/, title: '上市关口与作战室', tech: 'DCP 清单 + 上市作战室 + 价盘监控', benefit: '关口挡住未就绪投入，首销与供应同频', window: '近期（0–6 月）', cost: '中' },
        { test: /预测|采购|供应商|S&OP|要货/, title: '预测与供应协同', tech: 'S&OP + 供应商协同 + 要货校验', benefit: '降低断货与呆滞，支撑大促与首销爬坡', window: '中期（6–18 月）', cost: '中' }
    ];

    function buildThematicInitiatives() {
        const fw = root.currentState.capabilityFramework || [];
        if (!fw.length) return false;
        const displayOf = (c) => (root.heatDisplayCategory ? root.heatDisplayCategory(c) : root.heatCategory(c));
        const focus = fw.filter((c) => {
            const cat = displayOf(c);
            return cat === 'red' || cat === 'yellow';
        });
        const pool = focus.length ? focus : fw.slice(0, 6);
        const used = new Set();
        const list = [];

        THEME_CATALOG.forEach((theme) => {
            const caps = pool.filter((c) => theme.test.test(`${c.l3} ${c.l2} ${c.l1} ${c.linkedVs || ''}`));
            if (!caps.length) return;
            caps.forEach((c) => used.add(c.id));
            const gaps = [];
            caps.forEach((c) => {
                if (c.gapOrg < 5 && !gaps.includes('组织')) gaps.push('组织');
                if (c.gapProc < 5 && !gaps.includes('流程')) gaps.push('流程');
                if (c.gapData < 5 && !gaps.includes('数据')) gaps.push('数据');
                if (c.gapIt < 5 && !gaps.includes('IT')) gaps.push('IT');
            });
            const red = caps.some((c) => displayOf(c) === 'red');
            list.push({
                title: theme.title,
                caps: caps.map((c) => c.l3),
                gaps,
                window: theme.window,
                benefit: theme.benefit,
                cost: theme.cost,
                phase: red ? 'P0' : 'P1',
                tech: theme.tech,
                deps: red ? '数据口径与主数据先对齐' : '承接 P0 中台能力',
                milestoneBand: red ? 'M1–M2' : 'M3–M4',
                evidenceStatus: 'assumption',
                evidenceSource: '主题规则起草',
                streams: null
            });
        });

        pool.filter((c) => !used.has(c.id) && displayOf(c) === 'watch').slice(0, 2).forEach((c) => {
            list.push({
                title: '观察：' + c.l3,
                caps: [c.l3],
                gaps: ['流程', 'IT'].filter(Boolean),
                window: '中期（6–18 月）',
                benefit: `列入观察，不进入本轮优先红区：${c.l3}`,
                cost: '易',
                phase: 'P2',
                tech: c.sys || c.tech || '流程数字化 + 主数据',
                deps: '与同域中台举措并行',
                milestoneBand: 'M3–M5',
                evidenceStatus: 'assumption',
                evidenceSource: '热力观察清单',
                streams: null
            });
        });

        if (!list.length) {
            list.push({
                title: '数字化运营巩固：数据质量与自动化',
                caps: fw.slice(0, 2).map((c) => c.l3),
                gaps: ['数据', 'IT'],
                window: '长期',
                benefit: '巩固已达标能力，避免回潮',
                cost: '易',
                phase: 'P2',
                tech: '质量看板 + 规则引擎',
                deps: '',
                milestoneBand: 'M5–M6',
                evidenceStatus: 'assumption',
                evidenceSource: '巩固草案',
                streams: null
            });
        }

        const phaseRank = { P0: 0, P1: 1, P2: 2 };
        list.sort((a, b) => (phaseRank[a.phase] - phaseRank[b.phase]) || a.title.localeCompare(b.title, 'zh'));
        let p0Seen = 0;
        const p0Cap = (root.YouweiOps && YouweiOps.getAssessment && Number(YouweiOps.getAssessment().p0Cap)) || 3;
        list.forEach((item) => {
            if (item.phase === 'P0') {
                p0Seen += 1;
                if (p0Seen > p0Cap) item.phase = 'P1';
            }
        });
        const trimmed = list.slice(0, 6);
        root.ensureRoadmapTimelineDefaults();
        root.applyInitiativesFromAiPatch(trimmed);
        return true;
    }

    function runLocalFullPlan(brief, opts) {
        const options = opts || {};
        const beforeSlice = typeof root.captureWorkflowSlice === 'function' ? root.captureWorkflowSlice() : null;
        const item = options.caseId ? applyCaseContext(options.caseId) : null;
        const text = String(brief || (item && item.brief) || '').trim();
        if (item) {
            root.currentState.selectedTemplateId = item.templateId;
            root.currentState.valueStreamName = item.valueStreamName;
        } else {
            const tpl = inferTemplateFromBrief(text);
            root.currentState.selectedTemplateId = tpl;
            const meta = root.currentState.templates[tpl];
            if (meta) root.currentState.valueStreamName = meta.name;
        }
        if (!root.WORKFLOW_INDUSTRIES.includes(root.currentState.workflowIndustry)) {
            root.currentState.workflowIndustry = '3C';
        }
        annotateBmcWithBrief(text);
        applyTemplateSilent(root.currentState.selectedTemplateId);
        applyPainScores(text, item && item.painStages);
        root.runFrameworkGen({ silent: true });
        buildThematicInitiatives();
        root.currentState.step = options.landOn === 'roadmap' ? 7 : 6;
        root.currentState.activePanel = 'workflow';
        if (typeof root.renderNav === 'function') root.renderNav();
        if (typeof root.renderStepProgress === 'function') root.renderStepProgress();
        if (typeof root.renderStep === 'function') root.renderStep();
        const summary = `已生成「${root.currentState.valueStreamName || '价值流'}」：能力 ${root.currentState.capabilityFramework.length} 项，举措 ${root.currentState.initiatives.length} 条，路标 ${root.currentState.roadmapMonths} 个月。`;
        if (beforeSlice && typeof root.pushPatchVersion === 'function') {
            root.pushPatchVersion(summary, beforeSlice);
        }
        if (typeof root.markAiWrite === 'function') root.markAiWrite('draft', '本地规划');
        return {
            ok: true,
            summary
        };
    }

    function setAiBusy(on) {
        const out = $('ai-output');
        if (out && on) {
            appendAiChat('assistant', '正在规划…', { pending: true });
        }
    }

    function chatUserName() {
        const u = root.YouweiAuth && YouweiAuth.currentUser ? YouweiAuth.currentUser() : '';
        return String(u || '').trim() || '您';
    }

    function chatUserGlyph(name) {
        const n = String(name || chatUserName());
        if (root.YouweiAuth && YouweiAuth.avatarGlyph) return YouweiAuth.avatarGlyph(n);
        return n ? n.slice(0, 1).toUpperCase() : '·';
    }

    function personalizeAiDisplay(text) {
        let t = String(text || '');
        const name = chatUserName();
        if (name && name !== '您') t = t.replace(/您/g, name);
        return t.replace(/友为/g, 'YOWAY');
    }

    function renderAiChat() {
        const out = $('ai-output');
        if (!out) return;
        if (!aiChatHistory.length) {
            const hint = (root.getStepAiEmptyHint && root.getStepAiEmptyHint()) || '结合左侧当前步骤提问。';
            out.innerHTML = '<p class="ai-chat-empty">' + escapeChat(hint) + '</p>';
            return;
        }
        out.innerHTML = aiChatHistory.map((m) => {
            const user = chatUserName();
            const who = m.role === 'user' ? user : 'YOWAY';
            const side = m.role === 'user' ? 'user' : 'bot';
            const glyph = m.role === 'user' ? chatUserGlyph(user) : 'Y';
            const raw = m.display || stripPatchForDisplay(m.text || '');
            const body = escapeChat(m.role === 'user' ? raw : personalizeAiDisplay(raw));
            const src = m.source === 'dialog'
                ? '<span class="ai-src">对话写入</span>'
                : m.source === 'draft'
                    ? '<span class="ai-src is-draft">本地草稿</span>'
                    : '';
            return `<div class="ai-row ${side}">` +
                `<span class="ai-ava ${side}" aria-hidden="true">${escapeChat(glyph)}</span>` +
                `<div class="ai-stack">` +
                `<span class="ai-who">${escapeChat(who)}</span>` +
                `<div class="ai-bubble ${side}">${body}${src}</div>` +
                `</div></div>`;
        }).join('');
        out.scrollTop = out.scrollHeight;
    }

    function escapeChat(s) {
        return String(s || '')
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/\n/g, '<br>');
    }

    function stripPatchForDisplay(text) {
        return String(text || '').replace(/```json[\s\S]*?```/gi, '〔已生成可回填的规划补丁〕').trim();
    }

    function appendAiStudioLine(role, text) {
        appendAiChat(role, text);
    }

    function appendAiChat(role, text, extra) {
        if (extra && extra.pending) {
            aiChatHistory = aiChatHistory.filter((m) => !m.pending);
            aiChatHistory.push({ role, text, pending: true, display: text, source: extra && extra.source });
        } else {
            aiChatHistory = aiChatHistory.filter((m) => !m.pending);
            aiChatHistory.push({
                role,
                text,
                display: extra && extra.display ? extra.display : stripPatchForDisplay(text),
                source: extra && extra.source
            });
        }
        if (aiChatHistory.length > 24) aiChatHistory = aiChatHistory.slice(-24);
        renderAiChat();
    }

    function tryAutoApplyPatch(text) {
        let wp = root.extractWorkflowPatchFromText(text);
        if (!wp) return null;
        if (root.restrictWorkflowPatchToStep) wp = root.restrictWorkflowPatchToStep(wp);
        if (!wp) return null;
        return root.applyWorkflowPatchObject(wp);
    }

    function updateStreamingAssistant(text) {
        const last = aiChatHistory.find((m) => m.pending);
        if (!last) {
            appendAiChat('assistant', text, { pending: true });
            return;
        }
        last.text = text;
        last.display = stripPatchForDisplay(text);
        renderAiChat();
        const out = $('ai-output');
        const bots = out ? out.querySelectorAll('.ai-bubble.bot') : [];
        const lastBot = bots[bots.length - 1];
        if (lastBot) lastBot.classList.add('streaming');
    }

    function sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async function streamLocalText(text, extra) {
        appendAiChat('assistant', '', { pending: true, source: extra && extra.source });
        const parts = String(text || '').split(/(?<=[。！？\n·])/);
        let acc = '';
        for (let i = 0; i < parts.length; i++) {
            acc += parts[i];
            updateStreamingAssistant(acc);
            await sleep(parts[i].length > 18 ? 28 : 16);
        }
        appendAiChat('assistant', text, extra);
    }

    function parseSseDelta(payload) {
        if (!payload || payload === '[DONE]') return '';
        try {
            const json = JSON.parse(payload);
            const ch = json.choices && json.choices[0];
            if (!ch) return '';
            if (ch.delta && ch.delta.content != null) return String(ch.delta.content);
            if (ch.message && ch.message.content != null) return String(ch.message.content);
        } catch (e) { /* ignore partial frames */ }
        return '';
    }

    async function callChat(systemText, userText, history, onDelta) {
        if (root.YouweiAi) {
            return root.YouweiAi.chat({
                system: systemText,
                user: userText,
                history: history,
                stream: true,
                onDelta: onDelta
            });
        }
        const cfg = root.loadAiConfig();
        if (!cfg.endpoint) throw new Error('未配置 API');
        const url = root.resolveAiChatCompletionsUrl(cfg.endpoint);
        const model = cfg.model || 'deepseek-v4-flash';
        const messages = [{ role: 'system', content: systemText }];
        (history || []).slice(-6).forEach((m) => {
            if (m.role === 'user' || m.role === 'assistant') {
                messages.push({ role: m.role === 'user' ? 'user' : 'assistant', content: String(m.text || '').slice(0, 4000) });
            }
        });
        messages.push({ role: 'user', content: userText });
        const body = { model, messages, temperature: 0.4, stream: true };
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(cfg.apiKey ? { Authorization: 'Bearer ' + cfg.apiKey } : {})
            },
            body: JSON.stringify(body)
        });
        if (!res.ok) {
            const t = await res.text();
            throw new Error(t.slice(0, 200) || res.statusText);
        }
        const ctype = String(res.headers.get('content-type') || '');
        if (!res.body || !/event-stream|octet-stream|text\/plain/i.test(ctype) && !ctype.includes('json')) {
            /* fall through to stream reader anyway */
        }
        if (res.body && typeof res.body.getReader === 'function') {
            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let acc = '';
            let buffer = '';
            let sawSse = false;
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                if (buffer.indexOf('data:') !== -1) sawSse = true;
                const lines = buffer.split(/\r?\n/);
                buffer = lines.pop() || '';
                lines.forEach((line) => {
                    const t = line.trim();
                    if (!t.startsWith('data:')) return;
                    const delta = parseSseDelta(t.slice(5).trim());
                    if (delta) {
                        acc += delta;
                        if (onDelta) onDelta(acc);
                    }
                });
            }
            if (buffer.trim().startsWith('data:')) {
                const delta = parseSseDelta(buffer.trim().slice(5).trim());
                if (delta) {
                    acc += delta;
                    if (onDelta) onDelta(acc);
                }
            }
            if (acc) return acc;
            if (!sawSse && buffer) {
                try {
                    const data = JSON.parse(buffer);
                    const msg = data.choices && data.choices[0] && data.choices[0].message;
                    return (msg && msg.content != null ? String(msg.content).trim() : '') || '（模型返回为空）';
                } catch (e) { /* ignore */ }
            }
        }
        const raw = await res.text();
        try {
            const data = JSON.parse(raw);
            const msg = data.choices && data.choices[0] && data.choices[0].message;
            return (msg && msg.content != null ? String(msg.content).trim() : '') || '（模型返回为空）';
        } catch (e) {
            return raw || '（模型返回为空）';
        }
    }

    function buildBossBriefing() {
        const state = root.currentState || {};
        const fw = state.capabilityFramework || [];
        const ids = root.getPriorityRedIdSet ? root.getPriorityRedIdSet(fw) : null;
        const displayOf = (c) => (root.heatDisplayCategory ? root.heatDisplayCategory(c, ids) : root.heatCategory(c));
        const reds = fw.filter((c) => displayOf(c) === 'red').map((c) => c.l3).filter(Boolean);
        const watches = fw.filter((c) => displayOf(c) === 'watch').map((c) => c.l3).filter(Boolean);
        const yels = fw.filter((c) => displayOf(c) === 'yellow').map((c) => c.l3).filter(Boolean);
        const sorted = typeof root.sortInitiativesByPhase === 'function'
            ? root.sortInitiativesByPhase(state.initiatives || [])
            : (state.initiatives || []).slice();
        const p0 = sorted.filter((i) => i.phase === 'P0').slice(0, 3);
        const p1 = sorted.filter((i) => i.phase === 'P1').slice(0, 3);
        const p2 = sorted.filter((i) => i.phase === 'P2').slice(0, 2);
        const vsName = state.valueStreamName || '营销服价值流';
        const months = state.roadmapMonths || 18;
        const horizon = months >= 18 ? '十八个月' : `${months} 个月`;
        const p0Titles = p0.map((i) => i.title);
        while (p0Titles.length < 3 && sorted[p0Titles.length]) p0Titles.push(sorted[p0Titles.length].title);
        const redShow = reds.slice(0, 4);
        const script = [
            `各位，今天只拍板三件事。我们看的是「${vsName}」，先把业务链路理清，再谈要不要加系统。`,
            redShow.length
                ? `第一，热力红区在${redShow.join('、')}${reds.length > 4 ? ' 等' : ''}。这些块不补，投放越猛，漏斗越漏。`
                : '第一，能力热力目前没有成片标红，但黄区仍要按主题收口，避免各自为政。',
            p0Titles.length
                ? `第二，近半年只做这 ${Math.min(3, p0Titles.length)} 件 P0：${p0Titles.slice(0, 3).join('；')}。`
                : '第二，请先生成变革举措，再把近半年的 P0 压到三件以内。',
            `第三，${horizon}分三浪：0–6 月止血建中台，6–12 月拉通战役与履约，12–18 月把拥护做成可经营的数字。`
        ];
        return {
            vsName,
            months,
            reds: redShow,
            redCount: reds.length,
            watchCount: watches.length,
            yellowCount: yels.length,
            p0s: p0.length ? p0 : sorted.slice(0, 3),
            waves: [
                { label: '0–6 月 · 止血', items: (p0.length ? p0 : sorted.slice(0, 2)).map((i) => i.title) },
                { label: '6–12 月 · 拉通', items: (p1.length ? p1 : sorted.slice(2, 4)).map((i) => i.title) },
                { label: '12–18 月 · 经营', items: p2.length ? p2.map((i) => i.title) : ['红区复盘转绿', '会员拥护做成经营数字'] }
            ],
            script,
            scriptText: script.join('\n\n')
        };
    }

    function briefingHtml(brief) {
        const lis = (arr) => (arr && arr.length ? arr.map((x) => `<li>${escapeChat(x)}</li>`).join('') : '<li>待生成</li>');
        return `
            <div class="wb-top">
                <p class="wb-kicker" style="margin:0">七步评估稿</p>
                <button type="button" class="off" onclick="hideBossBriefing()">回到路标</button>
            </div>
            <p class="wb-kicker">${escapeChat(brief.vsName)} · ${brief.months} 个月</p>
            <h2>今天只拍板三件事。</h2>
            <p class="wb-sub">优先短板最多五项。下列数字是评估建议，请用贵司经营数据确认后再对外使用。</p>
            <div class="wb-grid three">
                <div class="wb-card"><b>优先短板</b><ul>${lis(brief.reds)}${brief.watchCount ? `<li>另有 ${brief.watchCount} 项列入观察</li>` : ''}${brief.yellowCount ? `<li>${brief.yellowCount} 项可纳入后续计划</li>` : ''}</ul></div>
                <div class="wb-card"><b>近半年三件事</b><ul>${lis(brief.p0s.map((i) => i.title))}</ul></div>
                <div class="wb-card"><b>投资节奏</b><ul>${brief.waves.map((w) => `<li>${escapeChat(w.label)}：${escapeChat((w.items || []).join('、') || '—')}</li>`).join('')}</ul></div>
            </div>
            <div class="wb-script">${brief.script.map((p) => `<p>${escapeChat(p)}</p>`).join('')}</div>
            <div class="wb-actions">
                <button type="button" class="on" onclick="copyBossBriefing()">复制评估稿</button>
                <button type="button" class="off" onclick="hideBossBriefing();setStep(7)">看甘特</button>
                <button type="button" class="off" onclick="hideBossBriefing();setStep(5)">看热力</button>
            </div>`;
    }

    function injectBriefingOverlay() {
        if ($('wendao-briefing')) return;
        const el = document.createElement('div');
        el.id = 'wendao-briefing';
        el.className = 'wendao-briefing hidden';
        el.setAttribute('role', 'dialog');
        el.setAttribute('aria-label', '三分钟评估稿');
        el.innerHTML = '<div class="wendao-briefing-inner" id="wendao-briefing-inner"></div>';
        document.body.appendChild(el);
    }

    async function openBossBriefing() {
        if (root.toast) root.toast('请到第七步点保存，会生成可发给客户的评估过程册');
        if (typeof root.setStep === 'function') root.setStep(7);
    }

    function hideBossBriefing() {
        const el = $('wendao-briefing');
        if (el) el.classList.add('hidden');
    }

    async function copyBossBriefing() {
        const brief = buildBossBriefing();
        try {
            await navigator.clipboard.writeText(brief.scriptText);
            root.toast('评估稿已复制');
        } catch (e) {
            root.toast('复制失败，请手动选中文稿', 'error');
        }
    }

    function injectBriefingStrip() {
        const step = $('step-7');
        if (!step || $('wendao-brief-strip')) return;
        if (!(root.currentState.initiatives || []).length) return;
        const brief = buildBossBriefing();
        const strip = document.createElement('div');
        strip.id = 'wendao-brief-strip';
        strip.innerHTML = `
            <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                    <p class="wb-kicker">评估稿</p>
                    <p class="wb-line">按工作台 1–7 步原页截图，打开后可翻页、下载 HTML 当汇报底稿。</p>
                </div>
                <button type="button" onclick="openBossBriefing()">打开评估稿</button>
            </div>`;
        const head = step.querySelector('.flex.items-start.gap-2, .flex.items-start.gap-2.sm\\:gap-3');
        if (head && head.parentNode) head.insertAdjacentElement('afterend', strip);
        else step.insertBefore(strip, step.firstChild);
    }

    async function runAgentFullPlan(brief, opts) {
        const options = opts || {};
        const q = studioQuery();
        const caseId = options.caseId || q.get('case') || '';
        const text = String(brief || $('ai-user-input') && $('ai-user-input').value || '').trim();
        const item = caseId && root.getWendaoCaseById ? root.getWendaoCaseById(caseId) : null;
        const seed = text || (item && item.brief) || root.currentState.bmc.valuePropositions || '';
        if (String(seed).trim().length < 8) {
            root.toast('请先用一句话说明行业、客群和最痛的环节，再生成路标', 'error');
            return;
        }
        if (!root.aiDrawerVisible) root.toggleAiDrawer();
        appendAiChat('user', seed);
        appendAiChat('assistant', '正在把输入推演到举措与路标…', { pending: true });

        const cfg = root.loadAiConfig();
        if (cfg.needsProvider || (cfg.apiKey && !cfg.endpoint)) {
            if (root.openAiSettings) root.openAiSettings('请先点选 Key 所属平台，再保存并试连');
            const local = runLocalFullPlan(seed, { caseId, landOn: options.landOn || 'initiatives' });
            appendAiChat('assistant', local.summary + '\n\n右侧助手还没对上平台。请在齿轮里点选硅基流动 / OpenAI / OpenRouter / DeepSeek，保存并试连后再用模型改稿。');
            root.toast('请先在齿轮里选对平台');
            return;
        }
        if (cfg.endpoint && cfg.apiKey) {
            try {
                const ctx = root.buildAiContextSnapshot();
                const systemText = '你是 YOWAY 评估助手，面向企业业务负责人。用业务语言输出可执行的变革事项与路标，禁止空话和内部方法论辩白。'
                    + root.buildAiWorkflowPatchSystemSuffix();
                const userText = `任务：根据业务简述，一次生成完整规划并写入 workflowPatch（必须包含 bmc、valueStreamName、stages、capabilities、initiatives、roadmap）。\n`
                    + `硬性：initiatives 4～6 条，按主题合并而非每个能力一条；每条含 title,caps,gaps,window,benefit,cost,phase(P0|P1|P2),tech,deps,streams(子路标 start/len)。roadmap.months 建议 18。\n`
                    + `行业默认 3C。价值流优先用营销/电商5A/零售O2O/服务ITR/GTM/渠道交易，不要做成纯研发链，除非用户明确要 IPD。\n`
                    + `案例提示：${item ? item.title + ' / ' + item.templateId : '无'}\n`
                    + `上下文：\n${JSON.stringify(ctx).slice(0, 8000)}\n业务简述：\n${String(seed).slice(0, 2500)}`;
                appendAiChat('assistant', '', { pending: true });
                const reply = await callChat(systemText, userText, [], updateStreamingAssistant);
                const applied = tryAutoApplyPatch(reply);
                if (!applied || !applied.ok || !(root.currentState.initiatives || []).length) {
                    runLocalFullPlan(seed, { caseId, landOn: options.landOn || 'roadmap' });
                    appendAiChat('assistant', (reply || '') + '\n\n〔云端补丁不完整，已用本地引擎补齐举措与路标〕');
                } else {
                    if (!(root.currentState.vsStages || []).length) applyTemplateSilent(inferTemplateFromBrief(seed));
                    if (!(root.currentState.capabilityFramework || []).length) root.runFrameworkGen({ silent: true });
                    if (!(root.currentState.initiatives || []).length) buildThematicInitiatives();
                    root.currentState.step = options.landOn === 'roadmap' ? 7 : 6;
                    root.currentState.activePanel = 'workflow';
                    root.renderNav(); root.renderStepProgress(); root.renderStep();
                    appendAiChat('assistant', reply);
                }
                root.toast('评估已写入工作台，可继续对话微调');
                if (options.landOn === 'roadmap' || options.openBriefing) {
                    root.setStep(7);
                }
                return;
            } catch (e) {
                console.error(e);
                const local = runLocalFullPlan(seed, { caseId, landOn: options.landOn || 'initiatives' });
                appendAiChat('assistant', local.summary + '\n智能助手暂未连接，已按' + chatUserName() + '的描述生成完整评估，可继续在对话里微调。');
                root.toast('评估已生成，可继续微调');
                if (options.landOn === 'roadmap' || options.openBriefing) {
                    root.setStep(7);
                }
                return;
            }
        }

        const local = runLocalFullPlan(seed, { caseId, landOn: options.landOn || 'initiatives' });
        await streamLocalText(local.summary + '\n\n' + chatUserName() + '可以继续这样说：\n· 「把售后提到最优先，路标压缩到 12 个月」\n· 「事项再少两条，只留最影响经营的」\n· 「走到第七步点保存，会生成可发给客户的过程册」');
        root.toast(local.summary);
        if (options.landOn === 'roadmap' || options.openBriefing) {
            root.setStep(7);
        }
    }

    function currentStudioStep() {
        if (root.getAiStepId) return root.getAiStepId();
        return (root.currentState && root.currentState.step) || 1;
    }

    function industryChatNote() {
        if (!root.getWendaoIndustryDomainBriefs) return '';
        const pack = root.getWendaoIndustryDomainBriefs(root.currentState && root.currentState.workflowIndustry);
        if (!pack || !pack.domains.length) return '';
        return '当前对照「' + pack.name + '」：' + pack.domains.map(function (d) { return d.kicker; }).join('、') + '。不编造贵司数字。';
    }

    function withFocusFollow(text, source) {
        const q = root.getStepFocusQuestion ? root.getStepFocusQuestion() : null;
        const ask = q && q.ask ? q.ask : '';
        const tag = source === 'dialog' ? '〔对话写入〕' : source === 'draft' ? '〔本地草稿〕' : '';
        const bits = [String(text || '').trim()];
        if (tag) bits.push(tag);
        if (ask) bits.push('接下来仍只问一件：' + ask);
        const note = industryChatNote();
        if (note) bits.push(note);
        return bits.filter(Boolean).join('\n\n');
    }

    async function sendStudioMessage() {
        const inputEl = $('ai-user-input');
        const userMsg = inputEl ? inputEl.value.trim() : '';
        if (!userMsg) {
            root.toast('请输入问题或业务描述', 'error');
            return;
        }
        appendAiChat('user', userMsg);
        if (inputEl) inputEl.value = '';
        const stepId = currentStudioStep();
        const cfg = root.loadAiConfig();
        const ctx = root.buildAiContextSnapshot ? root.buildAiContextSnapshot() : { stepTitle: '', stepId: stepId };
        const looksLikePlan = /生成评估路标|一键生成路标|完整路标|生成一份路标/i.test(userMsg);

        if (looksLikePlan && stepId >= 6) {
            await runAgentFullPlan(userMsg, { landOn: 'initiatives' });
            if (root.syncAiApplyButton) root.syncAiApplyButton();
            return;
        }
        if (looksLikePlan && stepId < 6) {
            const q = root.getStepFocusQuestion ? root.getStepFocusQuestion(stepId) : null;
            await streamLocalText(stepId === 1
                ? '当前在第一步「商业画布」。我只会改左侧九宫格，不会跳到路标。生成路标请先走到第 6 步。\n\n仍只问一件：' + (q && q.ask ? q.ask : '主要卖给谁？')
                : ('当前在第 ' + stepId + ' 步。生成评估路标请先走到第 6 步。\n\n仍只问一件：' + (q && q.ask ? q.ask : '只说一件事。')));
            return;
        }

        if (cfg.needsProvider || (cfg.apiKey && !cfg.endpoint)) {
            if (root.openAiSettings) root.openAiSettings('请先点选 Key 所属平台，再保存并试连');
            await streamLocalText(withFocusFollow('这份 Key 还没对上平台。请在上方齿轮点选硅基流动 / OpenAI / OpenRouter / DeepSeek，保存并试连后再问。', ''));
            if (root.syncAiApplyButton) root.syncAiApplyButton();
            return;
        }
        if (!cfg.endpoint && !cfg.apiKey) {
            if (root.openAiSettings) root.openAiSettings('请先选平台、粘贴 Key，再点保存并试连');
            if (stepId === 1 && root.refineBmcFromUserText) {
                root.refineBmcFromUserText(userMsg);
                await streamLocalText(withFocusFollow('尚未连接智能助手。已把说明记为本地草稿。打开齿轮选平台并粘贴 Key 后再用模型改。', 'draft'), { source: 'draft' });
            } else {
                await streamLocalText(withFocusFollow('尚未连接智能助手。请打开齿轮：选平台、粘贴 Key、保存并试连。', ''));
            }
            if (root.syncAiApplyButton) root.syncAiApplyButton();
            return;
        }

        appendAiChat('assistant', '', { pending: true });
        try {
            const suffix = root.buildAiWorkflowPatchSystemSuffix
                ? root.buildAiWorkflowPatchSystemSuffix(stepId === 1 ? { bmcOnly: true, stepId: 1 } : { stepId: stepId })
                : '';
            const focusAsk = (root.getStepFocusQuestion && root.getStepFocusQuestion(stepId).ask) || '';
            const systemText = (stepId === 1
                ? '你是商业画布顾问。只改九宫格，禁止生成举措、价值流或路标，禁止建议跳步。简体中文。先三到六句人话，只追问这一件：' + focusAsk + ' 再给只含 bmc 的 json 补丁。'
                : '你是 YOWAY 评估助手。面向企业业务负责人，用对方能听懂的话调优当前步骤：只改与本步相关的字段，不要无故清空其它模块，不要跳步。简体中文，先给三到六句人话，只追问这一件：' + focusAsk + ' 再给 json 补丁。')
                + suffix;
            const userText = stepId === 1
                ? ('当前步骤：商业画布。只输出 workflowPatch.bmc。\n行业：' + (ctx.workflowIndustry || '') + '\n当前画布：\n' + JSON.stringify(ctx.bmc || {}, null, 2) + '\n用户：' + userMsg)
                : ('当前步骤：' + (ctx.stepTitle || '') + '\n上下文：\n' + JSON.stringify(ctx).slice(0, 9000) + '\n用户：' + userMsg + '\n只改与本步相关的字段。');
            const history = aiChatHistory.filter((m) => !m.pending).slice(-7, -1);
            const reply = await callChat(systemText, userText, history, updateStreamingAssistant);
            const applied = tryAutoApplyPatch(reply);
            if (applied && applied.ok) {
                appendAiChat('assistant', withFocusFollow(reply, 'dialog'), { source: 'dialog' });
                root.toast('对话写入：' + (applied.summary || '当前步骤'));
            } else if (stepId === 1 && root.refineBmcFromUserText && root.refineBmcFromUserText(userMsg)) {
                appendAiChat('assistant', withFocusFollow(reply || '模型未给出补丁，已把说明记为本地草稿。', 'draft'), { source: 'draft' });
                root.toast('本地草稿已记到画布');
            } else {
                appendAiChat('assistant', withFocusFollow(reply, ''));
                root.toast('已回复。把本步这一问说具体后再试');
            }
        } catch (e) {
            if (root.YouweiAi && YouweiAi.setLastRaw) YouweiAi.setLastRaw('');
            const friendly = (e && e.friendly)
                || (root.YouweiAi && YouweiAi.friendlyError && YouweiAi.friendlyError(e))
                || '智能助手暂时连不上。请在齿轮里检查 Key，或先改左侧内容。';
            const authFail = /不认这份 Key|请先点选|请先选平台|拒绝了|密钥无效|authentication|api key/i.test(friendly);
            if (stepId === 1 && !authFail && root.refineBmcFromUserText) root.refineBmcFromUserText(userMsg);
            if (authFail && root.openAiSettings) root.openAiSettings();
            appendAiChat('assistant', withFocusFollow(friendly + (authFail
                ? '\n请在齿轮里改选开 Key 的平台，再点「保存并试连」。'
                : (stepId === 1 ? '\n刚说的内容已记为本地草稿。本步不会生成路标。' : '')), stepId === 1 && !authFail ? 'draft' : ''), { source: stepId === 1 && !authFail ? 'draft' : undefined });
        }
        if (root.syncAiApplyButton) root.syncAiApplyButton();
    }

    function openGuideOverlay() {
        const el = $('wendao-guide');
        if (el) el.classList.remove('hidden');
        const q = studioQuery();
        const item = root.getWendaoCaseById && root.getWendaoCaseById(q.get('case'));
        const ta = $('guide-brief');
        if (ta && !ta.value.trim()) {
            ta.value = item ? item.brief : '我们是消费电子品牌，线上商城、京东/天猫和体验店一起卖。最痛的是投放和成交接不上、门店库存对不上、售后工单回不到产品。希望先把营销、零售和服务这条链评估清楚，给出近一年半的路标。';
        }
        const wm = root.currentState && root.currentState.workspaceMeta ? root.currentState.workspaceMeta : {};
        if ($('guide-org') && !$('guide-org').value) $('guide-org').value = wm.organizationName || '';
        if ($('guide-project') && !$('guide-project').value) $('guide-project').value = wm.projectName || '';
        if ($('guide-horizon') && !$('guide-horizon').value) $('guide-horizon').value = wm.planningHorizon || '2026–2027';
        if ($('guide-sponsor') && !$('guide-sponsor').value) $('guide-sponsor').value = wm.sponsor || '';
    }

    function hideGuideOverlay(persist) {
        const el = $('wendao-guide');
        if (el) el.classList.add('hidden');
        if (persist) {
            try { localStorage.setItem(GUIDE_LS, '1'); } catch (e) { /* ignore */ }
        }
    }

    function readGuideEngagement() {
        const payload = {
            organizationName: ($('guide-org') && $('guide-org').value) || '',
            projectName: ($('guide-project') && $('guide-project').value) || '',
            planningHorizon: ($('guide-horizon') && $('guide-horizon').value) || '',
            sponsor: ($('guide-sponsor') && $('guide-sponsor').value) || ''
        };
        if (typeof root.applyEngagement === 'function') root.applyEngagement(payload);
        else if (root.currentState) {
            const wm = root.currentState.workspaceMeta || (root.currentState.workspaceMeta = {});
            Object.keys(payload).forEach((k) => { if (payload[k]) wm[k] = payload[k]; });
        }
        if (typeof root.renderEngagementChrome === 'function') root.renderEngagementChrome();
    }

    function startBeginnerFromGuide() {
        readGuideEngagement();
        hideGuideOverlay(true);
        if (typeof root.setStep === 'function') root.setStep(1);
        root.toast('已记下评估信息。请从左侧第一步画布开始，或换行业看示范九宫格。');
    }

    function startBossDemo() {
        hideGuideOverlay(true);
        location.href = 'index.html#cases';
    }

    function startProMode() {
        hideGuideOverlay(true);
        root.setStep(1);
        root.toast('您可以按左侧步骤逐项填写，右下角助手随时可以帮忙');
    }

    function injectGuideOverlay() {
        if ($('wendao-guide')) return;
        const wrap = document.createElement('div');
        wrap.id = 'wendao-guide';
        wrap.className = 'wendao-guide hidden';
        wrap.innerHTML = `
            <div class="wendao-guide-card" role="dialog" aria-label="开始评估">
                <button type="button" class="wg-close" onclick="hideGuideOverlay(true)" aria-label="关闭">×</button>
                <p class="wendao-guide-brand"><span>友为</span><i>Yoway</i></p>
                <p class="wendao-guide-kicker">从战略到执行</p>
                <h2>从第一步画布开始</h2>
                <p class="wendao-guide-lead">先对齐商业模式和业务规划，再审视业务痛点与能力差距，最后明确变革举措和路标规划。</p>
                <p class="wendao-guide-path">定方向 · 建架构 · 抓落地</p>
                <div class="grid gap-2" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:22px 0 10px">
                    <input id="guide-org" placeholder="企业名称" style="border:1px solid rgba(22,21,19,.12);border-radius:0;padding:10px 12px;font-size:15px;background:#fff">
                    <input id="guide-project" placeholder="评估项目" style="border:1px solid rgba(22,21,19,.12);border-radius:0;padding:10px 12px;font-size:15px;background:#fff">
                    <input id="guide-horizon" placeholder="规划周期 如 2026–2027" style="border:1px solid rgba(22,21,19,.12);border-radius:0;padding:10px 12px;font-size:15px;background:#fff">
                    <input id="guide-sponsor" placeholder="负责人" style="border:1px solid rgba(22,21,19,.12);border-radius:0;padding:10px 12px;font-size:15px;background:#fff">
                </div>
                <textarea id="guide-brief" rows="3" placeholder="可选：行业、客群、现在最痛的环节（稍后也可在画布里改）"></textarea>
                <div class="wendao-guide-actions">
                    <button type="button" class="wg-ghost" onclick="startBossDemo()">回首页看场景</button>
                    <button type="button" class="wg-text" onclick="startProMode()">直接看工作台</button>
                    <button type="button" class="wg-primary" onclick="startBeginnerFromGuide()">进入第一步</button>
                </div>
            </div>`;
        document.body.appendChild(wrap);
    }

    function enhanceHeader() {
        const host = document.querySelector('#app-header .flex.shrink-0');
        if (!host || $('btn-home-link')) return;
        const bar = document.createElement('div');
        bar.className = 'flex items-center gap-1.5 print-hidden';
        bar.innerHTML = `
            <a id="btn-home-link" href="index.html" class="inline-flex items-center rounded-[10px] border border-black/[0.08] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-ink-secondary hover:bg-canvas">首页</a>
            <a href="index.html#cases" class="inline-flex items-center rounded-[10px] border border-black/[0.08] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-ink-secondary hover:bg-canvas">行业案例</a>
            `;
        host.insertBefore(bar, host.firstChild);
    }

    function enhanceAiDrawer() {
        const box = document.querySelector('#ai-assistant-drawer .px-3.py-2.flex-1');
        if (!box) return;
        const leftover = $('btn-agent-fullplan');
        if (leftover && leftover.parentNode) leftover.parentNode.removeChild(leftover);
        const input = $('ai-user-input');
        if (input) input.rows = 3;
        const out = $('ai-output');
        if (out) {
            out.classList.add('ai-chat-thread');
            out.classList.remove('whitespace-pre-wrap');
        }
        renderAiChat();
        if (root.syncAiApplyButton) root.syncAiApplyButton();
    }

    function wrapInitiativesGen() {
        const orig = root.runInitiativesGen;
        if (!orig || orig.__wendaoWrapped) return;
        root.runInitiativesGen = function (opts) {
            const silent = !!(opts && opts.silent);
            if (!root.currentState.capabilityFramework.length) return orig(opts);
            const ok = buildThematicInitiatives();
            if (!silent) {
                root.renderStep6();
                root.toast('已生成优先事项，可再对话微调');
            }
            return ok;
        };
        root.runInitiativesGen.__wendaoWrapped = true;
    }

    function wrapSendMessage() {
        root.sendAiFreeMessage = sendStudioMessage;
    }

    function wrapQuickActions() {
        const origRun = root.runAiQuickAction;
        if (origRun && !origRun.__wendaoExecWrapped) {
            root.runAiQuickAction = async function (actionId) {
                if (!root.aiDrawerVisible && typeof root.toggleAiDrawer === 'function') root.toggleAiDrawer();
                return origRun(actionId);
            };
            root.runAiQuickAction.__wendaoExecWrapped = true;
        }
        const origApply = root.applyAiWorkflowPatchFromOutput;
        if (origApply && !origApply.__wendaoWrapped) {
            root.applyAiWorkflowPatchFromOutput = function () {
                const raw = root.YouweiAi && YouweiAi.lastRaw ? YouweiAi.lastRaw() : '';
                if (raw && root.extractWorkflowPatchFromText && root.applyWorkflowPatchObject) {
                    let wp = root.extractWorkflowPatchFromText(raw);
                    if (wp && root.restrictWorkflowPatchToStep) wp = root.restrictWorkflowPatchToStep(wp);
                    if (wp) {
                        const r = root.applyWorkflowPatchObject(wp);
                        if (r && r.ok) {
                            root.toast('已写入：' + (r.summary || '当前步骤'));
                            if (root.syncAiApplyButton) root.syncAiApplyButton();
                            return;
                        }
                    }
                }
                const ret = origApply();
                if (root.syncAiApplyButton) root.syncAiApplyButton();
                return ret;
            };
            root.applyAiWorkflowPatchFromOutput.__wendaoWrapped = true;
        }
        const orig = root.refreshAiAssistantUi;
        if (orig && !orig.__wendaoWrapped) {
            root.refreshAiAssistantUi = function () {
                orig();
                if (!aiChatHistory.length) renderAiChat();
            };
            root.refreshAiAssistantUi.__wendaoWrapped = true;
        }
    }

    function bootstrapWendaoStudio() {
        if (studioBooted) return;
        studioBooted = true;
        injectGuideOverlay();
        const q = studioQuery();
        const caseId = q.get('case') || '';
        try { if (caseId) applyCaseContext(caseId); } catch (e) { console.error(e); }
        try { enhanceHeader(); } catch (e) { console.error(e); }
        try { enhanceAiDrawer(); } catch (e) { console.error(e); }
        try { wrapInitiativesGen(); } catch (e) { console.error(e); }
        try { wrapSendMessage(); } catch (e) { console.error(e); }
        try { wrapQuickActions(); } catch (e) { console.error(e); }
        try { wrapRenderStep7(); } catch (e) { console.error(e); }
        try { if (typeof root.refreshAiAssistantUi === 'function') root.refreshAiAssistantUi(); } catch (e) { console.error(e); }

        hideGuideOverlay(true);
        if (caseId) {
            const item = applyCaseContext(caseId);
            const ind = (item && item.industry) || (root.currentState && root.currentState.workflowIndustry);
            if (root.applyIndustryBmcPreset && ind) root.applyIndustryBmcPreset(ind, { silent: true });
            if (typeof root.renderNav === 'function') root.renderNav();
            if (typeof root.renderStepProgress === 'function') root.renderStepProgress();
            if (typeof root.setStep === 'function') root.setStep(1);
            else if (typeof root.renderStep === 'function') root.renderStep();
            root.toast(item ? ('已带入「' + item.title + '」场景，请从画布改成贵司情况') : '已进入工作台');
        }
    }

    root.bootstrapWendaoStudio = bootstrapWendaoStudio;
    root.openGuideOverlay = openGuideOverlay;
    root.hideGuideOverlay = hideGuideOverlay;
    root.startBeginnerFromGuide = startBeginnerFromGuide;
    root.startBossDemo = startBossDemo;
    root.startProMode = startProMode;
    function wrapRenderStep7() {
        return;
    }

    root.appendAiStudioLine = appendAiStudioLine;
    root.runLocalFullPlan = runLocalFullPlan;
    root.runAgentFullPlan = runAgentFullPlan;
    root.buildThematicInitiatives = buildThematicInitiatives;
    root.openBossBriefing = openBossBriefing;
    root.hideBossBriefing = hideBossBriefing;
    root.copyBossBriefing = copyBossBriefing;
    root.buildBossBriefing = buildBossBriefing;
})(window);
