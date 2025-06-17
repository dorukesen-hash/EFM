import { NextResponse } from 'next/server';
import { getDb } from '@/lib/firebaseAdmin';
import { createSession } from '@/lib/auth';


const db = getDb();
const users = db.collection('users');


export async function POST(request) {
    const { email, password } = await request.json();
    const doc = await users.doc(email).get();
    if (!doc.exists) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    const user = doc.data();
    if (user.password !== password) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    createSession(email);
    return NextResponse.json({ success: true });
}