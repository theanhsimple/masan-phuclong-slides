// Single source of truth for BOTH the HTML and the PowerPoint builds.
// Coordinates are px on a 1920×1080 canvas (PPTX: 1px = 1/144 in, 0.5pt).
// Run: node spec/build-spec.js  → spec/presentation.json
const fs = require('fs');
const path = require('path');
const tokens = require('../design-system/tokens.json');
const C = tokens.color;

// ---------- element helpers ----------
const T = (id, x, y, w, h, text, s, o = {}) => ({ t: 'text', id, x, y, w, h, text, s, ...o });
const R = (id, x, y, w, h, o = {}) => ({ t: 'rect', id, x, y, w, h, ...o });
const E = (id, x, y, w, h, o = {}) => ({ t: 'ellipse', id, x, y, w, h, ...o });
const L = (id, x1, y1, x2, y2, o = {}) => ({ t: 'line', id, x1, y1, x2, y2, ...o });
const B = (id, x, y, w, h, text, s, o = {}) => ({ t: 'box', id, x, y, w, h, text, s, ...o });
const I = (id, x, y, w, h, src, alt, o = {}) => ({ t: 'image', id, x, y, w, h, src, alt, ...o });
const CH = (id, x, y, w, h, o) => ({ t: 'chart', id, x, y, w, h, ...o });
const m = (a, d = 0, extra = {}) => ({ a, d, ...extra });

function head(eyebrow, title, dark, o = {}) {
  return [
    T('eyebrow', 140, 112, 1640, 30, eyebrow, 'eyebrow', { c: dark ? C.amberL : C.amberD, m: m('fade', 0) }),
    T('title', 140, 152, o.tw || 1640, o.th || 170, title, 'title', { c: dark ? C.cream : C.ink, role: 'title', m: m('words', 80) }),
  ];
}
const chipW = (txt) => Math.round(txt.length * 14 + 52);

const slides = [];

// 1 ─ COVER ───────────────────────────────────────────────
slides.push({
  id: 'cover', section: 'Mở đầu', scene: 'hero', dark: true, layout: 'hero', transition: 'fade',
  deco: [
    { k: 'cup', cx: 1450, cy: 590, r: 300 },
    { k: 'steam', x: 1450, y: 110 },
    { k: 'contour', cx: 160, cy: 1060, rx: 520, ry: 300, n: 9, c: C.sage, a: 0.10, rot: -8 },
  ],
  els: [
    T('eyebrow', 140, 120, 900, 30, 'Phân tích thương vụ M&A', 'eyebrow', { c: C.amberL, m: m('fade', 0) }),
    T('title', 140, 296, 1100, 336, [{ t: 'Masan ' }, { t: '×', c: C.amberL }, { t: '\nPhúc Long' }], 'display', { size: 150, c: C.cream, role: 'title', m: m('words', 150) }),
    T('sub', 140, 640, 980, 64, 'Chiến lược thu mua theo từng bước', 'h2', { italic: true, size: 48, c: C.amberL, m: m('rise', 650) }),
    L('rule', 140, 900, 1780, 900, { c: C.lineD, w: 2, m: m('draw', 800) }),
    T('meta1', 140, 928, 800, 40, 'Nhóm 2 · K26D2 · UFM', 'body', { c: C.mutedL, m: m('fade', 950) }),
    T('meta2', 980, 928, 800, 40, '2021 – 2026 · 20% → 51% → 85%', 'label', { c: C.amberL, align: 'right', m: m('fade', 1050) }),
  ],
  notes: 'Chào thầy cô và các bạn. Nhóm 2 trình bày phân tích chiến lược thu mua Phúc Long của Masan Group. Hình ảnh chủ đạo là vòng tròn của một tách trà nhìn từ trên xuống, và dãy số 20% – 51% – 85% là “xương sống” của câu chuyện: Masan nâng sở hữu Phúc Long qua ba đợt.',
});

// 2 ─ AGENDA ──────────────────────────────────────────────
{
  const rows = [
    ['Hai doanh nghiệp, bối cảnh và động cơ', 'Masan, Phúc Long và lý do hai bên tìm đến nhau'],
    ['Quá trình thực hiện thương vụ', 'Ba bước nâng sở hữu: 20% → 51% → 85%'],
    ['Yếu tố thúc đẩy và cản trở', 'Bảy nguồn giá trị kỳ vọng và mặt trái của từng nguồn'],
    ['Đánh giá kết quả và tổng kết', 'Điều gì đã thành công, điều gì phải trả giá'],
  ];
  const els = [...head('Mục lục', 'Bốn chương của một thương vụ', false)];
  rows.forEach(([t, s], i) => {
    const y = 330 + i * 150;
    els.push(L(`r${i}`, 140, y, 1160, y, { c: C.line, w: 2, m: m('draw', 250 + i * 110) }));
    els.push(T(`n${i}`, 140, y + 26, 140, 84, `0${i + 1}`, 'num', { size: 72, c: C.amberD, m: m('rise', 300 + i * 110) }));
    els.push(T(`t${i}`, 300, y + 30, 860, 44, t, 'h3', { c: C.ink, m: m('rise', 340 + i * 110) }));
    els.push(T(`s${i}`, 300, y + 82, 860, 36, s, 'small', { c: C.muted, m: m('rise', 380 + i * 110) }));
  });
  els.push(L('r4', 140, 930, 1160, 930, { c: C.line, w: 2, m: m('draw', 700) }));
  els.push(R('team', 1260, 330, 520, 600, { fill: '#FFFFFF', alpha: 0.5, r: 20, line: { c: C.line, w: 2 }, m: m('rise', 500) }));
  els.push(T('teamk', 1310, 378, 420, 30, 'Nhóm thực hiện', 'eyebrow', { c: C.muted, m: m('fade', 650) }));
  ['Trịnh Thanh Hải', 'Lý Diệu Hiền', 'Đỗ Thị Hiền', 'Nghiêm Thị Thu Hiền', 'Dương Duy', 'Dương Nguyễn Đức Hiếu'].forEach((n, k) =>
    els.push(T(`p${k}`, 1310, 438 + k * 72, 440, 42, n, 'body', { c: C.ink, m: m('rise', 700 + k * 70) })));
  slides.push({
    id: 'agenda', section: 'Mở đầu', scene: 'paper', dark: false, transition: 'fade',
    deco: [{ k: 'contour', cx: 1900, cy: 1080, rx: 520, ry: 340, n: 8, c: C.tea400, a: 0.12, rot: 12 }],
    els,
    notes: 'Bài trình bày gồm bốn chương: hai doanh nghiệp và động cơ; quá trình thực hiện thương vụ; các yếu tố thúc đẩy và cản trở; cuối cùng là đánh giá kết quả và tổng kết.',
  });
}

// 3 ─ HOOK ────────────────────────────────────────────────
slides.push({
  id: 'hook', section: 'Mở đầu', scene: 'dusk', dark: true, transition: 'fade',
  deco: [{ k: 'contour', cx: 1490, cy: 530, rx: 470, ry: 470, n: 6, c: C.amberL, a: 0.07, rot: 0 }],
  els: [
    ...head('Toàn cảnh thương vụ', 'Không mua đứt một lần: Masan nâng sở hữu Phúc Long qua ba bước', true, { tw: 1000, th: 250 }),
    CH('ring', 1210, 250, 560, 560, { kind: 'ring', vals: [85, 15], colors: [C.amberL, C.lineD], hole: 80, m: m('draw', 400) }),
    T('ringv', 1210, 420, 560, 175, '85%', 'num', { size: 150, c: C.cream, align: 'center', m: m('count', 500) }),
    T('ringl', 1260, 590, 460, 40, 'sở hữu sau ba đợt mua', 'small', { c: C.mutedL, align: 'center', m: m('fade', 900) }),
    T('ringc', 1210, 840, 560, 40, '15% còn lại thuộc các cổ đông khác', 'small', { c: C.mutedL, align: 'center', m: m('fade', 1100) }),
    L('l1', 140, 630, 540, 630, { c: C.lineD, w: 2, m: m('draw', 500) }),
    T('n1', 140, 650, 400, 145, '15', 'num', { size: 120, c: C.cream, m: m('count', 600) }),
    T('t1', 140, 796, 400, 84, 'tháng, từ 05/2021 đến 08/2022', 'body', { c: C.mutedL, m: m('fade', 800) }),
    L('l2', 600, 630, 1080, 630, { c: C.lineD, w: 2, m: m('draw', 650) }),
    T('n2', 600, 650, 480, 145, '6.450+', 'num', { size: 120, c: C.amberL, m: m('count', 750) }),
    T('t2', 600, 796, 480, 84, 'tỷ đồng tổng giải ngân, khoảng 279,6 triệu USD', 'body', { c: C.mutedL, m: m('fade', 950) }),
  ],
  notes: 'Ba con số tóm tắt thương vụ. Masan không mua toàn bộ Phúc Long trong một lần: đầu tư thiểu số 20% năm 2021, nâng lên chi phối 51% tháng 1/2022, rồi mua thêm 34% tháng 8/2022 để đạt 85%. Tổng giải ngân khoảng 279,6 triệu USD, tức hơn 6.450 tỷ đồng, trong 15 tháng.',
});

