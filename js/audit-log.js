/**
 * 本机操作留痕：登录、保存、导出。按账号分键，可从管理台导出。
 */
(function (global) {
    const BASE = 'youwei_audit_v1';
    const MAX = 500;

    function user() {
        const u = global.YouweiAuth && YouweiAuth.currentUser ? YouweiAuth.currentUser() : '';
        return String(u || 'guest').trim().toLowerCase() || 'guest';
    }

    function key() {
        return BASE + '::' + user();
    }

    function load() {
        try {
            const raw = localStorage.getItem(key());
            const arr = raw ? JSON.parse(raw) : [];
            return Array.isArray(arr) ? arr : [];
        } catch (e) {
            return [];
        }
    }

    function write(list) {
        try {
            localStorage.setItem(key(), JSON.stringify(list));
        } catch (e) { /* ignore */ }
    }

    function add(action, detail) {
        const act = String(action || '').trim();
        if (!act) return;
        const rows = load();
        rows.push({
            at: new Date().toISOString(),
            user: user(),
            action: act,
            detail: String(detail == null ? '' : detail).slice(0, 240)
        });
        if (rows.length > MAX) rows.splice(0, rows.length - MAX);
        write(rows);
    }

    function clear() {
        try { localStorage.removeItem(key()); } catch (e) { /* ignore */ }
    }

    function labelOf(action) {
        const map = {
            login: '登录',
            logout: '退出',
            idle_logout: '闲置退出',
            session_expired: '会话到期',
            save_book: '保存过程册',
            save_draft: '自动存草稿',
            export_excel: '导出 Excel',
            import_excel: '导入 Excel',
            export_history: '导出底稿',
            import_history: '导入底稿',
            export_pack: '导出运营包',
            import_pack: '导入运营包',
            export_audit: '导出操作日志',
            admin_save: '保存配置',
            clear_leads: '清空线索'
        };
        return map[action] || action;
    }

    global.YouweiAudit = {
        add: add,
        load: load,
        clear: clear,
        labelOf: labelOf
    };
})(window);
