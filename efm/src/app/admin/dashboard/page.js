// src/app/admin/dashboard/page.js
'use client';

import { useAuth } from '../../../utils/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from "next/link";

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
        <p className="mb-4">Hoş geldiniz, {user.displayName || user.email}!</p>
      </main>
    </div>
  );
}
