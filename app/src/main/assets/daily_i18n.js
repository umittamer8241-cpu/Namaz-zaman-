/* Namaz Zamani — offline multilingual daily verse + related hadith.
 * Qur'an texts below are clearly labelled excerpts, other-language prose is a brief meaning summary,
 * not a purported official translation. Hadith sentences are thematic summaries, not verbatim quotations.
 * Source IDs verified against Quran.com and Sunnah.com 2026-11-07.
 */
(function(){
"use strict";
const LOCALES={
 tr:{name:"Türkçe",verse:"Günün Ayeti",hadith:"İlgili Hadis",summary:"Anlam özeti · kaynakları kontrol edebilirsiniz",language:"Dil",next:"Sıradaki namaz vakti",today:"Bugünün vakitleri",daily:"Her gün değişir",remain:"Kalan süre",qibla:"Kıble yönü",offline:"◉ Vakit hesabı çevrimdışı",method:"Hesaplama yöntemi",asr:"İkindi hesabı",gps:"Konumumu bul",refresh:"Yeniden konum bul",settings:"Konum ayarları",coords:"Konum · Google → GPS",manual:"GPS çalışmazsa koordinat gir",lat:"Enlem",lon:"Boylam",use:"Bu koordinatı kullan",tz:"Saat dilimi / Gemi saati",timezone:"Vakitleri hangi saatle gösterelim?",utc:"Gemi saati / UTC farkı",phone:"Telefonun saati",sea:"Boylama göre deniz saati",ship:"Gemi saatini elle seç (UTC)",prayers:["Sabah","Güneş","Öğle","İkindi","Akşam","Yatsı"],wait:"Konum bekleniyor",loading:"Konum aranıyor",no:"Konum bulunamadı"},
 en:{name:"English",verse:"Verse of the Day",hadith:"Related Hadith",summary:"Meaning summary · check the cited sources",language:"Language",next:"Next prayer",today:"Today's prayer times",daily:"Changes every day",remain:"Time remaining",qibla:"Qibla direction",offline:"◉ Offline prayer calculation",method:"Calculation method",asr:"Asr method",gps:"Find my location",refresh:"Refresh location",settings:"Location settings",coords:"Location · Google → GPS",manual:"Enter coordinates if GPS fails",lat:"Latitude",lon:"Longitude",use:"Use these coordinates",tz:"Time zone / ship time",timezone:"Display prayer times in",utc:"Ship time / UTC offset",phone:"Phone time",sea:"Approximate nautical time",ship:"Manually choose ship UTC time",prayers:["Fajr","Sunrise","Dhuhr","Asr","Maghrib","Isha"],wait:"Waiting for location",loading:"Finding location",no:"Location unavailable"},
 ms:{name:"Bahasa Melayu",verse:"Ayat Hari Ini",hadith:"Hadis Berkaitan",summary:"Ringkasan makna · semak sumber rujukan",language:"Bahasa",next:"Solat seterusnya",today:"Waktu solat hari ini",daily:"Berubah setiap hari",remain:"Masa berbaki",qibla:"Arah kiblat",offline:"◉ Kiraan waktu tanpa internet",method:"Kaedah pengiraan",asr:"Kaedah Asar",gps:"Cari lokasi saya",refresh:"Kemas kini lokasi",settings:"Tetapan lokasi",coords:"Lokasi · Google → GPS",manual:"Masukkan koordinat jika GPS gagal",lat:"Latitud",lon:"Longitud",use:"Gunakan koordinat",tz:"Zon waktu / waktu kapal",timezone:"Paparkan waktu solat mengikut",utc:"Waktu kapal / ofset UTC",phone:"Waktu telefon",sea:"Waktu nautika anggaran",ship:"Tetapkan UTC kapal sendiri",prayers:["Subuh","Syuruk","Zohor","Asar","Maghrib","Isyak"],wait:"Menunggu lokasi",loading:"Mencari lokasi",no:"Lokasi tidak ditemui"},
 id:{name:"Bahasa Indonesia",verse:"Ayat Hari Ini",hadith:"Hadis Terkait",summary:"Ringkasan makna · periksa sumber rujukan",language:"Bahasa",next:"Salat berikutnya",today:"Waktu salat hari ini",daily:"Berganti setiap hari",remain:"Waktu tersisa",qibla:"Arah kiblat",offline:"◉ Hitung waktu tanpa internet",method:"Metode perhitungan",asr:"Metode Asar",gps:"Cari lokasi saya",refresh:"Perbarui lokasi",settings:"Pengaturan lokasi",coords:"Lokasi · Google → GPS",manual:"Masukkan koordinat jika GPS gagal",lat:"Lintang",lon:"Bujur",use:"Gunakan koordinat",tz:"Zona waktu / waktu kapal",timezone:"Tampilkan waktu salat menurut",utc:"Waktu kapal / selisih UTC",phone:"Waktu ponsel",sea:"Perkiraan waktu laut",ship:"Pilih waktu UTC kapal",prayers:["Subuh","Terbit","Zuhur","Asar","Magrib","Isya"],wait:"Menunggu lokasi",loading:"Mencari lokasi",no:"Lokasi tidak ditemukan"},
 ar:{name:"العربية",verse:"آية اليوم",hadith:"حديث مرتبط",summary:"خلاصة المعنى · راجع المصادر",language:"اللغة",next:"الصلاة القادمة",today:"مواقيت الصلاة اليوم",daily:"يتغير كل يوم",remain:"الوقت المتبقي",qibla:"اتجاه القبلة",offline:"◉ حساب المواقيت دون اتصال",method:"طريقة الحساب",asr:"حساب العصر",gps:"تحديد موقعي",refresh:"تحديث الموقع",settings:"إعدادات الموقع",coords:"الموقع · جوجل ← GPS",manual:"إدخال الإحداثيات عند تعذر التحديد",lat:"خط العرض",lon:"خط الطول",use:"استخدام الإحداثيات",tz:"المنطقة الزمنية / وقت السفينة",timezone:"عرض المواقيت حسب",utc:"توقيت السفينة / فرق UTC",phone:"وقت الهاتف",sea:"التوقيت البحري التقريبي",ship:"اختيار توقيت السفينة يدويًا",prayers:["الفجر","الشروق","الظهر","العصر","المغرب","العشاء"],wait:"انتظار الموقع",loading:"جارٍ تحديد الموقع",no:"تعذر العثور على الموقع"},
 ru:{name:"Русский",verse:"Аят дня",hadith:"Связанный хадис",summary:"Краткий пересказ смысла · проверьте источники",language:"Язык",next:"Следующая молитва",today:"Время намаза сегодня",daily:"Меняется каждый день",remain:"Осталось",qibla:"Направление киблы",offline:"◉ Расчёт без интернета",method:"Метод расчёта",asr:"Метод асра",gps:"Определить местоположение",refresh:"Обновить координаты",settings:"Настройки геолокации",coords:"Местоположение · Google → GPS",manual:"Ввести координаты вручную",lat:"Широта",lon:"Долгота",use:"Использовать координаты",tz:"Часовой пояс / время судна",timezone:"Показывать время по",utc:"Время судна / смещение UTC",phone:"Время телефона",sea:"Примерное морское время",ship:"Задать UTC судна вручную",prayers:["Фаджр","Восход","Зухр","Аср","Магриб","Иша"],wait:"Ожидание координат",loading:"Поиск местоположения",no:"Координаты не найдены"},
 fr:{name:"Français",verse:"Verset du jour",hadith:"Hadith associé",summary:"Résumé du sens · vérifiez les sources",language:"Langue",next:"Prochaine prière",today:"Horaires de prière du jour",daily:"Change chaque jour",remain:"Temps restant",qibla:"Direction de la qibla",offline:"◉ Calcul hors ligne",method:"Méthode de calcul",asr:"Méthode Asr",gps:"Me localiser",refresh:"Actualiser la position",settings:"Paramètres de localisation",coords:"Position · Google → GPS",manual:"Saisir les coordonnées",lat:"Latitude",lon:"Longitude",use:"Utiliser ces coordonnées",tz:"Fuseau horaire / heure du navire",timezone:"Afficher les horaires selon",utc:"Heure du navire / décalage UTC",phone:"Heure du téléphone",sea:"Heure maritime approximative",ship:"Choisir l'UTC du navire",prayers:["Fajr","Lever du soleil","Dhuhr","Asr","Maghrib","Isha"],wait:"En attente de position",loading:"Recherche de position",no:"Position introuvable"},
 de:{name:"Deutsch",verse:"Vers des Tages",hadith:"Passender Hadith",summary:"Sinngemäße Zusammenfassung · Quellen prüfen",language:"Sprache",next:"Nächstes Gebet",today:"Heutige Gebetszeiten",daily:"Wechselt täglich",remain:"Verbleibende Zeit",qibla:"Qibla-Richtung",offline:"◉ Offline-Berechnung",method:"Berechnungsmethode",asr:"Asr-Methode",gps:"Standort ermitteln",refresh:"Standort aktualisieren",settings:"Standorteinstellungen",coords:"Standort · Google → GPS",manual:"Koordinaten eingeben",lat:"Breitengrad",lon:"Längengrad",use:"Koordinaten übernehmen",tz:"Zeitzone / Schiffszeit",timezone:"Gebetszeiten anzeigen in",utc:"Schiffszeit / UTC-Abstand",phone:"Telefonzeit",sea:"Ungefähre Seezeit",ship:"Schiffs-UTC manuell wählen",prayers:["Fadschr","Sonnenaufgang","Dhuhr","Asr","Maghrib","Ischa"],wait:"Warte auf Standort",loading:"Standort wird gesucht",no:"Standort nicht gefunden"},
 es:{name:"Español",verse:"Versículo del día",hadith:"Hadiz relacionado",summary:"Resumen del significado · consulta las fuentes",language:"Idioma",next:"Próxima oración",today:"Horarios de oración de hoy",daily:"Cambia cada día",remain:"Tiempo restante",qibla:"Dirección de la alquibla",offline:"◉ Cálculo sin conexión",method:"Método de cálculo",asr:"Método de Asr",gps:"Buscar mi ubicación",refresh:"Actualizar ubicación",settings:"Ajustes de ubicación",coords:"Ubicación · Google → GPS",manual:"Introducir coordenadas",lat:"Latitud",lon:"Longitud",use:"Usar coordenadas",tz:"Zona horaria / hora del barco",timezone:"Mostrar horarios según",utc:"Hora del barco / diferencia UTC",phone:"Hora del teléfono",sea:"Hora náutica aproximada",ship:"Elegir UTC del barco",prayers:["Fajr","Amanecer","Dhuhr","Asr","Magreb","Isha"],wait:"Esperando ubicación",loading:"Buscando ubicación",no:"No se encontró ubicación"},
 pt:{name:"Português",verse:"Versículo do dia",hadith:"Hadith relacionado",summary:"Resumo do sentido · confira as fontes",language:"Idioma",next:"Próxima oração",today:"Horários de oração de hoje",daily:"Muda diariamente",remain:"Tempo restante",qibla:"Direção da qibla",offline:"◉ Cálculo offline",method:"Método de cálculo",asr:"Método Asr",gps:"Encontrar localização",refresh:"Atualizar localização",settings:"Configurações de localização",coords:"Localização · Google → GPS",manual:"Inserir coordenadas",lat:"Latitude",lon:"Longitude",use:"Usar coordenadas",tz:"Fuso horário / hora do navio",timezone:"Mostrar horários de acordo com",utc:"Hora do navio / deslocamento UTC",phone:"Hora do telefone",sea:"Hora náutica aproximada",ship:"Escolher UTC do navio",prayers:["Fajr","Nascer do sol","Dhuhr","Asr","Maghrib","Isha"],wait:"Aguardando localização",loading:"Buscando localização",no:"Localização indisponível"},
 az:{name:"Azərbaycanca",verse:"Günün ayəsi",hadith:"Əlaqəli hədis",summary:"Məna xülasəsi · mənbələri yoxlayın",language:"Dil",next:"Növbəti namaz",today:"Bugünkü namaz vaxtları",daily:"Hər gün dəyişir",remain:"Qalan vaxt",qibla:"Qiblə istiqaməti",offline:"◉ İnternetsiz hesablama",method:"Hesablama üsulu",asr:"Əsr üsulu",gps:"Yerimi tap",refresh:"Məkanı yenilə",settings:"Məkan ayarları",coords:"Məkan · Google → GPS",manual:"Koordinatları daxil et",lat:"Enlik",lon:"Uzunluq",use:"Bu koordinatları istifadə et",tz:"Saat qurşağı / gəmi vaxtı",timezone:"Vaxtları bu saatla göstər",utc:"Gəmi vaxtı / UTC fərqi",phone:"Telefon vaxtı",sea:"Təxmini dəniz vaxtı",ship:"Gəminin UTC vaxtını seç",prayers:["Sübh","Günəş","Zöhr","Əsr","Məğrib","İşa"],wait:"Məkan gözlənilir",loading:"Məkan axtarılır",no:"Məkan tapılmadı"},
 ur:{name:"اردو",verse:"آج کی آیت",hadith:"متعلقہ حدیث",summary:"مفہوم کا خلاصہ · مآخذ چیک کریں",language:"زبان",next:"اگلی نماز",today:"آج کی نماز کے اوقات",daily:"ہر روز تبدیل ہوتا ہے",remain:"باقی وقت",qibla:"قبلہ کی سمت",offline:"◉ بغیر انٹرنیٹ حساب",method:"حساب کا طریقہ",asr:"عصر کا طریقہ",gps:"میرا مقام تلاش کریں",refresh:"مقام تازہ کریں",settings:"مقام کی ترتیبات",coords:"مقام · گوگل → GPS",manual:"مختصات درج کریں",lat:"عرض بلد",lon:"طول بلد",use:"مختصات استعمال کریں",tz:"ٹائم زون / جہاز کا وقت",timezone:"اوقات اس کے مطابق دکھائیں",utc:"جہاز کا وقت / UTC فرق",phone:"فون کا وقت",sea:"اندازاً سمندری وقت",ship:"جہاز کا UTC دستی طور پر چنیں",prayers:["فجر","طلوع آفتاب","ظہر","عصر","مغرب","عشاء"],wait:"مقام کا انتظار",loading:"مقام تلاش کیا جا رہا ہے",no:"مقام نہیں ملا"}
};
window.NamazLocales=LOCALES;
const WISDOM=[
{q:"2:153",qArabic:"إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",h:"Sahih al-Bukhari 1469",v:{
tr:"Sabır ve namazla Allah'tan yardım isteyin; Allah sabredenlerle beraberdir.",en:"Seek help through patience and prayer; Allah is with those who persevere.",ms:"Mohon pertolongan dengan sabar dan solat; Allah bersama orang yang sabar.",id:"Mohon pertolongan lewat kesabaran dan salat; Allah bersama orang yang sabar.",ar:"استعينوا بالصبر والصلاة؛ إن الله مع الصابرين.",ru:"Ищите помощи в терпении и молитве; Аллах с терпеливыми.",fr:"Cherchez de l'aide dans la patience et la prière; Allah est avec les patients.",de:"Sucht Hilfe durch Geduld und Gebet; Allah ist mit den Geduldigen.",es:"Busquen ayuda con paciencia y oración; Alá está con los pacientes.",pt:"Busquem ajuda na paciência e na oração; Allah está com os perseverantes.",az:"Səbir və namazla kömək diləyin; Allah səbir edənlərlədir.",ur:"صبر اور نماز کے ذریعے مدد چاہو؛ اللہ صبر کرنے والوں کے ساتھ ہے۔"},t:{
tr:"Sabretmeye çalışan kişiye Allah sabır verir; sabır en büyük nimetlerdendir.",en:"Allah helps those who strive for patience; patience is a great gift.",ms:"Allah membantu orang yang berusaha bersabar; sabar ialah kurniaan besar.",id:"Allah menolong orang yang berusaha sabar; kesabaran adalah karunia besar.",ar:"من يتحرَّ الصبر يعنه الله عليه؛ والصبر من أعظم العطايا.",ru:"Аллах помогает стремящимся к терпению; терпение — великий дар.",fr:"Allah aide ceux qui s'efforcent de patienter; la patience est un grand don.",de:"Allah unterstützt Menschen, die Geduld üben; Geduld ist eine große Gabe.",es:"Alá ayuda a quien procura ser paciente; la paciencia es un gran don.",pt:"Allah ajuda quem busca paciência; a paciência é uma grande dádiva.",az:"Səbrə çalışan kəsə Allah səbir verir; səbir böyük nemətdir.",ur:"جو صبر کی کوشش کرے اللہ اسے صبر عطا کرتا ہے؛ صبر بڑی نعمت ہے۔"}},
{q:"13:28",qArabic:"أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",h:"Sahih Muslim 2675a",v:{
tr:"Kalpler Allah'ı anmakla huzur bulur.",en:"Hearts find tranquility in remembering Allah.",ms:"Hati memperoleh ketenangan dengan mengingati Allah.",id:"Hati menjadi tenteram dengan mengingat Allah.",ar:"بذكر الله تطمئن القلوب.",ru:"Сердца обретают покой при поминании Аллаха.",fr:"Les cœurs trouvent la paix dans le rappel d'Allah.",de:"Im Gedenken an Allah finden Herzen Ruhe.",es:"Los corazones hallan paz al recordar a Alá.",pt:"Os corações encontram paz ao recordar Allah.",az:"Qəlblər Allahı zikr etməklə rahatlıq tapır.",ur:"اللہ کے ذکر سے دلوں کو اطمینان ملتا ہے۔"},t:{
tr:"Kul Allah'ı andığında Allah onu hatırlar; zikir yakınlık vesilesidir.",en:"When a servant remembers Allah, Allah remembers that servant.",ms:"Apabila hamba mengingati Allah, Allah turut mengingatinya.",id:"Ketika seorang hamba mengingat Allah, Allah pun mengingatnya.",ar:"إذا ذكر العبد ربَّه ذكره الله؛ وفي الذكر قرب من الله.",ru:"Когда раб поминает Аллаха, Аллах поминает его.",fr:"Quand un serviteur évoque Allah, Allah Se souvient de lui.",de:"Wenn ein Diener Allah gedenkt, gedenkt Allah seiner.",es:"Cuando un siervo recuerda a Alá, Alá lo recuerda.",pt:"Quando um servo se lembra de Allah, Allah se lembra dele.",az:"Bəndə Allahı zikr etdikdə Allah da onu yad edir.",ur:"جب بندہ اللہ کو یاد کرتا ہے تو اللہ بھی اسے یاد فرماتا ہے۔"}},
{q:"14:7",qArabic:"لَئِنْ شَكَرْتُمْ لَأَزِيدَنَّكُمْ",h:"Sahih Muslim 2999",v:{
tr:"Şükrederseniz Allah nimetlerini artıracağını bildirir.",en:"Allah promises an increase in blessings to the grateful.",ms:"Allah menjanjikan pertambahan nikmat kepada yang bersyukur.",id:"Allah menjanjikan tambahan nikmat bagi orang yang bersyukur.",ar:"وعد الله الشاكرين بزيادة النعم.",ru:"Аллах обещает умножить блага благодарным.",fr:"Allah promet davantage de bienfaits à ceux qui remercient.",de:"Allah verheißt Dankbaren mehr Segen.",es:"Alá promete aumentar Sus favores a los agradecidos.",pt:"Allah promete mais bênçãos a quem agradece.",az:"Allah şükür edənlərə nemətlərini artıracağını bildirir.",ur:"اللہ شکر گزاروں کے لیے نعمتوں میں اضافے کا وعدہ کرتا ہے۔"},t:{
tr:"Mümin sevinçte şükreder, sıkıntıda sabreder; her iki halde de hayır bulur.",en:"A believer gives thanks in ease and remains patient in hardship.",ms:"Mukmin bersyukur ketika senang dan bersabar ketika susah.",id:"Mukmin bersyukur saat lapang dan bersabar saat sulit.",ar:"المؤمن يشكر في السراء ويصبر في الضراء، وفي كليهما خير.",ru:"Верующий благодарит в радости и терпит в трудностях.",fr:"Le croyant remercie dans la joie et patiente dans l'épreuve.",de:"Der Gläubige dankt im Glück und bleibt geduldig in Not.",es:"El creyente agradece en la alegría y persevera en la dificultad.",pt:"O crente agradece na alegria e persevera nas dificuldades.",az:"Mömin rahatlıqda şükür, çətinlikdə səbir edər.",ur:"مومن خوشی میں شکر اور مشکل میں صبر کرتا ہے۔"}},
{q:"3:134",qArabic:"وَالْكَاظِمِينَ الْغَيْظَ وَالْعَافِينَ عَنِ النَّاسِ",h:"Sahih al-Bukhari 6114",v:{
tr:"Takva sahipleri öfkelerini yener ve insanları affeder.",en:"The righteous restrain anger and forgive people.",ms:"Orang bertakwa menahan marah dan memaafkan orang lain.",id:"Orang bertakwa menahan amarah dan memaafkan sesama.",ar:"المتقون يكظمون الغيظ ويعفون عن الناس.",ru:"Богобоязненные сдерживают гнев и прощают людей.",fr:"Les pieux maîtrisent leur colère et pardonnent aux autres.",de:"Gottesfürchtige zügeln den Zorn und vergeben anderen.",es:"Los piadosos dominan su ira y perdonan a los demás.",pt:"Os piedosos controlam a ira e perdoam os outros.",az:"Təqvalılar qəzəbini boğar və insanları bağışlayar.",ur:"پرہیزگار غصہ روکتے اور لوگوں کو معاف کرتے ہیں۔"},t:{
tr:"Gerçek güçlü kişi öfkelendiğinde kendisini kontrol edebilendir.",en:"True strength is controlling yourself when angry.",ms:"Kekuatan sebenar ialah mengawal diri ketika marah.",id:"Kekuatan sejati adalah mengendalikan diri saat marah.",ar:"القوي حقًا من يملك نفسه عند الغضب.",ru:"По-настоящему силён тот, кто владеет собой в гневе.",fr:"La vraie force, c'est se maîtriser dans la colère.",de:"Wirkliche Stärke zeigt sich in Selbstbeherrschung bei Zorn.",es:"La verdadera fuerza consiste en dominarse durante la ira.",pt:"A verdadeira força é controlar-se na ira.",az:"Əsl güc qəzəb zamanı özünü idarə etməkdir.",ur:"اصل طاقت غصے کے وقت خود پر قابو رکھنا ہے۔"}},
{q:"17:23",qArabic:"وَبِالْوَالِدَيْنِ إِحْسَانًا",h:"Sahih al-Bukhari 5971",v:{
tr:"Anne babaya iyilik edin; onlarla saygılı ve güzel konuşun.",en:"Treat parents with kindness and address them respectfully.",ms:"Berbuat baik kepada ibu bapa dan berbicara dengan hormat.",id:"Berbuat baiklah kepada orang tua dan berbicaralah dengan hormat.",ar:"أحسنوا إلى الوالدين وخاطبوهما بالكلام الكريم.",ru:"Относитесь к родителям с добротой и уважением.",fr:"Traitez vos parents avec bonté et respect.",de:"Behandelt eure Eltern gütig und sprecht respektvoll.",es:"Traten a sus padres con bondad y respeto.",pt:"Tratem os pais com bondade e respeito.",az:"Valideynlərə yaxşılıq edin, onlarla hörmətlə danışın.",ur:"والدین کے ساتھ بھلائی کرو اور احترام سے بات کرو۔"},t:{
tr:"Güzel davranışta anneye öncelik verilir; ardından babanın hakkı gözetilir.",en:"A mother deserves special priority in kind companionship, then the father.",ms:"Ibu paling berhak mendapat layanan baik, kemudian bapa.",id:"Ibu paling berhak mendapat perlakuan baik, lalu ayah.",ar:"الأم أحق بحسن الصحبة مرارًا، ثم الأب.",ru:"Матери следует уделять особое доброе внимание, затем отцу.",fr:"La mère mérite une attention particulière, puis le père.",de:"Der Mutter gebührt besondere Fürsorge, danach dem Vater.",es:"La madre merece especial buen trato, y después el padre.",pt:"A mãe merece cuidado especial, e depois o pai.",az:"Yaxşı rəftarda anaya xüsusi önəm verilir, sonra ataya.",ur:"حسن سلوک میں ماں کو خصوصی حق ہے، پھر باپ کو۔"}},
{q:"29:45",qArabic:"إِنَّ الصَّلَاةَ تَنْهَىٰ عَنِ الْفَحْشَاءِ وَالْمُنْكَرِ",h:"Sahih al-Bukhari 528",v:{
tr:"Namazı dosdoğru kılmak kötülüklerden uzaklaşmaya yardım eder.",en:"Establishing prayer helps turn away from wrongdoing.",ms:"Mendirikan solat membantu menjauhi perbuatan keji dan mungkar.",id:"Menegakkan salat membantu menjauhkan diri dari kemungkaran.",ar:"إقامة الصلاة تنهى عن الفحشاء والمنكر.",ru:"Молитва помогает удерживаться от дурных поступков.",fr:"La prière aide à se détourner des mauvaises actions.",de:"Das Gebet hilft, sich von schlechten Taten fernzuhalten.",es:"La oración ayuda a apartarse de las malas acciones.",pt:"A oração ajuda a afastar-se das más ações.",az:"Namaz pis əməllərdən uzaq durmağa kömək edir.",ur:"نماز بے حیائی اور برائی سے بچنے میں مدد دیتی ہے۔"},t:{
tr:"Beş vakit namaz, günde beş kez yıkanmanın kiri temizlemesi gibi hataları silmeye vesiledir.",en:"The five prayers are likened to washing five times a day, cleansing sins.",ms:"Lima solat diumpamakan seperti mandi lima kali sehari yang membersihkan dosa.",id:"Lima salat diibaratkan mandi lima kali sehari yang membersihkan dosa.",ar:"شبّه النبي الصلوات الخمس بالغسل خمس مرات في اليوم لمحو الخطايا.",ru:"Пять молитв уподоблены пятикратному омовению, очищающему грехи.",fr:"Les cinq prières sont comparées à cinq lavages quotidiens qui effacent les fautes.",de:"Die fünf Gebete gleichen fünf täglichen Waschungen, die Sünden tilgen.",es:"Las cinco oraciones se comparan con cinco lavados diarios que borran faltas.",pt:"As cinco orações são como cinco lavagens diárias que apagam faltas.",az:"Beş vaxt namaz gündə beş dəfə yuyunmağa bənzədilir və xətalara kəffarədir.",ur:"پانچ نمازیں دن میں پانچ بار غسل کی مانند گناہوں کو مٹانے کا ذریعہ ہیں۔"}},
{q:"49:13",qArabic:"وَجَعَلْنَاكُمْ شُعُوبًا وَقَبَائِلَ لِتَعَارَفُوا",h:"Sahih al-Bukhari 13",v:{
tr:"Allah insanları birbirlerini tanısınlar diye farklı topluluklar kıldı.",en:"People were made into diverse peoples and tribes to know one another.",ms:"Manusia dijadikan pelbagai bangsa dan suku supaya saling mengenali.",id:"Manusia dijadikan berbangsa-bangsa dan bersuku agar saling mengenal.",ar:"جعل الله الناس شعوبًا وقبائل ليتعارفوا.",ru:"Люди созданы разными народами и племенами, чтобы узнавать друг друга.",fr:"Les peuples et tribus ont été créés divers pour se connaître.",de:"Menschen wurden zu Völkern und Stämmen gemacht, damit sie einander kennenlernen.",es:"Los pueblos y tribus son diversos para que se conozcan.",pt:"Povos e tribos são diversos para que se conheçam.",az:"İnsanlar bir-birini tanısın deyə xalqlara və tayfalara ayrılıb.",ur:"انسانوں کو قوموں اور قبیلوں میں بانٹا گیا تاکہ ایک دوسرے کو پہچانیں۔"},t:{
tr:"İnsan kendisi için sevdiği iyiliği kardeşi için de istemelidir.",en:"Faith includes wishing for your brother the good you wish for yourself.",ms:"Iman termasuk menginginkan kebaikan bagi saudara seperti untuk diri sendiri.",id:"Iman mencakup menginginkan kebaikan bagi saudara seperti bagi diri sendiri.",ar:"من الإيمان أن تحب لأخيك ما تحب لنفسك.",ru:"Вера включает желание брату того добра, которое желаешь себе.",fr:"La foi comprend le souhait pour son frère du bien que l'on veut pour soi.",de:"Zum Glauben gehört, dem Bruder Gutes zu wünschen wie sich selbst.",es:"La fe incluye desear para el hermano el bien que deseas para ti.",pt:"A fé inclui desejar ao irmão o bem que desejas a ti mesmo.",az:"İmanın bir hissəsi özünə istədiyin yaxşılığı qardaşına da istəməkdir.",ur:"ایمان کا تقاضا ہے کہ اپنے بھائی کے لیے بھی وہ بھلائی چاہو جو اپنے لیے چاہتے ہو۔"}}
];
const prayerIds=["fajr","sunrise","dhuhr","asr","maghrib","isha"];
let active="tr",lastDay="";
function lang(){return active;}
function choose(code){if(!code)return"en";const a=code.toLowerCase().split("-")[0];return LOCALES[a]?a:"en";}
function text(key){return (LOCALES[active]||LOCALES.en)[key]||LOCALES.en[key]||key;}
function prayer(id){const i=prayerIds.indexOf(id);return i<0?id:LOCALES[active].prayers[i];}
function el(id){return document.getElementById(id);}
function setText(selector,value){
 const x=document.querySelector(selector);
 if(x && value!==undefined)x.textContent=value;
}
function firstText(selector,value){
 const x=document.querySelector(selector);
 if(x&&x.firstChild&&x.firstChild.nodeType===3)x.firstChild.textContent=value;
}
function localeUpdate(){
 document.documentElement.lang=active;
 // Keep the clock layout LTR; only text passages use RTL, so compass axes remain correctly placed.
 setText(".brand",active==="tr"?"Açık deniz • Seyir yardımcısı":"Namaz Zamanı • Maritime prayer times");
 setText(".offline",text("offline"));
 setText(".hero .small-label",text("next"));
 firstText(".hero .subtext",text("remain")+": ");
 firstText(".sectionhead",text("today")+" ");
 setText(".sectionhead span",text("daily"));
 setText(".compass-card .small-label",text("qibla"));
 setText(".location .small-label",text("coords"));
 setText("#gps-button",text("gps"));
 setText("#reset-button",text("refresh"));
 setText("#location-settings-button",text("settings"));
 setText(".location details:first-of-type summary",text("manual"));
 // Preserve coordinate input nodes while localizing their visible labels.
 const labels=document.querySelectorAll(".manual label");
 if(labels.length>1){firstLabel(labels[0],text("lat"));firstLabel(labels[1],text("lon"));}
 setText("#manual-button",text("use"));
 firstLabel(document.querySelector(".location > .settings label:first-child"),text("method"));
 firstLabel(document.querySelector(".location > .settings label:nth-child(2)"),text("asr"));
 setText(".location details:last-of-type summary",text("tz"));
 firstLabel(document.querySelector(".location details:last-of-type .settings label:first-child"),text("timezone"));
 firstLabel(document.querySelector(".location details:last-of-type .settings label:nth-child(2)"),text("utc"));
 const options={phone:text("phone"),sea:text("sea"),manual:text("ship")};
 for(const [id,value] of Object.entries(options)){const item=document.querySelector('#timezone-mode option[value="'+id+'"]');if(item)item.textContent=value;}
 const langSelect=el("app-language");
 if(langSelect)langSelect.value=active;
 setText("#language-label",text("language"));
 setText("#wisdom-explain",text("summary"));
 setText("#verse-heading",text("verse"));
 setText("#hadith-heading",text("hadith"));
 document.querySelectorAll(".time-tile").forEach((tile,index)=>{
    const key=tile.getAttribute("data-prayer");
    const label=tile.querySelector(".time-label");
    if(label)label.textContent=prayer(key||prayerIds[index]);
 });
 const nextName=el("next-name");
 if(nextName){const index=prayerIds.indexOf(nextName.dataset.prayer||"");if(index>=0)nextName.textContent=LOCALES[active].prayers[index];}
 lastDay="";renderWisdom(true);
 if(window.NamazUI)window.NamazUI.apply();
}
function firstLabel(n,value){if(n && n.firstChild&&n.firstChild.nodeType===3)n.firstChild.textContent=value;}
function setLocale(code,save=true){
 active=choose(code);
 if(save)try{localStorage.setItem("gn_ui_locale",active);}catch(e){}
 localeUpdate();
}
function init(){
 const sel=el("app-language");
 if(!sel)return;
 for(const [code,entry] of Object.entries(LOCALES)){
   const o=document.createElement("option");o.value=code;o.textContent=entry.name;sel.appendChild(o);
 }
 let saved=null;try{saved=localStorage.getItem("gn_ui_locale");}catch(e){}
 active=choose(saved||navigator.language||"tr");
 sel.value=active;
 sel.addEventListener("change",ev=>{
   setLocale(ev.target.value);
   if(typeof renderAll==="function")renderAll();
 });
 localeUpdate();
}
function dateIndex(){
 const dt=new Date();
 // Use the same display date as the prayer schedule, including manual ship UTC selection.
 const p=typeof displayDateParts==="function" ? displayDateParts(dt) :
    {y:dt.getFullYear(),m:dt.getMonth(),day:dt.getDate()};
 return Math.floor(Date.UTC(p.y,p.m,p.day)/86400000);
}
function renderWisdom(force=false){
 if(!el("verse-body"))return;
 const day=dateIndex();
 const key=day+"|"+active;
 if(!force&&key===lastDay)return;
 lastDay=key;
 const entry=WISDOM[((day%WISDOM.length)+WISDOM.length)%WISDOM.length];
 const v=entry.v[active]||entry.v.en, h=entry.t[active]||entry.t.en;
 el("verse-arabic").textContent=entry.qArabic;
 el("verse-body").textContent=v;
 el("hadith-body").textContent=h;
 el("verse-ref").textContent=(window.NamazUI?window.NamazUI.t("quran"):"Kur'an")+" "+entry.q;
 el("hadith-ref").textContent=entry.h;
 el("verse-body").dir=["ar","ur"].includes(active)?"rtl":"auto";
 el("hadith-body").dir=["ar","ur"].includes(active)?"rtl":"auto";
}
window.NamazI18n={init,setLocale,prayer,text,renderWisdom,getLanguage:lang,LOCALES,PAIRS:WISDOM};
})();
