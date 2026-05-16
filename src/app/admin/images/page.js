'use client';
import { useState } from 'react';
import ImageUpload from '@/components/admin/ImageUpload';

export default function ImagesPage() {
  const [uploadedImage, setUploadedImage] = useState(null);

  const handleImageUpload = (image) => {
    setUploadedImage(image);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">📸 Resimleri Yönet</h1>
        <p className="text-lg text-gray-600">Makale ve blog yazılarınız için resimleri yükleyin ve yönetin</p>
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
      <ImageUpload onImageUpload={handleImageUpload} folder="articles" />
    </div>
  );
}
