import { NextResponse } from 'next/server';
import admin from '../../../services/firebase/firebaseAdmin';

export async function GET(req) {
  try {
    console.log('🔍 Firebase Storage Diagnostics');

    // Environment Check
    const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    console.log('📋 Environment Variables:', {
      storageBucket,
      projectId
    });

    // Firebase Admin Check
    const bucket = admin.storage().bucket(storageBucket);
    
    // Bucket varlığını kontrol et
    const [exists] = await bucket.exists();
    if (!exists) {
      throw new Error(`Bucket '${storageBucket}' bulunamadı. Lütfen .env dosyasındaki NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET değerini kontrol edin.`);
    }

    const bucketMetadata = await bucket.getMetadata();

    console.log('✅ Firebase Admin SDK Connected');
    
    // Dosyaları listele
    const [files] = await bucket.getFiles({ maxResults: 5 });
    const fileList = files.map(f => f.name);

    return NextResponse.json({
      success: true,
      diagnostics: {
        firebase: {
          projectId,
          storageBucket,
          bucketConnected: true,
          exists: exists
        },
        bucket: {
          name: bucketMetadata[0].name,
          location: bucketMetadata[0].location,
          filesInBucket: fileList
        },
        message: 'Firebase Storage bağlantısı başarılı ve dosyalar listelendi!'
      }
    }, { status: 200 });

  } catch (error) {
    console.error('💥 Diagnostics Error:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });

    return NextResponse.json({
      success: false,
      error: error.message,
      diagnostic: {
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        issue: error.message,
        troubleshoot: {
          1: 'Firebase Storage Bucket name yanlış mı kontrol et',
          2: 'Firebase Security Rules\'ı kontrol et (Public read/write izni)',
          3: 'Service Account yetkilerini kontrol et',
          4: 'Firebase Console → Storage → Bucket ayarlarını kontrol et'
        }
      }
    }, { status: 500 });
  }
}

