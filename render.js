// Playwright capture + FFmpeg encode.  node render.js [--test N] [--still t1,t2] [--workers N]
const fs=require('fs'),os=require('os'),path=require('path'),cp=require('child_process');
const {chromium}=require('playwright');
const W=1080,H=1920,FPS=30,OUT='hadith-video.mp4';
const arg=n=>{const i=process.argv.indexOf(n);return i>=0?process.argv[i+1]:null};
const root=__dirname;

// 1. timestamps.txt -> lines.js (single source of truth)
const lines=fs.readFileSync(path.join(root,'timestamps.txt'),'utf8').split(/\r?\n/).map(l=>l.trim()).filter(Boolean).map(l=>{
  const p=l.split('|').map(x=>x.trim());return {s:parseFloat(p[0]),e:parseFloat(p[1]),text:p[2],tag:p[3]||''};
}).filter(l=>!isNaN(l.s)&&!isNaN(l.e)&&l.text);
fs.writeFileSync(path.join(root,'lines.js'),'const LINES='+JSON.stringify(lines,null,0)+';\n');
const full=Math.ceil(Math.max(...lines.map(l=>l.e)));
const test=arg('--test');
const DUR=test?Math.min(full,parseFloat(test)):full;
const total=Math.round(DUR*FPS);
const url='file://'+path.join(root,'index.html');
const args=['--no-sandbox','--font-render-hinting=none','--disable-lcd-text'];

async function open(){
  const b=await chromium.launch({args});
  const pg=await b.newPage({viewport:{width:W,height:H},deviceScaleFactor:1});
  await pg.goto(url);
  await pg.waitForFunction(()=>window.__ready===true,null,{timeout:120000});
  return {b,pg};
}

(async()=>{
  const still=arg('--still');
  if(still){
    const {b,pg}=await open();
    for(const t of still.split(',')){
      await pg.evaluate(x=>window.renderAt(x),parseFloat(t));
      await pg.screenshot({path:path.join(root,`still-${t}.png`)});console.log('still',t);
    }
    await b.close();return;
  }
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'frames-'));
  const N=parseInt(arg('--workers'))||Math.min(4,os.cpus().length);
  let done=0;const t0=Date.now();
  await Promise.all(Array.from({length:N},async(_,w)=>{
    const {b,pg}=await open();
    for(let f=w;f<total;f+=N){
      await pg.evaluate(t=>window.renderAt(t),f/FPS);
      await pg.screenshot({path:path.join(tmp,'f'+String(f).padStart(5,'0')+'.jpg'),type:'jpeg',quality:93});
      if(++done%60===0)console.log(`frames ${done}/${total}  ${((Date.now()-t0)/1000).toFixed(0)}s`);
    }
    await b.close();
  }));
  console.log('encoding...');
  const r=cp.spawnSync('ffmpeg',['-y','-framerate',String(FPS),'-i',path.join(tmp,'f%05d.jpg'),'-i',path.join(root,'audio.mp3'),
    '-filter_complex',`[1:a]apad,atrim=0:${DUR}[a]`,'-map','0:v','-map','[a]','-c:v','libx264','-preset','medium','-crf','18',
    '-pix_fmt','yuv420p','-r',String(FPS),'-c:a','aac','-b:a','192k','-movflags','+faststart','-shortest',path.join(root,OUT)],{stdio:'inherit'});
  fs.rmSync(tmp,{recursive:true,force:true});
  if(r.status!==0){console.error('FFmpeg failed');process.exit(1);}
  console.log('done ->',OUT);
})().catch(e=>{console.error(e);process.exit(1);});
