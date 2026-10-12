const fs=require('fs');
const path=require('path');
const os=require('os');
const { spawn, execSync } = require('child_process');

const BASENAME='hadith-video';
const FPS=30;
const RATIOS={
  '9x16': { w:1080,h:1920,w4k:2160,h4k:3840,wHd:720,hHd:1280 },
  '16x9': { w:1920,h:1080,w4k:3840,h4k:2160,wHd:1280,hHd:720 },
  '1x1':  { w:1080,h:1080,w4k:2160,h4k:2160,wHd:720,hHd:720 },
  '4x5':  { w:1080,h:1350,w4k:2160,h4k:2700,wHd:720,hHd:900 },
  '3x4':  { w:1080,h:1440,w4k:2160,h4k:2880,wHd:720,hHd:960 },
  '4x3':  { w:1440,h:1080,w4k:2880,h4k:2160,wHd:960,hHd:720 },
};
const TIERS=['4k','fhd','hd'];

function parseArgs(){
  const args=process.argv.slice(2);
  let ratios=null, tiers=null, test=null, still=null, workers=null;
  for(let i=0;i<args.length;i++){
    if(args[i]==='--ratios'&&args[i+1]){ ratios=args[++i].split(',').map(s=>s.trim()).filter(Boolean); }
    if(args[i]==='--tiers'&&args[i+1]){ tiers=args[++i].split(',').map(s=>s.trim()).filter(Boolean); }
    if(args[i]==='--test'&&args[i+1]){ test=parseFloat(args[++i]); }
    if(args[i]==='--still'&&args[i+1]){ still=args[++i].split(',').map(s=>parseFloat(s)); }
    if(args[i]==='--workers'&&args[i+1]){ workers=parseInt(args[++i]); }
  }
  return {ratios,tiers,test,still,workers};
}

function parseTimestamps(){
  const txt=fs.readFileSync('timestamps.txt','utf8');
  const lines=[];
  txt.split('\n').forEach(l=>{
    const p=l.split('|').map(s=>s.trim());
    if(p.length<3) return;
    const s=parseFloat(p[0]), e=parseFloat(p[1]);
    if(!isNaN(s)&&!isNaN(e)&&p[2]) lines.push({s,e,text:p[2],tag:(p[3]||'informative')});
  });
  const duration=Math.ceil(lines.length?lines[lines.length-1].e:82);
  return {lines,duration};
}

