"use client";
import Link from "next/link";
import Image from "next/image";
import { toast } from 'react-toastify';
import { getAuth, signOut } from "firebase/auth";
import { useState } from 'react';

import { useAuth } from '../utils/context/AuthContext';
import app from "../services/firebase/firebaseConfig";
import icon from "../assets/lady.png";

const pageLinks = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/pages/about", label: "Hakkında" },
  { href: "/pages/contact", label: "İletişim" },
  { href: "/pages/blog", label: "Blog" },
  { href: "/pages/article", label: "Makaleler" },
  { href: "/pages/faq", label: "SSS" },
  { href: "/pages/services", label: "Hizmetler" },
];

export default function Navbar() {
  const { user, setUser, loading } = useAuth();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    const auth = getAuth(app);
    await signOut(auth);
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    toast.info("Başarıyla çıkış yaptınız.");
  };

  return (
    <>
      {/* Üst bilgi satırı: küçük ekranlarda gizli, md+ görünür */}
      <div className="w-full items-center justify-center bg-background hidden md:flex">
        <div className="w-full max-w-[1440px] min-h-[100px] px-4 page-container flex items-center justify-between text-text-main gap-4 text-sm bg-background">
          <div className="flex items-center gap-3">
            <Image src={icon} alt="icon" width={96} height={96} className="w-20 h-20" />
            <p className="font-bold whitespace-nowrap">Avukat ENVER FURKAN METE</p>
          </div>
          <a
            href="https://www.google.com/maps/search/?api=1&query=Müftü+Mahallesi+Atatürk+Caddesi+No:616/1+Rize+Adliyesi+Karşısı+Merkez+Rize"
            target="_blank"
            rel="noopener noreferrer"
            className="max-w-[360px] text-center hover:text-secondary transition-colors cursor-pointer"
          >
            Müftü Mahallesi Atatürk Caddesi<br/>
            Rize Adliyesi Karşısı No:616/1<br/>
            Merkez / Rize
          </a>
          <div className="flex flex-col text-text-effect min-w-[220px] items-end">
            <a href="tel:+905339490553" className="text-right px-2 py-1 hover:text-secondary hover:font-bold transition">Cep: 0533 949 05 53</a>
            <a href="tel:+905339490553" className="text-right px-2 py-1 hover:text-secondary hover:font-bold transition">Ofis: 0533 949 05 53</a>
            <a href="mailto:info@enverfurkanmete.av.tr" className="text-right px-2 py-1 hover:text-secondary hover:font-bold transition">Eposta: info@enverfurkanmete.av.tr</a>
          </div>
          <Link href="/pages/contact" className="bg-secondary text-white font-bold px-5 py-2 rounded-sm hover:bg-primary transition-colors">Hukuki Yardım Al</Link>
        </div>
      </div>

      {/* Mobil başlık çubuğu */}
      <div className="md:hidden sticky top-0 z-50 w-full bg-background border-b border-secondary">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <Image src={icon} alt="icon" width={40} height={40} className="w-8 h-8" />
            <span className="font-semibold text-sm">Av. Enver Furkan METE</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/pages/contact" className="hidden sm:inline-block bg-secondary text-white text-xs font-semibold px-3 py-1 rounded-sm">Yardım</Link>
            <button
              aria-label="Menüyü aç/kapat"
              aria-controls="mobile-menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="p-2 rounded-sm border border-secondary text-primary cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
        {open && (
          <div id="mobile-menu" className="px-4 pb-3 pt-2 bg-primary text-white space-y-2">
            <nav className="flex flex-col">
              {pageLinks.map((link) => (
                <Link key={link.href} href={link.href} className="py-2 px-2 rounded hover:bg-white/10">
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="pt-2 flex flex-col gap-1">
              {loading ? (
                <div className="w-28 h-5 bg-white/40 rounded" />
              ) : !user ? (
                <></>
              ) : (
                <>
                  <span className="text-secondary font-semibold">Hoşgeldin {user?.displayName || user?.email}</span>
                  <Link href="/auth/profile" className="py-2 px-2 rounded hover:bg-white/10">Profil</Link>
                  <button onClick={handleLogout} className="text-left py-2 px-2 rounded hover:bg-white/10 cursor-pointer">Çıkış Yap</button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigasyon çubuğu */}
      <nav className="w-full bg-primary text-white font-semibold flex flex-col items-center md:sticky md:top-0 md:z-50">
        <div className="hidden md:flex w-full max-w-[1440px] h-12 md:h-[60px] items-center justify-between px-4">
          {/* Sol: Sayfa linkleri (md+ görünür) */}
          <div className="hidden md:flex gap-2 lg:gap-4 items-center w-full justify-center">
            {pageLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="whitespace-nowrap h-full flex items-center justify-center px-3 lg:px-6 border-b-4 border-transparent hover:border-secondary transition-colors duration-300 hover:bg-white/10"
              >
                {link.label}
              </Link>
            ))}
            {loading ? (
              <div className="w-[120px] h-6 bg-gray-200 rounded animate-pulse" />
            ) : !user ? (
              <></>
            ) : (
              <>
                <span className="ml-2 text-secondary font-semibold capitalize hidden lg:inline">Hoşgeldin {user?.displayName || user?.email}</span>
                <Link
                  href="/auth/profile"
                  className="capitalize whitespace-nowrap h-full flex items-center justify-center px-4 lg:px-6 border-b-4 border-transparent hover:border-secondary transition-colors duration-300 hover:bg-white/10"
                >
                  Profil
                </Link>
                <button
                  onClick={handleLogout}
                  className="whitespace-nowrap h-full flex items-center justify-center px-4 lg:px-6 border-b-4 border-transparent hover:border-secondary transition-colors duration-300 hover:bg-white/10 cursor-pointer"
                >
                  Çıkış Yap
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobil iletişim bilgileri: navbar'ın mavi bölümünde */}
        <div className="md:hidden w-full bg-primary/90 border-t border-white/20">
          <div className="max-w-[1440px] mx-auto px-4 py-2 text-xs flex flex-col gap-2 text-center font-normal">
            <a
              href="https://www.google.com/maps/search/?api=1&query=Müftü+Mahallesi+Atatürk+Caddesi+No:616/1+Rize+Adliyesi+Karşısı+Merkez+Rize"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/90 hover:text-secondary transition-colors"
            >
               Müftü Mahallesi Atatürk Caddesi No:616/1 <br/> (Rize Adliyesi Karşısı) Merkez/Rize
            </a>
              <a href="tel:+905339490553" className="hover:text-secondary transition-colors">0533 949 05 53</a>
              <a href="mailto:info@enverfurkanmete.av.tr" className="hover:text-secondary transition-colors break-all">info@enverfurkanmete.av.tr</a>
          </div>
        </div>
      </nav>
    </>
  );
}
