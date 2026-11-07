# Namaz Zamanı v0.9 — Öğrenme modülü kaynak / lisans kaydı

**Durum: geliştirme ön izlemesi. Google Play'de yayımlanmadı.** Bu belge sürüm dosyalarını açıklamak içindir; dinî hüküm, resmî meal veya kalite belgesi değildir.

## Lisanslı Kur'an sure sesleri

| Sure | Dosya | Kaynak ve hak bildirimi | Boyut | SHA-256 |
|---|---|---|---:|---|
| Fâtiha (1) | `app/src/main/assets/quran_audio/fatiha.mp3` | [Wikimedia Commons — Atcovi, CC0 1.0](https://commons.wikimedia.org/wiki/File:Chapter_1,_Al-Fatiha_(Murattal)_-_Recitation_of_the_Holy_Qur%27an.mp3) | 2.351.078 bayt | `46FE21A5118957D52AC76F5A6A7FDD7E75D52E4A569619AE3E174A23CE5C82BC` |
| İhlâs (112) | `app/src/main/assets/quran_audio/ikhlas.mp3` | [Wikimedia Commons — Atcovi, CC0 1.0](https://commons.wikimedia.org/wiki/File:Chapter_112,_Al-Ikhlas_(Mujawwad)_-_Recitation_of_the_Holy_Qur%27an.mp3) | 622.806 bayt | `BCF92FC3FF76170C1A5F12C94636D290F26386A382B58E102425407B71463C5B` |

Her iki dosya da ilgili Commons sayfasında yükleyenin kendi çalışması olarak ve Creative Commons Zero (CC0) lisansıyla işaretlenmiştir. [CC0 metni](https://creativecommons.org/publicdomain/zero/1.0/).

**Felak (113) ve Nâs (114)** için Commons üzerinde CC0 kayıt bulundu (Atcovi), ancak 2026-11-07 tarihinde indirme sunucusu HTTP 429 döndürdüğünden dosyalar projede yok. Uygulamanın kullanıcı arayüzü bu surelerde **ses yok** diye doğru biçimde bildirir. Kaynaklar:

- [Felak](https://commons.wikimedia.org/wiki/File:Chapter_113,_Al-Falaq_(Mujawwad)_-_Recitation_of_the_Holy_Qur%27an.mp3)
- [Nâs](https://commons.wikimedia.org/wiki/File:Chapter_114,_Al-Nas_(Mujawwad)_-_Recitation_of_the_Holy_Qur%27an.mp3)

## Metin kaynakları

- Arapça sure metinleri: [Kur'an 1](https://quran.com/1), [112](https://quran.com/112), [113](https://quran.com/113), [114](https://quran.com/114); Diyanet Kur'an Portalı ile ikinci kaynak kontrolü yapıldı.
- İlk yedi dua Kur'an ayetlerinden alınmıştır: 2:201, 20:114, 3:8, 23:118, 21:87, 28:24, 14:41. Bunlara 695 tekrarsız kaynaklı dua eklenmiştir (toplam 702); ayrıntılı lisans ve doğruluk notları için `docs/DAILY_DUA_CATALOG.md` dosyasına bakın. [Quran.com](https://quran.com/) üzerinden ayet bağlantıları uygulamada gösterilir.
- Sure anlamları ile başlangıçtaki yedi duanın anlamları özgün kısa özetlerdir; 695 ek duanın Türkçe ve İngilizce metinleri kaynak depodaki açık kullanımlı veri setinden alınmıştır. Hiçbiri resmî Diyanet meali diye tanıtılmaz; uzman içerik kontrolü bekler.
- Türkçe sesletim satırları öğretim kolaylığı için yaklaşık harf çevirisidir; tecvidli bir okumanın yerine geçmez.
- Esmaül Hüsna 99 adının geleneksel Tirmizî rivayetinde yaygın sıralaması esas alındı; Türkçe kısa anlamlar özgün açıklamalardır. İsim listelerindeki kaynak farkları için [Diyanet, İslam'da İman Esasları](https://kurul.diyanet.gov.tr/yayinlarpdf/7.pdf) ve [Diyanet Esmaül Hüsna açıklaması](https://yayin.diyanet.gov.tr/File/Download?id=4155&path=4155_1.pdf) okunabilir.

## Özellik sınırları / final öncesi kontrol

- Fâtiha ve İhlâs sesleri yalnızca kullanıcı dokunduğunda çalar; 1, 3 veya 5 tekrar ayarı vardır. Arka planda otomatik tilavet veya ezan yapılmaz.
- Dua ve Esmaül Hüsna için sesli kayıt **henüz yok**; sesli okunduğu iddia edilmez.
- Kullanıcının sure ezberleme, 99 isim öğrenme ve günlük namaz işaretleri yalnızca cihazda localStorage üzerinde saklanır; sunucuya yüklenmez.
- Kullanıcının verileri cihazdan silinirse bu işaretler de silinebilir; yedekleme henüz yok.
- Dört surenin Arapça imlası, ayet sayısı, yaklaşık Türkçe sesletimi, harf/tecvid hassasiyeti ve duanın kelime kelime doğruluğu, gerçek dinî içerik uzmanı tarafından bağımsız şekilde **son kalite kontrolü** gerektirir.
- Uygulamanın diğer 12 dil desteği korunur; yeni eğitim içeriği için bu sürümde arayüz Türkçe ve İngilizce, açıklamalar diğer dillerde İngilizce/Türkçe geçici olarak sunulur. Tam 12 dil çevirisi **henüz tamamlanmadı**.
- Dünya birincisi ezan okuyucularının izin bekleyen kayıtları bu modüle veya APK/AAB dosyasına eklenmedi.
- Mali / reklamsız açıklaması: FSO kişisel Google Play hesabı, şimdilik ücretsiz ve reklamsız yayın hedefi. Uygulamanın henüz Google Play'de yayımlanmadığı açıkça belirtilir.
