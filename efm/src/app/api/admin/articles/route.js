import { NextResponse } from 'next/server';
import admin from '../../../../services/firebase/firebaseAdmin';

export async function POST(req) {
  try {
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
    // ID'yi cevaba ekleyebilirsin
    return NextResponse.json({ success: true, id: docRef.id }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
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