// 4 ─ MASAN ───────────────────────────────────────────────
{
  const els = [...head('01 · Bên mua', 'Masan Group: từ sản xuất hàng tiêu dùng sang nền tảng tiêu dùng – bán lẻ', false)];
  els.push(R('wcm', 140, 370, 780, 580, { fill: C.forest800, r: 24, morph: 'wcm', name: '!!wcm', m: m('rise', 300) }));
  els.push(T('wk', 196, 418, 660, 30, 'Kênh then chốt · bán lẻ', 'eyebrow', { c: C.sage, m: m('fade', 500) }));
  els.push(T('wn', 196, 462, 660, 56, 'WinCommerce', 'h2', { c: C.cream, m: m('rise', 550) }));
  els.push(T('ws', 196, 522, 660, 34, 'WinMart · WinMart+', 'small', { c: C.mutedL, m: m('fade', 600) }));
  els.push(T('wv', 196, 588, 660, 165, '2.200+', 'num', { size: 140, c: C.amberL, m: m('count', 650) }));
  els.push(T('wl', 196, 752, 660, 40, 'cửa hàng VinMart+ khi công bố hợp tác (05/2021)', 'label', { c: C.cream, m: m('fade', 800) }));
  els.push(T('wd', 196, 806, 680, 90, 'Mặt bằng, lưu lượng khách và mạng lưới để thử nghiệm kiosk Phúc Long.', 'body', { c: C.mutedL, m: m('fade', 900) }));
  const rows = [
    ['Masan Consumer', 'Sản xuất, xây dựng thương hiệu, phân phối thực phẩm, gia vị, đồ uống', 'Kinh nghiệm xây dựng thương hiệu tiêu dùng'],
    ['Masan MEATLife', 'Thịt có thương hiệu và chuỗi cung ứng liên quan', 'Năng lực ngành thiết yếu; không trực tiếp tham gia giao dịch'],
    ['The CrownX / Point of Life', 'Nền tảng kết nối bán lẻ và hàng tiêu dùng', 'Bối cảnh chiến lược để tích hợp Phúc Long'],
  ];
  rows.forEach(([n, d, l], i) => {
    const y = 370 + i * 196;
    els.push(L(`pl${i}`, 1000, y, 1780, y, { c: C.line, w: 2, m: m('draw', 450 + i * 120) }));
    els.push(T(`pn${i}`, 1000, y + 24, 780, 40, n, 'h3', { c: C.ink, m: m('rise', 500 + i * 120) }));
    els.push(T(`pd${i}`, 1000, y + 72, 780, 68, d, 'small', { c: C.muted, m: m('rise', 540 + i * 120) }));
    els.push(T(`pk${i}`, 1000, y + 142, 780, 34, '→ ' + l, 'small', { c: C.tea600, w8: 500, m: m('rise', 580 + i * 120) }));
  });
  slides.push({
    id: 'masan', section: '01 · Hai doanh nghiệp', scene: 'paper', dark: false, transition: 'fade', els,
    deco: [{ k: 'contour', cx: 1880, cy: 120, rx: 360, ry: 220, n: 6, c: C.tea400, a: 0.10, rot: -10 }],
    notes: 'Masan Group (MSN) là tập đoàn đa ngành tập trung vào nhu cầu tiêu dùng thiết yếu. Trong bốn nền tảng liên quan, WinCommerce là kênh then chốt: khi công bố hợp tác tháng 5/2021, VinCommerce có hơn 2.200 cửa hàng VinMart+, là mặt bằng để thử nghiệm kiosk Phúc Long. Masan Consumer cho kinh nghiệm xây dựng thương hiệu; MEATLife không trực tiếp tham gia giao dịch; The CrownX / Point of Life là bối cảnh chiến lược.',
  });
}

// 5 ─ POINT OF LIFE ───────────────────────────────────────
{
  const els = [...head('01 · Point of Life', 'Point of Life: gom nhu cầu thiết yếu về một điểm chạm', true)];
  els.push(T('p', 140, 384, 560, 260, 'Thay vì chỉ sản xuất rồi phân phối qua trung gian, Masan muốn hiện diện trong hành trình tiêu dùng hằng ngày. Năm 2022, Masan mô tả WinMart+ như một mini-mall tích hợp nhiều nhu cầu thiết yếu.', 'body', { c: C.mutedL, m: m('fade', 300) }));
  els.push(T('q', 140, 670, 80, 130, '“', 'num', { size: 110, c: C.amberL, m: m('fade', 600) }));
  els.push(T('qt', 220, 690, 480, 200, 'Đồ uống pha chế thêm một lý do để khách ghé, ở lại lâu hơn và mua thêm tại cùng điểm bán.', 'body', { c: C.cream, w8: 500, m: m('rise', 650) }));
  const cx = 1270, cy = 650;
  const sats = [
    ['pl', 1105, 310, 'Phúc Long', 'Đồ uống pha chế · mới', true],
    ['mc', 765, 450, 'Masan Consumer', 'Hàng tiêu dùng nhanh'],
    ['wm', 1445, 450, 'WinMart', 'Thực phẩm thiết yếu'],
    ['me', 825, 830, 'Masan MEATLife', 'Thịt có thương hiệu'],
    ['tc', 1385, 830, 'Techcombank', 'Dịch vụ tài chính'],
  ];
  sats.forEach(([k, x, y, , , hot], i) => els.push(L(`ln_${k}`, cx, cy, x + 165, y + 50, { c: hot ? C.amberL : C.lineD, w: hot ? 3 : 2, dash: hot, m: m('draw', 700 + i * 90) })));
  els.push(E('core', 1120, 500, 300, 300, { fill: C.forest700, line: { c: C.sage, w: 2 }, morph: 'wcm', name: '!!wcm', m: m('scale', 250) }));
  els.push(T('corek', 1120, 590, 300, 36, 'Điểm bán', 'small', { c: C.mutedL, align: 'center', m: m('fade', 500) }));
  els.push(T('corev', 1120, 628, 300, 56, 'WinMart+', 'h3', { size: 40, c: C.cream, align: 'center', m: m('fade', 550) }));
  sats.forEach(([k, x, y, a, b, hot], i) => {
    els.push(R(`s_${k}`, x, y, 330, 100, { fill: hot ? C.amberL : '#FFFFFF', alpha: hot ? 1 : 0.07, r: 18, line: hot ? null : { c: C.lineD, w: 2 }, m: m('scale', 800 + i * 90) }));
    els.push(T(`sa_${k}`, x + 24, y + 16, 290, 34, a, 'label', { c: hot ? C.ink : C.cream, m: m('fade', 860 + i * 90) }));
    els.push(T(`sb_${k}`, x + 24, y + 54, 290, 32, b, 'small', { c: hot ? C.ink : C.mutedL, m: m('fade', 900 + i * 90) }));
  });
  slides.push({
    id: 'pol', section: '01 · Hai doanh nghiệp', scene: 'dusk', dark: true, transition: 'morph', els,
    deco: [{ k: 'contour', cx: 1270, cy: 650, rx: 600, ry: 420, n: 7, c: C.sage, a: 0.06, rot: 0 }],
    notes: 'Point of Life là định hướng hệ sinh thái tiêu dùng của Masan: kết nối nhiều sản phẩm và dịch vụ thiết yếu tại những điểm chạm thuận tiện. WinCommerce giúp tiếp cận người mua, nhưng để tăng gắn kết, Masan cần sản phẩm có tần suất và trải nghiệm khác với mua hàng thiết yếu. Phúc Long là mảnh ghép đồ uống pha chế đó. (Khối WinCommerce ở slide trước “biến hình” thành điểm bán trung tâm.)',
  });
}

