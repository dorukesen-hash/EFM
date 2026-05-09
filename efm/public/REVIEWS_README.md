# Google Yorumları - Hard-Coded Veriler

Bu dosya, Google İşletme Profili'nden manuel olarak toplanan yorumların hard-coded versiyonunu içerir.

## 📊 İstatistikler

- **Toplam Yorum:** 44
- **Ortalama Puan:** 5.0/5
- **Yıldız Dağılımı:**
  - 5★: 44 yorum
  - 4★: 0 yorum
  - 3★: 0 yorum
  - 2★: 0 yorum
  - 1★: 0 yorum

## 📁 Dosya Yapısı

### `reviewsSorted.json`
Parse edilmiş ve düzenlenmiş yorumlar. Her yorum şu bilgileri içerir:

```json
{
  "displayName": "Kullanıcı Adı",
  "profilePhotoUrl": "Profil fotoğrafı URL",
  "totalReviewCount": 2,
  "starRating": 5,
  "createTime": "2024-01-28T00:00:00.000Z",
  "comment": "Yorum metni"
}
```

### `reviews.txt`
Ham HTML verisi (Google Maps'ten kopyalanmış)

## 🔄 Yorumları Güncelleme

Yeni yorumları eklemek için:

1. **Google Maps'ten HTML'i kopyalayın:**
   - Google Maps'te işletmenizi açın
   - Tüm yorumları scroll yaparak yükleyin
   - Sayfa kaynağını görüntüleyin (Cmd+Option+U)
   - Yorumlar bölümünü kopyalayın
   - `public/reviews.txt` dosyasına yapıştırın

2. **Parse scriptini çalıştırın:**
   ```bash
   npm run reviews:parse
   ```
   veya
   ```bash
   node scripts/parseReviews.js
   ```

3. **Sonucu kontrol edin:**
   - `public/reviewsSorted.json` dosyası otomatik güncellenir
   - Terminal'de yorum sayısı ve dağılımı görüntülenir

## 📝 Notlar

- Yorumlar **hard-coded** olarak saklanır (API kullanılmaz)
- Yeni yorumlar için manuel güncelleme gerekir
- Profil fotoğrafları Google CDN'den yüklenir
- Tarihler yaklaşık olarak hesaplanır ("9 ay önce" gibi)

## 🎯 Kullanım

Bu JSON dosyası, sitenizde yorumları göstermek için kullanılabilir:

```javascript
import reviews from './reviewsSorted.json';

// Tüm yorumlar
const allReviews = reviews.reviews;

// Ortalama puan
const avgRating = reviews.averageRating;

// Sadece yorum metni olanlar
const reviewsWithComment = reviews.reviews.filter(r => r.comment);
```

## ⚡ Hızlı Komutlar

```bash
# Yorumları parse et
npm run reviews:parse

# Dev sunucusunu başlat
npm run dev

# Build
npm run build
```

---

**Son Güncelleme:** 28 Ocak 2025
**Toplam Yorum:** 44
**Ortalama Puan:** ⭐ 5.0/5

