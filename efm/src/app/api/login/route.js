import { NextResponse } from 'next/server';
import users from '@/data/users';

export async function POST(request) {
    const { email, password } = await request.json();
    const user = users.get(email);
    if (!user || user.password !== password) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    return NextResponse.json({ success: true });
}