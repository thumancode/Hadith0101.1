/* PROFESSIONAL SCENES ENGINE - DETERMINISTIC, NO SETTIMEOUT, NO RANDOM DURING RENDER */
let LAYOUT, STAGE;
let tracks = [];
let subtitleWords = [];
let LINES = [];
let DURATION = 82;

// emotion -> glow color
const EMOTION_COLORS = {
  respectful: '#e3c26b',
  informative: '#6bc4a6',
  solemn: '#f8e7ae',
  serious: '#f0c070',
  calm: '#88d8c0',
  thoughtful: '#e3c26b',
  warm: '#f8d48a',
  compassionate: '#7bd5b0',
  optimistic: '#f8e7ae',
  friendly: '#e3c26b',
  encouraging: '#7ae0a8',
  store: '#e3c26b',
};

function seededRandom(seed){ let s=seed; return ()=>{ s=(s*9301+49297)%233280; return s/233280; }; }
const rnd = seededRandom(42);

function track(el, start, end, opts={}){
  if(!el) return;
  tracks.push({el, start, end, a:opts.a||'fade', i:opts.i||0.4, o:opts.o||0.4, fn:opts.fn||null});
}

function parseTimestamps(text){
  const lines=[];
  text.trim().split('\n').forEach(l=>{
    const p=l.split('|').map(s=>s.trim());
    if(p.length<3) return;
    const s=parseFloat(p[0]), e=parseFloat(p[1]), txt=p[2], tag=(p[3]||'informative').toLowerCase();
    if(!isNaN(s)&&!isNaN(e)&&txt) lines.push({s,e,text:txt,tag});
  });
  return lines;
}

function isGoldWord(w){
  const golds=['আল্লাহ','নিয়ত','নিয়তের','ইবাদত','নামাজ','রোজা','দান','হিজরত','শেয়ার','ইনস্টল','প্লে','আল হাদিস','বিশ্বকোষ','ইসলামী'];
  return golds.some(g=>w.includes(g));
}

function buildSubtitle(text){
  const panel=document.getElementById('subtitleText');
  panel.innerHTML='';
  subtitleWords=[];
  const words=text.split(/(\s+)/);
  words.forEach(w=>{
    if(!w) return;
    const span=document.createElement('span');
    span.className='subtitle-word';
    if(w.trim() && isGoldWord(w.trim())) span.classList.add('gold');
    span.textContent=w;
    panel.appendChild(span);
    if(w.trim()) subtitleWords.push({el:span, text:w});
  });
  return subtitleWords;
}

