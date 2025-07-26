// /api/auth/google/route.js
import { NextResponse } from 'next/server';
import admin from '../../../../services/firebase/firebaseAdmin';
import { addUserToFirestore } from '../../../../services/firestore/firestore';
import { serialize } from 'cookie';

export async function POST(req) {
  try {
    const { idToken } = await req.json();
    if (!idToken) {
      return NextResponse.json({ error: 'Google kimlik doğrulama tokenı gerekli.' }, { status: 400 });
    }

    // Google ID token'ı doğrula ve kullanıcıyı al
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    // Kullanıcı Firestore'da var mı kontrol et, yoksa ekle
    await addUserToFirestore({
      uid,
      email,
      displayName: name || '',
      photoURL: picture || '',
      isAdmin: false,
    });

    // Session için custom token oluştur
    const customToken = await admin.auth().createCustomToken(uid);
    const cookie = serialize('session', customToken, {
      httpOnly: true,
      secure: false,
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return new Response(JSON.stringify({ message: 'Google ile giriş başarılı' }), {
      status: 200,
      headers: {
        'Set-Cookie': cookie,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    let msg = error.message || 'Google ile giriş sırasında bir hata oluştu.';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

