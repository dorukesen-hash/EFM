/**
 * Başlığı URL-safe slug'a dönüştür
 * Türkçe karakterleri ASCII eşdeğerlerine dönüştürür
 * @param {string} text - Slug'lanacak metin
 * @returns {string} - URL-safe slug
 */
export function slugify(text) {
  if (!text) return '';

  // Türkçe karakterleri ASCII eşdeğerlerine dönüştür
  const turkishMap = {
    'ç': 'c',
    'Ç': 'c',
    'ğ': 'g',
    'Ğ': 'g',
    'ı': 'i',
    'İ': 'i',
    'ö': 'o',
    'Ö': 'o',
    'ş': 's',
    'Ş': 's',
    'ü': 'u',
    'Ü': 'u',
    'â': 'a',
    'Â': 'a',
    'î': 'i',
    'Î': 'i',
    'û': 'u',
    'Û': 'u'
  };

  let slug = text;

  // Türkçe karakterleri toLowerCase'ten ÖNCE değiştir.
  // (JS toLowerCase() Türkçe 'İ'/'I' için beklenmedik sonuçlar üretebildiğinden
  //  önce eşleme yapmak daha güvenli.)
  Object.keys(turkishMap).forEach(char => {
    slug = slug.replace(new RegExp(char, 'g'), turkishMap[char]);
  });

  slug = slug.toLowerCase();

  // Kalan tüm aksanlı harfleri ASCII'ye indir (é→e, ñ→n, ø→o vb.)
  slug = slug.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');

  // ASCII harf/rakam dışındaki özel karakterleri kaldır
  slug = slug.replace(/[^a-z0-9\s-]/g, '');

  // Boşlukları ve art arda gelen tire işaretlerini normalize et
  slug = slug.split(/\s+/).filter(Boolean).join('-');
  slug = slug.replace(/-+/g, '-');

  // Başlayan/bitişi tire işareti kaldır
  slug = slug.replace(/^-+|-+$/g, '');

  return slug;
}

