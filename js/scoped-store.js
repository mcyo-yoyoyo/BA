/**
 * 按登录账号隔离本机底稿、线索、草稿。旧的无后缀键会迁到当前用户。
 */
(function (global) {
    const DRAFT = 'youwei_draft_v1';
    const LEADS = 'youwei_leads_v1';
    const HIST = 'archipro-blueprint-history-v1';

    function user() {
        const u = global.YouweiAuth && YouweiAuth.currentUser ? YouweiAuth.currentUser() : '';
        return String(u || 'guest').trim().toLowerCase() || 'guest';
    }

    function scoped(base) {
        return base + '::' + user();
    }

    function read(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            if (raw == null || raw === '') return fallback;
            return JSON.parse(raw);
        } catch (e) {
            return fallback;
        }
    }

    function write(key, val) {
        localStorage.setItem(key, JSON.stringify(val));
    }

    function migrateList(base) {
        const key = scoped(base);
        const cur = read(key, null);
        if (Array.isArray(cur)) return cur;
        const old = read(base, []);
        if (Array.isArray(old) && old.length) {
            try { write(key, old); } catch (e) { /* ignore */ }
            return old.slice();
        }
        return [];
    }

    function leadsKey() { return scoped(LEADS); }
    function historyKey() { return scoped(HIST); }
    function draftKey() { return scoped(DRAFT); }

    function loadLeads() { return migrateList(LEADS); }

    function saveLeads(list) {
        write(leadsKey(), Array.isArray(list) ? list : []);
    }

    function loadHistory() { return migrateList(HIST); }

    function saveHistory(list) {
        write(historyKey(), Array.isArray(list) ? list : []);
    }

    function loadDraft() {
        const cur = read(draftKey(), null);
        if (cur && cur.snapshot) return cur;
        const old = read(DRAFT, null);
        if (old && old.snapshot) {
            try { write(draftKey(), old); } catch (e) { /* ignore */ }
            return old;
        }
        return null;
    }

    function saveDraft(payload) {
        write(draftKey(), payload || {});
    }

    function clearDraft() {
        try { localStorage.removeItem(draftKey()); } catch (e) { /* ignore */ }
    }

    global.YouweiStore = {
        user: user,
        leadsKey: leadsKey,
        historyKey: historyKey,
        draftKey: draftKey,
        loadLeads: loadLeads,
        saveLeads: saveLeads,
        loadHistory: loadHistory,
        saveHistory: saveHistory,
        loadDraft: loadDraft,
        saveDraft: saveDraft,
        clearDraft: clearDraft
    };
})(window);
