import { useEffect, useState } from "react";
import Image from "next/image";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const imageOptions = [
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
    content: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (editData) {
      setForm({
        title: editData.title || "",
        description: editData.description || "",
        image: editData.image || "",
        author: editData.author || "",
        date: editData.date || "",
        content: editData.content || ""
      });
      setOpen(true);
    }
  }, [editData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    let slug = form.title
      .toLowerCase()
      .replace(/[^a-z0-9ğüşıöç\s]/gi, "")
      .split(" ")
      .filter(Boolean)
      .slice(0, 3)
      .join("-");
    try {
      const url = editData ? `/api/admin/articles` : "/api/admin/articles";
      const method = editData ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, slug })
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
          content: ""
        });
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
    setForm({
      title: "",
      description: "",
      image: "",
      author: "",
      date: "",
      content: ""
    });
  };

  return (
    <div>
      {!editData && (
        <button
          className="bg-blue-600 text-white py-2 px-4 rounded font-semibold hover:bg-blue-700 transition"
          onClick={handleOpen}
        >
          Makale Ekle
        </button>
      )}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="max-w-xl w-full mx-auto p-8 bg-white rounded shadow relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
              onClick={() => { setOpen(false); if (onClose) onClose(); }}
              aria-label="Kapat"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-6">{editData ? "Makale Düzenle" : "Makale Ekle"}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input name="title" value={form.title} onChange={handleChange} placeholder="Başlık" className="border p-2 rounded" required />
              <input name="description" value={form.description} onChange={handleChange} placeholder="Açıklama" className="border p-2 rounded" required />
              <div>
                <label className="block mb-2 font-semibold">Görsel Seç</label>
                <div className="flex flex-wrap justify-center">
                  {imageOptions.map((img) => (
                    <Image
                      key={img}
                      onClick={() => setForm({ ...form, image: img })}
                      src={img}
                      alt={img}
                      width={96}
                      height={96}
                      className={`w-24 h-24 object-cover rounded cursor-pointer border ${form.image === img ? 'border-blue-600' : 'border-gray-300'}`}
                      style={{ objectFit: 'cover' }}
                    />
                  ))}
                </div>
              </div>
              <input name="author" value={form.author} onChange={handleChange} placeholder="Yazar" className="border p-2 rounded" required />
              <input
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                placeholder="Tarih"
                className="border p-2 rounded"
                required
              />
              <textarea name="content" value={form.content} onChange={handleChange} placeholder="İçerik" className="border p-2 rounded h-32" required />
              <button type="submit" disabled={loading} className="bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition">
                {loading ? (editData ? "Güncelleniyor..." : "Kaydediliyor...") : (editData ? "Makale Güncelle" : "Makale Ekle")}
              </button>
            </form>
          </div>
        </div>
      )}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
}
