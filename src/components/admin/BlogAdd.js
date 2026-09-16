"use client";

import "react-toastify/dist/ReactToastify.css";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import Image from "next/image";
import TiptapEditor from "../tiptap/TiptapEditor";
import { listImages } from "@/services/firebase/firebaseStorage";

const categories = ["Hukuk", "Teknoloji", "Güncel", "Eğitim", "Sağlık"];

// Blog kapak görseli için yerel görsel seçenekleri (AddArticle.js ile aynı havuz)
const localImageOptions = [
  "/assets/areas/aile.jpg",
  "/assets/areas/bilisim.jpg",
  "/assets/areas/bosanma.jpeg",
  "/assets/areas/ceza.jpg",
  "/assets/areas/idare.jpg",
  "/assets/areas/kvkk.jpg",
  "/assets/areas/miras.jpeg",
  "/assets/areas/saglık.jpg",
  "/assets/areas/sigorta.jpg",
  "/assets/areas/tazminat.jpg",
  "/assets/areas/ticaret.webp"
];

// Eski Slate JSON → HTML (geriye dönük uyumluluk)
function escapeHtml(t) {
  return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function leafToHtml(l) {
  let h = escapeHtml(l.text || '');
  if (l.bold) h = `<strong>${h}</strong>`;
  if (l.italic) h = `<em>${h}</em>`;
  if (l.underline) h = `<u>${h}</u>`;
  if (l.code) h = `<code>${h}</code>`;
  return h;
}
function childrenToHtml(c = []) {
  return c.map(n => n.text !== undefined ? leafToHtml(n) : nodeToHtml(n)).join('');
}
function nodeToHtml(n) {
  const inner = childrenToHtml(n.children);
  const align = n.align ? ` style="text-align:${n.align}"` : '';
  switch (n.type) {
    case 'heading-one':   return `<h1${align}>${inner}</h1>`;
    case 'heading-two':   return `<h2${align}>${inner}</h2>`;
    case 'block-quote':   return `<blockquote>${inner}</blockquote>`;
    case 'bulleted-list': return `<ul>${inner}</ul>`;
    case 'numbered-list': return `<ol>${inner}</ol>`;
    case 'list-item':     return `<li>${inner}</li>`;
    default:              return `<p${align}>${inner}</p>`;
  }
}
function slateToHtml(nodes) {
  if (!Array.isArray(nodes)) return '';
  return nodes.map(nodeToHtml).join('');
}


export default function BlogAdd({ editData, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: "",
    date: "",
    category: "",
    description: "",
    text: "",
    image: "",
    status: "draft"
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [open, setOpen] = useState(false);

  const [richText, setRichText] = useState('');
  const [error, setError] = useState("");

  const [storageImages, setStorageImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);

  useEffect(() => {
    if (editData) {
      setForm({
        title: editData.title || "",
        date: editData.date || "",
        category: editData.category || "",
        description: editData.description || "",
        text: editData.text || "",
        image: editData.image || "",
        status: editData.status || "draft"
      });
      // Eski Slate JSON içeriği HTML'e çevir, HTML string ise direkt kullan
      const text = editData.text || '';
      setRichText(Array.isArray(text) ? slateToHtml(text) : text);
      setOpen(true);
    } else {
      setRichText('');
      setOpen(false);
    }
  }, [editData]);

  // Firebase Storage'dan blog klasöründeki resimleri yükle
  useEffect(() => {
    if (open && storageImages.length === 0) {
      loadStorageImages();
    }
  }, [open]);

  const loadStorageImages = async () => {
    setLoadingImages(true);
    try {
      const images = await listImages('blogs');
      setStorageImages(images);
    } catch (err) {
      console.error('Resimleri yüklemede hata:', err);
      toast.warning('Firebase Storage resimleri yüklenemedi');
    } finally {
      setLoadingImages(false);
    }
  };

  const handleRichTextChange = (html) => {
    setRichText(html);
    setForm(prev => ({ ...prev, text: html }));
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

   const handleSubmit = async (e) => {
     e.preventDefault();

     const plainText = richText.replace(/<[^>]*>/g, "").trim();
     if (!plainText && !/<img/i.test(richText)) {
       toast.error("İçerik boş olamaz.");
       return;
     }

     setLoading(true);
     setError("");
     setSuccess(false);

     try {
       const url = editData ? "/api/admin/blogs" : "/api/admin/blogs";
       const method = editData ? "PUT" : "POST";

       // POST'ta slug'ı gönderme, API'de otomatik oluşturulacak
       // PUT'ta ise mevcut slug'ı koru
       const payload = {
         ...form,
         text: richText,
         ...(editData && { slug: editData.slug })
       };

       const res = await fetch(url, {
         method,
         headers: { "Content-Type": "application/json" },
         credentials: 'include',
         body: JSON.stringify(payload)
       });
      const data = await res.json();
      if (res.ok) {
        setForm({ title: "", date: "", category: "", description: "", text: "", image: "", status: "draft" });
        setOpen(false);
        if (onClose) onClose();
        if (onSaved) onSaved();
        toast.success(editData ? "Blog başarıyla güncellendi!" : "Blog başarıyla eklendi!");
      } else {
        toast.error(data.error || "Bir hata oluştu.");
      }
    } catch (err) {
      toast.error("Sunucu hatası.");
    }
    setLoading(false);
  };

  const handleOpen = () => {
    setOpen(true);
    setRichText('');
    setForm({ title: "", date: "", category: "", description: "", text: "", image: "", status: "draft" });
  };

  return (
    <div>
      {!editData && (
        <button
            className="bg-primary text-white py-2 px-4 rounded font-semibold hover:bg-secondary transition hover:cursor-pointer"
            onClick={handleOpen}
        >
          Blog Ekle
        </button>
      )}
      {open && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-2xl flex items-center justify-center z-50 overflow-scroll ">
              <div className=" max-w-[80%] min-w-xl max-h-[90vh] overflow-scroll w-full mx-auto p-8 bg-white rounded shadow relative">
            <button
                className="absolute flex justify-center items-center w-[40px] h-[40px] top-2 right-2 text-gray-500 hover:text-white cursor-pointer font-extrabold hover:bg-primary text-xl p-2  rounded-xl"
              onClick={() => { setOpen(false); if (onClose) onClose(); }}
              aria-label="Kapat"
            >
              X
            </button>
            <h2 className="text-2xl font-bold mb-6">{editData ? "Blog Düzenle" : "Blog Ekle"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Başlık"
                className="w-full  border-1 border-primary/20 p-2 rounded"
                required
              />
              <input
                type="text"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Açıklama (description)"
                className="w-full border-1 border-primary/20 p-2 rounded"
                required
              />
                <div className="w-full flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <label htmlFor="date" className="font-semibold">Tarih</label>
                      <input id="date" name="date" type="date" value={form.date} onChange={handleChange} className=" border-1 border-primary/20 p-2 rounded" required />
                    </div>
                    <div className="flex items-center space-x-4">
                      <label htmlFor="category" className="font-semibold">Kategori</label>
                      <select id="category" name="category" value={form.category} onChange={handleChange} className=" border-1 border-primary/20 p-2 rounded" required>
                          <option value="">Kategori Seç</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center space-x-4">
                      <label htmlFor="status" className="font-semibold">Durum</label>
                      <select id="status" name="status" value={form.status} onChange={handleChange} className=" border-1 border-primary/20 p-2 rounded">
                        <option value="draft">Taslak</option>
                        <option value="published">Yayınlandı</option>
                      </select>
                    </div>
                </div>
              <div>
                <label className="block mb-2 font-semibold">Kapak Görseli (opsiyonel)</label>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">📁 Yerel Görseller</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {localImageOptions.map((img) => (
                      <Image
                        key={img}
                        onClick={() => setForm({ ...form, image: img })}
                        src={img}
                        alt={img}
                        width={96}
                        height={96}
                        className={`w-24 h-24 object-cover rounded cursor-pointer border ${form.image === img ? 'border-4 border-secondary' : 'border-gray-300'}`}
                        style={{ objectFit: 'cover' }}
                      />
                    ))}
                  </div>
                </div>

                {storageImages.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">☁️ Firebase Storage</p>
                      <button
                        type="button"
                        onClick={loadStorageImages}
                        className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                      >
                        🔄 Yenile
                      </button>
                    </div>
                    <div className="flex flex-wrap justify-center gap-2">
                      {storageImages.map((img) => (
                        <div
                          key={img.path}
                          onClick={() => setForm({ ...form, image: img.url })}
                          className={`relative w-24 h-24 rounded cursor-pointer border ${form.image === img.url ? 'border-4 border-secondary' : 'border-gray-300'} overflow-hidden`}
                        >
                          <Image src={img.url} alt={img.name} fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {loadingImages && (
                  <p className="text-sm text-gray-500 mt-2">Resimleri yüklüyor...</p>
                )}

                {!loadingImages && storageImages.length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    Henüz resim yüklenmemiş. <a href="/admin/images" className="text-blue-500 hover:underline">Resimler</a> sekmesinden resim yükleyin.
                  </p>
                )}
              </div>
              <label className="font-semibold">İçerik</label>
              <TiptapEditor value={richText} onChange={handleRichTextChange} imageFolder="blogs" />
              {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
                <div className="w-full flex justify-center">
                  <button type="submit" disabled={loading} className="max-w-[300px] min-w-[200px]  bg-primary text-white py-2 rounded font-semibold hover:bg-secondary cursor-pointer  transition">
                    {loading ? (editData ? "Güncelleniyor..." : "Kaydediliyor...") : (editData ? "Blog Güncelle" : "Blog Ekle")}
                  </button>
                </div>
            </form>
          </div>
        </div>
      )}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
}