async function captureRatio(ratioKey, duration, testSec, workersCount, need4k){
  const {chromium}=require('playwright');
  const ratio=RATIOS[ratioKey];
  const totalFrames=Math.ceil((testSec||duration)*FPS);
  const tmpDir=fs.mkdtempSync(path.join(os.tmpdir(), `frames-${ratioKey}-`));
  const framesDir=path.join(tmpDir, ratioKey);
  fs.mkdirSync(framesDir,{recursive:true});

  const numWorkers=workersCount||Math.min(4, os.cpus().length||2);
  const chunk=Math.ceil(totalFrames/numWorkers);

  console.log(`[${ratioKey}] Capturing ${totalFrames} frames (${(testSec||duration)}s @${FPS}fps) with ${numWorkers} workers, scale ${need4k?'2x (4K sharp)':'1x'} -> ${framesDir}`);

  async function worker(workerId, startF, endF){
    const browser=await chromium.launch({args:['--no-sandbox','--font-render-hinting=none','--disable-lcd-text']});
    const context=await browser.newContext({viewport:{width:ratio.w,height:ratio.h}, deviceScaleFactor: need4k?2:1});
    const page=await context.newPage();
    const fileUrl='file://'+path.resolve('index.html')+`?ratio=${ratioKey}`;
    await page.goto(fileUrl, {waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.__ready===true, {timeout:30000});
    for(let f=startF; f<endF; f++){
      const t=f/FPS;
      await page.evaluate((tt)=>window.renderAt(tt), t);
      const buf=await page.screenshot({type:'jpeg', quality:93});
      const name=`f${String(f).padStart(5,'0')}.jpg`;
      fs.writeFileSync(path.join(framesDir,name), buf);
      if(f%30===0) process.stdout.write(`\r[${ratioKey} w${workerId}] ${f}/${totalFrames} (${((f/totalFrames)*100).toFixed(1)}%)`);
    }
    await browser.close();
  }

  const promises=[];
  for(let w=0; w<numWorkers; w++){
    const sf=w*chunk, ef=Math.min((w+1)*chunk, totalFrames);
    if(sf>=ef) continue;
    promises.push(worker(w,sf,ef));
  }
  await Promise.all(promises);
  console.log(`\n[${ratioKey}] Capture done`);
  return {framesDir, tmpRoot:tmpDir, totalFrames};
}

function ensureAudio(duration){
  if(fs.existsSync('audio.mp3')) return 'audio.mp3';
  console.log('audio.mp3 not found -> generating silent audio');
  const tmp='__silent.m4a';
  try{ execSync(`ffmpeg -y -f lavfi -i anullsrc=r=48000:cl=stereo -t ${duration} -c:a aac -b:a 192k ${tmp}`, {stdio:'inherit'}); return tmp; }catch(e){ 
    // fallback empty
    execSync(`ffmpeg -y -f lavfi -i anullsrc -t ${duration} -c:a aac ${tmp}`, {stdio:'inherit'}); return tmp; }
}

function encodeTier(ratioKey, tierKey, framesDir, audioPath, duration, totalFrames, need4k){
  const ratio=RATIOS[ratioKey];
  let targetW, targetH;
  if(tierKey==='4k'){ targetW=ratio.w4k; targetH=ratio.h4k; }
  else if(tierKey==='fhd'){ targetW=ratio.w; targetH=ratio.h; }
  else { targetW=ratio.wHd; targetH=ratio.hHd; }

  const outFile=`${BASENAME}-${ratioKey}-${tierKey}.mp4`;
  const scaleFilter = (need4k && tierKey!=='4k') ? `scale=${targetW}:${targetH}:flags=lanczos,` : (tierKey==='4k' && !need4k ? `scale=${targetW}:${targetH}:flags=lanczos,` : '');
  const vFilter = scaleFilter ? `-vf "${scaleFilter.slice(0,-1)}"` : '';

  let crf = tierKey==='fhd'?18:20;
  for(let attempt=0; attempt<5; attempt++){
    const cmd=`ffmpeg -y -framerate ${FPS} -i "${framesDir}/f%05d.jpg" -i "${audioPath}" -filter_complex "[0:v]${scaleFilter ? scaleFilter.slice(0,-1) : 'null'}[v];[1:a]apad,atrim=0:${duration}[a]" -map "[v]" -map "[a]" -c:v libx264 -profile:v high -preset medium -pix_fmt yuv420p -r ${FPS} -crf ${crf} ${vFilter} -c:a aac -b:a 192k -movflags +faststart -shortest "${outFile}"`;
    // simpler command without double vf
    const simpleCmd=`ffmpeg -y -framerate ${FPS} -i "${framesDir}/f%05d.jpg" -i "${audioPath}" -filter_complex "[1:a]apad,atrim=0:${duration}[a]" ${scaleFilter?`-vf "${scaleFilter.slice(0,-1)}"` : ''} -map 0:v -map "[a]" -c:v libx264 -profile:v high -preset medium -pix_fmt yuv420p -r ${FPS} -crf ${crf} -c:a aac -b:a 192k -movflags +faststart -shortest "${outFile}"`;
    console.log(`[${ratioKey}-${tierKey}] Encoding attempt crf=${crf}: ${outFile}`);
    try{ execSync(simpleCmd, {stdio:'inherit'}); }catch(e){ throw e; }
    const stat=fs.statSync(outFile);
    const sizeGiB=stat.size/(1024*1024*1024);
    console.log(`[${ratioKey}-${tierKey}] Size ${(stat.size/1024/1024).toFixed(1)} MB`);
    if(sizeGiB>1.9){ crf+=2; console.warn(`File >1.9 GiB, retrying with crf ${crf}`); continue; }
    break;
  }
  return outFile;
}

async function main(){
  const {ratios:ratioArg, tiers:tierArg, test:testSec, still:stillArg, workers:workersArg}=parseArgs();
  const ratioKeys=ratioArg||Object.keys(RATIOS);
  const tierKeys=tierArg||TIERS;
  const {lines,duration:fullDur}=parseTimestamps();
  const duration=testSec||fullDur;

  // write lines.js for browser
  fs.writeFileSync('lines.js', `const LINES=${JSON.stringify(lines)};\nconst DURATION=${duration};\n`);

  console.log(`Duration ${duration}s, ratios ${ratioKeys.join(',')}, tiers ${tierKeys.join(',')}`);

  // disk check
  try{ const free=execSync('df -h .').toString(); console.log(free); }catch{}

  const audioPath=ensureAudio(duration);

  const created=[];
  for(const rk of ratioKeys){
    if(!RATIOS[rk]){ console.error(`Unknown ratio ${rk}`); process.exit(1); }
    const need4k=tierKeys.includes('4k');
    const {framesDir, tmpRoot}=await captureRatio(rk, fullDur, testSec, workersArg, need4k);
    for(const tk of tierKeys){
      const out=encodeTier(rk, tk, framesDir, audioPath, duration, Math.ceil(duration*FPS), need4k);
      created.push(out);
    }
    // cleanup frames
    fs.rmSync(tmpRoot,{recursive:true, force:true});
  }

  console.log('\n=== Created files ===');
  created.forEach(f=>{ const s=fs.statSync(f); console.log(`${f} - ${(s.size/1024/1024).toFixed(1)} MB`); });

  // stills
  if(stillArg){
    console.log('Stills not implemented in this build - use test render + screenshot');
  }

  if(fs.existsSync('__silent.m4a')) fs.unlinkSync('__silent.m4a');
}

main().catch(e=>{ console.error(e); process.exit(1); });
