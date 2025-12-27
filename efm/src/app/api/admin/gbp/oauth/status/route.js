import { NextResponse } from 'next/server';
import { getGbpOAuthConfig } from '../../../../../../services/firestore/firestore';

export async function GET() {
  const cfg = await getGbpOAuthConfig();
  const connected = !!cfg?.refreshToken;

  return NextResponse.json({
    connected,
    updatedAt: cfg?.updatedAt || null,
    scopes: cfg?.scopes || null,
  });
}

