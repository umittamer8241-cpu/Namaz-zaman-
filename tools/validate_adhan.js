'use strict';
// No network required. Validate the exact reviewed CC0 recordings on the v0.9 branch.
const fs=require('node:fs');
const crypto=require('node:crypto');
const path=require('node:path');
const root=path.join(__dirname,'..');
const dir=path.join(root,'app','src','main','assets');
const expected={
 'audio/Adhan.ogg':'FAEB03E4338554FB8B54DBA98ED4949648615B58E991BBD560A89F4837DDE413',
 'audio/Beautiful_adhan.ogg':'35FE06B08FE80505C550C33FED8A783FA9901DDC81AC884958B4BE048F5B2A79',
 'audio/Muslim_calling_to_prayer.ogg':'3B350BC210D657727578ED977E32323C06B63C2088C3EBCEA9FC9AFB7D487702'
};
for(const [name,hash] of Object.entries(expected)){
 const b=fs.readFileSync(path.join(dir,name));
 if(b.toString('ascii',0,4)!=='OggS')throw Error('Invalid OGG header: '+name);
 const actual=crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
 if(actual!==hash)throw Error('SHA-256 changed for '+name);
}
const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
const js=fs.readFileSync(path.join(dir,'adhan_settings.js'),'utf8');
if(!html.includes('<script src="adhan_settings.js"></script>')||!html.includes('id="adhan-settings-container"'))throw Error('Settings not mounted in index.html');
for(const prayer of ['fajr','dhuhr','asr','maghrib','isha'])if(!js.includes("'"+prayer+"'"))throw Error('Missing prayer '+prayer);
for(const lang of ['tr','en','ms','id','ar','ru','fr','de','es','pt','az','ur'])if(!js.includes(lang+':{title:'))throw Error('Missing adhan locale '+lang);
for(const name of Object.keys(expected))if(!js.includes(name))throw Error('Recording missing from selectors '+name);
if(js.includes('Hafiz_Mustafa_Ozcan')||js.includes('Muhsin_Kara'))throw Error('Unlicensed contest recording referenced');
console.log('PASS: 3 bundled CC0 Ogg assets verified by SHA-256; five prayer selectors; 12 languages; no unlicensed clips.');
