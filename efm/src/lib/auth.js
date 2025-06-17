import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from './firebaseConfig';
import { createHmac } from 'crypto';

const SECRET = process.env.JWT_SECRET || 'secret';

// Base64Url encoding
function base64url(obj) {
    return Buffer.from(JSON.stringify(obj)).toString('base64url');
}

// JWT signing
function sign(payload) {
    const header = base64url({ alg: 'HS256', typ: 'JWT' });
    const body = base64url(payload);
    const data = `${header}.${body}`;
    const signature = createHmac('sha256', SECRET).update(data).digest('base64url');
    return `${data}.${signature}`;
}

// JWT verify
function verify(token) {
    try {
        const [header, body, signature] = token.split('.');
        const data = `${header}.${body}`;
        const expected = createHmac('sha256', SECRET).update(data).digest('base64url');
        if (expected !== signature) return null;
        return JSON.parse(Buffer.from(body, 'base64url').toString());
    } catch {
        return null;
    }
}

// Login with google and create a session
export async function googleSignIn() {
    const provider = new GoogleAuthProvider();

    try {
        // Google ile giriş
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Kullanıcının ID token'ını al
        const idToken = await user.getIdToken();

        // Cookie'ye ID token'ı kaydet
        const cookieStore = await cookies();
        cookieStore.set('session', idToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 60 * 60 * 24 * 7, // 7 gün
            path: '/'
        });

        return { message: 'User signed in and session created' };
    } catch (error) {
        console.error('Error during sign-in:', error);
        return { error: 'Google login failed' };
    }
}

// Create session
export async function createSession(email) {
    const cookieStore = await cookies();
    const token = sign({ email, iat: Date.now() });
    cookieStore.set('session', token, { httpOnly: true, path: '/' });
}

// Get session
export async function getSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    if (!token) return null;
    return verify(token);
}

// Delete session
export async function destroySession() {
    const cookieStore = await cookies();
    cookieStore.delete('session');
}

export async function checkSession() {
    const session = await getSession();
    if (session) {
        console.log('User is authenticated:', session);
    } else {
        console.log('No active session');
    }
}