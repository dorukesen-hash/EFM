import { cookies } from 'next/headers';
import { createHmac } from 'crypto';

const SECRET = process.env.JWT_SECRET || 'secret';

function base64url(obj) {
    return Buffer.from(JSON.stringify(obj)).toString('base64url');
}

function sign(payload) {
    const header = base64url({ alg: 'HS256', typ: 'JWT' });
    const body = base64url(payload);
    const data = `${header}.${body}`;
    const signature = createHmac('sha256', SECRET).update(data).digest('base64url');
    return `${data}.${signature}`;
}

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

export function createSession(email) {
    const cookieStore = cookies();
    const token = sign({ email, iat: Date.now() });
    cookieStore.set('session', token, { httpOnly: true, path: '/' });
}

export function getSession() {
    const cookieStore = cookies();
    const token = cookieStore.get('session')?.value;
    if (!token) return null;
    return verify(token);
}

export function destroySession() {
    const cookieStore = cookies();
    cookieStore.delete('session');
}