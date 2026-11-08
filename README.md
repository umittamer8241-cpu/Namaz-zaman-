# Namaz Zamanı v0.15 — Kalibrasyon Kontrollü Kıble Pusulası

## İçerik
- 12 dil: Türkçe, İngilizce, Malayca, Endonezce, Arapça, Rusça, Fransızca, Almanca, İspanyolca, Portekizce, Azerbaycanca, Urduca.
- Kullanıcının telefon dilini algılar, uygulama içinden değiştirmeye izin verir ve seçimi cihazda saklar.
- Günlük namaz vakitleri, geri sayım, Google konum servisi, GPS yedeği, kıble pusulası ve saat dilimi seçenekleri v0.6'dan korunur.
- **Günün Ayeti** ve hemen altında konuyla ilgili **İlgili Hadis** kutusu.
- Doğrulanmış 7 ayet ve hadis çifti, seçili gemi/telefon saatine göre **her yerel gün değişiminde** otomatik dönüşür. 7 çift tamamlandığında döngü yeniden başlar. Günlük değişim internet istemez.
- Her günün ayetinin Arapça özgün ayetinden **bir kesit**, 12 dilde kısa **anlam özeti** ve **Kur'an sure:ayet** kaynağı.
- Eşleşen hadis için 12 dilde kısa **anlam özeti**, Sahih el-Buhârî veya Sahih Müslim referansı.
- Metinler resmî birebir tercüme veya hadislerin tam lafzı değildir. Araştırma/doğrulama için kaynak numaraları ekrandadır.
- Ekranların ana başlıkları, namaz adları ve temel kontroller çok dilli olarak düzenlendi.

## Doğrulanmış kaynak havuzu
1. Kur'an 2:153 — Sahih al-Bukhari 1469 (sabır)
2. Kur'an 13:28 — Sahih Muslim 2675a (zikir)
3. Kur'an 14:7 — Sahih Muslim 2999 (şükür)
4. Kur'an 3:134 — Sahih al-Bukhari 6114 (öfke)
5. Kur'an 17:23 — Sahih al-Bukhari 5971 (anne-baba)
6. Kur'an 29:45 — Sahih al-Bukhari 528 (namaz)
7. Kur'an 49:13 — Sahih al-Bukhari 13 (insanlık ve kardeşlik)

Kur'an kaynakları: https://quran.com/
Hadis kaynakları: https://sunnah.com/

## Google Play
Bu kodu çalıştırmak için APK test derlemesi yeterli; **Google Play yayın paketi ayrıca AAB biçiminde, kalıcı yükleme anahtarıyla imzalanmalı ve güncel API gereksinimlerine uymalıdır**. Test APK Google Play'e doğrudan yayınlanacak paket değildir.

## Gizlilik ve notlar
Uygulama açık olduğu sürece telefonun konum servisini (Google Play Hizmetleri / GPS) çağırır. Kullanıcının konumunu kendi sunucumuza aktaran bir sistem bulunmaz; ancak Google Play Hizmetleri kendi konum işlemleri için ağ kullanabilir. Geçerli konum yerel cihazda saklanır. İnternet/gemi Wi-Fi tek başına gemi koordinatını garanti etmez.

İbadet vakitleri resmî bölgesel takvim yerine geçmeyen astronomik yaklaşık hesaptır; cihazın/geminin zaman dilimi doğru seçilmelidir.


## Güncel test sürümü v0.13

- Aylık takip takvimi: beş vakit/gün ilerleme, geçmiş gün ayrıntısı ve geleceğe kayıt kilidi.
- Bugünkü namaz işaretleri için konumu doğrulanmış, hesaplanmış vakit şartı.
- Pro Plus kıble pusulası; sensör varsa canlı yön ve Kâbe farkı.
- Ezan sesleri, dinleme sekmeleri, arka plan alarmı ve ses servisleri projeden çıkarıldı.
- 12 dilde günlük tek Esmaül Hüsna; 702 dua ve dört kısa sure ses kaydı korunur.
- Bu APK Android test önizlemesidir. Gerçek cihaz/sensör ve dinî içerik QA tamamlanmadan Play Store yayını yapılmaz.


## v0.14 — Kabartmalı altın Royal Qibla pusulası

