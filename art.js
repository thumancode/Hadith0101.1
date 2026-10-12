// Inline SVG vector art (no external assets). Every function returns an SVG string.
const GOLD='#e3c26b',GL='#f8e7ae',GD='#a67c28';
const ARF='font-family="Amiri,Noto Naskh Arabic,FreeSerif,serif"';
const A={};
const sv=(w,h,body,vb)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${vb||`0 0 ${w} ${h}`}" style="overflow:visible;display:block">${body}</svg>`;
A.star=(cx,cy,r,ir)=>{const p=[];for(let i=0;i<16;i++){const a=Math.PI*i/8-Math.PI/2,q=i%2?r*(ir||.72):r;p.push((cx+q*Math.cos(a)).toFixed(1)+','+(cy+q*Math.sin(a)).toFixed(1))}return p.join(' ')};
A.defs=()=>`<svg width="0" height="0" style="position:absolute"><defs>
<linearGradient id="gGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f8e7ae"/><stop offset=".5" stop-color="#e3c26b"/><stop offset="1" stop-color="#a67c28"/></linearGradient>
<radialGradient id="gGreen" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#8be89a"/><stop offset=".5" stop-color="#1f9a50"/><stop offset="1" stop-color="#0a4a2a"/></radialGradient>
<linearGradient id="gWood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9a6a33"/><stop offset="1" stop-color="#4f2f12"/></linearGradient>
<linearGradient id="gPage" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff6dc"/><stop offset="1" stop-color="#efd9a0"/></linearGradient>
<linearGradient id="gRug" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b7a63"/><stop offset="1" stop-color="#0b3d33"/></linearGradient>
<radialGradient id="gSun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff3c0"/><stop offset="1" stop-color="#f0a92e"/></radialGradient>
</defs></svg>`;
A.medallion=s=>sv(s,s,`<g fill="none" stroke="${GOLD}" stroke-width="3">
<polygon points="${A.star(500,500,480)}"/><g transform="rotate(22.5 500 500)"><polygon points="${A.star(500,500,420)}"/></g>
<circle cx="500" cy="500" r="330"/><circle cx="500" cy="500" r="300" stroke-dasharray="4 10"/><polygon points="${A.star(500,500,280,.6)}"/>
<circle cx="500" cy="500" r="150"/><polygon points="${A.star(500,500,130)}"/>
${[...Array(8)].map((_,i)=>{const a=i*Math.PI/4;return `<polygon points="${A.star(500+395*Math.cos(a),500+395*Math.sin(a),34)}"/>`}).join('')}</g>`,'0 0 1000 1000');
A.tileURI=()=>{const s=`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><g fill="none" stroke="#e3c26b" stroke-width="1.5"><polygon points="${A.star(60,60,44)}"/><circle cx="60" cy="60" r="20"/><polygon points="${A.star(0,0,22)}"/><polygon points="${A.star(120,0,22)}"/><polygon points="${A.star(0,120,22)}"/><polygon points="${A.star(120,120,22)}"/></g></svg>`;return 'url("data:image/svg+xml,'+encodeURIComponent(s)+'")'};
A.crescent=(s,id)=>sv(s,s,`<defs><mask id="cm${id||0}"><rect width="100" height="100" fill="#fff"/><circle cx="66" cy="42" r="34" fill="#000"/></mask></defs><circle cx="46" cy="50" r="40" fill="url(#gGold)" mask="url(#cm${id||0})"/><polygon points="${A.star(74,52,12)}" fill="url(#gGold)"/>`,'0 0 100 100');
A.lantern=w=>sv(w,w*2.4,`<line x1="50" y1="0" x2="50" y2="40" stroke="${GD}" stroke-width="3"/><path d="M30,62 L70,62 L62,44 L38,44Z" fill="url(#gGold)"/><circle cx="50" cy="38" r="7" fill="none" stroke="${GOLD}" stroke-width="3"/>
<path d="M28,66 Q8,130 30,190 L70,190 Q92,130 72,66Z" fill="#f2b84b" fill-opacity=".85" stroke="${GOLD}" stroke-width="3"/><ellipse cx="50" cy="126" rx="14" ry="42" fill="#fff3c0" fill-opacity=".85"/>
<path d="M30,190 L70,190 L62,208 L38,208Z" fill="url(#gGold)"/><circle cx="50" cy="217" r="6" fill="${GOLD}"/>`,'0 0 100 240');
A.skyline=()=>{let b='';const dome=(x,r,h)=>`<path d="M${x-r},170 V${170-h} a${r},${r} 0 0 1 ${2*r},0 V170Z"/><rect x="${x-2}" y="${170-h-r-26}" width="4" height="26"/>`;
 const min=(x,h)=>`<rect x="${x-9}" y="${170-h}" width="18" height="${h}"/><rect x="${x-14}" y="${170-h+30}" width="28" height="8"/><path d="M${x-11},${170-h} L${x},${170-h-42} L${x+11},${170-h}Z"/>`;
 b+=`<rect x="0" y="140" width="1080" height="30"/>`+dome(180,70,40)+dome(300,40,50)+min(90,120)+min(400,150)+dome(540,95,50)+min(690,150)+dome(790,45,45)+dome(900,70,40)+min(1000,120)+`<rect x="440" y="110" width="200" height="40"/>`;
 return sv(1080,170,`<g fill="#031612" fill-opacity=".88">${b}</g>`)};
