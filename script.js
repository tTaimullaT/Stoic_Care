/* ============================================================
   STOIC CARE v2.1 — script.js
   One script, two pages. Every module checks what's present:
   the landing keeps its descent; the forge page runs cold.
   ============================================================ */

(function () {
    const $ = (s, c = document) => c.querySelector(s);
    const $$ = (s, c = document) => [...c.querySelectorAll(s)];

    /* ---------- icons ---------- */
    if (window.lucide) lucide.createIcons();
    else window.addEventListener('DOMContentLoaded', () => { if (window.lucide) lucide.createIcons(); });

    /* ---------- UTC clock: the only heartbeat ---------- */
    const clockEl = $('#clock');
    if (clockEl) {
        const tickClock = () => {
            const d = new Date(), p = n => String(n).padStart(2, '0');
            clockEl.textContent = 'UTC ' + p(d.getUTCHours()) + ':' + p(d.getUTCMinutes()) + ':' + p(d.getUTCSeconds());
        };
        tickClock(); setInterval(tickClock, 1000);
    }

    /* ---------- nav: hairline + climate ----------
       Landing: chrome turns cold when the loop reaches the nav.
       Forge page (no #top hero): cold from the first pixel. */
    const nav = $('#nav');
    const loopSec = $('#loop');
    const hasHero = !!document.getElementById('top');
    const onScrollNav = () => {
        if (!nav) return;
        nav.classList.toggle('scrolled', scrollY > 24);
        const cold = hasHero ? !!(loopSec && loopSec.getBoundingClientRect().top <= 90) : true;
        document.body.classList.toggle('cold', cold);
        document.documentElement.style.backgroundColor = cold ? '#0A0A0A' : '#E8DFD0';
    };
    addEventListener('scroll', onScrollNav, { passive: true });
    onScrollNav();

    /* ---------- section spy (landing sections only) ---------- */
    const links = $$('.nav-links a');
    if (links.length && 'IntersectionObserver' in window) {
        const spy = new IntersectionObserver(es => {
            es.forEach(e => {
                if (e.isIntersecting)
                    links.forEach(a => a.classList.toggle('act', a.getAttribute('href') === '#' + e.target.id));
            });
        }, { rootMargin: '-40% 0px -55% 0px' });
        ['habits', 'loop', 'tone', 'wall'].forEach(id => {
            const el = document.getElementById(id); if (el) spy.observe(el);
        });
    }

    /* ---------- reveals: instant. already written. ---------- */
    const revealEls = $$('[data-reveal]');
    if ('IntersectionObserver' in window) {
        const ro = new IntersectionObserver(es => {
            es.forEach(e => {
                if (e.isIntersecting) {
                    const t = e.target; setTimeout(() => t.classList.add('on'), +(t.dataset.delay || 0)); ro.unobserve(t);
                }
            });
        }, { threshold: .12 });
        revealEls.forEach(el => ro.observe(el));
    } else {
        revealEls.forEach(el => el.classList.add('on'));
    }

    /* ---------- code feed: 4s heartbeat (landing only) ---------- */
    const CODES = ['IRON', 'STONE', 'ASH', 'EMBER', 'VOID', 'FROST', 'NORTH', 'ONYX'];
    let ci = 0;
    const wordEl = $('#cfWord'), barEl = $('#cfBar'), zoneEl = $('#cfZone'), chipEl = $('#codeChip');
    if (zoneEl && wordEl && barEl) {
        const armBar = () => {
            barEl.style.transition = 'none'; barEl.style.transform = 'scaleX(1)';
            void barEl.offsetWidth;
            barEl.style.transition = 'transform 4s linear, background-color 1.6s cubic-bezier(.22, 1, .36, 1)';
            barEl.style.transform = 'scaleX(0)';
        };
        const cycle = () => {
            zoneEl.classList.remove('flick'); void zoneEl.offsetWidth; zoneEl.classList.add('flick');
            setTimeout(() => {
                ci = (ci + 1) % CODES.length; wordEl.textContent = CODES[ci];
                if (chipEl) chipEl.textContent = CODES[ci]; armBar();
            }, 140);
        };
        requestAnimationFrame(armBar);
        setInterval(cycle, 4000);
    }

    /* ---------- proof loop: files open instantly (landing only) ---------- */
    const steps = $$('.step');
    steps.forEach(btn => {
        btn.addEventListener('click', () => {
            const wasOpen = btn.getAttribute('aria-expanded') === 'true';
            steps.forEach(b => {
                b.setAttribute('aria-expanded', 'false');
                if (b.nextElementSibling) b.nextElementSibling.hidden = true;
            });
            if (!wasOpen) {
                btn.setAttribute('aria-expanded', 'true');
                if (btn.nextElementSibling) btn.nextElementSibling.hidden = false;
            }
        });
    });

    /* ---------- tone engine (landing only) ---------- */
    const TONES = {
        balanced: {
            hit: 'You submitted proof. Good. Continue.',
            miss: 'Missed. Tomorrow, earlier.',
            note: 'COURTEOUS. STILL HONEST.', dim: 0, pos: 0, label: 'BALANCED'
        },
        hardcore: {
            hit: 'Proof received. Barely.',
            miss: "You're slipping. Two days missed. Get back on track.",
            note: 'BLUNT. PERSONAL. FAIR.', dim: .08, pos: 50, label: 'HARDCORE'
        },
        nobs: {
            hit: 'The minimum was met. The minimum is not the standard.',
            miss: 'You chose comfort over progress. That is not weakness — that is a decision. Own it or change it.',
            note: 'NO ADJECTIVES. NO EXCUSES.', dim: .2, pos: 100, label: 'NO-BS'
        }
    };
    const dim = $('#dim'), thumb = $('#tsThumb'), track = $('#tsTrack');
    const vdHit = $('#vdHit'), vdMiss = $('#vdMiss'), vdNote = $('#vdNote');
    const toneBtns = $$('.ts-labels button');
    const setTone = key => {
        const t = TONES[key];
        document.body.dataset.tone = key;
        if (dim) dim.style.opacity = t.dim;
        if (thumb) thumb.style.left = t.pos + '%';
        if (vdHit) vdHit.textContent = t.hit;
        if (vdMiss) vdMiss.textContent = t.miss;
        if (vdNote) vdNote.textContent = t.note;
        toneBtns.forEach(b => {
            const active = b.dataset.tone === key;
            b.classList.toggle('on', active);
            b.setAttribute('aria-pressed', String(active));
        });
        if (track) {
            track.setAttribute('aria-valuenow', String(t.pos));
            track.setAttribute('aria-valuetext', t.label);
        }
    };
    if (track && thumb) {
        toneBtns.forEach(b => b.addEventListener('click', () => setTone(b.dataset.tone)));
        let dragging = false;
        const posFrom = e => {
            const r = track.getBoundingClientRect();
            if (!r.width) return 0;
            return Math.min(100, Math.max(0, (e.clientX - r.left) / r.width * 100));
        };
        const snap = v => v < 25 ? 0 : v < 75 ? 50 : 100;
        const keyOf = p => p === 0 ? 'balanced' : p === 50 ? 'hardcore' : 'nobs';
        track.addEventListener('pointerdown', e => { dragging = true; track.setPointerCapture(e.pointerId); thumb.style.left = posFrom(e) + '%'; });
        track.addEventListener('pointermove', e => { if (dragging) thumb.style.left = posFrom(e) + '%'; });
        track.addEventListener('pointerup', e => { if (!dragging) return; dragging = false; setTone(keyOf(snap(posFrom(e)))); });
        track.addEventListener('pointercancel', () => { if (dragging) { dragging = false; setTone(document.body.dataset.tone); } });
        track.addEventListener('keydown', e => {
            const keys = ['balanced', 'hardcore', 'nobs']; let i = keys.indexOf(document.body.dataset.tone);
            if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { i = Math.min(2, i + 1); setTone(keys[i]); e.preventDefault(); }
            if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { i = Math.max(0, i - 1); setTone(keys[i]); e.preventDefault(); }
            if (e.key === 'Home') { setTone(keys[0]); e.preventDefault(); }
            if (e.key === 'End') { setTone(keys[2]); e.preventDefault(); }
        });
        setTone('balanced');
    }

    /* ---------- the wall (landing only) ---------- */
    const wall = $('#wallGrid'), stats = $('#wallStats');
    if (wall) {
        const N = 140, vals = [];
        for (let i = 0; i < N; i++) { const w = 1 + Math.floor(Math.pow(Math.random(), 2.1) * 12.999); vals.push(w * 7); }
        let maxV = 0, maxI = 0;
        vals.forEach((v, i) => { if (v > maxV) { maxV = v; maxI = i; } });
        const frag = document.createDocumentFragment();
        vals.forEach((v, i) => {
            const c = document.createElement('div'); c.className = 'wc';
            const w = v / 7;
            c.style.setProperty('--wa', Math.max(.3, Math.min(1, .3 + (w - 1) / 12 * .7)).toFixed(2));
            c.textContent = v;
            if (i === maxI) c.classList.add('rec');
            frag.appendChild(c);
        });
        wall.appendChild(frag);
        const sorted = [...vals].sort((a, b) => a - b);
        if (stats) stats.innerHTML = 'SHOWN: <b>' + N + '</b> &middot; MEDIAN: <b>' + sorted[Math.floor(N / 2)] + ' DAYS</b> &middot; LONGEST: <b>' + maxV + ' DAYS</b>';
        const revealWall = () => {
            wall.classList.add('on');
            $$('.wc', wall).forEach((c, i) => setTimeout(() => c.classList.add('on'), Math.min(i * 12, 1400) + Math.floor(i / 12) * 70));
        };
        if ('IntersectionObserver' in window) {
            const wo = new IntersectionObserver(es => {
                if (es[0].isIntersecting) { wo.disconnect(); revealWall(); }
            }, { threshold: .1 });
            wo.observe(wall);
        } else revealWall();
    }

    /* ---------- pricing buttons (forge page) ---------- */
    const planLine = $('#planLine'), emailInput = $('#email');
    $$('.t-cta').forEach(b => b.addEventListener('click', () => {
        if (!planLine) return;
        planLine.textContent = ({
            free: 'PLAN: THE FREE CHECK — $0. NO CARD.',
            pro: 'STANDARD ISSUE UNLOCKS AT DAY 7. THE FIRST WEEK IS FREE — EARN IT.',
            paper: 'PLAN: THE PAPER — $15 ONCE. THE FIRST 7 DAYS ARE STILL FREE.'
        })[b.dataset.plan] || 'PLAN SELECTED';
        const anchor = document.getElementById('forge');
        if (anchor) anchor.scrollIntoView();
        setTimeout(() => emailInput && emailInput.focus({ preventScroll: true }), 60);
    }));

    /* ---------- the form: one field, one verdict (forge page) ---------- */
    const form = $('#codeForm');
    if (form) {
        form.addEventListener('submit', e => {
            e.preventDefault();
            const v = emailInput.value.trim();
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { $('#fErr').hidden = false; emailInput.focus(); return; }
            $('#fErr').hidden = true; form.hidden = true; $('#fDone').hidden = false;
            $('#fdWord').textContent = CODES[Math.floor(Math.random() * CODES.length)];
            const tEl = $('#fdTimer');
            const next6 = () => { const n = new Date(), d = new Date(n); d.setHours(6, 0, 0, 0); if (d <= n) d.setDate(d.getDate() + 1); return d; };
            let target = next6();
            const upd = () => {
                let ms = target - Date.now(); if (ms < 0) { target = next6(); ms = target - Date.now(); }
                const s = Math.floor(ms / 1000), p = n => String(n).padStart(2, '0');
                tEl.textContent = p(Math.floor(s / 3600)) + ':' + p(Math.floor(s % 3600 / 60)) + ':' + p(s % 60);
            };
            upd(); setInterval(upd, 1000);
        });
    }
})();
