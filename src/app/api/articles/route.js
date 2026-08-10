import { NextResponse } from 'next/server';
import admin from '../../../services/firebase/firebaseAdmin';

export async function GET() {
  try {
    const db = admin.firestore();
    const snapshot = await db.collection('articles').get();
    const articles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ articles }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

