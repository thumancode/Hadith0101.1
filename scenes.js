/* scenes.js — deterministic timeline engine + every scene. Exposes window.renderAt(t).
   Nothing here uses setTimeout / CSS animation / requestAnimationFrame / Date.now / Math.random. */
(function () {
  'use strict';
  const W = 1080, H = 1920, FPS = 30;
  const DUR = Math.ceil(LINES[LINES.length - 1].e);
  const APP = 'ইসলামী বিশ্বকোষ ও আল হাদিস S2';

  /* ---------------- math / easing ---------------- */
  const clamp = (x, a, b) => Math.min(b === undefined ? 1 : b, Math.max(a === undefined ? 0 : a, x));
  const easeOut = (p) => 1 - Math.pow(1 - p, 3);
  const easeInOut = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
  const easeBack = (p) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };
  const lerp = (a, b, p) => a + (b - a) * p;
  function mulberry32(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const R = mulberry32(20261013);

  /* ---------------- DOM helpers ---------------- */
  const root = document.getElementById('root');
  const IMGS = [];
  function D(parent, cls, css, html) {
    const d = document.createElement('div');
    if (!cls && css && css.indexOf('left:') >= 0) cls = 'abs';
    if (cls) d.className = cls;
    if (css) d.style.cssText = css;
    if (html != null) d.innerHTML = html;
    parent.appendChild(d);
    return d;
  }
  const SV = (p, svg, x, y, w, h, css) => D(p, 'sv', 'left:' + x + 'px;top:' + y + 'px;width:' + w + 'px;height:' + h + 'px;' + (css || ''), svg);
  const TX = (p, html, cls, x, y, w, css) => D(p, 'tx ' + cls, 'left:' + x + 'px;top:' + y + 'px;width:' + w + 'px;' + (css || ''), html);
  function CARD(p, x, y, w, h, css) {
    const c = D(p, 'card', 'left:' + x + 'px;top:' + y + 'px;width:' + w + 'px;height:' + h + 'px;' + (css || ''));
    [[-24, -24], [w - 24, -24], [-24, h - 24], [w - 24, h - 24]].forEach((o) => SV(c, ART.star8(), o[0], o[1], 48, 48));
    return c;
  }
  function CHIP(p, text, x, y, w, h, fs, cls) { return D(p, 'chip ' + (cls || ''), 'left:' + x + 'px;top:' + y + 'px;width:' + w + 'px;height:' + h + 'px;font-size:' + fs + 'px', text); }
  function HALO(p, cx, cy, size, rgb, a) {
    return D(p, 'circ', 'left:' + (cx - size / 2) + 'px;top:' + (cy - size / 2) + 'px;width:' + size + 'px;height:' + size + 'px;background:radial-gradient(closest-side,rgba(' + rgb + ',' + (a || 0.6) + '),rgba(' + rgb + ',0))');
  }
  function ICON(p, x, y, s) {
    const b = D(p, 'iconbox', 'left:' + x + 'px;top:' + y + 'px;width:' + s + 'px;height:' + s + 'px');
    const im = document.createElement('img'); im.src = 'app-icon.jpg'; b.appendChild(im); IMGS.push(im);
    return b;
  }
  function BADGE(p, x, y, w) {
    const bx = 41, by = 41, bw = 564, bh = 166, k = w / bw;
    const b = D(p, 'badgebox', 'left:' + x + 'px;top:' + y + 'px;width:' + w + 'px;height:' + (bh * k) + 'px;border-radius:' + (26 * k) + 'px');
    const im = document.createElement('img'); im.src = 'google-play-badge.jpg';
    im.style.cssText = 'width:' + (646 * k) + 'px;height:' + (250 * k) + 'px;left:' + (-bx * k) + 'px;top:' + (-by * k) + 'px';
    b.appendChild(im); IMGS.push(im);
    return b;
  }

  /* ---------------- tracks (all time-driven) ---------------- */
  const tracks = [];
  function tr(el, s, e, o) {
    o = o || {};
    el.style.visibility = 'hidden'; el.style.opacity = '0';
    tracks.push({ el, s, e, a: o.a || 'fade', i: o.i === undefined ? 0.45 : o.i, o: o.o === undefined ? 0.3 : o.o, fn: o.fn || null, base: o.base || '', state: 0 });
    return el;
  }
  function runTrack(k, t) {
    if (t < k.s || t >= k.e) { if (k.state !== 0) { k.el.style.visibility = 'hidden'; k.state = 0; } return; }
    const pin = k.i > 0 ? clamp((t - k.s) / k.i) : 1;
    const pout = k.o > 0 ? clamp((k.e - t) / k.o) : 1;
    const ei = easeOut(pin);
    let a = ei * easeOut(pout), tf = '';
    switch (k.a) {
      case 'rise': tf = 'translateY(' + ((1 - ei) * 50).toFixed(1) + 'px)'; break;
      case 'drop': tf = 'translateY(' + (-(1 - ei) * 50).toFixed(1) + 'px)'; break;
      case 'pop': tf = 'scale(' + (0.55 + 0.45 * easeBack(pin)).toFixed(4) + ')'; break;
      case 'zoom': tf = 'scale(' + (1.3 - 0.3 * ei).toFixed(4) + ')'; break;
      case 'left': tf = 'translateX(' + (-(1 - ei) * 90).toFixed(1) + 'px)'; break;
      case 'right': tf = 'translateX(' + ((1 - ei) * 90).toFixed(1) + 'px)'; break;
      default: break;
    }
    if (k.fn) {
      const r = k.fn(t, pin, k.el);
      if (r) { if (typeof r === 'string') tf += ' ' + r; else { if (r.tf) tf += ' ' + r.tf; if (r.a !== undefined) a *= r.a; } }
    }
    k.el.style.visibility = 'inherit'; k.state = 1;
    k.el.style.opacity = a.toFixed(3);
    k.el.style.transform = (k.base + ' ' + tf).trim();
  }

  /* word-by-word reveal (Bengali + Arabic). Hidden words keep their layout space (opacity only). */
  const WT = [];
  const strip = (s) => s.replace(/[ؐ-ًؚ-ٰٟۖ-ۭ]/g, '');
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/[❝❞]/g, (m) => '<span class="q">' + m + '</span>');
  function words(parent, text, cls, css, s, e, hl) {
    const box = D(parent, cls, css);
    const ws = text.split(/\s+/).filter(Boolean);
    const wt = ws.map((x) => Math.max(1, strip(x).length));
    const tot = wt.reduce((a, b) => a + b, 0);
    let acc = 0;
    ws.forEach((x, i) => {
      const sp = document.createElement('span');
      sp.className = 'w' + (hl && hl(x) ? ' hl' : '');
      sp.innerHTML = esc(x);
      box.appendChild(sp);
      if (i < ws.length - 1) box.appendChild(document.createTextNode(' '));
      WT.push({ sp, s: s + (e - s) * acc / tot, last: -1 });
      acc += wt[i];
    });
    return box;
  }
  const HL_STEMS = ['আল্লাহ', 'নিয়ত', 'হাদিস', 'ইবাদত', 'শেয়ার', 'ইনস্টল', 'ইসলামী', 'বিশ্বকোষ', 'S2', 'রাসুলুল্লাহ'];
  const hlBn = (w) => HL_STEMS.some((s) => w.indexOf(s) >= 0);

  /* ---------------- emotion colours ---------------- */
  const EMO = {
    respectful: [227, 194, 107], informative: [72, 200, 170], solemn: [120, 130, 230], serious: [225, 120, 70],
    calm: [90, 190, 220], thoughtful: [170, 130, 230], warm: [240, 170, 70], compassionate: [235, 130, 160],
    optimistic: [255, 214, 90], friendly: [140, 220, 110], encouraging: [255, 160, 70], store: [227, 194, 107]
  };
  const emo = (tag) => EMO[tag] || EMO.informative;

  /* ---------------- persistent background ---------------- */
  const bgPat = D(root, 'abs', 'left:0;top:0;width:1080px;height:1920px;opacity:.07;background-image:' + ART.tileURI() + ';background-size:120px 120px');
  const bgMed = SV(root, ART.medallion(), -210, 130, 1500, 1500, 'opacity:.085');
  const bgGlow = D(root, 'circ', 'left:-160px;top:160px;width:1400px;height:1400px');
  const dust = [];
  const dustBox = D(root, 'abs', 'left:0;top:0;width:1080px;height:1920px');
  for (let i = 0; i < 46; i++) {
    const sz = 4 + R() * 6;
    dust.push({ el: D(dustBox, 'circ', 'width:' + sz + 'px;height:' + sz + 'px;background:#f8e7ae;box-shadow:0 0 ' + (sz * 2) + 'px #e3c26b'), x: R() * W, y: R() * H, sp: 14 + R() * 26, am: 14 + R() * 30, f: 0.3 + R() * 0.7, ph: R() * 6.28, tw: 0.6 + R() * 1.4 });
  }
  const lanternL = SV(root, ART.lantern(), 22, -4, 80, 205, 'transform-origin:50% 0');
  const lanternR = SV(root, ART.lantern(), 978, -4, 80, 205, 'transform-origin:50% 0');
  SV(root, ART.skyline(), 0, 1750, 1080, 170, 'opacity:.95');
  D(root, 'abs', 'left:0;top:0;width:1080px;height:1920px;background:radial-gradient(ellipse at 50% 46%,rgba(0,0,0,0) 48%,rgba(0,0,0,.55) 100%)');
  D(root, 'abs', 'left:0;top:26px;width:1080px;height:3px;background:linear-gradient(90deg,rgba(227,194,107,0),#e3c26b,rgba(227,194,107,0))');
  D(root, 'abs', 'left:0;top:1892px;width:1080px;height:3px;background:linear-gradient(90deg,rgba(227,194,107,0),#e3c26b,rgba(227,194,107,0))');

  const stage = D(root, 'abs', 'left:0;top:215px;width:1080px;height:1200px');

  /* brand bar */
  const brand = D(root, '', '', null); brand.id = 'brand';
  { const b = D(brand, 'iconbox', 'position:relative;width:104px;height:104px;flex:none');
    const im = document.createElement('img'); im.src = 'app-icon.jpg'; b.appendChild(im); IMGS.push(im);
    D(brand, '', 'flex:none', '<div class="nm">' + APP + '</div><div class="tg">আজকের হাদিস</div>'); }
  tr(brand, 3.3, 77.4, { i: 0.5, o: 0.4 });

  /* subtitle panel (always on) */
  const panel = D(root, 'panel');
  LINES.forEach((L, i) => {
    const last = i === LINES.length - 1;
    const c = D(panel, 'sub');
    tr(c, i === 0 ? 0 : L.s, last ? DUR + 0.5 : L.e, { i: i === 0 ? 0 : 0.16, o: last ? 0 : 0.16 });
    const long = L.text.length > 62;
    words(c, L.text, 'st', 'font-size:' + (long ? 52 : 60) + 'px', (i === 0 ? -0.15 : L.s + 0.05), L.s + 0.05 + (L.e - L.s) * 0.84, hlBn);
  });

  /* progress bar */
  const ptrack = D(root, 'ptrack'); const pfill = D(ptrack, 'pfill');

  /* ---------------- scene factory ---------------- */
  function scene(s, e, o) {
    o = o || {};
    const S = Math.max(0, s - (o.pre === undefined ? 0.2 : o.pre)), E = e + (o.post === undefined ? 0.2 : o.post);
    const el = D(stage, 'scn');
    tr(el, S, E, { i: o.i === undefined ? 0.35 : o.i, o: o.o === undefined ? 0.35 : o.o });
    return { el, s, e, S, E, add: (node, ts, opt, te) => tr(node, ts, te === undefined ? E : te, Object.assign({ o: 0, i: 0.45 }, opt || {})) };
  }
  const POPT = { a: 'pop', i: 0.6 };

  /* Arabic strings */
  const AR = {
    salam1: 'السَّلَامُ عَلَيْكُمْ', salam2: 'وَرَحْمَةُ اللَّهِ',
    title: 'حَدِيثُ الْيَوْمِ',
    alqama: 'عَلْقَمَةُ بْنُ وَقَّاصٍ اللَّيْثِيُّ', rahma: 'رَحْمَةُ اللَّهِ عَلَيْهِ',
    umar: 'عُمَرُ بْنُ الْخَطَّابِ', ra: 'رَضِيَ اللَّهُ عَنْهُ',
    said: 'قَالَ رَسُولُ اللَّهِ', saw: 'صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ',
    hA: 'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ', hB: 'وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
    hC: 'فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى دُنْيَا يُصِيبُهَا أَوْ إِلَى امْرَأَةٍ يَنْكِحُهَا فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ',
    num: 'الْحَدِيثُ رَقْمُ ١', allah: 'اللَّهُ', ibadah: 'عِبَادَة', insha: 'إِنْ شَاءَ اللَّهُ'
  };

  /* =====================================================================
     S1  0 – 3.3   greeting: app icon + rings + Arabic salam
     ===================================================================== */
  { const sc = scene(0, 3.3, { pre: 0, i: 0 }), A = sc.add;
    A(HALO(sc.el, 540, 430, 900, '227,194,107', 0.45), 0, { i: 0 });
    for (let k = 0; k < 3; k++) {
      A(D(sc.el, 'ring', 'left:310px;top:200px;width:460px;height:460px'), 0, { i: 0, fn: (t) => { const ph = ((t * 0.55) + k / 3) % 1; return { tf: 'scale(' + (1 + ph * 0.85).toFixed(3) + ')', a: (1 - ph) * 0.8 }; } });
    }
    A(ICON(sc.el, 330, 220, 420), 0, { i: 0, fn: (t) => 'scale(' + (1 + 0.02 * Math.sin(t * 4)).toFixed(4) + ')' });
    const c = CARD(sc.el, 90, 760, 900, 360); A(c, 0, { i: 0 });
    A(words(c, AR.salam1, 'tx ar glowt', 'left:30px;top:30px;width:840px;font-size:104px', -0.1, 1.7), 0, { i: 0 });
    A(words(c, AR.salam2, 'tx ar gold', 'left:30px;top:190px;width:840px;font-size:92px', 1.7, 3.0), 0, { i: 0 });
    A(SV(sc.el, ART.divider(), 340, 1160, 400, 40), 0.6, { a: 'fade' });
  }

  /* =====================================================================
     S2  3.3 – 6.1  title
     ===================================================================== */
  { const sc = scene(3.3, 6.1), A = sc.add;
    A(SV(sc.el, ART.medallion(), 190, 60, 700, 700, 'opacity:.55'), 3.3, { i: 0.6, fn: (t) => 'rotate(' + (t * 6).toFixed(2) + 'deg)' });
    A(HALO(sc.el, 540, 400, 820, '248,231,174', 0.5), 3.3);
    A(SV(sc.el, ART.book(), 220, 250, 640, 416), 3.5, POPT);
    A(TX(sc.el, AR.title, 'ar gold glowt', 40, 690, 1000, 'font-size:140px'), 3.7, { a: 'rise', i: 0.6 });
    A(TX(sc.el, 'আজকের হাদিস', 'bn glowt', 40, 900, 1000, 'font-size:84px'), 4.3, { a: 'rise', i: 0.6 });
    A(SV(sc.el, ART.divider(), 340, 1050, 400, 40), 4.7, { a: 'fade' });
  }

  /* =====================================================================
     S3  6.1 – 9.4  narrator (Alqama) + chain of narration
     ===================================================================== */
  { const sc = scene(6.1, 9.4), A = sc.add;
    const c = CARD(sc.el, 70, 70, 940, 460); A(c, 6.2, { a: 'rise' });
    A(words(c, AR.alqama, 'tx ar glowt', 'left:30px;top:50px;width:880px;font-size:80px', 6.4, 8.0), 6.2, { i: 0 });
    A(words(c, AR.rahma, 'tx ar gold', 'left:30px;top:290px;width:880px;font-size:62px', 8.0, 9.0), 6.2, { i: 0 });
    A(SV(sc.el, ART.divider(), 340, 590, 400, 40), 6.6);
    // chain of narration
    const nodes = [190, 540, 890];
    const n1 = D(sc.el, 'circ', 'left:115px;top:760px;width:150px;height:150px;background:linear-gradient(180deg,#f8e7ae,#a67c28);border:4px solid #f8e7ae;box-shadow:0 0 50px rgba(248,231,174,.7)');
    SV(n1, '<svg viewBox="0 0 100 100" width="100%" height="100%">' + ART.poly8(50, 50, 46, 'fill="#06241e"', 0) + '</svg>', 32, 32, 86, 86);
    A(n1, 6.5, POPT);
    const n2 = D(sc.el, 'circ', 'left:465px;top:760px;width:150px;height:150px;background:rgba(4,32,27,.9);border:4px solid #e3c26b;box-shadow:0 0 30px rgba(227,194,107,.35)');
    SV(n2, ART.star8(), 32, 32, 86, 86);
    A(n2, 7.6, POPT);
    const n3 = D(sc.el, 'circ', 'left:815px;top:760px;width:150px;height:150px;background:rgba(4,32,27,.9);border:4px solid #e3c26b;box-shadow:0 0 30px rgba(227,194,107,.35);overflow:hidden');
    SV(n3, ART.dome(), 28, 22, 96, 108);
    A(n3, 8.7, POPT);
    [[265, 6.9], [615, 8.1]].forEach((l) => {
      const ln = D(sc.el, '', 'left:' + l[0] + 'px;top:832px;width:0;height:0;border-top:6px dashed #e3c26b');
      A(ln, l[1], { i: 0, fn: (t) => { ln.style.width = (200 * easeOut(clamp((t - l[1]) / 0.5))).toFixed(1) + 'px'; } });
    });
    A(TX(sc.el, 'عَلْقَمَةُ', 'ar goldL', 90, 930, 200, 'font-size:56px'), 6.9, { a: 'rise' });
    A(TX(sc.el, 'عُمَرُ', 'ar goldL', 440, 930, 200, 'font-size:56px'), 7.9, { a: 'rise' });
  }

  /* =====================================================================
     S4  9.4 – 14.75  Umar on the minbar
     ===================================================================== */
  { const sc = scene(9.4, 14.75), A = sc.add;
    A(HALO(sc.el, 560, 640, 1000, '248,231,174', 0.38), 9.5);
    const c = CARD(sc.el, 80, 0, 920, 220); A(c, 9.5, { a: 'drop' });
    A(words(c, AR.umar, 'tx ar glowt', 'left:20px;top:10px;width:880px;font-size:76px', 9.7, 11.2), 9.5, { i: 0 });
    A(words(c, AR.ra, 'tx ar gold', 'left:20px;top:112px;width:880px;font-size:54px', 11.2, 12.2), 9.5, { i: 0 });
    A(SV(sc.el, ART.minbar(), 230, 290, 620, 868), 9.9, { a: 'rise', i: 0.7 });
    A(HALO(sc.el, 735, 515, 380, '255,236,170', 0.55), 12.0, { fn: (t) => 'scale(' + (1 + 0.06 * Math.sin(t * 5)).toFixed(3) + ')' });
    // speech waves
    [[190, 0], [300, 0.33], [410, 0.66]].forEach((w) => {
      A(D(sc.el, 'arc', 'left:' + (735 - w[0] / 2) + 'px;top:' + (500 - w[0] / 2) + 'px;width:' + w[0] + 'px;height:' + w[0] + 'px'), 12.3, { i: 0.2, fn: (t) => { const ph = (((t - 12.3) * 0.7) + w[1]) % 1; return { tf: 'scale(' + (0.7 + ph * 0.55).toFixed(3) + ')', a: Math.sin(ph * Math.PI) }; } });
    });
  }

  /* =====================================================================
     S5  14.75 – 18.35  "the Messenger of Allah ﷺ said"
     ===================================================================== */
  { const sc = scene(14.75, 18.35), A = sc.add;
    A(SV(sc.el, ART.rays({ n: 20, r1: 110, hw: 4 }), 190, -90, 700, 700, 'opacity:.16'), 14.8, { i: 0.6, fn: (t) => 'rotate(' + (t * 7).toFixed(2) + 'deg)' });
    A(HALO(sc.el, 540, 250, 760, '120,240,150', 0.45), 14.8);
    A(SV(sc.el, ART.dome(), 340, 20, 400, 453), 14.9, POPT);
    const c = CARD(sc.el, 70, 580, 940, 480); A(c, 15.0, { a: 'rise' });
    A(words(c, AR.said, 'tx ar glowt', 'left:30px;top:50px;width:880px;font-size:104px', 15.2, 16.5), 15.0, { i: 0 });
    A(words(c, AR.saw, 'tx ar gold', 'left:30px;top:250px;width:880px;font-size:80px', 16.5, 18.0), 15.0, { i: 0 });
    A(SV(sc.el, ART.divider(), 340, 1120, 400, 40), 15.6);
  }

  /* =====================================================================
     S6a  18.35 – 23.05  "Innamal a'malu bin-niyyat"
     ===================================================================== */
  { const sc = scene(18.35, 23.05), A = sc.add;
    A(SV(sc.el, ART.medallion(), 130, 90, 820, 820, 'opacity:.3'), 18.4, { fn: (t) => 'rotate(' + (-t * 5).toFixed(2) + 'deg)' });
    const c = CARD(sc.el, 60, 120, 960, 470); A(c, 18.4, { a: 'rise' });
    A(words(c, AR.hA, 'tx ar glowt', 'left:30px;top:40px;width:900px;font-size:114px', 18.5, 20.3), 18.4, { i: 0 });
    A(CHIP(sc.el, 'কাজ', 70, 720, 330, 150, 80), 20.6, POPT);
    A(SV(sc.el, ART.arrowBoth(), 410, 735, 260, 78), 21.3, { a: 'fade' });
    A(CHIP(sc.el, 'নিয়ত', 680, 720, 330, 150, 80, 'chipG'), 21.0, POPT);
    A(TX(sc.el, 'الْعَمَلُ', 'ar goldL', 70, 900, 330, 'font-size:64px'), 20.9, { a: 'rise' });
    A(TX(sc.el, 'النِّيَّةُ', 'ar goldL', 680, 900, 330, 'font-size:64px'), 21.3, { a: 'rise' });
  }

  /* =====================================================================
     S6b  23.05 – 28.10  "Wa innama li-kulli imri'in ma nawa"
     ===================================================================== */
  { const sc = scene(23.05, 28.10), A = sc.add;
    A(SV(sc.el, ART.medallion(), 130, 90, 820, 820, 'opacity:.3'), 23.1, { fn: (t) => 'rotate(' + (t * 5).toFixed(2) + 'deg)' });
    const c = CARD(sc.el, 60, 120, 960, 470); A(c, 23.1, { a: 'rise' });
    A(words(c, AR.hB, 'tx ar glowt', 'left:30px;top:40px;width:900px;font-size:114px', 23.2, 25.1), 23.1, { i: 0 });
    A(CHIP(sc.el, 'নিয়ত', 70, 720, 330, 150, 80), 25.4, POPT);
    A(SV(sc.el, ART.arrowR(), 410, 735, 260, 98), 26.0, { a: 'left' });
    A(CHIP(sc.el, 'ফল', 680, 720, 330, 150, 80, 'chipG'), 26.4, POPT);
    A(TX(sc.el, 'النِّيَّةُ', 'ar goldL', 70, 900, 330, 'font-size:64px'), 25.7, { a: 'rise' });
    A(TX(sc.el, 'مَا نَوَى', 'ar goldL', 680, 900, 330, 'font-size:64px'), 26.7, { a: 'rise' });
  }

  /* =====================================================================
     S6c  28.10 – 35.10  hijra for the world / a woman / the intended goal
     ===================================================================== */
  { const sc = scene(28.10, 35.10), A = sc.add;
    const c = CARD(sc.el, 50, 10, 980, 470); A(c, 28.15, { a: 'rise' });
    A(words(c, AR.hC, 'tx ar glowt', 'left:30px;top:34px;width:920px;font-size:70px', 28.3, 34.8), 28.15, { i: 0 });
    const tiles = [
      { x: 60, t: 29.3, ar: 'دُنْيَا', bn: 'দুনিয়া' }, { x: 395, t: 30.9, ar: 'امْرَأَةٌ', bn: 'নারী' }, { x: 730, t: 32.5, ar: 'هِجْرَةٌ', bn: 'হিজরত' }
    ];
    tiles.forEach((tl, i) => {
      const k = CARD(sc.el, tl.x, 540, 290, 560); A(k, tl.t, POPT);
      if (i === 0) SV(k, ART.coins(), 35, 70, 220, 195);
      if (i === 1) SV(k, ART.ring(), 45, 60, 200, 212);
      if (i === 2) {
        SV(k, '<svg viewBox="0 0 300 260" width="100%" height="100%" style="overflow:visible">' + ART.nest('kaaba', 10, 130, 120, 110) + ART.nest('dome', 150, 20, 120, 136) + ART.nest('mapPath', 20, 0, 260, 225) + '</svg>', 15, 60, 260, 225);
      }
      TX(k, tl.ar, 'ar gold glowt', 10, 330, 270, 'font-size:66px');
      TX(k, tl.bn, 'bn', 10, 440, 270, 'font-size:52px');
    });
  }

  /* =====================================================================
     S7  35.10 – 38.57  source: Sahih al-Bukhari, hadith 1
     ===================================================================== */
  { const sc = scene(35.10, 38.57), A = sc.add;
    A(HALO(sc.el, 540, 470, 1000, '248,231,174', 0.4), 35.2);
    A(SV(sc.el, ART.bookCover(), 240, 40, 600, 840), 35.25, { a: 'pop', i: 0.7 });
    A(SV(sc.el, ART.rays({ n: 24, r1: 190, hw: 3 }), 40, -60, 1000, 1000, 'opacity:.18'), 35.3, { fn: (t) => 'rotate(' + (t * 5).toFixed(2) + 'deg)' });
    A(D(sc.el, 'chip chipG', 'left:140px;top:960px;width:800px;height:150px;font-family:var(--far);direction:rtl;font-size:84px;font-weight:400', AR.num), 36.4, POPT);
  }

  /* =====================================================================
     S8  38.57 – 50.6  think: two people, same act, different intentions
     ===================================================================== */
  { const sc = scene(38.57, 50.6), A = sc.add;
    const sep = (t) => easeInOut(clamp((t - 48.3) / 0.9));
    // light bulb
    A(SV(sc.el, ART.rays({ n: 18, r1: 120, hw: 4 }), 320, -20, 440, 440, 'opacity:.3'), 38.6, { o: 0.5, fn: (t) => 'rotate(' + (t * 9).toFixed(2) + 'deg)' }, 45.7);
    A(HALO(sc.el, 540, 190, 520, '255,226,122', 0.6), 38.6, { o: 0.5 }, 45.7);
    A(SV(sc.el, ART.bulb(), 410, 40, 260, 338), 38.7, { a: 'pop', i: 0.6, o: 0.5, fn: (t) => 'scale(' + (1 + 0.03 * Math.sin(t * 4)).toFixed(3) + ')' }, 45.7);
    // mat 1 (for Allah) + beam
    const grp1 = (t) => ({ tf: 'translateY(' + (-170 * sep(t)).toFixed(1) + 'px)' });
    A(D(sc.el, '', 'left:140px;top:300px;width:220px;height:290px;background:linear-gradient(0deg,rgba(255,236,170,.75),rgba(255,236,170,0));clip-path:polygon(34% 0,66% 0,100% 100%,0 100%)'), 41.5, { fn: (t) => grp1(t) });
    A(SV(sc.el, ART.rug(), 135, 580, 230, 360), 39.9, { a: 'pop', fn: (t) => grp1(t) });
    A(TX(sc.el, AR.allah, 'ar gold glowt', 100, 300, 300, 'font-size:96px'), 41.6, { a: 'rise', fn: (t) => grp1(t) });
    // mat 2 (to be seen by people) + eyes
    const grp2 = (t) => ({ tf: 'translateY(' + (170 * sep(t)).toFixed(1) + 'px)' });
    A(SV(sc.el, ART.rug(), 715, 580, 230, 360), 40.5, { a: 'pop', fn: (t) => grp2(t) });
    [[640, 480], [760, 440], [880, 480]].forEach((e, i) => {
      const eye = SV(sc.el, ART.eye(), e[0] - 60, e[1], 120, 72);
      const iris = eye.querySelector('.iris');
      A(eye, 43.4 + i * 0.15, { a: 'pop', fn: (t) => { iris.setAttribute('transform', 'translate(' + (Math.sin(t * 3 + i) * 14).toFixed(1) + ' 8)'); return grp2(t); } });
    });
    A(TX(sc.el, 'মানুষ', 'bn glowt', 680, 330, 300, 'font-size:76px'), 43.6, { a: 'rise', fn: (t) => grp2(t) });
    // "outwardly the same"
    A(D(sc.el, '', 'left:365px;top:757px;width:110px;height:0;border-top:5px dashed #e3c26b'), 45.7, { o: 0.4, fn: () => '' }, 48.3);
    A(D(sc.el, '', 'left:605px;top:757px;width:110px;height:0;border-top:5px dashed #e3c26b'), 45.7, { o: 0.4 }, 48.3);
    const eq = D(sc.el, 'circ', 'left:475px;top:690px;width:130px;height:130px;background:rgba(4,32,27,.92);border:4px solid #e3c26b;box-shadow:0 0 40px rgba(227,194,107,.5)');
    SV(eq, ART.equals(), 25, 30, 80, 64);
    A(eq, 45.9, { a: 'pop', o: 0.4 }, 48.3);
    // sky vs earth
    A(SV(sc.el, '<svg viewBox="0 0 60 640" width="100%" height="100%"><path d="M30 40V600" stroke="#e3c26b" stroke-width="9" stroke-linecap="round"/><polygon points="30,0 6,44 54,44" fill="#e3c26b"/><polygon points="30,640 6,596 54,596" fill="#e3c26b"/></svg>', 510, 330, 60, 640), 48.8, { a: 'fade' });
    A(CHIP(sc.el, 'আকাশ', 410, 200, 260, 110, 62, 'chipG'), 48.5, POPT);
    A(CHIP(sc.el, 'পাতাল', 410, 1070, 260, 110, 62), 48.9, POPT);
    [[60, 220, 26], [330, 120, 18], [120, 380, 14], [400, 300, 20]].forEach((st, i) => A(SV(sc.el, ART.star8(), st[0], st[1], st[2], st[2]), 48.5 + i * 0.1, { a: 'pop' }));
  }

  /* =====================================================================
     S9  50.6 – 57.9  prayer / fasting / charity / sleep → ibadah
     ===================================================================== */
  { const sc = scene(50.6, 57.9), A = sc.add;
    const defsC = [
      { x: 60, y: 40, t: 50.7, art: 'rug', w: 130, h: 202, bn: 'নামাজ', ar: 'الصَّلَاةُ' },
      { x: 560, y: 40, t: 52.0, art: 'fasting', w: 190, h: 178, bn: 'রোজা', ar: 'الصَّوْمُ' },
      { x: 60, y: 520, t: 53.4, art: 'charity', w: 176, h: 198, bn: 'দান', ar: 'الصَّدَقَةُ' },
      { x: 560, y: 520, t: 54.6, art: 'sleep', w: 190, h: 190, bn: 'ঘুম', ar: 'النَّوْمُ' }
    ];
    defsC.forEach((d) => {
      const k = CARD(sc.el, d.x, d.y, 460, 440);
      SV(k, ART[d.art](), (460 - d.w) / 2, 24 + (200 - d.h) / 2, d.w, d.h);
      TX(k, d.bn, 'bn glowt', 10, 232, 440, 'font-size:76px');
      TX(k, d.ar, 'ar gold', 10, 338, 440, 'font-size:58px');
      const cx = d.x + 230, cy = d.y + 220;
      A(k, d.t, { a: 'pop', i: 0.55, fn: (t) => {
        const g = clamp((t - 55.2) / 0.4);
        k.style.boxShadow = '0 0 ' + (30 + 90 * g).toFixed(0) + 'px rgba(248,231,174,' + (0.25 + 0.65 * g).toFixed(2) + ')';
        k.style.borderColor = g > 0.5 ? '#fff3c4' : '#e3c26b';
        const m = easeInOut(clamp((t - 55.8) / 0.7));
        return { tf: 'translate(' + ((540 - cx) * m).toFixed(1) + 'px,' + ((505 - cy) * m).toFixed(1) + 'px) scale(' + (1 - 0.7 * m).toFixed(3) + ')', a: 1 - clamp((m - 0.6) / 0.4) };
      } }, 56.6);
    });
    A(SV(sc.el, ART.burst(), 140, 305, 800, 400), 56.2, { i: 0.2, o: 0.5, fn: (t) => ({ tf: 'scale(' + (0.5 + 0.9 * clamp((t - 56.2) / 0.9)).toFixed(3) + ') rotate(' + ((t - 56.2) * 30).toFixed(1) + 'deg)', a: 1 - clamp((t - 56.4) / 1.0) }) }, 57.6);
    const bad = D(sc.el, '', 'left:240px;top:225px;width:600px;height:560px');
    SV(bad, '<svg viewBox="0 0 400 400" width="100%" height="100%">' + ART.poly8(200, 200, 196, 'fill="url(#gGold)"', 0) + ART.poly8(200, 200, 196, 'fill="none" stroke="#a67c28" stroke-width="3"', 22.5) + '<circle cx="200" cy="200" r="150" fill="#06241e" stroke="#f8e7ae" stroke-width="5"/></svg>', 0, -20, 600, 600);
    TX(bad, AR.ibadah, 'ar gold glowt', 60, 130, 480, 'font-size:140px');
    TX(bad, 'ইবাদত', 'bn glowt', 60, 320, 480, 'font-size:84px');
    A(bad, 56.3, { a: 'pop', i: 0.6, fn: (t) => 'scale(' + (1 + 0.02 * Math.sin(t * 4)).toFixed(3) + ')' });
    const ni = CHIP(sc.el, 'নিয়ত', 270, 930, 540, 150, 84, 'chipG');
    SV(ni, ART.checkDark(), 410, 38, 76, 76, 'left:430px');
    A(ni, 56.9, POPT);
    ni.style.paddingRight = '110px';
  }

  /* =====================================================================
     S10  57.9 – 64.0  heart: world sees the deed, Allah sees the intention
     ===================================================================== */
  { const sc = scene(57.9, 64.0), A = sc.add;
    const mv = (t) => easeInOut(clamp((t - 60.1) / 0.7));
    A(HALO(sc.el, 540, 430, 760, '235,100,130', 0.4), 58.0, { o: 0.4 }, 60.4);
    A(SV(sc.el, ART.heart(), 350, 250, 380, 361), 57.95, { a: 'pop', i: 0.7, fn: (t) => {
      const m = mv(t), pulse = 1 + 0.05 * Math.sin(t * 5.5);
      return 'translate(' + (260 * m).toFixed(1) + 'px,' + (130 * m).toFixed(1) + 'px) scale(' + ((1 - 0.21 * m) * pulse).toFixed(4) + ')';
    } });
    A(TX(sc.el, 'অন্তর', 'bn glowt', 290, 690, 500, 'font-size:84px'), 58.4, { a: 'rise', o: 0.3 }, 60.1);
    // eye = the world sees deeds
    const eye = SV(sc.el, ART.eye(), 130, 470, 300, 180); const iris = eye.querySelector('.iris');
    A(eye, 60.3, { a: 'pop', fn: (t) => { iris.setAttribute('transform', 'translate(' + (Math.sin(t * 2.2) * 18).toFixed(1) + ' 0)'); } });
    A(TX(sc.el, 'দুনিয়া', 'bn glowt', 90, 330, 380, 'font-size:84px'), 60.4, { a: 'rise' });
    A(TX(sc.el, 'কাজ', 'bn gold', 90, 700, 380, 'font-size:78px'), 61.0, { a: 'rise' });
    A(D(sc.el, '', 'left:538px;top:330px;width:0;height:470px;border-left:4px dashed rgba(227,194,107,.7)'), 60.6, { a: 'fade' });
    // heart side: Allah sees the intention
    A(SV(sc.el, ART.rays({ n: 18, r1: 80, hw: 4 }), 600, 360, 400, 400, 'opacity:.45'), 62.3, { fn: (t) => 'rotate(' + (t * 20).toFixed(1) + 'deg)' });
    A(TX(sc.el, AR.allah, 'ar gold glowt', 640, 300, 320, 'font-size:104px'), 62.45, { a: 'rise' });
    A(TX(sc.el, 'নিয়ত', 'bn gold glowt', 640, 700, 320, 'font-size:84px'), 63.0, { a: 'rise' });
  }

  /* =====================================================================
     S11  64.0 – 67.6  pause for one second (stopwatch)
     ===================================================================== */
  { const sc = scene(64.0, 67.6), A = sc.add;
    A(HALO(sc.el, 540, 400, 800, '90,190,220', 0.4), 64.05);
    const sw = SV(sc.el, ART.stopwatch(), 320, 110, 440, 528);
    const prog = sw.querySelector('.swProg'), hand = sw.querySelector('.swHand');
    A(sw, 64.1, { a: 'pop', i: 0.6, fn: (t) => {
      const p = clamp((t - 64.4) / 2.9);
      prog.setAttribute('stroke-dashoffset', (364.4 * p).toFixed(1));
      hand.setAttribute('transform', 'rotate(' + (360 * p).toFixed(1) + ' 100 136)');
    } });
    A(SV(sc.el, ART.pause(), 478, 340, 124, 124), 64.8, { a: 'pop', fn: (t) => 'scale(' + (1 + 0.06 * Math.sin(t * 6)).toFixed(3) + ')' });
    for (let k = 0; k < 2; k++) A(D(sc.el, 'ring', 'left:300px;top:100px;width:480px;height:480px;border-width:4px'), 64.6, { i: 0.1, fn: (t) => { const ph = (((t - 64.6) * 0.6) + k / 2) % 1; return { tf: 'scale(' + (1 + ph * 0.7).toFixed(3) + ')', a: (1 - ph) * 0.6 }; } });
    A(CHIP(sc.el, '১ সেকেন্ড', 250, 760, 580, 150, 84, 'chipG'), 65.0, POPT);
  }

  /* =====================================================================
     S12  67.6 – 70.65  "why am I doing this?"
     ===================================================================== */
  { const sc = scene(67.6, 70.65), A = sc.add;
    A(HALO(sc.el, 540, 450, 900, '170,130,230', 0.5), 67.7);
    A(SV(sc.el, ART.question(), 290, 130, 500, 590), 67.8, { a: 'pop', i: 0.7, fn: (t) => 'rotate(' + (Math.sin(t * 2.5) * 3).toFixed(2) + 'deg)' });
    for (let k = 0; k < 4; k++) {
      A(SV(sc.el, ART.star8(), 510, 430, 60, 60), 68.0, { a: 'fade', fn: (t) => { const a = (t * 28 + k * 90) * Math.PI / 180; return 'translate(' + (360 * Math.cos(a)).toFixed(1) + 'px,' + (300 * Math.sin(a) * 0.9).toFixed(1) + 'px)'; } });
    }
    A(CHIP(sc.el, 'কেন', 330, 810, 420, 150, 88, 'chipG'), 69.1, POPT);
  }

  /* =====================================================================
     S13  70.65 – 73.46  fix the intention → life is fixed, in sha Allah
     ===================================================================== */
  { const sc = scene(70.65, 73.46), A = sc.add;
    A(CHIP(sc.el, 'নিয়ত ঠিক', 50, 60, 420, 130, 62), 70.75, POPT);
    A(SV(sc.el, ART.arrowR(), 480, 70, 120, 70), 71.3, { a: 'left' });
    A(CHIP(sc.el, 'জীবন ঠিক', 610, 60, 420, 130, 62, 'chipG'), 71.9, POPT);
    A(HALO(sc.el, 540, 540, 900, '255,214,90', 0.5), 70.8);
    const sr = SV(sc.el, ART.sunrise(), 190, 280, 700, 420); const sun = sr.querySelector('.sun');
    A(sr, 70.8, { a: 'rise', fn: (t) => { const k = easeOut(clamp((t - 70.9) / 2.4)); sun.setAttribute('transform', 'translate(0 ' + (110 * (1 - k)).toFixed(1) + ')'); } });
    A(TX(sc.el, AR.insha, 'ar gold glowt', 40, 790, 1000, 'font-size:128px'), 72.7, { a: 'rise' });
    A(SV(sc.el, ART.divider(), 340, 1010, 400, 40), 73.0);
  }

  /* =====================================================================
     S14  73.46 – 75.57  that was today's hadith
     ===================================================================== */
  { const sc = scene(73.46, 75.57), A = sc.add;
    A(HALO(sc.el, 540, 400, 900, '248,231,174', 0.5), 73.5);
    A(SV(sc.el, ART.book(), 230, 170, 620, 403), 73.55, POPT);
    A(SV(sc.el, ART.burst(), 340, 40, 400, 400, 'opacity:.55'), 73.7, { fn: (t) => 'rotate(' + (t * 12).toFixed(1) + 'deg)' });
    A(TX(sc.el, AR.title, 'ar gold glowt', 40, 640, 1000, 'font-size:132px'), 73.9, { a: 'rise' });
    const ck = D(sc.el, 'circ', 'left:430px;top:900px;width:220px;height:220px;background:linear-gradient(180deg,#2bb04f,#0b5a26);border:6px solid #f8e7ae;box-shadow:0 0 50px rgba(120,240,150,.55)');
    SV(ck, ART.check(), 40, 40, 140, 140);
    A(ck, 74.5, POPT);
  }

  /* =====================================================================
     S15  75.57 – 77.5  like / comment / share
     ===================================================================== */
  { const sc = scene(75.57, 77.5), A = sc.add;
    A(HALO(sc.el, 540, 470, 1000, '255,160,70', 0.35), 75.65);
    [[70, 75.75, 'likeIcon'], [400, 76.05, 'commentIcon']].forEach((b) => {
      const c = D(sc.el, 'circ', 'left:' + b[0] + 'px;top:330px;width:280px;height:280px;background:rgba(4,32,27,.9);border:5px solid #e3c26b;box-shadow:0 0 40px rgba(227,194,107,.35)');
      SV(c, ART[b[2]](), 70, 70, 140, 140);
      A(c, b[1], POPT);
    });
    for (let k = 0; k < 3; k++) A(D(sc.el, 'ring', 'left:730px;top:330px;width:280px;height:280px;border-color:#f8e7ae'), 76.5, { i: 0.1, fn: (t) => { const ph = (((t - 76.5) * 0.9) + k / 3) % 1; return { tf: 'scale(' + (1 + ph * 0.8).toFixed(3) + ')', a: (1 - ph) * 0.8 }; } });
    const sh = D(sc.el, 'circ', 'left:730px;top:330px;width:280px;height:280px;background:linear-gradient(180deg,#f8e7ae,#e3c26b 55%,#a67c28);border:5px solid #fff3c4;box-shadow:0 0 70px rgba(248,231,174,.8)');
    SV(sh, ART.shareIcon({ color: '#06241e' }), 70, 70, 140, 140);
    A(sh, 76.35, { a: 'pop', i: 0.5, fn: (t) => 'scale(' + (1 + 0.05 * Math.sin((t - 76.35) * 8)).toFixed(3) + ')' });
    A(TX(sc.el, 'শেয়ার', 'bn gold glowt', 690, 650, 360, 'font-size:84px'), 76.6, { a: 'rise' });
  }

  /* =====================================================================
     S16  77.5 – 80  final: icon, app name, install, store badge
     ===================================================================== */
  { const sc = scene(77.5, DUR, { post: 0.2, o: 0 }), A = sc.add;
    A(HALO(sc.el, 540, 260, 900, '227,194,107', 0.5), 77.5);
    for (let k = 0; k < 3; k++) A(D(sc.el, 'ring', 'left:350px;top:50px;width:380px;height:380px'), 77.5, { i: 0.1, fn: (t) => { const ph = ((t * 0.6) + k / 3) % 1; return { tf: 'scale(' + (1 + ph * 0.75).toFixed(3) + ')', a: (1 - ph) * 0.8 }; } });
    A(ICON(sc.el, 350, 50, 380), 77.5, { a: 'pop', i: 0.6, fn: (t) => 'scale(' + (1 + 0.025 * Math.sin(t * 5)).toFixed(4) + ')' });
    A(TX(sc.el, APP, 'bn glowt', 50, 480, 980, 'font-size:76px;line-height:1.25'), 77.8, { a: 'rise' });
    A(CHIP(sc.el, 'আজই ইনস্টল করুন', 190, 730, 700, 140, 70, 'chipG'), 78.3, POPT);
    A(BADGE(sc.el, 220, 930, 640), 78.7, { a: 'pop', i: 0.6, fn: (t) => 'scale(' + (1 + 0.03 * Math.sin(t * 5)).toFixed(4) + ')' });
  }

  /* ---------------- frame renderer ---------------- */
  const colAt = (t) => {
    let i = 0;
    for (let k = 0; k < LINES.length; k++) if (t >= LINES[k].s) i = k;
    const cur = emo(LINES[i].tag), prev = emo(LINES[Math.max(0, i - 1)].tag);
    const p = i === 0 ? 1 : easeInOut(clamp((t - LINES[i].s) / 0.6));
    return [lerp(prev[0], cur[0], p), lerp(prev[1], cur[1], p), lerp(prev[2], cur[2], p)];
  };

  window.renderAt = function (t) {
    t = clamp(t, 0, DUR);
    // background
    bgPat.style.backgroundPosition = (t * 6).toFixed(1) + 'px ' + (t * 4).toFixed(1) + 'px';
    bgMed.style.transform = 'rotate(' + (t * 2).toFixed(2) + 'deg)';
    const c = colAt(t);
    bgGlow.style.background = 'radial-gradient(closest-side,rgba(' + c[0].toFixed(0) + ',' + c[1].toFixed(0) + ',' + c[2].toFixed(0) + ',.34),rgba(' + c[0].toFixed(0) + ',' + c[1].toFixed(0) + ',' + c[2].toFixed(0) + ',0))';
    dust.forEach((d) => {
      const y = ((d.y - t * d.sp) % H + H) % H;
      const x = d.x + Math.sin(t * d.f + d.ph) * d.am;
      d.el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      d.el.style.opacity = (0.15 + 0.6 * (0.5 + 0.5 * Math.sin(t * d.tw * 2 + d.ph))).toFixed(2);
    });
    lanternL.style.transform = 'rotate(' + (Math.sin(t * 1.3) * 4).toFixed(2) + 'deg)';
    lanternR.style.transform = 'rotate(' + (Math.sin(t * 1.3 + 1.7) * 4).toFixed(2) + 'deg)';
    pfill.style.width = (960 * t / DUR).toFixed(1) + 'px';
    // timeline
    for (let i = 0; i < tracks.length; i++) runTrack(tracks[i], t);
    for (let i = 0; i < WT.length; i++) {
      const w = WT[i], p = clamp((t - w.s) / 0.28), q = Math.round(p * 24);
      if (q !== w.last) { w.last = q; const e = easeOut(p); w.sp.style.opacity = e.toFixed(3); w.sp.style.transform = 'translateY(' + ((1 - e) * 20).toFixed(1) + 'px)'; }
    }
  };
  window.__DURATION = DUR; window.__FPS = FPS;

  /* ---------------- ready ---------------- */
  (async function () {
    try { if (document.fonts && document.fonts.ready) await document.fonts.ready; } catch (e) { /* ignore */ }
    try { await Promise.all(IMGS.map((im) => (im.decode ? im.decode().catch(() => null) : null))); } catch (e) { /* ignore */ }
    window.renderAt(0);
    window.__ready = true;
  })();
})();
