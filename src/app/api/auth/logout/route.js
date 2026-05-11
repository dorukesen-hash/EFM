import { serialize } from 'cookie';

export async function POST() {
  // __session cookie'yi sil
  const cookie = serialize('__session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(0),
    sameSite: 'lax',
    path: '/',
  });

  return new Response(JSON.stringify({ message: 'Çıkış başarılı.', user: null }), {
    status: 200,
    headers: {
      'Set-Cookie': cookie,
      'Content-Type': 'application/json',
    },
  });
}
