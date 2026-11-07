# Namaz Zamanı v0.9 — Ezan Ses Kütüphanesi / Lisans Envanteri

Durum: **Geliştirme ön izlemesi. Henüz Google Play'e gönderilmedi.**

Bu sayfadaki ilk üç kayıt, dosya yükleyicilerinin Wikimedia Commons'ta CC0 1.0 (kamu malı tahsisi) olarak yayımladığı içeriklerdir. Söz konusu lisans ticari dağıtım ve değiştirmeye izin verir. Yine de içeriklerin tam ezan, kalite, kayıttaki kişiye ait haklar ve kullanım bağlamı yönünden son ürün incelemesi yapılmalıdır. Bunların uluslararası yarışma birincisi oldukları **iddia edilmez**.

| Paket içi dosya | Kaynak | Wikimedia Commons yükleyicisi | Süre | Bayt | SHA-256 | Bildirilen lisans |
|---|---|---|---|---:|---|---|
| `app/src/main/assets/audio/Beautiful_adhan.ogg` | [Beautiful adhan.ogg](https://commons.wikimedia.org/wiki/File:Beautiful_adhan.ogg) | Adam-synagda | 2:34 | 1,229,032 | `35FE06B08FE80505C550C33FED8A783FA9901DDC81AC884958B4BE048F5B2A79` | CC0 1.0 |
| `app/src/main/assets/audio/Adhan.ogg` | [Adhan.ogg](https://commons.wikimedia.org/wiki/File:Adhan.ogg) | Aishatu98 | 0:42 | 338,741 | `FAEB03E4338554FB8B54DBA98ED4949648615B58E991BBD560A89F4837DDE413` | CC0 1.0 |
| `app/src/main/assets/audio/Muslim_calling_to_prayer.ogg` | [Muslim calling to prayer.ogg](https://commons.wikimedia.org/wiki/File:Muslim_calling_to_prayer.ogg) | Aishatu98 | 1:42 | 820,174 | `3B350BC210D657727578ED977E32323C06B63C2088C3EBCEA9FC9AFB7D487702` | CC0 1.0 |

CC0 metni: https://creativecommons.org/publicdomain/zero/1.0/

## Yarışma birincileri / Türk okuyucular için ayrı izin listesi

- Muhsin Kara — 2022 uluslararası ezan yarışması birincisi; kaydın **uygulamada çoğaltma/dağıtım lisansı henüz doğrulanmadı**, pakette bulunmuyor.
- Alpcan Çelik — aynı yarışmanın ikincisi; **izin bekliyor**, pakette bulunmuyor.
- Turan Tosun — 2026 Türkiye ezan yarışması birincisi; **izin bekliyor**, pakette bulunmuyor.
- Hafız Mustafa Özcan — AlAdhan üzerinden inceleme için elde edilen kayıt; site ses haklarının ilgili sahiplerde kaldığını bildiriyor. **Uygulama paketine girmedi.** Kaynak: https://aladhan.com/download-adhans ve https://aladhan.com/credits-and-terms.

**Kural:** Kullanıcının geliştirme onayı, üçüncü taraf ses kayıtlarına telif izni vermez. Herhangi bir özel yarışmacı sesini veya TRT/Diyanet/YouTube videosundan ayıklanan sesi, izin veya uygun lisans olmadan Google Play'e paketleme ya da yeniden dağıtma.

## v0.10 ön izleme: otomatik ezan

- Beş namaz için birbirinden bağımsız ses seçimi korunur. Her namaz için **Sessiz** seçilebilir.
- Otomatik ezan varsayılan olarak açıktır; kullanıcı **Vakit girince otomatik ezan oku** anahtarından tamamen kapatabilir.
- Android AlarmManager, alarm BroadcastReceiver ve mediaPlayback foreground service eklenmiştir. Otomatik kayıt listesi 31 gün için hazırlanır; cihazda aynı anda yalnızca bir sonraki alarm programlanır.
- Kullanıcı bildirime veya alarm izin ekranına yönlendirilir. **SCHEDULE_EXACT_ALARM** verilmezse zamanlama gecikebilir veya cihazın arka plan sınırlarına takılabilir.
- Telefona paketlenmiş üç CC0 kayıt, internet kullanmadan ön dinlemede ve otomatik ezanda seçilebilir. İzin bekleyen kayıtlar pakete alınmadı.
- 12 uygulama dilinde otomatik ezan kontrolü vardır; mevcut günlük dua ve öğrenme ekranlarına müdahale edilmedi.
- **İşlevsel otomasyon ve kaynak statik testlerden geçti; Android APK derlemesi ile ekran kapalı/yeniden başlatma/gerçek ses testi henüz yapılmadı. Bu sürüm Google Play yayınına hazır olarak etiketlenmez.**
- Açık denizde hareket eden cihazlarda uygulama yeniden açılıp konum yenilenmelidir; kapalıyken hesaplanan vakitler son doğrulanmış koordinata dayanır.
- Düşük veri tüketimi: üç ses toplam ~2.39 MB; sesler uygulama varlıklarındadır, ayrı ağ erişimi gerekmez.

## QA

Ses dosyalarının başlık imzası OggS ve SHA-256 eşleşmesi kontrol edildi; bu kontrol tek başına işitsel kalite incelemesi değildir.
