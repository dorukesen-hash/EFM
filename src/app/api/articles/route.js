import { NextResponse } from 'next/server';
import admin from '../../../services/firebase/firebaseAdmin';

export async function GET() {
  try {
    const db = admin.firestore();
    const snapshot = await db.collection('articles').get();
    const articles = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      // status alanı olmayan eski makaleler geriye dönük uyumluluk için görünür kalır
      .filter(article => article.status !== 'draft');

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
