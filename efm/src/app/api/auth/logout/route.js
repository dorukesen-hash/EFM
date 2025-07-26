import { serialize } from 'cookie';

export async function POST(req) {
  // Session cookie'yi silmek için Set-Cookie header'ı ile session'ı boş ve süresi geçmiş olarak ayarla
  const cookie = serialize('session', '', {
    httpOnly: true,
    secure: false,
    expires: new Date(0), // geçmiş bir tarih
    path: '/',
  });

  // Context güncellemesi için frontend'de setUser(null) çağrılmalı. Burada sadece bilgi döndürülür.
  return new Response(JSON.stringify({ message: 'Çıkış başarılı.', user: null }), {
    status: 200,
    headers: {
      'Set-Cookie': cookie,
      'Content-Type': 'application/json',
    },
  });
}
