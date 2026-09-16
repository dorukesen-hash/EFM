import { useEffect, useState } from "react";
import Image from "next/image";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TiptapEditor from "../tiptap/TiptapEditor";
import { listImages } from "@/services/firebase/firebaseStorage";

// Eski (Tiptap öncesi) düz metin içerikleri HTML'e çevir; içerik zaten HTML ise dokunma.
function plainOrHtmlToEditorHtml(content) {
  if (!content) return "";
  if (/<[a-z][\s\S]*>/i.test(content)) return content;
  return content
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br>")}</p>`)
    .join("");
}

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

export default function AddArticle({ editData, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    image: "",
    author: "",
    date: "",
    content: "",
    status: "draft"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [open, setOpen] = useState(false);
  const [storageImages, setStorageImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [richText, setRichText] = useState("");

  useEffect(() => {
    if (editData) {
      const content = editData.content || "";
      setForm({
        title: editData.title || "",
        description: editData.description || "",
        image: editData.image || "",
        author: editData.author || "",
        date: editData.date || "",
        content,
        status: editData.status || "draft"
      });
      setRichText(plainOrHtmlToEditorHtml(content));
      setOpen(true);
    }
  }, [editData]);

  // Firebase Storage'dan resimleri yükle
  useEffect(() => {
    if (open && storageImages.length === 0) {
      loadStorageImages();
    }
  }, [open]);

  const loadStorageImages = async () => {
    setLoadingImages(true);
    try {
      const images = await listImages('articles');
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
    setForm((prev) => ({ ...prev, content: html }));
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

   const handleSubmit = async (e) => {
     e.preventDefault();

     const plainText = form.content.replace(/<[^>]*>/g, "").trim();
     if (!plainText && !/<img/i.test(form.content)) {
       toast.error("İçerik boş olamaz.");
       return;
     }

     setLoading(true);
     setError("");
     setSuccess(false);

     try {
       const url = editData ? `/api/admin/articles` : "/api/admin/articles";
       const method = editData ? "PUT" : "POST";
       
       // POST'ta slug'ı gönderme, API'de otomatik oluşturulacak
       // PUT'ta ise mevcut slug'ı koru
       const payload = {
         ...form,
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
        setSuccess(true);
        setForm({
          title: "",
          description: "",
          image: "",
          author: "",
          date: "",
          content: "",
          status: "draft"
        });
        setRichText("");
        setOpen(false);
        if (onClose) onClose();
        if (onSaved) onSaved();
        toast.success(editData ? "Makale başarıyla güncellendi!" : "Makale başarıyla eklendi!");
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
    setRichText("");
    setForm({
      title: "",
      description: "",
      image: "",
      author: "",
      date: "",
      content: "",
      status: "draft"
    });
  };

  return (
    <div>
      {!editData && (
        <button
          className="bg-primary text-white py-2 px-4 rounded font-semibold hover:bg-secondary transition hover:cursor-pointer"
          onClick={handleOpen}
        >
          Makale Ekle
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
            <h2 className="text-2xl font-bold mb-6">{editData ? "Makale Düzenle" : "Makale Ekle"}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 item ">
              <input name="title" value={form.title} onChange={handleChange} placeholder="Başlık" className=" border-1 border-primary/20 p-2 rounded" required />
              <input name="description" value={form.description} onChange={handleChange} placeholder="Açıklama" className=" border-1 border-primary/20 p-2 rounded" required />
               <div>
                 <label className="block mb-2 font-semibold">Görsel Seç</label>
                 
                 {/* Yerel Görseller */}
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

                 {/* Firebase Storage Görselleri */}
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
                           <Image
                             src={img.url}
                             alt={img.name}
                             fill
                             className="object-cover"
                           />
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
              <input name="author" value={form.author} onChange={handleChange} placeholder="Yazar" className=" border-1 border-primary/20 p-2 rounded" required />
              <input
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                placeholder="Tarih"
                className=" border-1 border-primary/20 p-2 rounded"
                required
              />
              <div className="flex items-center space-x-4">
                <label htmlFor="status" className="font-semibold">Durum</label>
                <select id="status" name="status" value={form.status} onChange={handleChange} className="border-1 border-primary/20 p-2 rounded">
                  <option value="draft">Taslak</option>
                  <option value="published">Yayınlandı</option>
                </select>
              </div>
              <label className="font-semibold">İçerik</label>
              <TiptapEditor value={richText} onChange={handleRichTextChange} imageFolder="articles" />
                <div className="w-full flex justify-center">
                  <button type="submit" disabled={loading} className="max-w-[300px] min-w-[200px]  bg-primary text-white py-2 rounded font-semibold hover:bg-secondary cursor-pointer  transition">
                    {loading ? (editData ? "Güncelleniyor..." : "Kaydediliyor...") : (editData ? "Makale Güncelle" : "Makale Ekle")}
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