// 6 ─ PHÚC LONG ───────────────────────────────────────────
{
  const els = [...head('01 · Doanh nghiệp mục tiêu', 'Phúc Long Heritage: di sản trà Việt từ năm 1968', false)];
  els.push(I('photo', 140, 330, 700, 527, 'assets/images/phuclong-store-r.png', 'Mặt tiền một cửa hàng Phúc Long Coffee & Tea về đêm, hai tầng, nhiều cây xanh', { r: 16, m: m('mask', 250) }));
  els.push(T('adv', 140, 884, 700, 70, 'Lợi thế trước thương vụ: di sản thương hiệu, sản phẩm riêng, tệp khách trẻ đô thị, kinh nghiệm vận hành cửa hàng.', 'small', { c: C.muted, m: m('fade', 700) }));
  els.push(L('axis', 960, 350, 960, 900, { c: C.line, w: 2, m: m('draw', 400) }));
  const tl = [
    ['1968', 'Khởi nguồn tại Bảo Lộc, Lâm Đồng, từ hoạt động phát triển trà và cà phê.'],
    ['Đầu 1980', 'Mô hình trà, cà phê tự phục vụ tại TP.HCM.'],
    ['2012', 'Cửa hàng tại TTTM Quận 7, chính thức vào bán lẻ F&B hiện đại.'],
    ['05/2021', '82 cửa hàng trên toàn quốc khi Masan công bố giao dịch.'],
  ];
  tl.forEach(([yv, t], i) => {
    const y = 362 + i * 176;
    els.push(E(`d${i}`, 951, y - 9, 18, 18, { fill: C.amberD, m: m('scale', 500 + i * 140) }));
    els.push(T(`y${i}`, 1000, y - 26, 210, 54, yv, 'num', { size: 40, c: C.amberD, m: m('rise', 540 + i * 140) }));
    els.push(T(`x${i}`, 1220, y - 20, 560, 120, t, 'body', { c: C.muted, m: m('rise', 580 + i * 140) }));
  });
  slides.push({
    id: 'phuclong', section: '01 · Hai doanh nghiệp', scene: 'paper', dark: false, transition: 'fade', els,
    deco: [{ k: 'leaf', x: 1700, y: 1010, s: 1.3, rot: -30, c: C.tea400, a: 0.18 }, { k: 'leaf', x: 1820, y: 930, s: 0.8, rot: 20, c: C.tea400, a: 0.14 }],
    notes: 'Phúc Long là thương hiệu trà và cà phê Việt khởi nguồn năm 1968 tại Bảo Lộc. Pháp nhân trong giao dịch là Công ty Cổ phần Phúc Long Heritage. Năm lợi thế trước thương vụ: di sản thương hiệu, năng lực sản phẩm, tệp khách trẻ đô thị, kinh nghiệm vận hành cửa hàng và tiềm năng mở rộng sang điểm bán nhỏ, kênh trực tuyến. Ảnh: mặt tiền một cửa hàng Phúc Long (từ tài liệu của nhóm).',
  });
}

// 7 ─ CONTEXT (split) ─────────────────────────────────────
{
  const els = [...head('01 · Bối cảnh', 'Hai nhu cầu gặp nhau đúng thời điểm', true)];
  els.push(T('lk', 140, 360, 700, 30, 'Masan cần', 'eyebrow', { c: C.sage, m: m('fade', 300) }));
  els.push(T('lh', 140, 404, 700, 112, 'Một lý do để khách ghé cửa hàng thường xuyên hơn', 'h2', { c: C.cream, m: m('rise', 350) }));
  els.push(T('lb', 140, 548, 700, 210, 'Đồ uống pha chế có tần suất và trải nghiệm khác hàng thiết yếu: kéo khách ghé, giữ khách lâu hơn và tạo thêm doanh thu trên cùng điểm bán WinMart+.', 'body', { c: C.mutedL, m: m('fade', 450) }));
  els.push(T('rk', 1080, 360, 700, 30, 'Phúc Long cần', 'eyebrow', { c: C.amberL, m: m('fade', 600) }));
  els.push(T('rh', 1080, 404, 700, 112, 'Nguồn lực để mở rộng chuỗi nhanh hơn', 'h2', { c: C.cream, m: m('rise', 650) }));
  els.push(T('rb', 1080, 548, 700, 130, 'Đã có thương hiệu, sản phẩm và tệp khách trẻ đô thị, nhưng mở rộng nhanh một chuỗi F&B đòi hỏi:', 'body', { c: C.mutedL, m: m('fade', 750) }));
  const rowsC = [['Vốn đầu tư', 'Mặt bằng', 'Quản trị chuỗi'], ['Nhân sự', 'Công nghệ', 'Nguồn khách']];
  rowsC.forEach((row, ri) => {
    let x = 1080;
    row.forEach((t, ci) => {
      const w = chipW(t);
      els.push(B(`c${ri}${ci}`, x, 706 + ri * 72, w, 56, t, 'small', { fill: C.amberL, alpha: 0.16, line: { c: C.amberL, w: 2 }, r: 28, c: C.cream, align: 'center', m: m('scale', 850 + (ri * 3 + ci) * 70) }));
      x += w + 16;
    });
  });
  els.push(L('rule', 140, 930, 1780, 930, { c: C.lineD, w: 2, m: m('draw', 900) }));
  els.push(T('time', 140, 950, 1640, 40, 'Thời điểm: giao dịch công bố tháng 5/2021, khi nền kinh tế và ngành dịch vụ chịu ảnh hưởng của COVID-19.', 'small', { c: C.mutedL, m: m('fade', 1000) }));
  slides.push({
    id: 'context', section: '01 · Hai doanh nghiệp', scene: 'split', dark: true, transition: 'fade', els, deco: [],
    notes: 'Masan đang chuyển từ mô hình sản xuất – phân phối sang tích hợp tiêu dùng – bán lẻ; WinCommerce giúp tiếp cận người mua nhưng cần thêm sản phẩm có tần suất sử dụng khác. Phúc Long đã có thương hiệu và sản phẩm nhưng cần vốn, mặt bằng, quản trị chuỗi, nhân sự, công nghệ và nguồn khách để mở rộng nhanh. Hai nửa màu nền thể hiện hai phía của thương vụ.',
  });
}

