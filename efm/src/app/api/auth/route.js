import { serialize } from 'cookie';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/utils/firebaseConfig';

export async function POST(req) {
    const { email, password } = await req.json();

    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        const user = result.user;
        const token = await user.getIdToken();

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
