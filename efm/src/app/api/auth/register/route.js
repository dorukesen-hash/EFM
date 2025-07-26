// /api/auth/register/route.js
import { NextResponse } from 'next/server';
import admin from '../../../../services/firebase/firebaseAdmin';
import { addUserToFirestore } from '../../../../services/firestore/firestore';
import { serialize } from 'cookie';

export async function POST(req) {
  try {
    const { email, password, name } = await req.json();
    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Tüm alanlar zorunludur.' }, { status: 400 });
    }

    // Firebase Admin ile kullanıcı oluştur
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    // Firestore'a kullanıcıyı kaydet
    await addUserToFirestore({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      isAdmin: false,
    });

    // Session için custom token oluştur
    const customToken = await admin.auth().createCustomToken(userRecord.uid);

    // Session cookie olarak ayarla (kendi oturum yönetiminize göre düzenleyin)
    const cookie = serialize('session', customToken, {
      httpOnly: true,
      secure: false,
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return new Response(JSON.stringify({ message: 'Kayıt başarılı' }), {
      status: 200,
      headers: {
        'Set-Cookie': cookie,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    let msg = error.message || 'Kayıt sırasında bir hata oluştu.';
    if (msg.includes('email-already-exists')) msg = 'Bu email ile zaten bir kullanıcı var.';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
