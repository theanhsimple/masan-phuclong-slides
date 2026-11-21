(() => {
  'use strict';
  const stage = document.getElementById('stage');
  const slides = [...document.querySelectorAll('.slide')];
  const N = slides.length;
  const qs = new URLSearchParams(location.search);
  const STATIC = qs.has('static') || qs.has('bg');
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const OUT = 'cubic-bezier(.16,1,.3,1)', INOUT = 'cubic-bezier(.65,0,.35,1)';
  if (STATIC) document.documentElement.classList.add('static');
  let isTop = true; try { isTop = window.top === window; } catch (e) { isTop = false; }
  if (isTop) document.documentElement.classList.add('top');
  const vp = document.getElementById('viewport');
  if (qs.has('bg')) document.documentElement.classList.add('bgonly');

  let cur = -1, step = 0, busy = false, running = [], timers = [], overview = false;
  const maxStep = (s) => Math.max(0, ...[...s.querySelectorAll('[data-step]')].map((e) => +e.dataset.step));

  // ---------- layout ----------
  let scale = 1;
  function fit() {
    if (overview) return layoutOverview();
    const W = vp.clientWidth || innerWidth, H = vp.clientHeight || innerHeight;
    scale = Math.min(W / 1920, H / 1080);
    const x = (W - 1920 * scale) / 2, y = (H - 1080 * scale) / 2;
    stage.style.transform = `translate(${x}px,${y}px) scale(${scale})`;
  }
  addEventListener('resize', fit);
  if (window.ResizeObserver) new ResizeObserver(() => fit()).observe(vp);
  document.addEventListener('fullscreenchange', () => setTimeout(fit, 50));

  // ---------- number formatting (vi-VN) ----------
  function parseNum(str) {
    const m = String(str).match(/^([^\d]*)([\d.]+(?:,\d+)?)(.*)$/s);
    if (!m) return null;
    const raw = m[2];
    const dec = raw.includes(',') ? raw.split(',')[1].length : 0;
    const val = parseFloat(raw.replace(/\./g, '').replace(',', '.'));
    return { pre: m[1], suf: m[3], val, dec, grouped: /\d\.\d{3}/.test(raw) };
  }
  function fmt(p, v) {
    let s = v.toFixed(p.dec).replace('.', ',');
    if (p.grouped) { const [i, d] = s.split(','); s = i.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + (d ? ',' + d : ''); }
    return p.pre + s + p.suf;
  }
  function countUp(el, delay, dur = 1300) {
    const p = parseNum(el.dataset.val);
    if (!p || isNaN(p.val)) return;
    el.textContent = fmt(p, 0);
    const t0 = performance.now() + delay;
    const tick = (t) => {
      const k = Math.min(1, Math.max(0, (t - t0) / dur));
      const e = 1 - Math.pow(1 - k, 4);
      el.textContent = fmt(p, p.val * e);
      if (k < 1) raf = requestAnimationFrame(tick); else el.textContent = el.dataset.val;
    };
    let raf = requestAnimationFrame(tick);
    timers.push(() => cancelAnimationFrame(raf));
  }

  // ---------- element motion ----------
  function anim(el, kf, o) { const a = el.animate(kf, { fill: 'backwards', easing: OUT, ...o }); running.push(a); return a; }
  function play(el, offset = 0) {
    const a = el.dataset.m, d = (+el.dataset.d || 0) + offset, dur = +el.dataset.dur || 0;
    switch (a) {
      case 'fade': anim(el, [{ opacity: 0 }, { opacity: 1 }], { duration: dur || 700, delay: d }); break;
      case 'rise': anim(el, [{ opacity: 0, transform: 'translateY(30px)' }, { opacity: 1, transform: 'none' }], { duration: dur || 760, delay: d }); break;
      case 'scale': anim(el, [{ opacity: 0, transform: 'scale(.84)' }, { opacity: 1, transform: 'none' }], { duration: dur || 760, delay: d }); break;
      case 'growX': el.style.transformOrigin = '0 50%'; anim(el, [{ transform: 'scaleX(0)' }, { transform: 'none' }], { duration: dur || 800, delay: d }); break;
      case 'grow':
        if (el.classList.contains('chart')) {
          el.querySelectorAll('.bar').forEach((b) => anim(b, [{ transform: 'scaleY(0)' }, { transform: 'none' }], { duration: 1000, delay: d + 150 * +b.dataset.i, easing: INOUT }));
          el.querySelectorAll('.bval').forEach((v) => { anim(v, [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 600, delay: d + 650 + 150 * +v.dataset.i }); countUp(v, d + 650 + 150 * +v.dataset.i, 900); });
          el.querySelectorAll('.bcat,.baseline').forEach((v) => anim(v, [{ opacity: 0 }, { opacity: 1 }], { duration: 600, delay: d }));
        } else { el.style.transformOrigin = '50% 100%'; anim(el, [{ transform: 'scaleY(0)' }, { transform: 'none' }], { duration: dur || 1000, delay: d, easing: INOUT }); }
        break;
      case 'mask':
        anim(el, [{ clipPath: 'inset(0 100% 0 0 round 16px)' }, { clipPath: 'inset(0 0 0 0 round 16px)' }], { duration: dur || 1300, delay: d, easing: INOUT });
        { const img = el.querySelector('img'); if (img) anim(img, [{ transform: 'scale(1.18)' }, { transform: 'none' }], { duration: 2200, delay: d }); }
        break;
      case 'words': {
        const ws = el.querySelectorAll('.w>span');
        ws.forEach((w, i) => anim(w, [{ transform: 'translateY(108%)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: dur || 900, delay: d + i * 45 }));
        break;
      }
      case 'draw': {
        if (el.classList.contains('ring')) {
          const arc = el.querySelector('.arc'), len = +arc.dataset.len;
          anim(arc, [{ strokeDasharray: `0 ${len * 4}` }, { strokeDasharray: arc.getAttribute('stroke-dasharray') }], { duration: dur || 1600, delay: d, easing: INOUT });
          anim(el, [{ opacity: 0, transform: 'rotate(-30deg) scale(.92)' }, { opacity: 1, transform: 'none' }], { duration: 1400, delay: d });
        } else {
          const ln = el.querySelector('line');
          const len = Math.hypot(ln.x2.baseVal.value - ln.x1.baseVal.value, ln.y2.baseVal.value - ln.y1.baseVal.value) + 12;
          const dashed = ln.getAttribute('stroke-dasharray');
          if (dashed) anim(el, [{ opacity: 0, clipPath: 'inset(0 100% 0 0)' }, { opacity: 1, clipPath: 'inset(0 0 0 0)' }], { duration: dur || 900, delay: d, easing: INOUT });
          else anim(ln, [{ strokeDasharray: `0 ${len}` }, { strokeDasharray: `${len} 0` }], { duration: dur || 900, delay: d, easing: INOUT });
        }
        break;
      }
      case 'count':
        anim(el, [{ opacity: 0, transform: 'translateY(20px)' }, { opacity: 1, transform: 'none' }], { duration: 700, delay: d });
        countUp(el, d);
        break;
    }
  }
  function stopAll() {
    running.forEach((a) => a.cancel()); running = [];
    timers.forEach((f) => f()); timers = [];
    document.querySelectorAll('[data-val]').forEach((el) => { if (!el.classList.contains('bval')) el.textContent = el.dataset.val; else el.textContent = el.dataset.val; });
  }

  // ---------- transitions ----------
  function rectOf(el) {
    const r = el.getBoundingClientRect(), s = stage.getBoundingClientRect();
    return { x: (r.left - s.left) / scale, y: (r.top - s.top) / scale, w: r.width / scale, h: r.height / scale };
  }
  function morphPairs(a, b) {
    const pairs = [];
    b.querySelectorAll('[data-morph]').forEach((nb) => {
      const old = a.querySelector(`[data-morph="${nb.dataset.morph}"]`);
      if (old) pairs.push([old, nb]);
    });
    return pairs;
  }
  function enter(s, opts = {}) {
    const elements = [...s.querySelectorAll('.content [data-m]')];
    elements.forEach((el) => { el.classList.toggle('pending', !!el.dataset.step && +el.dataset.step > step); });
    if (RM || STATIC || opts.instant) return;
    elements.forEach((el) => {
      if (opts.skip && opts.skip.has(el)) return;
      if (el.dataset.step && +el.dataset.step > 0) return;
      play(el, opts.offset || 0);
    });
  }
  function go(n, dir = 1) {
    n = Math.max(0, Math.min(N - 1, n));
    if (n === cur || busy) return;
    const prev = slides[cur], next = slides[n];
    stopAll();
    step = dir < 0 ? maxStep(next) : 0;
    slides.forEach((s) => s.classList.remove('current'));
    next.classList.add('current');
    if (!prev || RM || STATIC) {
      slides.forEach((s) => s.classList.remove('active', 'leaving'));
      next.classList.add('active');
      cur = n; enter(next, { instant: dir < 0 }); hud(); return;
    }
    busy = true;
    const pairs = dir > 0 ? morphPairs(prev, next) : [];
    const skip = new Set();
    if (pairs.length) {
      // shared-object continuity (FLIP)
      const from = pairs.map(([o]) => [rectOf(o), getComputedStyle(o)]);
      prev.classList.add('leaving'); next.classList.add('active');
      pairs.forEach(([o, nb], i) => {
        const [fr, fs] = from[i];
        const tr = rectOf(nb), ts = getComputedStyle(nb);
        skip.add(nb.closest('[data-m]') || nb);
        o.style.visibility = 'hidden';
        const kf0 = { transformOrigin: '0 0', transform: `translate(${fr.x - tr.x}px,${fr.y - tr.y}px) scale(${fr.w / tr.w},${fr.h / tr.h})`, backgroundColor: fs.backgroundColor, borderRadius: fs.borderRadius };
        const kf1 = { transformOrigin: '0 0', transform: 'none', backgroundColor: ts.backgroundColor, borderRadius: ts.borderRadius };
        anim(nb, [kf0, kf1], { duration: 1100, easing: INOUT });
      });
      anim(next.querySelector('.bg'), [{ opacity: 0 }, { opacity: 1 }], { duration: 900, easing: INOUT });
      // labels of a morphing chart wait until the old slide's labels are gone
      new Set(pairs.map(([, nb]) => nb.closest('.chart')).filter(Boolean)).forEach((ch) => {
        ch.querySelectorAll('.bcat,.baseline').forEach((v) => anim(v, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 700 }));
        ch.querySelectorAll('.bval').forEach((v) => { anim(v, [{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], { duration: 600, delay: 850 + 120 * +v.dataset.i }); countUp(v, 850 + 120 * +v.dataset.i, 900); });
      });
      const out = prev.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 700, easing: INOUT, fill: 'forwards' });
      out.onfinish = () => { prev.classList.remove('active', 'leaving'); out.cancel(); pairs.forEach(([o]) => (o.style.visibility = '')); busy = false; };
      cur = n; enter(next, { skip, offset: 380 }); hud(); return;
    }
    prev.classList.add('leaving');
    next.classList.add('active');
    const outKF = [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `scale(${dir > 0 ? 0.985 : 1.015})` }];
    const inKF = [{ opacity: 0, transform: `scale(${dir > 0 ? 1.025 : 0.985})` }, { opacity: 1, transform: 'none' }];
    const out = prev.animate(outKF, { duration: 650, easing: INOUT, fill: 'forwards' });
    next.animate(inKF, { duration: 900, easing: OUT });
    out.onfinish = () => { prev.classList.remove('active', 'leaving'); out.cancel(); busy = false; };
    cur = n;
    enter(next, { instant: dir < 0, offset: 260 });
    hud();
  }
  function nextStep() {
    const s = slides[cur];
    if (step < maxStep(s)) {
      step++;
      s.querySelectorAll(`[data-step="${step}"]`).forEach((el) => { el.classList.remove('pending'); if (!RM) play(el); });
      return;
    }
    go(cur + 1, 1);
  }

  // ---------- HUD ----------
  const pbar = document.querySelector('#progress i'), counter = document.querySelector('#counter b'), sec = document.getElementById('sec'), notes = document.getElementById('notes');
  function hud() {
    pbar.style.width = ((cur + 1) / N) * 100 + '%';
    counter.textContent = String(cur + 1).padStart(2, '0');
    sec.textContent = slides[cur].dataset.section;
    try { if (location.hash !== '#' + (cur + 1)) history.replaceState(null, '', '#' + (cur + 1)); } catch (e) { /* sandboxed viewer */ }
    if (notes.classList.contains('show')) showNotes();
  }
  function showNotes() { notes.innerHTML = `<h4>Ghi chú · slide ${cur + 1}</h4>` + slides[cur].querySelector('.notes').innerHTML; }
  const hint = document.getElementById('hint');
  if (!STATIC) { hint.classList.add('show'); setTimeout(() => hint.classList.remove('show'), 4200); }

  // ---------- overview ----------
  function layoutOverview() {
    const k = 0.19, gx = 24, gy = 30, cols = 5;
    const rows = Math.ceil(N / cols);
    const W = cols * 1920 * k + (cols - 1) * gx, H = rows * 1080 * k + (rows - 1) * gy;
    const VW = vp.clientWidth || innerWidth, VH = vp.clientHeight || innerHeight;
    const s = Math.min(VW / (W + 80), VH / (H + 80));
    scale = s;
    stage.style.transform = `translate(${(VW - W * s) / 2}px,${(VH - H * s) / 2}px) scale(${s})`;
    slides.forEach((sl, i) => {
      const c = i % cols, r = Math.floor(i / cols);
      sl.style.transformOrigin = '0 0';
      sl.style.transform = `translate(${c * (1920 * k + gx)}px,${r * (1080 * k + gy)}px) scale(${k})`;
    });
  }
  function toggleOverview(force) {
    overview = force ?? !overview;
    document.documentElement.classList.toggle('overview', overview);
    if (overview) { stopAll(); layoutOverview(); }
    else { slides.forEach((sl) => (sl.style.transform = '')); fit(); const c = cur; cur = -1; go(c, -1); }
  }
  slides.forEach((sl, i) => sl.addEventListener('click', (e) => { if (overview) { e.stopPropagation(); cur = i; toggleOverview(false); } }));

  // ---------- input ----------
  addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key;
    if (overview) {
      if (k === 'Escape' || k === 'o' || k === 'Enter') toggleOverview(false);
      else if (k === 'ArrowRight') { cur = Math.min(N - 1, cur + 1); slides.forEach((s, i) => s.classList.toggle('current', i === cur)); }
      else if (k === 'ArrowLeft') { cur = Math.max(0, cur - 1); slides.forEach((s, i) => s.classList.toggle('current', i === cur)); }
      return;
    }
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(k)) { e.preventDefault(); nextStep(); }
    else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(k)) { e.preventDefault(); go(cur - 1, -1); }
    else if (k === 'Home') go(0, -1);
    else if (k === 'End') go(N - 1, -1);
    else if (k === 'Escape' || k === 'o') toggleOverview(true);
    else if (k === 'f' || k === 'F') { document.fullscreenElement ? document.exitFullscreen() : (document.documentElement.requestFullscreen?.() || Promise.resolve()).catch(() => {}); }
    else if (k === 'n' || k === 'N') { notes.classList.toggle('show'); showNotes(); }
  });
  vp.tabIndex = 0;
  vp.addEventListener('click', (e) => { vp.focus({ preventScroll: true }); if (!overview && !STATIC) nextStep(); });
  let tx = null;
  addEventListener('touchstart', (e) => (tx = e.touches[0].clientX), { passive: true });
  addEventListener('touchend', (e) => { if (tx === null) return; const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 40) dx < 0 ? nextStep() : go(cur - 1, -1); tx = null; });
  if (!RM && !STATIC) addEventListener('pointermove', (e) => {
    stage.style.setProperty('--px', (e.clientX / innerWidth - 0.5).toFixed(3));
    stage.style.setProperty('--py', (e.clientY / innerHeight - 0.5).toFixed(3));
  });

  // ---------- boot ----------
  fit();
  const start = Math.max(1, Math.min(N, parseInt(qs.get('slide') || location.hash.slice(1) || '1', 10) || 1)) - 1;
  window.__deck = { go: (n) => { cur = -1; go(n, STATIC ? -1 : 1); }, count: N, get cur() { return cur; }, next: nextStep };
  document.fonts.ready.then(() => go(start, STATIC ? -1 : 1));
})();