- Önceki iki uçlu mavi/altın iğne yerine yalnızca bir altın yön oku kullanılır.
- Çevrede yüksek çözünürlüklü düzenlenebilir SVG dosyasında 24 tekrar özgün kabartma çiçek/kıvrım süslemesi, altın döküm halka ve 120 derece çizgisi vardır: `app/src/main/assets/compass_ornate_frame.svg`.
- Dekoratif çerçeve sabittir; `id="needle"` ile tek altın ok önceki matematik/sensör değerlerine göre hareket etmeyi sürdürür. Kuzey referansı ve kıble açısı korunmuştur.
- Mobil yerleşimde gösterişli büyük kadran ile bilgi kartı alt alta gösterilir. Görsel tamamen paket içidir, internet indirmez.
- Gerçek telefon sensörü ve konum kalibrasyonu üzerinde son kullanıcı cihazında fiziksel test ayrıca yapılmalıdır.


## v0.15 — İki cihazda farklı pusula yönü düzeltmesi

- Sabit Kâbe açısı (kuzeye göre ör. 272,2°) ile telefonun kendi gerçek kuzey yönü ayrı verilerdir. İki telefon aynı koordinattaysa sabit açı aynı olur, ancak sensör başlığı farklıysa ekrandaki göreli ok farklı durur.
- Android sensör başlığı için öncelik Google Play Hizmetleri Fused Orientation Provider'dır. Bu servis cihazlar arasında ortak algoritma uygular, mümkün olduğunda yerel manyetik sapma düzeltmesini ve yönün tahmini hata açısını verir.
- Tutarlı bir yön verisi olmadan altın kıble oku **gizlenir**; kaynağın Google/Android olduğu, yaklaşık doğruluğun durumu ve kalibrasyon önerisi ekranda gösterilir. Eşik: FOP'un verdiği heading hata yarıçapı en fazla 25°. Conservative heading error varsa öncelikle o dikkate alınır.
- FOP kullanılamazsa Android rotation-vector sensörüne düşülür; yalnızca yüksek doğruluk bildirilen okumada ok görünür, sensörün tahmini olduğu açıkça bildirilir. Manuel/GPS konumu alınmışsa yalnız fallback sensöre manyetik sapma eklenir; Google FOP düzeltmesi iki kez yapılmaz.
- Tarayıcı deviceorientation geri dönüşü yerel Android güven kalite kapısından bağımsız tutulur. Manyetik kılıf, büyük metal yapılar (özellikle gemi güvertesi), hoparlör ve kablolar sensör okumasını bozabilir. Kullanıcıya cihazı yatay tutma ve havada sekiz çizerek yeniden kalibre etme rehberi sağlanır.
- İki telefonun doğru kalibre edilmiş aynı doğrultuda fiziksel doğrulaması henüz yapılmadı. Uygulama telefonu yanlış yönlendiriyorsa önce farklı bir güvenilir kıble yöntemiyle doğrulayın.


### Pusula çift-telefon tanı sürümü (Debug)
- Debug APK paket adı `com.geminamaz.app.pusulatest` olarak ayrı kurulabilir. Mevcut `com.geminamaz.app` uygulamasını silmez; takip kayıtlarını ayrı tutar.
- Ekranda uygulama adı “Namaz Zamanı Pusula Test” olarak görünür.
- Release AAB paket adı değiştirilmedi: `com.geminamaz.app`.
- Test: İki telefonu yan yana düz ve aynı doğrultuda tut. Uygulamadan “Telefon yönü”, “Kâbe farkı”, sensör kaynağı/doğruluk bilgisinin ekran görüntülerini karşılaştır. Yalnızca Kâbe açısı eşitliği sensör uyuşmasını garanti etmez.


### v0.16 — İki cihazın pusula farklılığı için tanı
- Android yedek rotation-vector sensör matrisi, doğal ekran rotasyonu 0/90/180/270 derecelerine göre uygun koordinatlarla yeniden eşlenir. Google FOP ekran yönünü zaten hesaba kattığından ikinci düzeltme uygulanmaz.
- Aynı cihazda Google FOP ile Android rotation-vector başlıkları bağımsız debug satırlarında yer alır. Her ikisi de yüksek doğruluk bildirirken 30° üstü uyuşmazlık varsa kıble oku geçici olarak gizlenir, kalibrasyon uyarısı verilir.
- Tanı paneli: Kâbe sabit yönü, Google açı, Android açı, fark, tahmini hata, ekran dönüşü, eğim, yana yatma ve manyetik sapma. Yalnızca kullanıcı düğmeye basarsa kopyalanır; tam enlem-boylam rapora yazılmaz.
- Bu, **gerçek cihaz doğruluk testi yerine geçmez**. Aynı yönde tutulan iki cihazın sonuçlarını karşılaştırmak ve metal parazit sorunu araştırmak içindir.
- Yan yana kurulan Debug uygulamanın adı “Namaz Zamanı Pusula Test”; asıl Namaz Zamanı veya onun kayıtları kaldırılmaz.


