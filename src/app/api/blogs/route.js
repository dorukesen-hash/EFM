import { NextResponse } from 'next/server';
import admin from '../../../services/firebase/firebaseAdmin';

export async function GET() {
  try {
    const db = admin.firestore();
    const snapshot = await db.collection('blogs').get();
    const blogs = snapshot.docs.map(doc => ({
      id: doc.id,
      slug: doc.id,
      ...doc.data()
    }));
    return NextResponse.json({ blogs });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

