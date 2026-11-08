'use strict';
const fs=require('node:fs'),path=require('node:path'),url=require('node:url'),
 os=require('node:os'),cp=require('node:child_process'),assert=require('node:assert');
const assets=path.resolve(__dirname,'../app/src/main/assets');
const original=path.join(assets,'index.html'),temp=path.join(assets,'_v026_daily_learning_qa.html');
const test=[
'<script>',
"document.addEventListener('DOMContentLoaded',()=>{",
' try{',
"  const card=document.getElementById('nz-dua-learning'),surah=document.getElementById('nz-surah-learning');",
"  const labels=document.getElementById('nz-surah-select');",
"  const count24=labels.options.length===24&&window.NamazLearningContent.surahs.length===24;",
"  const count702=window.NamazLearningContent.duas.length===702;",
"  const noDuaAudio=!card.querySelector('audio')&&!card.querySelector('button')&&!card.querySelector('#nz-dua-audio-status');",
"  const surahAudioRetained=window.NamazLearningContent.surahs.filter(x=>x.audio).length===4;",
"  window.__testDate='2026-11-07';",
"  window.NamazApp.activeDayKey=()=>window.__testDate;",
"  window.NamazLearning.checkDay();",
"  const firstDua=card.querySelector('.nz-dua-arabic').textContent;",
"  const firstSurah=surah.querySelector('#nz-surah-select').value;",
"  const firstDuaProgress=card.querySelector('.nz-dua-progress').textContent;",
"  window.__testDate='2026-11-08';",
"  window.NamazLearning.checkDay();",
"  const secondDua=card.querySelector('.nz-dua-arabic').textContent;",
"  const secondSurah=surah.querySelector('#nz-surah-select').value;",
"  const secondDuaProgress=card.querySelector('.nz-dua-progress').textContent;",
"  const nextDua=firstDua!==secondDua&&firstDuaProgress.includes('1 / 702')&&secondDuaProgress.includes('2 / 702');",
"  const nextSurah=firstSurah!==secondSurah&&secondSurah==='surah92';",
"  const sameDayDua=card.querySelector('.nz-dua-arabic').textContent;",
"  window.NamazLearning.checkDay();",
"  const sameDayStable=card.querySelector('.nz-dua-arabic').textContent===sameDayDua&&surah.querySelector('#nz-surah-select').value===secondSurah;",
"  const currentSelect=surah.querySelector('#nz-surah-select');currentSelect.value='surah110';currentSelect.dispatchEvent(new Event('change',{bubbles:true}));",
"  const manuallySelected=surah.querySelector('#nz-surah-select').value==='surah110';",
"  window.NamazLearning.checkDay();",
"  const sameDaySelectionPreserved=surah.querySelector('#nz-surah-select').value==='surah110';",
"  window.__testDate='2026-11-09';window.NamazLearning.checkDay();",
"  const thirdSurah=surah.querySelector('#nz-surah-select').value;",
"  const nextDaySelectionReset=thirdSurah==='surah93';",
"  const oldAnchor=localStorage.getItem('nz_dua_sequence_start_v09');",
"  localStorage.clear();",
"  const uninstallSafe=window.NamazLearning.dailyIndex('2026-11-09',702)===2;",
"  const results={count24,count702,noDuaAudio,surahAudioRetained,nextDua,nextSurah,sameDayStable,manuallySelected,sameDaySelectionPreserved,nextDaySelectionReset,uninstallSafe};",
"  const out=document.createElement('output');out.id='v026-qa';out.textContent='V026_DAILY_'+JSON.stringify(results);document.body.appendChild(out);",
" }catch(e){document.body.setAttribute('data-v026-error',String(e.stack||e));}",
'});',
'</script>'
].join('\n');
fs.writeFileSync(temp,fs.readFileSync(original,'utf8').replace('</body>',test+'</body>'));
const prof=fs.mkdtempSync(path.join(os.tmpdir(),'namaz-v026-'));
try{
 const res=cp.spawnSync('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',[
 '--headless=new','--disable-gpu','--no-first-run','--disable-extensions',
 '--allow-file-access-from-files','--virtual-time-budget=5300','--user-data-dir='+prof,'--dump-dom',url.pathToFileURL(temp).href],
 {encoding:'utf8',timeout:26000,maxBuffer:25*1024*1024,windowsHide:true});
 const html=res.stdout||'',m=/V026_DAILY_(\{.*?\})<\/output>/.exec(html);
 if(!m)throw Error('Browser QA missing '+(html.match(/data-v026-error="([^"]+)"/)||[])[1]+' '+(res.stderr||'').slice(-500));
 const data=JSON.parse(m[1].replaceAll('&quot;','"').replaceAll('&amp;','&'));
 for(const [k,ok] of Object.entries(data))assert(ok,'Failed '+k+' '+JSON.stringify(data));
 console.log('PASS Edge v0.26: fixed 702 daily sequence without reinstall reset; 24 dynamic daily surahs with memorized and 4 MP3 assets; midnight rollover resets chosen surah; dua audio absent.');
}catch(e){console.error(e.stack);process.exitCode=1;}
finally{if(fs.existsSync(temp))fs.unlinkSync(temp);}
