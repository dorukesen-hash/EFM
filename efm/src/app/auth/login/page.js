'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

import GoogleAuthButton from '../../../components/GoogleAuthButton';
import { useAuth } from '../../../utils/context/AuthContext';
import { updateUserContext } from '../../../utils/context/updateUserContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, loading: authLoading, setUser } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/auth/profile');
    }
  }, [user, authLoading, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Giriş başarılı!');
        toast.success('Giriş başarılı!');
        setEmail('');
        setPassword('');
        await updateUserContext(setUser);
        setTimeout(() => router.push('/'), 1000);
      } else {
        setMessage(data.error || 'Bir hata oluştu.');
        toast.error(data.error || 'Bir hata oluştu.');
      }
    } catch (err) {
      setMessage('Bir hata oluştu.');
      toast.error('Bir hata oluştu.');
    }
    setLoading(false);
  };

  return (
      <div className="bg-foreground w-full h-full min-h-screen pt-20">
        <div className="max-w-md mx-auto p-8 bg-white rounded-xl shadow-md flex flex-col items-center">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">Giriş Yap</h1>
          <form className="w-full flex flex-col gap-4" onSubmit={handleLogin}>
            <div className="w-full max-w-[400px]">
              <label htmlFor="email" className="block text-sm font-medium indent-2">Email</label>
              <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="indent-2 w-full border-b-1 border-primary focus:outline-none focus:border-secondary"
                  placeholder="Email adresinizi girin"
                  required
              />
            </div>
            <div className="w-full max-w-[400px]">
              <label htmlFor="password" className="block text-sm font-medium indent-2">Şifre</label>
              <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="indent-2 w-full border-b-1 border-primary focus:outline-none focus:border-secondary"
                  placeholder="Şifrenizi girin"
                  required
              />
            </div>
            <button
                type="submit"
                className="mt-2 bg-primary hover:bg-secondary text-white font-semibold py-2 transition cursor-pointer"
                disabled={loading}
            >
              {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </button>
            {message && <div className={`mt-2 text-center ${message.includes('başarılı') ? 'text-green-600' : 'text-red-600'}`}>{message}</div>}
          </form>
          <div className="my-4 w-full flex items-center justify-center">
            <span className="text-gray-400">veya</span>
          </div>
          <GoogleAuthButton actionType="login" setMessage={setMessage} />
        </div>
      </div>

  );
}
