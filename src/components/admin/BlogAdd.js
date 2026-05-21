"use client";

import "react-toastify/dist/ReactToastify.css";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import TiptapEditor from "../tiptap/TiptapEditor";

const categories = ["Hukuk", "Teknoloji", "Güncel", "Eğitim", "Sağlık"];

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
    text: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [open, setOpen] = useState(false);

  const [richText, setRichText] = useState('');
  const [error, setError] = useState("");

  useEffect(() => {
    if (editData) {
      setForm({
        title: editData.title || "",
        date: editData.date || "",
        category: editData.category || "",
        description: editData.description || "",
        text: editData.text || ""
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

  const handleRichTextChange = (html) => {
    setRichText(html);
    setForm(prev => ({ ...prev, text: html }));
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    
    // Editlemede eski slug'ı koru, yoksa yeni slug oluştur
    let slug = editData?.slug || form.title
      .toLowerCase()
      .replace(/[^a-z0-9ğüşıöç\s]/gi, "")
      .split(" ")
      .filter(Boolean)
      .slice(0, 3)
      .join("-");
      
    try {
      const url = editData ? "/api/admin/blogs" : "/api/admin/blogs";
      const method = editData ? "PUT" : "POST";
      // description alanını da gönder
      const payload = {
        ...form,
        text: richText
      };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ ...payload, slug })
      });
      const data = await res.json();
      if (res.ok) {
        setForm({ title: "", date: "", category: "", description: "", text: "" });
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
    setForm({ title: "", date: "", category: "", description: "", text: "" });
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
                </div>
              <label className="font-semibold">İçerik</label>
              <TiptapEditor value={richText} onChange={handleRichTextChange} />
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
