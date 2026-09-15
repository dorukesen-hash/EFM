// src/services/auth/requireAdmin.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../app/api/auth/[...nextauth]/route";
import admin from "../firebase/firebaseAdmin";

// App Router route handler'larında req/res parametresi gerekmez;
// getServerSession cookie'leri next/headers üzerinden kendi okur.
export async function requireAdmin() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return null;
    }

    // Session'da isAdmin varsa doğrudan kullan
    if (session.user.isAdmin === true) {
      return { uid: session.user.id };
    }

    // Session'da isAdmin eksikse Firestore'dan kontrol et
    if (session.user.id) {
      const db = admin.firestore();
      const doc = await db.collection('users').doc(session.user.id).get();
      if (doc.exists && doc.data().isAdmin) {
        return { uid: session.user.id };
      }
    }

    return null;
  } catch (error) {
    console.error('Admin auth error:', error);
    return null;
  }
}