// 8 ─ MOTIVES ─────────────────────────────────────────────
{
  const els = [...head('01 · Động cơ', 'Động cơ hai chiều: Masan cần mảnh ghép F&B, Phúc Long cần bệ phóng', false)];
  els.push(T('lk', 140, 352, 740, 30, 'Masan · bên mua', 'eyebrow', { c: C.tea600, m: m('fade', 250) }));
  els.push(T('rk', 1040, 352, 740, 30, 'Phúc Long · bên được đầu tư', 'eyebrow', { c: C.amberD, m: m('fade', 250) }));
  els.push(L('axis', 960, 352, 960, 940, { c: C.line, w: 2, m: m('draw', 300) }));
  const L1 = [
    ['Gia nhập nhanh ngành trà – cà phê', 'Mua thương hiệu sẵn có thay vì tự xây từ đầu'],
    ['Bổ sung mảnh ghép cho Point of Life', 'Thêm nhu cầu được phục vụ tại một điểm bán'],
    ['Khai thác mạng lưới WinMart+', 'Thử nghiệm kiosk trên mặt bằng, lưu lượng sẵn có'],
    ['Tạo cộng hưởng doanh thu', 'Khách mua đồ uống mua thêm hàng hóa, và ngược lại'],
    ['Đa dạng hóa nguồn tăng trưởng', 'Thêm F&B bên cạnh hàng tiêu dùng và bán lẻ'],
  ];
  const R1 = [
    ['Vốn của cổ đông chiến lược', 'Nguồn lực tài chính để mở rộng quy mô'],
    ['Thêm kênh điểm bán', 'Mô hình kiosk trong hệ thống WinMart+'],
    ['Tăng độ phủ thương hiệu', 'Tiếp cận khách hàng tại nhiều địa bàn hơn'],
    ['Nâng cấp năng lực', 'Quản trị, chuỗi cung ứng, công nghệ và vận hành'],
    ['Tăng tốc phát triển', 'Không chỉ dựa vào việc tự mở cửa hàng độc lập'],
  ];
  [[L1, 140, C.tea600], [R1, 1040, C.amberD]].forEach(([arr, x0, col], side) => arr.forEach(([a, b], k) => {
    const y = 400 + k * 108, d = 350 + k * 90 + side * 200;
    els.push(L(`l${side}${k}`, x0, y, x0 + 740, y, { c: C.line, w: 2, m: m('draw', d) }));
    els.push(T(`n${side}${k}`, x0, y + 16, 46, 40, String(k + 1), 'num', { size: 32, c: col, m: m('fade', d + 40) }));
    els.push(T(`a${side}${k}`, x0 + 50, y + 16, 690, 36, a, 'label', { c: C.ink, m: m('rise', d + 60) }));
    els.push(T(`b${side}${k}`, x0 + 50, y + 54, 690, 34, b, 'small', { c: C.muted, m: m('rise', d + 90) }));
  }));
  slides.push({
    id: 'motives', section: '01 · Hai doanh nghiệp', scene: 'paper', dark: false, transition: 'fade', els, deco: [],
    notes: 'Đây là thương vụ có động cơ chiến lược hai chiều. Masan tìm thương hiệu F&B để hoàn thiện hệ sinh thái tiêu dùng – bán lẻ; Phúc Long có cơ hội tiếp cận vốn, mạng lưới và năng lực mở rộng. Giá trị kỳ vọng không chỉ nằm ở lợi nhuận riêng của Phúc Long mà ở khả năng cộng hưởng với WinCommerce và các nền tảng tiêu dùng của Masan.',
  });
}

// 9 ─ STAKES ──────────────────────────────────────────────
{
  const els = [...head('02 · Quá trình thực hiện', 'Ba bước nâng sở hữu trong 15 tháng', true)];
  els.push(CH('chart', 140, 320, 1040, 610, { kind: 'bar', cats: ['24/05/2021', '01/2022', '08/2022'], vals: [20, 51, 85], labels: ['20%', '51%', '85%'], colors: [C.tea400, C.sage, C.amberL], max: 100, dark: true, morph: 'bars', valueSize: 64, alt: 'Biểu đồ cột tỷ lệ sở hữu của Masan tại Phúc Long: 20% (24/05/2021), 51% (01/2022), 85% (08/2022)', m: m('grow', 300) }));
  const ann = [
    ['Đợt 1 · 24/05/2021', 'Mua 20%', '15 triệu USD (345,6 tỷ đồng); ký hợp tác phát triển kiosk'],
    ['Đợt 2 · 01/2022', 'Thêm 31%, lên 51%', '110 triệu USD (~2.490 tỷ đồng); Phúc Long thành công ty con'],
    ['Đợt 3 · 08/2022', 'Thêm 34%, lên 85%', '3.617,7 tỷ đồng; 15% còn lại thuộc cổ đông khác'],
  ];
  ann.forEach(([k, h, s], i) => {
    const y = 350 + i * 196, d = 700 + i * 220;
    els.push(L(`al${i}`, 1260, y, 1780, y, { c: C.lineD, w: 2, m: m('draw', d) }));
    els.push(T(`ak${i}`, 1260, y + 22, 520, 30, k, 'eyebrow', { c: i === 2 ? C.amberL : C.sage, m: m('fade', d + 40) }));
    els.push(T(`ah${i}`, 1260, y + 62, 520, 44, h, 'h3', { c: C.cream, m: m('rise', d + 80) }));
    els.push(T(`as${i}`, 1260, y + 112, 520, 70, s, 'small', { c: C.mutedL, m: m('rise', d + 120) }));
  });
  slides.push({
    id: 'stakes', section: '02 · Quá trình thực hiện', scene: 'dusk', dark: true, transition: 'fade', els,
    deco: [{ k: 'contour', cx: 1700, cy: 1080, rx: 520, ry: 300, n: 7, c: C.sage, a: 0.07, rot: 6 }],
    notes: 'Masan mua cổ phần Phúc Long Heritage thông qua công ty thành viên The Sherpa Company Limited. Đợt 1, ngày 24/05/2021: mua 20% với 15 triệu USD, đồng thời VinCommerce ký hợp tác phát triển Phúc Long Kiosk. Đợt 2, tháng 1/2022: thêm 31% với 110 triệu USD, sở hữu lên 51%. Đợt 3, tháng 8/2022: thêm 10.837.500 cổ phiếu (34%) với 3.617,7 tỷ đồng, nâng sở hữu lên 85%.',
  });
}

// 10 ─ STAGES ─────────────────────────────────────────────
{
  const els = [...head('02 · Ý nghĩa từng bước', 'Thử nghiệm, kiểm soát, rồi củng cố', false)];
  els.push(T('ck', 140, 300, 600, 30, 'Cấu trúc giao dịch', 'eyebrow', { c: C.muted, m: m('fade', 200) }));
  els.push(B('c1', 140, 344, 240, 60, 'Masan Group', 'label', { fill: C.cream, alpha: 0, line: { c: C.ink, w: 2 }, r: 30, c: C.ink, align: 'center', m: m('fade', 250) }));
  els.push(L('a1', 392, 374, 452, 374, { c: C.amberD, w: 3, arrow: true, m: m('draw', 330) }));
  els.push(B('c2', 464, 344, 440, 60, 'The Sherpa Company Limited', 'label', { fill: C.cream, alpha: 0, line: { c: C.ink, w: 2 }, r: 30, c: C.ink, align: 'center', m: m('fade', 380) }));
  els.push(L('a2', 916, 374, 976, 374, { c: C.amberD, w: 3, arrow: true, m: m('draw', 460) }));
  els.push(B('c3', 988, 344, 380, 60, 'CTCP Phúc Long Heritage', 'label', { fill: C.forest800, r: 30, c: C.cream, align: 'center', m: m('fade', 510) }));
  els.push(T('note', 140, 426, 1640, 34, '12/2021: khoản đầu tư 20% chuyển sang Draco Investment Corporation do tái cấu trúc nội bộ; tỷ lệ lợi ích không đổi.', 'small', { c: C.muted, m: m('fade', 560) }));
  const st = [
    [140, 640, C.cream2, '05/2021 · 20%', 'Thử nghiệm', 'Cổ đông thiểu số: tạo nền tảng hợp tác, thử nghiệm kết hợp Phúc Long với WinCommerce. Chưa nắm quyền kiểm soát.', false],
    [697, 560, C.parch, '01/2022 · 51%', 'Kiểm soát', 'Chuyển sang đa số. Phúc Long thành công ty con, kết quả kinh doanh hợp nhất vào BCTC của Masan.', false],
    [1254, 480, C.forest800, '08/2022 · 85%', 'Củng cố', 'Tăng lợi ích kinh tế, giảm phần của cổ đông không kiểm soát; đổi lại là cam kết vốn lớn hơn.', true],
  ];
  st.forEach(([x, y, fill, k, h, b, dk], i) => {
    const d = 650 + i * 220;
    els.push(R(`p${i}`, x, y, 526, 960 - y, { fill, r: 18, m: m('grow', d) }));
    els.push(T(`pk${i}`, x + 40, y + 36, 450, 30, k, 'eyebrow', { c: dk ? C.amberL : C.amberD, m: m('fade', d + 300) }));
    els.push(T(`ph${i}`, x + 40, y + 76, 450, 56, h, 'h2', { c: dk ? C.cream : C.ink, m: m('rise', d + 340) }));
    els.push(T(`pb${i}`, x + 40, y + 144, 450, 150, b, 'small', { c: dk ? C.mutedL : C.muted, m: m('rise', d + 380) }));
  });
  slides.push({
    id: 'stages', section: '02 · Quá trình thực hiện', scene: 'paper', dark: false, transition: 'fade', els, deco: [],
    notes: 'Ba bậc thang thể hiện mức cam kết tăng dần. Bước 1 là đầu tư thiểu số để thử nghiệm hợp tác. Bước 2, mốc 51%, đánh dấu quyền kiểm soát: Phúc Long được hợp nhất vào báo cáo tài chính của Masan. Bước 3 nâng lên 85% để tăng lợi ích kinh tế, đồng nghĩa cam kết vốn lớn hơn. Lưu ý: ngày mua 20% được thuyết minh trong BCTC hợp nhất 2021 là 29/05/2021; tháng 12/2021 khoản đầu tư này chuyển sang Draco Investment Corporation theo tái cấu trúc nội bộ.',
  });
}

