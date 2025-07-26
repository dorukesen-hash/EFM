// src/components/GoogleAuthButton.js
'use client';

import { useState, useEffect } from 'react';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { toast } from 'react-toastify';

import { useAuth } from '../utils/context/AuthContext';
import { updateUserContext } from '../utils/context/updateUserContext';

export default function GoogleAuthButton({ actionType = 'login', setMessage }) {
  const [loading, setLoading] = useState(false);
  const [firebaseReady, setFirebaseReady] = useState(false);
  const { setUser } = useAuth();

  useEffect(() => {
    setFirebaseReady(true);
  }, []);

  const handleGoogleAuth = async () => {
    setLoading(true);
    setMessage && setMessage('');
    try {
      const auth = getAuth(); // app parametresi olmadan çağırmak daha güvenli
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage && setMessage('Google ile giriş başarılı!');
        toast.success('Google ile giriş başarılı!');
        // Context'i güncelle
        await updateUserContext(setUser);
      } else {
        setMessage && setMessage(data.error || 'Bir hata oluştu.');
        toast.error(data.error || 'Bir hata oluştu.');
      }
    } catch (err) {
      setMessage && setMessage('Google ile giriş başarısız.');
      toast.error('Google ile giriş başarısız.');
    }
    setLoading(false);
  };

  return (
    <button
      type="button"
      onClick={handleGoogleAuth}
      className="w-full flex items-center justify-center gap-2 bg-white border-1 border-primary hover:border-secondary text-primary font-semibold py-2 transition cursor-pointer hover:bg-secondary/40"
      disabled={loading || !firebaseReady}
    >
      <svg width="20" height="20" viewBox="0 0 48 48" fill="none"><g><path d="M44.5 20H24V28.5H36.9C35.5 33.1 31.2 36.5 24 36.5C16.3 36.5 10 30.2 10 22.5C10 14.8 16.3 8.5 24 8.5C27.3 8.5 30.2 9.7 32.4 11.7L38.1 6C34.3 2.6 29.5 0.5 24 0.5C11.8 0.5 2 10.3 2 22.5C2 34.7 11.8 44.5 24 44.5C36.2 44.5 46 34.7 46 22.5C46 21.1 45.8 20.5 45.5 20.5L44.5 20Z" fill="#FFC107"/><path d="M6.3 14.7L13.1 19.6C15.1 15.2 19.2 12.1 24 12.1C26.7 12.1 29.1 13.1 31 14.7L37.1 9.1C33.7 5.9 29.1 3.9 24 3.9C16.3 3.9 10 10.2 10 17.9C10 19.2 10.2 20.4 10.5 21.5L6.3 14.7Z" fill="#FF3D00"/><path d="M24 44.1C29.1 44.1 33.7 42.1 37.1 38.9L31 33.3C29.1 34.9 26.7 35.9 24 35.9C19.2 35.9 15.1 32.8 13.1 28.4L6.3 33.3C10.2 39.1 16.3 44.1 24 44.1Z" fill="#4CAF50"/><path d="M44.5 20H24V28.5H36.9C36.2 31.1 34.5 33.1 32.4 34.3L38.1 39.9C41.2 36.9 43.5 32.7 44.5 28.5L44.5 20Z" fill="#1976D2"/></g></svg>
      {loading ? 'Google ile işleniyor...' : 'Google ile ' + (actionType === 'register' ? 'Kayıt Ol' : 'Giriş Yap')}
    </button>
  );
}
