'use client';
import { useState } from 'react';
import { uploadImage, deleteImage, listImages } from '@/services/firebase/firebaseStorage';

export default function ImageUpload({ onImageUpload, folder = 'articles' }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Resimleri yükle
  const loadImages = async () => {
    setLoading(true);
    setError('');
    try {
      console.log(`📂 Resimleri yükleniyor: ${folder}`);
      const imageList = await listImages(folder);
      setImages(imageList);
      console.log(`✅ ${imageList.length} resim yüklendi`);
    } catch (err) {
      const errorMsg = err.message || 'Bilinmeyen bir hata oluştu';
      setError(`❌ Resimleri yüklemede hata: ${errorMsg}`);
      console.error('💥 List error:', {
        folder,
        error: errorMsg,
        fullError: err
      });
    } finally {
      setLoading(false);
    }
  };

  // Resim dosyası seç ve yükle
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Dosya validasyonu
    if (!file.type.startsWith('image/')) {
      const msg = 'Lütfen bir resim dosyası seçin';
      setError(msg);
      console.warn('⚠️', msg);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      const msg = 'Dosya boyutu 5MB\'dan küçük olmalıdır';
      setError(msg);
      console.warn('⚠️', msg);
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      console.log(`🔄 Başlıyor: ${file.name} yükleniyor...`);
      const uploadedImage = await uploadImage(file, folder);
      setSuccess('✅ Resim başarıyla yüklendi!');
      console.log('🎉 Yükleme tamamlandı:', uploadedImage);
      
      // Callback fonksiyonunu çağır
      if (onImageUpload) {
        onImageUpload(uploadedImage);
      }

      // Liste güncelle
      await loadImages();
      e.target.value = ''; // Input'u sıfırla
    } catch (err) {
      const errorMsg = err.message || 'Bilinmeyen bir hata oluştu';
      setError(`❌ Yükleme hatası: ${errorMsg}`);
      console.error('💥 Upload error:', {
        file: file.name,
        size: file.size,
        type: file.type,
        error: errorMsg,
        fullError: err
      });
    } finally {
      setUploading(false);
    }
  };

  // Resim sil
  const handleDeleteImage = async (imagePath, imageName) => {
    if (!confirm(`"${imageName}" resimini silmek istediğinize emin misiniz?`)) {
      console.log(`⏭️ Delete cancelled for ${imageName}`);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log(`🗑️ Siliniyor: ${imagePath}`);
      await deleteImage(imagePath);
      setSuccess('✅ Resim başarıyla silindi!');
      console.log('🎉 Silme tamamlandı:', imagePath);
      await loadImages();
    } catch (err) {
      const errorMsg = err.message || 'Bilinmeyen bir hata oluştu';
      setError(`❌ Silme hatası: ${errorMsg}`);
      console.error('💥 Delete error:', {
        path: imagePath,
        name: imageName,
        error: errorMsg,
        fullError: err
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-6 py-8 rounded-lg max-w-4xl mx-auto bg-gray-50">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Resimleri Yönet</h2>

      {/* Hata/Başarı Mesajları */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {/* Resim Yükleme Alanı */}
      <div className="mb-6">
        <label htmlFor="imageInput" className="block cursor-pointer">
          <input
            id="imageInput"
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
          <span className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
            {uploading ? 'Yükleniyor...' : '📁 Resim Yükle'}
          </span>
        </label>
        <p className="mt-2 text-sm text-gray-600">Max 5MB • JPG, PNG, WebP, vb.</p>
      </div>

      {/* Resimleri Listele Butonu */}
      <button
        onClick={loadImages}
        disabled={loading}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed mb-6 transition-colors"
      >
        {loading ? 'Yükleniyor...' : '🔄 Resimleri Yükle'}
      </button>

      {/* Resimler Galerisi */}
      {images.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4 text-gray-800">Yüklenen Resimleri ({images.length})</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <div key={image.path} className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                <img src={image.url} alt={image.name} className="w-full h-40 object-cover" />
                <div className="p-4">
                  <p className="text-sm text-gray-600 truncate mb-3">{image.name}</p>
                  <button
                    onClick={() => handleDeleteImage(image.path, image.name)}
                    disabled={loading}
                    className="w-full py-2 bg-red-500 text-white rounded font-semibold hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed text-sm transition-colors"
                  >
                    🗑️ Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && images.length === 0 && (
        <p className="text-center text-gray-400 py-8 italic">Henüz resim yüklenmemiş</p>
      )}
    </div>
  );
}