// 11 ─ VALUATION ──────────────────────────────────────────
slides.push({
  id: 'valuation', section: '02 · Quá trình thực hiện', scene: 'paper2', dark: false, transition: 'fade',
  deco: [],
  els: [
    ...head('02 · Giá trị giao dịch', 'Mỗi bước mua, Phúc Long được định giá cao hơn', false),
    T('ck', 140, 300, 900, 30, 'Định giá ngầm định · triệu USD', 'eyebrow', { c: C.muted, m: m('fade', 200) }),
    CH('chart', 140, 340, 980, 590, { kind: 'bar', cats: ['Đợt 1 · 05/2021', 'Đợt 2 · 01/2022', 'Đợt 3 · 08/2022'], vals: [75, 355, 455], labels: ['75', '355', '455'], colors: [C.tea400, C.tea600, C.amberD], max: 500, dark: false, morph: 'bars', valueSize: 64, alt: 'Biểu đồ cột định giá ngầm định của Phúc Long: 75, 355 và 455 triệu USD qua ba đợt mua', m: m('grow', 300) }),
    L('s1', 1220, 360, 1780, 360, { c: C.ink, w: 2, m: m('draw', 700) }),
    T('n1', 1220, 384, 560, 140, '×6', 'num', { size: 120, c: C.ink, m: m('rise', 750) }),
    T('t1', 1220, 532, 560, 70, 'định giá tăng khoảng 6 lần từ đợt 1 đến đợt 3', 'small', { c: C.muted, m: m('fade', 850) }),
    L('s2', 1220, 640, 1780, 640, { c: C.ink, w: 2, m: m('draw', 900) }),
    T('n2', 1220, 664, 560, 140, '279,6', 'num', { size: 120, c: C.amberD, m: m('count', 950) }),
    T('t2', 1220, 812, 560, 70, 'triệu USD tổng giải ngân qua 3 đợt (hơn 6.450 tỷ đồng)', 'small', { c: C.muted, m: m('fade', 1050) }),
    T('src', 140, 966, 1640, 60, 'Định giá ngầm định = giá trị giao dịch ÷ tỷ lệ cổ phần mua: 15 ÷ 20% = 75; 110 ÷ 31% ≈ 355; 3.617,7 tỷ đồng ÷ 34% ≈ 455 triệu USD.', 'caption', { c: C.muted, m: m('fade', 1100) }),
  ],
  notes: 'Chia giá trị mỗi đợt cho tỷ lệ cổ phần mua, ta có định giá ngầm định: 75 triệu USD ở đợt 1, khoảng 355 triệu USD ở đợt 2 và gần 455 triệu USD ở đợt 3 — gấp khoảng 6 lần. Masan giải ngân tổng cộng khoảng 279,6 triệu USD. Mức định giá cao là cái giá để sở hữu ngay vị thế dẫn đầu và tạo áp lực lên tỷ suất hoàn vốn (phần 4). (Ba cột của slide trước biến thành ba cột định giá.)',
});

// 12 ─ SYNERGY ────────────────────────────────────────────
{
  const els = [...head('03 · Yếu tố thúc đẩy và cản trở', 'Bảy nguồn giá trị kỳ vọng, nguồn nào cũng có mặt trái', false)];
  els.push(T('hk1', 140, 352, 600, 30, 'Thúc đẩy', 'eyebrow', { c: C.tea600, align: 'right', m: m('fade', 250) }));
  els.push(T('hk2', 790, 352, 340, 30, 'Nguồn giá trị', 'eyebrow', { c: C.muted, align: 'center', m: m('fade', 250) }));
  els.push(T('hk3', 1180, 352, 600, 30, 'Cản trở', 'eyebrow', { c: C.amberD, m: m('fade', 250) }));
  const rows = [
    ['Doanh thu tăng thêm', 'Bán chéo; độ phủ 3.000+ điểm; hàng đóng gói', 'Xung đột trải nghiệm; ăn mòn doanh thu'],
    ['Chi phí hoạt động', 'Chia sẻ mặt bằng; sức mua nguyên liệu lớn', 'Vận hành F&B phức tạp, chi phí quản lý'],
    ['Lợi ích thuế', 'Lãi vay M&A được khấu trừ thuế TNDN', 'Không trọng yếu: cả hai đều có lãi', 'dim'],
    ['Hiệu quả tài sản', 'Tăng doanh thu/m²; dùng thương hiệu sẵn có', 'Kiosk không hòa vốn phải đóng cửa'],
    ['Áp lực cạnh tranh', 'Chiếm phân khúc tầm trung – cận cao cấp', 'Rào cản gia nhập ngành F&B thấp'],
    ['Chuỗi giá trị', 'Hệ sinh thái; khép kín từ đồi chè đến ly', 'Phân tán nguồn lực quản trị'],
    ['Chi phí gia nhập', 'Mua thời gian, thị phần, biên gộp cao', 'Định giá cao, áp lực lợi thế thương mại'],
  ];
  rows.forEach(([n, g, s, dim], i) => {
    const y = 400 + i * 78, d = 350 + i * 100;
    els.push(T(`g${i}`, 140, y + 12, 620, 38, g, 'body', { size: 26, c: dim ? C.muted : C.tea600, align: 'right', m: m('rise', d + 80) }));
    els.push(B(`n${i}`, 790, y, 340, 60, `${i + 1} · ${n}`, 'label', { size: 24, fill: dim ? C.parch : C.forest800, r: 30, c: dim ? C.ink : C.cream, align: 'center', m: m('scale', d) }));
    els.push(T(`s${i}`, 1160, y + 12, 620, 38, s, 'body', { size: 26, c: dim ? C.muted : C.amberD, m: m('rise', d + 120) }));
  });
  slides.push({
    id: 'synergy', section: '03 · Thúc đẩy và cản trở', scene: 'paper', dark: false, transition: 'fade', els, deco: [],
    notes: 'Bảy nguồn giá trị theo khung lý thuyết M&A, đọc từ giữa ra hai phía: bên trái là yếu tố thúc đẩy, bên phải là yếu tố cản trở. Lợi ích thuế được làm mờ vì không phải động lực trọng yếu: cả hai doanh nghiệp đều có lãi, lợi ích chuyển lỗ không đáng kể. Biên lợi nhuận gộp ngành F&B thường 60–70%, cao hơn nhiều so với siêu thị bán lẻ — lý do Masan chấp nhận định giá khoảng 350–450 triệu USD.',
  });
}

