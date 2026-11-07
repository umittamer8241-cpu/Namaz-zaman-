# Namaz Zamanı v0.3

Gemi için günlük namaz vakitleri ve kıble yönü.

## Konum alma (v0.3)
Uygulama **Google Haritalar'ı açmaz**. Google Play Hizmetleri'nin konum sağlayıcısını kullanır:
1. Google Play services FusedLocationProvider ile Wi-Fi / ağ destekli konumu dener.
2. Android ağ konumunu dener.
3. Yaklaşık 17 saniyede yeterli sonuç alamazsa GPS uydu konumuna geçer.
4. Veri yoksa ekranda nedenini gösterir ve Android konum ayarlarına kısayol sunar.

Google Maps API anahtarı veya harita açılması gerekmez. Google Play Hizmetleri bulunmayan cihazda Android ağ/GPS yedeği çalışır.

**Önemli:** Gemi Wi-Fi'ının internete bağlı olması gerçek coğrafi koordinatın bilindiği anlamına gelmez. Açık denizde telefonun çevresinde tanınabilir Wi-Fi / baz istasyonu olmayabilir. İnternetin çıkış sunucusu konumu geminin yeri değildir. Bu nedenle GPS veya manuel koordinat gerekebilir. Uygulama IP tabanlı konum tahminini kesin koordinat saymaz.

## Namaz vakitleri
- Günlük sabah, güneş, öğle, ikindi, akşam, yatsı.
- İnternetsiz yaklaşık astronomik hesaplama; resmî takvim değildir.
- Telefon saati, boylama göre yaklaşık deniz saati veya gemi için elle seçilen UTC farkı.
- Kıble açısı ve cihazın pusula sensörüne göre ok.
- Yaklaşık konumun kaynağı, güncelliği ve doğruluğu görünür.
- 10 dakikadan eski telefon konumu geçerli sayılmaz.

## Android
- Android 7.0+ (API 24)
- Google Play Hizmetleri varsa ağ destekli Google konum servisi, değilse Android yerel konum sağlayıcısı
- Konum ve internet erişimi izinleri
- Açık kaynak kod GitHub'da
- Test APK; fiziksel cihaz testi henüz tamamlanmadı

Not: GitHub Actions debug APK her çalışmada farklı imzalanabileceği için önceki v0.1/v0.2 üzerine yükleme sorunlu olabilir. Gerekirse eski sürümü kaldır.

GitHub Actions derleme sonucunun APK'sı Releases bölümünde yayımlanır.
