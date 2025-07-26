// src/services/firebase/firebaseAdmin.js
// Firebase Admin SDK ile sunucu tarafı işlemler için başlatma
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Service account dosyasının yolu .env'den alınır
const serviceAccountPath = '../../serviceAccountKey.json';
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
console.log(serviceAccount);
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
  });
}

export default admin;
