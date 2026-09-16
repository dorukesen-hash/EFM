"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const CATEGORIES = ["Hukuk", "Teknoloji", "Güncel", "Eğitim", "Sağlık"];

export default function BlogLoadMore({ initialBlogs, initialNextCursor }) {
  const [blogs, setBlogs] = useState(initialBlogs);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);

  const visibleBlogs = activeCategory
    ? blogs.filter((b) => b.category === activeCategory)
    : blogs;

  const loadMore = async () => {
    if (!nextCursor || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/blogs?limit=9&cursor=${encodeURIComponent(nextCursor)}`);
      if (!res.ok) {
        // Geçici bir hata (500 vs.) mevcut nextCursor'ı null'a çevirmemeli — aksi halde
        // "Daha Fazla Yükle" butonu kalıcı olarak kaybolur ve kullanıcı sayfayı
        // yenilemeden tekrar deneyemez. Cursor'ı olduğu gibi bırakıp sessizce çık.
        console.error("Bloglar yüklenemedi:", res.status);
        return;
      }
      const data = await res.json();
      setBlogs(prev => [...prev, ...(data.blogs || [])]);
      setNextCursor(data.nextCursor || null);
    } catch (err) {
      console.error("Bloglar yüklenemedi:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-4 py-1 rounded-full text-sm border transition ${
            activeCategory === null ? "bg-primary text-white border-primary" : "border-gray-300 hover:border-primary"
          }`}
        >
          Tümü
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1 rounded-full text-sm border transition ${
              activeCategory === cat ? "bg-primary text-white border-primary" : "border-gray-300 hover:border-primary"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {visibleBlogs.map((blog) => (
          <Link
            key={blog.slug}
            href={`/pages/blog/${blog.slug}`}
            className="group border-1 border-gray-300 relative flex-col flex gap-2 bg-foreground rounded-sm overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105"
          >
            {blog.image && (
              <Image
                src={blog.image}
                alt={blog.title}
                width={400}
                height={250}
                className="w-full h-48 object-cover"
              />
            )}
            <div className={`flex flex-col items-center w-full px-6 overflow-hidden ${blog.image ? 'pt-4' : 'pt-12'}`}>
              <h2 className="text-xl font-bold text-primary mb-2 group-hover:text-secondary transition-colors duration-300">
                {blog.title}
              </h2>
              <div className="text-primary/80 pb-16">
                <p className="line-clamp-5 text-justify">{blog.description}</p>
              </div>
            </div>
            <div className="absolute bg-primary shadow-xl w-full bottom-0 px-6 py-1 text-white/80 text-sm flex justify-between items-center">
              <span>{blog.date}</span>
              <span>{blog.category}</span>
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
