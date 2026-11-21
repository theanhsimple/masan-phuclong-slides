// Builds html/index.html (self-contained) from spec/presentation.json
// node html/build-html.js
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const spec = JSON.parse(fs.readFileSync(path.join(ROOT, 'spec/presentation.json'), 'utf8'));
const TK = spec.tokens;
const C = TK.color;

const b64 = (p) => fs.readFileSync(path.join(ROOT, p)).toString('base64');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const hexA = (hex, a = 1) => {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return a >= 1 ? `#${h}` : `rgba(${r},${g},${b},${a})`;
};

// ---------- typography presets (px) ----------
const STY = {
  display: { f: 'Lora', w: 500, s: 140, lh: 1.0, ls: -2 },
  statement: { f: 'Lora', w: 500, s: 104, lh: 1.06, ls: -1 },
  title: { f: 'Lora', w: 500, s: 68, lh: 1.1, ls: -0.5 },
  h2: { f: 'Lora', w: 500, s: 44, lh: 1.18 },
  h3: { f: 'Inter', w: 600, s: 32, lh: 1.25 },
  body: { f: 'Inter', w: 400, s: 28, lh: 1.45 },
  label: { f: 'Inter', w: 600, s: 26, lh: 1.3 },
  small: { f: 'Inter', w: 400, s: 24, lh: 1.4 },
  caption: { f: 'Inter', w: 400, s: 22, lh: 1.35 },
  eyebrow: { f: 'Inter', w: 600, s: 22, lh: 1.3, ls: 4, up: true },
  num: { f: 'Lora', w: 500, s: 120, lh: 1.0, ls: -1 },
};
const FAM = { Lora: "'Lora', Georgia, serif", Inter: "'Inter', 'Segoe UI', Arial, sans-serif" };

// ---------- scenes ----------
const SCENES = {
  dusk: { base: 'linear-gradient(155deg,#12291F 0%,#0B1D16 55%,#07140F 100%)', glows: [[1650, 140, 950, '227,172,92', 0.24], [80, 1060, 1050, '43,106,78', 0.5], [960, 560, 700, '27,58,44', 0.35]], dark: true },
  hero: { base: 'linear-gradient(160deg,#12291F 0%,#0B1D16 50%,#06120D 100%)', glows: [[1450, 590, 1050, '227,172,92', 0.30], [60, 1080, 950, '43,106,78', 0.45], [700, 0, 700, '94,156,124', 0.12]], dark: true },
  paper: { base: 'linear-gradient(160deg,#F8F3EA 0%,#F1EADC 50%,#E9E0CC 100%)', glows: [[1820, 60, 1050, '157,204,177', 0.42], [0, 1080, 950, '227,172,92', 0.22]], dark: false },
  paper2: { base: 'linear-gradient(160deg,#F0E8D8 0%,#E8DECA 55%,#DFD3BA 100%)', glows: [[1820, 60, 1000, '157,204,177', 0.38], [0, 1080, 950, '227,172,92', 0.25]], dark: false },
  amber: { base: 'linear-gradient(135deg,#EDB86A 0%,#DA923C 50%,#B0682A 100%)', glows: [[220, 140, 1000, '252,240,215', 0.45], [1800, 1020, 900, '122,62,14', 0.40]], dark: false },
  split: { base: 'linear-gradient(90deg,#0F241A 0%,#0B1D16 50%,#291D11 50%,#3A2814 100%)', glows: [[300, 200, 850, '43,106,78', 0.40], [1650, 880, 850, '227,172,92', 0.24]], dark: true },
};
const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="260" height="260"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 1 0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>')}")`;

