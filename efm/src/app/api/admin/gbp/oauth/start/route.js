import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { serialize } from 'cookie';
import { getBaseUrlFromHeaders, getGbpAuthUrl } from '../../../../../../services/google/gbpOAuth';

function makeStateCookie(value) {
  const isProd = process.env.NODE_ENV === 'production';
  return serialize('gbp_oauth_state', value, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 10, // 10 dk
  });
}

export async function GET(req) {
  const state = crypto.randomBytes(16).toString('hex');

  const baseUrl = process.env.NEXTAUTH_URL || getBaseUrlFromHeaders(req.headers);
  if (!baseUrl) {
    return NextResponse.json({ error: 'Base URL belirlenemedi (NEXTAUTH_URL/Host missing).' }, { status: 500 });
  }

  const url = getGbpAuthUrl(state, baseUrl);

  return NextResponse.redirect(url, {
    headers: {
      'Set-Cookie': makeStateCookie(state),
    },
  });
}
