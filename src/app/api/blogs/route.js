import { NextResponse } from 'next/server';
import admin from '../../../services/firebase/firebaseAdmin';

export async function GET() {
  try {
    const db = admin.firestore();
    const snapshot = await db.collection('blogs').get();
    const blogs = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      // status alanı olmayan eski bloglar geriye dönük uyumluluk için görünür kalır
      .filter(blog => blog.status !== 'draft');
    return NextResponse.json({ blogs }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
