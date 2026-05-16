// src/services/firebase/firebaseStorage.js
// Firebase Storage işlemleri (backend API aracılığıyla)

// Resim yükle - Backend API'si aracılığıyla (Admin SDK ile)
export const uploadImage = async (file, folder = 'articles') => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    console.log(`📤 Uploading ${file.name} to ${folder}...`);

    const response = await fetch('/api/upload', {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`❌ Upload failed (${response.status}):`, errorData);
      throw new Error(errorData.error || `Upload failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ Upload successful:`, data);

    return {
      url: data.url,
      path: data.path,
      name: data.name
    };
  } catch (error) {
    console.error('💥 Resim yükleme hatası:', {
      message: error.message,
      cause: error.cause,
      stack: error.stack
    });
    throw error;
  }
};

// Resim sil - Backend API'si aracılığıyla (Admin SDK ile)
export const deleteImage = async (imagePath) => {
  try {
    console.log(`🗑️ Deleting image: ${imagePath}`);

    const response = await fetch('/api/upload', {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: imagePath }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`❌ Delete failed (${response.status}):`, errorData);
      throw new Error(errorData.error || `Delete failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ Delete successful:`, data);
    return true;
  } catch (error) {
    console.error('💥 Resim silme hatası:', {
      message: error.message,
      cause: error.cause,
      stack: error.stack
    });
    throw error;
  }
};

// Klasördeki tüm resimleri listele
export const listImages = async (folder = 'articles') => {
  try {
    console.log(`📂 Listing images in ${folder}...`);

    const response = await fetch(`/api/upload?folder=${folder}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`❌ List failed (${response.status}):`, errorData);
      throw new Error(errorData.error || `List failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ Files listed:`, data.images?.length || 0);
    return data.images || [];
  } catch (error) {
    console.error('💥 Resimleri listeleme hatası:', {
      message: error.message,
      cause: error.cause,
      stack: error.stack
    });
    throw error;
  }
};

// Resim URL'sini al
export const getImageDownloadURL = async (imagePath) => {
  try {
    const response = await fetch('/api/upload', {
      method: 'GET',
      credentials: 'include',
      headers: { 'X-Image-Path': imagePath },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get URL');
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('💥 Resim URL alma hatası:', error.message);
    throw error;
  }
};

