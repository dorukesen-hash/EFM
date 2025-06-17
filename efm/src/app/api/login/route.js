import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../../../firebaseConfig';
import { NextResponse } from 'next/server';
import { serialize } from 'cookie';

export async function POST(req) {
    try {
        // Google ile giriş
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Kullanıcının ID token'ını al
        const idToken = await user.getIdToken();

        // Cookie'yi oluşturmak
        const cookie = serialize('session', idToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',  // Yalnızca üretim ortamında secure cookie
            maxAge: 60 * 60 * 24 * 7, // 7 gün geçerli
            path: '/',
        });

        // Response'a cookie ekle
        const response = NextResponse.json({ message: 'User signed in' });
        response.headers.set('Set-Cookie', cookie); // Set-Cookie header

        return response;
    } catch (error) {
        return new NextResponse('Error during sign-in', { status: 500 });
    }
}
