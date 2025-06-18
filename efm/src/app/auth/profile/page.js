// auth/profile/page.js

'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/utils/UserContext';

export default function ProfilePage() {
    const router = useRouter();
    const { user, loading, updateUser } = useUser();
    const [message, setMessage] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        if (user) {
            console.log('User context:', user);
            setDisplayName(user.displayName || '');
            setEmail(user.email || '');
            setIsAdmin(user.isAdmin || false);
        }
    }, [user]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setMessage('');
        const updateData = { displayName, email, password, isAdmin };
        const { ok, data } = await updateUser(updateData);
        if (ok) {
            setMessage('Bilgiler başarıyla güncellendi.');
            setPassword('');
        } else {
            setMessage(data.error || 'Bir hata oluştu.');
        }
    };

    const handleLogout = async () => {
        await fetch('/api/logout', { method: 'POST', credentials: 'include' });
        router.replace('/auth/login');
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[40vh]">
                <div className="text-lg text-gray-700 mb-2">Yükleniyor...</div>
            </div>
        );
    }
    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[40vh]">
                <div className="text-lg text-gray-700 mb-2">Kullanıcı bulunamadı.</div>
                {message && <div className="text-red-600 bg-red-100 border border-red-300 rounded px-4 py-2 mt-2 text-center">{message}</div>}
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded-xl shadow-md flex flex-col items-center">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Profil</h1>
            {user.isAdmin && (
                <button
                    onClick={() => router.push('/auth/admin')}
                    className="mb-4 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-6 rounded-md transition"
                >
                    Admin Paneline Git
                </button>
            )}
            <form onSubmit={handleUpdate} className="w-full flex flex-col gap-4">
                <div>
                    <label htmlFor="displayName" className="block text-gray-700 mb-1">İsim</label>
                    <input
                        id="displayName"
                        type="text"
                        value={displayName}
                        onChange={e => setDisplayName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
                <div>
                    <label htmlFor="email" className="block text-gray-700 mb-1">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-gray-700 mb-1">Yeni Şifre</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Şifreyi değiştirmek için doldurun"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-gray-700">Admin:</label>
                    <input
                        type="checkbox"
                        checked={isAdmin}
                        onChange={e => setIsAdmin(e.target.checked)}
                        className="accent-blue-600 w-4 h-4"
                    />
                </div>
                <button type="submit" className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition">Güncelle</button>
            </form>
            {message && <div className="mt-4 text-green-700 bg-green-100 border border-green-300 rounded px-4 py-2 w-full text-center">{message}</div>}
            <button onClick={handleLogout} className="mt-6 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-md transition">Çıkış Yap</button>
        </div>
    );
}