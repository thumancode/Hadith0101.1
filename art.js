// Inline SVG vector art library. All art is drawn in code; no external images.
(function () {
  const G = '#e3c26b', GL = '#f8e7ae', GD = '#a67c28', CR = '#fff6dc', E0 = '#04201b', E1 = '#0b3d33', E2 = '#145c4b';

  // Shared gradient defs, injected once into the document.
  const DEFS = `<svg width="0" height="0" style="position:absolute"><defs>
    <linearGradient id="gGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${GL}"/><stop offset=".5" stop-color="${G}"/><stop offset="1" stop-color="${GD}"/></linearGradient>
    <linearGradient id="gGoldV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${GL}"/><stop offset="1" stop-color="${GD}"/></linearGradient>
    <linearGradient id="gEm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${E2}"/><stop offset="1" stop-color="${E0}"/></linearGradient>
    <linearGradient id="gGreen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7fe0a0"/><stop offset=".5" stop-color="#22a35a"/><stop offset="1" stop-color="#0d6b38"/></linearGradient>
    <radialGradient id="gGlow"><stop offset="0" stop-color="${GL}" stop-opacity=".9"/><stop offset=".4" stop-color="${G}" stop-opacity=".35"/><stop offset="1" stop-color="${G}" stop-opacity="0"/></radialGradient>
    <radialGradient id="gWhite"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".5" stop-color="${GL}" stop-opacity=".35"/><stop offset="1" stop-color="${GL}" stop-opacity="0"/></radialGradient>
    <linearGradient id="gBeam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${GL}" stop-opacity=".85"/><stop offset="1" stop-color="${GL}" stop-opacity="0"/></linearGradient>
    <linearGradient id="gSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6c66b"/><stop offset=".6" stop-color="#e38a4a"/><stop offset="1" stop-color="${E1}"/></linearGradient>
  </defs></svg>`;

  const wrap = (vb, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${body}</svg>`;

  function starPts(cx, cy, r1, r2, n) {
    const p = [];
    for (let i = 0; i < n * 2; i++) {
      const a = Math.PI * i / n - Math.PI / 2, r = i % 2 ? r2 : r1;
      p.push((cx + r * Math.cos(a)).toFixed(2) + ',' + (cy + r * Math.sin(a)).toFixed(2));
    }
    return p.join(' ');
  }
  // 8-point star (rub el hizb): two overlapping squares
  function star8(cx, cy, r, fill, stroke, sw) {
    const s = r / Math.SQRT2;
    const sq = `<rect x="${cx - s}" y="${cy - s}" width="${2 * s}" height="${2 * s}" fill="${fill}" stroke="${stroke || 'none'}" stroke-width="${sw || 0}"/>`;
    return `<g>${sq}<g transform="rotate(45 ${cx} ${cy})">${sq}</g></g>`;
  }
  const star8svg = (fill) => wrap('0 0 100 100', star8(50, 50, 46, fill || 'url(#gGold)'));

  function medallion() {
    let b = '';
    for (let i = 0; i < 6; i++) {
      const r = 440 - i * 70;
      b += `<g transform="rotate(${i * 7.5} 450 450)">${star8(450, 450, r, 'none', G, 3)}</g>`;
    }
    b += `<circle cx="450" cy="450" r="445" fill="none" stroke="${G}" stroke-width="3"/>`;
    b += `<polygon points="${starPts(450, 450, 120, 60, 16)}" fill="none" stroke="${GL}" stroke-width="3"/>`;
    return wrap('0 0 900 900', b);
  }

  function patternTile() {
    const s = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">
      <g fill="none" stroke="${G}" stroke-width="2">${star8(90, 90, 60, 'none', G, 2)}${star8(0, 0, 30, 'none', G, 2)}${star8(180, 0, 30, 'none', G, 2)}${star8(0, 180, 30, 'none', G, 2)}${star8(180, 180, 30, 'none', G, 2)}
      <path d="M90 0V30M90 150V180M0 90H30M150 90H180"/></g></svg>`;
    return 'url("data:image/svg+xml;utf8,' + encodeURIComponent(s) + '")';
  }

  let maskN = 0;
  function crescent(fill) {
    const id = 'cm' + (maskN++);
    return wrap('0 0 100 100', `<mask id="${id}"><rect width="100" height="100" fill="#fff"/><circle cx="62" cy="42" r="38" fill="#000"/></mask>
      <circle cx="48" cy="50" r="42" fill="${fill || 'url(#gGold)'}" mask="url(#${id})"/>`);
  }
  function crescentStar() {
    const id = 'cm' + (maskN++);
    return wrap('0 0 100 100', `<mask id="${id}"><rect width="100" height="100" fill="#fff"/><circle cx="60" cy="44" r="36" fill="#000"/></mask>
      <circle cx="44" cy="50" r="40" fill="url(#gGold)" mask="url(#${id})"/><polygon points="${starPts(72, 46, 14, 6, 5)}" fill="${GL}"/>`);
  }

  function lantern() {
    return wrap('0 0 90 300', `
      <line x1="45" y1="0" x2="45" y2="120" stroke="${GD}" stroke-width="2"/>
      <path d="M30 120 L60 120 L52 108 L38 108Z" fill="url(#gGold)"/>
      <circle cx="45" cy="185" r="60" fill="url(#gGlow)"/>
      <path d="M22 132 L68 132 L78 180 L64 238 L26 238 L12 180Z" fill="rgba(248,231,174,.35)" stroke="url(#gGold)" stroke-width="4"/>
      <path d="M45 132 V238 M12 180 H78 M28 135 L36 236 M62 135 L54 236" stroke="${G}" stroke-width="2" fill="none"/>
      <ellipse cx="45" cy="185" rx="12" ry="18" fill="${GL}"/>
      <path d="M26 238 L64 238 L56 254 L34 254Z" fill="url(#gGold)"/>
      <path d="M45 254 V280" stroke="${G}" stroke-width="3"/><circle cx="45" cy="284" r="5" fill="${G}"/>`);
  }

  function dome(x, w, h, base) {
    return `<path d="M${x} ${base} Q${x} ${base - h} ${x + w / 2} ${base - h * 1.15} Q${x + w} ${base - h} ${x + w} ${base}Z"/>
      <rect x="${x + w / 2 - 2}" y="${base - h * 1.15 - 30}" width="4" height="30"/>`;
  }
  function minaret(x, w, h, base) {
    return `<rect x="${x}" y="${base - h}" width="${w}" height="${h}"/><rect x="${x - 8}" y="${base - h * 0.7}" width="${w + 16}" height="10"/>
      <path d="M${x} ${base - h} L${x + w / 2} ${base - h - 50} L${x + w} ${base - h}Z"/><rect x="${x + w / 2 - 2}" y="${base - h - 80}" width="4" height="30"/>`;
  }
  function skyline() {
    let b = `<g fill="${E0}">`;
    b += minaret(40, 34, 240, 330) + minaret(1006, 34, 240, 330);
    b += dome(120, 200, 110, 260) + `<rect x="100" y="250" width="240" height="80"/>`;
    b += dome(740, 200, 110, 260) + `<rect x="720" y="250" width="240" height="80"/>`;
    b += dome(370, 340, 190, 220) + `<rect x="340" y="210" width="400" height="120"/>`;
    b += minaret(300, 30, 270, 330) + minaret(750, 30, 270, 330);
    b += `<rect x="0" y="300" width="1080" height="30"/></g>`;
    b += `<path d="M0 300 H1080" stroke="${G}" stroke-width="2" opacity=".6"/>`;
    return wrap('0 0 1080 330', b);
  }

  function minbar(arTop, arDoor) {
    let lattice = '';
    for (let i = 0; i < 9; i++) lattice += `<path d="M${130 + i * 32} 720 L${130 + i * 32} ${700 - i * 46}" stroke="${G}" stroke-width="2"/>`;
    for (let i = 0; i < 6; i++) lattice += `<path d="M120 ${690 - i * 70} L${120 + 70 * (i + 1) * 0.68} 720" stroke="${G}" stroke-width="1.5" opacity=".7"/>`;
    let steps = '';
    for (let i = 0; i < 8; i++) steps += `<rect x="${110 + i * 40}" y="${720 - (i + 1) * 46}" width="44" height="12" fill="url(#gGold)"/>`;
    let balust = '';
    for (let i = 0; i < 9; i++) balust += `<line x1="${120 + i * 38}" y1="${690 - i * 44}" x2="${120 + i * 38}" y2="${620 - i * 44}" stroke="${GL}" stroke-width="4"/>`;
    return wrap('0 0 620 800', `
      <ellipse cx="380" cy="380" rx="280" ry="340" fill="url(#gGlow)" opacity=".8"/>
      <rect x="60" y="720" width="520" height="40" rx="6" fill="url(#gGold)"/>
      <polygon points="110,720 430,352 430,720" fill="url(#gEm)" stroke="url(#gGold)" stroke-width="6"/>
      <g clip-path="none">${lattice}</g>${steps}
      <path d="M120 620 L462 240" stroke="url(#gGold)" stroke-width="10" stroke-linecap="round"/>${balust}
      <rect x="430" y="120" width="140" height="600" fill="url(#gEm)" stroke="url(#gGold)" stroke-width="6"/>
      <rect x="430" y="340" width="140" height="18" fill="url(#gGold)"/>
      <rect x="436" y="140" width="14" height="200" fill="${G}"/><rect x="550" y="140" width="14" height="200" fill="${G}"/>
      <path d="M430 120 Q500 20 570 120Z" fill="url(#gGold)"/>
      <rect x="497" y="0" width="6" height="40" fill="${G}"/>
      <g transform="translate(476 -22) scale(.5)">${crescent().replace(/<\/?svg[^>]*>/g, '')}</g>
      <text x="500" y="250" font-size="40" fill="${GL}" text-anchor="middle" font-family="Amiri,'Noto Naskh Arabic',serif" direction="rtl" transform="rotate(-90 500 250)">${arTop}</text>
      <path d="M200 720 V610 Q240 560 280 610 V720Z" fill="${E0}" stroke="url(#gGold)" stroke-width="5"/>
      <text x="240" y="600" font-size="22" fill="${GL}" text-anchor="middle" font-family="Amiri,'Noto Naskh Arabic',serif" direction="rtl">${arDoor}</text>
      <text x="500" y="520" font-size="30" fill="${GL}" text-anchor="middle" font-family="Amiri,'Noto Naskh Arabic',serif" direction="rtl">اللَّه</text>
      <text x="500" y="600" font-size="22" fill="${G}" text-anchor="middle" font-family="Amiri,'Noto Naskh Arabic',serif" direction="rtl">مُحَمَّدٌ رَسُولُ اللَّهِ</text>`);
  }

  function kaaba() {
    return wrap('0 0 300 300', `<polygon points="40,90 170,60 270,90 270,260 170,290 40,260" fill="#111"/>
      <polygon points="170,60 270,90 270,260 170,290" fill="#000"/>
      <polygon points="40,120 170,92 270,120 270,140 170,112 40,140" fill="url(#gGold)"/>
      <rect x="196" y="190" width="40" height="70" fill="url(#gGold)" opacity=".9"/>`);
  }
  function greenDome() {
    let ribs = '';
    for (let i = 0; i < 9; i++) ribs += `<path d="M${90 + i * 30} 300 Q${150 + (i - 4) * 18} 120 210 90" stroke="#0a5a2e" stroke-width="2" fill="none" opacity=".7"/>`;
    return wrap('0 0 420 400', `<circle cx="210" cy="210" r="200" fill="url(#gGlow)"/>
      <path d="M70 300 Q70 120 210 90 Q350 120 350 300Z" fill="url(#gGreen)"/>${ribs}
      <rect x="60" y="300" width="300" height="60" fill="url(#gGreen)"/><rect x="60" y="300" width="300" height="8" fill="url(#gGold)"/>
      <rect x="206" y="40" width="8" height="52" fill="url(#gGold)"/><circle cx="210" cy="36" r="9" fill="${G}"/>
      <path d="M340 360 V140 H380 V360Z" fill="${CR}" stroke="${GD}" stroke-width="3"/><path d="M332 200 H388 M332 260 H388" stroke="#22a35a" stroke-width="8"/>
      <path d="M340 140 L360 80 L380 140Z" fill="${CR}" stroke="${GD}" stroke-width="3"/>`);
  }
  function openBook() {
    let lines = '';
    for (let i = 0; i < 6; i++) lines += `<path d="M70 ${110 + i * 26} Q130 ${100 + i * 26} 190 ${110 + i * 26}M230 ${110 + i * 26} Q290 ${100 + i * 26} 350 ${110 + i * 26}" stroke="${GD}" stroke-width="3" fill="none" opacity=".6"/>`;
    return wrap('0 0 420 300', `<ellipse cx="210" cy="140" rx="220" ry="150" fill="url(#gGlow)"/>
      <path d="M20 80 Q110 50 210 80 Q310 50 400 80 V270 Q310 240 210 270 Q110 240 20 270Z" fill="url(#gGoldV)"/>
      <path d="M40 70 Q120 40 205 70 V250 Q120 220 40 250Z" fill="${CR}"/><path d="M215 70 Q300 40 380 70 V250 Q300 220 215 250Z" fill="${CR}"/>${lines}`);
  }
  function bookCover(ar, num) {
    return wrap('0 0 500 640', `<rect x="20" y="20" width="460" height="600" rx="24" fill="url(#gEm)" stroke="url(#gGold)" stroke-width="10"/>
      <rect x="50" y="50" width="400" height="540" rx="14" fill="none" stroke="${G}" stroke-width="3"/>
      <g transform="translate(180 90) scale(1.4)">${star8(50, 50, 46, 'none', G, 3).replace('', '')}</g>
      <polygon points="${starPts(250, 160, 40, 20, 8)}" fill="url(#gGold)"/>
      <text x="250" y="330" font-size="58" fill="${GL}" text-anchor="middle" font-family="Amiri,'Noto Naskh Arabic',serif" direction="rtl">${ar}</text>
      <path d="M110 370 H390" stroke="${G}" stroke-width="3"/>
      <text x="250" y="470" font-size="54" fill="${GL}" text-anchor="middle" font-family="Amiri,'Noto Naskh Arabic',serif" direction="rtl">${num}</text>
      <rect x="20" y="20" width="40" height="600" fill="url(#gGold)" opacity=".5"/>`);
  }
  function rug(c1) {
    return wrap('0 0 240 400', `<rect x="10" y="10" width="220" height="380" rx="10" fill="${c1 || '#7a1f2b'}" stroke="url(#gGold)" stroke-width="8"/>
      <path d="M40 360 V150 Q40 60 120 40 Q200 60 200 150 V360Z" fill="none" stroke="${G}" stroke-width="5"/>
      <path d="M70 360 V170 Q70 100 120 85 Q170 100 170 170 V360Z" fill="rgba(227,194,107,.18)"/>
      <polygon points="${starPts(120, 140, 18, 8, 8)}" fill="${G}"/>
      <path d="M10 10 v-0 M20 390 v14 M60 390 v14 M100 390 v14 M140 390 v14 M180 390 v14 M220 390 v14" stroke="${G}" stroke-width="3"/>`);
  }
  function charity() {
    return wrap('0 0 200 200', `<rect x="30" y="70" width="140" height="110" rx="12" fill="url(#gGold)"/>
      <rect x="70" y="80" width="60" height="10" rx="5" fill="${E0}"/><circle cx="100" cy="40" r="22" fill="${GL}" stroke="${GD}" stroke-width="4"/>
      <path d="M60 130 Q100 160 140 130" stroke="${E0}" stroke-width="6" fill="none"/>`);
  }
  function moonZ() {
    return wrap('0 0 200 200', `<g transform="translate(20 40) scale(1.3)">${crescent().replace(/<\/?svg[^>]*>/g, '')}</g>
      <text x="130" y="70" font-size="40" fill="${GL}" font-family="DejaVu Sans,sans-serif" font-weight="700">z</text>
      <text x="155" y="40" font-size="28" fill="${GL}" font-family="DejaVu Sans,sans-serif" font-weight="700">z</text>`);
  }
  function prayer() {
    return wrap('0 0 200 200', `<path d="M40 180 V90 Q40 30 100 20 Q160 30 160 90 V180Z" fill="none" stroke="url(#gGold)" stroke-width="10"/>
      <polygon points="${starPts(100, 80, 22, 10, 8)}" fill="${GL}"/>`);
  }
  function fasting() {
    return wrap('0 0 200 200', `<g transform="translate(10 10) scale(1.2)">${crescent().replace(/<\/?svg[^>]*>/g, '')}</g>
      <path d="M120 150 Q130 120 150 110 Q170 120 180 150Z" fill="url(#gGold)"/><rect x="120" y="150" width="60" height="12" fill="${GD}"/>`);
  }
  function bulb() {
    return wrap('0 0 300 360', `<circle cx="150" cy="140" r="150" fill="url(#gWhite)"/>
      <path d="M150 40 C80 40 60 120 90 160 C110 190 115 210 115 240 H185 C185 210 190 190 210 160 C240 120 220 40 150 40Z" fill="${GL}" stroke="${GD}" stroke-width="5"/>
      <path d="M130 240 V180 L150 160 L170 180 V240" stroke="${GD}" stroke-width="4" fill="none"/>
      <rect x="112" y="250" width="76" height="16" rx="6" fill="url(#gGold)"/><rect x="118" y="272" width="64" height="16" rx="6" fill="url(#gGold)"/>
      <path d="M135 296 H165 L158 312 H142Z" fill="${GD}"/>`);
  }
  function stopwatch() {
    return wrap('0 0 300 340', `<rect x="130" y="10" width="40" height="30" rx="6" fill="url(#gGold)"/>
      <circle cx="150" cy="190" r="130" fill="url(#gEm)" stroke="url(#gGold)" stroke-width="10"/>
      <circle cx="150" cy="190" r="108" fill="none" stroke="rgba(227,194,107,.2)" stroke-width="14"/>
      <circle class="sw-ring" cx="150" cy="190" r="108" fill="none" stroke="${GL}" stroke-width="14" stroke-linecap="round" stroke-dasharray="678.6" stroke-dashoffset="0" transform="rotate(-90 150 190)"/>
      <line class="sw-hand" x1="150" y1="190" x2="150" y2="105" stroke="${GL}" stroke-width="8" stroke-linecap="round"/>
      <circle cx="150" cy="190" r="10" fill="${G}"/>`);
  }
  function heart() {
    return wrap('0 0 300 280', `<circle cx="150" cy="140" r="140" fill="url(#gGlow)"/>
      <path d="M150 250 C40 170 20 120 40 80 C60 40 120 40 150 90 C180 40 240 40 260 80 C280 120 260 170 150 250Z" fill="url(#gGold)" stroke="${GL}" stroke-width="4"/>
      <path d="M90 90 Q100 70 120 72" stroke="${CR}" stroke-width="8" stroke-linecap="round" fill="none" opacity=".7"/>`);
  }
  function eye() {
    return wrap('0 0 300 180', `<path d="M10 90 Q150 -20 290 90 Q150 200 10 90Z" fill="${CR}" stroke="url(#gGold)" stroke-width="8"/>
      <circle cx="150" cy="90" r="48" fill="${E1}"/><circle cx="150" cy="90" r="22" fill="${E0}"/><circle cx="135" cy="76" r="9" fill="#fff"/>`);
  }
  function coins() {
    let b = '';
    for (let i = 0; i < 4; i++) b += `<ellipse cx="100" cy="${160 - i * 24}" rx="70" ry="20" fill="url(#gGold)" stroke="${GD}" stroke-width="4"/>`;
    b += `<circle cx="155" cy="60" r="38" fill="url(#gGold)" stroke="${GD}" stroke-width="4"/><circle cx="155" cy="60" r="24" fill="none" stroke="${GD}" stroke-width="3"/>`;
    return wrap('0 0 200 200', b);
  }
  function ring() {
    return wrap('0 0 200 200', `<circle cx="100" cy="125" r="58" fill="none" stroke="url(#gGold)" stroke-width="16"/>
      <polygon points="100,20 128,48 100,76 72,48" fill="#cfe9ff" stroke="${GL}" stroke-width="4"/>`);
  }
  function share() {
    return wrap('0 0 120 120', `<circle cx="90" cy="25" r="16" fill="${GL}"/><circle cx="30" cy="60" r="16" fill="${GL}"/><circle cx="90" cy="95" r="16" fill="${GL}"/>
      <path d="M90 25 L30 60 L90 95" stroke="${GL}" stroke-width="8" fill="none"/>`);
  }
  function comment() {
    return wrap('0 0 120 120', `<path d="M15 20 H105 V85 H50 L25 108 V85 H15Z" fill="${GL}"/>
      <path d="M35 45 H85 M35 62 H70" stroke="${E0}" stroke-width="7" stroke-linecap="round"/>`);
  }
  function like() {
    return wrap('0 0 120 120', `<path d="M60 105 C15 75 5 50 15 32 C25 14 50 14 60 36 C70 14 95 14 105 32 C115 50 105 75 60 105Z" fill="${GL}"/>`);
  }
  function sunrise() {
    let rays = '';
    for (let i = 0; i < 13; i++) {
      const a = Math.PI + Math.PI * i / 12;
      rays += `<line x1="${400 + 170 * Math.cos(a)}" y1="${330 + 170 * Math.sin(a)}" x2="${400 + 300 * Math.cos(a)}" y2="${330 + 300 * Math.sin(a)}" stroke="${GL}" stroke-width="8" stroke-linecap="round" opacity=".8"/>`;
    }
    return wrap('0 0 800 400', `<rect width="800" height="400" rx="40" fill="url(#gSky)" opacity=".55"/>${rays}
      <circle cx="400" cy="330" r="150" fill="url(#gGold)"/><rect x="0" y="330" width="800" height="70" fill="${E0}"/>
      <path d="M0 330 H800" stroke="${G}" stroke-width="4"/>`);
  }
  function question() {
    return wrap('0 0 300 400', `<circle cx="150" cy="200" r="150" fill="url(#gGlow)"/>
      <path d="M85 120 Q85 40 150 40 Q220 40 220 115 Q220 160 170 185 Q150 197 150 235 V255" stroke="url(#gGold)" stroke-width="40" fill="none" stroke-linecap="round"/>
      <circle cx="150" cy="320" r="26" fill="url(#gGold)"/>`);
  }
  function corner() {
    return wrap('0 0 100 100', `<path d="M6 94 V30 Q6 6 30 6 H94" stroke="url(#gGold)" stroke-width="6" fill="none"/>
      <path d="M20 94 V40 Q20 20 40 20 H94" stroke="${G}" stroke-width="2" fill="none"/>${star8(22, 22, 9, G)}`);
  }
  function divider() {
    return wrap('0 0 600 40', `<path d="M0 20 H260 M340 20 H600" stroke="url(#gGold)" stroke-width="3"/>${star8(300, 20, 16, 'url(#gGold)')}`);
  }
  function bracket() {
    return wrap('0 0 800 100', `<path d="M10 10 Q10 50 60 50 H360 Q400 50 400 90 Q400 50 440 50 H740 Q790 50 790 10" stroke="url(#gGold)" stroke-width="8" fill="none" stroke-linecap="round"/>`);
  }
  function dotted(w) {
    return wrap(`0 0 ${w} 40`, `<path d="M10 20 H${w - 10}" stroke="${GL}" stroke-width="8" stroke-dasharray="2 22" stroke-linecap="round"/>
      <polygon points="${w - 6},20 ${w - 30},6 ${w - 30},34" fill="${G}"/>`);
  }
  function burst() {
    let r = '';
    for (let i = 0; i < 24; i++) {
      const a = Math.PI * 2 * i / 24;
      r += `<line x1="${300 + 90 * Math.cos(a)}" y1="${300 + 90 * Math.sin(a)}" x2="${300 + 290 * Math.cos(a)}" y2="${300 + 290 * Math.sin(a)}" stroke="${GL}" stroke-width="${i % 2 ? 4 : 8}" stroke-linecap="round" opacity=".8"/>`;
    }
    return wrap('0 0 600 600', `<circle cx="300" cy="300" r="300" fill="url(#gGlow)"/>${r}`);
  }
  function arcs() {
    return wrap('0 0 300 300', [70, 120, 170].map(r => `<path d="M${150 - r * 0.6} ${150 - r * 0.8} A${r} ${r} 0 0 1 ${150 - r * 0.6} ${150 + r * 0.8}" transform="rotate(180 150 150)" stroke="${GL}" stroke-width="8" fill="none" stroke-linecap="round"/>`).join(''));
  }
  function halo() { return wrap('0 0 100 100', `<circle cx="50" cy="50" r="50" fill="url(#gWhite)"/>`); }
  function lightBeam() { return wrap('0 0 200 600', `<polygon points="80,0 120,0 200,600 0,600" fill="url(#gBeam)"/>`); }

  window.ART = { DEFS, star8svg, medallion, patternTile, crescent, crescentStar, lantern, skyline, minbar, kaaba, greenDome,
    openBook, bookCover, rug, charity, moonZ, prayer, fasting, bulb, stopwatch, heart, eye, coins, ring, share, comment,
    like, sunrise, question, corner, divider, bracket, dotted, burst, arcs, halo, lightBeam };
})();
