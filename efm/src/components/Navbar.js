"use client";
import Link from "next/link";
import Image from "next/image";
import { toast } from 'react-toastify';
import { getAuth, signOut } from "firebase/auth";

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

  const handleLogout = async () => {
    const auth = getAuth(app);
    await signOut(auth);
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    toast.info("Başarıyla çıkış yaptınız.");
  };

  return (
    <>
      <div className="w-full flex items-center justify-center bg-background">
        <div className="w-full max-w-[1440px] h-[140px] flex items-center justify-center text-text-main gap-6 text-[14px] bg-background">
          <Image src={icon} alt="icon" width={120} height={120} />
          <p className="font-bold">Avukat ENVER FURKAN METE</p>
          <h3 className="w-[260px] border-red-700 text-center">Müftü Mahallesi Atatürk Caddesi<br/>
            Rize Adliyesi Karşısı No:616/1<br/>
            Merkez / Rize
          </h3>
          <div className="flex flex-col text-text-effect w-[260px]">
            <a href="tel:+90 533 949 05 53" className="text-center px-2 py-1 hover:text-secondary hover:font-bold transition duration-100">Cep: 0533 949 05 53</a>
            <a href="tel:+90 533 949 05 53" className="text-center px-2 py-1 hover:text-secondary hover:font-bold transition duration-100">Ofis: 0533 949 05 53</a>
            <a href="mailto:info@enverfurkanmete.av.tr" className="text-center px-2 py-1 hover:text-secondary hover:font-bold transition duration-100">Eposta: info@enverfurkanmete.av.tr</a>
          </div>
          <Link href="/pages/contact"
                className="bg-secondary text-white font-bold  px-8 py-2 hover:bg-primary hover:text-white transition-colors duration-300">
            Hukuki Yardım Al</Link>
        </div>
      </div>
      <nav className="w-full h-[60px] bg-primary text-white font-semibold flex flex-col items-center sticky top-0 z-50">
          <div className="w-full max-w-[1440px] h-full flex justify-between">
            <div className="flex gap-4 items-center w-full justify-between max-w-[800px]">
              {pageLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className=" whitespace-nowrap h-full flex items-center justify-center px-8 border-b-4 border-transparent hover:border-secondary transition-colors duration-300 hover:bg-white/10"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="flex gap-2 items-center">
              {loading ? (
                <div className="w-[120px] h-6 bg-gray-200 rounded animate-pulse" />
              ) : !user ? (
                  <>
                    <Link
                        href="/auth/register"
                        className=" whitespace-nowrap h-full flex items-center justify-center px-8 border-b-4 border-transparent hover:border-secondary transition-colors duration-300 hover:bg-white/10"

                    >
                      Kayıt Ol
                    </Link>
                    <Link
                        href="/auth/login"
                        className=" whitespace-nowrap h-full flex items-center justify-center px-8 border-b-4 border-transparent hover:border-secondary transition-colors duration-300 hover:bg-white/10"

                    >
                      Giriş Yap
                    </Link>
                  </>
              ) : (
                  <>
                    {user.isAdmin && (
                        <Link
                            href="/admin/dashboard"
                            className=" whitespace-nowrap h-full flex items-center justify-center px-8 border-b-4 border-transparent hover:border-secondary transition-colors duration-300 hover:bg-white/10"

                        >
                          Admin Panel
                        </Link>
                    )}
                    <span className="ml-2 text-secondary font-semibold capitalize">Hoşgeldin {user?.displayName || user?.email}</span>
                    <Link
                        href="/auth/profile"
                        className="capitalize whitespace-nowrap h-full flex items-center justify-center px-8 border-b-4 border-transparent hover:border-secondary transition-colors duration-300 hover:bg-white/10"
                    >
                      Profil
                    </Link>
                    <button
                        onClick={handleLogout}
                        className=" whitespace-nowrap h-full flex items-center justify-center px-8 border-b-4 border-transparent hover:border-secondary transition-colors duration-300 hover:bg-white/10 cursor-pointer"
                    >
                      Çıkış Yap
                    </button>
                  </>
              )}
            </div>
          </div>
      </nav>
    </>
  );
}
