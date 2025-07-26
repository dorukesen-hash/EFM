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
      {/* Sol Navigasyon */}
      <aside className="w-56 bg-gray-900 text-white flex flex-col py-8 px-4 min-h-screen">
        <a href="/" className="mb-8 text-lg font-bold text-blue-400 hover:text-blue-200 transition">Anamenü</a>
        {/* Diğer admin linkleri eklenebilir */}
      </aside>
      {/* Ana İçerik */}
      <main className="flex-1 flex flex-col items-center justify-start p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Paneli</h1>
        <p className="mb-4">Hoş geldiniz, {user.displayName || user.email}!</p>
        <div className="w-full flex flex-col gap-4">
          <a href="/admin/users" className="text-blue-600 underline">Kullanıcı Yönetimi</a>
          <a href="/admin/articles" className="text-blue-600 underline">Makale Yönetimi</a>
          <a href="/admin/blogs" className="text-blue-600 underline">Blog Yönetimi</a>
        </div>
      </main>
    </div>
  );
}