// SVG builders - professional Islamic art
function svgMedallion(size){
  return `<svg width="${size}" height="${size}" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="g" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#f8e7ae" stop-opacity="0.9"/><stop offset="100%" stop-color="#a67c28" stop-opacity="0.15"/></radialGradient></defs>
    <g opacity="0.22"><path d="M100 10 L115 75 L180 75 L128 115 L145 180 L100 138 L55 180 L72 115 L20 75 L85 75 Z" fill="none" stroke="#e3c26b" stroke-width="1.2"/>
    <path d="M100 20 L110 80 L170 80 L120 115 L135 170 L100 135 L65 170 L80 115 L30 80 L90 80 Z" fill="none" stroke="#e3c26b" stroke-width="0.8" opacity="0.6"/>
    <circle cx="100" cy="100" r="78" fill="none" stroke="#e3c26b" stroke-width="0.6" stroke-dasharray="6 6" opacity="0.5"/>
    <circle cx="100" cy="100" r="58" fill="none" stroke="#e3c26b" stroke-width="0.5" opacity="0.4"/></g>
    <g opacity="0.14"><text x="100" y="108" text-anchor="middle" font-family="Amiri,serif" font-size="38" fill="url(#g)">﷽</text></g>
  </svg>`;
}
function svgMinbar(){
  return `<svg width="360" height="300" viewBox="0 0 360 300" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f8e7ae"/><stop offset="100%" stop-color="#a67c28"/></linearGradient></defs>
    <g opacity="0.9">
      <path d="M70 250 L70 90 L90 70 L130 70 L130 250 Z" fill="#0e3a2f" stroke="#e3c26b" stroke-width="1.2"/>
      <g fill="none" stroke="#e3c26b" stroke-width="0.7" opacity="0.5">
        <path d="M78 100 L122 100 M78 125 L122 125 M78 150 L122 150 M78 175 L122 175 M78 200 L122 200"/>
        <path d="M78 100 L78 250 M100 70 L100 250 M122 100 L122 250"/>
      </g>
      <path d="M130 250 L310 250 L310 230 L150 230 L150 190 L130 190 Z" fill="#0b2e24" stroke="#e3c26b" stroke-width="1.2"/>
      <g fill="#e3c26b" opacity="0.18"><circle cx="160" cy="238" r="2"/><circle cx="180" cy="238" r="2"/><circle cx="200" cy="238" r="2"/><circle cx="220" cy="238" r="2"/><circle cx="240" cy="238" r="2"/><circle cx="260" cy="238" r="2"/><circle cx="280" cy="238" r="2"/></g>
      <rect x="140" y="60" width="140" height="140" rx="6" fill="#08261e" stroke="url(#gold)" stroke-width="1.4"/>
      <text x="210" y="105" text-anchor="middle" font-family="Amiri,serif" font-size="22" fill="#e3c26b" opacity="0.9">لَا إِلَهَ إِلَّا اللَّهُ</text>
      <text x="210" y="132" text-anchor="middle" font-family="Amiri,serif" font-size="18" fill="#f8e7ae" opacity="0.8">مُحَمَّدٌ رَسُولُ اللَّهِ</text>
      <text x="210" y="165" text-anchor="middle" font-family="Amiri,serif" font-size="14" fill="#e3c26b" opacity="0.6">اللَّهُ أَكْبَرُ</text>
      <path d="M140 60 L140 45 L150 35 L270 35 L280 45 L280 60" fill="none" stroke="#e3c26b" stroke-width="1.2"/>
      <circle cx="210" cy="22" r="10" fill="none" stroke="#e3c26b" stroke-width="1"/><path d="M210 16 Q215 12 210 8 Q205 12 210 16" fill="#e3c26b"/>
    </g>
  </svg>`;
}
function svgBook(){
  return `<svg width="320" height="200" viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg">
    <path d="M30 40 Q160 10 290 40 L290 160 Q160 190 30 160 Z" fill="#0d3b2e" stroke="#e3c26b" stroke-width="1.3"/>
    <path d="M30 40 Q160 70 290 40" fill="none" stroke="#e3c26b" stroke-width="0.8" opacity="0.6"/>
    <path d="M160 22 L160 175" stroke="#a67c28" stroke-width="0.8" opacity="0.5"/>
    <text x="95" y="95" text-anchor="middle" font-family="Amiri,serif" font-size="24" fill="#f8e7ae">صَحِيحُ</text>
    <text x="95" y="120" text-anchor="middle" font-family="Amiri,serif" font-size="20" fill="#e3c26b">الْبُخَارِيِّ</text>
    <text x="225" y="95" text-anchor="middle" font-family="Amiri,serif" font-size="22" fill="#f8e7ae">كِتَابُ</text>
    <text x="225" y="120" text-anchor="middle" font-family="Amiri,serif" font-size="18" fill="#e3c26b">الْوَحْيِ</text>
  </svg>`;
}
function svgKaabaDome(){
  return `<svg width="420" height="220" viewBox="0 0 420 220" xmlns="http://www.w3.org/2000/svg">
    <rect x="40" y="70" width="110" height="90" fill="#0a0a0a" stroke="#e3c26b" stroke-width="1"/><rect x="40" y="110" width="110" height="8" fill="#f8e7ae" opacity="0.9"/>
    <path d="M200 130 Q260 20 320 130 Q260 145 200 130" fill="#145c2a" stroke="#1e8a3e" stroke-width="1.2"/>
    <g opacity="0.9"><path d="M200 135 Q260 30 320 135" fill="none" stroke="#2fbb4e" stroke-width="0.5" opacity="0.5"/></g>
    <rect x="256" y="10" width="8" height="22" fill="#c9a24a"/><circle cx="260" cy="8" r="6" fill="none" stroke="#e3c26b" stroke-width="1.2"/>
  </svg>`;
}

