# Namaz Zamanı v0.11 — Öğrenme modülü kaynak / lisans kaydı

**Durum: geliştirme ön izlemesi. Google Play'de yayımlanmadı.** Bu belge sürüm dosyalarını açıklamak içindir; dinî hüküm, resmî meal veya kalite belgesi değildir.

## Lisanslı Kur'an sure sesleri

| Sure | Dosya | Kaynak ve hak bildirimi | Boyut | SHA-256 |
|---|---|---|---:|---|
| Fâtiha (1) | `app/src/main/assets/quran_audio/fatiha.mp3` | [Wikimedia Commons — Atcovi, CC0 1.0](https://commons.wikimedia.org/wiki/File:Chapter_1,_Al-Fatiha_(Murattal)_-_Recitation_of_the_Holy_Qur%27an.mp3) | 2.351.078 bayt | `46FE21A5118957D52AC76F5A6A7FDD7E75D52E4A569619AE3E174A23CE5C82BC` |
| Felak (113) | `app/src/main/assets/quran_audio/falaq.mp3` | [Wikimedia Commons — Atcovi, CC0 1.0](https://commons.wikimedia.org/wiki/File:Chapter_113,_Al-Falaq_(Mujawwad)_-_Recitation_of_the_Holy_Qur%27an.mp3) | 1.034.307 bayt | `45C0DDECF765E4E9C30F85D2EB747F96708F1149CD7F027DB613B491313F110A` |
| Nâs (114) | `app/src/main/assets/quran_audio/nas.mp3` | [Wikimedia Commons — Atcovi, CC0 1.0](https://commons.wikimedia.org/wiki/File:Chapter_114,_Al-Nas_(Mujawwad)_-_Recitation_of_the_Holy_Qur%27an.mp3) | 1.124.344 bayt | `BB5EED58FB701407FF40EC5E74CD0423DE687E40E87E539E2E67CF83EAC6E217` |
| İhlâs (112) | `app/src/main/assets/quran_audio/ikhlas.mp3` | [Wikimedia Commons — Atcovi, CC0 1.0](https://commons.wikimedia.org/wiki/File:Chapter_112,_Al-Ikhlas_(Mujawwad)_-_Recitation_of_the_Holy_Qur%27an.mp3) | 622.806 bayt | `BCF92FC3FF76170C1A5F12C94636D290F26386A382B58E102425407B71463C5B` |

Her iki dosya da ilgili Commons sayfasında yükleyenin kendi çalışması olarak ve Creative Commons Zero (CC0) lisansıyla işaretlenmiştir. [CC0 metni](https://creativecommons.org/publicdomain/zero/1.0/).

**Güncelleme (v0.11):** Felak ve Nâs için kaynakta CC0 olarak işaretli mevcut kayıtlar indirildi, MP3 imzası ve SHA-256'sı kaydedildi. Lisanslar kayıtları dağıtmaya izin verse de tecvid ve ses kalitesi incelemesi ayrıca yapılmalıdır.

## Metin kaynakları

- Arapça sure metinleri: [Kur'an 1](https://quran.com/1), [112](https://quran.com/112), [113](https://quran.com/113), [114](https://quran.com/114); Diyanet Kur'an Portalı ile ikinci kaynak kontrolü yapıldı.
- İlk yedi dua Kur'an ayetlerinden alınmıştır: 2:201, 20:114, 3:8, 23:118, 21:87, 28:24, 14:41. Bunlara 695 tekrarsız kaynaklı dua eklenmiştir (toplam 702); ayrıntılı lisans ve doğruluk notları için `docs/DAILY_DUA_CATALOG.md` dosyasına bakın. [Quran.com](https://quran.com/) üzerinden ayet bağlantıları uygulamada gösterilir.
- Sure anlamları ile başlangıçtaki yedi duanın anlamları özgün kısa özetlerdir; 695 ek duanın Türkçe ve İngilizce metinleri kaynak depodaki açık kullanımlı veri setinden alınmıştır. Hiçbiri resmî Diyanet meali diye tanıtılmaz; uzman içerik kontrolü bekler.
- Türkçe sesletim satırları öğretim kolaylığı için yaklaşık harf çevirisidir; tecvidli bir okumanın yerine geçmez.
- Esmaül Hüsna 99 adının geleneksel Tirmizî rivayetinde yaygın sıralaması esas alındı. Türkçe kısa anlamlar özgün açıklamalardır; 11 diğer dildeki kısa anlam metinleri de özgün editoryal çeviri taslaklarıdır. Arapça isimler ve ad sırası aynen korunur. Dil başına 99 kayıt, toplam 12 dilde 1.188 anlam eşleşmesi otomatik doğrulandı; **yayından önce dinî ve dilsel uzman kontrolü gerekir**. İsim listelerindeki kaynak farkları için [Diyanet, İslam'da İman Esasları](https://www.diyanet.gov.tr/icerik/10462) ve [Diyanet Esmaül Hüsna açıklaması](https://yayin.diyanet.gov.tr/File/Download?id=4155&path=4155_1.pdf) okunabilir.

## Özellik sınırları / final öncesi kontrol

- Dört surenin (Fâtiha, İhlâs, Felak, Nâs) paket içi CC0 sesleri kullanıcı dokunduğunda çalar; 1, 3 veya 5 tekrar ayarı vardır. Ezan ses dosyaları, menüleri ve arka plan otomatik çalma sistemi v0.13 itibarıyla tamamen kaldırıldı; bu sesler yalnızca sure okumaya aittir.
- 702 günlük dua için Android'in Arapça **metin seslendirme motoru** ile Okunuşu dinle/durdur eklendi. Bu bir hafız kaydı / tecvidli Kur'an tilaveti **değildir**. Arabic TTS ses paketi bulunmayan telefonda çalışmayabilir, bu durumda kurulum ve kalite testi gerekir. İbadet için örnek profesyonel ses kaydı yerine geçmez.
- Esmaül Hüsna yalnızca bir isim/gün gösterir; 99 isim sırasıyla döner. Öğrenildi işaretlerinin eski kayıtları saklanır.
- Beş namaz takibi ayrı panel yerine günlük vakit kartlarında işaretlenir; geçmiş cihaz kayıtları korunur.
- Kullanıcının sure ezberleme, 99 isim öğrenme ve günlük namaz işaretleri yalnızca cihazda localStorage üzerinde saklanır; sunucuya yüklenmez.
- Kullanıcının verileri cihazdan silinirse bu işaretler de silinebilir; yedekleme henüz yok.
- Dört surenin Arapça imlası, ayet sayısı, yaklaşık Türkçe sesletimi, harf/tecvid hassasiyeti ve duanın kelime kelime doğruluğu, gerçek dinî içerik uzmanı tarafından bağımsız şekilde **son kalite kontrolü** gerektirir.
- **v0.12:** Esmaül Hüsna başlığı, günlük tek isim açıklaması, öğrenme düğmeleri, kaynak metni ve 99 ismin kısa anlamları Türkçe, İngilizce, Malayca, Endonezce, Arapça, Rusça, Fransızca, Almanca, İspanyolca, Portekizce, Azerbaycanca ve Urduca için ayrı ayrı eklendi. Dil değişince aynı günün ismi korunur, metinler anında yerelleşir ve öğrenme kayıtları silinmez. Sesli sure ve günlük dua bölümlerinin Türkçe/İngilizce ağırlıklı açıklamaları ayrı bir tam yerelleştirme işi olarak açık kalır.
- Bu sürümde ezan sesi, ezan ayar menüsü, ezan oynatma servisi veya otomatik alarm izni yoktur.
- Mali / reklamsız açıklaması: FSO kişisel Google Play hesabı, şimdilik ücretsiz ve reklamsız yayın hedefi. Uygulamanın henüz Google Play'de yayımlanmadığı açıkça belirtilir.


## v0.13 — Aylık namaz takibi, vakit kilidi ve Pro Plus pusula

- Kılındı kutuları beş namaz için günün doğrulanmış astronomik vakti gelmeden devreye girmez. Geçerli konum/vakit verisi bulunmadığında bugünkü kutular da kilitlenir. Kontrol hem görsel kutuda hem yerel kaydı değiştiren işlevde yapılır.
- Kullanıcı onayı olmadan namaz otomatik kılınmış sayılmaz. Güneş doğuşu takip işaretine dahil edilmez.
- Aylık takvimde her gün 0–5 ilerleme görünür; geçmiş günler elle düzeltilebilir, gelecek günler seçilemez. Kayıt anahtarı `nz_prayer_check_v09` korunur; önceki günler silinmez.
- Pusulanın derece halkaları, altın–turkuaz iğnesi, Kâbe madalyonu, yön açısı ve hedef farkı tasarımı yenilendi. Sensör ve kıble hesaplaması mevcut kodu kullanır; ekran görüntüsü kalibrasyon veya navigasyon doğruluğunu garanti etmez.
- Ezan ses kaynakları ve native arka plan servisi kaldırıldı. Yalnızca Fâtiha/İhlâs/Felak/Nâs tilavet sesleri ve dua TTS sistemi kaldı.
