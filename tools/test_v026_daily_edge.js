'use strict';
const fs=require('node:fs'),path=require('node:path'),url=require('node:url'),os=require('node:os'),cp=require('node:child_process');
const assets=path.resolve(__dirname,'../app/src/main/assets');
const file=path.join(assets,'_v026_daily_qa.html');
const index=fs.readFileSync(path.join(assets,'index.html'),'utf8');
function browserTest(){
 document.addEventListener('DOMContentLoaded',()=>{
  setTimeout(()=>{
   try{
    if(!window.NamazLearningDaily||!window.NamazLearningContent)throw Error('Daily feature not loaded');
    const dua=document.getElementById('nz-dua-learning');
    const sure=document.getElementById('nz-surah-learning');
    window.NamazApp.activeDayKey=()=> '2026-11-08';
    window.NamazLearningDaily.refresh();
    function snap(){
      const select=document.getElementById('nz-surah-select');
      return {day:window.NamazApp.activeDayKey(),dua:dua.querySelector('.nz-dua-progress')?.textContent,
       duaText:dua.querySelector('.nz-dua-arabic')?.textContent||'',
       surah:select?.value,count:select?.options?.length,duaButtons:dua.querySelectorAll('button').length,
       surahHighlight:sure.querySelector('.nz-surah-daily')?.textContent||''};
    }
    const first=snap();
    const picker=document.getElementById('nz-surah-select');
    const alternate=[...picker.options].find(x=>x.value!==first.surah);
    picker.value=alternate.value;picker.dispatchEvent(new Event('change'));
    window.NamazLearningDaily.refresh();
    const manual=snap();
    window.NamazApp.activeDayKey=()=> '2026-11-09';
    window.NamazLearningDaily.refresh();
    const second=snap();
    window.NamazLearningDaily.refresh();
    const stable=snap();
    const output=document.createElement('output');output.id='v026-qa-output';
    output.textContent='V026QA_'+JSON.stringify({first,manual,second,stable});
    document.body.appendChild(output);
   }catch(e){document.body.setAttribute('data-v026-failure',String(e.stack||e));}
  },400);
 });
}
const injection='<script>('+browserTest.toString()+')();</script>';
fs.writeFileSync(file,index.replace('</body>',injection+'</body>'));
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'namaz-daily-v026-'));
try{
 const edge='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
 const result=cp.spawnSync(edge,['--headless=new','--disable-gpu','--no-first-run','--disable-extensions',
  '--allow-file-access-from-files','--virtual-time-budget=15000','--user-data-dir='+profile,
  '--dump-dom',url.pathToFileURL(file).href],{encoding:'utf8',timeout:25000,maxBuffer:20*1024*1024,windowsHide:true});
 const output=result.stdout||'';
 const found=/V026QA_(\{.*?\})<\/output>/.exec(output);
 if(!found)throw Error('Browser output missing: '+((output.match(/data-v026-failure="([^"]+)"/)||[])[1]||'')+' '+(result.stderr||'').slice(-300));
 const data=JSON.parse(found[1].replaceAll('&quot;','"').replaceAll('&amp;','&'));
 const assert=(ok,msg)=>{if(!ok)throw Error(msg+' '+JSON.stringify(data));};
 assert(data.first.count===18,'Must offer 18 offline surahs');
 assert(data.first.duaButtons===0&&data.second.duaButtons===0,'Dua TTS controls still present');
 assert(data.first.surah!==data.second.surah,'Surah did not rotate after midnight');
 assert(data.first.duaText!==data.second.duaText,'Dua did not rotate after midnight');
 assert(data.manual.surah!==data.first.surah,'Manual surah selection did not work');
 assert(data.second.surah===data.stable.surah,'Surah changed twice in same day');
 assert(data.second.duaText===data.stable.duaText,'Dua changed twice in same day');
 assert(data.first.surahHighlight.length>10,'Daily surah label absent');
 console.log('PASS: Real Edge WebView-equivalent test; 18 surahs; duo rotates at day+1; surah rotates at day+1; manual selection holds until new day; no dua audio UI');
 console.log('Results:',JSON.stringify({firstSurah:data.first.surah,nextSurah:data.second.surah,firstDua:data.first.dua,secondDua:data.second.dua,available:data.first.count}));
}catch(e){console.error('FAIL:',e.stack);process.exitCode=1;}
finally{
 if(fs.existsSync(file))fs.unlinkSync(file);
 try{fs.rmSync(profile,{recursive:true,force:true,maxRetries:2});}catch(_){}
}
