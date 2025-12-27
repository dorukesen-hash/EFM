import { NextResponse } from 'next/server';
import { refreshAccessToken } from '../../../../../services/google/gbpOAuth';
import { getGbpOAuthConfig } from '../../../../../services/firestore/firestore';

function jsonError(message, status = 400, extra = {}) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

// Verilen account için location'ları listeler.
// Query: ?accountId=accounts/123 veya sadece 123
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    let accountId = searchParams.get('accountId');

    if (!accountId) {
      return jsonError('accountId gerekli. Örn: /api/admin/gbp/locations?accountId=accounts/123', 400);
    }

    // "123" geldiyse -> "accounts/123" yap
    if (!accountId.startsWith('accounts/')) {
      accountId = `accounts/${accountId}`;
    }

    const cfg = await getGbpOAuthConfig();
    if (!cfg?.refreshToken) {
      return jsonError('GBP OAuth bağlı değil. Önce Admin Dashboard > Google ile Yetkilendir yapın.', 412);
    }

    const accessToken = await refreshAccessToken(cfg.refreshToken, process.env.NEXTAUTH_URL);

    // Yeni GBP API v1: locations list
    const url = `https://mybusinessbusinessinformation.googleapis.com/v1/${accountId}/locations`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const text = await res.text();
    const data = text ? (() => { try { return JSON.parse(text); } catch { return { raw: text }; } })() : {};

    if (!res.ok) {
      return jsonError('Google locations listesi alınamadı.', res.status, {
        url,
        status: res.status,
        statusText: res.statusText,
        details: data,
        hint: 'Business Profile API (Business Information) etkin mi ve verilen account altında location var mı kontrol edin.',
      });
    }

    return NextResponse.json(
      {
        accountId,
        locations: data.locations || [],
        nextPageToken: data.nextPageToken || null,
        source: url,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (e) {
    console.error('GBP locations error:', e);
    return jsonError(e?.message || 'Beklenmeyen hata', 500);
  }
}
