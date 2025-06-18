// utils/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// const firebaseConfig = {
//     apiKey: process.env.FIREBASE_API_KEY,
//     authDomain: process.env.FIREBASE_AUTH_DOMAIN,
//     projectId: process.env.FIREBASE_PROJECT_ID,
//     storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
//     messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
//     appId: process.env.FIREBASE_APP_ID,
// };
const firebaseConfig = {
    apiKey: "AIzaSyDIAfy5LA0b8sB4bev3zXvoJuCYQys7itQ",
    authDomain: "efm-db.firebaseapp.com",
    projectId: "efm-db",
    storageBucket: "efm-db.appspot.com",
    messagingSenderId: "153564736062",
    appId: "1:153564736062:web:bb778564fc67b66f5b7f6f",
    measurementId: "G-R5FHV7ZTHJ"
};
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
