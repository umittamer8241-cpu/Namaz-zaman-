# Namaz Zamanı v0.9 — Günlük Dua: 702 Sıralı Kayıt

**Durum:** Yalnızca geliştirici/test sürümü; Google Play'e otomatik yüklenmez. Dinî kaynakların bağımsız içerik incelemesi yayın öncesi gereklidir.

## Kullanıcı kararı (7 Kasım 2026)

- Uygulama ekranında **günde yalnızca 1 dua** gösterilir. Kullanıcıya aynı gün farklı dua önerilmez.
- Dua sırası karıştırılmaz; kullanıcının bu sürümü ilk açtığı gün **1. dua**, ertesi takvim günü **2. dua** gösterilir.
- Bir gün boyunca uygulamanın kapatılıp açılması aynı duayı değiştirmez. Gemi saati ayarına göre uygulamanın kabul ettiği aktif gün dikkate alınır.
- Son dua görüldüğünde bir sonraki gün ilk duaya geri dönülür. Eski **7 günde bir tekrar** kaldırıldı.
- Başlangıç günü yalnızca cihazda `localStorage.nz_dua_sequence_start_v09` anahtarında tutulur. Uygulamanın verileri silinirse başlangıç tarihi sıfırlanabilir.
- Kullanıcı birkaç gün uygulamayı açmazsa sıra geçen takvim günü sayısına göre ilerler; kaçırılan dualar otomatik öne çekilmez.
- Sıra numarası **Dua N / 702** olarak görünür.

## 702 duanın kaynak ve seçimi

- Önceden elle hazırlanmış ve kaynakları gösterilen 7 Kur'an duası korunmuştur.
- [islamicapi/masnun-dua](https://github.com/islamicapi/masnun-dua) açık arşivinden Türkçe/İngilizce kayıtlar numara sırasına göre alınmıştır.
- Sabitlenen kaynak commit: `5b615c53c271f348432cc8913b81f7a220aea114`.
- Kaynak deposunun README'si uygulama geliştirme dâhil ticari ve kişisel kullanıma ücretsiz izin verdiğini belirtir ve atıf şartı koymaz. [Kaynak README](https://github.com/islamicapi/masnun-dua/blob/5b615c53c271f348432cc8913b81f7a220aea114/README.md).
- 1.001 kaynak girişinden 900'ünde Arapça, Latin harfli okunuş, Türkçe açıklama ve kaynak bilgisi doludur. Başlangıçtaki yedi dua dâhil yinelenen Arapça metinler ayıklandı. **695 yeni özgün dua + 7 mevcut = 702**.
- Her kayıt kullanıcıya Arapça metni, Türkçe okunuşu, Türkçe/İngilizce anlam metnini, kaynak bilgisini ve kaynak bağlantısını sunar.
- İlgili ses dosyaları indirilmedi: bu değişiklik **dua sesli okuma değil, yazılı günlük dua sıralamasıdır**.
- İnternet olmadan çalışır. Yeni kütüphane UTF-8 JavaScript dosyası içinde yaklaşık 0,9 MB'dır; bu yeni indirmeler uygulama paketinin içinde gelir.
- Envanter raporu: [DAILY_DUA_CATALOG_AUDIT.json](DAILY_DUA_CATALOG_AUDIT.json).

## Sınırlar ve son kontrol

Bu arşivde 695 kayıt üçüncü taraf kaynağından alınmıştır. Otomatik testler metin alanlarının ve kaynak referanslarının **bulunduğunu** gösterir; tüm hadislerin sahihliği, Arapça imla, Türkçe okunuş ve tercümelerin ilmî doğruluğu uzmanlarca tek tek doğrulanmış değildir. Bu yüzden uygulama yayınından önce özellikle dua türleri, kaynak numarası ve olası konu dışı metinler incelenmelidir.

Yeni dualar, önceki 7 duada olduğu gibi resmî Diyanet meali diye gösterilmez. İngilizce/Türkçe içeriğin dışında kalan 10 uygulama dilinde bu yeni günlük dua metinleri için çeviri henüz tamamlanmamıştır.

## QA

`node tools/validate_learning.js`

`node tools/validate_dua_sequence.js`

Kontroller: tam koleksiyon uzunluğu, 7'lik döngünün kaldırılması, ilk gün aynı duanın korunması, ikinci gün bir sonraki dua, 702. gün son dua, 703. gün başa dönme ve mevcut eğitim/eza n modüllerinin bozulmaması.