## v0.17 Tam APK (mevcut sürümü kaldıran kullanıcı için)
- Normal uygulama kimliği: `com.geminamaz.app`, uygulama adı: **Namaz Zamanı**.
- `fullPreview` APK, mevcut dualar, 99 Esma (12 dil), 702 günlük dua, namaz takvimi, sesli sureler ve kalibrasyon kontrollü Royal Qibla pusulasını birlikte içerir.
- `debug` tanı sürümü ayrı kalır: `com.geminamaz.app.pusulatest`.
- Tam APK, **debug anahtarıyla imzalanmış dahili test paketidir**. Google Play üretim imzası değildir; ileride Play Store sürümüne geçerken kullanıcı verilerini taşımak gerekebilir.
- Kaldırılmış uygulamanın özel verileri ve işaretlenmiş namaz kayıtları otomatik geri gelmez; ancak bir yedekten geri yüklenebilir.


### v0.17 — Takvim gününe dokunarak düzenleme
- Aylık takvimde tarihi seçince açılır düzenleme kartı görünür; geçmiş günlerin beş namazı işaretlenebilir ve geri kaldırılabilir.
- Bugünün namazlarında yalnızca o namazın vakti girdikten sonra işaret değiştirilebilir. Yarın ve gelecek günler seçilemez.
- Kartta tarih, işaretlenmiş namaz sayısı, otomatik kayıt açıklaması ve kapatma denetimi vardır. Kaydet düğmesine basmak gerekmez; kayıtlar `nz_prayer_check_v09` anahtarında tutulur.
- 12 dil için düzenleme yönergeleri vardır. Takvime basma, kayıt, kapatma ve kilit davranışları Edge ortamında test edildi.

## v0.18 — Konum izni, GPS ve kapalı deniz ortamı için kurtarma
- Kullanıcının izin verdiği hâllerde Google konumu, ağ ve **doğrudan GPS eşzamanlı** aranır. 28 saniyelik GPS başlangıç gecikmesi kaldırıldı; açık güvertede GNSS fix daha erken mümkün olabilir.
- Android'de yaklaşık konum izni de desteklenir: 20 km'ye kadar kaba çözünürlükte sonuçlar güçlü uyarıyla gösterilir. Kesin konum istenirken hem FINE hem COARSE izinleri birlikte talep edilir.
- Ana sayfada konum eksik/çok yaklaşık olduğunda görünür bir yardım kartı bulunur: kesin konum izni, uygulama izinleri, manuel koordinat girişi. En son kayıtlı koordinatlar yalnız açık kullanıcı onayından sonra **manuel konum** olarak kullanılabilir; otomatik güncel kabul edilmez.
- Konum araması başarısız olduğu söylense dahi arama bitmez; Android konum callback'leri daha sonra gelirse kabul edilir. Son iki dakikalık geçerli önbellek düzeltme önerisine engel olmaz.
- Gemi Wi-Fi bağlantısının konumu vermesi garanti değildir. Metal gemi gövdesi ve kapalı kabin uydu sinyalini etkileyebilir. Gerçek Android cihazında ve gerçek GPS izniyle saha testi henüz yapılmadı.
- Bu sürüm tam Namaz Zamanı APK'sıdır; aylık takvim, dualar, sure sesleri, Royal Qibla, 12 dil ve Esmaül Hüsna korunur.

## v0.19 — Ekran kapanınca sıfırlanmayan ve çok yöntemli kıble sistemi