// 13 ─ KIOSK ──────────────────────────────────────────────
{
  const els = [...head('03 · Doanh thu, chi phí, tài sản', 'Kiosk trong WinMart+: cộng hưởng lớn nhất, cũng là rủi ro lớn nhất', true)];
  els.push(L('axis', 960, 372, 960, 950, { c: C.lineD, w: 2, m: m('draw', 250) }));
  els.push(E('core', 880, 585, 160, 160, { fill: C.forest700, line: { c: C.amberL, w: 3 }, m: m('scale', 350) }));
  els.push(T('corev', 880, 646, 160, 40, 'Kiosk', 'h3', { size: 30, c: C.cream, align: 'center', m: m('fade', 450) }));
  els.push(T('lk', 140, 370, 660, 30, 'Kỳ vọng · thúc đẩy', 'eyebrow', { c: C.sage, m: m('fade', 400) }));
  els.push(T('rk', 1120, 370, 660, 30, 'Thực tế · cản trở', 'eyebrow', { c: C.amberL, step: 1, m: m('fade', 0) }));
  const Lx = [
    ['Bán chéo hai chiều', 'Khách trẻ ghé mua đồ uống rồi mua thêm nhu yếu phẩm, và ngược lại.'],
    ['Mở rộng thần tốc', 'Tận dụng hơn 3.000 điểm bán WinCommerce, không cần mặt bằng mới.'],
    ['Chia sẻ chi phí cố định', 'Dùng chung mặt bằng, điện nước, an ninh, nhân sự quản lý.'],
  ];
  const Rx = [
    ['Xung đột trải nghiệm', 'Khách Phúc Long thích ngồi lại; WinMart+ là mua nhanh, tiện lợi.'],
    ['Ăn mòn doanh thu', 'Kiosk dày đặc kéo doanh thu khỏi cửa hàng flagship lân cận.'],
    ['Vận hành hoàn toàn khác', 'Kiểm soát pha chế, hao hụt nguyên liệu tươi, đào tạo barista.'],
  ];
  [[Lx, 140, 0], [Rx, 1120, 1]].forEach(([arr, x, step]) => arr.forEach(([a, b], k) => {
    const y = 420 + k * 176, d = step ? 120 + k * 140 : 500 + k * 140;
    els.push(L(`l${step}${k}`, x, y, x + 660, y, { c: C.lineD, w: 2, step, m: m('draw', d) }));
    els.push(T(`a${step}${k}`, x, y + 20, 660, 42, a, 'h3', { size: 30, c: C.cream, step, m: m('rise', d + 60) }));
    els.push(T(`b${step}${k}`, x, y + 68, 660, 76, b, 'small', { c: C.mutedL, step, m: m('rise', d + 100) }));
  }));
  slides.push({
    id: 'kiosk', section: '03 · Thúc đẩy và cản trở', scene: 'dusk', dark: true, transition: 'fade', els,
    deco: [{ k: 'contour', cx: 960, cy: 665, rx: 380, ry: 380, n: 6, c: C.amberL, a: 0.06, rot: 0 }],
    notes: 'Bấm một lần để hiện cột bên phải. Kiosk là nơi hội tụ nhiều nguồn cộng hưởng nhất: bán chéo, mở rộng nhanh trên quỹ hơn 3.000 điểm bán, chia sẻ chi phí cố định, tăng doanh thu trên mỗi mét vuông. Nhưng cũng mang nhiều rủi ro nhất: tệp khách và trải nghiệm không khớp, nguy cơ ăn mòn doanh thu cửa hàng flagship, và vận hành F&B khác hẳn bán lẻ hàng đóng gói. Phần 4 cho thấy rủi ro nào đã thành hiện thực.',
  });
}

// 14 ─ VALUE CHAIN ────────────────────────────────────────
{
  const els = [...head('03 · Đa dạng hóa và chuỗi giá trị', 'Khép kín chuỗi giá trị: từ đồi chè đến ly nước', false)];
  els.push(L('path', 360, 470, 1560, 470, { c: C.tea600, w: 3, m: m('draw', 250, { dur: 1200 }) }));
  const st = [
    [360, '01', 'Vùng nguyên liệu', 'Đồi chè của Phúc Long tại Thái Nguyên và Bảo Lộc'],
    [960, '02', 'Chế biến', 'Trà, cà phê và danh mục đồ uống mang dấu ấn riêng'],
    [1560, '03', 'Phân phối', 'Kênh quán (cửa hàng, kiosk) và hàng đóng gói qua Masan Consumer'],
  ];
  st.forEach(([cx, n, h, s], i) => {
    const d = 400 + i * 380;
    els.push(E(`c${i}`, cx - 56, 414, 112, 112, { fill: C.forest800, line: { c: C.cream, w: 6 }, m: m('scale', d) }));
    els.push(T(`cn${i}`, cx - 56, 444, 112, 52, n, 'num', { size: 40, c: C.cream, align: 'center', m: m('fade', d + 120) }));
    els.push(T(`ch${i}`, cx - 220, 560, 440, 56, h, 'h2', { c: C.ink, align: 'center', m: m('rise', d + 160) }));
    els.push(T(`cs${i}`, cx - 220, 626, 440, 110, s, 'small', { c: C.muted, align: 'center', m: m('rise', d + 200) }));
  });
  els.push(L('b1', 140, 780, 900, 780, { c: C.line, w: 2, m: m('draw', 1400) }));
  els.push(T('bk1', 140, 802, 760, 30, 'Thúc đẩy · hoàn thiện hệ sinh thái', 'eyebrow', { c: C.tea600, m: m('fade', 1450) }));
  els.push(T('bb1', 140, 846, 760, 124, 'Phúc Long bổ sung mảng F&B tiêu dùng tại chỗ, bên cạnh WinMart, Masan Consumer và Techcombank.', 'body', { c: C.ink, m: m('rise', 1500) }));
  els.push(L('b2', 1020, 780, 1780, 780, { c: C.line, w: 2, m: m('draw', 1550) }));
  els.push(T('bk2', 1020, 802, 760, 30, 'Cản trở · phân tán nguồn lực', 'eyebrow', { c: C.amberD, m: m('fade', 1600) }));
  els.push(T('bb2', 1020, 846, 760, 124, 'Quản trị cùng lúc sản xuất, bán lẻ, F&B, viễn thông và tài chính dễ làm ban lãnh đạo mất tập trung.', 'body', { c: C.ink, m: m('rise', 1650) }));
  slides.push({
    id: 'valuechain', section: '03 · Thúc đẩy và cản trở', scene: 'paper', dark: false, transition: 'fade', els,
    deco: [{ k: 'contour', cx: 1820, cy: 60, rx: 560, ry: 300, n: 9, c: C.tea400, a: 0.12, rot: -6 }, { k: 'leaf', x: 140, y: 1010, s: 0.9, rot: 40, c: C.tea400, a: 0.14 }],
    notes: 'Masan chuyển từ công ty sản xuất hàng tiêu dùng thuần túy sang nền tảng tiêu dùng – bán lẻ tích hợp. Với Phúc Long, Masan kiểm soát từ vùng nguyên liệu chè, cà phê, qua chế biến, đến phân phối ở cả kênh quán và kênh bán lẻ. Mặt trái là rủi ro phân tán nguồn lực khi quản trị quá nhiều mô hình kinh doanh khác nhau.',
  });
}

// 15 ─ VERDICT ────────────────────────────────────────────
slides.push({
  id: 'verdict', section: '04 · Đánh giá và tổng kết', scene: 'amber', dark: false, layout: 'hero', transition: 'fade',
  deco: [{ k: 'rings', cx: 1720, cy: 540, r: 520, c: C.cream, a: 0.22 }],
  els: [
    T('eyebrow', 140, 250, 1200, 30, '04 · Đánh giá kết quả', 'eyebrow', { c: C.ink, m: m('fade', 0) }),
    T('title', 140, 300, 1560, 400, 'Thất bại ở tích hợp cơ học, thành công ở quản trị và thương hiệu.', 'statement', { c: C.ink, role: 'title', m: m('words', 150) }),
    T('cap', 140, 770, 1200, 44, 'Nhận định của nhóm sau giai đoạn 2021 – 2026', 'body', { c: C.ink, m: m('fade', 1300) }),
  ],
  notes: 'Kết quả thương vụ phản ánh một quá trình M&A thực tế: thất bại ở ý tưởng tích hợp cơ học, tức kiosk trong siêu thị mini, nhưng thành công trong việc nâng tầm năng lực quản trị và khai thác giá trị thương hiệu cốt lõi. Các slide tiếp theo trình bày cả hai mặt.',
});

