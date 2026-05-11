// /api/auth/google/route.js
import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'Bu endpoint depreke edildi. Lütfen client’ta Google ile giriş yaptıktan sonra idToken’ı /api/auth/session endpointine gönderin.' },
    { status: 410 }
  );
}
