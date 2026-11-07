# Namaz Zamanı — Google Play yayın kontrol listesi (Kasım 2026)

**Durum:** Bu klasör Google Play yükleme hazırlığıdır. Henüz Google Play'de yayınlanmadı.

## Teknik
- [x] 12 dil ve günlük ayet/hadis içeriklerini uygulamaya dahil et
- [x] Kullanıcı uygulaması v0.7'yi koru
- [x] Play hazırlık dalı `play-prep` oluştur
- [ ] Android 16 API 36 hedefli derlemeyi başarıyla doğrula
- [ ] Yeni uygulama için **AAB biçiminde ve kalıcı upload key ile imzalanmış** release paketi hazırla
- [ ] Android 16 ve eski sürümlerde cihaz testi: Google Play konumu, izinler, saat dilimi, pusula, RTL, günlük içerik
- [ ] Uzun vadeli imza anahtarı oluştur, güvenli yedek al; **anahtarı veya şifresini GitHub repo'ya koyma**
- [ ] Google Play App Signing etkinleştir

## Play Console
- [ ] Play Console geliştirici hesabını aç/doğrula
- [ ] Uygulama adı ve paket adını kesinleştir (şu an `com.geminamaz.app`)
- [ ] Mağaza açıklaması ve iletişim e-postasını tamamla
- [ ] Gizlilik politikası taslağını kamuya açık ve erişilebilir bir URL'de yayınla (HTML taslağı var; henüz yayımlanmadı)
- [ ] Google Play'in Data safety, permission, App access ve içerik derecelendirme formlarını doğru doldur
- [ ] Orijinal ikon (512×512), özellik görseli (1024×500) ve gerçek cihaz ekran görüntülerini hazırla
- [ ] Politika kontrolleri ve gerçek Android cihaz testlerini yap
- [ ] Yeni bireysel Play Console hesaplarında gerekebilen en az **12 testçi / 14 gün kapalı test** şartını tamamla
- [ ] Kullanıcıdan son yayın onayı al, sonra Play Console'a yükle

## Açıklama
Uygulama, namaz vakitlerini kendi cihazında astronomik olarak hesaplar; bunlar resmî vakitlerle farklı olabilir. Google Play Hizmetleri konum almak için kendi ağ işlemelerini yapabilir. Uygulamanın uygulamaya ait bir sunucusu yoktur ve konum bilgilerini kendi sunucusuna göndermez. Geçmiş konum cihazda kaydedilir. Konum doğru tespit edilemiyorsa kesin vakit iddia edilmemelidir. Gemi saat dilimi kullanıcı tarafından kontrol edilmelidir.

Bu belge bir taslaktır; Google Play'in o andaki politikalarına göre son kontrolden geçmesi gerekir.
