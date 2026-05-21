"use client";

import { useEffect, useState } from "react";
import BlogAdd from "../../../components/admin/BlogAdd";
import { toast } from "react-toastify";

export default function BlogsAdminPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editBlog, setEditBlog] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchBlogs = async () => {
    try {
      const res = await fetch("/api/admin/blogs");
      const data = await res.json();
      setBlogs(data.blogs || []);
    } catch {
      setBlogs([]);
    }
    setLoading(false);
  };

  const handleDelete = async (slug, title) => {
    if (!confirm(`"${title}" başlıklı blogu silmek istediğinize emin misiniz?`)) return;

    setDeletingId(slug);
    try {
      const res = await fetch(`/api/admin/blogs?slug=${slug}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Blog başarıyla silindi!");
        fetchBlogs();
      } else {
        toast.error(data.error || "Silme işlemi başarısız oldu.");
      }
    } catch {
      toast.error("Sunucu hatası.");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  return (
    <div className="bg-background text-primary flex flex-col items-center min-h-screen">
      {/* Hero Section */}
      <section className="mb-20 w-full bg-foreground text-primary py-24 border-b-1 border-secondary">
        <div className="container mx-auto px-4 flex items-center justify-center flex-col">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            Blog Yönetimi
          </h1>
        </div>
      </section>

        <BlogAdd
          editData={editBlog}
          onClose={() => setEditBlog(null)}
          onSaved={fetchBlogs}
        />

      {/* Content Section */}
      <section className="max-w-[1440px] w-full container mx-auto px-4 py-16">
        {loading ? (
          <div>Yükleniyor...</div>
        ) : (
            <section className="max-w-[1440px] w-full container mx-auto px-4 py-16">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogs.map((blog) => (
                    <div
                        key={blog.slug}
                        className="group border-1 border-gray-300 relative flex-col flex gap-2 bg-foreground rounded-sm overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500"
                    >
                      <div className="flex flex-col items-center w-full px-6 overflow-hidden">
                        <h2
                          className="text-xl pt-12 font-bold text-primary mb-2 group-hover:text-secondary transition-colors duration-300 cursor-pointer"
                          onClick={() => setEditBlog(blog)}
                        >
                          {blog.title}
                        </h2>
                        <div className="text-primary/80 pb-16">
                          <p className="line-clamp-5 text-justify">
                            {blog.description}
                          </p>
                        </div>
                      </div>
                      <div className="absolute bg-primary shadow-xl w-full bottom-0 px-6 py-1 text-white/80 text-sm flex justify-between items-center">
                        <span>{blog.date}</span>
                        <span>{blog.category}</span>
                      </div>
                      <div className="absolute top-0 right-0 flex gap-2 p-2 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditBlog(blog); }}
                          className="bg-primary hover:bg-secondary cursor-pointer text-white px-3 py-1 rounded text-sm font-semibold transition"
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(blog.slug, blog.title); }}
                          disabled={deletingId === blog.slug}
                          className="bg-red-300 hover:bg-red-600 cursor-pointer disabled:bg-red-300 text-white px-3 py-1 rounded text-sm font-semibold transition"
                        >
                          {deletingId === blog.slug ? "Siliniyor..." : "Sil"}
                        </button>
                      </div>
                    </div>
                ))}
              </div>
            </section>
        )}
      </section>
    </div>
  );
}