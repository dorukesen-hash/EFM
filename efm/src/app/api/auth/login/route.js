import { NextResponse } from 'next/server';
import admin from '../../../../services/firebase/firebaseAdmin';
import { serialize } from 'cookie';

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email ve şifre zorunludur.' }, { status: 400 });
    }

    // Burada sadece email ile kullanıcıyı bulup, custom token döneceğiz (şifre kontrolü client'ta olmalı)
    const userRecord = await admin.auth().getUserByEmail(email);
    if (!userRecord) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı.' }, { status: 404 });
    }
    // Custom token oluştur
    const customToken = await admin.auth().createCustomToken(userRecord.uid);
    const cookie = serialize('session', customToken, {
      httpOnly: true,
      secure: false,
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    return new Response(JSON.stringify({ message: 'Giriş başarılı' }), {
      status: 200,
      headers: {
        'Set-Cookie': cookie,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    let msg = error.message || 'Giriş sırasında bir hata oluştu.';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
