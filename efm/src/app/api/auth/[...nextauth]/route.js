import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { initializeApp, getApps } from "firebase/app";
import admin from "../../../../services/firebase/firebaseAdmin";
import { addUserToFirestore, getUserFromFirestore, upsertUserByEmail } from "../../../../services/firestore/firestore";

// Firebase client init
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Şifre", type: "password" },
        name: { label: "Ad Soyad", type: "text" },
        mode: { label: "Mode", type: "hidden" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email ve şifre gerekli.");
        }

        try {
          const auth = getAuth(app);
          let user;

          if (credentials.mode === "register") {
            // Kayıt işlemi
            if (!credentials.name) {
              throw new Error("Ad soyad gerekli.");
            }
            const userCred = await createUserWithEmailAndPassword(
              auth,
              credentials.email,
              credentials.password
            );
            user = userCred.user;
            // Firestore'a kaydet
            await addUserToFirestore({
              uid: user.uid,
              email: user.email,
              displayName: credentials.name,
              photoURL: "",
              isAdmin: false,
            });
          } else {
            // Giriş işlemi
            const userCred = await signInWithEmailAndPassword(
              auth,
              credentials.email,
              credentials.password
            );
            user = userCred.user;
          }

          // Admin kontrolü - Firestore ve custom claims
          const userRecord = await admin.auth().getUser(user.uid);
          const profile = await getUserFromFirestore(user.uid);
          const customClaims = userRecord.customClaims || {};
          const isAdmin = profile?.isAdmin || customClaims.admin === true || false;

          return {
            id: user.uid,
            email: user.email,
            name: user.displayName || credentials.name || user.email,
            image: user.photoURL || null,
            isAdmin,
          };
        } catch (err) {
          throw new Error(err.message || "Kimlik doğrulama başarısız.");
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/login",
    signOut: "/",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user?.email) {
        try {
          // Canonical UID: Firebase Auth tarafındaki UID
          // (Admin script ve mevcut veriler users/{firebaseUid} şeklinde tuttuğu için)
          const firebaseUser = await admin.auth().getUserByEmail(user.email);
          const canonicalUid = firebaseUser.uid;

          await upsertUserByEmail({
            uid: canonicalUid,
            email: user.email,
            displayName: user.name || '',
            photoURL: user.image || '',
          });

          const profile = await getUserFromFirestore(canonicalUid);
          user.isAdmin = profile?.isAdmin || false;

          // NextAuth tarafında da canonical id kullanalım
          user.id = canonicalUid;
        } catch (err) {
          console.error('Google signIn sync error:', err);
          user.isAdmin = false;
        }
      }
      return true;
    },
    async jwt({ token, account, profile, user }) {
      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
      }
      if (profile) {
        token.picture = profile.picture ?? token.picture;
        token.email = profile.email ?? token.email;
        token.name = profile.name ?? token.name;
      }
      if (user) {
        token.id = user.id;
        token.email = user.email || token.email;
        token.name = user.name || token.name;
        token.picture = user.image || token.picture;
        token.isAdmin = user.isAdmin || false;
        return token;
      }

      // user yoksa (sonraki requestler): token'ı Firestore'dan taze tut
      // Böylece admin yetkisi sonradan verilse bile middleware doğru görür.
      try {
        if (token.email) {
          const firebaseUser = await admin.auth().getUserByEmail(token.email);
          const canonicalUid = firebaseUser.uid;
          const profile = await getUserFromFirestore(canonicalUid);

          token.id = canonicalUid;
          token.isAdmin = profile?.isAdmin || false;
        }
      } catch (e) {
        // Burada login'i bozmayalım; mevcut token değerleriyle devam.
      }

      return token;
    },
    async session({ session, token }) {
      if (token?.accessToken) session.accessToken = token.accessToken;
      if (token?.picture && session.user) session.user.image = token.picture;
      if (session.user) {
        session.user.id = token.id || token.sub; // user.id ekle
        session.user.isAdmin = token.isAdmin || false;
      }
      return session;
    },
    async signOut() {
      // Session temizle ve çıkış sağla
      return true;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
