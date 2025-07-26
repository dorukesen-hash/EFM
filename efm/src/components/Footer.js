import Link from "next/link";
import { services } from "@/app/pages/services/servicesData";

export default function Footer() {


    return (
        <footer className="bg-primary text-white py-8 mt-8">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row flex-wrap justify-between items-start">
                {/* Site Haritası */}
                <div className="flex-1 min-w-[180px] mb-4 text-center ">
                    <h4 className="text-lg font-semibold mb-3">Site Haritası</h4>
                    <ul className="list-none space-y-2 w-full h-full flex flex-col items-center">
                        <li><Link href="/pages/about" className="w-full py-1 h-full text-white hover:text-secondary transition-all transition-500">Hakkımızda</Link></li>
                        <li><Link href="/pages/article" className="w-full py-1 h-full text-white hover:text-secondary transition-all transition-500">Hizmetler</Link></li>
                        <li><Link href="/pages/blog" className="w-full py-1 h-full text-white hover:text-secondary transition-all transition-500">Blog</Link></li>
                        <li><Link href="/pages/contact" className="w-full py-1 h-full text-white hover:text-secondary transition-all transition-500">İletişim</Link></li>
                        <li><Link href="/pages/faq" className="w-full py-1 h-full text-white hover:text-secondary transition-all transition-500">Sıkça Sorulan Sorular</Link></li>
                    </ul>
                </div>
                {/* Hizmetlerimiz */}
                <div className="flex-1 min-w-[180px] mb-4 text-center">
                    <h4 className="text-lg font-semibold mb-3">Hizmetlerimiz</h4>
                    <ul className="list-none space-y-2 w-full h-full flex flex-col items-center">
                        {services.map(service => (
                            <a key={service.key} href={`/pages/services#${service.key}`} className="w-full py-1 h-full text-white hover:text-secondary transition-all transition-500">{service.title}</a>
                        ))}
                    </ul>
                </div>
                {/* Makaleler */}
                <div className="flex-1 min-w-[180px] mb-4 text-center ">
                    <h4 className="text-lg font-semibold mb-3">Makaleler</h4>
                    <ul className="list-none space-y-2 w-full h-full flex flex-col items-center">
                        {require("@/app/pages/article/articles.js").default.map(article => (
                            <a key={article.slug} href={`/pages/article/${article.slug}`} className="w-full py-1 h-full text-white hover:text-secondary transition-all transition-500">{article.title}</a>
                        ))}
                    </ul>
                </div>
                {/* İletişim */}
                <div className="flex-1 mb-4 text-center ">
                    <h4 className="text-lg font-semibold mb-3">İletişim</h4>
                    <p className="w-full py-1 h-full text-white ">Adres: Müftü Mahallesi Atatürk Caddesi No:616/1 (Rize Adliyesi Karşısı) Merkez/Rize</p>
                    <p className="w-full py-1 h-full text-white ">Telefon: <a href="tel:+905339490553" className="text-white hover:text-secondary transition">0533 949 05 53</a></p>
                    <p className="w-full py-1 h-full text-white ">Ofis: <a href="tel:+905339490553" className="text-white hover:text-secondary transition">0533 949 05 53</a></p>
                    <p className="w-full py-1 h-full text-white ">E-posta: <a href="mailto:info@enverfurkanmete.av.tr" className="text-white hover:text-secondary transition">info@enverfurkanmete.av.tr</a></p>
                </div>
            </div>
            <div className="text-center text-sm text-neutral border-t-1 border-secondary pt-4">
                &copy; {new Date().getFullYear()} EFM Avukatlık Bürosu. Tüm hakları saklıdır.
            </div>
        </footer>
    )
}
