"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ArticlePage() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/articles")
            .then((res) => res.json())
            .then((data) => setArticles(data.articles || []))
            .catch(() => setArticles([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="bg-background text-primary flex flex-col items-center min-h-screen">
            {/* Hero Section */}
            <section className="max-w-[1440px] w-full bg-foreground text-primary py-16 md:py-24 border-b-1 border-secondary">
                <div className="container mx-auto px-3 md:px-4 flex items-center justify-center flex-col text-center">
                    <h1 className="text-3xl md:text-6xl font-bold tracking-tight mb-2 md:mb-4">
                        Makaleler
                    </h1>
                    <p className="text-sm md:text-base text-primary/70 max-w-2xl">
                        Hukuk ve güncel konularda paylaştığımız makaleleri keşfedin.
                    </p>
                </div>
            </section>

            {/* Articles Grid */}
            <section className="max-w-[1440px] w-full container mx-auto px-3 md:px-4 py-10 md:py-16">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {/* Lightweight skeleton cards */}
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="animate-pulse border-1 border-gray-300 bg-foreground rounded-md overflow-hidden"
                            >
                                <div className="w-full h-40 md:h-56 bg-gray-200" />
                                <div className="p-6 space-y-3">
                                    <div className="h-5 w-3/4 bg-gray-200" />
                                    <div className="h-4 w-full bg-gray-200" />
                                    <div className="h-4 w-5/6 bg-gray-200" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : articles.length === 0 ? (
                    <div className="flex items-center justify-center py-10">
                        <p className="text-primary/70">Şu anda görüntülenecek makale bulunmuyor.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 ">
                        {articles.map((article, index) => (
                            <Link
                                key={article.id ?? index}
                                href={`/pages/article/${article.slug}`}
                                className="group border-1 border-gray-300 relative flex flex-col bg-foreground rounded-md overflow-hidden shadow-md md:shadow-lg transition-all duration-300 md:hover:shadow-xl md:hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary h-full"
                                aria-label={`${article.title} makalesini görüntüle`}
                            >
                                <Image
                                    src={article.image}
                                    alt={article.title}
                                    width={800}
                                    height={450}
                                    className="w-full sm:h-56 sm:max-h-56 object-cover"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                />
                                {/* Content area with FIXED height to keep cards equal */}
                                <div className="w-full px-6 pb-12 md:pb-14 overflow-hidden h-48 md:h-56">
                                    <h2 className="text-lg md:text-xl font-bold text-primary mb-2 group-hover:text-secondary transition-colors duration-200 line-clamp-2">
                                        {article.title}
                                    </h2>
                                    <p className="text-sm md:text-base text-primary/80 mb-0 line-clamp-3 md:line-clamp-4">
                                        {article.description}
                                    </p>
                                </div>
                                {/* Fixed-height footer bar to align across cards */}
                                <div className="absolute bg-primary shadow-xl w-full bottom-0 px-6 h-10 md:h-12 text-white/80 text-xs md:text-sm flex justify-between items-center">
                                    <span className="truncate max-w-[55%] md:max-w-[60%]">{article.author}</span>
                                    <span>{article.date}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}