- Kaydedilmiş enlem-boylam ve ayarlar 10 dakika sonra silinmez; uygulama açıldığında tamamen çevrim dışı olarak vakitleri yeniden hesaplar. Uyuyan ekran veya `onPageFinished` otomatik Google/ağ sorgusu başlatmaz.
- Uydu GPS ve isteğe bağlı ağ konumu ayrıdır. Kullanıcı internet bağlantısı olmadan kıble/vakit ekranını görebilir. Gemi hareket edince önceki konum “eski” olarak işaretlenir; konumun güncel ve doğru olduğu iddia edilmez.
- Gölge yöntemine ek **gerçek kuzey referansı**, **doğrulanmış true heading** ve **görünen, koordinatı bilinen kara işareti** seçenekleri eklendi. Kullanıcı referansa fiziksel olarak hizalar ve onay verir. Geminin COG değeri true heading olarak kullanılmaz. Hizalama 2 dakika içinde sona erer.
- **Kullanıcı düğmesine bağlı çevrim içi kıble karşılaştırması:** HTTPS üzerinden AlAdhan ve MyQuran Qibla v3 API kaynaklarından iki küçük yanıt alınır. Tamamlanmış 2 kaynaktan gelen açılar ile yerel hesap ayrı gösterilir. Farklar yüksekse uyarılır, otomatik yön değişikliği yapılmaz. Ağ bağlantısı olmadan özellik diğerlerini etkilemez.
- Kullanıcı istemeden otomatik kıble API çağrısı yoktur. Çağrı tekrarında 30 saniye koruma vardır; her yanıt en fazla 8 KB ve istekler kısa zaman aşımlı.
- Çevrim içi servisler **coğrafi kıble azimutunu** doğrular, telefonun fiziksel dönüklüğünü veya gemideki güncel koordinatın doğruluğunu tek başına doğrulayamaz. Fiziksel hizalama/sensör testi gerekir.
- Kaynaklar: https://aladhan.com/qibla-api ; https://api.myquran.com/doc
- Android Play yayını yapılmaz; APK debug anahtarıyla imzalanmış test önizlemesidir. Gerçek gemi/telefon testi bekleniyor.

