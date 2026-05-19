"use client";

import Link from "next/link";

export default function AdminNavbar() {

    return (
        <div className="fixed h-full top-0 flex min-h-screen">
            <aside className="w-[240px] bg-gray-900 text-white flex flex-col py-8 px-4 min-h-screen">
                <h2 className="mb-8">BHM Hukuk Admin Panel</h2>
                <Link href="/admin/dashboard" className="mb-8 text-lg font-bold text-blue-400 hover:text-blue-200 transition">Dashboard</Link>
                <Link href="/admin/articles" className="mb-8 text-lg font-bold text-blue-400 hover:text-blue-200 transition">Makaleler</Link>
                <Link href="/admin/blogs" className="mb-8 text-lg font-bold text-blue-400 hover:text-blue-200 transition">Blog</Link>
                <Link href="/admin/users" className="mb-8 text-lg font-bold text-blue-400 hover:text-blue-200 transition">Kullanıcılar</Link>
                <Link href="/admin/images" className="mb-8 text-lg font-bold text-blue-400 hover:text-blue-200 transition">Resimler</Link>
                <Link href="/" className="mt-auto text-lg font-bold text-green-400 hover:text-green-200 transition">Ana Sayfaya Git</Link>
            </aside>
        </div>
    );
}
