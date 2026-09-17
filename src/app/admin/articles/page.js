"use client"

import { useEffect, useState } from "react";
import AddArticle from "../../../components/admin/AddArticle";
import Image from "next/image";
import { toast } from "react-toastify";

export default function ArticlesAdminPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editArticle, setEditArticle] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const fetchArticles = async () => {
    try {
      const res = await fetch("/api/admin/articles", { credentials: 'include' });
      const data = await res.json();
      setArticles(data.articles || []);
    } catch {
      setArticles([]);
    }
    setLoading(false);
  };

  const handleDelete = async (slug, title) => {
    if (!confirm(`"${title}" başlıklı makaleyi silmek istediğinize emin misiniz?`)) {
      return;
    }

    setDeletingId(slug);
    try {
      const res = await fetch(`/api/admin/articles?slug=${slug}`, {
        method: 'DELETE',
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Makale başarıyla silindi!");
        fetchArticles();
      } else {
        toast.error(data.error || "Silme işlemi başarısız oldu.");
      }
    } catch (err) {
      toast.error("Sunucu hatası.");
    } finally {
      setDeletingId(null);
    }
  };

  const toggleSelect = (slug) => {
    setSelectedIds(prev => prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`${selectedIds.length} makaleyi silmek istediğinize emin misiniz?`)) return;

    setBulkDeleting(true);
    let failCount = 0;
    for (const slug of selectedIds) {
      try {
        const res = await fetch(`/api/admin/articles?slug=${slug}`, {
          method: 'DELETE',
          headers: { "Content-Type": "application/json" },
          credentials: 'include',
        });
        if (!res.ok) failCount += 1;
      } catch {
        failCount += 1;
      }
    }
    setBulkDeleting(false);
    setSelectedIds([]);
    if (failCount > 0) {
      toast.error(`${failCount} makale silinemedi.`);
    } else {
      toast.success("Seçilen makaleler silindi!");
    }
    fetchArticles();
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  return (
      <div className="bg-background text-primary flex flex-col items-center min-h-screen">
        <section className="mb-20 w-full bg-foreground text-primary py-24 border-b-1 border-secondary">
          <div className="container mx-auto px-4 flex items-center justify-center flex-col">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
              Makale Yönetimi
            </h1>
          </div>
        </section>

      <AddArticle editData={editArticle} onClose={() => setEditArticle(null)} onSaved={fetchArticles} />

      {loading ? (
        <div>Yükleniyor...</div>
      ) : (
        <>
          {articles.length === 0 ? (
            <div>Makale bulunamadı.</div>
          ) : (
              <section className="max-w-[1440px] w-full container mx-auto px-4 py-16">
                {selectedIds.length > 0 && (
                  <div className="w-full flex justify-end mb-4">
                    <button
                      onClick={handleBulkDelete}
                      disabled={bulkDeleting}
                      className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white px-4 py-2 rounded font-semibold transition cursor-pointer"
                    >
                      {bulkDeleting ? "Siliniyor..." : `Seçilenleri Sil (${selectedIds.length})`}
                    </button>
                  </div>
                )}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   {articles.map((article, index) => (
                     <div key={article.id ?? index} className="group border-1 border-gray-300 relative flex-col flex gap-2 bg-foreground rounded-sm overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500">
                       <input
                         type="checkbox"
                         checked={selectedIds.includes(article.slug)}
                         onChange={(e) => { e.stopPropagation(); toggleSelect(article.slug); }}
                         className="absolute top-2 left-2 z-10 w-5 h-5 cursor-pointer"
                       />
                       <Image
                           src={article.image}
                           alt={article.title}
                           width={400}
                           height={250}
                           className="w-full h-56 object-cover cursor-pointer hover:opacity-80 transition"
                           onClick={() => setEditArticle(article)}
                       />
                       <div className="w-full px-6 overflow-hidden">
                         <h2 className="text-xl font-bold text-primary mb-2 group-hover:text-secondary transition-colors duration-300 cursor-pointer"
                           onClick={() => setEditArticle(article)}>
                           {article.title}
                         </h2>
                         <p className="text-primary/80 mb-4 line-clamp-5 pb-20">
                           {article.description}
                         </p>
                       </div>
                       <div className="absolute bg-primary shadow-xl w-full bottom-0 px-6 py-1 text-white/80 text-sm flex justify-between items-center">
                         <span>{article.author}</span>
                         <span className="flex items-center gap-2">
                           {(() => {
                             // isPubliclyVisible() (src/app/api/articles/route.js) ile aynı mantık:
                             // status yoksa veya published ise yayında; scheduled ise zamanı geçmiş mi bak.
                             const s = article.status;
                             let cls = 'bg-yellow-500', label = 'Taslak';
                             if (s === undefined || s === 'published') {
                               cls = 'bg-green-500'; label = 'Yayında';
                             } else if (s === 'scheduled') {
                               if (article.scheduledAt && new Date(article.scheduledAt).getTime() <= Date.now()) {
                                 cls = 'bg-green-500'; label = 'Yayında (zamanlanmış)';
                               } else {
                                 cls = 'bg-blue-500'; label = 'Zamanlanmış';
                               }
                             }
                             return (
                               <span className={`text-xs px-2 py-0.5 rounded ${cls}`}>
                                 {label}
                               </span>
                             );
                           })()}
                           {article.date}
                         </span>
                       </div>
                       <div className="absolute top-0 right-0 flex gap-2 p-2 opacity-0 group-hover:opacity-100 transition">
                         <button
                           onClick={(e) => { e.stopPropagation(); setEditArticle(article); }}
                           className="bg-primary hover:bg-secondary cursor-pointer text-white px-3 py-1 rounded text-sm font-semibold transition"
                         >
                           Düzenle
                         </button>
                         <button
                           onClick={(e) => { e.stopPropagation(); handleDelete(article.slug, article.title); }}
                           disabled={deletingId === article.slug}
                           className="bg-red-300 hover:bg-red-600 cursor-pointer disabled:bg-red-300 text-white px-3 py-1 rounded text-sm font-semibold transition"
                         >
                           {deletingId === article.slug ? "Siliniyor..." : "Sil"}
                         </button>
                       </div>
                     </div>
                   ))}
                 </div>
              </section>
          )}
        </>
      )}
    </div>
  );
}

//https://www.figma.com/design/5u0WXE8ScFpWXANgUMl9jm/ESK-Packaging?node-id=0-1&p=f&t=Lx75litMTbujzrOR-0
