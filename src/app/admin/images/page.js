'use client';
import { useState } from 'react';
import ImageUpload from '@/components/admin/ImageUpload';
import { IMAGE_STORAGE_ENABLED, IMAGE_STORAGE_DISABLED_MESSAGE } from '@/utils/imageStorage';

const FOLDERS = [
  { key: 'articles', label: 'Makaleler' },
  { key: 'blogs', label: 'Bloglar' },
];

export default function ImagesPage() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [folder, setFolder] = useState('articles');

  const handleImageUpload = (image) => {
    setUploadedImage(image);
  };

  if (!IMAGE_STORAGE_ENABLED) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
        <div className="max-w-xl mx-auto text-center bg-white rounded-lg shadow-lg p-10 mt-12">
          <h1 className="text-2xl font-bold text-gray-800 mb-3">📸 Resimleri Yönet</h1>
          <p className="text-gray-600 mb-2">{IMAGE_STORAGE_DISABLED_MESSAGE}</p>
          <p className="text-sm text-gray-400">
            Makale ve blog kapak görselleri için formlardaki yerel görsel seçeneklerini kullanabilirsin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">📸 Resimleri Yönet</h1>
        <p className="text-lg text-gray-600">Makale ve blog yazılarınız için resimleri yükleyin ve yönetin</p>
      </div>

      {/* Klasör Seçici */}
      <div className="flex justify-center gap-2 mb-8">
        {FOLDERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFolder(key)}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              folder === key
                ? 'bg-gradient-to-r from-purple-500 to-purple-700 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Yüklenen Resim Bilgisi */}
      {uploadedImage && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8 max-w-4xl mx-auto">
          <h3 className="text-green-600 text-xl font-bold mb-6">✅ Resim Başarıyla Yüklendi</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <img src={uploadedImage.url} alt="Yüklenen Resim" className="rounded-lg shadow-md max-w-sm" />
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-gray-700"><strong>Dosya Adı:</strong> {uploadedImage.name}</p>
              </div>
              <div>
                <p className="text-gray-700 font-semibold mb-2"><strong>URL:</strong></p>
                <code className="bg-gray-100 p-4 rounded border border-gray-300 text-gray-800 text-sm block overflow-auto max-h-24 break-all">
                  {uploadedImage.url}
                </code>
              </div>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(uploadedImage.url);
                  alert('URL kopyalandı!');
                }}
                className="bg-gradient-to-r from-purple-500 to-purple-700 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all self-start"
              >
                📋 URL&apos;yi Kopyala
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ImageUpload Komponenti */}
      <ImageUpload key={folder} onImageUpload={handleImageUpload} folder={folder} />
    </div>
  );
}
