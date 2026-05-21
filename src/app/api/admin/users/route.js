import { NextResponse } from 'next/server';
import admin from '../../../../services/firebase/firebaseAdmin';
import { setUserAdmin } from '../../../../services/firestore/firestore';

async function requireAdmin(req) {
  try {
    const cookies = req.headers.get('cookie') || '';
    const baseUrl = new URL(req.url).origin;
    const sessionRes = await fetch(`${baseUrl}/api/auth/session`, {
      headers: {
        cookie: cookies,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
      },
    });

    if (!sessionRes.ok) return null;
    const session = await sessionRes.json();
    if (!session?.user) return null;

    if (session.user.isAdmin === true) return { uid: session.user.id };

    if (session.user.id) {
      const db = admin.firestore();
      const doc = await db.collection('users').doc(session.user.id).get();
      if (doc.exists && doc.data().isAdmin) return { uid: session.user.id };
    }

    return null;
  } catch {
    return null;
  }
}

export async function GET(req) {
  const adminUser = await requireAdmin(req);
  if (!adminUser) {
    return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 403 });
  }

  const db = admin.firestore();
  const snap = await db.collection('users').get();
  const users = snap.docs.map((doc) => {
    const data = doc.data();
    return {
      uid: doc.id,
      displayName: data.displayName || '',
      email: data.email || '',
      isAdmin: data.isAdmin || false,
      photoURL: data.photoURL || '',
    };
  });

  return NextResponse.json({ users });
}

export async function PATCH(req) {
  const adminUser = await requireAdmin(req);
  if (!adminUser) {
    return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 403 });
  }

  const { uid, isAdmin } = await req.json();
  if (!uid || typeof isAdmin !== 'boolean') {
    return NextResponse.json({ error: 'uid ve isAdmin gerekli.' }, { status: 400 });
  }

  await setUserAdmin(uid, isAdmin);

  return NextResponse.json({ success: true });
}