// 16 ─ RESULTS ────────────────────────────────────────────
{
  const els = [...head('04 · Thành quả', 'Sau điều chỉnh, Phúc Long bứt phá lợi nhuận', false)];
  els.push(T('ck', 140, 300, 900, 30, 'Lợi nhuận sau thuế · tỷ đồng', 'eyebrow', { c: C.muted, m: m('fade', 200) }));
  els.push(CH('chart', 140, 340, 900, 600, { kind: 'bar', cats: ['Năm 2025', '9T/2026 · +46% cùng kỳ'], vals: [195, 207], labels: ['195', '207'], colors: [C.tea400, C.amberD], max: 240, dark: false, valueSize: 64, alt: 'Biểu đồ cột lợi nhuận sau thuế của Phúc Long: 195 tỷ đồng năm 2025, 207 tỷ đồng 9 tháng đầu năm 2026', m: m('grow', 300) }));
  const k = [
    ['~67,3%', 'biên lợi nhuận gộp, duy trì ở mức cao'],
    ['22,8 tr', 'đồng doanh thu bình quân mỗi điểm bán/ngày'],
    ['+35,1%', 'kênh giao hàng trực tuyến, hơn 31% doanh thu bán lẻ'],
    ['+39,5%', 'nhóm thực phẩm bán kèm'],
  ];
  k.forEach(([n, s], i) => {
    const x = 1140 + (i % 2) * 340, y = 350 + Math.floor(i / 2) * 290, d = 700 + i * 130;
    els.push(R(`kl${i}`, x, y, 300, 4, { fill: i === 0 ? C.amberD : C.tea600, m: m('growX', d) }));
    els.push(T(`kn${i}`, x, y + 24, 300, 84, n, 'num', { size: 72, c: C.ink, m: m('count', d + 60) }));
    els.push(T(`ks${i}`, x, y + 116, 300, 110, s, 'small', { c: C.muted, m: m('fade', d + 150) }));
  });
  els.push(T('src', 140, 990, 1640, 34, 'Số liệu theo tài liệu phân tích của nhóm (mục 4.1).', 'caption', { c: C.muted, m: m('fade', 1300) }));
  slides.push({
    id: 'results', section: '04 · Đánh giá và tổng kết', scene: 'paper', dark: false, transition: 'fade', els, deco: [],
    notes: 'Những lợi thế nội tại của hai bên phát huy rõ sau giai đoạn điều chỉnh. Nguồn lực của Masan giúp Phúc Long chuyển từ doanh nghiệp gia đình sang quản trị chuyên nghiệp. Nhờ tối ưu chuỗi cung ứng và danh mục sản phẩm, biên lợi nhuận gộp duy trì khoảng 67,3%; lợi nhuận sau thuế năm 2025 đạt kỷ lục 195 tỷ đồng và lên 207 tỷ đồng chỉ trong 9 tháng đầu 2026, tăng 46% so với cùng kỳ, vượt cả năm 2025. Khi tập trung vào cửa hàng tiêu chuẩn, doanh thu bình quân mỗi điểm bán đạt 22,8 triệu đồng/ngày; kênh giao hàng trực tuyến tăng 35,1% (hơn 31% doanh thu bán lẻ), nhóm thực phẩm bán kèm tăng 39,5%. Hệ thống Masan Consumer đưa sản phẩm trà, cà phê đóng gói Phúc Long phủ sóng toàn quốc.',
  });
}

// 17 ─ RESET ──────────────────────────────────────────────
{
  const els = [...head('04 · Giới hạn: mô hình kiosk', 'Từ nhân rộng hàng trăm kiosk đến tái cơ cấu có chọn lọc', true)];
  const nodes = [
    ['Kỳ vọng', '05/2021', 'Ký hợp tác phát triển Phúc Long Kiosk trong mạng lưới hơn 2.200 cửa hàng VinMart+.', C.sage],
    ['Thua lỗ', 'Q4/2022', 'Mảng kiosk ghi nhận khoản lỗ tới 100 tỷ đồng chỉ trong một quý.', C.amberL],
    ['Tái cơ cấu', 'Sau đó', 'Đóng cửa hàng loạt điểm bán kiosk không hiệu quả.', C.amberL],
    ['Tập trung', 'Cuối 2025', 'Thu gọn hệ thống về 202 cửa hàng độc lập.', C.cream],
    ['Tăng trưởng', '9T/2026', 'Mở mới có chọn lọc 44 cửa hàng.', C.sage],
  ];
  nodes.forEach(([ph, dt, tx, col], i) => {
    const x = 140 + i * 328, x2 = i < 4 ? 140 + (i + 1) * 328 : 1780, d = 300 + i * 200;
    els.push(L(`seg${i}`, x, 520, x2, 520, { c: col, w: 4, m: m('draw', d) }));
    els.push(E(`dot${i}`, x - 11, 509, 22, 22, { fill: col, m: m('scale', d) }));
    els.push(T(`ph${i}`, x, 380, 300, 30, ph, 'eyebrow', { c: col === C.cream ? C.mutedL : col, m: m('fade', d + 40) }));
    els.push(T(`dt${i}`, x, 420, 300, 56, dt, 'num', { size: 40, c: C.cream, m: m('rise', d + 60) }));
    els.push(T(`tx${i}`, x, 556, 300, 170, tx, 'small', { c: C.mutedL, m: m('rise', d + 100) }));
  });
  els.push(R('why', 140, 790, 1640, 160, { fill: '#FFFFFF', alpha: 0.06, line: { c: C.lineD, w: 2 }, r: 20, m: m('rise', 1400) }));
  els.push(T('whyk', 190, 828, 320, 80, 'Vì sao kiosk không hiệu quả', 'eyebrow', { c: C.amberL, m: m('fade', 1500) }));
  els.push(T('whyt', 540, 822, 1190, 100, 'Quy trình ủ trà cầu kỳ không hợp tốc độ phục vụ của bán lẻ tiện lợi, khiến chất lượng thiếu đồng bộ và thương hiệu trung – cao cấp có nguy cơ bị loãng.', 'body', { c: C.cream, m: m('fade', 1550) }));
  slides.push({
    id: 'reset', section: '04 · Đánh giá và tổng kết', scene: 'dusk', dark: true, transition: 'fade', els, deco: [],
    notes: 'Các rào cản làm chậm thành quả trong ba năm đầu, 2021–2023. Tham vọng nhân rộng thần tốc hàng trăm kiosk bên trong WinMart+ vấp phải rào cản vận hành: quy trình ủ trà cầu kỳ không phù hợp tốc độ phục vụ nhanh của bán lẻ tiện lợi, làm giảm chất lượng đồng bộ và gây rủi ro loãng thương hiệu trung – cao cấp. Mảng kiosk từng lỗ tới 100 tỷ đồng riêng quý 4/2022, buộc Masan đóng cửa hàng loạt điểm bán, thu gọn về 202 cửa hàng độc lập cuối 2025 trước khi mở mới có chọn lọc 44 cửa hàng trong 9 tháng đầu 2026.',
  });
}