// ---------- decorative SVG ----------
let uid = 0;
function cup({ cx, cy, r }) {
  const id = `c${uid++}`;
  const ripples = [0.22, 0.34, 0.46, 0.58, 0.70].map((f, i) => `<circle cx="${cx}" cy="${cy}" r="${(r * 0.84 * f).toFixed(1)}" fill="none" stroke="#F2C27A" stroke-opacity="${(0.32 - i * 0.04).toFixed(2)}" stroke-width="1.6"/>`).join('');
  return `
  <defs>
    <radialGradient id="${id}l" cx="42%" cy="38%" r="70%"><stop offset="0" stop-color="#F6CB86"/><stop offset=".32" stop-color="#DD9A43"/><stop offset=".72" stop-color="#97561A"/><stop offset="1" stop-color="#5B2D0A"/></radialGradient>
    <radialGradient id="${id}r" cx="40%" cy="35%" r="75%"><stop offset="0" stop-color="#FBF7EE"/><stop offset=".7" stop-color="#E9DFC9"/><stop offset="1" stop-color="#C9BA98"/></radialGradient>
    <filter id="${id}b" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="28"/></filter>
  </defs>
  <g class="cup">
    <circle cx="${cx}" cy="${cy}" r="${r * 1.32}" fill="#F4EEE2" fill-opacity=".035" stroke="#F4EEE2" stroke-opacity=".16" stroke-width="2"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 1.2}" fill="none" stroke="#F4EEE2" stroke-opacity=".08" stroke-width="1.5"/>
    <circle cx="${cx + 22}" cy="${cy + 30}" r="${r * 1.02}" fill="#000" fill-opacity=".45" filter="url(#${id}b)"/>
    <rect x="${cx + r * 0.9}" y="${cy - r * 0.13}" width="${r * 0.36}" height="${r * 0.26}" rx="${r * 0.13}" fill="url(#${id}r)"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${id}r)"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 0.86}" fill="#6B3A12" fill-opacity=".35"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 0.84}" fill="url(#${id}l)"/>
    <g class="ripples" style="transform-origin:${cx}px ${cy}px">${ripples}</g>
    <g class="floatleaf" style="transform-origin:${cx + r * 0.22}px ${cy + r * 0.18}px">
      <path d="M${cx + r * 0.08} ${cy + r * 0.18} c ${r * 0.06} -${r * 0.09} ${r * 0.2} -${r * 0.1} ${r * 0.28} 0 c -${r * 0.08} ${r * 0.1} -${r * 0.22} ${r * 0.09} -${r * 0.28} 0z" fill="#2B6A4E" fill-opacity=".85"/>
    </g>
    <ellipse cx="${cx - r * 0.32}" cy="${cy - r * 0.4}" rx="${r * 0.3}" ry="${r * 0.075}" transform="rotate(-32 ${cx - r * 0.32} ${cy - r * 0.4})" fill="#fff" fill-opacity=".28"/>
  </g>`;
}
function steam({ x, y }) {
  const p = (dx, s) => `<path class="steam" style="animation-delay:${s}s" d="M${x + dx} ${y + 150} c -40 -40 40 -80 0 -120 s 40 -80 0 -120" fill="none" stroke="#F4EEE2" stroke-opacity=".22" stroke-width="3" stroke-linecap="round"/>`;
  return p(-60, 0) + p(0, 1.4) + p(60, 2.6);
}
function contour({ cx, cy, rx, ry, n, c, a, rot }) {
  let out = `<g transform="rotate(${rot || 0} ${cx} ${cy})" fill="none" stroke="${c}" stroke-opacity="${a}" stroke-width="1.6">`;
  for (let k = 1; k <= n; k++) {
    const s = k / n;
    let d = '';
    for (let i = 0; i <= 96; i++) {
      const t = (i / 96) * Math.PI * 2;
      const f = 1 + 0.07 * Math.sin(3 * t + k * 0.7) + 0.04 * Math.sin(5 * t + k * 1.3);
      const x = cx + rx * s * f * Math.cos(t), y = cy + ry * s * f * Math.sin(t);
      d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
    }
    out += `<path d="${d}Z"/>`;
  }
  return out + '</g>';
}
function leaf({ x, y, s, rot, c, a }) {
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})" fill="none" stroke="${c}" stroke-opacity="${a}" stroke-width="${2 / s}" stroke-linecap="round">
    <path d="M0 0 C 50 -70 150 -80 240 0 C 150 80 50 70 0 0 Z"/><path d="M0 0 L 240 0"/>
    <path d="M60 0 L 90 -38 M110 0 L 140 -44 M160 0 L 185 -34 M60 0 L 90 38 M110 0 L 140 44 M160 0 L 185 34"/></g>`;
}
function rings({ cx, cy, r, c, a }) {
  return [0.35, 0.5, 0.65, 0.8, 1].map((f, i) => `<circle cx="${cx}" cy="${cy}" r="${r * f}" fill="none" stroke="${c}" stroke-opacity="${(a * (1 - i * 0.12)).toFixed(2)}" stroke-width="2"/>`).join('');
}
const DECO = { cup, steam, contour, leaf, rings };

// ---------- elements ----------
function textStyle(e) {
  const p = STY[e.s];
  const size = e.size || p.s;
  const ls = e.ls ?? p.ls ?? 0;
  return [
    `font-family:${FAM[p.f]}`, `font-weight:${e.w8 || p.w}`, `font-size:${size}px`, `line-height:${e.lh || p.lh}`,
    ls ? `letter-spacing:${ls}px` : '', (e.up ?? p.up) ? 'text-transform:uppercase' : '', e.italic ? 'font-style:italic' : '',
    `color:${e.c}`, `text-align:${e.align || 'left'}`,
  ].filter(Boolean).join(';');
}
function runsHTML(text, words) {
  const runs = Array.isArray(text) ? text : [{ t: text }];
  let html = '';
  for (const r of runs) {
    const lines = r.t.split('\n');
    lines.forEach((ln, li) => {
      if (li > 0) html += '<br>';
      const content = words
        ? ln.split(/(\s+)/).map((tok) => (/^\s+$/.test(tok) || !tok ? tok : `<span class="w"><span>${esc(tok)}</span></span>`)).join('')
        : esc(ln);
      html += r.c ? `<span style="color:${r.c}">${content}</span>` : content;
    });
  }
  return html;
}
const box = (e) => `left:${e.x}px;top:${e.y}px;width:${e.w}px;height:${e.h}px`;
function motionAttrs(e) {
  const a = [];
  if (e.m) { a.push(`data-m="${e.m.a}"`, `data-d="${e.m.d || 0}"`); if (e.m.dur) a.push(`data-dur="${e.m.dur}"`); }
  if (e.step) a.push(`data-step="${e.step}"`);
  if (e.morph && e.t !== 'chart') a.push(`data-morph="${e.morph}"`);
  return a.join(' ');
}
function elHTML(e) {
  const ma = motionAttrs(e);
  switch (e.t) {
    case 'text': {
      const isNum = e.m && e.m.a === 'count';
      return `<div class="el tx" ${ma} ${isNum ? `data-val="${esc(e.text)}"` : ''} style="${box(e)};${textStyle(e)}"${e.role === 'title' ? ' role="heading" aria-level="2"' : ''}>${runsHTML(e.text, e.m && e.m.a === 'words')}</div>`;
    }
    case 'rect':
    case 'ellipse': {
      const st = [box(e), `background:${hexA(e.fill, e.alpha ?? 1)}`, e.line ? `border:${e.line.w}px solid ${e.line.c}` : '', e.t === 'ellipse' ? 'border-radius:50%' : e.r ? `border-radius:${e.r}px` : '', 'box-sizing:border-box'];
      if (e.alpha !== undefined && e.alpha < 1 && e.fill === '#FFFFFF') st.push('backdrop-filter:blur(14px)', '-webkit-backdrop-filter:blur(14px)');
      return `<div class="el sh" ${ma} style="${st.filter(Boolean).join(';')}"></div>`;
    }
    case 'box': {
      const st = [box(e), `background:${hexA(e.fill, e.alpha ?? 1)}`, e.line ? `border:${e.line.w}px solid ${e.line.c}` : '', `border-radius:${e.r || 0}px`, 'box-sizing:border-box', 'display:flex', 'align-items:center', `justify-content:${e.align === 'center' ? 'center' : 'flex-start'}`, 'padding:0 22px', textStyle(e)];
      return `<div class="el bx" ${ma} style="${st.filter(Boolean).join(';')}">${esc(e.text)}</div>`;
    }
    case 'line': {
      const pad = 14;
      const x = Math.min(e.x1, e.x2) - pad, y = Math.min(e.y1, e.y2) - pad;
      const w = Math.abs(e.x2 - e.x1) + pad * 2, h = Math.abs(e.y2 - e.y1) + pad * 2;
      const mk = e.arrow ? `<defs><marker id="ah_${uid}" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="${e.c}"/></marker></defs>` : '';
      const mid = e.arrow ? ` marker-end="url(#ah_${uid++})"` : '';
      return `<svg class="el ln" ${ma} style="left:${x}px;top:${y}px;width:${w}px;height:${h}px" viewBox="0 0 ${w} ${h}">${mk}<line x1="${e.x1 - x}" y1="${e.y1 - y}" x2="${e.x2 - x - (e.arrow ? 6 : 0)}" y2="${e.y2 - y}" stroke="${e.c}" stroke-width="${e.w}" stroke-linecap="round"${e.dash ? ' stroke-dasharray="10 9"' : ''}${mid}/></svg>`;
    }
    case 'image':
      return `<div class="el im" ${ma} style="${box(e)};border-radius:${e.r || 0}px;overflow:hidden"><img alt="${esc(e.alt)}" src="data:image/jpeg;base64,${b64('assets/images/phuclong-store-web.jpg')}" style="width:100%;height:100%;object-fit:cover;display:block"></div>`;
    case 'chart':
      return e.kind === 'ring' ? ringHTML(e, ma) : barHTML(e, ma);
  }
  return '';
}
function barHTML(e, ma) {
  const n = e.vals.length, slot = e.w / n, bw = Math.round(slot * 0.56);
  const catH = 64, valH = Math.round(e.valueSize * 1.25);
  const plotH = e.h - catH - valH - 10;
  const fg = e.dark ? C.cream : C.ink, sub = e.dark ? C.mutedL : C.muted, base = e.dark ? C.lineD : C.line;
  let inner = `<div class="baseline" style="left:0;top:${e.h - catH}px;width:${e.w}px;background:${base}"></div>`;
  e.vals.forEach((v, i) => {
    const bh = Math.round((v / e.max) * plotH);
    const x = Math.round(i * slot + (slot - bw) / 2);
    const top = e.h - catH - bh;
    inner += `<div class="bar" ${e.morph ? `data-morph="${e.morph}-${i}"` : ''} data-i="${i}" style="left:${x}px;top:${top}px;width:${bw}px;height:${bh}px;background:${e.colors[i]}"></div>`;
    inner += `<div class="bval" data-i="${i}" data-val="${esc(e.labels[i])}" style="left:${x - 40}px;top:${top - valH - 4}px;width:${bw + 80}px;height:${valH}px;font:500 ${e.valueSize}px/${valH}px ${FAM.Lora};color:${fg};text-align:center">${esc(e.labels[i])}</div>`;
    inner += `<div class="bcat" style="left:${Math.round(i * slot)}px;top:${e.h - catH + 16}px;width:${Math.round(slot)}px;font:400 24px/1.3 ${FAM.Inter};color:${sub};text-align:center">${esc(e.cats[i])}</div>`;
  });
  return `<div class="el chart" ${ma} role="img" aria-label="${esc(e.alt || '')}" style="${box(e)}">${inner}</div>`;
}
function ringHTML(e, ma) {
  const sw = (e.w / 2) * (1 - e.hole / 100), r = e.w / 2 - sw / 2, c = 2 * Math.PI * r;
  const len = (e.vals[0] / (e.vals[0] + e.vals[1])) * c;
  return `<svg class="el ring" ${ma} style="${box(e)}" viewBox="0 0 ${e.w} ${e.h}" role="img" aria-label="${e.vals[0]}%">
    <circle cx="${e.w / 2}" cy="${e.h / 2}" r="${r}" fill="none" stroke="${e.colors[1]}" stroke-width="${sw}"/>
    <circle class="arc" cx="${e.w / 2}" cy="${e.h / 2}" r="${r}" fill="none" stroke="${e.colors[0]}" stroke-width="${sw}" stroke-dasharray="${len} ${c}" transform="rotate(-90 ${e.w / 2} ${e.h / 2})" data-len="${len}"/></svg>`;
}

// ---------- slides ----------
function slideHTML(s, i) {
  const sc = SCENES[s.scene];
  const glows = sc.glows.map(([x, y, r, rgb, a], k) => `<div class="glow" style="left:${x - r / 2}px;top:${y - r / 2}px;width:${r}px;height:${r}px;background:radial-gradient(circle, rgba(${rgb},${a}) 0%, rgba(${rgb},${(a * 0.45).toFixed(3)}) 35%, rgba(${rgb},0) 70%);animation-duration:${16 + k * 5}s;animation-delay:-${k * 4}s"></div>`).join('');
  const deco = (s.deco || []).map((d) => DECO[d.k](d)).join('');
  return `
