import urllib.request,json,pathlib,time,unicodedata
root=pathlib.Path(r'C:\Users\Administrator\Documents\NamazZamani\repo_play_prep')
out=root/'app/src/main/assets/surah_extended.js'
# Original one-sentence editorial summaries, never represented as verse translations.
summaries={
92:("Leyl","Al-Layl","İyilik ve takvanın farklı sonuçları, cömertlik ve cimrilik hakkında hatırlatma.","On generosity, mindfulness of God, and the differing outcomes of good and selfish acts."),
93:("Duhâ","Ad-Duha","Allah'ın kulunu yalnız bırakmadığını, şükretmeyi ve ihtiyaç sahiplerine iyi davranmayı öğütler.","Assurance of divine care, gratitude, and kindness to people in need."),
94:("İnşirâh","Ash-Sharh","Zorlukla beraber kolaylık bulunduğunu ve Allah'a yönelmeyi hatırlatır.","Relief alongside hardship, and turning to God in hope."),
95:("Tîn","At-Tin","İnsanın değerini, iman ve güzel davranışın önemini hatırlatır.","Human dignity, faith, righteous deeds, and accountability."),
96:("Alak","Al-Alaq","Okuma, öğrenme, insanın yaratılışı ve kulluk hakkında öğütler içerir.","Reading, learning, human creation and worship."),
97:("Kadir","Al-Qadr","Kadir gecesinin değerini ve esenlik mesajını anlatır.","The significance and peace of the Night of Decree."),
98:("Beyyine","Al-Bayyinah","Açık delil, samimiyetle ibadet ve salih amelin önemini hatırlatır.","Clear evidence, sincere worship, and righteous conduct."),
99:("Zilzâl","Az-Zalzalah","Hesap gününde en küçük iyiliğin ve kötülüğün bile karşılığını hatırlatır.","On accountability for even the smallest deeds."),
100:("Âdiyât","Al-Adiyat","İnsanın nankörlüğü ve hesap günü hakkında uyarıda bulunur.","A warning about ingratitude and ultimate accountability."),
101:("Kâria","Al-Qari'ah","Kıyamet gününün ağırlığını ve amellerin tartılmasını hatırlatır.","The weight of the Day of Judgment and the weighing of deeds."),
102:("Tekâsür","At-Takathur","Çoklukla övünmenin insanı oyalamasına ve nimetlerin hesabına dikkat çeker.","A warning against rivalry for worldly abundance and neglect of gratitude."),
103:("Asr","Al-Asr","İman, iyi işler, hakkı ve sabrı öğütlemenin önemini hatırlatır.","The importance of faith, good deeds, truth and patience."),
104:("Hümeze","Al-Humazah","Alay etmeyi, başkalarını küçümsemeyi ve servete aşırı güveni kınar.","Condemns mockery, slander and misplaced trust in wealth."),
105:("Fîl","Al-Fil","Fil ordusu kıssası üzerinden Allah'ın korumasını hatırlatır.","Recalls divine protection through the account of the people of the elephant."),
106:("Kureyş","Quraysh","Güvenlik ve rızık nimetlerine şükrederek Allah'a kulluğa davet eder.","An invitation to worship God in gratitude for security and sustenance."),
107:("Mâûn","Al-Ma'un","Yetim ve yoksula duyarsızlığı, gösteriş için yapılan ibadeti eleştirir.","Warns against neglecting the needy and worship performed for show."),
108:("Kevser","Al-Kawthar","Allah'ın nimetlerine şükretmeyi, namazı ve ibadeti öğütler.","Gratitude for God's abundant blessings and devotion through prayer."),
109:("Kâfirûn","Al-Kafirun","İnançta samimiyet ve ibadette kararlılık mesajı taşır.","Sincerity and steadfastness in worship."),
110:("Nasr","An-Nasr","Yardım ve zafer karşısında Allah'ı tesbih etmeyi ve bağışlanma dilemeyi öğretir.","Praising God and seeking forgiveness in times of victory."),
111:("Tebbet","Al-Masad","Haksızlığa ve kibire karşı uyarı taşıyan bir suredir.","A warning against arrogance and hostility to faith.")
}
headers={'User-Agent':'NamazZamani-Offlined-Surah-Builder/0.26'}
base='https://api.alquran.cloud/v1/quran/'
editions={}
for code in ('quran-uthmani','tr.transliteration'):
 req=urllib.request.Request(base+code,headers=headers)
 with urllib.request.urlopen(req,timeout=75) as response:result=json.load(response)
 assert result['code']==200 and len(result['data']['surahs'])==114
 editions[code]=result['data']['surahs']
 print('DOWNLOADED',code,'surahs',len(result['data']['surahs']),'edition',result['data'].get('edition',{}).get('name'),flush=True)
surahs=[]
for number,(tr,en,meaningTr,meaningEn) in sorted(summaries.items()):
 ar=editions['quran-uthmani'][number-1]
 translit=editions['tr.transliteration'][number-1]
 assert ar['number']==number and translit['number']==number
 assert len(ar['ayahs'])==len(translit['ayahs']) and len(ar['ayahs'])>0
 verses=[]
 for a,b in zip(ar['ayahs'],translit['ayahs']):
  assert a['numberInSurah']==b['numberInSurah']
  assert a['text'] and b['text'] and any('ARABIC' in unicodedata.name(c,'') for c in a['text'])
  verses.append([a['text'],b['text']])
 surahs.append({'id':'surah'+str(number),'number':number,'tr':tr,'en':en,'link':f'https://quran.com/{number}',
  'audio':None,'meaningTr':meaningTr,'meaningEn':meaningEn,'verses':verses})
assert len(surahs)==20
out.write_text('''/* Namaz Zamanı offline short-surah extensions, 92–111 (20 chapters).
 * Arabic quran-uthmani / phonetic tr.transliteration from AlQuran.cloud,
 * downloaded 2026-11-08; see https://alquran.cloud/terms-and-conditions
 * Attribution: Tanzil / Al Quran Cloud Arabic text, Turkish transliteration edition.
 * Meaning summaries are original editorial text, not verse-by-verse official translations.
 * Proofreading against an independently verified mushaf is necessary before publication.
 * Existing Fatiha/Ikhlas/Falaq/Nas and licensed recordings remain intact.
 */
(function(){"use strict";window.NamazSurahExtension=Object.freeze(
'''+json.dumps(surahs,ensure_ascii=False,separators=(',',':'))+'''
);})();
''',encoding='utf-8')
print('GENERATED',out.name,out.stat().st_size,'bytes',sum(len(s['verses']) for s in surahs),'verses, no runtime network requests',flush=True)
