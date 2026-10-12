// Playwright frame capture + FFmpeg encode.
// Usage: node render.js [--test SEC] [--still t1,t2,...] [--workers N]
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { chromium } = require('playwright');

const FPS = 30, W = 1080, H = 1920;
const OUT = 'hadith-video.mp4';
const ROOT = __dirname;

function arg(name) { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : undefined; }

// 1. timestamps.txt -> lines.js (single source of truth)
function buildLines() {
  const raw = fs.readFileSync(path.join(ROOT, 'timestamps.txt'), 'utf8').replace(/^\uFEFF/, '');
  const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean).map(l => {
    const p = l.split('|').map(x => x.trim());
    return { s: parseFloat(p[0]), e: parseFloat(p[1]), text: p[2] || '', tag: p[3] || '' };
  }).filter(l => !isNaN(l.s) && !isNaN(l.e));
  fs.writeFileSync(path.join(ROOT, 'lines.js'), 'const LINES=' + JSON.stringify(lines, null, 1) + ';\n');
  return lines;
}

async function openPage(browser) {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.error('page error:', e.message));
  await page.goto('file://' + path.join(ROOT, 'index.html'));
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 120000 });
  return page;
}
const launch = () => chromium.launch({ args: ['--no-sandbox', '--font-render-hinting=none', '--disable-lcd-text'] });

async function main() {
  const lines = buildLines();
  const full = Math.ceil(lines[lines.length - 1].e);

  const still = arg('--still');
  if (still) {
    const browser = await launch();
    const page = await openPage(browser);
    for (const ts of still.split(',').map(Number)) {
      await page.evaluate(t => window.renderAt(t), ts);
      const f = path.join(ROOT, `still_${ts.toFixed(2)}.png`);
      await page.screenshot({ path: f, clip: { x: 0, y: 0, width: W, height: H } });
      console.log('still:', f);
    }
    await browser.close();
    return;
  }

  const test = arg('--test');
  const dur = test ? Math.min(full, Math.max(1, Number(test))) : full;
  const total = Math.round(dur * FPS);
  const workers = Math.max(1, Number(arg('--workers')) || Math.min(4, os.cpus().length));
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'frames-'));
  console.log(`Rendering ${total} frames (${dur}s) with ${workers} workers -> ${dir}`);

  let done = 0;
  const per = Math.ceil(total / workers);
  await Promise.all(Array.from({ length: workers }, async (_, w) => {
    const from = w * per, to = Math.min(total, from + per);
    if (from >= to) return;
    const browser = await launch();
    const page = await openPage(browser);
    for (let f = from; f < to; f++) {
      await page.evaluate(t => window.renderAt(t), f / FPS);
      await page.screenshot({ path: path.join(dir, `f${String(f).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 93, clip: { x: 0, y: 0, width: W, height: H } });
      if (++done % 60 === 0 || done === total) console.log(`frames ${done}/${total} (${(done / total * 100).toFixed(1)}%)`);
    }
    await browser.close();
  }));

  const ff = spawnSync('ffmpeg', ['-y', '-framerate', String(FPS), '-i', path.join(dir, 'f%05d.jpg'), '-i', path.join(ROOT, 'audio.mp3'),
    '-filter_complex', `[1:a]apad,atrim=0:${dur}[a]`, '-map', '0:v', '-map', '[a]',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(FPS),
    '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', '-shortest', path.join(ROOT, OUT)], { stdio: 'inherit' });
  fs.rmSync(dir, { recursive: true, force: true });
  if (ff.status !== 0) { console.error('FFmpeg failed'); process.exit(ff.status || 1); }
  console.log('Done:', OUT);
}

main().catch(e => { console.error(e); process.exit(1); });
