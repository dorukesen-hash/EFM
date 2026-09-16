import { NextResponse } from 'next/server';
import admin from '../../../../services/firebase/firebaseAdmin';
import { slugify } from '../../../../utils/slugify';
import { requireAdmin } from '../../../../services/auth/requireAdmin';

export async function POST(req) {
  try {
    const auth = await requireAdmin();
    if (!auth) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    const body = await req.json();
    const { title, description, image, author, date, content, status, scheduledAt } = body;
    if (!title || !description || !image || !author || !date || !content) {
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
    await db.collection('articles').doc(slug).set({
      slug,
      title,
      description,
      image,
      author,
      date,
      content,
      status: finalStatus,
      scheduledAt: finalStatus === 'scheduled' ? scheduledAt : null
    });
    return NextResponse.json({ success: true, id: slug }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const auth = await requireAdmin();
    if (!auth) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    const body = await req.json();
    const { slug, title, description, image, author, date, content, status, scheduledAt } = body;
    if (!slug || !title || !description || !image || !author || !date || !content) {
      return NextResponse.json({ error: 'Eksik alan var.' }, { status: 400 });
    }
    const finalStatus = ['published', 'scheduled'].includes(status) ? status : 'draft';
    if (finalStatus === 'scheduled' && !scheduledAt) {
      return NextResponse.json({ error: 'Zamanlanmış yayın için tarih/saat gerekli.' }, { status: 400 });
    }
    const db = admin.firestore();
    const docRef = db.collection('articles').doc(slug);
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
      description,
      image,
      author,
      date,
      content,
      status: finalStatus,
      scheduledAt: finalStatus === 'scheduled' ? scheduledAt : null
    }, { merge: true });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const auth = await requireAdmin();
    if (!auth) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    // URL'den slug'ı al
    const { searchParams } = new URL(req.url);
    let slug = searchParams.get('slug');

    // Eğer query param yoksa body'den al
    if (!slug) {
      const body = await req.json();
      slug = body.slug;
    }

    if (!slug) {
      return NextResponse.json({ error: 'Slug gerekli.' }, { status: 400 });
    }

    const db = admin.firestore();
    await db.collection('articles').doc(slug).delete();
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Tüm makaleleri listeleme
export async function GET(req) {
  try {
    const auth = await requireAdmin();
    if (!auth) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    const db = admin.firestore();
    const snapshot = await db.collection('articles').get();
    const articles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // En güncel makale ilk sırada gösterilsin diye tarihe göre (yeniden eskiye) sırala
    articles.sort((a, b) => {
      const da = a.date ? new Date(a.date).getTime() : 0;
      const db_ = b.date ? new Date(b.date).getTime() : 0;
      return db_ - da;
    });

    return NextResponse.json({ articles }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
