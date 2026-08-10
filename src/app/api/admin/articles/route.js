import { NextResponse } from 'next/server';
import admin from '../../../../services/firebase/firebaseAdmin';

// Slug oluşturma fonksiyonu
function slugify(text) {
  if (!text) return '';

  const turkishMap = {
    'ç': 'c', 'Ç': 'c',
    'ğ': 'g', 'Ğ': 'g',
    'ı': 'i', 'İ': 'i',
    'ö': 'o', 'Ö': 'o',
    'ş': 's', 'Ş': 's',
    'ü': 'u', 'Ü': 'u'
  };

  let slug = text.toLowerCase();
  Object.keys(turkishMap).forEach(char => {
    slug = slug.replace(new RegExp(char, 'g'), turkishMap[char]);
  });

  slug = slug.replace(/[^a-z0-9\s-]/g, '');
  slug = slug.split(/\s+/).filter(Boolean).join('-');
  slug = slug.replace(/-+/g, '-');
  slug = slug.split('-').slice(0, 3).join('-');
  slug = slug.replace(/^-+|-+$/g, '');

  return slug;
}

async function requireAdmin(req) {
  try {
    // Cookie'den session-token'ı al
    const cookies = req.headers.get('cookie') || '';
    
    // NextAuth session'ını /api/auth/session endpoint'ından al
    // Cookie'ler otomatik gönderilir çünkü req'den geliyor
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

    // Token'da isAdmin varsa kontrol et
    if (session.user.isAdmin === true) {
      return { uid: session.user.id };
    }

    // Eğer session'da isAdmin eksikse, Firestore'dan kontrol et
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

export async function POST(req) {
  try {
    const auth = await requireAdmin(req);
    if (!auth) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    const body = await req.json();
    const { title, description, image, author, date, content } = body;
    if (!title || !description || !image || !author || !date || !content) {
      return NextResponse.json({ error: 'Eksik alan var.' }, { status: 400 });
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
      content
    });
    return NextResponse.json({ success: true, id: slug }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const auth = await requireAdmin(req);
    if (!auth) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    const body = await req.json();
    const { slug, title, description, image, author, date, content } = body;
    if (!slug || !title || !description || !image || !author || !date || !content) {
      return NextResponse.json({ error: 'Eksik alan var.' }, { status: 400 });
    }
    const db = admin.firestore();
    await db.collection('articles').doc(slug).set({
      slug,
      title,
      description,
      image,
      author,
      date,
      content
    }, { merge: true });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const auth = await requireAdmin(req);
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
    const auth = await requireAdmin(req);
    if (!auth) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    const db = admin.firestore();
    const snapshot = await db.collection('articles').get();
    const articles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ articles }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
