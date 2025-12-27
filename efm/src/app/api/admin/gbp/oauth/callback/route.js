import { NextResponse } from 'next/server';
import { serialize } from 'cookie';
import { exchangeCodeForTokens, getBaseUrlFromHeaders } from '../../../../../../services/google/gbpOAuth';
import { setGbpOAuthConfig } from '../../../../../../services/firestore/firestore';

function clearStateCookie() {
  const isProd = process.env.NODE_ENV === 'production';
  return serialize('gbp_oauth_state', '', {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code) {
      return NextResponse.json({ error: 'code eksik' }, { status: 400 });
    }

    const cookieHeader = req.headers.get('cookie') || '';
    const match = cookieHeader.match(/gbp_oauth_state=([^;]+)/);
    const stateCookie = match ? decodeURIComponent(match[1]) : null;

    if (!state || !stateCookie || state !== stateCookie) {
      return NextResponse.json({ error: 'state doğrulaması başarısız' }, { status: 400 });
    }

    const baseUrl = process.env.NEXTAUTH_URL || getBaseUrlFromHeaders(req.headers);
    if (!baseUrl) {
      return NextResponse.json({ error: 'Base URL belirlenemedi (NEXTAUTH_URL/Host missing).' }, { status: 500 });
    }

    const tokens = await exchangeCodeForTokens(code, baseUrl);

    // refresh_token her zaman gelmeyebilir. prompt=consent ile zorlamaya çalışıyoruz.
    if (!tokens.refresh_token) {
      return NextResponse.json({
        error: 'refresh_token alınamadı. Google hesabında daha önce izin verildiyse refresh token dönmeyebilir. İzinleri kaldırıp tekrar deneyin.',
      }, { status: 400 });
    }

    await setGbpOAuthConfig({
      refreshToken: tokens.refresh_token,
      scopes: tokens.scope || null,
      tokenType: tokens.token_type || 'Bearer',
    });

    // Admin paneline dön
    const redirectUrl = new URL('/admin/dashboard?gbp=connected', baseUrl);

    return NextResponse.redirect(redirectUrl, {
      headers: {
        'Set-Cookie': clearStateCookie(),
      }
    });
  } catch (err) {
    console.error('GBP OAuth callback error:', err);
    return NextResponse.json({ error: err.message || 'OAuth callback hatası' }, { status: 500 });
  }
}
