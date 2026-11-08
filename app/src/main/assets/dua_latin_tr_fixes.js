/* Turkish pronunciation-aid cleanup for the offline dua catalog.
 * Keep upstream Arabic, reference, meaning and item ordering unchanged.
 * Latin-letter readings remain approximate and are NOT a substitute for Arabic recitation.
 */
(function(){
'use strict';
const CHARACTER_FIXES=Object.freeze({
  'ġ':'ğ','ż':'z','ś':'s','ž':'z','ê':'e','à':'a','á':'â',
  'é':'e','í':'i','ŋ':'n','ć':'c','е':'e','к':'k'
});
const ITEM_CORRECTIONS=Object.freeze({
  6:[['eınnî',"e'innî"]],                      // Ebû Dâvûd 1522: أعني
  9:[['teveileyte','tevelleyte']],              // Ebû Dâvûd 1425: توليت
  154:[['tevekkeltü alAllâhi','tevekkeltü alâllâh']],
  155:[['Bismillâhi, tevekkeltü alAllâhi. Allâhümme, innâ neûzü bike min en nezille ev nadılle, ev nazlime ev nuzlame, ev naćhele ev yuchelee aleynâ',
         'Bismillâhi tevekkeltü alâllâh. Allâhümme innâ neûzü bike min en nezille ev nadille, ev nazlime ev nuzleme, ev nechele ev yüchele aleynâ.']],
  157:[['alAllâhi','alâllâhi']],
  159:[['alAllâhi','alâllâhi']],
  752:[['yunaккas-sevbül','yünakkas-sevbül']]
});
function correct(entry){
  const original=String(entry?.latin||'');
  let s=original.normalize('NFC');
  // Manually checked source-specific cases first, before generic typography fixes.
  const corrections=ITEM_CORRECTIONS[entry?.id]||[];
  for(const [wrong,right] of corrections){
    if(s.includes(wrong))s=s.replace(wrong,right);
  }
  s=s.replace(/[ġżśžêàáéíŋćек]/gu,c=>CHARACTER_FIXES[c]||c);
  // Broken case boundaries from upstream (illAllâhu, vAllâh, SübhânAllâhi, etc.)
  s=s.replace(/wAllâh/g,'vallâh')
     .replace(/\balAllâh/g,'alâllâh')
     .replace(/([A-Za-zÇĞİÖŞÜçğıöşüâîû])Allâh/g,'$1allâh');
  // This Unicode honorific is explanatory, not Arabic text to pronounce.
  s=s.replace(/\s*ﷺ/g,' (s.a.v.)');
  return s.replace(/[ \t]{2,}/g,' ').trim();
}
window.NamazDuaLatinTR=Object.freeze({correct,revision:'v0.27'});
})();
