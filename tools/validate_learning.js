'use strict';
// Offline CI: factual inventory, asset integrity, UI hooks, and no unlicensed bundled audio.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm');
const root=path.join(__dirname,'..'),dir=path.join(root,'app','src','main','assets');
function ok(x,msg){if(!x)throw new Error(msg);}
function file(p){return fs.readFileSync(path.join(dir,p),'utf8');}
for(const p of ['surah_extended.js','learning_content.js','learning_ui.js','prayer_tracker.js'])new vm.Script(file(p),{filename:p});
const ctx={window:{}};
new vm.Script(file('daily_dua_library.js'),{filename:'daily_dua_library.js'});
vm.runInNewContext(file('daily_dua_library.js'),ctx,{filename:'daily_dua_library.js'});
vm.runInNewContext(file('surah_extended.js'),ctx,{filename:'surah_extended.js'});
vm.runInNewContext(file('learning_content.js'),ctx,{filename:'learning_content.js'});
const data=ctx.window.NamazLearningContent;
ok(data&&data.surahs.length===24,'Must include 24 offline short surahs');
const audit=JSON.parse(fs.readFileSync(path.join(root,'docs','DAILY_DUA_CATALOG_AUDIT.json'),'utf8'));
ok(audit.sourceFiles===1001&&audit.originals===7&&audit.uniqueExternal>=600,'Incomplete source audit');
ok(data.duas.length===audit.total&&data.duas.length>=700,'Full sequential daily duas must replace 7-item weekly loop');
for(const dua of data.duas)ok(dua.ar&&dua.latin&&dua.tr&&dua.en&&dua.ref&&/^https:\/\//.test(dua.url),'Incomplete daily dua');
ok(data.names.length===99,'99 names');
ok(new Set(Array.from(data.names,x=>x.name)).size===99,'No duplicate name');
ok(new Set(Array.from(data.surahs,x=>x.id)).size===24,'Unique surahs');
const count={fatiha:7,ikhlas:4,falaq:5,nas:6};
const verseCounts={92:21,93:11,94:8,95:8,96:19,97:5,98:8,99:8,100:11,101:11,102:8,
103:3,104:9,105:5,106:4,107:7,108:3,109:6,110:3,111:5};
ok(data.surahs.map(s=>s.number).join(',')==='1,'+Array.from({length:23},(_,i)=>i+92).join(','),
  'Short surahs must be ordered 1,92..114');

for(const surah of data.surahs){
 ok(surah.verses.length===(count[surah.id]||verseCounts[surah.number]),'Incorrect verse count '+surah.id);
 ok(surah.link.startsWith('https://quran.com/'),'Source is missing '+surah.id);
 for(const verse of surah.verses)ok(verse[0].length>9&&verse[1].length>6,'Incomplete verse '+surah.id);
}
for(const dua of data.duas){
 ok(/^https:\/\/(quran\.com\/\d+\/\d+|github\.com\/islamicapi\/masnun-dua\/blob\/)/.test(dua.url),'Uncited dua');
 ok(dua.ar&&dua.tr&&dua.en&&dua.latin,'Incomplete dua '+dua.ref);
}
const expected={
 'quran_audio/falaq.mp3':'45C0DDECF765E4E9C30F85D2EB747F96708F1149CD7F027DB613B491313F110A',
 'quran_audio/nas.mp3':'BB5EED58FB701407FF40EC5E74CD0423DE687E40E87E539E2E67CF83EAC6E217',
 'quran_audio/fatiha.mp3':'46FE21A5118957D52AC76F5A6A7FDD7E75D52E4A569619AE3E174A23CE5C82BC',
 'quran_audio/ikhlas.mp3':'BCF92FC3FF76170C1A5F12C94636D290F26386A382B58E102425407B71463C5B'
};
for(const [p,hash] of Object.entries(expected)){
 const b=fs.readFileSync(path.join(dir,p));
 ok(b.length>100000,'Unexpectedly short audio '+p);
 ok(b.toString('ascii',0,3)==='ID3'||b[0]===255,'MP3 signature not present '+p);
 ok(crypto.createHash('sha256').update(b).digest('hex').toUpperCase()===hash,'Modified audio '+p);
}
for(const id of ['falaq','nas']){
 const surah=data.surahs.find(x=>x.id===id);
 ok(surah.audio==='quran_audio/'+id+'.mp3','Missing audio mapping '+id);
 const audio=fs.readFileSync(path.join(dir,surah.audio));
 ok(audio.length>250000,'Missing or incomplete audio '+id);
 ok(audio.toString('ascii',0,3)==='ID3'||audio[0]===255,'Invalid MP3 signature '+id);
}
for(const surah of data.surahs.filter(s=>s.audio))ok(fs.existsSync(path.join(dir,surah.audio)),'Audio not found '+surah.audio);
const html=file('index.html');
for(const id of ['nz-prayer-tracker','nz-dua-learning','nz-surah-learning','nz-esma-learning','nz-developer-note'])
 ok(html.includes('id="'+id+'"'),'Missing HTML hook '+id);
for(const p of ['surah_extended.js','learning_content.js','learning_ui.js','prayer_tracker.js','learning_styles.css'])
 ok(html.includes('"'+p+'"'),'Module not referenced '+p);
ok(html.includes('activeDayKey:function()'),'Ship/phone date bridge missing');
const ui=file('learning_ui.js'),tracker=file('prayer_tracker.js');
ok(ui.includes('localStorage')&&tracker.includes('localStorage'),'Offline progress missing');
ok(!ui.includes('innerHTML')&&!tracker.includes('innerHTML'),'Unsafe HTML interpolation in new modules');
ok(!ui.includes('Hafiz_Mustafa_Ozcan')&&!ui.includes('Muhsin_Kara'),'Unlicensed voice linked');
ok(!ui.includes('listenToDua(')&&!ui.includes('stopDuaSpeech(')&&!ui.includes('nz-dua-audio-status'),
 'Dua audio/TTS controls must be entirely removed');
ok(ui.includes('renderSurah(false)')&&ui.includes('renderDua(false)'),
 'Daily surah and dua must refresh on date rollover');
console.log('PASS: 24 short surahs, '+data.duas.length+' ordered daily duas, 99 Esma names, 4 existing CC0 surah audios pinned, 0 dua audio controls, offline daily rollover.');
