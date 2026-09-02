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

    document.addEventListener('click', function (e) {
        const wake = e.target && e.target.closest && e.target.closest('.yoway-wake');
        if (!wake) return;
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
        mount: mount,
        hydrate: hydrate,
        setState: setState,
        burst: burst
    };
})(typeof window !== 'undefined' ? window : globalThis);
