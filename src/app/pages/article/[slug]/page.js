"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ArticleDetailPage() {
    const { slug } = useParams();
    const [article, setArticle] = useState(null);
    useEffect(() => {
        fetch("/api/articles")
            .then(res => res.json())
            .then(data => {
                const found = (data.articles || []).find(a => a.slug === slug);
                setArticle(found);
            });
    }, [slug]);

    if (!article) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h1 className="text-3xl font-bold mb-4">Makale Bulunamadı</h1>
                <p>Aradığınız makale mevcut değil veya kaldırılmış olabilir.</p>
            </div>
        );
    }

    return (
        <div className="bg-background text-primary flex flex-col items-center min-h-screen">
            {/* Hero Section */}
            <section className="max-w-[1440px] w-full bg-foreground text-primary py-24 border-b-1 border-secondary">
                <div className="container mx-auto px-4 flex items-center justify-center flex-col">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
                        Makaleler
                    </h1>
                </div>
            </section>
            <div className="flex flex-col items-center min-h-screen w-full max-w-[1440px] pt-10 page-container">
                <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center w-full">{article.title}</h1>
                <div className="flex items-center gap-4 mb-6 text-primary text-sm flex-wrap justify-center">
                    <span>{article.author}</span>
                    <span>•</span>
                    <span>{article.date}</span>
                </div>
                <div className="w-full flex flex-col md:flex-row gap-4 md:gap-6">
                    <div className="w-full md:w-[400px] md:flex-shrink-0">
                        <Image
                            src={article.image}
                            alt={article.title}
                            width={800}
                            height={600}
                            className="w-full h-auto object-cover rounded-md"
                        />
                    </div>
                    <div className="flex-1">
                        <p className="text-base md:text-lg text-justify mb-6">{article.description}</p>
                        <div className="text-base md:text-lg text-justify text-primary">
                            {article.content}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
