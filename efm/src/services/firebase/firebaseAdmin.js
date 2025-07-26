// src/services/firebase/firebaseAdmin.js
// Firebase Admin SDK ile sunucu tarafı işlemler için başlatma
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

let serviceAccount;
if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64) {
  // Base64 ile encode edilmiş json stringini decode et
  const decoded = Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64, 'base64').toString('utf8');
  serviceAccount = JSON.parse(decoded);
} else {
  // Dosya yolundan oku
  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || 'serviceAccountKey.json';
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
}
console.log(serviceAccount);
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
  });
}

export default admin;
