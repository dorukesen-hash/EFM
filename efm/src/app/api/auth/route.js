// api/auth/route.js

import { serialize } from 'cookie';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/utils/firebaseConfig';
import admin from '@/utils/firebaseAdmin';
import { cookies } from 'next/headers';
import { saveUserToFirestore } from '@/utils/firestoreUser';

export async function POST(req) {
    const { email, password } = await req.json();

    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        const user = result.user;
        const token = await user.getIdToken();

        // Firestore'a kullanıcıyı kaydet/güncelle
        await saveUserToFirestore({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || '',
            isAdmin: false // İlk girişte admin değil olarak kaydediyoruz
        });

        const cookie = serialize('session', token, {
            httpOnly: true,
            secure: false,
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
        });

        return new Response(JSON.stringify({ message: 'User signed in' }), {
            status: 200,
            headers: {
                'Set-Cookie': cookie,
            },
        });
    } catch (error) {
        console.error('Error during email/password sign-in', error);
        return new Response('Error during sign-in', { status: 500 });
    }
}

export async function GET(req) {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;

    console.log('API: /api/auth GET çağrıldı, sessionToken:', sessionToken);

    if (!sessionToken) {
        console.log('API: session yok, 401 dönülüyor');
        return new Response(JSON.stringify({ error: 'No session' }), { status: 401 });
    }

    try {
        const decoded = await admin.auth().verifyIdToken(sessionToken);
        console.log('API: Token decode edildi:', decoded);
        const user = await admin.auth().getUser(decoded.uid);
        console.log('API: Kullanıcı bulundu:', user);
        const isAdmin = user.customClaims && user.customClaims.admin === true;
        return new Response(JSON.stringify({
            email: user.email,
            displayName: user.displayName,
            uid: user.uid,
            isAdmin
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (e) {
        console.log('API: Hata oluştu:', e);
        return new Response(JSON.stringify({ error: 'Invalid session' }), { status: 401 });
    }
}
