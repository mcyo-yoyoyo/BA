/**
 * 评估包：保存工作台快照还原的「评估过程册」。
 * 在线翻页查看，可下载独立 HTML 发给客户。
 */
(function (global) {
    const IDB_NAME = 'youwei_assess_pack_v1';
    const IDB_STORE = 'packs';

    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
    }

    function fileBase(title) {
        return String(title || '评估过程册').replace(/[\\/:*?"<>|]/g, '_').slice(0, 60);
    }

    function openDb() {
        return new Promise(function (resolve, reject) {
            const req = indexedDB.open(IDB_NAME, 1);
            req.onupgradeneeded = function () {
                if (!req.result.objectStoreNames.contains(IDB_STORE)) req.result.createObjectStore(IDB_STORE);
            };
            req.onsuccess = function () { resolve(req.result); };
            req.onerror = function () { reject(req.error); };
        });
    }

    function storePack(id, pack) {
        return openDb().then(function (db) {
            return new Promise(function (resolve, reject) {
                const tx = db.transaction(IDB_STORE, 'readwrite');
                tx.objectStore(IDB_STORE).put(pack, String(id));
                tx.oncomplete = function () { resolve(id); };
                tx.onerror = function () { reject(tx.error); };
            });
        });
    }

    function loadPack(id) {
        return openDb().then(function (db) {
            return new Promise(function (resolve, reject) {
                const tx = db.transaction(IDB_STORE, 'readonly');
                const r = tx.objectStore(IDB_STORE).get(String(id));
                r.onsuccess = function () { resolve(r.result || null); };
                r.onerror = function () { reject(r.error); };
            });
        });
    }

    function removePack(id) {
        return openDb().then(function (db) {
            return new Promise(function (resolve, reject) {
                const tx = db.transaction(IDB_STORE, 'readwrite');
                tx.objectStore(IDB_STORE).delete(String(id));
                tx.oncomplete = function () { resolve(); };
                tx.onerror = function () { reject(tx.error); };
            });
        });
    }

    function asText(html) {
        if (html == null) return Promise.resolve('');
        if (typeof html === 'string') return Promise.resolve(html);
        if (html instanceof Blob) return html.text();
        return Promise.resolve(String(html));
    }

    function isReport(pack) {
        return !!(pack && (pack.kind === 'report' || pack.html));
    }

    async function reportHtml(pack, title) {
        if (pack && pack.html) {
            const raw = await asText(pack.html);
            if (raw) return raw;
        }
        if (pack && pack.snapshot && global.YouweiReport && YouweiReport.buildHtml) {
            return YouweiReport.buildHtml(pack.snapshot, { title: title || pack.title, savedAt: pack.savedAt });
        }
        return '';
    }

    async function buildAndStore(id, title, state) {
        if (!global.YouweiReport || !YouweiReport.buildHtml) throw new Error('过程册组件未加载');
        const savedAt = new Date().toISOString();
        const html = YouweiReport.buildHtml(state || {}, { title: title, savedAt: savedAt });
        if (!html) throw new Error('过程册未生成');
        const pack = {
            kind: 'report',
            title: title,
            savedAt: savedAt,
            html: new Blob([html], { type: 'text/html;charset=utf-8' }),
            snapshot: JSON.parse(JSON.stringify(state || {}))
        };
        await storePack(id, pack);
        return pack;
    }

    function downloadBlob(blob, name) {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = name;
        a.click();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 8000);
    }

    async function downloadHtml(id) {
        const pack = await loadPack(id);
        if (!pack) throw new Error('评估包不存在');
        const html = await reportHtml(pack, pack.title);
        if (!html) throw new Error('过程册不存在，请重新保存');
        downloadBlob(new Blob([html], { type: 'text/html;charset=utf-8' }), fileBase(pack.title) + '.html');
        if (typeof global.toast === 'function') global.toast('已下载 HTML，可直接发给客户');
    }

    function revokeUrls(host) {
        (host._urls || []).forEach(function (u) { URL.revokeObjectURL(u); });
        host._urls = [];
    }

    function openViewer(id, pack) {
        let host = document.getElementById('youwei-pack-host');
        if (!host) {
            host = document.createElement('div');
            host.id = 'youwei-pack-host';
            document.body.appendChild(host);
        }
        revokeUrls(host);
        document.body.classList.add('youwei-pack-open');

        function close() {
            if (host._onKey) document.removeEventListener('keydown', host._onKey);
            revokeUrls(host);
            host.innerHTML = '';
            document.body.classList.remove('youwei-pack-open');
        }

        function chrome(title, extra, main) {
            host.innerHTML =
                '<div class="yp-overlay">' +
                    '<div class="yp-bar">' +
                        '<p class="yp-title">' + esc(title || '评估过程册') + '<i>' + extra + '</i></p>' +
                        '<div class="yp-actions">' +
                            '<button type="button" class="yp-dl" data-html="1">下载 HTML</button>' +
                            '<button type="button" class="yp-x" data-close="1">关闭</button>' +
                        '</div>' +
                    '</div>' +
                    '<div class="yp-body"><div class="yp-main">' + main + '</div></div>' +
                '</div>' +
                '<style>' +
                '#youwei-pack-host,.yp-overlay{position:fixed;inset:0;z-index:240}' +
                '.yp-overlay{display:flex;flex-direction:column;background:#1f1e1b}' +
                '.yp-bar{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:10px 16px;color:#f3f1ec}' +
                '.yp-title{margin:0;font-size:14px;font-weight:650}.yp-title i{font-style:normal;margin-left:10px;font-size:12px;color:#b8b3ab;font-weight:500}' +
                '.yp-actions{display:flex;gap:8px;flex-wrap:wrap}' +
                '.yp-dl,.yp-x{border:1px solid rgba(243,241,236,.28);background:transparent;color:#f3f1ec;border-radius:3px;padding:6px 12px;cursor:pointer;font-size:13px}' +
                '.yp-dl{background:#4f6b62;border-color:#4f6b62}' +
                '.yp-body{flex:1;min-height:0;display:flex;padding:0 12px 12px}' +
                '.yp-main{flex:1;min-width:0;background:#f7f5f0;border-radius:8px;overflow:hidden}' +
                '.yp-frame{width:100%;height:100%;border:0;background:#f7f5f0}' +
                '.yp-old{padding:28px;color:#4f4b45;max-width:36rem;line-height:1.6}' +
                '</style>';
            host.querySelector('[data-close]').onclick = close;
            const htmlBtn = host.querySelector('[data-html]');
            if (htmlBtn) {
                htmlBtn.onclick = function () {
                    downloadHtml(id).catch(function (e) {
                        if (typeof global.toast === 'function') global.toast(e.message || '下载失败', 'error');
                    });
                };
            }
            host._onKey = function (e) {
                if (!host.innerHTML) return;
                if (e.key === 'Escape') close();
            };
            document.addEventListener('keydown', host._onKey);
        }

        if (isReport(pack)) {
            reportHtml(pack, pack.title).then(function (html) {
                const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
                host._urls = [url];
                chrome(pack.title, '七步过程册 · 可发给客户', '<iframe class="yp-frame" src="' + url + '" title="评估过程册"></iframe>');
            }).catch(function (e) {
                chrome(pack.title, '', '<div class="yp-old">' + esc(e.message || '打不开过程册') + '</div>');
            });
            return;
        }

        chrome(pack.title, '旧版截图包',
            '<div class="yp-old"><p>这一份还是以前的截图包，放大后会看不清。</p>' +
            '<p>请在工作台第七步重新点「保存」，会按当时的评估数据生成一份过程册。文字可放大、可复制，下载 HTML 即可发给客户。</p></div>');
    }

    async function open(id) {
        const pack = await loadPack(id);
        if (!pack) throw new Error('评估包不存在，请重新保存');
        openViewer(id, pack);
    }

    global.YouweiPack = {
        buildAndStore: buildAndStore,
        load: loadPack,
        remove: removePack,
        open: open,
        download: downloadHtml,
        downloadHtml: downloadHtml
    };
})(window);
