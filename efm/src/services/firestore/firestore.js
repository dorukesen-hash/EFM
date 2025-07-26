// src/services/firestore/firestore.js
// Firestore işlemlerini merkezi olarak yöneten dosya
// Sadece sunucu tarafında (API route'larında) kullanılmak üzere admin SDK ile Firestore işlemleri
import admin from 'firebase-admin';

// Firestore'a kullanıcıyı ekle (server-side, admin ile)
export async function addUserToFirestore(user) {
  if (!user || !user.uid) return;
  const db = admin.firestore();
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