function createScene(id){
  const el=document.createElement('div'); el.className='scene'; el.id=id; return el;
}

async function init(){
  // parse ratio
  const params=new URLSearchParams(location.search);
  const ratioKey=params.get('ratio')||'9x16';
  if(!LAYOUTS[ratioKey]){ document.body.innerHTML=`<div style="color:white;padding:40px">Unknown ratio ${ratioKey}</div>`; throw new Error('Unknown ratio '+ratioKey); }
  LAYOUT=LAYOUTS[ratioKey];
  STAGE=LAYOUT.stage;

  const root=document.getElementById('root');
  root.style.width=LAYOUT.w+'px'; root.style.height=LAYOUT.h+'px';

  // position elements per layout
  const bb=document.getElementById('brandBar'); bb.style.left=LAYOUT.brandBar.x+'px'; bb.style.top=LAYOUT.brandBar.y+'px'; bb.style.width=LAYOUT.brandBar.w+'px'; bb.style.height=LAYOUT.brandBar.h+'px';
  const st=document.getElementById('stage'); st.style.left=STAGE.x+'px'; st.style.top=STAGE.y+'px'; st.style.width=STAGE.w+'px'; st.style.height=STAGE.h+'px';
  const sp=document.getElementById('subtitlePanel'); sp.style.left=LAYOUT.subtitle.x+'px'; sp.style.top=LAYOUT.subtitle.y+'px'; sp.style.width=LAYOUT.subtitle.w+'px'; sp.style.height=LAYOUT.subtitle.h+'px';
  sp.style.fontSize=LAYOUT.subtitle.font+'px';
  const pw=document.getElementById('progressWrap'); pw.style.left=LAYOUT.progress.x+'px'; pw.style.top=LAYOUT.progress.y+'px'; pw.style.width=LAYOUT.progress.w+'px'; pw.style.height=LAYOUT.progress.h+'px';

  // background pattern - Islamic star tile via SVG
  const pat=document.getElementById('bgPattern');
  pat.innerHTML=`<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="islamic" width="120" height="120" patternUnits="userSpaceOnUse" patternTransform="rotate(15)"><path d="M60 0 L72 40 L110 60 L72 80 L60 120 L48 80 L10 60 L48 40 Z" fill="none" stroke="#e3c26b" stroke-width="0.6" opacity="0.35"/><circle cx="60" cy="60" r="18" fill="none" stroke="#e3c26b" stroke-width="0.4" opacity="0.25"/></pattern></defs><rect width="100%" height="100%" fill="url(#islamic)"/></svg>`;

  // skyline
  document.getElementById('skyline').innerHTML=`<svg width="100%" height="100%" viewBox="0 0 1080 200" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 200 L0 140 Q60 120 120 140 T240 135 T360 140 T480 130 T600 140 T720 135 T840 140 T960 130 T1080 140 L1080 200 Z" fill="#02120e"/><g opacity="0.6" fill="#e3c26b"><rect x="100" y="90" width="8" height="50" rx="2"/><rect x="300" y="80" width="8" height="60" rx="2"/><rect x="500" y="85" width="8" height="55" rx="2"/><rect x="750" y="75" width="8" height="65" rx="2"/><rect x="900" y="90" width="8" height="50" rx="2"/></g></svg>`;

  // particles - seeded
  const pc=document.getElementById('particles');
  for(let i=0;i<28;i++){
    const d=document.createElement('div'); d.className='particle';
    const x=rnd()*LAYOUT.w, y=rnd()*LAYOUT.h*0.85, s=1.5+rnd()*3.2;
    d.style.left=x+'px'; d.style.top=y+'px'; d.style.width=s+'px'; d.style.height=s+'px'; d.style.opacity=(0.3+rnd()*0.6).toFixed(2);
    pc.appendChild(d);
  }

  // load timestamps
  let txt='';
  try{ txt=await fetch('timestamps.txt').then(r=>r.text()); }catch(e){ txt=`0.00 | 82.00 | আসসালামু আলাইকুম | respectful`; }
  LINES=parseTimestamps(txt);
  DURATION=Math.ceil(LINES.length?LINES[LINES.length-1].e:82);

  // build scenes
  buildScenes();

  await document.fonts.ready;
  const imgs=[...document.images]; await Promise.all(imgs.map(im=> im.decode?im.decode().catch(()=>{}):Promise.resolve()));
  window.renderAt(0);
  window.__ready=true;
}

