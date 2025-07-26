'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

import GoogleAuthButton from '../../../components/GoogleAuthButton';
import { useAuth } from '../../../utils/context/AuthContext';
import { updateUserContext } from '../../../utils/context/updateUserContext';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, loading: authLoading, setUser } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/auth/profile');
    }
  }, [user, authLoading, router]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Kayıt başarılı! Giriş yapabilirsiniz.');
        toast.success('Kayıt başarılı! Giriş yapabilirsiniz.');
        setEmail('');
        setPassword('');
        setName('');
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
    <div className="min-h-screen flex items-center justify-center bg-background text-primary">
      <div className="max-w-md w-full p-8 bg-foreground rounded-2xl shadow-2xl flex flex-col items-center">
        <h1 className="text-3xl font-extrabold mb-2">Kayıt Ol</h1>
        <p className="mb-6 text-primary/70 text-center">Hemen kaydol, avantajlardan yararlanmaya başla!</p>
        <form className="w-full flex flex-col gap-5" onSubmit={handleRegister}>
          <div>
            <label htmlFor="name" className="block text-sm font-medium indent-2">Ad Soyad</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="indent-2 w-full border-b-1 border-primary focus:outline-none focus:border-secondary"
              placeholder="Adınızı girin"
              required
            />
          </div>
          <div>
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
          <div>
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
            {loading ? 'Kayıt Olunuyor...' : 'Kayıt Ol'}
          </button>
          {message && <div className={`mt-2 text-center ${message.includes('başarılı') ? 'text-green-600' : 'text-red-600'}`}>{message}</div>}
        </form>
        <div className="my-4 w-full flex items-center justify-center">
          <span className="text-gray-400">veya</span>
        </div>
        <GoogleAuthButton actionType="register" setMessage={setMessage} />
      </div>
    </div>
  );
}
