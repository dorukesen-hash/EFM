import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getUserByEmail, getUserFromFirestore } from '../../../../services/firestore/firestore';

export async function GET(req) {
  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const email = token.email || null;
    const tokenUid = token.id || token.sub || null;

    // Canonical user: tercihen email ile users/{firebaseUid} dokümanını bul
    let profile = null;
    if (email) {
      profile = await getUserByEmail(email);
    }

    // Email ile bulunamadıysa token uid ile dene
    if (!profile && tokenUid) {
      profile = await getUserFromFirestore(tokenUid);
      if (profile) profile = { uid: tokenUid, ...profile };
    }

    const uid = profile?.uid || tokenUid;

    return NextResponse.json({
      user: {
        uid: uid || null,
        email: profile?.email || email,
        displayName: profile?.displayName || token.name || null,
        photoURL: profile?.photoURL || token.picture || null,
        isAdmin: profile?.isAdmin || token.isAdmin || false,
      },
    }, { status: 200 });
  } catch (err) {
    console.error('Session GET error:', err);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}

// POST endpoint artık kullanılmıyor (NextAuth tarafından yönetiliyor)
export async function POST(_req) {
  return NextResponse.json(
    { error: 'Bu endpoint NextAuth tarafından yönetiliyor. Lütfen signIn() kullanın.' },
    { status: 410 }
  );
}

// DELETE endpoint artık kullanılmıyor (NextAuth signOut tarafından yönetiliyor)
export async function DELETE(_req) {
  return NextResponse.json(
    { error: 'Bu endpoint NextAuth tarafından yönetiliyor. Lütfen signOut() kullanın.' },
    { status: 410 }
  );
}
