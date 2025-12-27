import { NextResponse } from 'next/server';
import admin from '../../../../services/firebase/firebaseAdmin';

async function requireAdmin(req) {
  const cookie = req.headers.get('cookie') || '';
  const match = cookie.match(/__session=([^;]+)/);
  if (!match) return null;
  const sessionCookie = match[1];
  const decoded = await admin.auth().verifySessionCookie(sessionCookie, true);
  const uid = decoded.uid;
  if (decoded.admin === true) return { uid };
  const db = admin.firestore();
  const doc = await db.collection('users').doc(uid).get();
  if (doc.exists && doc.data().isAdmin) return { uid };
  return null;
}

// Blog ekleme
export async function POST(req) {
  try {
    const auth = await requireAdmin(req);
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
    });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Blog güncelleme
export async function PUT(req) {
  try {
    const auth = await requireAdmin(req);
    if (!auth) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    const body = await req.json();
    const { slug, title, date, category, description, text } = body;
    if (!slug || !title || !date || !category || !description || !text) {
      return NextResponse.json({ error: 'Eksik alan var.' }, { status: 400 });
    }
    const db = admin.firestore();
    await db.collection('blogs').doc(slug).update({
      title,
      date,
      category,
      description,
      text
    });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Tüm blogları listeleme
export async function GET(req) {
  try {
    const auth = await requireAdmin(req);
    if (!auth) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    const db = admin.firestore();
    const snapshot = await db.collection('blogs').get();
    const blogs = snapshot.docs.map(doc => ({ ...doc.data() }));
    return NextResponse.json({ blogs }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
