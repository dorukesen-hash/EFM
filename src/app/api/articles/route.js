import { NextResponse } from 'next/server';
import admin from '../../../services/firebase/firebaseAdmin';

function isPubliclyVisible(doc) {
  if (doc.status === undefined) return true; // eski, status alanı olmayan makaleler
  if (doc.status === 'published') return true;
  if (doc.status === 'scheduled' && doc.scheduledAt) {
    return new Date(doc.scheduledAt).getTime() <= Date.now();
  }
  return false; // draft, veya zamanı henüz gelmemiş scheduled
}

export async function GET() {
  try {
    const db = admin.firestore();
    const snapshot = await db.collection('articles').get();
    const articles = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(isPubliclyVisible);

    // En güncel makale ilk sırada gösterilsin diye tarihe göre (yeniden eskiye) sırala
    articles.sort((a, b) => {
      const da = a.date ? new Date(a.date).getTime() : 0;
      const db_ = b.date ? new Date(b.date).getTime() : 0;
      return db_ - da;
    });

    return NextResponse.json({ articles }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
