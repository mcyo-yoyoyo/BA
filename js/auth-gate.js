/**
 * 登录门禁（前端会话）。C 端工作台与 B 端运营后台共用会话，按角色分流。
 */
(function (global) {
    const SESSION_KEY = 'youwei_session_v1';
    const HASH_PREFIX = 'youwei.v1:';

    function accountsTable() {
        return global.YOUWEI_LOCAL_ACCOUNTS || global.YOUWEI_ACCOUNTS || {};
    }

    function accountOf(user) {
        const table = accountsTable();
        const key = String(user || '').trim().toLowerCase();
        const acc = table[key];
        if (!acc || !acc.hash || !acc.role) return null;
        return { hash: String(acc.hash).toLowerCase(), role: String(acc.role) };
    }

    function isAuthed() {
        const s = readSession();
        if (!s || !s.user || !s.at) return false;
        if (s.role === 'admin' || s.role === 'client') return true;
        return !!accountOf(s.user);
    }

    function readSession() {
        try {
            return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
        } catch (e) {
            return null;
        }
    }

    function currentUser() {
        const s = readSession();
        return s && s.user ? s.user : '';
    }

    function currentRole() {
        const s = readSession();
        if (s && s.role) return s.role;
        const acc = accountOf(s && s.user);
        return acc ? acc.role : '';
    }

    function isAdmin() {
        return currentRole() === 'admin';
    }

    function roleLabel() {
        return isAdmin() ? '运营' : '评估';
    }

    function permissionLines() {
        return isAdmin()
            ? ['工作台评估', '管理台配置', '本机线索', '场景上架', '底稿导出']
            : ['工作台评估', '本机保存底稿'];
    }

    function escText(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
    }

    function avatarGlyph(user) {
        const u = String(user || '').trim();
        return u ? u.slice(0, 1).toUpperCase() : '·';
    }

    function mountAccountMenu(host) {
        injectStyles();
        const el = host || document.getElementById('youwei-account-host');
        if (!el || !isAuthed()) return;
        const user = currentUser();
        if (el.dataset.acct === user && document.getElementById('youwei-acct')) return;
        el.dataset.acct = user;
        el.innerHTML =
            '<div class="youwei-acct" id="youwei-acct">' +
                '<button type="button" class="youwei-acct-btn" id="youwei-acct-btn" aria-haspopup="true" aria-expanded="false" aria-label="账号菜单">' +
                    '<span class="youwei-acct-avatar">' + escText(avatarGlyph(user)) + '</span>' +
                '</button>' +
                '<div class="youwei-acct-pop hidden" id="youwei-acct-pop" role="menu">' +
                    '<p class="youwei-acct-k">账号</p>' +
                    '<p class="youwei-acct-v">' + escText(user) + '</p>' +
                    '<p class="youwei-acct-k">角色</p>' +
                    '<p class="youwei-acct-v">' + escText(roleLabel()) + '</p>' +
                    '<p class="youwei-acct-k">权限</p>' +
                    '<ul class="youwei-acct-perms">' + permissionLines().map(function (p) {
                        return '<li>' + escText(p) + '</li>';
                    }).join('') + '</ul>' +
                    '<button type="button" class="youwei-acct-out" id="youwei-acct-out">退出</button>' +
                '</div>' +
            '</div>';
        const wrap = document.getElementById('youwei-acct');
        const btn = document.getElementById('youwei-acct-btn');
        const pop = document.getElementById('youwei-acct-pop');
        const out = document.getElementById('youwei-acct-out');
        if (!wrap || !btn || !pop) return;
        function close() {
            pop.classList.add('hidden');
            btn.setAttribute('aria-expanded', 'false');
        }
        function toggle() {
            const on = pop.classList.toggle('hidden') === false;
            btn.setAttribute('aria-expanded', on ? 'true' : 'false');
        }
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            toggle();
        });
        if (out) out.addEventListener('click', function () {
            logout();
            location.href = 'index.html';
        });
        document.addEventListener('click', function (e) {
            if (!wrap.contains(e.target)) close();
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') close();
        });
    }

    function hexOfBuffer(buf) {
        return Array.from(new Uint8Array(buf)).map(function (b) {
            return b.toString(16).padStart(2, '0');
        }).join('');
    }

    async function sha256Hex(text) {
        if (!global.crypto || !crypto.subtle || typeof crypto.subtle.digest !== 'function') {
            throw new Error('NO_CRYPTO');
        }
        const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
        return hexOfBuffer(buf);
    }

    async function login(user, pass) {
        const u = String(user || '').trim().toLowerCase();
        const p = String(pass || '');
        const acc = accountOf(u);
        if (!acc) return false;
        let hex = '';
        try {
            hex = await sha256Hex(HASH_PREFIX + u + ':' + p);
        } catch (e) {
            return false;
        }
        if (hex !== acc.hash) return false;
        localStorage.setItem(SESSION_KEY, JSON.stringify({ user: u, role: acc.role, at: Date.now() }));
        return true;
    }

    function logout() {
        localStorage.removeItem(SESSION_KEY);
        if (global.YouweiAi && typeof global.YouweiAi.clearKey === 'function') {
            YouweiAi.clearKey();
        } else {
            try { sessionStorage.removeItem('youwei_ai_key_session_v1'); } catch (e) { /* ignore */ }
        }
    }

    function workshopHref(href) {
        return String(href || '').indexOf('workshop.html') !== -1;
    }

    function ensureModal() {
        if (document.getElementById('youwei-login-modal')) return;
        const wrap = document.createElement('div');
        wrap.id = 'youwei-login-modal';
        wrap.className = 'youwei-login-modal hidden';
        wrap.innerHTML = `
            <div class="youwei-login-backdrop" data-login-close="1"></div>
            <div class="youwei-login-card" role="dialog" aria-modal="true" aria-labelledby="youwei-login-title">
                <button type="button" class="youwei-login-x" data-login-close="1" aria-label="Close">×</button>
                <p class="youwei-login-brand"><span>友为</span><i>Yoway</i></p>
                <p class="youwei-login-kicker" id="youwei-login-kicker">从战略到执行</p>
                <h2 id="youwei-login-title">开始评估</h2>
                <p class="youwei-login-lead" id="youwei-login-lead">先对齐商业模式和业务规划，再审视业务痛点与能力差距，最后明确变革举措和路标规划。</p>
                <p class="youwei-login-path" id="youwei-login-path">定方向 · 建架构 · 抓落地</p>
                <form id="youwei-login-form" autocomplete="on">
                    <label><span id="youwei-login-user-lab">账号</span>
                        <input id="youwei-login-user" name="username" type="text" required placeholder="请输入账号" autocomplete="username">
                    </label>
                    <label><span id="youwei-login-pass-lab">密码</span>
                        <input id="youwei-login-pass" name="password" type="password" required placeholder="请输入密码" autocomplete="current-password">
                    </label>
                    <p id="youwei-login-error" class="youwei-login-error hidden">账号或密码不正确。</p>
                    <div class="youwei-login-actions">
                        <button type="button" class="youwei-login-ghost" data-login-close="1" id="youwei-login-cancel">取消</button>
                        <button type="submit" class="youwei-login-submit" id="youwei-login-submit">开始评估</button>
                    </div>
                </form>
                <div class="youwei-login-aside" id="youwei-login-aside">
                    <p class="youwei-login-aside-k" id="youwei-lead-kicker">还没有账号</p>
                    <p class="youwei-login-aside-d" id="youwei-lead-lead">留下姓名与手机，我们会约评估。</p>
                    <form id="youwei-lead-form">
                        <div class="youwei-lead-row">
                            <input id="youwei-lead-name" name="name" type="text" autocomplete="name" placeholder="姓名">
                            <input id="youwei-lead-phone" name="phone" type="tel" autocomplete="tel" placeholder="手机">
                        </div>
                        <input id="youwei-lead-note" class="youwei-lead-note hidden" name="note" type="text" placeholder="行业与希望评估的卡点（选填）">
                        <p class="youwei-lead-msg hidden" id="youwei-lead-msg"></p>
                        <div class="youwei-lead-actions">
                            <button type="button" class="youwei-lead-contact" id="youwei-lead-contact">联系我们</button>
                            <button type="submit" class="youwei-lead-submit" id="youwei-lead-submit">留下</button>
                        </div>
                    </form>
                </div>
            </div>`;
        document.body.appendChild(wrap);

        wrap.addEventListener('click', function (e) {
            if (e.target && e.target.getAttribute('data-login-close') === '1') closeModal();
        });
        document.getElementById('youwei-lead-contact').addEventListener('click', function () {
            const note = document.getElementById('youwei-lead-note');
            if (!note) return;
            note.classList.remove('hidden');
            const name = document.getElementById('youwei-lead-name');
            if (name) name.focus();
        });
        document.getElementById('youwei-lead-form').addEventListener('submit', function (e) {
            e.preventDefault();
            const name = String((document.getElementById('youwei-lead-name') || {}).value || '').trim();
            const phone = String((document.getElementById('youwei-lead-phone') || {}).value || '').trim();
            const note = String((document.getElementById('youwei-lead-note') || {}).value || '').trim();
            const msg = document.getElementById('youwei-lead-msg');
            if (!name || !phone) {
                if (msg) {
                    msg.textContent = t('leadNeed', '请留下姓名和手机。');
                    msg.classList.remove('hidden', 'is-ok');
                }
                return;
            }
            saveLead({ name: name, phone: phone, note: note, at: new Date().toISOString() });
            if (msg) {
                msg.textContent = t('leadOk', '已记下，我们会联系您。');
                msg.classList.remove('hidden');
                msg.classList.add('is-ok');
            }
            e.target.reset();
            const noteEl = document.getElementById('youwei-lead-note');
            if (noteEl) noteEl.classList.add('hidden');
        });
        document.getElementById('youwei-login-form').addEventListener('submit', async function (e) {
            e.preventDefault();
            const err = document.getElementById('youwei-login-error');
            const submit = document.getElementById('youwei-login-submit');
            if (submit) submit.disabled = true;
            let ok = false;
            try {
                ok = await login(
                    document.getElementById('youwei-login-user').value,
                    document.getElementById('youwei-login-pass').value
                );
            } catch (errLogin) {
                ok = false;
            }
            if (submit) submit.disabled = false;
            if (!ok) {
                err.classList.remove('hidden');
                return;
            }
            err.classList.add('hidden');
            const next = wrap.dataset.next || 'workshop.html?mode=pro';
            closeModal();
            location.href = next;
        });
    }

    function isAdminNext(href) {
        return String(href || '').indexOf('admin.html') !== -1;
    }

    function openModal(nextHref) {
        ensureModal();
        const wrap = document.getElementById('youwei-login-modal');
        wrap.dataset.next = nextHref || 'workshop.html?mode=pro';
        wrap.classList.remove('hidden');
        document.body.classList.add('youwei-modal-on');
        const err = document.getElementById('youwei-login-error');
        if (err) err.classList.add('hidden');
        syncModal();
        setTimeout(function () {
            const u = document.getElementById('youwei-login-user');
            if (u) u.focus();
        }, 30);
    }

    function t(key, fallback) {
        const I = global.YouweiI18n;
        if (I && typeof I.t === 'function') {
            const v = I.t(key);
            if (v && v !== key) return v;
        }
        return fallback;
    }

    function syncModal() {
        const wrap = document.getElementById('youwei-login-modal');
        if (!wrap) return;
        const admin = isAdminNext(wrap.dataset.next);
        const set = function (id, text) {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        };
        set('youwei-login-kicker', admin ? t('loginAdminKicker', '运营') : t('loginKicker', '从战略到执行'));
        set('youwei-login-title', admin ? t('loginAdminTitle', '进入管理台') : t('loginTitle', '开始评估'));
        set('youwei-login-lead', admin ? t('loginAdminLead', '改首页、模型与评估规则。') : t('loginLead', '先对齐商业模式和业务规划，再审视业务痛点与能力差距，最后明确变革举措和路标规划。'));
        set('youwei-login-path', t('loginPath', '定方向 · 建架构 · 抓落地'));
        const path = document.getElementById('youwei-login-path');
        if (path) path.style.display = admin ? 'none' : '';
        const user = document.getElementById('youwei-login-user');
        const pass = document.getElementById('youwei-login-pass');
        set('youwei-login-user-lab', t('loginUser', '账号'));
        set('youwei-login-pass-lab', t('loginPass', '密码'));
        if (user) user.placeholder = t('loginUserPh', '请输入账号');
        if (pass) pass.placeholder = t('loginPassPh', '请输入密码');
        set('youwei-login-error', t('loginErr', '账号或密码不正确。'));
        set('youwei-login-cancel', t('loginCancel', '取消'));
        set('youwei-login-submit', admin ? t('loginAdminSubmit', '进入') : t('loginSubmit', '开始评估'));
        const aside = document.getElementById('youwei-login-aside');
        if (aside) aside.style.display = admin ? 'none' : '';
        set('youwei-lead-kicker', t('leadKicker', '还没有账号'));
        set('youwei-lead-lead', t('leadLead', '留下姓名与手机，我们会约评估。'));
        const name = document.getElementById('youwei-lead-name');
        const phone = document.getElementById('youwei-lead-phone');
        const note = document.getElementById('youwei-lead-note');
        if (name) name.placeholder = t('leadNamePh', '姓名');
        if (phone) phone.placeholder = t('leadPhonePh', '手机');
        if (note) note.placeholder = t('leadNotePh', '行业与希望评估的卡点（选填）');
        set('youwei-lead-contact', t('leadContact', '联系我们'));
        set('youwei-lead-submit', t('leadSubmit', '留下'));
    }

    function saveLead(row) {
        const KEY = 'youwei_leads_v1';
        let list = [];
        try { list = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { list = []; }
        if (!Array.isArray(list)) list = [];
        list.push(row);
        try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { /* ignore */ }
    }

    function closeModal() {
        const wrap = document.getElementById('youwei-login-modal');
        if (wrap) wrap.classList.add('hidden');
        document.body.classList.remove('youwei-modal-on');
    }

    function adminHref(href) {
        return String(href || '').indexOf('admin.html') !== -1;
    }

    function interceptWorkshopLinks() {
        document.addEventListener('click', function (e) {
            const a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
            if (!a) return;
            const href = a.getAttribute('href') || '';
            if (adminHref(href)) {
                if (isAdmin()) return;
                e.preventDefault();
                if (isAuthed()) {
                    location.href = 'index.html';
                    return;
                }
                openModal(href);
                return;
            }
            if (!workshopHref(href)) return;
            if (isAuthed()) return;
            e.preventDefault();
            openModal(href);
        });
    }

    function guardAdmin() {
        if (isAdmin()) return true;
        if (isAuthed()) {
            location.replace('workshop.html?mode=pro');
            return false;
        }
        location.replace('index.html?login=1&next=' + encodeURIComponent('admin.html'));
        return false;
    }

    function injectOpsEntry() {
        if (!isAdmin()) return;
        if (document.getElementById('youwei-ops-link')) return;
        const nav = document.querySelector('.nav-links');
        if (!nav) return;
        const a = document.createElement('a');
        a.id = 'youwei-ops-link';
        a.href = 'admin.html';
        a.textContent = '管理台';
        const cta = nav.querySelector('.nav-cta');
        if (cta) nav.insertBefore(a, cta);
        else nav.appendChild(a);
    }

    function guardWorkshop() {
        if (isAuthed()) return true;
        const q = location.search && location.search.indexOf('mode=') !== -1 ? location.search : '?mode=pro';
        location.replace('index.html?login=1&next=' + encodeURIComponent('workshop.html' + q));
        return false;
    }

    function bootFromQuery() {
        const params = new URLSearchParams(location.search || '');
        if (params.get('login') === '1') {
            const next = params.get('next') || 'workshop.html?mode=pro';
            openModal(next);
        }
    }

    function injectStyles() {
        if (document.getElementById('youwei-auth-style')) return;
        const s = document.createElement('style');
        s.id = 'youwei-auth-style';
        s.textContent = `
body.youwei-modal-on{overflow:hidden}
.youwei-login-modal{position:fixed;inset:0;z-index:80;display:flex;align-items:center;justify-content:center;padding:24px}
.youwei-login-modal.hidden{display:none}
.youwei-login-backdrop{position:absolute;inset:0;background:rgba(22,21,19,.58);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px)}
.youwei-login-card{position:relative;width:min(420px,100%);max-height:min(92vh,760px);overflow:auto;background:#f7f5f0;border:1px solid rgba(22,21,19,.12);padding:32px 28px 24px}
.youwei-login-x{appearance:none;position:absolute;top:14px;right:16px;border:0;background:none;padding:0;font-size:20px;line-height:1;color:#6e695f;opacity:.4;cursor:pointer}
.youwei-login-x:hover{opacity:.85;color:#161513}
.youwei-login-brand{display:flex;align-items:baseline;margin:0 0 18px;color:#161513}
.youwei-login-brand span{font-size:16px;font-weight:600;letter-spacing:.04em}
.youwei-login-brand i{font-style:normal;margin-left:10px;padding-left:10px;border-left:1px solid rgba(22,21,19,.12);font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#4f4b45}
.youwei-login-kicker{margin:0 0 8px;font-size:13px;font-weight:650;color:#3d534b}
.youwei-login-card h2{margin:0;font-size:26px;font-weight:600;letter-spacing:-.03em;color:#161513;line-height:1.2}
.youwei-login-lead{margin:10px 0 0;font-size:15px;line-height:1.6;color:#4f4b45}
.youwei-login-path{margin:12px 0 0;font-size:12px;font-weight:550;color:#6e695f;letter-spacing:.04em}
.youwei-login-card #youwei-login-form{margin-top:22px}
.youwei-login-aside form{margin-top:0}
.youwei-login-card label{display:block;margin-bottom:14px;font-size:12px;font-weight:550;color:#6e695f}
.youwei-login-card input{display:block;width:100%;margin-top:6px;border:1px solid rgba(22,21,19,.12);background:#fff;border-radius:0;padding:10px 12px;font-size:15px;color:#161513}
.youwei-login-card input:focus{outline:none;border-color:#3d534b}
.youwei-login-error{margin:0 0 12px;font-size:13px;color:#8d4a3a}
.youwei-login-error.hidden{display:none}
.youwei-login-actions{display:flex;align-items:center;justify-content:flex-end;gap:18px;margin-top:6px}
.youwei-login-ghost{appearance:none;border:0;background:none;padding:0;font-size:13px;color:#6e695f;opacity:.7;cursor:pointer}
.youwei-login-ghost:hover{opacity:1;color:#161513}
.youwei-login-submit{appearance:none;border:0;background:#3d534b;color:#f7f6f2;border-radius:980px;min-width:132px;height:40px;padding:0 20px;font-size:15px;font-weight:600;cursor:pointer}
.youwei-login-submit:hover{background:#2d3f39}
.youwei-login-aside{margin-top:22px;padding-top:16px;border-top:1px solid rgba(22,21,19,.1)}
.youwei-login-aside-k{margin:0;font-size:11px;letter-spacing:.06em;color:#6e695f;opacity:.75}
.youwei-login-aside-d{margin:4px 0 10px;font-size:12px;line-height:1.5;color:#6e695f;opacity:.8}
.youwei-lead-row{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.youwei-login-aside input{margin-top:0;padding:8px 10px;font-size:13px;background:#f7f5f0;border-color:rgba(22,21,19,.1)}
.youwei-lead-note{margin-top:8px}
.youwei-lead-note.hidden,.youwei-lead-msg.hidden{display:none}
.youwei-lead-msg{margin:8px 0 0;font-size:12px;color:#8d4a3a}
.youwei-lead-msg.is-ok{color:#3d534b}
.youwei-lead-actions{display:flex;align-items:center;justify-content:flex-end;gap:16px;margin-top:10px}
.youwei-lead-contact,.youwei-lead-submit{appearance:none;border:0;background:none;padding:0;font-size:12px;cursor:pointer;color:#6e695f}
.youwei-lead-contact{opacity:.45}
.youwei-lead-submit{opacity:.7}
.youwei-lead-contact:hover,.youwei-lead-submit:hover{opacity:1;color:#161513}
.youwei-acct{position:relative}
.youwei-acct-btn{appearance:none;border:0;background:none;padding:0;cursor:pointer}
.youwei-acct-avatar{display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:980px;background:#3d534b;color:#f7f6f2;font-size:13px;font-weight:600;letter-spacing:0}
.youwei-acct-btn:hover .youwei-acct-avatar{background:#2d3f39}
.youwei-acct-pop{position:absolute;top:calc(100% + 8px);right:0;z-index:90;width:200px;padding:14px 14px 12px;background:#f7f5f0;border:1px solid rgba(22,21,19,.12)}
.youwei-acct-pop.hidden{display:none}
.youwei-acct-k{margin:10px 0 0;font-size:11px;letter-spacing:.06em;color:#6e695f;opacity:.55}
.youwei-acct-k:first-child{margin-top:0}
.youwei-acct-v{margin:3px 0 0;font-size:13px;font-weight:550;color:#161513}
.youwei-acct-perms{margin:6px 0 0;padding:0;list-style:none}
.youwei-acct-perms li{margin:0 0 3px;font-size:12px;color:#4f4b45;line-height:1.4}
.youwei-acct-out{appearance:none;display:block;width:100%;margin-top:12px;padding:8px 0 0;border:0;border-top:1px solid rgba(22,21,19,.1);background:none;font-size:12px;color:#6e695f;opacity:.7;cursor:pointer;text-align:left}
.youwei-acct-out:hover{opacity:1;color:#161513}
`;
        document.head.appendChild(s);
    }

    function initPublic() {
        injectStyles();
        ensureModal();
        interceptWorkshopLinks();
        bootFromQuery();
        injectOpsEntry();
    }

    global.YouweiAuth = {
        isAuthed: isAuthed,
        currentUser: currentUser,
        currentRole: currentRole,
        isAdmin: isAdmin,
        login: login,
        logout: logout,
        openModal: openModal,
        syncModal: syncModal,
        guardWorkshop: guardWorkshop,
        guardAdmin: guardAdmin,
        initPublic: initPublic,
        mountAccountMenu: mountAccountMenu,
        avatarGlyph: avatarGlyph
    };
})(window);
