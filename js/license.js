/**
 * 本机授权：客户名、到期日、过程册水印。不是服务端许可证，只作交付标识。
 */
(function (global) {
    let data = { org: '', expires: '', code: '', seats: 0, bound: false, home: '', brand: '', brandEn: '' };

    function apply(o) {
        if (!o || typeof o !== 'object') return;
        const org = String(o.org || '').trim();
        const expires = String(o.expires || '').trim();
        data = {
            org: org,
            expires: expires,
            code: String(o.code || '').trim(),
            seats: Number(o.seats || 0) || 0,
            bound: o.bound === true || (!!(org && expires) && o.bound !== false),
            home: String(o.home || '').trim(),
            brand: String(o.brand || '').trim(),
            brandEn: String(o.brandEn || '').trim()
        };
    }

    if (global.YOUWEI_LICENSE) apply(global.YOUWEI_LICENSE);

    const ready = fetch('license.json', { cache: 'no-store' }).then(function (r) {
        return r.ok ? r.json() : null;
    }).then(function (o) {
        if (o) apply(o);
        return status();
    }).catch(function () {
        return status();
    });

    function expired() {
        if (!data.expires) return false;
        const t = Date.parse(data.expires + 'T23:59:59');
        return !isNaN(t) && Date.now() > t;
    }

    function daysLeft() {
        if (!data.expires) return null;
        const t = Date.parse(data.expires + 'T23:59:59');
        if (isNaN(t)) return null;
        return Math.ceil((t - Date.now()) / 86400000);
    }

    function status() {
        const left = daysLeft();
        return {
            org: data.org,
            expires: data.expires,
            code: data.code,
            seats: data.seats,
            bound: !!data.bound,
            expired: expired(),
            daysLeft: left,
            home: data.home,
            brand: data.brand,
            brandEn: data.brandEn,
            label: data.bound
                ? (data.org || '已绑定') + (data.expires ? (' · 至 ' + data.expires) : '')
                : '未绑定（演示）'
        };
    }

    function watermark() {
        return data.org || '友为评估';
    }

    function isDemoUser(user) {
        const u = String(user || '').trim().toLowerCase();
        return u === 'demo' || u === 'user';
    }

    function allowPublishedDemo() {
        return !data.bound;
    }

    global.YouweiLicense = {
        ready: ready,
        status: status,
        expired: expired,
        watermark: watermark,
        brand: function () { return data.brand || '友为'; },
        brandEn: function () { return data.brandEn || 'Yoway'; },
        home: function () { return data.home || ''; },
        isBound: function () { return !!data.bound; },
        isDemoUser: isDemoUser,
        allowPublishedDemo: allowPublishedDemo
    };
})(window);
