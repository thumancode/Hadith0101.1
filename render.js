/* render.js — Playwright frame capture + FFmpeg encode.
   node render.js                full video
   node render.js --test 10      only the first 10 seconds
   node render.js --still 5,20   PNG stills at those times (seconds)
   node render.js --workers 4    parallel browsers (default: min(4, CPUs))
   node render.js --lines        only regenerate lines.js from timestamps.txt            */
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const W = 1080, H = 1920, FPS = 30;
const OUT = 'hadith-video.mp4';
const ROOT = __dirname;

function arg(name) { const i = process.argv.indexOf('--' + name); return i < 0 ? null : (process.argv[i + 1] === undefined || process.argv[i + 1].startsWith('--') ? true : process.argv[i + 1]); }

/* timestamps.txt -> lines.js (single source of truth) */
function buildLines() {
  const txt = fs.readFileSync(path.join(ROOT, 'timestamps.txt'), 'utf8');
  const lines = txt.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).map((l, i) => {
    const p = l.split('|').map((x) => x.trim());
    if (p.length < 3) throw new Error('timestamps.txt line ' + (i + 1) + ' is not "start | end | text | tag"');
    return { s: parseFloat(p[0]), e: parseFloat(p[1]), text: p[2], tag: p[3] || 'informative' };
  });
  if (!lines.length) throw new Error('timestamps.txt is empty');
  fs.writeFileSync(path.join(ROOT, 'lines.js'), '// generated from timestamps.txt by render.js — do not edit by hand\nconst LINES=' + JSON.stringify(lines, null, 1) + ';\n');
  return lines;
}

async function launch(chromium) {
  const exe = process.env.PW_CHROMIUM_PATH || undefined;
  return chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--font-render-hinting=none', '--disable-lcd-text'] });
}
async function openPage(browser) {
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => { console.error('PAGE ERROR:', e.message); });
  await page.goto('file://' + path.join(ROOT, 'index.html'));
  await page.waitForFunction('window.__ready === true', null, { timeout: 60000 });
  return page;
}

async function main() {
  const lines = buildLines();
  if (arg('lines')) { console.log('lines.js written (' + lines.length + ' lines)'); return; }
  const { chromium } = require('playwright');
  const fullDur = Math.ceil(lines[lines.length - 1].e);

  const stills = arg('still');
  if (stills) {
    const browser = await launch(chromium); const page = await openPage(browser);
    for (const t of String(stills).split(',').map(Number)) {
      await page.evaluate((x) => window.renderAt(x), t);
      const f = path.join(process.cwd(), 'still-' + t + '.png');
      await page.screenshot({ path: f, type: 'png' }); console.log('wrote', f);
    }
    await browser.close(); return;
  }

  const test = parseFloat(arg('test'));
  const dur = test > 0 ? Math.min(test, fullDur) : fullDur;
  const total = Math.round(dur * FPS);
  const nw = Math.max(1, parseInt(arg('workers'), 10) || Math.min(4, os.cpus().length));
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'frames-'));
  console.log('duration ' + dur + 's, ' + total + ' frames, ' + nw + ' worker(s), frames in ' + tmp);

  let done = 0; const t0 = Date.now();
  const per = Math.ceil(total / nw);
  await Promise.all(Array.from({ length: nw }, async (_, w) => {
    const a = w * per, b = Math.min(total, a + per);
    if (a >= b) return;
    const browser = await launch(chromium); const page = await openPage(browser);
    for (let f = a; f < b; f++) {
      await page.evaluate((t) => window.renderAt(t), f / FPS);
      await page.screenshot({ path: path.join(tmp, 'f' + String(f).padStart(5, '0') + '.jpg'), type: 'jpeg', quality: 93 });
      if (++done % 60 === 0 || done === total) console.log('frames ' + done + '/' + total + '  (' + ((Date.now() - t0) / 1000).toFixed(0) + 's)');
    }
    await browser.close();
  }));

  const ff = spawnSync('ffmpeg', ['-y', '-framerate', String(FPS), '-i', path.join(tmp, 'f%05d.jpg'), '-i', path.join(ROOT, 'audio.mp3'),
    '-filter_complex', '[1:a]apad,atrim=0:' + dur + '[a]', '-map', '0:v', '-map', '[a]',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(FPS),
    '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', '-shortest', path.join(process.cwd(), OUT)], { stdio: 'inherit' });
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) { /* ignore */ }
  if (ff.status !== 0) { console.error('FFmpeg failed with code ' + ff.status); process.exit(1); }
  console.log('done -> ' + OUT);
}
main().catch((e) => { console.error(e); process.exit(1); });
