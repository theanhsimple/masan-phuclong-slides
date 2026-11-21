// Renders HTML slides: final state (static), bg-only (for PPTX), and mid-animation frames.
// node qa/shoot.js <mode: final|bg|motion> [outdir]
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const path = require('path');
const fs = require('fs');
const mode = process.argv[2] || 'final';
const out = process.argv[3] || path.join(__dirname, '..', mode === 'bg' ? 'powerpoint/bg' : 'preview/html');
fs.mkdirSync(out, { recursive: true });
const file = 'file://' + path.join(__dirname, '..', 'html/index.html');
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--host-resolver-rules=MAP * ^NOTFOUND'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on('pageerror', (e) => console.log('PAGEERROR', e.message));
  await page.route('**/*', (r) => (r.request().url().startsWith('file://') || r.request().url().startsWith('data:') ? r.continue() : r.abort()));
  if (mode === 'motion') {
    await page.goto(file);
    await page.waitForTimeout(1500);
    const list = (process.argv[4] || '2,5,6,11,13,19').split(',').map(Number);
    const times = [180, 520, 1100, 2600];
    for (const s of list) {
      await page.evaluate((i) => window.__deck.go(i), s - 2);  // previous slide, instant
      await page.waitForTimeout(400);
      await page.keyboard.press('ArrowRight');                  // real transition into slide s
      let t0 = 0;
      for (const t of times) { await page.waitForTimeout(t - t0); t0 = t; await page.screenshot({ path: path.join(out, `m${String(s).padStart(2, '0')}_${t}.png`) }); }
      if (s === 13 || s === 19) { await page.keyboard.press('ArrowRight'); await page.waitForTimeout(900); await page.screenshot({ path: path.join(out, `m${String(s).padStart(2, '0')}_click1.png`) }); }
    }
    await page.keyboard.press('Escape'); await page.waitForTimeout(1000); await page.screenshot({ path: path.join(out, 'overview.png') });
    await page.keyboard.press('Escape'); await page.waitForTimeout(800); await page.keyboard.press('n'); await page.waitForTimeout(700); await page.screenshot({ path: path.join(out, 'notes.png') });
  } else {
    await page.goto(file + (mode === 'bg' ? '?bg=1' : '?static=1'));
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(500);
    const n = await page.evaluate(() => window.__deck.count);
    const report = [];
    for (let i = 0; i < n; i++) {
      await page.evaluate((k) => window.__deck.go(k), i);
      await page.waitForTimeout(150);
      if (mode === 'bg') await page.screenshot({ path: path.join(out, `bg${String(i + 1).padStart(2, '0')}.jpg`), type: 'jpeg', quality: 90 });
      else {
        await page.screenshot({ path: path.join(out, `s${String(i + 1).padStart(2, '0')}.png`) });
        const over = await page.evaluate((k) => {
          const s = document.querySelectorAll('.slide')[k], res = [];
          s.querySelectorAll('.tx,.bx').forEach((el) => {
            if (el.scrollHeight > el.clientHeight + 2) res.push(`OVERFLOW-Y ${el.textContent.slice(0, 40)} (${el.scrollHeight}>${el.clientHeight})`);
            if (el.scrollWidth > el.clientWidth + 2) res.push(`OVERFLOW-X ${el.textContent.slice(0, 40)}`);
            const r = el.getBoundingClientRect();
            if (r.right > 1920 - 100 + 2 && !el.closest('.chart')) res.push(`MARGIN ${el.textContent.slice(0, 30)} right=${Math.round(r.right)}`);
          });
          return res;
        }, i);
        report.push(`${i + 1}: ${over.join(' | ')}`);
      }
    }
    if (report.length) console.log(report.join('\n'));
  }
  await browser.close();
})();
