import { NextResponse } from 'next/server';


export async function POST(req) {
    try {
        return response;
    } catch (error) {
        return new NextResponse('Error during sign-in', { status: 500 });
    }
}
