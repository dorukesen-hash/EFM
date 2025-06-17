import { parse } from 'cookie';
import { getAuth } from 'firebase/auth';
import { auth } from '../../../firebaseConfig';

export async function GET(req) {
    // Cookie'yi parse et
    const cookies = parse(req.headers.get('cookie') || '');
    const idToken = cookies.session;

    if (!idToken) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        // ID token ile kullanıcının bilgilerini doğrulama
        const user = await auth.verifyIdToken(idToken);  // Firebase Admin SDK kullanarak doğrulama
        return new Response(JSON.stringify(user), { status: 200 });
    } catch (error) {
        return new Response('Error verifying token', { status: 500 });
    }
}
