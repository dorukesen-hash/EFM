// src/services/firestore/firestore.js
// Firestore işlemlerini merkezi olarak yöneten dosya
// Sadece sunucu tarafında (API route'larında) kullanmak üzere admin SDK ile Firestore işlemleri
import admin from '../firebase/firebaseAdmin';

// Firestore'a kullanıcıyı ekle/güncelle (server-side, admin ile)
export async function addUserToFirestore(user) {
  if (!user || !user.uid) return;

  const db = admin.firestore();

  // Email kontrolü - aynı email ile başka kullanıcı var mı?
  if (user.email) {
    const existingUserQuery = await db.collection('users')
      .where('email', '==', user.email)
      .limit(1)
      .get();

    // Eğer başka bir UID ile aynı email varsa hata fırlat
    if (!existingUserQuery.empty) {
      const existingDoc = existingUserQuery.docs[0];
      const existingUid = existingDoc.id;

      // Aynı kullanıcı değilse (farklı UID) hata
      if (existingUid !== user.uid) {
        console.warn(`⚠️  Email çakışması: ${user.email} zaten ${existingUid} tarafından kullanılıyor`);
        throw new Error(`Bu email adresi (${user.email}) zaten kayıtlı.`);
      }
    }
  }

  // Kullanıcıyı kaydet/güncelle
  await db.collection('users').doc(user.uid).set(user, { merge: true });
}

// Kullanıcıyı Firestore'dan getir
export async function getUserFromFirestore(uid) {
  if (!uid) return null;
  const db = admin.firestore();
  const ref = db.collection('users').doc(uid);
  const snap = await ref.get();
  return snap.exists ? snap.data() : null;
}

// Email ile kullanıcı bul
export async function getUserByEmail(email) {
  if (!email) return null;
  const db = admin.firestore();
  const querySnapshot = await db.collection('users')
    .where('email', '==', email)
    .limit(1)
    .get();

  if (querySnapshot.empty) return null;

  const doc = querySnapshot.docs[0];
  return {
    uid: doc.id,
    ...doc.data()
  };
}

// Kullanıcıyı güncelle
export async function updateUserInFirestore(uid, data) {
  if (!uid || !data) return;
  const db = admin.firestore();
  await db.collection('users').doc(uid).update(data);
}

// Kullanıcıyı sil
export async function deleteUserFromFirestore(uid) {
  if (!uid) return;
  const db = admin.firestore();
  await db.collection('users').doc(uid).delete();
}

// Kullanıcıları listele (opsiyonel örnek)
export async function listUsersFromFirestore() {
  const db = admin.firestore();
  const usersCol = db.collection('users');
  const usersSnap = await usersCol.get();
  return usersSnap.docs.map(doc => doc.data());
}

// Admin yardımcıları (opsiyonel)
export async function setUserAdmin(uid, isAdmin) {
  const db = admin.firestore();
  await db.collection('users').doc(uid).set({ isAdmin: !!isAdmin }, { merge: true });
  try {
    await admin.auth().setCustomUserClaims(uid, { admin: !!isAdmin });
  } catch {}
}

// Email ile kullanıcıyı upsert et (doc id olarak canonical uid kullanılır).
// Eğer email zaten farklı bir doc'ta varsa onu günceller; yoksa uid ile yeni doc oluşturur.
export async function upsertUserByEmail(user) {
  if (!user?.email) return null;
  const db = admin.firestore();

  const existing = await db.collection('users').where('email', '==', user.email).limit(1).get();

  // Eğer email var ise o doc'u güncelle
  if (!existing.empty) {
    const doc = existing.docs[0];
    const existingData = doc.data() || {};

    // isAdmin alanını koru: mevcut true ise, incoming false/undefined ile ezme
    const mergedIsAdmin =
      existingData.isAdmin === true ? true : (user.isAdmin ?? existingData.isAdmin ?? false);

    const merged = {
      ...user,
      uid: doc.id, // canonical uid
      isAdmin: mergedIsAdmin,
    };

    await db.collection('users').doc(doc.id).set(merged, { merge: true });
    return { uid: doc.id, ...existingData, ...merged };
  }

  // Email yoksa: uid varsa onu canonical olarak kullan
  if (!user.uid) return null;

  // Yeni kayıt için default isAdmin
  const newUser = {
    isAdmin: user.isAdmin ?? false,
    ...user,
  };

  await db.collection('users').doc(user.uid).set(newUser, { merge: true });
  return newUser;
}

