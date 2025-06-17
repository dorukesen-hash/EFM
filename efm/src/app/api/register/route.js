import { NextResponse } from 'next/server';
import users from '@/data/users';

export async function POST(request) {
    const { email, password } = await request.json();
    if (users.has(email)) {
        return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }
    users.set(email, { email, password });
    return NextResponse.json({ success: true });
}