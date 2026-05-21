"use client";

import Link from "next/link";
import { services } from "../app/pages/services/servicesData";
import { useEffect, useState } from "react";

export default function Footer() {
    const [articles, setArticles] = useState([]);
    useEffect(() => {
        fetch("/api/articles")
            .then(res => res.json())
            .then(data => setArticles(data.articles || []));
    }, []);


    return (
        <footer className="bg-primary text-white py-8 mt-8">
            <div className="max-w-[1440px] w-full page-container mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 items-start">
                {/* Site Haritası */}
                <div className="min-w-0 text-center md:text-left">
                    <h4 className="text-lg font-semibold mb-3">Site Haritası</h4>
                    <ul className="list-none space-y-2">
                        <li key="about"><Link href="/pages/about" className="block py-1 hover:text-secondary transition-colors duration-500">Hakkında</Link></li>
                        <li key="article"><Link href="/pages/article" className="block py-1 hover:text-secondary transition-colors duration-500">Hizmetler</Link></li>
                        <li key="blog"><Link href="/pages/blog" className="block py-1 hover:text-secondary transition-colors duration-500">Blog</Link></li>
                        <li key="contact"><Link href="/pages/contact" className="block py-1 hover:text-secondary transition-colors duration-500">İletişim</Link></li>
                        <li key="faq"><Link href="/pages/faq" className="block py-1 hover:text-secondary transition-colors duration-500">Sıkça Sorulan Sorular</Link></li>
                    </ul>
                </div>
                {/* Hizmetlerimiz */}
                <div className="min-w-0 text-center md:text-left">
                    <h4 className="text-lg font-semibold mb-3">Hizmetlerim</h4>
                    <ul className="list-none space-y-2">
                        {services.map(service => (
                            <li key={service.key}>
                              <Link href={`/pages/services#${service.key}`} className="block py-1 hover:text-secondary transition-colors duration-500">{service.title}</Link>
                            </li>
                        ))}
                    </ul>
                </div>
                {/* Makaleler */}
                <div className="min-w-0 text-center md:text-left">
                    <h4 className="text-lg font-semibold mb-3">Makaleler</h4>
                    <ul className="list-none space-y-2">
                        {articles.length > 0 ? (
                            articles.map((article, index) => (
                                <li key={article.id ?? index}>
                                  <Link href={`/pages/article/${article.slug}`} className="block py-1 hover:text-secondary transition-colors duration-500">{article.title}</Link>
                                </li>
                            ))
                        ) : (
                            <li key="placeholder" className="text-white text-xs">Makaleler dinamik olarak listeleniyor.</li>
                        )}
                    </ul>
                </div>
                {/* İletişim */}
                <div className="min-w-0 text-center md:text-left">
                    <h4 className="text-lg font-semibold mb-3">İletişim</h4>
                    <p className="py-1">Adres: Müftü Mahallesi Atatürk Caddesi No:616/1 (Rize Adliyesi Karşısı) Merkez/Rize</p>
                    <p className="py-1">Telefon: <a href="tel:+905339490553" className="hover:text-secondary transition-colors duration-500">0533 949 05 53</a></p>
                    <p className="py-1">Ofis: <a href="tel:+905339490553" className="hover:text-secondary transition-colors duration-500">0533 949 05 53</a></p>
                    <p className="py-1 flex flex-col items-center md:items-start sm:flex-row sm:flex-wrap gap-1">
                        <span className="shrink-0">E-posta:</span>
                        <a href="mailto:info@enverfurkanmete.av.tr" className="hover:text-secondary transition-colors duration-500 break-words inline-block max-w-full w-full sm:w-auto text-center sm:text-left">info@enverfurkanmete.av.tr</a>
                    </p>
                </div>
            </div>
            <div className="border-t-1 border-secondary/40 mt-6 pt-4 px-4 w-full">
                <p className="text-xs text-white/40 text-center leading-relaxed max-w-4xl mx-auto">
                    Rize'de hukuki danışmanlık hizmeti almak isteyen ve bunun için avukat arayan herkese Rize avukat ve hukuki danışmanlık verilmektedir. Rize Barosu avukatı Enver Furkan Mete olarak Rize, Artvin, Arhavi, Hopa, Pazar, Trabzon, Of, Giresun, Ordu il, ilçe ve çevrelerine avukatlık hizmeti vermekteyim. Beni iş hukuku, aile hukuku ve boşanma davaları, arazi ve miras davaları, kira ve ceza davaları için arayabilir ve soru sorabilirsiniz. Rize boşanma avukatı, Rize ağır ceza avukatı, Rize kira avukatı, Rize arazi avukatı, Rize iş avukatı, Rize gayrimenkul avukatı, Rize miras avukatı, Hopa ağır ceza avukatı, Arhavi ağır ceza avukatı ve hukuki olarak destek almak istediğiniz her türlü konuda bana ulaşabilirsiniz.
                </p>
            </div>
            <div className="text-center text-sm text-neutral pt-4 px-4 w-full">
                &copy; {new Date().getFullYear()} Av. Enver Furkan Mete. Tüm hakları saklıdır.
            </div>
        </footer>
    )
}
