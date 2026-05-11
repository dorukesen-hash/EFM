"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function BlogPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/blogs")
      .then((res) => res.json())
      .then((data) => {
        setBlogs(data.blogs || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Bloglar alınamadı.");
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
      <div className="bg-background text-primary flex flex-col items-center min-h-screen">
        {/* Hero Section */}
        <section className="max-w-[1440px] w-full bg-foreground text-primary py-24 border-b-1 border-secondary">
          <div className="container mx-auto px-4 flex items-center justify-center flex-col">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
              Blog Yazıları
            </h1>
          </div>
        </section>
        <section className="max-w-[1440px] w-full container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog) => (
              <Link
                  key={blog.slug}
                  href={`/pages/blog/${blog.slug}`}
                  className="group border-1 border-gray-300 relative flex-col flex gap-2 bg-foreground rounded-sm overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105"
              >
                <div className="flex flex-col items-center w-full px-6 overflow-hidden">
                  <h2 className="text-xl pt-12 font-bold text-primary mb-2 group-hover:text-secondary transition-colors duration-300">
                    {blog.title}
                  </h2>
                    <div className="text-primary/80 pb-16">
                      <p className="line-clamp-5 text-justify">
                        {blog.description}
                      </p>
                    </div>
                </div>
                <div className="absolute bg-primary shadow-xl w-full bottom-0 px-6 py-1 text-white/80 text-sm  flex justify-between items-center">
                  <span>{blog.date}</span>
                  <span>{blog.category}</span>
                </div>
              </Link>
          ))}
          </div>
        </section>
      </div>
  );
}