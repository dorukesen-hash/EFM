// Firebase Storage bucket'ı bu projede henüz oluşturulmadı: Ekim 2024'ten beri
// Google, yeni bir Storage bucket'ı için projenin ücretli Blaze planında
// olmasını şart koşuyor, bu proje ücretsiz Spark planında kalıyor.
// Blaze aktifleştirilip bucket oluşturulana kadar görsel yükleme/listeleme
// özellikleri burada devre dışı bırakılır. Tekrar açmak için bu değeri true yap.
export const IMAGE_STORAGE_ENABLED = false;

export const IMAGE_STORAGE_DISABLED_MESSAGE =
  'Görsel depolama şu anda kullanılamıyor (Firebase Storage için ücretli plan gerekiyor).';
