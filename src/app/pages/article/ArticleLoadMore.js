"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function ArticleLoadMore({ initialArticles, initialNextCursor }) {
  const [articles, setArticles] = useState(initialArticles);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const visibleArticles = articles.filter((a) =>
    !searchTerm || a.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const loadMore = async () => {
    if (!nextCursor || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/articles?limit=9&cursor=${encodeURIComponent(nextCursor)}`);
      if (!res.ok) {
        // Geçici bir hata (500 vs.) mevcut nextCursor'ı null'a çevirmemeli — aksi halde
        // "Daha Fazla Yükle" butonu kalıcı olarak kaybolur ve kullanıcı sayfayı
        // yenilemeden tekrar deneyemez. Cursor'ı olduğu gibi bırakıp sessizce çık.
        console.error("Makaleler yüklenemedi:", res.status);
        return;
      }
      const data = await res.json();
      setArticles(prev => [...prev, ...(data.articles || [])]);
      setNextCursor(data.nextCursor || null);
    } catch (err) {
      console.error("Makaleler yüklenemedi:", err);
    } finally {
      setLoading(false);
    }
  };

  if (articles.length === 0) {
    return (
      <div className="flex items-center justify-center py-10">
        <p className="text-primary/70">Şu anda görüntülenecek makale bulunmuyor.</p>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-md mx-auto mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Makale başlığında ara..."
          className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-secondary"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {visibleArticles.map((article, index) => (
          <Link
            key={article.id ?? article.slug ?? index}
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
            <div className="w-full px-6 pb-12 md:pb-14 overflow-hidden h-48 md:h-56">
              <h2 className="text-lg md:text-xl font-bold text-primary mb-2 group-hover:text-secondary transition-colors duration-200 line-clamp-2">
                {article.title}
              </h2>
              <p className="text-sm md:text-base text-primary/80 mb-0 line-clamp-3 md:line-clamp-4">
                {article.description}
              </p>
            </div>
            <div className="absolute bg-primary shadow-xl w-full bottom-0 px-6 h-10 md:h-12 text-white/80 text-xs md:text-sm flex justify-between items-center">
              <span className="truncate max-w-[55%] md:max-w-[60%]">{article.author}</span>
              <span>{article.date}</span>
            </div>
          </Link>
        ))}
      </div>
      {nextCursor && (
        <div className="w-full flex justify-center mt-10">
          <button
            onClick={loadMore}
            disabled={loading}
            className="bg-primary text-white py-2 px-6 rounded font-semibold hover:bg-secondary transition disabled:opacity-50"
          >
            {loading ? "Yükleniyor..." : "Daha Fazla Yükle"}
          </button>
        </div>
      )}
    </>
  );
}
