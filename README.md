# Namaz Zamanı v0.4 — Google konumunu kendisi etkinleştirir

Android 7+ cihazlarda günlük namaz vakitleri ve aynı ekranda kıble pusulası.

## Konum sistemi
Uygulama açılınca Google Play Hizmetleri'nin **yüksek doğruluklu Fused Location Provider** konum aramasını otomatik başlatır (Google Haritalar uygulamasını açmaz). Wi-Fi, mobil ağ ve GPS gibi kaynakları cihazın sağlayıcısı birleştirir. İlk aşamada yaklaşık modla sınırlı değildir.

- Google konumunun yeni bir ölçüm üretmesi için yüksek doğruluklu tek seferlik konum isteği.
- Daha hızlı veri için yüksek doğruluklu konum güncellemeleri.
- Eksik telefon ayarı varsa Android'in izin/onay penceresini gösterebilir; kullanıcı onayı olmadan ayarları değiştirmez.
- Google konumu bulunmazsa 28 saniye sonra yerel GPS yedeği de devreye girer.
- Konumun doğruluğu, zamanı ve kaynağı ekranda gösterilir; eski koordinatın güncel olduğu iddia edilmez.
- Gerçek Google Maps uygulaması veya Google Maps API anahtarı gerekmez.

**Önemli:** Açık denizde Wi-Fi interneti bulunması gerçek gemi koordinatının Google'a bildirildiği anlamına gelmez. İnternet yönlendirme sunucusunun IP coğrafyası geminin koordinatı değildir. Telefon konum servisi çözüm üretmiyorsa açık güvertede GPS veya manuel gemi koordinatı gereklidir.

Vakitler yaklaşık astronomik hesaba dayanır; resmî JAKIM/Diyanet takviminin yerine geçmez. Gemi saati için UTC farkı doğru seçilmelidir.

## Kurulum
Android 7.0+ için GitHub Releases sayfasından APK'yi indir. Debug test imzası önceki sürümle uyuşmazsa v0.3'ü kaldırıp yenisini kur (kayıtlı yerel ayarlar sıfırlanır).

Kaynak proje: https://github.com/umittamer8241-cpu/Namaz-zaman-
