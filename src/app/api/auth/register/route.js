// /api/auth/register/route.js
import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'Bu endpoint depreke edildi. Lütfen client’ta Firebase Auth ile kayıt olup idToken’ı /api/auth/session endpointine gönderin.' },
    { status: 410 }
  );
}
