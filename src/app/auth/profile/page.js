'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { signOut } from 'next-auth/react';

import { useAuth } from '../../../utils/context/AuthContext';
import SampleButton from "../../../components/SampleButton";
import Image from "next/image";
import Link from "next/link";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    try {
      await signOut({
        redirect: true,
        callbackUrl: '/auth/login'
      });
    } catch (err) {
      console.error('Logout error:', err);
      toast.error('Çıkış sırasında bir hata oluştu!');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Yükleniyor...</div>;
  }

  if (!user) {
    return null;
  }

  return (
      <div className="w-full h-full min-h-screen pt-20 bg-foreground">
        <div className="max-w-md mx-auto p-8 bg-white rounded-xl shadow-md flex flex-col items-center">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">Profilim</h1>
          <SampleButton/>
          <div className="w-full flex flex-col gap-4">
            <div>
              <span className="font-semibold">Ad Soyad:</span> {user.name || '-'}
            </div>
            <div>
              <span className="font-semibold">Email:</span> {user.email}
            </div>
            {user.image && (
                <div className="flex flex-col items-center mt-4">
                  <Image src={user.image} alt="Profil Fotoğrafı" width={24} height={24} className="w-24 h-24 rounded-full border" />
                </div>
            )}
            <div className="mt-6 text-sm text-gray-500">Bu sayfada profil bilgilerinizi görüntüleyebilirsiniz.</div>
          </div>
          <div className="mt-4">
            {user.isAdmin && (
                <Link
                    href="/admin/dashboard"
                    className="bg-primary  text-white font-semibold py-2 px-6 transition cursor-pointer mb-4"
                >
                  Admin Dashboard
                </Link>
            )}
          </div>
          <button
              onClick={handleLogout}
              className="mt-6 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 transition cursor-pointer"
          >
            Çıkış Yap
          </button>
        </div>
      </div>
  );
}