A.minbar=()=>{let st='M40,700';for(let i=0;i<13;i++)st+=` h27.7 v-20`;
 let lat='';for(let i=-12;i<26;i++){lat+=`<line x1="${i*30}" y1="440" x2="${i*30+260}" y2="700"/><line x1="${i*30+260}" y1="440" x2="${i*30}" y2="700"/>`}
 let bal='';for(let x=70;x<400;x+=55){const y=700-.7222*(x-40);bal+=`<line x1="${x}" y1="${y-95}" x2="${x}" y2="${y-4}"/>`}
 return sv(700,760,`<ellipse cx="350" cy="715" rx="340" ry="22" fill="#000" fill-opacity=".35"/>
<clipPath id="mbc"><polygon points="40,700 400,440 640,440 640,700"/></clipPath>
<polygon points="40,700 400,440 640,440 640,700" fill="url(#gWood)" stroke="${GOLD}" stroke-width="4"/>
<g clip-path="url(#mbc)" stroke="${GOLD}" stroke-opacity=".5" stroke-width="2">${lat}</g>
<path d="${st}" fill="none" stroke="url(#gGold)" stroke-width="5"/>
<g stroke="${GOLD}" stroke-width="4">${bal}</g><line x1="40" y1="605" x2="400" y2="345" stroke="url(#gGold)" stroke-width="12" stroke-linecap="round"/>
<rect x="400" y="430" width="250" height="18" fill="url(#gGold)"/>
<rect x="404" y="250" width="16" height="182" fill="url(#gGold)"/><rect x="630" y="250" width="16" height="182" fill="url(#gGold)"/>
<rect x="420" y="300" width="210" height="130" rx="6" fill="#3a2108" stroke="${GOLD}" stroke-width="3"/>
<text x="525" y="375" ${ARF} font-size="30" fill="${GL}" text-anchor="middle" direction="rtl">لَا إِلَهَ إِلَّا اللَّهُ</text>
<text x="525" y="520" ${ARF} font-size="32" fill="${GL}" text-anchor="middle" direction="rtl">مُحَمَّدٌ رَسُولُ اللَّهِ</text>
<path d="M488,700 V610 Q525,560 562,610 V700Z" fill="#241305" stroke="${GOLD}" stroke-width="3"/>
<path d="M392,252 Q525,70 658,252Z" fill="url(#gGold)"/><rect x="388" y="248" width="274" height="12" rx="4" fill="${GD}"/>
<text x="525" y="226" ${ARF} font-size="52" fill="#4a2c08" text-anchor="middle" direction="rtl">اللَّه</text>
<line x1="525" y1="88" x2="525" y2="62" stroke="${GOLD}" stroke-width="4"/><circle cx="525" cy="50" r="13" fill="${GOLD}"/><circle cx="531" cy="47" r="11" fill="#04201b"/>`,'0 0 700 760')};
A.dome=()=>sv(420,520,`<rect x="40" y="410" width="260" height="20" fill="url(#gGold)"/>
<path d="M60,410 C60,270 120,200 170,200 C220,200 280,270 280,410Z" fill="url(#gGreen)" stroke="${GOLD}" stroke-width="4"/>
<g stroke="#0a4a2a" stroke-opacity=".6" stroke-width="2">${[...Array(7)].map((_,i)=>`<path d="M${170+(i-3)*8},204 C${170+(i-3)*32},280 ${170+(i-3)*38},360 ${170+(i-3)*38},410" fill="none"/>`).join('')}</g>
<line x1="170" y1="200" x2="170" y2="150" stroke="${GOLD}" stroke-width="5"/><circle cx="170" cy="140" r="10" fill="${GOLD}"/>
<rect x="318" y="150" width="34" height="280" fill="#fff6dc" stroke="${GOLD}" stroke-width="3"/><rect x="310" y="210" width="50" height="10" fill="${GOLD}"/><rect x="310" y="290" width="50" height="10" fill="${GOLD}"/>
<path d="M312,150 Q335,100 358,150Z" fill="url(#gGreen)"/><line x1="335" y1="100" x2="335" y2="70" stroke="${GOLD}" stroke-width="4"/>
<rect x="20" y="430" width="360" height="22" rx="6" fill="#6b4b17"/>`,'0 0 400 520');
A.book=()=>sv(520,360,`<path d="M260,300 Q150,262 30,290 L30,80 Q150,52 260,90Z" fill="url(#gPage)" stroke="${GOLD}" stroke-width="4"/><path d="M260,300 Q370,262 490,290 L490,80 Q370,52 260,90Z" fill="url(#gPage)" stroke="${GOLD}" stroke-width="4"/>
<g stroke="${GD}" stroke-opacity=".6" stroke-width="3">${[0,1,2,3,4,5].map(i=>`<path d="M60,${120+i*28} Q150,${100+i*28} 235,${128+i*28}"/><path d="M285,${128+i*28} Q370,${100+i*28} 460,${120+i*28}"/>`).join('')}</g>
<path d="M30,296 Q150,268 260,306 Q370,268 490,296 L490,318 Q370,290 260,328 Q150,290 30,318Z" fill="url(#gGold)"/><line x1="260" y1="90" x2="260" y2="306" stroke="${GD}" stroke-width="4"/>`);
A.rug=(w,h)=>sv(w,h,`<rect x="6" y="6" width="288" height="408" rx="14" fill="url(#gRug)" stroke="${GOLD}" stroke-width="6"/><path d="M60,380 V200 Q60,70 150,48 Q240,70 240,200 V380Z" fill="none" stroke="${GOLD}" stroke-width="5"/><path d="M85,360 V205 Q85,100 150,82 Q215,100 215,205 V360Z" fill="none" stroke="${GL}" stroke-opacity=".6" stroke-width="3"/><polygon points="${A.star(150,250,34)}" fill="${GOLD}" fill-opacity=".8"/>${[...Array(12)].map((_,i)=>`<line x1="${20+i*23}" y1="414" x2="${20+i*23}" y2="436" stroke="${GOLD}" stroke-width="3"/><line x1="${20+i*23}" y1="6" x2="${20+i*23}" y2="-16" stroke="${GOLD}" stroke-width="3"/>`).join('')}`,'0 -20 300 460');
A.box=()=>sv(300,300,`<polygon points="40,110 260,110 240,270 60,270" fill="url(#gWood)" stroke="${GOLD}" stroke-width="5"/><rect x="30" y="86" width="240" height="30" rx="6" fill="url(#gGold)"/><rect x="110" y="94" width="80" height="12" rx="6" fill="#241305"/><circle cx="150" cy="50" r="24" fill="url(#gGold)" stroke="${GD}" stroke-width="3"/><path d="M150,200 C100,170 110,140 135,150 C145,155 150,165 150,165 C150,165 155,155 165,150 C190,140 200,170 150,200Z" fill="${GL}"/>`);
A.sleep=()=>sv(300,300,A.crescent(200,3).replace(/^<svg[^>]*>|<\/svg>$/g,'').replace('<defs>','<g transform="translate(20,40) scale(2)"><defs>')+'</g>'+`<text x="200" y="110" font-family="DejaVu Sans,FreeSerif,serif" font-size="70" fill="${GL}" font-style="italic">z</text><text x="236" y="70" font-family="DejaVu Sans,FreeSerif,serif" font-size="46" fill="${GL}" font-style="italic">z</text><text x="262" y="38" font-family="DejaVu Sans,FreeSerif,serif" font-size="32" fill="${GL}" font-style="italic">z</text>`);
A.bulb=()=>sv(360,420,`<path d="M180,30 C90,30 40,100 60,180 C70,215 100,240 112,275 L248,275 C260,240 290,215 300,180 C320,100 270,30 180,30Z" fill="#ffe27a" stroke="${GOLD}" stroke-width="6"/><path d="M140,275 V200 L180,160 L220,200 V275" fill="none" stroke="${GD}" stroke-width="6"/><rect x="118" y="283" width="124" height="22" rx="8" fill="url(#gGold)"/><rect x="128" y="311" width="104" height="22" rx="8" fill="url(#gGold)"/><rect x="148" y="339" width="64" height="20" rx="8" fill="url(#gGold)"/>${[...Array(9)].map((_,i)=>{const a=(-160+i*18)*Math.PI/180;return `<line x1="${180+170*Math.cos(a)}" y1="${160+170*Math.sin(a)}" x2="${180+205*Math.cos(a)}" y2="${160+205*Math.sin(a)}" stroke="${GL}" stroke-width="6" stroke-linecap="round"/>`}).join('')}`);
A.watch=()=>sv(420,480,`<rect x="180" y="10" width="60" height="40" rx="8" fill="url(#gGold)"/><rect x="195" y="40" width="30" height="40" fill="${GD}"/><circle cx="210" cy="270" r="180" fill="#04201b" stroke="url(#gGold)" stroke-width="14"/><circle cx="210" cy="270" r="150" class="arcbg" fill="none" stroke="${GOLD}" stroke-opacity=".25" stroke-width="12"/><circle class="arc" cx="210" cy="270" r="150" fill="none" stroke="${GL}" stroke-width="14" stroke-linecap="round" transform="rotate(-90 210 270)" stroke-dasharray="942.5" stroke-dashoffset="942.5"/><rect x="165" y="215" width="30" height="110" rx="8" fill="${GL}"/><rect x="225" y="215" width="30" height="110" rx="8" fill="${GL}"/>`);
A.heart=()=>sv(400,380,`<path d="M200,350 C60,250 30,140 100,95 C155,62 200,100 200,135 C200,100 245,62 300,95 C370,140 340,250 200,350Z" fill="#c8453d" stroke="${GOLD}" stroke-width="7"/><path d="M110,130 C120,110 145,106 160,120" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="8" stroke-linecap="round"/>`);
A.eye=()=>sv(300,200,`<path d="M15,100 Q150,-10 285,100 Q150,210 15,100Z" fill="#fff6dc" stroke="${GOLD}" stroke-width="7"/><circle cx="150" cy="100" r="46" fill="#1f8f6a"/><circle cx="150" cy="100" r="22" fill="#04201b"/><circle cx="162" cy="86" r="9" fill="#fff"/>`);
A.coins=()=>sv(260,260,[0,1,2].map(i=>`<ellipse cx="${100+i*12}" cy="${200-i*34}" rx="80" ry="28" fill="url(#gGold)" stroke="${GD}" stroke-width="4"/><rect x="${20+i*12}" y="${186-i*34}" width="160" height="14" fill="${GD}"/>`).reverse().join('')+`<circle cx="190" cy="80" r="40" fill="url(#gGold)" stroke="${GD}" stroke-width="5"/><text x="190" y="96" font-family="DejaVu Sans,serif" font-size="48" font-weight="700" fill="${GD}" text-anchor="middle">$</text>`);
A.ring=()=>sv(260,260,`<ellipse cx="130" cy="170" rx="80" ry="72" fill="none" stroke="url(#gGold)" stroke-width="16"/><polygon points="130,28 168,62 130,108 92,62" fill="#bfeaff" stroke="#fff" stroke-width="4"/><polygon points="92,62 168,62 130,70" fill="#fff" fill-opacity=".6"/>`);
A.path=()=>sv(300,300,`<path d="M30,250 C90,250 80,120 150,140 C220,160 200,60 260,50" fill="none" stroke="${GOLD}" stroke-width="7" stroke-dasharray="3 18" stroke-linecap="round"/><polygon points="270,44 238,38 246,70" fill="${GOLD}"/><circle cx="30" cy="250" r="14" fill="${GL}"/>`);
A.share=s=>sv(s,s,`<g stroke="${GL}" stroke-width="7"><line x1="28" y1="50" x2="72" y2="26"/><line x1="28" y1="50" x2="72" y2="74"/></g><g fill="${GOLD}"><circle cx="26" cy="50" r="14"/><circle cx="74" cy="24" r="14"/><circle cx="74" cy="76" r="14"/></g>`,'0 0 100 100');
A.comment=s=>sv(s,s,`<path d="M16,20 H84 Q92,20 92,28 V62 Q92,70 84,70 H46 L28,88 V70 H16 Q8,70 8,62 V28 Q8,20 16,20Z" fill="${GOLD}"/><g fill="#04201b"><circle cx="32" cy="46" r="5"/><circle cx="50" cy="46" r="5"/><circle cx="68" cy="46" r="5"/></g>`,'0 0 100 100');
A.heartS=s=>sv(s,s,`<path d="M50,86 C10,58 6,30 26,20 C40,13 50,24 50,32 C50,24 60,13 74,20 C94,30 90,58 50,86Z" fill="#e0564b"/>`,'0 0 100 100');
A.sunrise=()=>sv(700,360,`<circle cx="350" cy="300" r="170" fill="url(#gSun)"/>${[...Array(11)].map((_,i)=>{const a=(-180+i*18)*Math.PI/180;return `<line x1="${350+200*Math.cos(a)}" y1="${300+200*Math.sin(a)}" x2="${350+270*Math.cos(a)}" y2="${300+270*Math.sin(a)}" stroke="${GL}" stroke-width="9" stroke-linecap="round"/>`}).join('')}<rect x="0" y="300" width="700" height="60" fill="#04201b"/><line x1="0" y1="300" x2="700" y2="300" stroke="${GOLD}" stroke-width="5"/>`);
A.arr=()=>sv(70,30,`<line x1="2" y1="15" x2="52" y2="15" stroke="${GOLD}" stroke-width="6" stroke-linecap="round"/><polygon points="68,15 48,3 48,27" fill="${GOLD}"/>`);
A.arr2=()=>sv(90,30,`<line x1="22" y1="15" x2="68" y2="15" stroke="${GOLD}" stroke-width="6"/><polygon points="2,15 24,3 24,27" fill="${GOLD}"/><polygon points="88,15 66,3 66,27" fill="${GOLD}"/>`);
A.corner=()=>sv(70,70,`<path d="M4,66 V20 Q4,4 20,4 H66" fill="none" stroke="${GOLD}" stroke-width="6" stroke-linecap="round"/><polygon points="${A.star(26,26,10)}" fill="${GOLD}"/>`);
A.divider=w=>sv(w,40,`<line x1="0" y1="20" x2="${w/2-34}" y2="20" stroke="${GOLD}" stroke-width="3"/><line x1="${w/2+34}" y1="20" x2="${w}" y2="20" stroke="${GOLD}" stroke-width="3"/><polygon points="${A.star(w/2,20,16)}" fill="${GOLD}"/>`);
A.burst=s=>sv(s,s,`<g stroke="${GL}" stroke-width="6" stroke-linecap="round">${[...Array(24)].map((_,i)=>{const a=i*Math.PI/12;return `<line x1="${500+260*Math.cos(a)}" y1="${500+260*Math.sin(a)}" x2="${500+(i%2?400:470)*Math.cos(a)}" y2="${500+(i%2?400:470)*Math.sin(a)}"/>`}).join('')}</g><polygon points="${A.star(500,500,240)}" fill="${GOLD}" fill-opacity=".25" stroke="${GOLD}" stroke-width="5"/>`,'0 0 1000 1000');
A.check=s=>sv(s,s,`<circle cx="50" cy="50" r="44" fill="none" stroke="${GOLD}" stroke-width="7"/><path d="M28,52 L44,68 L74,34" fill="none" stroke="${GL}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`,'0 0 100 100');
A.bracket=w=>sv(w,50,`<path d="M4,6 V34 Q4,44 14,44 H${w-14} Q${w-4},44 ${w-4},34 V6" fill="none" stroke="${GOLD}" stroke-width="7" stroke-linecap="round"/>`);
A.qmark=()=>sv(300,420,`<text x="150" y="340" font-family="DejaVu Sans,FreeSerif,serif" font-size="400" font-weight="700" text-anchor="middle" fill="url(#gGold)">?</text>`);
