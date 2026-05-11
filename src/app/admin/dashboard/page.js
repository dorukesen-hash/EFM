// src/app/admin/dashboard/page.js
'use client';

import { useAuth } from '../../../utils/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/auth/login');
      } else if (!user.isAdmin) {
        router.replace('/');
      }
    }
  }, [user, loading, router]);

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
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Yönetim Paneli</h2>
          <p className="text-sm text-gray-600 mb-6">
            Admin araçlarına erişim için sağ taraftaki menüyü kullanın.
          </p>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <p className="text-sm text-blue-800">
              <strong>Bilgi:</strong> Müşteri yorumları /api/reviews endpoint'i üzerinden serve edilmektedir ve manuel olarak güncellenebilir.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
