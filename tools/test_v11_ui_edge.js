'use strict';
const fs=require('node:fs'),path=require('node:path'),url=require('node:url'),os=require('node:os'),cp=require('node:child_process');
const main=path.resolve(__dirname,'../app/src/main/assets');
const origin=path.join(main,'index.html'),tmp=path.join(main,'_smoke_v11_local.html');
const edge='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const inject=`
<script>
document.addEventListener('DOMContentLoaded',()=>{
 try {
  state.manual=true;
  setLocation(3.139,101.686,0,'manual',Date.now(),true);
  setTimeout(()=>{
   try{
    const cards=document.querySelectorAll('.nz-tile-completion');
    const initial=cards.length;
    const box=cards[0]&&cards[0].querySelector('input');
    if(box){box.checked=true;box.dispatchEvent(new Event('change',{bubbles:true}));}
    const progress=(document.getElementById('nz-prayer-progress')||{}).textContent;
    const names=document.querySelectorAll('#nz-esma-learning .nz-esma-item').length;
    const picker=document.getElementById('nz-surah-select');
    picker.value='falaq';picker.dispatchEvent(new Event('change',{bubbles:true}));
    const audioF=window.NamazLearningContent.surahs.find(x=>x.id==='falaq').audio;
    const audioN=window.NamazLearningContent.surahs.find(x=>x.id==='nas').audio;
    const duaLink=document.querySelector('#nz-dua-learning .nz-source-link');
    const output=document.createElement('output');output.id='nz-v11-smoke';
    output.textContent='V11_QA_'+JSON.stringify({checkboxes:initial,progress,names,audioF,audioN,source:duaLink&&duaLink.href});
    document.body.appendChild(output);
   }catch(e){document.body.setAttribute('data-v11-error',String(e));}
  },250);
 }catch(e){document.body.setAttribute('data-v11-error',String(e));}
});
</script>`;
fs.writeFileSync(tmp,fs.readFileSync(origin,'utf8').replace('</body>',inject+'</body>'),'utf8');
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'nz11-ui-'));
try{
 const args=['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--disable-extensions','--allow-file-access-from-files','--window-size=440,1160','--virtual-time-budget=5000','--user-data-dir='+profile,'--dump-dom',url.pathToFileURL(tmp).href];
 const run=cp.spawnSync(edge,args,{encoding:'utf8',timeout:22000,maxBuffer:15*1024*1024,windowsHide:true});
 const html=run.stdout||'';
 const found=/V11_QA_(\{.*?\})/.exec(html);
 if(!found)throw Error('QA output missing: '+(html.match(/data-v11-error="([^"]*)"/)||[])[1]);
 const data=JSON.parse(found[1].replaceAll('&quot;','"').replaceAll('&amp;','&'));
 if(data.checkboxes!==5||!data.progress.includes('1/5')||data.names!==1)throw Error('UI mismatch '+JSON.stringify(data));
 if(data.audioF!=='quran_audio/falaq.mp3'||data.audioN!=='quran_audio/nas.mp3')throw Error('Audio mapping');
 if(!data.source.startsWith('https://'))throw Error('No source link');
 console.log('PASS: Edge end-to-end '+JSON.stringify(data));
}finally{if(fs.existsSync(tmp))fs.unlinkSync(tmp);}
