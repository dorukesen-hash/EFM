import { NextResponse } from 'next/server';
import admin from '../../../../services/firebase/firebaseAdmin';

// Blog ekleme
export async function POST(req) {
  try {
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
export async function GET() {
  try {
    const db = admin.firestore();
    const snapshot = await db.collection('blogs').get();
    const blogs = snapshot.docs.map(doc => ({ ...doc.data() }));
    return NextResponse.json({ blogs }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