// 18 ─ LIMITS ─────────────────────────────────────────────
{
  const els = [...head('04 · Giới hạn: vốn và cạnh tranh', 'Lợi nhuận đã quay lại, nhưng vốn bỏ ra cần nhiều năm để thu hồi', false)];
  els.push(T('lk', 140, 360, 760, 30, 'Tỷ suất sinh lời trên vốn đầu tư', 'eyebrow', { c: C.amberD, m: m('fade', 250) }));
  els.push(T('big', 140, 392, 760, 236, '3–4%', 'num', { size: 200, c: C.amberD, m: m('rise', 300) }));
  els.push(T('lb', 140, 626, 760, 90, 'mỗi năm, dù lợi nhuận ròng đã vượt ngưỡng 200 tỷ đồng/năm vào năm 2026.', 'body', { c: C.muted, m: m('fade', 500) }));
  els.push(L('ll', 140, 760, 900, 760, { c: C.line, w: 2, m: m('draw', 600) }));
  els.push(T('ls', 140, 782, 760, 110, 'Vốn giải ngân khoảng 279,6 triệu USD; định giá tăng khoảng 6 lần lên gần 455 triệu USD, nên thời gian thu hồi vốn dài hơn kỳ vọng.', 'small', { c: C.muted, m: m('fade', 650) }));
  els.push(T('rk', 1020, 360, 760, 30, 'Cạnh tranh không hạ nhiệt', 'eyebrow', { c: C.amberD, m: m('fade', 700) }));
  els.push(T('rh', 1020, 404, 760, 112, 'Rào cản gia nhập F&B thấp, đối thủ liên tục xuất hiện', 'h2', { c: C.ink, m: m('rise', 750) }));
  const chips = [['Highlands Coffee', 'The Coffee House'], ['Trung Nguyên', 'Starbucks', 'Katinat'], ['Chagee']];
  chips.forEach((row, ri) => {
    let x = 1020;
    row.forEach((t, ci) => {
      const w = chipW(t);
      els.push(B(`ch${ri}${ci}`, x, 556 + ri * 68, w, 54, t, 'small', { fill: '#FFFFFF', alpha: 0.6, line: { c: C.line, w: 2 }, r: 27, c: C.ink, align: 'center', m: m('scale', 850 + (ri * 3 + ci) * 60) }));
      x += w + 14;
    });
  });
  els.push(L('rl', 1020, 776, 1780, 776, { c: C.line, w: 2, m: m('draw', 1200) }));
  els.push(T('rs', 1020, 798, 760, 110, 'Phúc Long phải liên tục làm mới nhận diện văn hóa trà Việt và tranh mặt bằng đắc địa, thay vì dựa vào độ phủ số lượng.', 'small', { c: C.muted, m: m('fade', 1250) }));
  slides.push({
    id: 'limits', section: '04 · Đánh giá và tổng kết', scene: 'paper2', dark: false, transition: 'fade', els, deco: [],
    notes: 'Hai giới hạn còn lại. Thứ nhất, định giá mua vào cao: với khoảng 279,6 triệu USD vốn bỏ ra, dù lợi nhuận ròng vượt 200 tỷ đồng/năm, tỷ suất sinh lời trên vốn đầu tư mới đạt khoảng 3–4% mỗi năm, khiến thời gian thu hồi vốn kéo dài hơn kỳ vọng. Thứ hai, cạnh tranh gay gắt: Highlands Coffee, Katinat hay làn sóng trà mới như Chagee buộc Phúc Long phải đầu tư làm mới thương hiệu và tranh mặt bằng đắc địa.',
  });
}

// 19 ─ LESSONS ────────────────────────────────────────────
{
  const els = [...head('04 · Tổng kết', 'Ba bài học từ thương vụ Masan – Phúc Long', false)];
  const ls = [
    ['Mua thương hiệu là mua thời gian', 'Masan vào ngành đồ uống nhanh mà không phải tự xây chuỗi hay thương hiệu mới, thứ khó tạo ra trong thời gian ngắn.'],
    ['Cộng hưởng không thể ép bằng mặt bằng', 'Kiosk trong siêu thị mini thất bại vì xung đột trải nghiệm. Giá trị thật đến từ cửa hàng chuẩn, giao hàng và sản phẩm đóng gói.'],
    ['Quản trị chuyên nghiệp mở khóa giá trị', 'Từ doanh nghiệp gia đình, Phúc Long thành mảnh ghép F&B sinh lời bền vững, có cơ hội vươn ra thị trường nước ngoài như Mỹ.'],
  ];
  ls.forEach(([h, b], i) => {
    const x = 140 + i * 557, step = i, d = i === 0 ? 300 : 0;
    els.push(L(`l${i}`, x, 330, x + 525, 330, { c: C.ink, w: 2, step, m: m('draw', d) }));
    els.push(T(`n${i}`, x, 346, 525, 144, `0${i + 1}`, 'num', { size: 120, c: C.parchD, step, m: m('rise', d + 60) }));
    els.push(T(`h${i}`, x, 494, 525, 110, h, 'h2', { size: 40, c: C.ink, step, m: m('rise', d + 140) }));
    els.push(T(`b${i}`, x, 616, 525, 170, b, 'small', { c: C.muted, step, m: m('rise', d + 220) }));
  });
  els.push(R('rec', 140, 830, 1640, 130, { fill: C.forest800, r: 20, step: 3, m: m('rise', 0) }));
  els.push(T('reck', 190, 872, 240, 40, 'Khuyến nghị', 'eyebrow', { c: C.amberL, step: 3, m: m('fade', 120) }));
  els.push(T('rect', 440, 858, 1290, 76, 'M&A tiềm ẩn rủi ro mất thương hiệu, bị thâu tóm hay thống lĩnh thị trường. Nhà nước cần hoàn thiện hành lang pháp lý và xây dựng thị trường M&A chuyên nghiệp hơn.', 'small', { c: C.cream, step: 3, m: m('fade', 180) }));
  slides.push({
    id: 'lessons', section: '04 · Đánh giá và tổng kết', scene: 'paper', dark: false, transition: 'fade', els, deco: [],
    notes: 'Bấm để lần lượt hiện bài học 2, 3 và khuyến nghị. Một, thương vụ giúp Masan phát triển nhanh trong ngành đồ uống mà không cần xây thương hiệu mới. Hai, ý tưởng tích hợp cơ học kiosk trong siêu thị mini không thành công; giá trị đến từ cửa hàng chuẩn và các kênh bổ trợ. Ba, năng lực quản trị chuyên nghiệp biến Phúc Long thành mảnh ghép sinh lời và mở đường ra thị trường nước ngoài như Mỹ. Ở góc độ vĩ mô, nhóm đề xuất hoàn thiện hành lang pháp lý và xây dựng thị trường M&A chuyên nghiệp hơn.',
  });
}

// 20 ─ CLOSING ────────────────────────────────────────────
slides.push({
  id: 'closing', section: '04 · Đánh giá và tổng kết', scene: 'hero', dark: true, layout: 'hero', transition: 'fade',
  deco: [{ k: 'cup', cx: 1450, cy: 590, r: 300 }, { k: 'steam', x: 1450, y: 110 }, { k: 'contour', cx: 160, cy: 1060, rx: 520, ry: 300, n: 9, c: C.sage, a: 0.10, rot: -8 }],
  els: [
    T('eyebrow', 140, 120, 900, 30, 'Masan × Phúc Long', 'eyebrow', { c: C.amberL, m: m('fade', 0) }),
    T('title', 140, 372, 1100, 316, 'Cảm ơn đã\nlắng nghe', 'display', { size: 140, c: C.cream, role: 'title', m: m('words', 150) }),
    T('sub', 140, 706, 900, 70, 'Hỏi & đáp', 'h2', { italic: true, size: 56, c: C.amberL, m: m('rise', 700) }),
    L('rule', 140, 900, 1780, 900, { c: C.lineD, w: 2, m: m('draw', 800) }),
    T('meta1', 140, 928, 800, 40, 'Nhóm 2 · K26D2 · UFM', 'body', { c: C.mutedL, m: m('fade', 950) }),
    T('meta2', 980, 928, 800, 40, 'Phân tích chiến lược thu mua Phúc Long', 'body', { c: C.mutedL, align: 'right', m: m('fade', 1000) }),
  ],
  notes: 'Cảm ơn thầy cô và các bạn đã lắng nghe. Nhóm 2 sẵn sàng nhận câu hỏi.',
});

// Valuation follows Stakes directly so the three ownership bars can morph into the three valuation bars.
{
  const iS = slides.findIndex((x) => x.id === 'stages'), iV = slides.findIndex((x) => x.id === 'valuation');
  const [v] = slides.splice(iV, 1); slides.splice(iS, 0, v);
}

const spec = {
  meta: {
    title: 'Masan × Phúc Long — Phân tích chiến lược thu mua',
    author: 'Nhóm 2 · K26D2 · UFM',
    version: '3.0',
    canvas: tokens.canvas,
    direction: tokens.name,
  },
  tokens,
  slides,
};
fs.writeFileSync(path.join(__dirname, 'presentation.json'), JSON.stringify(spec, null, 1));
console.log('slides:', slides.length, 'elements:', slides.reduce((a, s) => a + s.els.length, 0));
