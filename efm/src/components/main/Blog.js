"use client";

import Link from "next/link";
import { useState } from "react";

const articles = [
    {
        id: 1,
        title: "Ticaret Hukukunda Güncel Gelişmeler",
        summary: "Ticaret hukukunda son dönemde yaşanan önemli değişiklikler ve uygulamalar, şirketlerin işleyişini ve ticari ilişkilerini doğrudan etkilemektedir. Özellikle yeni çıkan mevzuatlar, ticari sözleşmelerin hazırlanmasında ve uygulanmasında dikkat edilmesi gereken hususları artırmıştır. Bu makalede, ticaret hukukunda öne çıkan başlıklar, uygulamada karşılaşılan sorunlar ve çözüm önerileri detaylı şekilde ele alınmaktadır. Ayrıca, ticari davalarda güncel Yargıtay kararları ve bunların iş dünyasına etkileri de incelenmektedir.",
        image: "/assets/areas/ticaret.webp",
        slug: "ticaret-hukukunda-guncel-gelismeler"
    },
    {
        id: 2,
        title: "Aile Hukukunda Sıkça Sorulan Sorular",
        summary: "Aile hukuku, toplumun temel yapı taşı olan aileyi korumaya yönelik düzenlemeleri içermektedir. Boşanma, velayet, nafaka ve mal paylaşımı gibi konular aile hukukunun en çok merak edilen başlıkları arasında yer alır. Bu makalede, aile hukukunda sıkça karşılaşılan sorulara yanıtlar verilmekte ve uygulamada dikkat edilmesi gereken noktalar açıklanmaktadır. Ayrıca, güncel yargı kararları ışığında hak arama yolları ve pratik öneriler de sunulmaktadır.",
        image: "/assets/areas/aile.jpg",
        slug: "aile-hukukunda-sikca-sorulan-sorular"
    },
    {
        id: 3,
        title: "KVKK ve Kişisel Verilerin Korunması",
        summary: "Kişisel verilerin korunması, günümüz dijital çağında hem bireyler hem de kurumlar için büyük önem taşımaktadır. KVKK kapsamında veri sorumlularının yükümlülükleri, veri işleme süreçleri ve olası ihlallerde uygulanacak yaptırımlar detaylı olarak düzenlenmiştir. Bu makalede, KVKK'nın temel ilkeleri, uyum süreçleri ve veri güvenliğini sağlamak için alınması gereken önlemler kapsamlı şekilde ele alınmaktadır. Ayrıca, veri ihlali durumunda yapılması gerekenler ve başvuru yolları da açıklanmaktadır.",
        image: "/assets/areas/kvkk.jpg",
        slug: "kvkk-ve-kisisel-verilerin-korunmasi"
    }
];

// Basit bir carousel için tailwind ile yatay scroll ve snap kullanıldı
export default function Blog() {
    const [current, setCurrent] = useState(0);
    const total = articles.length;
    const prev = () => setCurrent((c) => (c - 1 + total) % total);
    const next = () => setCurrent((c) => (c + 1) % total);

    const article = articles[current];

    return (
        <section className=" relative max-w-[1440px] w-full page-container flex flex-col items-center justify-center text-primary pt-20 md:pt-30 pb-16 md:pb-20 bg-white">
            <h2 className="text-3xl font-bold mb-8">Makaleler</h2>
            <div className="w-full flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 ">
                {/* Sol ok: sadece md+ */}
                <button onClick={prev} aria-label="Önceki" className="hidden md:flex order-2 md:order-1 group w-10 h-10 items-center justify-center text-2xl bg-transparent cursor-pointer">
                    <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                        width="512.000000pt" height="512.000000pt" viewBox="0 0 512.000000 512.000000"
                        preserveAspectRatio="xMidYMid meet"
                        className="w-6 h-6 md:w-7 md:h-7 transition-colors duration-300 group-hover:fill-secondary fill-primary">
                        <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)" stroke="none">
                            <path d="M3515 5100 c-44 -18 -189 -159 -1228 -1197 -952 -951 -1184 -1188
                                -1203 -1228 -18 -37 -24 -67 -24 -115 0 -132 -74 -50 1223 -1346 1123 -1123
                                1174 -1173 1230 -1193 73 -27 131 -27 204 1 48 17 77 40 174 137 144 143 163
                                177 164 286 0 58 -5 91 -19 120 -13 27 -333 355 -995 1018 l-976 977 977 978
                                c537 537 984 993 994 1012 9 19 19 67 22 106 7 110 -20 160 -166 305 -98 97
                                -127 119 -175 137 -71 27 -136 27 -202 2z"/>
                        </g>
                    </svg>
                </button>
                <div className="order-1 md:order-none w-full md:w-[75%] flex flex-col items-center bg-foreground rounded-md shadow-lg p-6 md:p-8">
                    <h3 className="text-2xl font-bold mb-4 text-center max-w-3xl">{article.title}</h3>
                    <div className="mb-4 text-center">Yazar: Enver Furkan METE</div>
                    <p className="w-full md:w-[80%] mb-6 text-center line-clamp-5">{article.summary}</p>
                    <Link href={`/pages/article/${article.slug}`} className="text-primary font-bold underline hover:text-secondary transition-colors">Devamını Oku</Link>
                </div>
                {/* Sağ ok: sadece md+ */}
                <button onClick={next} aria-label="Sonraki" className="hidden md:flex order-3 group w-10 h-10 items-center justify-center text-2xl bg-transparent cursor-pointer">
                    <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                        width="512.000000pt" height="512.000000pt" viewBox="0 0 512.000000 512.000000"
                        preserveAspectRatio="xMidYMid meet"
                        className="w-6 h-6 md:w-7 md:h-7 transition-colors duration-300 group-hover:fill-secondary fill-primary">
                        <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)" stroke="none">
                            <path d="M1400 5098 c-44 -17 -77 -44 -171 -137 -144 -143 -163 -177 -164
                                -286 0 -58 5 -91 19 -120 13 -27 333 -355 995 -1018 l976 -977 -977 -978
                                c-760 -760 -982 -987 -997 -1022 -14 -30 -21 -67 -21 -110 0 -103 29 -153 168
                                -291 98 -97 127 -119 175 -137 73 -28 131 -28 204 -1 56 20 108 71 1230 1193
                                1297 1296 1223 1214 1223 1346 0 132 74 50 -1223 1346 -1123 1123 -1174 1173
                                -1230 1193 -72 26 -136 26 -207 -1z"/>
                        </g>
                    </svg>
                </button>

                {/* Mobil kontrol çubuğu: içerik altında oklar yan yana */}
                <div className="order-2 md:hidden w-full flex items-center justify-center gap-6">
                    <button onClick={prev} aria-label="Önceki" className="group w-9 h-9 flex items-center justify-center rounded-full bg-foreground/80 cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-primary group-active:scale-95 transition-transform">
                            <path fillRule="evenodd" d="M15.78 5.22a.75.75 0 010 1.06L10.06 12l5.72 5.72a.75.75 0 11-1.06 1.06l-6.25-6.25a.75.75 0 010-1.06l6.25-6.25a.75.75 0 011.06 0z" clipRule="evenodd" />
                        </svg>
                    </button>
                    <button onClick={next} aria-label="Sonraki" className="group w-9 h-9 flex items-center justify-center rounded-full bg-foreground/80 cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-primary group-active:scale-95 transition-transform">
                            <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 000 1.06L13.94 12l-5.72 5.72a.75.75 0 101.06 1.06l6.25-6.25a.75.75 0 000-1.06L9.28 5.22a.75.75 0 00-1.06 0z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        </section>
    );
}
