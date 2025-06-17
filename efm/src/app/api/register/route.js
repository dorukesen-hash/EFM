import { NextResponse } from 'next/server';
import { getDb } from '@/lib/firebaseAdmin';

const db = getDb();
const users = db.collection('users');

export async function POST(request) {
    const { email, password } = await request.json();
    const doc = await users.doc(email).get();
    if (doc.exists) {
        return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }
    await users.doc(email).set({ email, password });
    return NextResponse.json({ success: true });
}