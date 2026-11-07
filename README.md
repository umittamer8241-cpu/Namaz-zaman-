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