function buildScenes(){
  const stage=document.getElementById('stage');
  stage.innerHTML='';
  tracks=[];

  // SCENE 1: Greeting (0-6.5)
  const s1=createScene('s1');
  s1.innerHTML=`
    <div class="icon-hero" id="hero1" style="width:${LAYOUT.iconSize*1.2}px;height:${LAYOUT.iconSize*1.2}px">
      <div class="icon-ring" style="width:140%;height:140%;left:-20%;top:-20%;"></div>
      <div class="icon-ring" style="width:180%;height:180%;left:-40%;top:-40%;opacity:0.6"></div>
      <div class="icon-ring" style="width:220%;height:220%;left:-60%;top:-60%;opacity:0.3"></div>
      <div class="icon-hero-inner" style="width:${LAYOUT.iconSize}px;height:${LAYOUT.iconSize}px"><img src="logo.png" alt=""></div>
    </div>
    <div style="margin-top:26px" id="s1-ar"><div class="card card-gold" style="padding:18px 28px"><div class="card-arabic" style="font-size:46px">ٱلسَّلَامُ عَلَيْكُمْ وَرَحْمَةُ ٱللَّٰهِ</div></div></div>
    <div id="s1-title" class="title-xl" style="margin-top:18px;font-size:36px"><span class="title-gold">ইসলামী বিশ্বকোষ</span> ও আল হাদিস S2</div>
  `;
  stage.appendChild(s1);
  track(s1,0,6.5,{i:0.5,o:0.5}); track(document.getElementById('hero1'),0,6.5,{a:'scale',i:0.7,o:0.5}); track(document.getElementById('s1-ar'),0.6,6.5,{a:'up',i:0.6}); track(document.getElementById('s1-title'),1.0,6.5,{a:'up',i:0.6});

  // SCENE 2: Hook (2.5-10.5)
  const s2=createScene('s2');
  s2.innerHTML=`
    <div class="art-wrap" id="s2-med">${svgMedallion(LAYOUT.medallion)}</div>
    <div class="card" id="s2-card" style="margin-top:-40px;max-width:92%"><div class="title-xl" style="font-size:${LAYOUT.isPortrait?40:34}px">আজকের একটি হাদিস যা<br><span class="title-gold">পুরো জীবনটাই বদলে দিতে পারে</span></div><div class="tagline">নিয়তের শক্তি</div></div>
  `;
  stage.appendChild(s2);
  track(s2,2.5,10.5,{i:0.6,o:0.6}); track(document.getElementById('s2-med'),2.5,10.5,{a:'rotate',i:0.8}); track(document.getElementById('s2-card'),3.0,10.5,{a:'up',i:0.7});

  // SCENE 3: Narrator chain (6.5-15)
  const s3=createScene('s3');
  s3.innerHTML=`
    <div class="card card-gold" id="s3-card" style="width:100%"><div style="font-size:15px;letter-spacing:2px;color:var(--gold-400);text-transform:uppercase;margin-bottom:12px">سِلْسِلَةُ الرِّوَايَةِ</div>
    <div class="card-arabic" style="font-size:${LAYOUT.isPortrait?32:28}px">عَنْ عَلْقَمَةَ بْنِ وَقَّاصٍ اللَّيْثِيِّ<br><span style="color:var(--gold-300);font-size:0.8em">رَحِمَهُ اللَّهُ</span></div>
    <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(227,194,107,0.4),transparent);margin:16px 0"></div>
    <div class="card-bn" style="font-size:${LAYOUT.isPortrait?22:20}px;color:var(--cream-dim)">আলকামা ইবনে ওয়াক্কাস লাইসী রহমাতুল্লাহি আলাইহি থেকে বর্ণিত</div>
    <div style="display:flex;gap:12px;justify-content:center;margin-top:16px"><div style="width:52px;height:52px;border-radius:50%;border:1.5px solid rgba(227,194,107,0.5);display:flex;align-items:center;justify-content:center;color:var(--gold-400)">١</div><div style="width:40px;height:1px;background:rgba(227,194,107,0.3);align-self:center"></div><div style="width:52px;height:52px;border-radius:50%;border:1.5px solid rgba(227,194,107,0.5);display:flex;align-items:center;justify-content:center;color:var(--gold-400)">٢</div><div style="width:40px;height:1px;background:rgba(227,194,107,0.3);align-self:center"></div><div style="width:52px;height:52px;border-radius:50%;border:1.5px solid rgba(227,194,107,0.5);display:flex;align-items:center;justify-content:center;color:var(--gold-400)">٣</div></div>
    </div>
  `;
  stage.appendChild(s3);
  track(s3,6.5,15.0,{i:0.5,o:0.5}); track(document.getElementById('s3-card'),6.8,15.0,{a:'scale',i:0.6});

  // SCENE 4: Minbar (10.5-18.5)
  const s4=createScene('s4');
  s4.innerHTML=`<div class="art-wrap" id="s4-minbar">${svgMinbar()}</div>
    <div class="card" id="s4-card" style="margin-top:10px"><div class="card-arabic" style="font-size:26px">سَمِعْتُ عُمَرَ بْنَ الْخَطَّابِ<br><span style="color:var(--gold-300)">رَضِيَ اللَّهُ عَنْهُ</span> عَلَى الْمِنْبَرِ</div></div>`;
  stage.appendChild(s4);
  track(s4,10.5,18.5,{i:0.5,o:0.5}); track(document.getElementById('s4-minbar'),10.5,18.5,{a:'up',i:0.8}); track(document.getElementById('s4-card'),11.5,18.5,{a:'up',i:0.6});

  // SCENE 5: Rasul quote intro (15-20.8)
  const s5=createScene('s5');
  s5.innerHTML=`<div class="card card-gold" id="s5-card" style="width:100%"><div class="card-arabic" style="font-size:30px;line-height:1.8">سَمِعْتُ رَسُولَ اللَّهِ<br><span style="color:var(--gold-300)">صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ</span> يَقُولُ</div></div><div class="art-wrap" style="margin-top:18px" id="s5-dome">${svgKaabaDome()}</div>`;
  stage.appendChild(s5);
  track(s5,15.0,20.8,{i:0.5,o:0.5}); track(document.getElementById('s5-card'),15.2,20.8,{a:'scale',i:0.6});

  // SCENE 6: Core hadith Arabic (18.5-28.5) - most important
  const s6=createScene('s6');
  s6.innerHTML=`
    <div class="card card-gold" id="s6-card" style="width:100%;padding:32px 24px">
      <div class="card-arabic" style="font-size:${LAYOUT.isPortrait?44:38}px;line-height:2.0" id="arabic1">إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ</div>
      <div style="height:1px;background:rgba(227,194,107,0.3);margin:14px 30%"></div>
      <div class="card-arabic" style="font-size:${LAYOUT.isPortrait?36:32}px;line-height:1.9" id="arabic2">وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى</div>
    </div>
    <div class="chip-row" id="s6-chips"><div class="chip">العمل ↔ النية</div><div class="chip-arrow">→</div><div class="chip">الجزاء</div></div>
  `;
  stage.appendChild(s6);
  track(s6,18.5,32.5,{i:0.5,o:0.7}); track(document.getElementById('s6-card'),18.5,32.5,{a:'scale',i:0.8}); track(document.getElementById('s6-chips'),22.0,32.5,{a:'up',i:0.6});

  // SCENE 7: Explanation hijrat (28.5-40.2)
  const s7=createScene('s7');
  s7.innerHTML=`
    <div class="art-wrap" id="s7-art"><svg width="340" height="140" viewBox="0 0 340 140" xmlns="http://www.w3.org/2000/svg">
      <g opacity="0.9"><circle cx="70" cy="70" r="42" fill="none" stroke="#e3c26b" stroke-width="1.2"/><text x="70" y="76" text-anchor="middle" font-family="Amiri,serif" font-size="28" fill="#f8e7ae">دنيا</text></g>
      <path d="M125 70 L215 70" stroke="#e3c26b" stroke-width="1" stroke-dasharray="6 4" opacity="0.6"/><text x="170" y="58" text-anchor="middle" font-size="18" fill="#e3c26b">→</text>
      <g opacity="0.9"><circle cx="270" cy="70" r="42" fill="rgba(227,194,107,0.1)" stroke="#e3c26b" stroke-width="1.2"/><text x="270" y="76" text-anchor="middle" font-family="Amiri,serif" font-size="22" fill="#f8e7ae">هجرة</text></g>
      <g transform="translate(0,110)" opacity="0.5"><circle cx="70" cy="12" r="14" fill="none" stroke="#e3c26b" stroke-width="0.8"/><text x="70" y="16" text-anchor="middle" font-size="10" fill="#e3c26b">♀</text><path d="M100 12 L240 12" stroke="#e3c26b" stroke-width="0.6" stroke-dasharray="4 3"/></g>
    </svg></div>
    <div class="card" id="s7-card" style="margin-top:10px;width:100%"><div class="card-bn" style="font-size:${LAYOUT.isPortrait?26:22}px">দুনিয়া বা বিয়ের উদ্দেশ্যে হিজরত<br><span style="color:var(--gold-400)">→ সেই উদ্দেশ্যই তার প্রাপ্য</span></div></div>
  `;
  stage.appendChild(s7);
  track(s7,28.5,40.2,{i:0.5,o:0.5}); track(document.getElementById('s7-card'),29.0,40.2,{a:'up',i:0.6});

  // SCENE 8: Source + Reflection (36-66)
  const s8=createScene('s8');
  s8.innerHTML=`
    <div class="art-wrap" id="s8-book">${svgBook()}</div>
    <div class="card card-gold" id="s8-card" style="margin-top:14px;width:100%"><div class="card-bn" style="font-size:20px;color:var(--gold-300);letter-spacing:1px">صَحِيحُ الْبُخَارِيِّ — ١</div><div class="card-arabic" style="font-size:24px;margin-top:6px">رواه البخاري</div></div>
  `;
  stage.appendChild(s8);
  track(s8,36.0,53.0,{i:0.5,o:0.5}); track(document.getElementById('s8-book'),36.0,53.0,{a:'scale',i:0.7});

  // SCENE 9: Same deed, different intention visual (40-62)
  const s9=createScene('s9');
  s9.innerHTML=`
    <div style="display:flex;gap:18px;width:100%" id="s9-split">
      <div class="card" style="flex:1;padding:20px 14px"><div style="width:48px;height:48px;margin:0 auto 10px;border-radius:50%;background:rgba(227,194,107,0.15);border:1px solid rgba(227,194,107,0.4);display:flex;align-items:center;justify-content:center">🕌</div><div class="card-bn" style="font-size:18px">আল্লাহর জন্য</div><div style="margin-top:8px;height:3px;background:#1e7a64;border-radius:3px"></div></div>
      <div class="card" style="flex:1;padding:20px 14px;opacity:0.6"><div style="width:48px;height:48px;margin:0 auto 10px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center">👁️</div><div class="card-bn" style="font-size:18px">মানুষকে দেখানোর জন্য</div><div style="margin-top:8px;height:3px;background:rgba(255,255,255,0.15);border-radius:3px"></div></div>
    </div>
    <div class="card" id="s9-msg" style="margin-top:16px;width:100%"><div class="card-bn" style="font-size:22px">বাইরে একই রকম<br><span style="color:var(--gold-400);font-weight:700">আল্লাহর কাছে আকাশ-পাতাল পার্থক্য</span></div></div>
  `;
  stage.appendChild(s9);
  track(s9,40.2,56.5,{i:0.5,o:0.5}); track(document.getElementById('s9-split'),40.5,56.5,{a:'up',i:0.6}); track(document.getElementById('s9-msg'),44.0,56.5,{a:'scale',i:0.5});

  // SCENE 10: Ibadat transformation (53-69.5)
  const s10=createScene('s10');
  s10.innerHTML=`
    <div class="card card-gold" id="s10-card" style="width:100%">
      <div style="font-size:14px;letter-spacing:2px;color:var(--gold-400);margin-bottom:14px">كُلُّ عَمَلٍ عِبَادَةٌ بِالنِّيَّةِ</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="chip" style="justify-content:center;display:flex">নামাজ</div><div class="chip" style="justify-content:center;display:flex">রোজা</div>
        <div class="chip" style="justify-content:center;display:flex">দান</div><div class="chip" style="justify-content:center;display:flex;background:rgba(124,220,170,0.18);border-color:rgba(124,220,170,0.4)">ঘুমও ইবাদত</div>
      </div>
      <div style="margin-top:16px;font-size:20px;color:var(--cream-dim)">নিয়ত ঠিক থাকলে</div>
    </div>
  `;
  stage.appendChild(s10);
  track(s10,53.0,69.5,{i:0.5,o:0.5}); track(document.getElementById('s10-card'),53.2,69.5,{a:'scale',i:0.6});

  // SCENE 11: Heart story (60-78)
  const s11=createScene('s11');
  s11.innerHTML=`
    <div class="icon-hero" id="s11-heart" style="width:120px;height:120px"><div class="icon-hero-inner" style="width:120px;height:120px;border-radius:50%;background:radial-gradient(circle at 35% 30%, #f8e7ae, #a67c28);display:flex;align-items:center;justify-content:center;font-size:52px">♥</div></div>
    <div class="card" id="s11-card" style="margin-top:18px;width:100%"><div class="card-bn" style="font-size:24px;line-height:1.6">নিয়ত হলো <span style="color:var(--gold-400)">অন্তরের গল্প</span><br><span style="font-size:20px;color:var(--cream-dim)">দুনিয়া দেখে কাজ, আল্লাহ দেখেন নিয়ত</span></div></div>
    <div class="card" id="s11-q" style="margin-top:14px;width:100%;background:rgba(227,194,107,0.10)"><div class="card-bn" style="font-size:22px">আমি এটা কেন করছি?</div></div>
  `;
  stage.appendChild(s11);
  track(s11,60.0,78.0,{i:0.5,o:0.5}); track(document.getElementById('s11-heart'),60.0,78.0,{a:'scale',i:0.7}); track(document.getElementById('s11-card'),61.0,78.0,{a:'up',i:0.6}); track(document.getElementById('s11-q'),69.5,78.0,{a:'scale',i:0.5});

  // SCENE 12: Final CTA (74.8-82)
  const s12=createScene('s12');
  s12.innerHTML=`
    <div class="icon-hero" id="s12-icon" style="width:${LAYOUT.iconSize*1.3}px;height:${LAYOUT.iconSize*1.3}px">
      <div class="icon-ring" style="width:150%;height:150%;left:-25%;top:-25%"></div>
      <div class="icon-ring" style="width:190%;height:190%;left:-45%;top:-45%;opacity:0.4"></div>
      <div class="icon-hero-inner" style="width:${LAYOUT.iconSize*1.15}px;height:${LAYOUT.iconSize*1.15}px"><img src="logo.png" alt=""></div>
    </div>
    <div class="card card-gold" id="s12-title" style="margin-top:20px;width:100%"><div class="title-xl" style="font-size:${LAYOUT.isPortrait?30:26}px">ইসলামী বিশ্বকোষ ও আল হাদিস S2</div><div class="tagline">প্রতিদিন একটি হাদিস, বদলে যাবে জীবন</div></div>
    <div class="store-badge" id="s12-badge" style="margin-top:20px"><img src="google-play-badge.png" alt="Get it on Google Play"></div>
  `;
  stage.appendChild(s12);
  track(s12,74.8,82.0,{i:0.6,o:0.6}); track(document.getElementById('s12-icon'),74.8,82.0,{a:'scale',i:0.8}); track(document.getElementById('s12-title'),75.5,82.0,{a:'up',i:0.6}); track(document.getElementById('s12-badge'),76.5,82.0,{a:'up',i:0.6});
}

