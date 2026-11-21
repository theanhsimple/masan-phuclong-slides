// Builds powerpoint/presentation.pptx from spec/presentation.json (same source as the HTML).
// Prereq: qa/shoot.js bg  → powerpoint/bg/bgNN.jpg (atmospheric backgrounds rendered from the HTML scenes)
// Then: python3 powerpoint/postprocess.py (transitions + native entrance animations)
const fs = require('fs');
const path = require('path');
const pptxgen = require('pptxgenjs');
const { applyTheme } = require('/mnt/skills/public/pptx/scripts/apply_theme.js');

const ROOT = path.join(__dirname, '..');
const spec = JSON.parse(fs.readFileSync(path.join(ROOT, 'spec/presentation.json'), 'utf8'));
const C = spec.tokens.color;
const IN = (px) => +(px / 144).toFixed(4);
const PT = (px) => +(px / 2).toFixed(2);
const hx = (c) => c.replace('#', '').toUpperCase();
const SAFE = process.env.SAFE === '1';
const HEAD = SAFE ? 'Cambria' : 'Lora', BODY = SAFE ? 'Calibri' : 'Inter';
const FSCALE = SAFE ? { Lora: 0.97, Inter: 1.07 } : { Lora: 1, Inter: 1 }; // Calibri runs small, Cambria a touch large
const OUTFILE = SAFE ? 'presentation-safe-fonts.pptx' : 'presentation.pptx';

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

const THEME = {
  name: 'Ủ Vị – Tea Light Editorial',
  headFontFace: HEAD,
  bodyFontFace: BODY,
  colors: {
    dk1: hx(C.ink), lt1: hx(C.cream), dk2: hx(C.forest800), lt2: hx(C.cream2),
    accent1: hx(C.tea600), accent2: hx(C.amber), accent3: hx(C.tea400), accent4: hx(C.amberD),
    accent5: hx(C.sage), accent6: hx(C.forest700), hlink: hx(C.tea600), folHlink: hx(C.amberD),
  },
};

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';
pres.title = spec.meta.title;
pres.author = spec.meta.author;
pres.company = 'UFM · K26D2 · Nhóm 2';
pres.theme = { headFontFace: HEAD, bodyFontFace: BODY };

function textOpts(e, extra = {}) {
  const p = STY[e.s];
  const w8 = e.w8 || p.w;
  const ls = e.ls ?? p.ls ?? 0;
  return {
    fontFace: p.f === 'Lora' ? HEAD : BODY, fontSize: +(PT(e.size || p.s) * FSCALE[p.f]).toFixed(1), bold: w8 >= 600, italic: !!e.italic,
    color: hx(e.c), align: e.align || 'left', valign: 'top', margin: 0,
    lineSpacing: +(PT((e.size || p.s) * (e.lh || p.lh)) * FSCALE[p.f]).toFixed(1), charSpacing: ls ? PT(ls) : undefined, fit: 'none', ...extra,
  };
}
function runs(e) {
  const p = STY[e.s];
  const up = e.up ?? p.up;
  const src = Array.isArray(e.text) ? e.text : [{ t: e.text }];
  const out = [];
  src.forEach((r) => {
    const parts = (up ? r.t.toUpperCase() : r.t).split('\n');
    parts.forEach((t, i) => {
      const o = {};
      if (r.c) o.color = hx(r.c);
      if (i < parts.length - 1) o.breakLine = true;
      if (t) out.push({ text: t, options: o });
      else if (o.breakLine && out.length) out[out.length - 1].options.breakLine = true;
    });
  });
  return out;
}

// ---------- layouts: one per distinct title frame (keeps a real title placeholder on every slide) ----------
const layouts = new Map();
function layoutFor(s) {
  const t = s.els.find((e) => e.role === 'title');
  const p = STY[t.s];
  const key = [s.dark ? 'D' : 'L', t.x, t.y, t.w, t.h, t.size || p.s, t.s, hx(t.c)].join('_');
  if (!layouts.has(key)) {
    const name = `L${layouts.size + 1} ${s.dark ? 'Dark' : 'Light'} · ${t.s}`;
    pres.defineSlideMaster({
      title: name,
      background: { color: s.dark ? hx(C.forest900) : hx(C.cream) },
      objects: [{
        placeholder: {
          options: { name: 'title', type: 'title', x: IN(t.x), y: IN(t.y), w: IN(t.w), h: IN(t.h), ...textOpts(t) },
          text: '',
        },
      }],
    });
    layouts.set(key, name);
  }
  return layouts.get(key);
}

