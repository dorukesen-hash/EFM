// src/services/firebase/firebaseAdmin.js
// Firebase Admin SDK ile sunucu tarafı işlemler için başlatma
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

let serviceAccount;
if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64) {
  // Base64 ile encode edilmiş json stringini decode et
  try {
    const decoded = Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64, 'base64').toString('utf8');
    serviceAccount = JSON.parse(decoded);
  } catch (e) {
    console.error('Base64 decode hatası, dosyadan okumaya fallback:', e.message);
    const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || 'serviceAccountKey.json';
    serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
  }
} else {
  // Dosya yolundan oku (lokal geliştirme için)
  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || 'serviceAccountKey.json';
  try {
    serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
  } catch (e) {
    console.error('⚠️ Service account key yüklenemedi:', e.message);
    throw e;
  }
}

if (!admin.apps.length) {
  // Environment variable'dan bucket name'i al
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  
  console.log('🔧 Firebase Admin SDK initializing:', {
    projectId: serviceAccount.project_id,
    storageBucket: storageBucket
  });

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id,
    storageBucket: storageBucket,
  });
}

export default admin;