function renderAt(t){
  // progress
  const prog=Math.min(1, Math.max(0, t/DURATION));
  document.getElementById('progressBar').style.width=(prog*100)+'%';

  // glow color by current line tag
  const curLine=LINES.find(l=> t>=l.s && t<l.e) || LINES[LINES.length-1] || {tag:'informative'};
  const glowColor=EMOTION_COLORS[curLine.tag]||'#e3c26b';
  const glowEl=document.getElementById('bgGlow');
  if(glowEl){ glowEl.style.background=`radial-gradient(circle, ${glowColor} 0%, transparent 70%)`; }

  // deterministic particle twinkle
  const particles=document.querySelectorAll('.particle');
  particles.forEach((p,i)=>{
    const phase=(t*0.8 + i*1.37) % (Math.PI*2);
    const tw=0.5+0.5*Math.sin(phase);
    p.style.opacity=(0.2+tw*0.6).toFixed(2);
    p.style.transform=`translateY(${Math.sin(t*0.3+i)*4}px)`;
  });

  // rotate medallions
  const rot=(t*6)%360;
  document.querySelectorAll('[id*="med"] svg').forEach(svg=>{ svg.style.transform=`rotate(${rot}deg)`; });

  // scene tracks
  tracks.forEach(tr=>{
    const {el,start,end,i,o,a}=tr;
    if(t<start || t>=end){
      if(t<start){ el.style.opacity='0'; el.style.visibility='hidden'; el.style.transform=''; }
      else if(a!=='fade'){ /* keep final but hide container handles it */ }
      if(el.classList.contains('scene')){ el.style.opacity='0'; el.style.visibility='hidden'; }
      return;
    }
    if(el.classList.contains('scene')){ el.style.opacity='1'; el.style.visibility='inherit'; return; }
    const dur=end-start;
    const local=t-start;
    let op=1, ty=0, sc=1, ro=0;
    if(local < i){ const p=local/i; op=p; if(a==='up') ty=20*(1-p); if(a==='scale') sc=0.92+0.08*p; }
    else if(local > dur - o){ const p=(dur-local)/o; op=Math.max(0,p); if(a==='up') ty=20*(1-p); if(a==='scale') sc=0.92+0.08*p; }
    else { op=1; ty=0; sc=1; }
    if(a==='rotate') ro=(t*8)%360;
    el.style.opacity=op.toString();
    el.style.visibility='inherit';
    let tf='';
    if(a==='up' || ty!==0) tf+=`translateY(${ty}px) `;
    if(a==='scale' || sc!==1) tf+=`scale(${sc}) `;
    if(a==='rotate') tf+=`rotate(${ro}deg) `;
    if(tf) el.style.transform=tf.trim();
  });

  // brand bar visibility logic
  const brand=document.getElementById('brandBar');
  const showBrand = t>6.5 && t<74.8;
  brand.style.opacity=showBrand?'1':'0';
  brand.style.visibility=showBrand?'inherit':'hidden';

  // subtitle handling
  const subPanel=document.getElementById('subtitlePanel');
  const activeLine=LINES.find(l=> t>=l.s && t<l.e);
  if(!activeLine){
    subPanel.style.opacity='0'; subPanel.style.visibility='hidden';
  } else {
    // if subtitle content changed, rebuild words
    if(subPanel.dataset.text !== activeLine.text){
      subPanel.dataset.text=activeLine.text;
      buildSubtitle(activeLine.text);
      subPanel.style.opacity='1'; subPanel.style.visibility='inherit';
    } else {
      subPanel.style.opacity='1'; subPanel.style.visibility='inherit';
    }
    // word reveal - weighted by char count ~86% duration
    const lineDur=activeLine.e - activeLine.s;
    const revealDur=lineDur*0.86;
    const totalChars=subtitleWords.reduce((s,w)=>s+w.text.length,0)||1;
    let acc=0;
    subtitleWords.forEach(w=>{
      const charW=w.text.length/totalChars;
      const startFrac=acc/totalChars;
      const wStart=activeLine.s + startFrac*revealDur;
      const wEnd=wStart + 0.28;
      acc+=w.text.length;
      if(t>=wStart) w.el.classList.add('visible'); else w.el.classList.remove('visible');
      w.el.style.transition=`opacity 0.28s ease ${Math.max(0,wStart-activeLine.s).toFixed(3)}s, transform 0.28s ease ${Math.max(0,wStart-activeLine.s).toFixed(3)}s`;
    });
  }
}

window.renderAt=renderAt;
window.addEventListener('load',()=>{ init().catch(e=>{ console.error(e); document.body.innerHTML='<pre style="color:white">'+e.stack+'</pre>'; }); });
