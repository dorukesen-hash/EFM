import { NextResponse } from 'next/server';
import admin from '../../../../services/firebase/firebaseAdmin';
import { slugify } from '../../../../utils/slugify';
import { requireAdmin } from '../../../../services/auth/requireAdmin';

// Blog ekleme
export async function POST(req) {
  try {
    const auth = await requireAdmin();
    if (!auth) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    const body = await req.json();
    const { title, date, category, description, text, image, status, scheduledAt } = body;
    if (!title || !date || !category || !description || !text) {
      return NextResponse.json({ error: 'Eksik alan var.' }, { status: 400 });
    }
    const finalStatus = ['published', 'scheduled'].includes(status) ? status : 'draft';
    if (finalStatus === 'scheduled' && !scheduledAt) {
      return NextResponse.json({ error: 'Zamanlanmış yayın için tarih/saat gerekli.' }, { status: 400 });
    }

    // Slug'ı title'dan otomatik oluştur
    const slug = slugify(title);
    if (!slug) {
      return NextResponse.json({ error: 'Geçersiz başlık: slug oluşturulamadı.' }, { status: 400 });
    }

    const db = admin.firestore();
    await db.collection('blogs').doc(slug).set({
      slug,
      title,
      date,
      category,
      description,
      text,
      image: image || '',
      status: finalStatus,
      scheduledAt: finalStatus === 'scheduled' ? scheduledAt : null
    });
    return NextResponse.json({ success: true, slug }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Blog güncelleme
export async function PUT(req) {
  try {
    const auth = await requireAdmin();
    if (!auth) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    const body = await req.json();
    const { slug, title, date, category, description, text, image, status, scheduledAt } = body;
    if (!slug || !title || !date || !category || !description || !text) {
      return NextResponse.json({ error: 'Eksik alan var.' }, { status: 400 });
    }
    const finalStatus = ['published', 'scheduled'].includes(status) ? status : 'draft';
    if (finalStatus === 'scheduled' && !scheduledAt) {
      return NextResponse.json({ error: 'Zamanlanmış yayın için tarih/saat gerekli.' }, { status: 400 });
    }
    const db = admin.firestore();
    const docRef = db.collection('blogs').doc(slug);
    const existingDoc = await docRef.get();
    if (existingDoc.exists) {
      await docRef.collection('history').add({
        ...existingDoc.data(),
        savedAt: new Date().toISOString()
      });
    }
    await docRef.set({
      slug,
      title,
      date,
      category,
      description,
      text,
      image: image || '',
      status: finalStatus,
      scheduledAt: finalStatus === 'scheduled' ? scheduledAt : null
    }, { merge: true });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Blog silme
export async function DELETE(req) {
  try {
    const auth = await requireAdmin();
    if (!auth) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');
    if (!slug) return NextResponse.json({ error: 'slug gerekli.' }, { status: 400 });

    const db = admin.firestore();
    // Firestore alt koleksiyonları (örn. history) parent doc silinince otomatik silinmez;
    // recursiveDelete ile birlikte silinerek slug tekrar kullanıldığında eski geçmişin
    // yeni içeriğe sızması engellenir.
    const docRef = db.collection('blogs').doc(slug);
    await db.recursiveDelete(docRef);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Tüm blogları listeleme
export async function GET(req) {
  try {
    const auth = await requireAdmin();
    if (!auth) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    const db = admin.firestore();
    const snapshot = await db.collection('blogs').get();
    // Eski kayıtların bir kısmında slug alanı yok; admin listesi checkbox/silme
    // işlemlerini blog.slug ile anahtarlıyor, eksikse doküman ID'sine düş.
    const blogs = snapshot.docs.map(doc => {
      const data = doc.data();
      return { id: doc.id, ...data, slug: data.slug || doc.id };
    });
    return NextResponse.json({ blogs }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
