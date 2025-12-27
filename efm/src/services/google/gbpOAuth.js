import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/business.manage'];

export function getBaseUrlFromHeaders(headers) {
  const xfProto = headers?.get?.('x-forwarded-proto');
  const xfHost = headers?.get?.('x-forwarded-host');
  const host = headers?.get?.('host');

  const proto = (xfProto || 'http').split(',')[0].trim();
  const resolvedHost = (xfHost || host || '').split(',')[0].trim();
  if (!resolvedHost) return null;

  return `${proto}://${resolvedHost}`;
}

function getOAuth2Client(baseUrl) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('GOOGLE_CLIENT_ID ve GOOGLE_CLIENT_SECRET gerekli.');
  }

  const redirectUri = `${baseUrl.replace(/\/$/, '')}/api/admin/gbp/oauth/callback`;
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function getGbpAuthUrl(state, baseUrl) {
  const oAuth2Client = getOAuth2Client(baseUrl);
  return oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
    include_granted_scopes: true,
    state,
  });
}

export async function exchangeCodeForTokens(code, baseUrl) {
  const oAuth2Client = getOAuth2Client(baseUrl);
  const { tokens } = await oAuth2Client.getToken(code);
  return tokens;
}

export async function refreshAccessToken(refreshToken, baseUrl) {
  const oAuth2Client = getOAuth2Client(baseUrl);
  oAuth2Client.setCredentials({ refresh_token: refreshToken });
  const res = await oAuth2Client.getAccessToken();
  const token = typeof res === 'string' ? res : res?.token;
  if (!token) throw new Error('Access token alınamadı.');
  return token;
}
