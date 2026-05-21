"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Blog() {
    const [articles, setArticles] = useState([]);
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        fetch("/api/articles")
            .then(res => res.json())
            .then(data => setArticles(data.articles || []));
    }, []);

    const total = articles.length;
    const prev = () => setCurrent((c) => (c - 1 + total) % total);
    const next = () => setCurrent((c) => (c + 1) % total);

    const article = articles[current];

    if (!article) return null;

    return (
        <section className=" relative max-w-[1440px] w-full page-container flex flex-col items-center justify-center text-primary pt-20 md:pt-30 pb-16 md:pb-20 bg-white">
            <h2 className="text-3xl font-bold mb-8">Makaleler</h2>
            <div className="w-full flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 ">
                {/* Sol ok: md+ üzerinde kart içine taşındı */}

                {/* Kart içeriği ve md+ oklar */}
                <div className="order-1 md:order-none w-full md:w-[75%] relative flex flex-col items-center bg-foreground rounded-md shadow-lg p-6 md:p-8">
                    {/* md+ sol ok */}
                    <button onClick={prev} aria-label="Önceki" className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-white/80 text-primary shadow hover:bg-white transition">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                            <path fillRule="evenodd" d="M15.78 5.22a.75.75 0 010 1.06L10.06 12l5.72 5.72a.75.75 0 11-1.06 1.06l-6.25-6.25a.75.75 0 010-1.06l6.25-6.25a.75.75 0 011.06 0z" clipRule="evenodd" />
                        </svg>
                    </button>

                    {/* md+ sağ ok */}
                    <button onClick={next} aria-label="Sonraki" className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-white/80 text-primary shadow hover:bg-white transition">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                            <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 000 1.06L13.94 12l-5.72 5.72a.75.75 0 101.06 1.06l6.25-6.25a.75.75 0 000-1.06L9.28 5.22a.75.75 0 00-1.06 0z" clipRule="evenodd" />
                        </svg>
                    </button>

                    {/* Kart içeriği */}
                    <h3 className="text-2xl font-bold mb-4 text-center max-w-3xl">{article.title}</h3>
                    <div className="mb-4 text-center">Yazar: Enver Furkan METE</div>
                    <p className="w-full md:w-[80%] mb-6 text-center line-clamp-5">{article.description}</p>
                    <Link href={`/pages/article/${article.slug}`} className="text-primary font-bold underline hover:text-secondary transition-colors">Devamını Oku</Link>
                </div>

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
