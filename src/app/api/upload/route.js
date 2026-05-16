import { NextResponse } from 'next/server';
import admin from '../../../services/firebase/firebaseAdmin';

async function requireAdmin(req) {
  try {
    const cookies = req.headers.get('cookie') || '';
    const baseUrl = new URL(req.url).origin;
    const sessionRes = await fetch(`${baseUrl}/api/auth/session`, {
      headers: {
        cookie: cookies,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
      },
    });

    if (!sessionRes.ok) {
      return null;
    }

    const session = await sessionRes.json();
    if (!session?.user) {
      return null;
    }

    if (session.user.isAdmin === true) {
      return { uid: session.user.id };
    }

    if (session.user.id) {
      const db = admin.firestore();
      const doc = await db.collection('users').doc(session.user.id).get();
      if (doc.exists && doc.data().isAdmin) {
        return { uid: session.user.id };
      }
    }

    return null;
  } catch (error) {
    console.error('Admin auth error:', error);
    return null;
  }
}

// Resim yükleme
export async function POST(req) {
  try {
    const auth = await requireAdmin(req);
    if (!auth) {
      console.error('🔐 Auth failed: User not authenticated or not admin');
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    // Form data'yı al
    const formData = await req.formData();
    const file = formData.get('file');
    const folder = 'EFM';

    if (!file) {
      console.error('❌ No file provided in request');
      return NextResponse.json({ error: 'Dosya gerekli' }, { status: 400 });
    }

    // Dosyayı buffer'a dönüştür
    const buffer = await file.arrayBuffer();
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const filePath = `${folder}/${fileName}`;

    try {
      console.log(`📤 Uploading file: ${filePath}`);
      
      // Admin SDK ile Cloud Storage'a yükle
      const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
      console.log(`Using bucket: ${bucketName}`);
      
      const bucket = admin.storage().bucket(bucketName);
      const fileRef = bucket.file(filePath);

      await fileRef.save(Buffer.from(buffer), {
        metadata: {
          contentType: file.type,
          cacheControl: 'public, max-age=3600',
        },
      });

      console.log(`✅ File uploaded successfully: ${filePath}`);

       // Firebase Storage public URL formatı
       const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filePath)}?alt=media`;

       return NextResponse.json({
         success: true,
         url: publicUrl,
         path: filePath,
         name: file.name,
         message: 'Resim başarıyla yüklendi'
       }, { status: 200 });

    } catch (storageError) {
      console.error('🔥 Storage error:', {
        message: storageError.message,
        code: storageError.code,
        stack: storageError.stack
      });
      throw storageError;
    }

  } catch (error) {
    console.error('💥 Upload endpoint error:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    return NextResponse.json({
      error: 'Yükleme başarısız',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// Resimleri listeleme
export async function GET(req) {
  try {
    const auth = await requireAdmin(req);
    if (!auth) {
      console.error('🔐 Auth failed for GET request');
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const folder = searchParams.get('EFM');

    try {
      console.log(`📂 Listing images in folder: ${folder}`);

      const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
      console.log(`Using bucket: ${bucketName}`);
      
      const bucket = admin.storage().bucket(bucketName);
      const files = await bucket.getFiles({ prefix: `EFM/` });

       const images = files[0].map((file) => ({
         name: file.name.split('/').pop(),
         path: file.name,
         url: `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(file.name)}?alt=media`
       }));

      console.log(`✅ Listed ${images.length} images`);

      return NextResponse.json({
        success: true,
        images,
        message: `${images.length} resim bulundu`
      }, { status: 200 });

    } catch (storageError) {
      console.error('🔥 Storage list error:', {
        message: storageError.message,
        code: storageError.code
      });
      throw storageError;
    }

  } catch (error) {
    console.error('💥 List endpoint error:', {
      message: error.message,
      code: error.code
    });
    return NextResponse.json({
      error: 'Listeleme başarısız',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// Resim silme
export async function DELETE(req) {
  try {
    const auth = await requireAdmin(req);
    if (!auth) {
      console.error('🔐 Auth failed for DELETE request');
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const body = await req.json();
    const { path } = body;

    if (!path) {
      console.error('❌ No path provided for deletion');
      return NextResponse.json({ error: 'Dosya yolu gerekli' }, { status: 400 });
    }

    try {
      console.log(`🗑️ Deleting file: ${path}`);

      const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
      console.log(`Using bucket: ${bucketName}`);
      
      const bucket = admin.storage().bucket(bucketName);
      const fileRef = bucket.file(path);

      await fileRef.delete();

      console.log(`✅ File deleted successfully: ${path}`);

      return NextResponse.json({
        success: true,
        message: 'Resim başarıyla silindi'
      }, { status: 200 });

    } catch (storageError) {
      console.error('🔥 Storage delete error:', {
        message: storageError.message,
        code: storageError.code
      });
      throw storageError;
    }

  } catch (error) {
    console.error('💥 Delete endpoint error:', {
      message: error.message,
      code: error.code
    });
    return NextResponse.json({
      error: 'Silme başarısız',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

