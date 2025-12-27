// src/app/admin/dashboard/page.js
'use client';

import { useAuth } from '../../../utils/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [gbpStatus, setGbpStatus] = useState({ loading: true, connected: false });

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/auth/login');
      } else if (!user.isAdmin) {
        router.replace('/');
      }
    }
  }, [user, loading, router]);

  useEffect(() => {
    fetch('/api/admin/gbp/oauth/status')
      .then(r => r.json())
      .then(json => setGbpStatus({ loading: false, connected: !!json.connected, meta: json }))
      .catch(() => setGbpStatus({ loading: false, connected: false }));
  }, []);

  if (loading || !user || !user.isAdmin) {
    return <div className="flex justify-center items-center h-64">Yükleniyor...</div>;
  }

  return (
    <div className="flex min-h-screen">
      {/* Ana İçerik */}
      <main className="flex-1 flex flex-col items-center justify-start p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Paneli</h1>
        <p className="mb-8">Hoş geldiniz, {user.displayName || user.email}!</p>

        <div className="w-full max-w-2xl bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-2 text-gray-800">Google İşletme Yorumları</h2>
          <p className="text-sm text-gray-600 mb-4">
            Ana sayfadaki yorumları Google Business Profile hesabınızdan çekmek için bir kere yetkilendirme yapmanız gerekir.
          </p>

          {gbpStatus.loading ? (
            <div className="text-gray-600">Durum kontrol ediliyor...</div>
          ) : gbpStatus.connected ? (
            <div className="text-green-700 font-semibold">Bağlandı ✅</div>
          ) : (
            <div className="text-yellow-700 font-semibold">Bağlı değil</div>
          )}

          <div className="mt-5 flex gap-3">
            <a
              href="/api/admin/gbp/oauth/start"
              className="bg-primary text-white font-semibold py-2 px-4 cursor-pointer"
            >
              Google ile Yetkilendir
            </a>
            <a
              href="/api/reviews?limit=3"
              target="_blank"
              rel="noreferrer"
              className="bg-secondary text-white font-semibold py-2 px-4 cursor-pointer"
            >
              /api/reviews Test
            </a>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            Not: Yetkilendirme sonunda bu sayfaya &quot;gbp=connected&quot; parametresiyle dönersiniz.
          </p>
        </div>
      </main>
    </div>
  );
}
