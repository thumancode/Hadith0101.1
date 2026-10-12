// Timeline engine + all scenes. Every frame is a pure function of t: window.renderAt(t)
(async()=>{
const FPS=30,W=1080,H=1920;
const D=Math.ceil(Math.max(...LINES.map(l=>l.e)));
window.DURATION=D;
const S=document.getElementById('stage');
S.insertAdjacentHTML('afterbegin',A.defs());
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const E={out:x=>1-Math.pow(1-x,3),back:x=>1+2.70158*Math.pow(x-1,3)+1.70158*Math.pow(x-1,2)};
const rng=seed=>()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const TR=[],FN=[],RV=[];
const mk=(p,css,html,cls)=>{const d=document.createElement('div');d.className='abs '+(cls||'');d.style.cssText=css||'';if(html)d.innerHTML=html;p.appendChild(d);return d};
function track(el,s,e,o){o=Object.assign({a:'fade',i:.5,o:.4},o||{});TR.push({el,s,e,o});el.style.visibility='hidden';el.style.opacity=0}
const add=(p,css,html,s,e,a,x)=>{x=x||{};const d=mk(p,css,html,x.cls);track(d,s,e,{a:a||'fade',i:x.i,o:x.o,fn:x.fn,op:x.op,base:x.base});return d};
function ap(k,t){const{el,s,e,o}=k;
 if(t<s||t>=e){el.style.visibility='hidden';el.style.opacity=0;return}
 const pi=o.i>0?clamp((t-s)/o.i):1,po=o.o>0?clamp((e-t)/o.o):1,ei=E.out(pi),eo=E.out(po);let tf='';
 switch(o.a){
  case'rise':tf=`translateY(${(1-ei)*60-(1-eo)*30}px)`;break;
  case'drop':tf=`translateY(${-(1-ei)*80+(1-eo)*30}px)`;break;
  case'pop':tf=`scale(${(.55+.45*E.back(pi))*(1-(1-eo)*.15)})`;break;
  case'zoom':tf=`scale(${(1.3-.3*ei)*(1+(1-eo)*.12)})`;break;
  case'sl':tf=`translateX(${-(1-ei)*140+(1-eo)*60}px)`;break;
  case'sr':tf=`translateX(${(1-ei)*140-(1-eo)*60}px)`;break;}
 let op=Math.min(ei,eo);if(o.op)op*=o.op(t-s,t);
 const x=o.fn?(o.fn(el,t-s,t)||''):'';
 el.style.visibility='inherit';el.style.opacity=op;el.style.transform=(o.base||'')+' '+tf+' '+x}
// word-by-word reveal weighted by character count over 86% of the duration
function reveal(p,css,text,cls,s,e,o){o=o||{};const c=mk(p,css,'',cls);const ws=text.split(/\s+/).filter(Boolean);const tot=ws.reduce((a,w)=>a+w.length,0);let acc=0;
 const sp=ws.map(w=>{const x=document.createElement('span');x.className='w'+(o.hl&&o.hl(w)?' gold':'');x.textContent=w;c.appendChild(x);c.appendChild(document.createTextNode(' '));const st=s+(e-s)*.86*acc/tot;acc+=w.length;return{sp:x,st}});
 RV.push({sp,dur:.28});return c}
const ic=w=>`<div style="position:relative;width:${w}px;height:${w*1080/1333}px;border-radius:${w*.14}px;overflow:hidden;border:3px solid #e3c26b;box-shadow:0 0 34px rgba(227,194,107,.55);background:#fff"><img src="logo.png" style="position:absolute;left:0;top:0;width:100%;height:100%;transform:scale(1.04)"></div>`;
const badge=w=>{const k=w/562,h=167*k;return `<div style="position:relative;width:${w}px;height:${h}px;border-radius:${h*.17}px;overflow:hidden;border:4px solid #e3c26b;box-shadow:0 0 34px rgba(227,194,107,.5)"><img src="google-play-badge.png" style="position:absolute;left:${-42*k}px;top:${-41*k}px;width:${646*k}px;height:${250*k}px"></div>`};
const sc=(s,e,full)=>{const d=mk(S,full?'left:0;top:0;width:1080px;height:1920px':'left:0;top:215px;width:1080px;height:1200px');track(d,s,e,{a:'fade',i:.2,o:.2});return d};
const ctr=(w)=>`left:${(W-w)/2}px;`;
const sin=(x)=>Math.sin(x);

// ---------- background layers ----------
mk(S,'left:0;top:0;width:1080px;height:1920px;background:linear-gradient(180deg,#04201b 0%,#0b3d33 55%,#145c4b 100%)');
const pat=mk(S,`left:0;top:0;width:1080px;height:1920px;background-image:${A.tileURI()};opacity:.10`);
const med=mk(S,'left:-160px;top:100px;width:1400px;height:1400px;opacity:.10',A.medallion(1400));
const glow=mk(S,'left:-60px;top:200px;width:1200px;height:1200px;border-radius:50%');
const TAGS={respectful:[227,194,107],informative:[80,200,170],solemn:[150,130,220],serious:[220,110,90],calm:[90,170,220],thoughtful:[230,170,80],warm:[255,150,90],compassionate:[240,130,170],optimistic:[255,215,90],friendly:[120,220,130],encouraging:[255,190,70],store:[227,194,107]};
const R=rng(7);const PT=[...Array(55)].map(()=>({x:R()*W,y:R()*H,sp:12+R()*30,sz:3+R()*6,ph:R()*6.28,d:mk(S,'width:8px;height:8px;border-radius:50%;background:#f8e7ae;box-shadow:0 0 12px #e3c26b')}));
const lan=[[14,0,1],[976,0,-1]].map(([x,y,d])=>({d:mk(S,`left:${x}px;top:${y}px;transform-origin:50% 0`,A.lantern(90)),dir:d}));
mk(S,'left:0;top:1760px;width:1080px;height:170px',A.skyline());
mk(S,'left:0;top:0;width:1080px;height:1920px;background:radial-gradient(ellipse at 50% 48%,rgba(0,0,0,0) 45%,rgba(0,0,0,.55) 100%)');
mk(S,'left:0;top:14px;width:1080px;height:4px;background:linear-gradient(90deg,transparent,#e3c26b,transparent)');
mk(S,'left:0;top:1898px;width:1080px;height:4px;background:linear-gradient(90deg,transparent,#e3c26b,transparent)');
const prog=mk(S,'left:60px;top:1850px;width:0;height:8px;border-radius:4px;background:linear-gradient(90deg,#a67c28,#f8e7ae)');
mk(S,'left:60px;top:1850px;width:960px;height:8px;border-radius:4px;background:rgba(255,255,255,.12);z-index:-1');
FN.push(t=>{
 pat.style.backgroundPosition=`${t*6}px ${t*4}px`;med.style.transform=`rotate(${t*3}deg)`;prog.style.width=(960*clamp(t/D))+'px';
 let i=LINES.findIndex(l=>t>=l.s&&t<l.e);if(i<0)i=LINES.length-1;
 const cur=TAGS[LINES[i].tag]||TAGS.respectful,prv=TAGS[(LINES[i-1]||LINES[i]).tag]||cur,x=clamp((t-LINES[i].s)/.6);
 const c=cur.map((v,k)=>Math.round(prv[k]+(v-prv[k])*x));
 glow.style.background=`radial-gradient(circle,rgba(${c},.40) 0%,rgba(${c},.14) 38%,rgba(${c},0) 68%)`;
 PT.forEach(p=>{const y=((p.y-t*p.sp)%H+H)%H;p.d.style.transform=`translate(${p.x+sin(t*.5+p.ph)*24}px,${y}px) scale(${p.sz/8})`;p.d.style.opacity=.15+.5*Math.abs(sin(t*1.3+p.ph))});
 lan.forEach((l,k)=>l.d.style.transform=`rotate(${sin(t*.9+k*1.7)*5}deg)`);
});

// ---------- brand bar (hidden in first and last scene) ----------
add(S,'left:130px;top:52px;width:820px;height:118px',`<div style="display:flex;align-items:center;gap:24px;height:100%">${ic(130)}<div><div style="font-size:34px;font-weight:700;color:#f8e7ae;line-height:1.3">ইসলামী বিশ্বকোষ ও আল হাদিস S2</div><div style="font-size:26px;color:#e3c26b">আজকের হাদিস</div></div></div>`,2.5,78,'drop',{i:.6,o:.4});

// ---------- scene 1: greeting (0-2.5) ----------
let c=sc(0,2.5,true);
[0,.8,1.6].forEach(d=>add(c,'left:280px;top:292px;width:520px;height:520px;border:4px solid #e3c26b;border-radius:50%','',0,2.5,'fade',{i:.05,o:.05,fn:(el,lt)=>`scale(${.55+((lt+d)%2.4)/2.4*1.1})`,op:lt=>(1-((lt+d)%2.4)/2.4)*.85}));
add(c,'left:290px;top:330px',ic(500),0,2.5,'pop',{i:.6,o:.2});
add(c,'left:0;top:830px;width:1080px;font-size:96px;line-height:1.5','السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ',.3,2.5,'rise',{i:.5,cls:'ar'});

// ---------- scene 2: title (2.5-6.5) ----------
c=sc(2.5,6.5);
add(c,'left:90px;top:330px;width:900px;height:700px;border-radius:50%;background:radial-gradient(circle,rgba(248,231,174,.45),rgba(248,231,174,0) 68%)','',2.6,6.5,'fade');
add(c,'left:160px;top:350px',A.medallion(760),2.6,6.5,'zoom',{i:.8,fn:(el,lt)=>`rotate(${lt*10}deg)`,op:()=>.55});
add(c,'left:0;top:60px;width:1080px;font-size:132px;font-weight:700;color:#f8e7ae;text-align:center;text-shadow:0 0 40px rgba(227,194,107,.6)','আজকের হাদিস',2.7,6.5,'zoom',{i:.6});
add(c,'left:260px;top:250px',A.divider(560),3.1,6.5,'fade');
add(c,'left:280px;top:550px',A.book(),3.3,6.5,'pop',{i:.7,fn:(el,lt)=>`translateY(${sin(lt*2)*10}px)`});

// ---------- scene 3: narrator (6.5-10.5) ----------
c=sc(6.5,10.5);
add(c,'left:90px;top:110px;width:900px;height:560px','',6.6,10.5,'pop',{i:.5,cls:'card'});
add(c,'left:110px;top:130px',A.corner(),6.7,10.5,'fade');add(c,'left:900px;top:130px;transform:scaleX(-1)',A.corner(),6.7,10.5,'fade');
reveal(c,'left:130px;top:190px;width:820px;font-size:84px;line-height:1.7','عَلْقَمَةُ بْنُ وَقَّاصٍ اللَّيْثِيُّ','ar',6.7,8.6);
add(c,'left:130px;top:490px;width:820px;font-size:70px;color:#e3c26b','رَحِمَهُ اللَّهُ',8.7,10.5,'rise',{i:.5,cls:'ar'});
[[340,8.9],[540,9.3],[740,9.7]].forEach(([x,s],i)=>{add(c,`left:${x-60}px;top:800px`,`<svg width="120" height="120" viewBox="0 0 120 120"><circle cx="60" cy="60" r="54" fill="#0b3d33" stroke="#e3c26b" stroke-width="5"/><polygon points="${A.star(60,60,34)}" fill="#e3c26b"/></svg>`,s,10.5,'pop',{i:.4});
 if(i<2)add(c,`left:${x+62}px;top:858px;width:76px;height:5px;background:#e3c26b`,'',s+.2,10.5,'fade')});

// ---------- scene 4: minbar (10.5-15) ----------
c=sc(10.5,15);
add(c,'left:90px;top:-40px;width:900px;height:900px;border-radius:50%;background:radial-gradient(circle,rgba(248,231,174,.5),rgba(248,231,174,0) 65%)','',10.6,15,'fade');
add(c,'left:160px;top:10px',A.minbar().replace('width="700" height="760"','width="760" height="825"'),10.6,15,'zoom',{i:.8});
[0,.7,1.4].forEach(d=>add(c,'left:640px;top:210px;width:180px;height:180px;border-right:6px solid #f8e7ae;border-radius:50%','',11.5,15,'fade',{i:.1,fn:(el,lt)=>`scale(${.5+((lt+d)%2.1)/2.1*1.3})`,op:lt=>1-((lt+d)%2.1)/2.1}));
add(c,'left:70px;top:900px;width:940px;height:270px','',11.0,15,'rise',{cls:'card'});
reveal(c,'left:90px;top:920px;width:900px;font-size:66px;line-height:1.6','عُمَرُ بْنُ الْخَطَّابِ رَضِيَ اللَّهُ عَنْهُ عَلَى الْمِنْبَرِ','ar',11.2,14.6);

// ---------- scene 5: dome + "the Messenger said" (15-18.5) ----------
c=sc(15,18.5);
add(c,'left:140px;top:-20px;width:800px;height:800px;border-radius:50%;background:radial-gradient(circle,rgba(120,230,150,.5),rgba(120,230,150,0) 65%)','',15,18.5,'fade',{op:(lt,t)=>.7+.3*sin(t*3)});
add(c,'left:300px;top:60px',A.dome().replace('width="420" height="520"','width="480" height="594"'),15.1,18.5,'zoom',{i:.7});
add(c,'left:70px;top:760px;width:940px;height:330px','',15.4,18.5,'rise',{cls:'card'});
reveal(c,'left:90px;top:790px;width:900px;font-size:76px;line-height:1.7','سَمِعْتُ رَسُولَ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ يَقُولُ','ar',15.6,18.2);

// ---------- scene 6: the core text (18.5-36) ----------
const chip=(a,b,dbl)=>`<span>${a}</span>${dbl?A.arr2():A.arr()}<span>${b}</span>`;
c=sc(18.5,36);
add(c,'left:60px;top:30px;width:960px;height:800px','',18.6,36,'pop',{cls:'card'});
add(c,'left:84px;top:50px',A.corner(),18.8,36,'fade');add(c,'left:926px;top:50px;transform:scaleX(-1)',A.corner(),18.8,36,'fade');
reveal(c,'left:90px;top:100px;width:900px;font-size:78px;line-height:1.6','إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ','ar',18.7,20.8);
reveal(c,'left:90px;top:250px;width:900px;font-size:70px;line-height:1.6','وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى','ar',23.4,26);
reveal(c,'left:90px;top:400px;width:900px;font-size:62px;line-height:1.75','فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى دُنْيَا يُصِيبُهَا أَوْ إِلَى امْرَأَةٍ يَنْكِحُهَا فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ','ar',28.5,35.6);
add(c,'left:0;top:900px;width:1080px;display:flex;justify-content:center',`<div class="chip">${chip('কাজ','নিয়ত',true)}</div>`,20.9,23.5,'pop',{i:.4});
add(c,'left:0;top:900px;width:1080px;display:flex;justify-content:center',`<div class="chip">${chip('নিয়ত','ফল',false)}</div>`,26.1,28.5,'pop',{i:.4});
add(c,'left:110px;top:880px',A.coins(),29,36,'pop',{i:.5,fn:(el,lt)=>`translateY(${sin(lt*3)*8}px)`});
add(c,'left:110px;top:1130px;width:260px;font-size:60px',"دُنْيَا",29.2,36,'rise',{cls:'ar'});
add(c,'left:410px;top:880px',A.ring(),31,36,'pop',{i:.5,fn:(el,lt)=>`translateY(${sin(lt*3)*8}px)`});
add(c,'left:410px;top:1130px;width:260px;font-size:60px',"امْرَأَة",31.2,36,'rise',{cls:'ar'});
add(c,'left:700px;top:870px',A.path(),33.3,36,'pop',{i:.5});
add(c,'left:700px;top:1130px;width:300px;font-size:60px',"هِجْرَة",33.5,36,'rise',{cls:'ar'});

// ---------- scene 7: source (36-38.5) ----------
c=sc(36,38.5);
add(c,'left:190px;top:100px;width:700px;height:940px;border-radius:28px;background:linear-gradient(160deg,#0f5c49,#04201b);border:6px solid #e3c26b;box-shadow:0 0 60px rgba(227,194,107,.45)','',36,38.5,'pop',{i:.5});
add(c,'left:215px;top:125px',A.corner(),36.2,38.5);add(c,'left:805px;top:125px;transform:scaleX(-1)',A.corner(),36.2,38.5);
add(c,'left:215px;top:925px;transform:scaleY(-1)',A.corner(),36.2,38.5);add(c,'left:805px;top:925px;transform:scale(-1,-1)',A.corner(),36.2,38.5);
add(c,'left:190px;top:250px;width:700px;font-size:104px;line-height:1.5',"صَحِيحُ الْبُخَارِيِّ",36.3,38.5,'rise',{cls:'ar'});
add(c,'left:290px;top:440px',A.divider(500),36.6,38.5);
add(c,'left:190px;top:520px;width:700px;font-size:190px;line-height:1.2;color:#e3c26b',"١",36.8,38.5,'pop',{cls:'ar',i:.4});
add(c,'left:190px;top:800px;width:700px;font-size:54px;text-align:center;color:#fff6dc','হাদিস নম্বর এক',37,38.5,'rise');

// ---------- scene 8: think (38.5-53) ----------
c=sc(38.5,53);
add(c,'left:300px;top:260px;width:480px;height:480px;border-radius:50%;background:radial-gradient(circle,rgba(255,226,122,.6),rgba(255,226,122,0) 65%)','',38.6,40.2,'fade',{o:.3});
add(c,'left:360px;top:300px',A.bulb(),38.6,40.2,'pop',{i:.5,o:.3,op:(lt,t)=>.8+.2*sin(t*14)});
const mY=380,qm=t=>E.out(clamp((t-49.8)/1.4));
add(c,'left:170px;top:'+mY+'px',A.rug(300,420),40.4,53,'rise',{i:.6,fn:(el,lt,t)=>`translateY(${-qm(t)*230}px)`});
add(c,'left:610px;top:'+mY+'px',A.rug(300,420),40.4,53,'rise',{i:.6,fn:(el,lt,t)=>`translateY(${qm(t)*230}px)`});
add(c,'left:440px;top:560px',`<svg width="200" height="60" viewBox="0 0 200 60"><rect x="40" y="8" width="120" height="14" rx="7" fill="#e3c26b"/><rect x="40" y="38" width="120" height="14" rx="7" fill="#e3c26b"/></svg>`,40.9,47.2,'pop',{i:.4});
add(c,'left:170px;top:40px;width:300px;height:360px;background:linear-gradient(180deg,rgba(255,240,170,0),rgba(255,240,170,.75));clip-path:polygon(30% 0,70% 0,100% 100%,0 100%)','',42.5,49.8,'fade',{i:.7});
add(c,'left:90px;top:230px;width:460px;font-size:56px;line-height:1.3','আল্লাহর জন্য',42.5,49.8,'rise',{cls:'lbl'});
[0,1,2].forEach(i=>add(c,`left:${600+i*105}px;top:300px`,A.eye().replace('width="300" height="200"','width="100" height="67"'),44.8,49.8,'pop',{i:.35}));
add(c,'left:590px;top:130px;width:420px;font-size:46px;line-height:1.3','মানুষকে দেখানোর জন্য',44.8,49.8,'rise',{cls:'lbl'});
add(c,'left:160px;top:860px',A.bracket(760),47.2,49.8,'fade');
add(c,'left:90px;top:925px;width:900px;font-size:62px','বাইরে একই রকম',47.3,49.8,'rise',{cls:'lbl'});
add(c,'left:90px;top:20px;width:900px;font-size:72px','আকাশ',50,53,'rise',{cls:'lbl'});
add(c,'left:90px;top:1090px;width:900px;font-size:72px','পাতাল',50.2,53,'rise',{cls:'lbl'});
add(c,'left:539px;top:170px;width:3px;height:860px;border-left:4px dashed #e3c26b','',50.4,53,'fade');
add(c,'left:90px;top:540px;width:900px;font-size:78px;text-shadow:0 0 30px #000','পার্থক্য',51.2,53,'pop',{cls:'lbl'});

// ---------- scene 9: everyday acts (53-60) ----------
c=sc(53,60);
const cards=[[90,70,53.1,'নামাজ',A.rug(110,150)],[590,70,54.3,'রোজা',A.crescent(150,5)],[90,560,55.3,'দান',A.box().replace('width="300" height="300"','width="170" height="170"')],[590,560,57,'ঘুম',A.sleep().replace('width="300" height="300"','width="170" height="170"')]];
cards.forEach(([x,y,s,l,icon])=>{
 add(c,`left:${x}px;top:${y}px;width:400px;height:440px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px`,`<div style="height:190px;display:flex;align-items:center">${icon}</div><div style="font-size:78px;font-weight:700;color:#f8e7ae">${l}</div>`,s,58.9,'pop',{i:.5,o:.4,cls:'card',
  fn:(el,lt,t)=>{const g=clamp((t-57.8)/.5);el.style.boxShadow=`0 0 ${40+g*70}px rgba(227,194,107,${.28+g*.6})`;el.style.borderColor=g>0?'#fff3c0':'#e3c26b';
   const q=E.out(clamp((t-58.3)/.55)),dx=540-(x+200),dy=600-(y+220);return `translate(${dx*q}px,${dy*q}px) scale(${1-.7*q})`}});});
add(c,'left:40px;top:60px',A.burst(1000),58.6,60,'pop',{i:.5,o:.3,fn:(el,lt)=>`rotate(${lt*40}deg)`,op:()=>.6});
add(c,'left:0;top:480px;width:1080px;font-size:170px;line-height:1.2','ইবাদত',58.7,60,'pop',{i:.45,cls:'lbl'});
add(c,'left:0;top:690px;width:1080px;font-size:110px;line-height:1.4','عِبَادَة',58.9,60,'rise',{cls:'ar'});

// ---------- scene 10: reflection + call to action (60-74.8) ----------
c=sc(60,74.8);
add(c,'left:340px;top:200px',A.heart(),60,62.5,'pop',{i:.5,o:.3,fn:(el,lt)=>`scale(${1+.06*sin(lt*8)})`});
add(c,'left:0;top:660px;width:1080px;font-size:84px','অন্তরের গল্প',60.4,62.5,'rise',{cls:'lbl'});
add(c,'left:90px;top:260px',A.eye().replace('width="300" height="200"','width="380" height="253"'),62.5,66,'pop',{i:.5});
add(c,'left:90px;top:560px;width:380px;font-size:70px','কাজ',62.7,66,'rise',{cls:'lbl'});
add(c,'left:610px;top:200px',A.heart().replace('width="400" height="380"','width="380" height="361"'),64.3,66,'pop',{i:.5,fn:(el,lt)=>`scale(${1+.06*sin(lt*8)})`});
add(c,'left:610px;top:560px;width:380px;font-size:70px','নিয়ত',64.5,66,'rise',{cls:'lbl'});
add(c,'left:610px;top:100px;width:380px;font-size:84px','اللَّه',64.4,66,'drop',{cls:'ar'});
const wt=add(c,'left:330px;top:150px',A.watch(),66,69.5,'pop',{i:.5});const arc=wt.querySelector('.arc');
FN.push(t=>arc.setAttribute('stroke-dashoffset',(942.5*(1-clamp((t-66)/3.2))).toFixed(1)));
add(c,'left:0;top:700px;width:1080px;font-size:84px','এক সেকেন্ড',66.3,69.5,'rise',{cls:'lbl'});
add(c,'left:390px;top:60px',A.qmark(),69.5,72,'pop',{i:.5,fn:(el,lt)=>`rotate(${sin(lt*5)*5}deg)`});
add(c,'left:60px;top:560px;width:960px;font-size:76px;line-height:1.4','আমি এটা কেন করছি?',69.8,72,'rise',{cls:'lbl'});
add(c,'left:190px;top:130px',A.sunrise(),72,74.8,'zoom',{i:.7});
add(c,'left:0;top:520px;width:1080px;font-size:100px','إِنْ شَاءَ اللَّهُ',72.4,74.8,'rise',{cls:'ar'});
add(c,'left:0;top:700px;width:1080px;display:flex;justify-content:center',`<div class="chip">${chip('নিয়ত ঠিক','জীবন ঠিক',false)}</div>`,73.2,74.8,'pop',{i:.4});

// ---------- scene 11: outro + share (74.8-78) ----------
c=sc(74.8,78);
add(c,'left:260px;top:60px',A.book().replace('width="520" height="360"','width="560" height="388"'),74.8,76.2,'pop',{i:.5,fn:(el,lt)=>`translateY(${sin(lt*2)*8}px)`});
add(c,'left:490px;top:520px',A.check(100),75.2,76.2,'pop',{i:.4});
add(c,'left:0;top:660px;width:1080px;font-size:92px','আজকের হাদিস',75.1,76.2,'rise',{cls:'lbl'});
[[A.heartS(200),110,76.3],[A.comment(200),440,76.7],[A.share(200),770,77.1]].forEach(([svg,x,s],i)=>{
 add(c,`left:${x}px;top:260px;width:200px;height:200px;border-radius:50%;border:5px solid #e3c26b;background:rgba(4,32,27,.85);padding:26px;box-shadow:0 0 40px rgba(227,194,107,.45)`,svg,s,78,'pop',{i:.4,fn:(el,lt)=>`scale(${1+.05*sin(lt*7+i)})`})});
add(c,'left:670px;top:490px;width:400px;font-size:68px','শেয়ার',77.2,78,'rise',{cls:'lbl'});

// ---------- scene 12: final call to action (78-82) ----------
c=sc(78,D,true);
[0,.8,1.6].forEach(d=>add(c,'left:200px;top:100px;width:680px;height:680px;border:4px solid #e3c26b;border-radius:50%','',78,D,'fade',{i:.05,o:.05,fn:(el,lt)=>`scale(${.7+((lt+d)%2.4)/2.4*.7})`,op:lt=>(1-((lt+d)%2.4)/2.4)*.8}));
add(c,'left:180px;top:140px',ic(720),78,D,'pop',{i:.6,fn:(el,lt)=>`scale(${1+.025*sin(lt*5)})`});
add(c,'left:40px;top:690px;width:1000px;font-size:64px;font-weight:700;line-height:1.35;color:#f8e7ae;text-align:center;text-shadow:0 0 30px rgba(227,194,107,.6)','ইসলামী বিশ্বকোষ ও আল হাদিস S2',78.4,D,'rise');
add(c,'left:0;top:890px;width:1080px;display:flex;justify-content:center','<div class="chip" style="font-size:62px;background:#e3c26b;color:#04201b;border-color:#fff3c0">ইনষ্টল করুন</div>',78.8,D,'pop',{i:.4});
add(c,'left:220px;top:1080px',badge(640),79.1,D,'pop',{i:.5,fn:(el,lt)=>`scale(${1+.03*sin(lt*5)})`});

// ---------- subtitles (always on) ----------
const keys=['নিয়ত','নিয়্যাত','আল্লাহ','হাদিস','ইবাদত','শেয়ার','ইনষ্টল','ইনশাল্লাহ','বিশ্বকোষ','ইসলামী','আ্যপটি'];
const hl=w=>keys.some(k=>w.includes(k));
LINES.forEach(l=>{
 const p=mk(S,'left:60px;top:1445px;width:960px;height:330px;display:flex;align-items:center;justify-content:center;padding:0 38px','','sub');
 reveal(p,`position:relative;width:100%;font-size:${l.text.length>62?52:60}px;line-height:1.5;text-align:center;font-weight:600`,l.text,'',l.s,l.e,{hl});
 track(p,l.s,l.e,{a:'fade',i:.2,o:.15});
});

window.renderAt=t=>{
 TR.forEach(k=>ap(k,t));
 RV.forEach(r=>r.sp.forEach(w=>{const p=clamp((t-w.st)/r.dur);w.sp.style.opacity=p;w.sp.style.transform=`translateY(${(1-E.out(p))*26}px)`}));
 FN.forEach(f=>f(t));
};
const imgs=[...document.images];await Promise.all(imgs.map(i=>i.decode().catch(()=>{})));
await document.fonts.ready;
window.renderAt(0);window.__ready=true;
})();
