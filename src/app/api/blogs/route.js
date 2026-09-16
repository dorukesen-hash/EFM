import { NextResponse } from 'next/server';
import admin from '../../../services/firebase/firebaseAdmin';

function isPubliclyVisible(doc) {
  if (doc.status === undefined) return true;
  if (doc.status === 'published') return true;
  if (doc.status === 'scheduled' && doc.scheduledAt) {
    return new Date(doc.scheduledAt).getTime() <= Date.now();
  }
  return false;
}

export async function GET() {
  try {
    const db = admin.firestore();
    const snapshot = await db.collection('blogs').get();
    const blogs = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(isPubliclyVisible);
    return NextResponse.json({ blogs }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