let lastSection = null;
spec.slides.forEach((s, si) => {
  if (s.section !== lastSection) { pres.addSection({ title: s.section }); lastSection = s.section; }
  const slide = pres.addSlide({ masterName: layoutFor(s), sectionTitle: s.section });
  slide.background = { path: path.join(__dirname, 'bg', `bg${String(si + 1).padStart(2, '0')}.jpg`) };

  for (const e of s.els) {
    const name = e.name || `${s.id}__${e.id}`;
    switch (e.t) {
      case 'text': {
        if (e.role === 'title') { slide.addText(runs(e), { placeholder: 'title', ...textOpts(e) }); break; }
        slide.addText(runs(e), { x: IN(e.x), y: IN(e.y), w: IN(e.w), h: IN(e.h), isTextBox: true, objectName: name, ...textOpts(e) });
        break;
      }
      case 'rect':
      case 'ellipse': {
        const shape = e.t === 'ellipse' ? pres.shapes.OVAL : e.r ? pres.shapes.ROUNDED_RECTANGLE : pres.shapes.RECTANGLE;
        const o = {
          x: IN(e.x), y: IN(e.y), w: IN(e.w), h: IN(e.h), objectName: name,
          fill: { color: hx(e.fill), transparency: e.alpha !== undefined ? Math.round((1 - e.alpha) * 100) : 0 },
          line: e.line ? { color: hx(e.line.c), width: PT(e.line.w) } : { type: 'none' },
        };
        if (shape === pres.shapes.ROUNDED_RECTANGLE) o.rectRadius = IN(e.r);
        slide.addShape(shape, o);
        break;
      }
      case 'box': {
        slide.addText(e.text, {
          shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: IN(e.r || 0), x: IN(e.x), y: IN(e.y), w: IN(e.w), h: IN(e.h), objectName: name,
          fill: { color: hx(e.fill), transparency: e.alpha !== undefined ? Math.round((1 - e.alpha) * 100) : 0 },
          line: e.line ? { color: hx(e.line.c), width: PT(e.line.w) } : { type: 'none' },
          ...textOpts(e, { valign: 'middle', align: e.align || 'center', margin: [0, 8, 0, 8], lineSpacing: undefined, lineSpacingMultiple: 1.0 }),
        });
        break;
      }
      case 'line': {
        const o = {
          x: IN(Math.min(e.x1, e.x2)), y: IN(Math.min(e.y1, e.y2)), w: IN(Math.abs(e.x2 - e.x1)), h: IN(Math.abs(e.y2 - e.y1)), objectName: name,
          line: { color: hx(e.c), width: PT(e.w), dashType: e.dash ? 'dash' : 'solid', endArrowType: e.arrow ? 'triangle' : undefined },
        };
        if ((e.x2 - e.x1) * (e.y2 - e.y1) < 0) o.flipV = true;
        slide.addShape(pres.shapes.LINE, o);
        break;
      }
      case 'image':
        slide.addImage({ path: path.join(ROOT, e.src), x: IN(e.x), y: IN(e.y), w: IN(e.w), h: IN(e.h), altText: e.alt, objectName: name });
        break;
      case 'chart': {
        if (e.kind === 'ring') {
          // native, editable block arcs (predictable in every renderer, unlike doughnut hole sizes)
          const ratio = 1 - e.hole / 100, total = e.vals[0] + e.vals[1];
          const endA = (270 + (e.vals[0] / total) * 360) % 360;
          slide.addShape(pres.shapes.BLOCK_ARC, { x: IN(e.x), y: IN(e.y), w: IN(e.w), h: IN(e.h), angleRange: [0, 359.9], arcThicknessRatio: ratio, fill: { color: hx(e.colors[1]) }, line: { type: 'none' }, objectName: name + '_track' });
          slide.addShape(pres.shapes.BLOCK_ARC, { x: IN(e.x), y: IN(e.y), w: IN(e.w), h: IN(e.h), angleRange: [270, endA], arcThicknessRatio: ratio, fill: { color: hx(e.colors[0]) }, line: { type: 'none' }, objectName: name, altText: 'Masan sở hữu 85% Phúc Long Heritage' });
        } else {
          const fg = e.dark ? C.cream : C.ink, sub = e.dark ? C.mutedL : C.muted, base = e.dark ? C.lineD : C.line;
          const pct = e.labels[0].includes('%');
          slide.addChart(pres.charts.BAR, [{ name: 'Giá trị', labels: e.cats, values: e.vals }], {
            x: IN(e.x), y: IN(e.y), w: IN(e.w), h: IN(e.h), objectName: name, altText: e.alt,
            barDir: 'col', barGapWidthPct: 79, chartColors: e.colors.map(hx),
            valAxisHidden: true, valAxisMinVal: 0, valAxisMaxVal: e.max, valGridLine: { style: 'none' }, catGridLine: { style: 'none' },
            showValue: true, dataLabelPosition: 'outEnd', dataLabelFontFace: HEAD, dataLabelFontSize: PT(e.valueSize), dataLabelColor: hx(fg),
            dataLabelFormatCode: pct ? '0"%"' : '#,##0',
            catAxisLabelFontFace: BODY, catAxisLabelFontSize: 12, catAxisLabelColor: hx(sub), catAxisLineShow: true,
            catAxisLineColor: hx(base), catAxisLineSize: 1, valAxisLineShow: false, showLegend: false,
            plotArea: { fill: { color: hx(C.cream), transparency: 100 } }, chartArea: { fill: { color: hx(C.cream), transparency: 100 } },
          });
        }
        break;
      }
    }
  }
  slide.addNotes(s.notes || '');
});

(async () => {
  const out = path.join(__dirname, OUTFILE);
  await pres.writeFile({ fileName: out });
  await applyTheme(out, THEME);
  console.log('written', out, 'layouts:', layouts.size);
})();
