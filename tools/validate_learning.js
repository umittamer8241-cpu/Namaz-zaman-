'use strict';
// Offline CI: factual inventory, asset integrity, UI hooks, and no unlicensed bundled audio.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm');
const root=path.join(__dirname,'..'),dir=path.join(root,'app','src','main','assets');
function ok(x,msg){if(!x)throw new Error(msg);}
function file(p){return fs.readFileSync(path.join(dir,p),'utf8');}
for(const p of ['learning_content.js','learning_ui.js','prayer_tracker.js','adhan_settings.js'])new vm.Script(file(p),{filename:p});
const ctx={window:{}};vm.runInNewContext(file('learning_content.js'),ctx,{filename:'learning_content.js'});
const data=ctx.window.NamazLearningContent;
ok(data&&data.surahs.length===4,'Exactly 4 reviewed surahs');
ok(data.duas.length===7,'Seven daily duas');
ok(data.names.length===99,'99 names');
ok(new Set(Array.from(data.names,x=>x.name)).size===99,'No duplicate name');
ok(new Set(Array.from(data.surahs,x=>x.id)).size===4,'Unique surahs');
const count={fatiha:7,ikhlas:4,falaq:5,nas:6};
for(const surah of data.surahs){
 ok(surah.verses.length===count[surah.id],'Incorrect verse count '+surah.id);
 ok(surah.link.startsWith('https://quran.com/'),'Source is missing '+surah.id);
 for(const verse of surah.verses)ok(verse[0].length>9&&verse[1].length>6,'Incomplete verse '+surah.id);
}
for(const dua of data.duas){
 ok(/^https:\/\/quran\.com\/\d+\/\d+$/.test(dua.url),'Uncited dua');
 ok(dua.ar&&dua.tr&&dua.en&&dua.latin,'Incomplete dua '+dua.ref);
}
const expected={
 'quran_audio/fatiha.mp3':'46FE21A5118957D52AC76F5A6A7FDD7E75D52E4A569619AE3E174A23CE5C82BC',
 'quran_audio/ikhlas.mp3':'BCF92FC3FF76170C1A5F12C94636D290F26386A382B58E102425407B71463C5B'
};
for(const [p,hash] of Object.entries(expected)){
 const b=fs.readFileSync(path.join(dir,p));
 ok(b.length>100000,'Unexpectedly short audio '+p);
 ok(b.toString('ascii',0,3)==='ID3'||b[0]===255,'MP3 signature not present '+p);
 ok(crypto.createHash('sha256').update(b).digest('hex').toUpperCase()===hash,'Modified audio '+p);
}
ok(data.surahs.find(x=>x.id==='falaq').audio===null,'No unsupported Falaq audio');
ok(data.surahs.find(x=>x.id==='nas').audio===null,'No unsupported Nas audio');
for(const surah of data.surahs.filter(s=>s.audio))ok(expected[surah.audio],'Unlisted audio '+surah.audio);
const html=file('index.html');
for(const id of ['nz-prayer-tracker','nz-dua-learning','nz-surah-learning','nz-esma-learning','nz-developer-note'])
 ok(html.includes('id="'+id+'"'),'Missing HTML hook '+id);
for(const p of ['learning_content.js','learning_ui.js','prayer_tracker.js','learning_styles.css'])
 ok(html.includes('"'+p+'"'),'Module not referenced '+p);
ok(html.includes('activeDayKey:function()'),'Ship/phone date bridge missing');
const ui=file('learning_ui.js'),tracker=file('prayer_tracker.js');
ok(ui.includes('localStorage')&&tracker.includes('localStorage'),'Offline progress missing');
ok(!ui.includes('innerHTML')&&!tracker.includes('innerHTML'),'Unsafe HTML interpolation in new modules');
ok(!ui.includes('Hafiz_Mustafa_Ozcan')&&!ui.includes('Muhsin_Kara'),'Unlicensed voice linked');
console.log('PASS: 4 surahs (22 verses), 7 daily Quran duas, 99 Esma names, 2 CC0 audios (SHA256), 5 prayer tracker IDs, offline progress, UI wiring.');
