# Namaz Zamanı v0.2 (Android)

Gemi seyirleri için internetsiz **günlük** namaz vakitleri ve kıble göstergesi.

- Google Haritalar uygulamasını açmaz: Android'in kendi GPS / konum servislerini kullanır.
- Uydu GPS'i yanında varsa telefonun yaklaşık ağ konumunu da kullanır.
- Önceki kaydın yaşı / hangi konum kaynağı kullanıldığı / metre cinsinden doğruluk ekranda görünür.
- 10 dakikadan eski doğrulanamayan otomatik konumla vakit göstermez. Açık güvertede GPS yenilemek gerekir.
- Gemi için üç saat seçeneği vardır: telefon saati, boylama göre deniz saati (yaklaşık), elle UTC ofseti.
- JAKIM sabah güneş açısı 2019'daki karara uygun 18° olarak düzeltildi.
- Tek günlük vakitler, sıradaki vakte kalan süre ve kıble açısı gösterilir.
- İnternete, Google Maps API'ye veya kişisel Google hesabına ihtiyaç duymaz.

## Önemli notlar

1. Saat dilimi **GPS ile otomatik tespit edilen ülke saati** değildir. Boylama göre otomatik deniz saati yaklaşık hesaplanır; gerçek gemi saati kaptanın kullandığı UTC ofsetine göre elle ayarlanmalıdır.
2. Hesaplar astronomiktir. Resmî yerel namaz takvimleri veya denizcilik usulleriyle fark olabilir. Malezya'nın JAKIM yayınları bölgesel takvimler kullanır; uygulama bunların yerini tutmaz.
3. Gemi içindeki metal / manyetik alanlar GPS ve pusulayı etkileyebilir. Açık güverte ve telefonun "Kesin konum" izni önemlidir.
4. Kullanıcı özel verileri dış sunucuya gönderilmez. Veriler yalnızca cihazda tutulur.

## APK

GitHub Actions > en son başarılı **Namaz Zamanı APK Derle** > Artifacts > APK dosyasını indir. Veya GitHub Releases sayfasındaki doğrudan APK bağlantısını kullan.

Android 7.0+ uyumlu test sürümü. İlk Android debug sürümü v0.1 ile imza farklı olabileceğinden güncelleme kurulumu başarısız olursa önce v0.1 kaldırılmalıdır.
