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
    
    // Editlemede eski slug'ı koru, yoksa yeni slug oluştur
    let slug = editData?.slug || form.title
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
        credentials: 'include',
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
          className="bg-primary text-white py-2 px-4 rounded font-semibold hover:bg-secondary transition hover:cursor-pointer"
          onClick={handleOpen}
        >
          Makale Ekle
        </button>
      )}
      {open && (
        <div className="fixed inset-0 backdrop-blur-2xl flex items-center justify-center z-50 overflow-scroll ">
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
                <div className="flex flex-wrap justify-center">
                  {imageOptions.map((img) => (
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
              <textarea name="content" value={form.content} onChange={handleChange} placeholder="İçerik" className=" min-h-[300px] border-1 border-primary/20 p-2 rounded" required />
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