## v0.20 — Konum bulma teşhisi, akıllı arama ve her açılışta GPS yeniden denemesi
- Android konum tanısı: Kesin/Yaklaşık/İzin Yok; telefon konum anahtarı; GPS_PROVIDER; NETWORK_PROVIDER; Google Play konum servisi; arama durumu; son ölçüm kaynağı, yaşı ve hassasiyet. Tam koordinatlar rapora dahil edilmez; herhangi bir rapor yalnız kullanıcı düğmeye bastığında panoya kopyalanır.
- **Akıllı Konum Bul** kullanıcı isteğiyle Google Fused, Android ağ ve izin verilmişse uydu GPS kaynaklarını paralel dener. Yalnız yaklaşık izin varsa Android ağ/Google kaynağını yine deneyebilir; uydu GPS'in neden başlamadığı ekranda belli olur.
- **İnternetsiz ilk açılış düzeltmesi:** Daha önce hiç konum kaydedilememiş olsa bile sonraki uygulama açılışlarında, kesin izin zaten verilmişse uydu GPS otomatik yeniden denenir. Daha önce \`initialGpsAttempted\` bayrağı bu tekrarları engelliyordu. Bu otomatik tekrar Google/ağ sorgusu yapmaz ve izin penceresi tekrar tekrar açmaz.
- Eski koordinatlar ve namaz vakitleri korunur; ekranın kilitlenmesi konumu silmez. Kullanıcı özellikle arama yapmadıkça ekran açılışı Google/ağ sorgusu tetiklemez.
- Android'in tam izin ve gerçek GPS durumu ancak kullanıcının cihazında görülebilir; testlerin geçmesi dışarıda GPS'in mutlaka konum bulacağını garanti etmez.
- Aylık namaz çizelgesi, Esma, dua, sure sesleri, 12 dil ve çok yöntemli kıble sistemleri korunur. Google Play'e yayın yapılmaz.


## v0.21 — GPS arama ekranının takılı kalmasını düzeltme
- `MainActivity.onPause` arka planda GPS aboneliklerini kapatırken aramanın henüz tamamlanmadığını kaydeder. `onResume` ekran açıldığında yarım kalmış kullanıcı aramasını **yalnız uydu GPS** üzerinden yeniden başlatır. Bunun için otomatik Google/ağ konum sorgusu yapılmaz.
- GPS yeni bir çözüm döndürürse bekleyen yeniden başlatma işareti temizlenir. Kaydedilmiş koordinatlar ve namaz vakitleri etkilenmez.
- Telefonun genel Konum ayarı veya Kesin Konum izni kapalıysa açık hata gösterilir; uygulama izin almadan uydu GPS'i çalıştırdığını iddia etmez.
- Gerçek cihazda doğrulama için uygulamanın `Konum tanılama ve onarım` panelinde Kesin/Yaklaşık izin, Uydu GPS, Ağ Konumu ve Google servisi satırları karşılaştırılmalıdır.


## v0.22 — Premium Plus tek düğmeli Konum Merkezi

- Ana ekranda önceki üç bağımsız konum kartı yerine **tek Konum Merkezi düğmesi** bulunur. Düğme açıldığında tüm konum izinleri, kesin konum, akıllı GPS/ağ araması, uydu GPS, manuel koordinat, tanı raporu, hesaplama yöntemi ve gemi saati ayarı bir alt panelde toplanır.
- Panel normalde gizlidir; sayfayı gereksiz yere uzatmaz. Kapat düğmesi, karartılmış dış alana dokunma, Escape veya Android geri tuşu ile kapanır. Klavye odağı giriş düğmesine geri döner.
- Birbirinin aynı olan iki uydu GPS düğmesi birleştirildi. **Mevcut kayıtlı konum ve namaz vakitleri GPS yenilemesinde silinmez.**
- Pusulada altın tek ok ve canlı sensör doğruluğu görünür kalır; gölge/gerçek kuzey/harici heading/görünür kara işareti/çevrim içi doğrulama tek Kıble araçları başlığı altında gizlenebilir. Telefonların sensörlerinin doğruluğu gerçek saha testiyle ayrıca doğrulanmalıdır.
- Aylık namaz takvimi dokunularak açılan, geçmiş namazları düzenleme olanağı taşıyan bir karta; sureler ve Esmaül Hüsna da tek açılır öğrenme bölümüne dönüştürülür. Günlük dua, günlük namaz vakitleri ve ayet/hadis kartları ana ekranda yerinde kalır.
- Yalnızca CSS/SVG tabanlı premium safir-altın görsellik kullanılır; harici font/görsel indirilmez, arka plan internet sorgusu eklenmez. 12 uygulama dili desteklenir.
- Android test APK normal com.geminamaz.app paket kimliğindedir. fullPreview test anahtarıyla imzalanır; Google Play yayını yapılmaz. Test anahtarları GitHub Actions oturumları arasında değişebileceğinden daha eski debug APK'larla güncelleme imzası uyuşmayabilir: kayıtlı verileri korumadan uygulamayı silmeyin.

## v0.23 — Otomatik gerçek konum (Google Fused + GPS) ve mavi konum göstergesi

- Uygulama açıldığında hiç konum yoksa veya kayıtlı GPS konumu güncel değilse, mevcut konum izniyle **Google Fused Location (yüksek doğruluk), Android ağ konumu ve uydu GPS** otomatik başlatılır. Google Haritalar'ı önceden açmak gerekmez. Kullanıcının elle sabitlediği koordinatlar otomatik değiştirilmez.
- Yerini bulmadan mavi nokta gösterilmez. Konum beklenirken gri, hassas güncel ölçümde mavi, yaklaşık konumda sarı, elle girilende yeşil, eski veride gri gösterilir. Bu, Google Haritalar SDK'sındaki harita katmanı değildir; uygulamanın kendi konum durum göstergesidir.
- Google Konum Doğruluğu ayarı, konum sağlayıcılarından gelen ölçüm sayısı, reddedilen ölçüm sayısı ve ret nedenleri tanı ekranında görüntülenir; koordinatlar tanı raporuna dahil edilmez.
- GitHub Actions artık normal kurulum APK'sını **kalıcı imza sertifikasıyla** üretir. PKCS12 dosyası ve parola GitHub'ın şifrelenmiş repository secrets alanında tutulur; kaynak depoya yüklenmez. Sertifika SHA-256: 66D05BC5D1A05C70AAA703B041A599DCDDA446F50F3D7B8811EFDAD094C8A323.
- v0.22 ve daha eski test APK'ları başka sertifikayla imzalandığından yeni sürüm bunların üzerine kurulamayabilir. Önceki kayıtları kaybettirmemek için eski uygulama otomatik kaldırılmaz. Yeni sabit sertifikalı sürüme geçildikten sonraki yükseltmeler aynı imzayı kullanır.
- Bunlar Android test derlemeleridir. Google Play'e hiçbir yayın yapılmaz. Gerçek cihazda GPS konum testi tamamlanmadan sorunun yüzde yüz çözüldüğü ileri sürülmez.

## v0.24 — Google/Android pusula çatışması ve okun kaybolması düzeltmesi

- Fused Orientation Provider sensör ölçümünün konservatif yön hatası yüksekken (örn. 180°) Android dönüş sensörünü haksız yere susturması düzeltildi. Artık yalnızca güvenilir Google yönü platform alternatifine öncelik kazanır.
- Android dönüş vektörünün sağladığı açı hatası (radyan) değerlendirilir; Android 13+ cihazlarda varsa gerçek kuzeyi veren TYPE_HEADING sensörü de kullanılır.
- Premium Plus'ın tek altın oku korunur. Güvenilir ölçümde altın ok, belirsiz ölçümde soluk uyarılı ok, sensör çatışmasında uyarılı ok gösterilir. Hiç yön ölçümü yoksa kuzeye göre kıble açısı yalnız SABİT referans olarak sunulur; telefonun fiziksel baktığı yönün bilinmediği açıkça belirtilir. Belirsiz/sabit ok kesin kıble yerine geçmez.
- v0.23 otomatik mavi konum, dualar, namaz vakitleri, kayıtlar, premium tasarım ve 12 dil korunur.
- Geçici debug imzasıyla kurulmuş v0.23 pusula test sürümünden ayrılmak için yeni sabit test kimliği com.geminamaz.app.qiblatest belirlenmiştir. Hem normal APK hem yeni yan-yana test APK kalıcı preview imza sertifikasıyla üretilecektir.
- Gerçek Android telefon / gemi üzerinde manyetik sensör doğruluğu halen saha testi gerektirir. Google Play'e herhangi bir yayın yapılmadı.


## v0.25 — Gömülü ve otomatik kıble kontrolü, manuel sekme yok

- Ana ekrandaki "Kıble doğrulama ve alternatif yöntemler" sekmesi, gölge/hizalama/görünür işaret/manuel yön panelleri ve çevrim içi doğrulama düğmesi kullanıcıya tamamen gizlenir (hidden, inert, CSS). Tek premium pusula ve güven seviyesi görünür kalır.
- Google Fused ve Android yön sensörü her yeni veriyle otomatik karşılaştırılmaya devam eder; manyetik sapma Android tarafında otomatik uygulanır. Cihazın kıble açısı internetsiz ikinci, bağımsız 3B vektör formülüyle kontrol edilir. Hesaplar uyuşmazsa pusula güvenilir olduğunu iddia etmez.
- Güneş konumu cihazın fiziksel baktığı yönü tek başına vermez. Eski gölge, doğrulanmış kuzey, görülen işaret ve harici gemi gerçek-heading işlemleri kullanıcı hizalaması gerektirir; kendi kendine hizalandı sayılmaz ve okun yönü bu kaynaklarla otomatik değiştirilmez.
- İnternetli otomatik karşılaştırma varsayılan olarak kapalıdır. Konum Merkezi içinde bir defalık, anlaşılır onay verilirse güncel ve hassas GPS koordinatları AlAdhan/MyQuran servislerine gönderilerek kıble açısı otomatik karşılaştırılır. Zaman/konum kotası: normalde 24 saatte 1 istek çifti, en az 50 km hareket sonrası minimum 3 saatte 1; izin kaldırıldığında başka istek gönderilmez. Gizlilik politikasında sağlayıcılar ve veri paylaşımı açıklanır.
- Konum bilgisi yokken, eskiyken, elle girildiğinde veya hata payı fazla olduğunda otomatik API isteği gönderilmez. İnternet doğrulaması hiçbir zaman telefonun fiziksel yönünü veya gemi baş yönünü tasdik etmiş gibi gösterilmez.
- Gizli tanılama DOM ağacı sensör güncellemelerinde gereksiz yere çizilmez. 12 dil, dualar, namaz vakitleri, sureler, Esma ve aylık takvim korunur.
- İmza sertifikası ve paket kimlikleri v0.24 ile sabittir; v0.24 com.geminamaz.app.qiblatest yan yana test sürümünün üzerine kurulabilmelidir. Google Play yayını yapılmaz.
