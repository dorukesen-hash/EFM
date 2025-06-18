import { NextResponse } from 'next/server';

export async function POST() {
    // Çıkışta session çerezini sil
    return new NextResponse(
        JSON.stringify({ success: true }),
        {
            status: 200,
            headers: {
                'Set-Cookie': 'session=; Path=/; HttpOnly; Max-Age=0;',
                'Content-Type': 'application/json',
            },
        }
    );
}