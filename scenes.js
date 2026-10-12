// Deterministic timeline engine + all scenes. Everything is drawn from window.renderAt(t).
(function () {
  const W = 1080, H = 1920;
  const DUR = Math.ceil(LINES.length ? LINES[LINES.length - 1].e : 1);
  const $ = (id) => document.getElementById(id);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const easeOut = (x) => 1 - Math.pow(1 - x, 3);
  const easeBack = (x) => { const c = 1.70158, c3 = c + 1; return 1 + c3 * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };

  // ---------- seeded random ----------
  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const rnd = mulberry32(20261013);

  // ---------- DOM helpers ----------
  function el(tag, cls, html, css, parent) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    if (css) Object.assign(e.style, css);
    if (parent) parent.appendChild(e);
    return e;
  }
  // centered absolute box inside a 1080x1200 scene
  function box(parent, cx, cy, w, h, html, cls, css) {
    return el('div', 'abs ' + (cls || ''), html, Object.assign({ left: (cx - w / 2) + 'px', top: (cy - h / 2) + 'px', width: w + 'px', height: h + 'px' }, css || {}), parent);
  }
  function textBox(parent, cx, cy, w, html, cls, css) {
    return el('div', 'abs tc ' + (cls || ''), html, Object.assign({ left: (cx - w / 2) + 'px', top: cy + 'px', width: w + 'px', transform: 'translateY(-50%)' }, css || {}), parent);
  }

  // ---------- track engine ----------
  const TRACKS = [];
  const PRESETS = {
    rise: (k) => `translateY(${(1 - k) * 60}px)`,
    drop: (k) => `translateY(${-(1 - k) * 60}px)`,
    pop: (k, raw) => `scale(${0.55 + 0.45 * easeBack(raw)})`,
    zoom: (k) => `scale(${1.25 - 0.25 * k})`,
    left: (k) => `translateX(${-(1 - k) * 120}px)`,
    right: (k) => `translateX(${(1 - k) * 120}px)`,
    fade: () => ''
  };
  function track(elm, start, end, opt) {
    opt = opt || {};
    const base = elm.style.transform || '';
    TRACKS.push({ el: elm, s: start, e: end, a: opt.a || 'fade', i: opt.i == null ? 0.5 : opt.i, o: opt.o == null ? 0.4 : opt.o, fn: opt.fn, base });
    return elm;
  }
  function applyTrack(tr, t) {
    const { el: e, s, e: end } = tr;
    if (t < s || t >= end) { e.style.visibility = 'hidden'; e.style.opacity = '0'; return; }
    e.style.visibility = 'inherit'; // never 'visible' (see engine rules)
    const pin = tr.i > 0 ? clamp((t - s) / tr.i, 0, 1) : 1;
    const pout = tr.o > 0 ? clamp((end - t) / tr.o, 0, 1) : 1;
    const kin = easeOut(pin), kout = easeOut(pout);
    const k = Math.min(kin, kout);
    e.style.opacity = String(k);
    const movement = PRESETS[tr.a] ? PRESETS[tr.a](kin, pin) : '';
    const extra = tr.fn ? (tr.fn(e, t, t - s) || '') : '';
    e.style.transform = [tr.base, movement, extra].filter(Boolean).join(' ');
  }

  // word-by-word reveal (Arabic or Bengali): words are spans, never split letters
  function words(parent, text, cls, css, start, end, opts) {
    opts = opts || {};
    const c = el('div', cls, null, css, parent);
    const ws = text.split(/\s+/).filter(Boolean);
    const total = ws.reduce((a, w) => a + w.length, 0) || 1;
    let acc = 0;
    const span = (end - start);
    ws.forEach((w, idx) => {
      const sp = el('span', 'aw', w, null, c);
      if (idx < ws.length - 1) c.appendChild(document.createTextNode(' '));
      const st = start + span * (acc / total);
      acc += w.length;
      track(sp, st, opts.until || 1e9, { a: opts.a || 'rise', i: 0.3, o: 0 });
    });
    return c;
  }

  // ---------- emotion colors ----------
  const EMO = {
    respectful: [227, 194, 107], informative: [64, 170, 150], solemn: [40, 110, 160], serious: [150, 70, 60],
    calm: [70, 150, 180], thoughtful: [120, 110, 190], warm: [235, 150, 70], compassionate: [220, 120, 130],
    optimistic: [250, 200, 90], friendly: [110, 200, 140], encouraging: [240, 180, 80], store: [227, 194, 107]
  };
  const emoOf = (tag) => EMO[(tag || '').trim()] || EMO.informative;

  // ---------- background ----------
  function buildBackground() {
    document.body.insertAdjacentHTML('afterbegin', ART.DEFS);
    $('pattern').style.backgroundImage = ART.patternTile();
    $('medallion').innerHTML = ART.medallion();
    $('skyline').innerHTML = ART.skyline();
    const dust = $('dust');
    for (let i = 0; i < 46; i++) {
      const d = el('div', 'dust', null, null, dust);
      d._p = { x: rnd() * W, y: rnd() * H, sp: 8 + rnd() * 22, ph: rnd() * 6.28, sz: 0.6 + rnd() * 1.8, dr: (rnd() - 0.5) * 30 };
    }
    const L = [[110, 0.9, 240], [970, 1.0, 300], [250, 0.7, 170], [830, 0.75, 200]];
    L.forEach(([x, s, len], i) => {
      const l = el('div', 'lantern', ART.lantern(), { left: (x - 45) + 'px', top: (len - 300) * s + 'px', height: '300px' }, $('lanterns'));
      l._p = { s, ph: i * 1.3 };
    });
  }
  function renderBackground(t) {
    $('pattern').style.transform = `translate(${(t * 6) % 180}px, ${(t * 4) % 180}px)`;
    $('medallion').style.transform = `rotate(${t * 3}deg)`;
    for (const d of $('dust').children) {
      const p = d._p;
      const y = ((p.y - t * p.sp) % H + H) % H;
      const x = p.x + Math.sin(t * 0.5 + p.ph) * p.dr;
      const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 2.2 + p.ph * 3));
      d.style.transform = `translate(${x}px,${y}px) scale(${p.sz})`;
      d.style.opacity = tw.toFixed(3);
    }
    for (const l of $('lanterns').children) {
      l.style.transform = `scale(${l._p.s}) rotate(${Math.sin(t * 1.1 + l._p.ph) * 4}deg)`;
    }
    // emotion glow with 0.6 s cross-fade
    let idx = LINES.findIndex(l => t >= l.s && t < l.e);
    if (idx < 0) idx = t < (LINES[0] ? LINES[0].s : 0) ? 0 : LINES.length - 1;
    const cur = emoOf(LINES[idx] && LINES[idx].tag);
    const prev = idx > 0 ? emoOf(LINES[idx - 1].tag) : cur;
    const k = idx > 0 ? clamp((t - LINES[idx].s) / 0.6, 0, 1) : 1;
    const c = cur.map((v, i) => Math.round(prev[i] + (v - prev[i]) * k));
    const pulse = 0.32 + 0.06 * Math.sin(t * 1.4);
    $('glow').style.background = `radial-gradient(circle, rgba(${c},${pulse}) 0%, rgba(${c},0.10) 35%, rgba(${c},0) 65%)`;
    $('progress-fill').style.width = (clamp(t / DUR, 0, 1) * 100).toFixed(3) + '%';
  }

  // ---------- subtitles ----------
  const KEY = ['নিয়', 'আল্লাহ', 'হাদিস', 'ইবাদত', 'শেয়ার', 'ইনষ্টল', 'ইসলামী', 'বিশ্বকোষ', 'S2', 'বুখারি', 'রাসুলুল্লাহ', 'আ\'মালু', 'হিজরত', 'অন্তরের', 'ইনশাল্লাহ'];
  function buildSubtitles() {
    const subs = $('subs');
    LINES.forEach(line => {
      const d = el('div', 'sub bn' + (line.text.length > 62 ? ' long' : ''), null, null, subs);
      track(d, line.s, line.e, { a: 'fade', i: 0.15, o: 0.15 });
      const inner = el('div', 'sub-in', null, null, d);
      const ws = line.text.split(/\s+/).filter(Boolean);
      const total = ws.reduce((a, w) => a + w.length, 0) || 1;
      const span = (line.e - line.s) * 0.86;
      let acc = 0;
      // the app name between ❝ ❞ is highlighted as a whole
      let inQuote = false;
      ws.forEach((w, i) => {
        if (w.includes('❝')) inQuote = true;
        const isKey = inQuote || KEY.some(k => w.includes(k));
        if (w.includes('❞')) inQuote = false;
        const sp = el('span', 'w' + (isKey ? ' k' : ''), w, null, inner);
        if (i < ws.length - 1) inner.appendChild(document.createTextNode(' '));
        const st = line.s + span * (acc / total);
        acc += w.length;
        track(sp, st, line.e + 1, { a: 'rise', i: 0.28, o: 0 });
      });
    });
  }

  // ---------- scenes ----------
  const STAGE = () => $('stage');
  function scene(s, e) { return track(el('div', 'scene', null, null, STAGE()), s, e, { a: 'fade', i: 0.4, o: 0.4 }); }
  const ringPulse = (period, delay) => (e, t) => {
    const p = (((t + delay) % period) + period) % period / period;
    e.style.opacity = String((1 - p) * 0.8);
    return `scale(${0.8 + p * 0.9})`;
  };
  const floatY = (amp, sp, ph) => (e, t) => `translateY(${Math.sin(t * sp + (ph || 0)) * amp}px)`;
  const spin = (deg) => (e, t) => `rotate(${t * deg}deg)`;
  const pulse = (amp, sp) => (e, t) => `scale(${1 + Math.sin(t * sp) * amp})`;

  function iconTile(parent, cx, cy, size) {
    return box(parent, cx, cy, size, size, '<img src="app-icon.jpg" alt="">', 'icon-tile');
  }
  function framed(parent, cx, cy, w, h) {
    const c = box(parent, cx, cy, w, h, null, 'card');
    const cs = 90;
    [[0, 0, 0], [w - cs, 0, 90], [w - cs, h - cs, 180], [0, h - cs, 270]].forEach(([x, y, r]) =>
      el('div', 'abs', ART.corner(), { left: x - 14 + 'px', top: y - 14 + 'px', width: cs + 'px', height: cs + 'px', transform: `rotate(${r}deg)` }, c));
    return c;
  }

  function buildScenes() {
    // 1. Greeting 0 – 2.5
    let S = scene(0, 2.6);
    for (let i = 0; i < 3; i++) track(box(S, 540, 470, 560, 560, null, 'ringfx'), 0, 2.6, { i: 0, o: 0.3, fn: ringPulse(2.4, i * 0.8) });
    track(box(S, 540, 470, 700, 700, ART.halo()), 0, 2.6, { i: 0, o: 0.3, fn: pulse(0.04, 2) });
    track(iconTile(S, 540, 470, 440), 0, 2.6, { a: 'fade', i: 0, o: 0.3, fn: (e, t) => `scale(${0.92 + 0.08 * easeOut(clamp(t / 1.2, 0, 1))})` });
    track(textBox(S, 540, 900, 980, 'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ', 'ar arbig'), 0, 2.6, { a: 'rise', i: 0, o: 0.3 });
    track(box(S, 540, 1010, 600, 40, ART.divider()), 0.3, 2.6, { a: 'fade', i: 0.5 });

    // 2. Title 2.5 – 6.5
    S = scene(2.5, 6.6);
    track(box(S, 540, 520, 900, 900, ART.medallion(), null, { opacity: 0.5 }), 2.5, 6.6, { a: 'zoom', i: 0.8, fn: spin(8) });
    track(textBox(S, 540, 180, 980, 'আজকের হাদিস', 'bn title'), 2.6, 6.6, { a: 'drop', i: 0.6 });
    track(box(S, 540, 290, 600, 40, ART.divider()), 2.9, 6.6, { a: 'fade' });
    track(box(S, 540, 600, 620, 440, ART.openBook()), 3.0, 6.6, { a: 'pop', i: 0.7, fn: floatY(10, 1.6) });
    track(textBox(S, 540, 960, 960, 'যা আমাদের পুরো জীবন বদলে দিতে পারে', 'bn h2'), 4.6, 6.6, { a: 'rise' });

    // 3. Narrator 6.5 – 10.5
    S = scene(6.5, 10.6);
    track(framed(S, 540, 330, 920, 360), 6.6, 10.6, { a: 'pop', i: 0.6 });
    words(S, 'عَلْقَمَةُ بْنُ وَقَّاصٍ اللَّيْثِيُّ', 'abs tc ar armid', { left: '110px', top: '205px', width: '860px' }, 6.8, 8.6);
    track(textBox(S, 540, 410, 860, 'رَحِمَهُ اللَّهُ', 'ar arsm'), 8.8, 10.6, { a: 'rise' });
    // chain of narration: Rasulullah -> Umar -> Alqamah
    const chain = [['رَسُولُ اللَّهِ', 9.0], ['عُمَرُ', 9.4], ['عَلْقَمَةُ', 9.8]];
    chain.forEach(([n, st], i) => {
      const x = 840 - i * 300;
      track(box(S, x, 780, 220, 220, `<div class="ar arsm">${n}</div>`, 'circle'), st, 10.6, { a: 'pop', i: 0.45 });
      if (i < 2) track(box(S, x - 150, 780, 80, 30, ART.dotted(80), null, { transform: 'rotate(180deg)' }), st + 0.2, 10.6, { a: 'fade' });
    });
    track(textBox(S, 540, 1000, 960, 'বর্ণনার ধারা', 'bn h2'), 9.2, 10.6, { a: 'rise' });

    // 4. Minbar 10.5 – 15
    S = scene(10.5, 15.1);
    track(box(S, 540, 560, 900, 900, ART.halo()), 10.5, 15.1, { i: 0.8, fn: pulse(0.05, 1.8) });
    track(box(S, 520, 600, 560, 720, ART.minbar('لَا إِلَهَ إِلَّا اللَّهُ', 'اللَّه')), 10.6, 15.1, { a: 'rise', i: 0.8 });
    for (let i = 0; i < 3; i++) track(box(S, 890, 330, 240, 240, ART.arcs()), 12.5, 15.1, { i: 0.3, fn: (e, t) => { const p = ((t * 0.9 + i / 3) % 1); e.style.opacity = String(1 - p); return `scale(${0.6 + p * 0.6})`; } });
    track(textBox(S, 540, 90, 940, 'عُمَرُ بْنُ الْخَطَّابِ رَضِيَ اللَّهُ عَنْهُ', 'ar armid'), 11.0, 15.1, { a: 'drop', i: 0.6 });
    track(textBox(S, 540, 1080, 900, 'মিম্বরের উপর থেকে', 'bn h2'), 12.0, 15.1, { a: 'rise' });

    // 5. The Messenger ﷺ 15 – 18.5
    S = scene(15, 18.6);
    track(box(S, 540, 690, 560, 540, ART.greenDome()), 15.2, 18.6, { a: 'rise', i: 0.8, fn: floatY(6, 1.2) });
    track(framed(S, 540, 230, 960, 330), 15.0, 18.6, { a: 'pop', i: 0.6 });
    words(S, 'سَمِعْتُ رَسُولَ اللَّهِ', 'abs tc ar armid', { left: '90px', top: '100px', width: '900px' }, 15.2, 16.4);
    words(S, 'صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ يَقُولُ', 'abs tc ar arsm', { left: '90px', top: '220px', width: '900px' }, 16.4, 18.0);

    // 6. Core text 18.5 – 28.5
    S = scene(18.5, 28.6);
    track(framed(S, 540, 330, 980, 560), 18.5, 28.6, { a: 'pop', i: 0.5 });
    words(S, 'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ', 'abs tc ar arbig', { left: '80px', top: '110px', width: '920px' }, 18.6, 20.4);
    track(box(S, 540, 330, 600, 40, ART.divider()), 20.6, 28.6, { a: 'fade' });
    words(S, 'وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى', 'abs tc ar arbig', { left: '80px', top: '380px', width: '920px' }, 23.6, 25.7);
    const chip1 = box(S, 540, 760, 640, 120, '<span class="bn">কাজ</span><span>⟷</span><span class="bn">নিয়ত</span>', 'chip', { position: 'absolute' });
    track(chip1, 20.9, 28.6, { a: 'pop', i: 0.5 });
    track(box(S, 540, 930, 760, 200, ART.halo()), 26.1, 28.6, { i: 0.5, fn: pulse(0.06, 3) });
    const chip2 = box(S, 540, 930, 640, 120, '<span class="bn">নিয়ত</span><span>→</span><span class="bn">ফল</span>', 'chip', { position: 'absolute' });
    track(chip2, 26.1, 28.6, { a: 'pop', i: 0.5 });

    // 7. Hijrah example 28.5 – 36
    S = scene(28.5, 36.1);
    track(box(S, 230, 260, 260, 260, ART.coins()), 29.3, 36.1, { a: 'left', i: 0.6, fn: floatY(8, 1.5) });
    track(textBox(S, 230, 430, 360, 'دُنْيَا', 'ar armid'), 29.6, 36.1, { a: 'rise' });
    track(box(S, 850, 260, 240, 240, ART.ring()), 30.8, 36.1, { a: 'right', i: 0.6, fn: floatY(8, 1.5, 1) });
    track(textBox(S, 850, 430, 360, 'امْرَأَةٌ', 'ar armid'), 31.1, 36.1, { a: 'rise' });
    track(box(S, 540, 330, 300, 300, ART.kaaba()), 28.7, 36.1, { a: 'pop', i: 0.6 });
    track(textBox(S, 540, 520, 400, 'هِجْرَةٌ', 'ar armid'), 28.9, 36.1, { a: 'rise' });
    track(box(S, 385, 300, 120, 40, ART.dotted(120), null, { transform: 'rotate(180deg)' }), 29.4, 36.1, { a: 'fade' });
    track(box(S, 700, 300, 120, 40, ART.dotted(120)), 30.9, 36.1, { a: 'fade' });
    track(framed(S, 540, 830, 980, 380), 32.5, 36.1, { a: 'rise', i: 0.5 });
    words(S, 'فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى دُنْيَا يُصِيبُهَا أَوْ إِلَى امْرَأَةٍ يَنْكِحُهَا فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ', 'abs tc ar', { left: '90px', top: '680px', width: '900px', fontSize: '48px', lineHeight: '1.75', color: '#f8e7ae' }, 32.6, 35.6);

    // 8. Source 36 – 38.5
    S = scene(36, 38.6);
    track(box(S, 540, 520, 900, 900, ART.halo()), 36, 38.6, { i: 0.5 });
    track(box(S, 540, 520, 480, 620, ART.bookCover('صَحِيحُ الْبُخَارِيِّ', 'حَدِيثٌ رَقْمُ ١')), 36.1, 38.6, { a: 'zoom', i: 0.7, fn: floatY(6, 1.5) });
    track(textBox(S, 540, 1000, 900, 'সহিহ বুখারি · হাদিস ১', 'bn h2'), 36.6, 38.6, { a: 'rise' });

    // 9. Reflection 38.5 – 53
    S = scene(38.5, 40.3);
    track(box(S, 540, 500, 500, 600, ART.bulb()), 38.5, 40.3, { a: 'pop', i: 0.5, fn: pulse(0.04, 6) });
    track(textBox(S, 540, 950, 900, 'চিন্তা করুন', 'bn title'), 38.7, 40.3, { a: 'rise' });

    S = scene(40.2, 49.9);
    track(box(S, 300, 640, 260, 430, ART.rug()), 40.4, 49.9, { a: 'left', i: 0.6 });
    track(box(S, 780, 640, 260, 430, ART.rug()), 40.7, 49.9, { a: 'right', i: 0.6 });
    track(textBox(S, 540, 90, 940, 'একই কাজ · দুজন মানুষ', 'bn h2'), 40.4, 49.9, { a: 'drop' });
    track(box(S, 300, 290, 260, 520, ART.lightBeam(), null, { transform: 'rotate(0deg)' }), 42.6, 47.3, { a: 'fade', i: 0.6 });
    track(textBox(S, 300, 250, 400, 'لِلَّهِ', 'ar arbig'), 42.7, 47.3, { a: 'drop' });
    track(textBox(S, 300, 920, 420, 'আল্লাহর জন্য', 'bn txt'), 42.8, 49.9, { a: 'rise' });
    track(box(S, 780, 280, 260, 160, ART.eye()), 44.9, 47.3, { a: 'pop', i: 0.5 });
    track(box(S, 680, 340, 200, 160, ART.eye(), null, { opacity: 0.7 }), 45.2, 47.3, { a: 'pop', i: 0.5 });
    track(box(S, 900, 360, 180, 140, ART.eye(), null, { opacity: 0.7 }), 45.4, 47.3, { a: 'pop', i: 0.5 });
    track(textBox(S, 780, 920, 420, 'মানুষকে দেখাতে', 'bn txt'), 45.0, 49.9, { a: 'rise' });
    track(box(S, 540, 1040, 760, 100, ART.bracket(), null, { transform: 'rotate(180deg)' }), 47.3, 49.9, { a: 'fade' });
    track(textBox(S, 540, 330, 900, 'বাইরে থেকে একই রকম', 'bn h2'), 47.4, 49.9, { a: 'pop' });

    S = scene(49.8, 53.1);
    track(box(S, 540, 140, 1000, 260, null, null, { borderRadius: '40px', background: 'linear-gradient(180deg,rgba(248,231,174,.35),rgba(248,231,174,0))' }), 49.8, 53.1, { a: 'fade' });
    track(textBox(S, 540, 120, 600, 'السَّمَاءُ', 'ar armid'), 50.0, 53.1, { a: 'drop' });
    track(textBox(S, 540, 1080, 600, 'الْأَرْضُ', 'ar armid'), 50.0, 53.1, { a: 'rise' });
    track(box(S, 360, 360, 200, 330, ART.rug()), 49.9, 53.1, { a: 'fade', fn: (e, t, l) => `translateY(${-Math.min(l, 2.5) * 40}px)` });
    track(box(S, 720, 760, 200, 330, ART.rug('#4a2a2a')), 49.9, 53.1, { a: 'fade', fn: (e, t, l) => `translateY(${Math.min(l, 2.5) * 40}px)` });
    track(textBox(S, 540, 560, 600, 'আকাশ পাতাল পার্থক্য', 'bn h2'), 50.8, 53.1, { a: 'pop' });

    // 10. Everyday acts 53 – 60
    S = scene(53, 60.1);
    const acts = [['prayer', 'নামাজ', 53.1, 270, 280], ['fasting', 'রোজা', 54.3, 810, 280], ['charity', 'দান', 55.4, 270, 700], ['moonZ', 'ঘুম', 56.8, 810, 700]];
    acts.forEach(([art, label, st, x, y]) => {
      const c = box(S, x, y, 420, 380, `<div class="abs" style="left:110px;top:40px;width:200px;height:200px">${ART[art]()}</div><div class="abs tc bn h2" style="left:0;top:260px;width:420px">${label}</div>`, 'card');
      track(c, st, 60.1, { a: 'pop', i: 0.5, fn: (e, t) => {
        const gl = clamp((t - 58.0) / 0.6, 0, 1);
        e.style.boxShadow = `0 0 ${50 + gl * 60}px rgba(227,194,107,${0.25 + gl * 0.5})`;
        const m = clamp((t - 58.6) / 0.8, 0, 1);
        return `translate(${(540 - x) * m}px, ${(490 - y) * m}px) scale(${1 - 0.6 * m})`;
      } });
    });
    track(box(S, 540, 490, 700, 700, ART.burst()), 59.0, 60.1, { a: 'pop', i: 0.4, fn: spin(30) });
    track(textBox(S, 540, 450, 700, 'عِبَادَةٌ', 'ar arbig'), 59.1, 60.1, { a: 'pop', i: 0.4 });
    track(textBox(S, 540, 1050, 900, 'সবই হতে পারে ইবাদত', 'bn h2'), 57.0, 60.1, { a: 'rise' });

    // 11. Call to action 60 – 78
    S = scene(60, 62.6);
    track(box(S, 540, 500, 520, 480, ART.heart()), 60.1, 62.6, { a: 'pop', i: 0.5, fn: (e, t) => `scale(${1 + 0.06 * Math.max(0, Math.sin(t * 7))})` });
    track(textBox(S, 540, 950, 900, 'অন্তরের গল্প', 'bn title'), 60.4, 62.6, { a: 'rise' });

    S = scene(62.5, 66.1);
    track(box(S, 290, 420, 360, 220, ART.eye()), 62.6, 66.1, { a: 'left' });
    track(textBox(S, 290, 650, 460, 'দুনিয়া দেখে কাজ', 'bn h2'), 62.8, 66.1, { a: 'rise' });
    track(box(S, 790, 420, 340, 320, ART.heart()), 64.2, 66.1, { a: 'right' });
    track(textBox(S, 790, 650, 460, 'আল্লাহ দেখেন নিয়ত', 'bn h2'), 64.4, 66.1, { a: 'rise' });
    track(box(S, 540, 900, 600, 40, ART.divider()), 63.2, 66.1, { a: 'fade' });

    S = scene(66, 69.6);
    const sw = box(S, 540, 500, 460, 520, ART.stopwatch());
    track(sw, 66.1, 69.6, { a: 'pop', i: 0.5, fn: (e, t) => {
      const p = clamp((t - 67.5) / 1.5, 0, 1);
      const r = e.querySelector('.sw-ring'); if (r) r.setAttribute('stroke-dashoffset', String(678.6 * p));
      const h = e.querySelector('.sw-hand'); if (h) h.setAttribute('transform', `rotate(${p * 360} 150 190)`);
      return '';
    } });
    track(textBox(S, 540, 980, 900, 'এক সেকেন্ড থামুন', 'bn title'), 67.4, 69.6, { a: 'rise' });

    S = scene(69.5, 72.1);
    track(box(S, 540, 460, 400, 540, ART.question()), 69.6, 72.1, { a: 'pop', i: 0.6, fn: floatY(10, 2) });
    track(textBox(S, 540, 900, 960, 'আমি এটা কেন করছি?', 'bn title'), 70.2, 72.1, { a: 'rise' });

    S = scene(72, 74.9);
    track(box(S, 540, 420, 880, 440, ART.sunrise()), 72.0, 74.9, { a: 'rise', i: 0.7, fn: (e, t, l) => `translateY(${-Math.min(l, 2) * 10}px)` });
    track(textBox(S, 540, 760, 800, 'إِنْ شَاءَ اللَّهُ', 'ar arbig'), 73.4, 74.9, { a: 'pop' });
    track(box(S, 290, 960, 400, 110, '<span class="bn">নিয়ত ঠিক</span>', 'chip', { position: 'absolute' }), 72.3, 74.9, { a: 'left' });
    track(box(S, 790, 960, 400, 110, '<span class="bn">জীবন ঠিক</span>', 'chip', { position: 'absolute' }), 73.0, 74.9, { a: 'right' });

    S = scene(74.8, 78.1);
    track(box(S, 540, 330, 600, 600, ART.halo()), 74.8, 78.1, { a: 'fade' });
    track(textBox(S, 540, 330, 900, 'এই ছিল আজকের হাদিস', 'bn title'), 74.9, 78.1, { a: 'pop' });
    [['like', 'লাইক', 240, 76.3], ['comment', 'কমেন্ট', 540, 76.6], ['share', 'শেয়ার', 840, 76.3]].forEach(([art, label, x, st]) => {
      const b = box(S, x, 780, 240, 260, `<div style="width:150px;height:150px;border-radius:50%;border:4px solid #e3c26b;background:rgba(4,32,27,.85);display:flex;align-items:center;justify-content:center"><div style="width:90px;height:90px">${ART[art]()}</div></div><div class="bn">${label}</div>`, 'btn');
      track(b, st, 78.1, { a: 'pop', i: 0.4, fn: art === 'share' ? pulse(0.06, 6) : null });
    });

    // 12. Final 78 – end
    S = scene(78, DUR + 1);
    for (let i = 0; i < 3; i++) track(box(S, 540, 330, 480, 480, null, 'ringfx'), 78, DUR + 1, { i: 0.3, fn: ringPulse(2.2, i * 0.73) });
    track(iconTile(S, 540, 330, 400), 78.0, DUR + 1, { a: 'pop', i: 0.6, fn: pulse(0.025, 3) });
    track(textBox(S, 540, 640, 980, 'ইসলামী বিশ্বকোষ ও আল হাদিস S2', 'bn h2', { fontSize: '62px' }), 78.4, DUR + 1, { a: 'rise' });
    track(box(S, 540, 790, 600, 110, '<span class="bn">আজই ইনষ্টল করুন</span>', 'chip', { position: 'absolute' }), 78.9, DUR + 1, { a: 'pop', fn: pulse(0.03, 4) });
    // badge: crop to black button (source 646x250, button ≈ x 42..604, y 42..208)
    const bw = 560, scale = bw / 562;
    const badge = box(S, 540, 1010, bw, Math.round(166 * scale), `<img src="google-play-badge.jpg" alt="" style="width:${646 * scale}px;left:${-42 * scale}px;top:${-42 * scale}px">`, 'badge');
    track(badge, 79.3, DUR + 1, { a: 'rise', i: 0.6, fn: pulse(0.03, 3.5) });
  }

  // ---------- brand bar ----------
  function brandBar() {
    track($('brand'), 2.5, 78, { a: 'drop', i: 0.5, o: 0.4 });
  }

  window.renderAt = function (t) {
    renderBackground(t);
    for (let i = 0; i < TRACKS.length; i++) applyTrack(TRACKS[i], t);
  };
  window.__DURATION = DUR;

  async function init() {
    buildBackground();
    brandBar();
    buildScenes();
    buildSubtitles();
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    await Promise.all([...document.images].map(img => img.decode ? img.decode().catch(() => {}) : Promise.resolve()));
    window.renderAt(0);
    window.__ready = true;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
