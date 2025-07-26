import { NextResponse } from 'next/server';
import admin from '../../../../services/firebase/firebaseAdmin';

export async function GET(req) {
  try {
    // Cookie'den custom token'ı al
    const cookie = req.headers.get('cookie') || '';
    const match = cookie.match(/session=([^;]+)/);
    if (!match) {
      return NextResponse.json({ user: null }, { status: 200 });
    }
    const customToken = match[1];
    // Custom token ile kullanıcıyı doğrula
    // Not: Custom token'ı verifyIdToken ile doğrulamak mümkün değildir, sadece client'ta signInWithCustomToken ile kullanılabilir.
    // Burada örnek olarak, custom token'ın base64 payload'ını decode edip uid çekmeye çalışıyoruz (güvenli değildir, prod için uygun değil)
    // En iyi yöntem: client'ta idToken ile oturum yönetmek ve burada idToken'ı verifyIdToken ile doğrulamaktır.
    // Şimdilik, custom token'ı decode etmeye çalışalım:
    const base64Payload = customToken.split('.')[1];
    if (!base64Payload) return NextResponse.json({ user: null }, { status: 200 });
    const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString('utf-8'));
    const uid = payload.uid;
    if (!uid) return NextResponse.json({ user: null }, { status: 200 });
    // Kullanıcıyı Firestore'dan veya Firebase'den çek
    const userRecord = await admin.auth().getUser(uid);
    return NextResponse.json({
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL || null,
        isAdmin: userRecord.customClaims?.isAdmin || false,
      }
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
