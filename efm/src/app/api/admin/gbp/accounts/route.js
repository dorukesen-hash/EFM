import { NextResponse } from 'next/server';
import { refreshAccessToken } from '../../../../../services/google/gbpOAuth';
import { getGbpOAuthConfig } from '../../../../../services/firestore/firestore';

function jsonError(message, status = 400, extra = {}) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

// Google Business Profile hesaplarını listeler.
// Gerekli: settings/googleBusinessOAuth refreshToken (admin panel OAuth akışından gelir)
export async function GET() {
  try {
    const cfg = await getGbpOAuthConfig();
    if (!cfg?.refreshToken) {
      return jsonError('GBP OAuth bağlı değil. Önce Admin Dashboard > Google ile Yetkilendir yapın.', 412);
    }

    const accessToken = await refreshAccessToken(cfg.refreshToken, process.env.NEXTAUTH_URL);

    // Yeni GBP API: Account Management v1
    // https://developers.google.com/my-business/reference/businessprofilemanagement/rest
    const url = 'https://mybusinessaccountmanagement.googleapis.com/v1/accounts';

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const text = await res.text();
    const data = text ? (() => { try { return JSON.parse(text); } catch { return { raw: text }; } })() : {};

    if (!res.ok) {
      return jsonError('Google accounts listesi alınamadı.', res.status, {
        url,
        status: res.status,
        statusText: res.statusText,
        details: data,
        hint: 'Business Profile API (Account Management) etkin mi ve OAuth scope business.manage mi kontrol edin.',
      });
    }

    return NextResponse.json(
      {
        accounts: data.accounts || [],
        source: url,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (e) {
    console.error('GBP accounts error:', e);
    return jsonError(e?.message || 'Beklenmeyen hata', 500);
  }
}
