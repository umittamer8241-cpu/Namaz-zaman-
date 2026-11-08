'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.resolve(__dirname,'..');
const dir=path.join(root,'app/src/main/assets');
const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
const content=fs.readFileSync(path.join(dir,'learning_content.js'),'utf8');
const ui=fs.readFileSync(path.join(dir,'learning_ui.js'),'utf8');
const extension=fs.readFileSync(path.join(dir,'surah_extended.js'),'utf8');
const java=fs.readFileSync(path.join(root,'app/src/main/java/com/geminamaz/app/MainActivity.java'),'utf8');
for(const [name,value] of [['learning_ui.js',ui],['surah_extended.js',extension],['learning_content.js',content]])
 new vm.Script(value,{filename:name});
const context={window:{}};
for(const f of ['daily_dua_library.js','surah_extended.js','learning_content.js'])
 vm.runInNewContext(fs.readFileSync(path.join(dir,f),'utf8'),context,{filename:f});
assert(context.window.NamazLearningContent.surahs.length===24);
assert(context.window.NamazLearningContent.duas.length===702);
assert(context.window.NamazLearningContent.names.length===99);
assert((context.window.NamazSurahExtension||[]).length===20);
assert(context.window.NamazLearningContent.surahs[0].id==='fatiha');
assert(context.window.NamazLearningContent.surahs[1].number===92);
assert(context.window.NamazLearningContent.surahs[23].number===114);
assert(html.indexOf('surah_extended.js')<html.indexOf('learning_content.js'));
for(const wanted of ['function currentDay(){','const SEQUENCE_ANCHOR="2026-11-07";',
'function renderDua(force){','function renderSurah(force=false){',
'window.NamazLearning=Object.freeze({checkDay,currentDay,dailyIndex});',
'setInterval(checkDay,15000);','window.addEventListener("pageshow",checkDay);',
'window.addEventListener("focus",checkDay);',
'lastSurahDay!==day||chosenSurah===null',
'dailyIndex(day,DATA.surahs.length',
'lastDuaDay=day;'])
 assert(ui.includes(wanted),'Missing daily rollover behavior '+wanted);
for(const forbidden of ['listenToDua(','stopDuaSpeech(','nz-dua-audio-status','▶ Okunuşu dinle (cihaz sesi)'])
 assert(!ui.includes(forbidden),'Dua audio not fully removed: '+forbidden);
for(const forbidden of ['TextToSpeech','startArabicSpeech(','speakArabic(','stopArabic(','arabicTts'])
 assert(!java.includes(forbidden),'Native Dua TTS still present '+forbidden);
assert(java.includes('window.NamazLearning&&window.NamazLearning.checkDay&&window.NamazLearning.checkDay()'));
assert(context.window.NamazLearningContent.surahs.filter(s=>s.audio).length===4,
 'Preserve four licensed surah MP3 mappings');
console.log('PASS v0.26: 24 authored short surahs/163 sourced ayat, original 4 surah MP3 preserved; 702-install-independent daily duas; no Dua TTS native/JS; Android onResume refresh.');