<section class="slide scene-${s.scene} ${sc.dark ? 'is-dark' : 'is-light'}" id="s-${s.id}" data-id="${s.id}" data-index="${i}" data-section="${esc(s.section)}" data-transition="${s.transition}" aria-label="Slide ${i + 1}">
  <div class="bg" aria-hidden="true">
    <div class="scene" style="background:${sc.base}"></div>
    <div class="glows">${glows}</div>
    <svg class="deco" viewBox="0 0 1920 1080" preserveAspectRatio="none">${deco}</svg>
    <div class="grain"></div>
  </div>
  <div class="content">
${s.els.map(elHTML).join('\n')}
  </div>
  <aside class="notes" hidden>${esc(s.notes || '')}</aside>
</section>`;
}

const css = fs.readFileSync(path.join(__dirname, 'src/styles.css'), 'utf8')
  .replace('/*FONTS*/', `
@font-face{font-family:'Lora';src:url(data:font/woff;base64,${b64('assets/fonts/lora.woff')}) format('woff');font-weight:400 700;font-style:normal;font-display:block}
@font-face{font-family:'Lora';src:url(data:font/woff;base64,${b64('assets/fonts/lora-italic.woff')}) format('woff');font-weight:400 700;font-style:italic;font-display:block}
@font-face{font-family:'Inter';src:url(data:font/woff;base64,${b64('assets/fonts/inter-400.woff')}) format('woff');font-weight:400;font-display:block}
@font-face{font-family:'Inter';src:url(data:font/woff;base64,${b64('assets/fonts/inter-500.woff')}) format('woff');font-weight:500;font-display:block}
@font-face{font-family:'Inter';src:url(data:font/woff;base64,${b64('assets/fonts/inter-600.woff')}) format('woff');font-weight:600 700;font-display:block}`)
  .replace('/*GRAIN*/', GRAIN);
const js = fs.readFileSync(path.join(__dirname, 'src/engine.js'), 'utf8');

const html = `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(spec.meta.title)}</title>
<style>${css}</style>
</head>
<body>
<div id="viewport">
  <div id="stage">
${spec.slides.map(slideHTML).join('\n')}
  </div>
</div>
<div id="hud" aria-hidden="true">
  <div id="progress"><i></i></div>
  <div id="counter"><b>01</b> / ${String(spec.slides.length).padStart(2, '0')} <span id="sec"></span></div>
  <div id="hint">← → hoặc Space để chuyển · Esc tổng quan · F toàn màn hình · N ghi chú</div>
</div>
<div id="notes" aria-live="polite"></div>
<script>${js}</script>
</body>
</html>`;
fs.writeFileSync(path.join(__dirname, 'index.html'), html);
console.log('index.html', (html.length / 1024).toFixed(0) + ' KB');
