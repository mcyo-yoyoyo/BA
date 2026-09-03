(function (root) {
    const REDUCE = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function markup(size) {
        const cls = size ? ('yoway-orb is-' + size) : 'yoway-orb';
        return '<span class="' + cls + '" aria-hidden="true">' +
            '<span class="yoway-orb-glow"></span>' +
            '<span class="yoway-orb-orbit"></span>' +
            '<span class="yoway-orb-body"><span class="yoway-orb-shine"></span><span class="yoway-orb-visor"><i></i><i></i></span></span>' +
            '<span class="yoway-orb-ear is-l"></span><span class="yoway-orb-ear is-r"></span>' +
            '<span class="yoway-orb-burst"></span></span>';
    }

    function escAttr(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
    }

    function link(href, opts) {
        opts = opts || {};
        const dest = href || 'workshop.html?mode=pro';
        const verb = opts.verb != null ? opts.verb : '唤醒';
        const label = opts.label || (String(verb) + ' YOWAY');
        const cls = 'yoway-wake' + (opts.className ? ' ' + opts.className : '');
        return '<a class="' + cls + '" href="' + escAttr(dest) + '" aria-label="' + escAttr(label) + '">' +
            markup(opts.size || '') +
            '<span class="yoway-wake-txt"><small data-i18n="wakeVerb">' + escAttr(verb) + '</small><b>YOWAY</b></span></a>';
    }

    function burst(host) {
        const layer = host && host.querySelector && host.querySelector('.yoway-orb-burst');
        if (!layer || REDUCE) return;
        layer.innerHTML = '';
        const n = 12;
        for (let i = 0; i < n; i += 1) {
            const p = document.createElement('i');
            const a = (i / n) * Math.PI * 2 + (Math.random() * 0.28);
            p.style.setProperty('--x', Math.cos(a).toFixed(3));
            p.style.setProperty('--y', Math.sin(a).toFixed(3));
            p.style.setProperty('--d', (220 + Math.random() * 220) + 'ms');
            layer.appendChild(p);
        }
    }

    function flash(el, cls, ms) {
        if (!el) return;
        el.classList.add(cls);
        window.setTimeout(function () { el.classList.remove(cls); }, ms);
    }

    function hosts() {
        return document.querySelectorAll('.yoway-wake, .yoway-orb');
    }

    function setState(state) {
        hosts().forEach(function (el) {
            el.classList.remove('is-thinking', 'is-speaking', 'is-error', 'is-wake');
            if (state && state !== 'idle') el.classList.add('is-' + state);
        });
    }

    function mount(el, size) {
        if (!el || el.querySelector('.yoway-orb')) return;
        el.insertAdjacentHTML('afterbegin', markup(size || el.getAttribute('data-yoway-orb') || ''));
    }

    function hydrate() {
        document.querySelectorAll('[data-yoway-orb]').forEach(function (el) {
            mount(el, el.getAttribute('data-yoway-orb'));
        });
    }

    let portalLock = false;

    function playWake(origin, done) {
        const cb = typeof done === 'function' ? done : function () {};
        burst(origin);
        flash(origin, 'is-wake', 720);
        if (REDUCE) {
            cb();
            return;
        }
        if (portalLock || document.getElementById('yoway-portal')) {
            cb();
            return;
        }
        portalLock = true;
        const rect = origin && origin.getBoundingClientRect ? origin.getBoundingClientRect() : null;
        const ox = rect ? (rect.left + rect.width / 2) : (window.innerWidth * 0.82);
        const oy = rect ? (rect.top + rect.height / 2) : 36;
        const layer = document.createElement('div');
        layer.id = 'yoway-portal';
        layer.className = 'yoway-portal';
        layer.style.setProperty('--ox', ox + 'px');
        layer.style.setProperty('--oy', oy + 'px');
        let sparks = '';
        for (let i = 0; i < 10; i += 1) {
            const a = (i / 10) * Math.PI * 2;
            sparks += '<i class="yoway-portal-spark" style="--sx:' + Math.cos(a).toFixed(3) +
                ';--sy:' + Math.sin(a).toFixed(3) + ';--sd:' + (80 + i * 28) + 'ms"></i>';
        }
        layer.innerHTML =
            '<i class="yoway-portal-veil"></i>' +
            '<i class="yoway-portal-bloom"></i>' +
            '<i class="yoway-portal-ring is-1"></i>' +
            '<i class="yoway-portal-ring is-2"></i>' +
            '<i class="yoway-portal-ring is-3"></i>' +
            sparks +
            '<span class="yoway-portal-fly">' + markup('lg') + '</span>';
        document.body.appendChild(layer);
        window.requestAnimationFrame(function () {
            layer.classList.add('is-on');
        });
        window.setTimeout(cb, 760);
        window.setTimeout(function () {
            layer.classList.add('is-out');
            window.setTimeout(function () {
                if (layer.parentNode) layer.parentNode.removeChild(layer);
                portalLock = false;
            }, 420);
        }, 920);
    }

    document.addEventListener('click', function (e) {
        const wake = e.target && e.target.closest && e.target.closest('.yoway-wake');
        if (!wake || wake.classList.contains('is-login')) return;
        if (wake.closest('#yoway-portal')) return;
        const href = wake.getAttribute('href') || '';
        if (/workshop\.html/i.test(href)) return;
        burst(wake);
        flash(wake, 'is-wake', 640);
    }, true);

    document.addEventListener('submit', function (e) {
        if (!e.target || e.target.id !== 'youwei-login-form') return;
        window.setTimeout(function () {
            const err = document.getElementById('youwei-login-error');
            if (!err || err.classList.contains('hidden') || !String(err.textContent || '').trim()) return;
            hosts().forEach(function (el) { flash(el, 'is-error', 900); });
        }, 40);
    }, true);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', hydrate);
    } else {
        hydrate();
    }

    root.YowayOrb = {
        markup: markup,
        link: link,
        mount: mount,
        hydrate: hydrate,
        setState: setState,
        burst: burst,
        playWake: playWake
    };
})(typeof window !== 'undefined' ? window : globalThis);
