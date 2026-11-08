'use strict';
const fs=require('node:fs'),path=require('node:path'),url=require('node:url'),os=require('node:os'),cp=require('node:child_process');
const root=path.resolve(__dirname,'../app/src/main/assets');
const input=path.join(root,'index.html'),testHtml=path.join(root,'_v023_schematic_test.html');
const injected="<script>\ndocument.addEventListener('DOMContentLoaded',()=>{\n try {\n  const arrow=document.getElementById('needle');\n  arrow.style.transition='none';\n  const measure=()=>{\n   const r=arrow.getBoundingClientRect();\n   return {opacity:Number(getComputedStyle(arrow).opacity),width:r.width,height:r.height,\n    rotation:arrow.style.transform,schematic:arrow.classList.contains('compass-unreliable'),\n    noLocation:arrow.classList.contains('compass-no-location'),\n    mode:document.getElementById('compass-arrow-mode').textContent,\n    label:document.getElementById('pro-compass-label').textContent};\n  };\n  const noLocation=measure();\n  state.manual=true;\n  setLocation(40.97,29.10,null,'manual',Date.now(),true);\n  const bearing=qibla(state.lat,state.lon);\n  const unknown=measure();\n  nativeHeadingData(100,90,'fused',false);\n  const inaccurate=measure();\n  nativeHeadingData(100,5,'fused',true);\n  const live=measure();\n  state.headingUpdatedAt=Date.now()-15000;\n  updateNeedle();\n  const stale=measure();\n  state.lat=null;state.lon=null;state.manual=false;\n  renderAll();\n  const missingAgain=measure();\n  const summary={bearing,noLocation,unknown,inaccurate,live,stale,missingAgain};\n  const el=document.createElement('output');\n  el.id='v023-test-out';\n  el.textContent='V023_RESULT_'+JSON.stringify(summary);\n  document.body.appendChild(el);\n }catch(e){document.body.setAttribute('data-v023-error',String(e.stack||e));}\n});\n</script>";
fs.writeFileSync(testHtml,fs.readFileSync(input,'utf8').replace('</body>',injected+'</body>'));
const tempProfile=fs.mkdtempSync(path.join(os.tmpdir(),'nz-v023-compass-'));
try{
 const binary='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
 const args=['--headless=new','--disable-gpu','--no-first-run','--disable-extensions','--allow-file-access-from-files','--window-size=460,1200','--virtual-time-budget=5000','--user-data-dir='+tempProfile,'--dump-dom',url.pathToFileURL(testHtml).href];
 const run=cp.spawnSync(binary,args,{encoding:'utf8',timeout:26000,maxBuffer:24*1024*1024,windowsHide:true});
 const dom=run.stdout||'',match=/V023_RESULT_(\{.*?\})<\/output>/.exec(dom);
 if(!match)throw Error('Missing browser report '+(dom.match(/data-v023-error="([^"]+)"/)||[])[1]+' '+(run.stderr||'').slice(-300));
 const d=JSON.parse(match[1].replaceAll('&quot;','"').replaceAll('&amp;','&'));
 if(d.noLocation.opacity!==0||!d.noLocation.noLocation)throw Error('No-coordinate pointer must remain hidden '+JSON.stringify(d.noLocation));
 if(!(d.bearing>1&&d.bearing<360))throw Error('Invalid computed bearing '+d.bearing);
 for(const [name,v] of [['unknown',d.unknown],['inaccurate',d.inaccurate],['stale',d.stale]]){
  if(!v.schematic||v.opacity<.7||v.width<60||!/(Kuzey üstte|North-up)/.test(v.mode))throw Error(name+' failed north-up visible schematic: '+JSON.stringify(v));
  if(v.rotation==='rotate(0deg)')throw Error(name+' schematic arrow incorrectly points 0 degrees');
 }
 if(d.live.schematic||d.live.opacity<.98||!/(Sensör doğrulandı|Sensor verified)/.test(d.live.mode))throw Error('Trusted live arrow failed '+JSON.stringify(d.live));
 if(d.live.rotation===d.unknown.rotation)throw Error('Live and schematic arrow must use different frames');
 if(d.missingAgain.opacity!==0||!d.missingAgain.noLocation)throw Error('Missing-again pointer must hide');
 console.log('PASS Edge v0.23: no coordinates hidden; unverified, inaccurate and stale sensors show visible north-up schematic arrow; trusted heading switches to live rotation.');
}catch(e){console.error(e.stack);process.exitCode=1;}
finally{if(fs.existsSync(testHtml))fs.unlinkSync(testHtml);}
