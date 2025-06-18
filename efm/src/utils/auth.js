import admin from './firebaseAdmin';
import { cookies } from 'next/headers';

export async function checkSession() {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;
    if (!sessionToken) return null;

    try {
        const decoded = await admin.auth().verifyIdToken(sessionToken);
        // Custom claims üzerinden admin kontrolü
        return {
            uid: decoded.uid,
            email: decoded.email,
            isAdmin: decoded.isAdmin || false
        };
    } catch {
        return null;
    }
}