import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req) {
  const url = req.nextUrl;
  const pathname = url.pathname;
  const isAdminPath = pathname.startsWith('/admin');
  const isAdminApi = pathname.startsWith('/api/admin');

  if (!isAdminPath && !isAdminApi) return NextResponse.next();

  // NextAuth JWT token'dan oturum kontrol et
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    if (isAdminApi) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
    const loginUrl = new URL('/auth/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin kontrolü
  // Not: UI tarafında isAdmin true görünse bile, middleware sadece JWT'i görür.
  // Token henüz isAdmin ile güncellenmemişse yanlış redirect döngüsü oluşabiliyor.
  // Bu yüzden token admin değilse bir kez /api/auth/session ile server-side teyit ediyoruz.
  let isAdmin = token.isAdmin === true;

  if (!isAdmin) {
    try {
      const sessionUrl = new URL('/api/auth/session', req.url);
      const sessionRes = await fetch(sessionUrl, {
        headers: {
          // cookie'ler otomatik gitmez; middleware contextinde manuel geçiyoruz.
          cookie: req.headers.get('cookie') || '',
        },
      });

      if (sessionRes.ok) {
        const { user } = await sessionRes.json();
        isAdmin = user?.isAdmin === true;
      }
    } catch {
      // sessiz geç: aşağıdaki default davranış devreye girer
    }
  }

  if (!isAdmin) {
    if (isAdminApi) return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 });
    return NextResponse.redirect(new URL('/auth/profile', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
