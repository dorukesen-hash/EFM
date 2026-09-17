import { NextResponse } from 'next/server';
import admin from '../../../../../services/firebase/firebaseAdmin';
import { requireAdmin } from '../../../../../services/auth/requireAdmin';

export async function GET(req) {
  try {
    const auth = await requireAdmin();
    if (!auth) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');
    if (!slug) return NextResponse.json({ error: 'slug gerekli.' }, { status: 400 });

    const db = admin.firestore();
    const snapshot = await db.collection('blogs').doc(slug).collection('history').orderBy('savedAt', 'desc').get();
    const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ history }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
