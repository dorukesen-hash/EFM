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
    const { title, date, category, description, text } = body;
    if (!title || !date || !category || !description || !text) {
      return NextResponse.json({ error: 'Eksik alan var.' }, { status: 400 });
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
      text
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
    const { slug, title, date, category, description, text } = body;
    if (!slug || !title || !date || !category || !description || !text) {
      return NextResponse.json({ error: 'Eksik alan var.' }, { status: 400 });
    }
    const db = admin.firestore();
    await db.collection('blogs').doc(slug).set({
      slug,
      title,
      date,
      category,
      description,
      text
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
    await db.collection('blogs').doc(slug).delete();
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
    const blogs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ blogs }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
