import { cookies } from 'next/headers'; // next/headers'dan cookies fonksiyonunu import et

export async function checkSession() {
    const cookieStore = await cookies();  // cookies() fonksiyonunu await ile kullan
    const sessionToken = cookieStore.get('session')?.value;  // session token'ı al

    if (!sessionToken) {
        return null;
    }

    try {
        return { email: 'user@example.com' };
    } catch (error) {
        return null;
    }
}
