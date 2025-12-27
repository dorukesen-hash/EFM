import { NextResponse } from 'next/server';
import admin from '../../../../services/firebase/firebaseAdmin';

async function requireAdmin(req) {
  const cookie = req.headers.get('cookie') || '';
  const match = cookie.match(/__session=([^;]+)/);
  if (!match) return null;
  const sessionCookie = match[1];
  const decoded = await admin.auth().verifySessionCookie(sessionCookie, true);
  const uid = decoded.uid;
  // admin claim veya Firestore alanı
  if (decoded.admin === true) return { uid };
  const db = admin.firestore();
  const doc = await db.collection('users').doc(uid).get();
  if (doc.exists && doc.data().isAdmin) return { uid };
  return null;
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
    const db = admin.firestore();
    const docRef = await db.collection('articles').add({
      title,
      description,
      image,
      author,
      date,
      content
    });
    return NextResponse.json({ success: true, id: docRef.id }, { status: 200 });
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
    await db.collection('articles').doc(slug).update({
      title,
      description,
      image,
      author,
      date,
      content
    });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
