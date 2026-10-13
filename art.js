/* art.js — all vector art is drawn here as inline SVG (no external images except the app icon + store badge).
   Shared gradients live in index.html (<defs>): gGold, gGoldH, gWood, gWoodD, gCream, gEmerald, gRug, gDome,
   gBlack, gHeart, gBulb, gSun, gLamp, gIris, gGlass.                                                        */
(function () {
  'use strict';
  const ART = {};
  let uid = 0;
  const nid = (p) => p + '_' + (++uid);
  const defs = {};

  function def(name, vw, vh, fn) {
    defs[name] = { vw, vh, fn };
    ART[name] = function (o) {
      o = o || {};
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + vw + ' ' + vh +
        '" width="100%" height="100%" style="overflow:visible">' + fn(o) + '</svg>';
    };
  }
  ART.nest = function (name, x, y, w, h, o) {
    const d = defs[name];
    return '<svg x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" viewBox="0 0 ' + d.vw + ' ' + d.vh +
      '" style="overflow:visible">' + d.fn(o || {}) + '</svg>';
  };
  ART.size = (name) => [defs[name].vw, defs[name].vh];

  /* ---------- helpers ---------- */
  function starPts(cx, cy, R, rot, k) {
    k = k || 0.7654;
    const p = [];
    for (let i = 0; i < 16; i++) {
      const a = ((rot || 0) + i * 22.5 - 90) * Math.PI / 180;
      const r = i % 2 ? R * k : R;
      p.push((cx + r * Math.cos(a)).toFixed(1) + ',' + (cy + r * Math.sin(a)).toFixed(1));
    }
    return p.join(' ');
  }
  const poly8 = (cx, cy, R, attrs, rot) => '<polygon points="' + starPts(cx, cy, R, rot) + '" ' + (attrs || '') + '/>';
  ART.poly8 = poly8;
  const G = '#e3c26b', GL = '#f8e7ae', GD = '#a67c28';

  /* ---------- stars / patterns ---------- */
  def('star8', 100, 100, (o) => poly8(50, 50, 48, 'fill="' + (o.fill || 'url(#gGold)') + '" stroke="' + (o.stroke || GD) + '" stroke-width="' + (o.sw || 2) + '"', 0));

  def('medallion', 600, 600, () => {
    let s = '';
    s += '<circle cx="300" cy="300" r="292" fill="none" stroke="' + G + '" stroke-width="2"/>';
    [0, 22.5].forEach((r) => { s += poly8(300, 300, 282, 'fill="none" stroke="' + G + '" stroke-width="3"', r); });
    s += '<circle cx="300" cy="300" r="214" fill="none" stroke="' + G + '" stroke-width="2"/>';
    [0, 22.5].forEach((r) => { s += poly8(300, 300, 200, 'fill="none" stroke="' + G + '" stroke-width="2.5"', r); });
    s += '<circle cx="300" cy="300" r="134" fill="none" stroke="' + G + '" stroke-width="2"/>';
    [0, 22.5].forEach((r) => { s += poly8(300, 300, 120, 'fill="none" stroke="' + G + '" stroke-width="2"', r); });
    for (let i = 0; i < 16; i++) {
      const a = i * 22.5 * Math.PI / 180;
      s += '<circle cx="' + (300 + 248 * Math.cos(a)).toFixed(1) + '" cy="' + (300 + 248 * Math.sin(a)).toFixed(1) + '" r="5" fill="' + G + '"/>';
    }
    s += poly8(300, 300, 60, 'fill="none" stroke="' + G + '" stroke-width="2"', 0);
    return s;
  });

  ART.tileURI = function () {
    let s = '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><g fill="none" stroke="#e3c26b" stroke-width="1.6">';
    s += poly8(60, 60, 36, '', 0) + poly8(60, 60, 36, '', 22.5);
    s += poly8(0, 0, 36, '', 0) + poly8(120, 0, 36, '', 0) + poly8(0, 120, 36, '', 0) + poly8(120, 120, 36, '', 0);
    s += '<circle cx="60" cy="60" r="13"/><path d="M60 0V24M60 96V120M0 60H24M96 60H120"/>';
    s += '</g></svg>';
    return 'url("data:image/svg+xml;utf8,' + encodeURIComponent(s) + '")';
  };

  def('crescent', 100, 100, (o) => {
    const m = nid('cm');
    const f = o.fill || 'url(#gGold)';
    return '<mask id="' + m + '"><rect x="-20" y="-20" width="140" height="140" fill="#fff"/><circle cx="64" cy="44" r="38" fill="#000"/></mask>' +
      '<circle cx="46" cy="52" r="44" fill="' + f + '" mask="url(#' + m + ')"/>';
  });

  def('crescentStar', 120, 100, () => ART.nest('crescent', 0, 0, 100, 100) + poly8(86, 40, 15, 'fill="url(#gGold)"', 0));

  def('divider', 400, 40, () =>
    '<path d="M0 20H165" stroke="' + G + '" stroke-width="2.5"/><path d="M235 20H400" stroke="' + G + '" stroke-width="2.5"/>' +
    poly8(200, 20, 17, 'fill="url(#gGold)"', 0) +
    '<circle cx="176" cy="20" r="3.5" fill="' + G + '"/><circle cx="224" cy="20" r="3.5" fill="' + G + '"/>');

  /* ---------- lantern, skyline ---------- */
  def('lantern', 90, 230, () =>
    '<path d="M45 0V40" stroke="' + G + '" stroke-width="2.5"/>' +
    '<circle cx="45" cy="42" r="6" fill="none" stroke="' + G + '" stroke-width="3"/>' +
    '<path d="M24 66L45 46L66 66Z" fill="url(#gGold)"/>' +
    '<path d="M26 66H64L73 132Q45 150 17 132Z" fill="url(#gLamp)" stroke="' + G + '" stroke-width="3"/>' +
    '<path d="M45 66V142M35 66L30 138M55 66L60 138" stroke="' + GD + '" stroke-width="2"/>' +
    '<path d="M18 132Q45 152 72 132L62 160H28Z" fill="url(#gGold)"/>' +
    '<path d="M45 160V196" stroke="' + G + '" stroke-width="3"/><circle cx="45" cy="204" r="8" fill="url(#gGold)"/>');

  def('skyline', 1080, 170, () => {
    const F = '#04251f', S = 'rgba(227,194,107,.28)';
    let s = '<rect x="0" y="150" width="1080" height="30" fill="' + F + '"/>';
    function dome(cx, w, h, base) {
      const x0 = cx - w / 2, x1 = cx + w / 2;
      return '<path d="M' + x0 + ' ' + base + 'C' + x0 + ' ' + (base - h * 0.62) + ' ' + (cx - w * 0.28) + ' ' + (base - h) + ' ' + cx + ' ' + (base - h) +
        'C' + (cx + w * 0.28) + ' ' + (base - h) + ' ' + x1 + ' ' + (base - h * 0.62) + ' ' + x1 + ' ' + base + 'Z" fill="' + F + '" stroke="' + S + '" stroke-width="1.5"/>' +
        '<path d="M' + cx + ' ' + (base - h) + 'V' + (base - h - 22) + '" stroke="' + G + '" stroke-width="2" opacity=".7"/>' +
        '<circle cx="' + cx + '" cy="' + (base - h - 26) + '" r="4" fill="' + G + '" opacity=".8"/>';
    }
    function minaret(cx, top) {
      return '<rect x="' + (cx - 9) + '" y="' + top + '" width="18" height="' + (150 - top) + '" fill="' + F + '" stroke="' + S + '" stroke-width="1.5"/>' +
        '<rect x="' + (cx - 14) + '" y="' + (top + 24) + '" width="28" height="7" fill="' + F + '" stroke="' + S + '" stroke-width="1.5"/>' +
        '<path d="M' + (cx - 10) + ' ' + top + 'L' + cx + ' ' + (top - 30) + 'L' + (cx + 10) + ' ' + top + 'Z" fill="' + F + '" stroke="' + S + '" stroke-width="1.5"/>' +
        '<circle cx="' + cx + '" cy="' + (top - 34) + '" r="3.5" fill="' + G + '" opacity=".8"/>';
    }
    s += '<rect x="90" y="112" width="180" height="40" fill="' + F + '"/>' + dome(180, 120, 60, 114) + minaret(70, 60) + minaret(290, 74);
    s += '<rect x="410" y="96" width="260" height="56" fill="' + F + '"/>' + dome(540, 200, 82, 98) + dome(450, 70, 36, 98) + dome(630, 70, 36, 98) + minaret(398, 40) + minaret(682, 40);
    s += '<rect x="810" y="112" width="190" height="40" fill="' + F + '"/>' + dome(900, 120, 62, 114) + minaret(1010, 66) + minaret(800, 80);
    for (let i = 0; i < 16; i++) {
      const x = [120, 160, 200, 240, 480, 520, 560, 600, 840, 880, 920, 960, 540, 450, 630, 180][i];
      const y = i < 4 ? 130 : i < 8 ? 126 : i < 12 ? 130 : 110;
      s += '<rect x="' + x + '" y="' + y + '" width="6" height="12" rx="3" fill="#f8e7ae" opacity=".55"/>';
    }
    return s;
  });

  /* ---------- Kaaba, dome ---------- */
  def('kaaba', 220, 200, () =>
    '<ellipse cx="110" cy="186" rx="100" ry="10" fill="#000" opacity=".3"/>' +
    '<polygon points="140,60 200,42 200,160 140,180" fill="#101010" stroke="#000" stroke-width="1"/>' +
    '<polygon points="20,60 80,42 200,42 140,60" fill="#2a2a2a"/>' +
    '<polygon points="20,60 140,60 140,180 20,180" fill="url(#gBlack)"/>' +
    '<polygon points="20,86 140,86 140,100 20,100" fill="url(#gGoldH)"/>' +
    '<polygon points="140,86 200,68 200,82 140,100" fill="' + GD + '"/>' +
    '<rect x="94" y="124" width="26" height="56" rx="3" fill="none" stroke="' + G + '" stroke-width="3"/>' +
    '<path d="M44 108V180M68 108V180" stroke="#2e2e2e" stroke-width="2"/>' +
    '<path d="M30 118H84M30 130H84" stroke="' + GD + '" stroke-width="1.5" opacity=".7"/>');

  def('dome', 300, 340, () => {
    let s = '';
    // minaret (right)
    s += '<rect x="246" y="126" width="30" height="176" fill="url(#gCream)" stroke="' + GD + '" stroke-width="2"/>';
    s += '<rect x="246" y="168" width="30" height="12" fill="#2bb04f"/><rect x="246" y="222" width="30" height="12" fill="#2bb04f"/>';
    s += '<rect x="240" y="126" width="42" height="9" fill="url(#gGold)"/>';
    s += '<path d="M248 126L261 78L274 126Z" fill="url(#gCream)" stroke="' + GD + '" stroke-width="2"/>';
    s += '<path d="M261 78V50" stroke="' + G + '" stroke-width="3"/><circle cx="261" cy="46" r="5" fill="' + G + '"/>';
    // dome
    s += '<path d="M44 250C44 162 100 108 150 108C200 108 256 162 256 250Z" fill="url(#gDome)" stroke="#0b5a26" stroke-width="2"/>';
    for (let bx = 62; bx <= 238; bx += 16) {
      s += '<path d="M150 112Q' + ((150 + bx) / 2 + (bx - 150) * 0.1).toFixed(1) + ' 178 ' + bx + ' 250" fill="none" stroke="#0d6b2d" stroke-width="1.6" opacity=".55"/>';
    }
    s += '<path d="M150 108V68" stroke="' + G + '" stroke-width="4"/><circle cx="150" cy="62" r="7" fill="url(#gGold)"/>';
    s += '<rect x="36" y="250" width="228" height="16" rx="3" fill="url(#gGoldH)"/>';
    s += '<rect x="48" y="266" width="204" height="40" fill="url(#gCream)" stroke="' + GD + '" stroke-width="2"/>';
    for (let i = 0; i < 5; i++) s += '<path d="M' + (66 + i * 38) + ' 304V284Q' + (66 + i * 38 + 9) + ' 272 ' + (66 + i * 38 + 18) + ' 284V304Z" fill="#145c4b"/>';
    return s;
  });

  def('book', 400, 260, () => {
    let s = '<path d="M4 50L4 228C76 206 150 208 200 238C250 208 324 206 396 228L396 50Z" fill="#0b3d33" stroke="' + G + '" stroke-width="3"/>';
    s += '<path d="M200 48C150 22 80 22 18 46L18 214C80 192 150 192 200 220Z" fill="url(#gCream)" stroke="' + G + '" stroke-width="3"/>';
    s += '<path d="M200 48C250 22 320 22 382 46L382 214C320 192 250 192 200 220Z" fill="url(#gCream)" stroke="' + G + '" stroke-width="3"/>';
    for (let i = 0; i < 6; i++) {
      s += '<path d="M40 ' + (84 + i * 20) + 'Q112 ' + (70 + i * 20) + ' 182 ' + (92 + i * 20) + '" stroke="#c9a24a" stroke-width="3" fill="none" opacity=".65"/>';
      s += '<path d="M218 ' + (92 + i * 20) + 'Q288 ' + (70 + i * 20) + ' 360 ' + (84 + i * 20) + '" stroke="#c9a24a" stroke-width="3" fill="none" opacity=".65"/>';
    }
    s += poly8(110, 66, 12, 'fill="' + G + '"', 0) + poly8(290, 66, 12, 'fill="' + G + '"', 0);
    s += '<path d="M200 48V220" stroke="' + GD + '" stroke-width="3"/>';
    return s;
  });

  def('bookCover', 300, 420, () => {
    let s = '<rect x="22" y="14" width="268" height="394" rx="14" fill="#f3e3b0" stroke="' + GD + '" stroke-width="2"/>'; // page edge
    s += '<path d="M290 30V396M284 30V396M278 30V396" stroke="#d6bd7a" stroke-width="1.5"/>';
    s += '<rect x="6" y="6" width="266" height="408" rx="14" fill="url(#gEmerald)" stroke="' + G + '" stroke-width="5"/>';
    s += '<rect x="20" y="20" width="238" height="380" rx="8" fill="none" stroke="' + G + '" stroke-width="2.5"/>';
    s += '<rect x="30" y="30" width="218" height="360" rx="4" fill="none" stroke="' + G + '" stroke-width="1.2" opacity=".7"/>';
    s += '<rect x="6" y="6" width="22" height="408" rx="10" fill="#06241e" stroke="' + G + '" stroke-width="3"/>';
    s += '<g transform="translate(5 0)">' + poly8(145, 140, 82, 'fill="none" stroke="' + G + '" stroke-width="3"', 0) + poly8(145, 140, 82, 'fill="none" stroke="' + G + '" stroke-width="3"', 22.5) +
      '<circle cx="145" cy="140" r="52" fill="none" stroke="' + G + '" stroke-width="2.5"/>' + poly8(145, 140, 42, 'fill="url(#gGold)"', 0) + '<circle cx="145" cy="140" r="14" fill="#06241e"/></g>';
    s += '<text x="150" y="292" text-anchor="middle" font-size="40" fill="' + GL + '" font-family="Amiri,\'Noto Naskh Arabic\',FreeSerif,serif">صَحِيحُ الْبُخَارِيِّ</text>';
    s += '<path d="M60 316H240" stroke="' + G + '" stroke-width="2"/>' + poly8(150, 316, 9, 'fill="' + G + '"', 0);
    s += '<path d="M40 40h30M40 40v30M240 40h-30M240 40v30M40 380h30M40 380v-30M240 380h-30M240 380v-30" stroke="' + G + '" stroke-width="3" fill="none"/>';
    return s;
  });

  /* ---------- minbar (with Arabic text on it) ---------- */
  def('minbar', 400, 560, () => {
    const pid = nid('lat');
    let s = '<pattern id="' + pid + '" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0H22M0 0V22" stroke="' + G + '" stroke-width="1.8" opacity=".75"/></pattern>';
    s += '<ellipse cx="200" cy="548" rx="192" ry="11" fill="#000" opacity=".35"/>';
    // staircase side panel
    s += '<polygon points="20,540 250,540 250,215" fill="url(#gWood)" stroke="' + G + '" stroke-width="4" stroke-linejoin="round"/>';
    s += '<polygon points="20,540 250,540 250,215" fill="url(#' + pid + ')"/>';
    s += '<polygon points="62,522 236,522 236,262" fill="none" stroke="' + G + '" stroke-width="2.5"/>';
    // steps
    for (let i = 0; i < 6; i++) {
      const x = 250 - i * 36, y = 215 + i * 54;
      s += '<path d="M' + x + ' ' + y + 'h-24v18" stroke="' + GL + '" stroke-width="2" fill="none" opacity=".6"/>';
    }
    // railing along the slope
    const slope = -325 / 230; // dy/dx
    s += '<path d="M20 478L250 153" stroke="url(#gGold)" stroke-width="9" stroke-linecap="round"/>';
    for (let x = 36; x <= 244; x += 22) {
      const yh = 540 + slope * (x - 20);
      const yt = 478 + slope * (x - 20);
      s += '<path d="M' + x + ' ' + yh.toFixed(1) + 'V' + (yt + 4).toFixed(1) + '" stroke="' + G + '" stroke-width="4"/>';
    }
    s += '<circle cx="20" cy="478" r="9" fill="url(#gGold)"/><rect x="244" y="140" width="12" height="76" rx="4" fill="url(#gGold)"/><circle cx="250" cy="136" r="9" fill="url(#gGold)"/>';
    // main body
    s += '<rect x="250" y="215" width="136" height="325" fill="url(#gWood)" stroke="' + G + '" stroke-width="4"/>';
    s += '<rect x="262" y="236" width="112" height="160" fill="url(#' + pid + ')" stroke="' + G + '" stroke-width="3"/>';
    s += '<path d="M280 540V462Q280 430 318 430Q356 430 356 462V540Z" fill="url(#gWoodD)" stroke="' + G + '" stroke-width="3"/>';
    s += '<circle cx="342" cy="490" r="4" fill="' + G + '"/>';
    s += '<path d="M290 540V464Q290 440 318 440Q346 440 346 464V540" fill="none" stroke="' + GD + '" stroke-width="1.5"/>';
    // platform
    s += '<rect x="234" y="198" width="168" height="19" rx="5" fill="url(#gGoldH)" stroke="' + GD + '" stroke-width="2"/>';
    // back panel with Arabic
    s += '<rect x="258" y="86" width="132" height="112" rx="4" fill="#0b3d33" stroke="' + G + '" stroke-width="3"/>';
    s += '<rect x="264" y="92" width="120" height="100" rx="3" fill="none" stroke="' + G + '" stroke-width="1.2" opacity=".7"/>';
    const ff = 'font-family="Amiri,\'Noto Naskh Arabic\',FreeSerif,serif" text-anchor="middle"';
    s += '<text class="mbT1" x="324" y="125" font-size="30" fill="' + GL + '" ' + ff + '>اللَّهُ</text>';
    s += '<text class="mbT2" x="324" y="157" font-size="20" fill="' + GL + '" ' + ff + '>لَا إِلَهَ إِلَّا اللَّهُ</text>';
    s += '<text class="mbT3" x="324" y="184" font-size="20" fill="' + GL + '" ' + ff + '>مُحَمَّدٌ رَسُولُ اللَّهِ</text>';
    // columns
    [[252, 86], [382, 86]].forEach((c) => {
      s += '<rect x="' + (c[0] - 4) + '" y="' + c[1] + '" width="10" height="112" rx="3" fill="url(#gGold)"/>' +
        '<rect x="' + (c[0] - 8) + '" y="' + (c[1] - 4) + '" width="18" height="8" rx="3" fill="' + GD + '"/>';
    });
    // canopy
    s += '<path d="M240 90Q324 -34 408 90Z" fill="url(#gDome)" stroke="' + G + '" stroke-width="4"/>';
    for (let k = -3; k <= 3; k++) s += '<path d="M324 8Q' + (324 + k * 14) + ' 40 ' + (324 + k * 24) + ' 88" fill="none" stroke="' + G + '" stroke-width="1.6" opacity=".6"/>';
    s += '<rect x="236" y="86" width="176" height="9" rx="3" fill="url(#gGoldH)"/>';
    s += '<path d="M324 6V-10" stroke="' + G + '" stroke-width="3"/><circle cx="324" cy="-14" r="6" fill="url(#gGold)"/>';
    s += ART.nest('crescent', 310, -50, 28, 28);
    return s;
  });

  /* ---------- prayer rug, fasting, charity, sleep ---------- */
  def('rug', 160, 250, () => {
    let s = '';
    for (let x = 22; x <= 138; x += 10) s += '<path d="M' + x + ' 22V8M' + x + ' 228V242" stroke="' + G + '" stroke-width="3" stroke-linecap="round"/>';
    s += '<rect x="14" y="22" width="132" height="206" rx="6" fill="url(#gRug)" stroke="' + G + '" stroke-width="5"/>';
    s += '<rect x="26" y="34" width="108" height="182" rx="3" fill="none" stroke="' + G + '" stroke-width="2"/>';
    s += '<path d="M44 202V112Q44 66 80 46Q116 66 116 112V202Z" fill="#0e5a4a" stroke="' + G + '" stroke-width="3"/>';
    s += '<path d="M80 62V86" stroke="' + G + '" stroke-width="2.5"/><path d="M70 98Q80 84 90 98L88 112H72Z" fill="url(#gGold)"/>';
    s += poly8(80, 160, 20, 'fill="url(#gGold)"', 0) + '<circle cx="80" cy="160" r="7" fill="#0e5a4a"/>';
    return s;
  });

  def('fasting', 160, 150, () => ART.nest('crescent', 6, 10, 120, 120) + poly8(118, 62, 18, 'fill="url(#gGold)"', 0) +
    poly8(40, 130, 6, 'fill="' + G + '"', 0) + poly8(140, 120, 5, 'fill="' + G + '"', 0));

  def('charity', 160, 180, () =>
    '<ellipse cx="80" cy="172" rx="62" ry="7" fill="#000" opacity=".3"/>' +
    '<circle cx="80" cy="34" r="19" fill="url(#gGold)" stroke="' + GD + '" stroke-width="3"/><circle cx="80" cy="34" r="11" fill="none" stroke="' + GD + '" stroke-width="2"/>' +
    '<rect x="26" y="66" width="108" height="100" rx="12" fill="url(#gGold)" stroke="' + GD + '" stroke-width="3"/>' +
    '<rect x="52" y="78" width="56" height="10" rx="5" fill="#4b2a12"/>' +
    '<path d="M80 150C58 134 52 118 62 110C70 104 78 108 80 116C82 108 90 104 98 110C108 118 102 134 80 150Z" fill="#a8274a"/>');

  def('sleep', 160, 160, () => ART.nest('crescent', 2, 20, 120, 120) +
    '<path d="M104 36h28l-28 32h28" stroke="' + G + '" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="M138 8h16l-16 19h16" stroke="' + G + '" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
    poly8(40, 22, 6, 'fill="' + G + '"', 0));

  def('coins', 180, 160, () => {
    let s = '';
    for (let i = 0; i < 4; i++) {
      const y = 112 - i * 22;
      s += '<ellipse cx="90" cy="' + (y + 14) + '" rx="56" ry="17" fill="' + GD + '"/>' +
        '<rect x="34" y="' + y + '" width="112" height="14" fill="#c99a35"/>' +
        '<ellipse cx="90" cy="' + y + '" rx="56" ry="17" fill="url(#gGold)" stroke="#7a5a1a" stroke-width="2"/>' +
        '<ellipse cx="90" cy="' + y + '" rx="38" ry="10" fill="none" stroke="#a67c28" stroke-width="2"/>';
    }
    s += '<circle cx="150" cy="38" r="22" fill="url(#gGold)" stroke="#7a5a1a" stroke-width="3"/><circle cx="150" cy="38" r="14" fill="none" stroke="#a67c28" stroke-width="2.5"/>';
    return s;
  });

  def('ring', 160, 170, () =>
    '<ellipse cx="80" cy="116" rx="46" ry="48" fill="none" stroke="url(#gGold)" stroke-width="14"/>' +
    '<ellipse cx="80" cy="116" rx="40" ry="42" fill="none" stroke="' + GD + '" stroke-width="2" opacity=".6"/>' +
    '<path d="M62 62L98 62L110 48L80 24L50 48Z" fill="url(#gGlass)" stroke="' + G + '" stroke-width="3" stroke-linejoin="round"/>' +
    '<path d="M50 48H110M80 24L68 62M80 24L92 62" stroke="#fff" stroke-width="1.5" opacity=".7"/>' +
    '<path d="M24 20L34 30M136 20L126 30M80 4V14" stroke="' + GL + '" stroke-width="3" stroke-linecap="round"/>');

  /* ---------- thought / feeling icons ---------- */
  def('bulb', 200, 260, () =>
    '<path d="M100 20C145 20 175 52 175 92C175 120 158 138 148 156V176H52V156C42 138 25 120 25 92C25 52 55 20 100 20Z" fill="url(#gBulb)" stroke="' + G + '" stroke-width="5"/>' +
    '<path d="M80 156V112Q80 96 92 96Q100 108 108 96Q120 96 120 112V156" stroke="' + GD + '" stroke-width="5" fill="none" stroke-linecap="round"/>' +
    '<rect x="58" y="176" width="84" height="14" rx="5" fill="url(#gGold)"/><rect x="64" y="194" width="72" height="14" rx="5" fill="url(#gGold)"/><rect x="82" y="212" width="36" height="14" rx="7" fill="url(#gGold)"/>' +
    '<path d="M62 60Q74 40 96 36" stroke="#fff" stroke-width="6" stroke-linecap="round" fill="none" opacity=".7"/>');

  def('rays', 400, 400, (o) => {
    const n = o.n || 16, r1 = o.r1 || 70, r2 = 200, hw = (o.hw || 5) * Math.PI / 180;
    let s = '';
    for (let i = 0; i < n; i++) {
      const a = i * 2 * Math.PI / n;
      const p = (r, d) => (200 + r * Math.cos(a + d)).toFixed(1) + ',' + (200 + r * Math.sin(a + d)).toFixed(1);
      s += '<polygon points="' + p(r1, -hw * 0.5) + ' ' + p(r2, -hw) + ' ' + p(r2, hw) + ' ' + p(r1, hw * 0.5) + '" fill="' + (o.color || 'url(#gGold)') + '"/>';
    }
    return s;
  });

  def('stopwatch', 200, 240, () => {
    let s = '<rect x="84" y="4" width="32" height="20" rx="5" fill="url(#gGold)"/><rect x="92" y="20" width="16" height="20" fill="' + GD + '"/>';
    s += '<rect x="158" y="40" width="22" height="14" rx="4" fill="url(#gGold)" transform="rotate(40 158 40)"/>';
    s += '<circle cx="100" cy="136" r="92" fill="url(#gGold)"/><circle cx="100" cy="136" r="80" fill="#082e27"/>';
    for (let i = 0; i < 60; i++) {
      const a = i * 6 * Math.PI / 180, big = i % 5 === 0;
      const r1 = big ? 66 : 71, r2 = 76;
      s += '<path d="M' + (100 + r1 * Math.sin(a)).toFixed(1) + ' ' + (136 - r1 * Math.cos(a)).toFixed(1) + 'L' + (100 + r2 * Math.sin(a)).toFixed(1) + ' ' + (136 - r2 * Math.cos(a)).toFixed(1) + '" stroke="' + G + '" stroke-width="' + (big ? 3 : 1.4) + '"/>';
    }
    s += '<circle class="swProg" cx="100" cy="136" r="58" fill="none" stroke="' + GL + '" stroke-width="9" stroke-linecap="round" stroke-dasharray="364.4" stroke-dashoffset="0" transform="rotate(-90 100 136)"/>';
    s += '<g class="swHand"><path d="M100 136V82" stroke="#ff8d6b" stroke-width="4" stroke-linecap="round"/><circle cx="100" cy="136" r="6" fill="#ff8d6b"/></g>';
    return s;
  });

  def('pause', 100, 100, () => '<rect x="22" y="14" width="20" height="72" rx="6" fill="url(#gGold)"/><rect x="58" y="14" width="20" height="72" rx="6" fill="url(#gGold)"/>');

  def('heart', 200, 190, () =>
    '<path d="M100 178C20 112 -4 56 36 28C66 8 93 26 100 52C107 26 134 8 164 28C204 56 180 112 100 178Z" fill="url(#gHeart)" stroke="' + G + '" stroke-width="5" stroke-linejoin="round"/>' +
    '<path d="M44 52Q50 38 66 36" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity=".6"/>');

  def('eye', 200, 120, () =>
    '<path d="M8 60Q100 -16 192 60Q100 136 8 60Z" fill="url(#gCream)" stroke="' + G + '" stroke-width="5" stroke-linejoin="round"/>' +
    '<g class="iris"><circle cx="100" cy="60" r="32" fill="url(#gIris)" stroke="#06241e" stroke-width="3"/><circle cx="100" cy="60" r="15" fill="#04100d"/><circle cx="90" cy="49" r="6" fill="#fff" opacity=".85"/></g>' +
    '<path d="M8 60Q100 -16 192 60" fill="none" stroke="' + GD + '" stroke-width="3"/>');

  def('check', 100, 100, () => '<path d="M20 54L42 76L82 28" stroke="' + GL + '" stroke-width="15" fill="none" stroke-linecap="round" stroke-linejoin="round"/>');
  def('checkDark', 100, 100, () => '<path d="M20 54L42 76L82 28" stroke="#06241e" stroke-width="15" fill="none" stroke-linecap="round" stroke-linejoin="round"/>');

  def('arrowR', 160, 60, () => '<path d="M10 30H118" stroke="' + G + '" stroke-width="9" stroke-linecap="round"/><polygon points="150,30 116,6 116,54" fill="' + G + '"/>');
  def('arrowBoth', 200, 60, () => '<path d="M36 30H164" stroke="' + G + '" stroke-width="9" stroke-linecap="round"/><polygon points="6,30 40,6 40,54" fill="' + G + '"/><polygon points="194,30 160,6 160,54" fill="' + G + '"/>');
  def('arrowVBoth', 60, 200, () => '<path d="M30 36V164" stroke="' + G + '" stroke-width="9" stroke-linecap="round"/><polygon points="30,6 6,40 54,40" fill="' + G + '"/><polygon points="30,194 6,160 54,160" fill="' + G + '"/>');
  def('equals', 100, 80, () => '<rect x="10" y="12" width="80" height="14" rx="7" fill="url(#gGold)"/><rect x="10" y="54" width="80" height="14" rx="7" fill="url(#gGold)"/>');

  def('question', 220, 260, () =>
    '<path d="M54 74C54 34 82 14 112 14C146 14 168 38 168 68C168 94 150 106 132 120C116 132 112 142 112 166" stroke="url(#gGold)" stroke-width="30" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<circle cx="112" cy="222" r="20" fill="url(#gGold)"/>');

  def('sunrise', 400, 240, () => {
    const cp = nid('hz');
    let s = '<clipPath id="' + cp + '"><rect x="-40" y="-60" width="480" height="250"/></clipPath>';
    s += '<g clip-path="url(#' + cp + ')"><g class="sun"><circle cx="200" cy="190" r="86" fill="url(#gSun)"/>';
    for (let i = 0; i < 13; i++) {
      const a = (-180 + 15 + i * 12.5) * Math.PI / 180;
      s += '<path d="M' + (200 + 104 * Math.cos(a)).toFixed(1) + ' ' + (190 + 104 * Math.sin(a)).toFixed(1) + 'L' + (200 + 146 * Math.cos(a)).toFixed(1) + ' ' + (190 + 146 * Math.sin(a)).toFixed(1) + '" stroke="' + GL + '" stroke-width="7" stroke-linecap="round"/>';
    }
    s += '</g></g>';
    s += '<path d="M0 190H400" stroke="' + G + '" stroke-width="5"/>';
    s += '<path d="M40 214H360M90 232H310" stroke="' + G + '" stroke-width="3" opacity=".5" stroke-linecap="round"/>';
    s += '<path d="M40 70Q56 52 78 62Q92 44 116 56Q132 56 134 72H40Z" fill="#fff6dc" opacity=".25"/><path d="M280 96Q296 78 318 88Q332 70 356 82Q372 82 374 98H280Z" fill="#fff6dc" opacity=".25"/>';
    return s;
  });

  def('likeIcon', 100, 100, (o) => {
    const c = o.color || 'url(#gGold)';
    return '<rect x="8" y="44" width="18" height="48" rx="4" fill="' + c + '"/><path d="M32 46L48 12C58 8 68 18 64 32L61 42H86Q98 42 95 55L88 82Q86 92 76 92H32Z" fill="' + c + '"/>';
  });
  def('commentIcon', 100, 100, (o) => {
    const c = o.color || 'url(#gGold)';
    return '<path d="M14 16H86Q94 16 94 24V62Q94 70 86 70H52L30 90V70H14Q6 70 6 62V24Q6 16 14 16Z" fill="' + c + '"/>' +
      '<circle cx="30" cy="44" r="6" fill="#06241e"/><circle cx="50" cy="44" r="6" fill="#06241e"/><circle cx="70" cy="44" r="6" fill="#06241e"/>';
  });
  def('shareIcon', 100, 100, (o) => {
    const c = o.color || 'url(#gGold)';
    return '<path d="M24 50L74 22M24 50L74 78" stroke="' + c + '" stroke-width="8" stroke-linecap="round"/>' +
      '<circle cx="24" cy="50" r="15" fill="' + c + '"/><circle cx="74" cy="22" r="15" fill="' + c + '"/><circle cx="74" cy="78" r="15" fill="' + c + '"/>';
  });

  def('burst', 400, 400, () => {
    let s = '';
    for (let i = 0; i < 12; i++) {
      const a = i * 30 * Math.PI / 180;
      s += '<path d="M' + (200 + 90 * Math.cos(a)).toFixed(1) + ' ' + (200 + 90 * Math.sin(a)).toFixed(1) + 'L' + (200 + 190 * Math.cos(a)).toFixed(1) + ' ' + (200 + 190 * Math.sin(a)).toFixed(1) + '" stroke="' + GL + '" stroke-width="8" stroke-linecap="round"/>';
    }
    for (let i = 0; i < 8; i++) {
      const a = (i * 45 + 22.5) * Math.PI / 180;
      s += poly8(200 + 150 * Math.cos(a), 200 + 150 * Math.sin(a), 14, 'fill="' + G + '"', 0);
    }
    return s;
  });

  def('mapPath', 300, 260, () =>
    '<path d="M60 190C70 90 170 60 235 80" stroke="' + G + '" stroke-width="6" stroke-dasharray="2 16" stroke-linecap="round" fill="none" class="hijraPath"/>' +
    '<polygon points="236,66 258,92 228,96" fill="' + G + '"/>');

  window.ART = ART;
})();
