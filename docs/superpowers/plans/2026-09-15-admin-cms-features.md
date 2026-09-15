# Admin/CMS Özellikleri Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Admin panelde blog ve makale yönetimine taslak/yayın durumu, önizleme modu, toplu silme, zamanlanmış yayın ve sürüm geçmişi ekleyerek CMS'i güçlendirmek.

**Architecture:** Mevcut mimari değişmiyor — Next.js App Router API route'ları (`src/app/api/**/route.js`) Firestore ile doğrudan konuşuyor, admin sayfaları client component (`"use client"`) olarak `fetch` ile bu route'ları çağırıyor. Her özellik, Firestore dokümanlarına yeni alanlar (`status`, `scheduledAt`) veya alt-koleksiyonlar (`history`) ekleyerek ve mevcut route/form dosyalarını genişleterek eklenir; yeni bir mimari katman veya kütüphane getirilmez.

**Tech Stack:** Next.js 16 (App Router), Firebase Admin SDK (Firestore), React 19, Tailwind v4, react-toastify, Tiptap (blog editörü).

**Spec:** Bu conversation'daki kod incelemesi ve kullanıcı onayına dayanır, ayrı bir spec dosyası yok.

## Global Constraints

- Bu projede otomatik test altyapısı (jest/vitest/playwright) YOK. Her task'ın test adımı `npm run dev` + tarayıcıda manuel doğrulamadır — otomatik test yazma.
- Mevcut admin API route'larının hepsi kendi `requireAdmin(req)` fonksiyonunu dosya içinde tekrar tanımlıyor (paylaşılan util yok). Bu plan bu convention'ı KORUR, ortak util'e taşımaz.
- Firestore doküman ID'si = `slug` (örn. `articles/{slug}`, `blogs/{slug}`).
- UI metinleri Türkçe, Tailwind class'ları mevcut stille (örn. `bg-primary`, `border-primary/20`) tutarlı, bildirimler `react-toastify` ile (`toast.success(...)`, `toast.error(...)`).
- Dev server `npm run dev` ile `next dev --webpack` çalışır; `.env.local`'daki `NEXTAUTH_URL=http://localhost:3001` — dev server'ı test ederken tarayıcıda `http://localhost:3001` kullan (varsayılan Next.js portu değil).
- Geriye dönük uyumluluk KRİTİK: mevcut Firestore dokümanlarında `status` alanı yok. Filtreleme mantığı `status === 'draft'` olanları HARİÇ tutacak şekilde yazılmalı (yani `status !== 'draft'` / `isPubliclyVisible()` gibi), `status === 'published'` şartına göre DEĞİL — aksi halde mevcut tüm içerik public sitede birden kaybolur.

---

## Task 1: Makale Taslak/Yayın Durumu

**Files:**
- Modify: `src/app/api/admin/articles/route.js:56-82` (POST), `:84-108` (PUT)
- Modify: `src/app/api/articles/route.js:4-21` (GET)
- Modify: `src/components/admin/AddArticle.js:22-29` (form state), `:37-49` (editData yükleme), `:122-132` (handleOpen), `:222-232` (JSX)
- Modify: `src/app/admin/articles/page.js:14-23` (fetchArticles), `:93-98` (kart JSX)

**Interfaces:**
- Produces: Firestore `articles/{slug}` dokümanlarında `status: 'draft' | 'published'` alanı. Yeni oluşturulan makalelerde varsayılan `'draft'`.
- Consumes: Hiçbir önceki task'a bağımlı değil (bu plandaki ilk task).

- [ ] **Step 1: `api/admin/articles/route.js` POST handler'ına `status` alanı ekle**

`src/app/api/admin/articles/route.js` dosyasında satır 56-77'yi şu şekilde değiştir:

```js
    const body = await req.json();
    const { title, description, image, author, date, content, status } = body;
    if (!title || !description || !image || !author || !date || !content) {
      return NextResponse.json({ error: 'Eksik alan var.' }, { status: 400 });
    }
    const finalStatus = status === 'published' ? 'published' : 'draft';

    // Slug'ı title'dan otomatik oluştur
    const slug = slugify(title);
    if (!slug) {
      return NextResponse.json({ error: 'Geçersiz başlık: slug oluşturulamadı.' }, { status: 400 });
    }

    const db = admin.firestore();
    await db.collection('articles').doc(slug).set({
      slug,
      title,
      description,
      image,
      author,
      date,
      content,
      status: finalStatus
    });
```

- [ ] **Step 2: PUT handler'ına `status` alanı ekle**

Aynı dosyada satır 89-103'ü şu şekilde değiştir:

```js
    const body = await req.json();
    const { slug, title, description, image, author, date, content, status } = body;
    if (!slug || !title || !description || !image || !author || !date || !content) {
      return NextResponse.json({ error: 'Eksik alan var.' }, { status: 400 });
    }
    const finalStatus = status === 'published' ? 'published' : 'draft';
    const db = admin.firestore();
    await db.collection('articles').doc(slug).set({
      slug,
      title,
      description,
      image,
      author,
      date,
      content,
      status: finalStatus
    }, { merge: true });
```

- [ ] **Step 3: Manuel test**

`npm run dev` çalıştır, `http://localhost:3001/admin/articles` sayfasına admin olarak giriş yapmış şekilde git. "Makale Ekle" ile yeni bir makale oluştur (status seçeneği henüz formda yok — Step 8'de eklenecek). Firebase Console → Firestore → `articles` koleksiyonunda yeni dokümanın `status: "draft"` alanıyla kaydedildiğini doğrula.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/admin/articles/route.js
git commit -m "feat: makale API'sine status (draft/published) alanı ekle"
```

- [ ] **Step 5: Public `GET /api/articles` route'unu status'a göre filtrele**

`src/app/api/articles/route.js` dosyasının tamamını şu şekilde değiştir:

```js
import { NextResponse } from 'next/server';
import admin from '../../../services/firebase/firebaseAdmin';

export async function GET() {
  try {
    const db = admin.firestore();
    const snapshot = await db.collection('articles').get();
    const articles = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      // status alanı olmayan eski makaleler geriye dönük uyumluluk için görünür kalır
      .filter(article => article.status !== 'draft');

    // En güncel makale ilk sırada gösterilsin diye tarihe göre (yeniden eskiye) sırala
    articles.sort((a, b) => {
      const da = a.date ? new Date(a.date).getTime() : 0;
      const db_ = b.date ? new Date(b.date).getTime() : 0;
      return db_ - da;
    });

    return NextResponse.json({ articles }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

- [ ] **Step 6: Manuel test — geriye dönük uyumluluk**

Firebase Console'da `status` alanı olmayan (eski) bir makaleyi bul, tarayıcıda `http://localhost:3001/api/articles`'ı aç, o makalenin listede olduğunu doğrula. Sonra Firebase Console'dan Step 3'te oluşturduğun test makalesine elle `status: "draft"` yaz (zaten draft), `/api/articles`'ı yenile, bu makalenin listede OLMADIĞINI doğrula. Elle `status: "published"` yap, tekrar yenile, listede göründüğünü doğrula.

- [ ] **Step 7: Commit**

```bash
git add src/app/api/articles/route.js
git commit -m "feat: public makale listesini status=draft olanları hariç tutacak şekilde filtrele"
```

- [ ] **Step 8: `AddArticle.js` formuna durum seçici ekle**

`src/components/admin/AddArticle.js` dosyasında satır 22-29'u değiştir:

```jsx
  const [form, setForm] = useState({
    title: "",
    description: "",
    image: "",
    author: "",
    date: "",
    content: "",
    status: "draft"
  });
```

Satır 37-49'u değiştir:

```jsx
  useEffect(() => {
    if (editData) {
      setForm({
        title: editData.title || "",
        description: editData.description || "",
        image: editData.image || "",
        author: editData.author || "",
        date: editData.date || "",
        content: editData.content || "",
        status: editData.status || "draft"
      });
      setOpen(true);
    }
  }, [editData]);
```

Satır 122-132'yi (`handleOpen`) değiştir:

```jsx
  const handleOpen = () => {
    setOpen(true);
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
```

Satır 232'deki `<textarea name="content" ...>` satırından hemen ÖNCE şu select'i ekle:

```jsx
              <div className="flex items-center space-x-4">
                <label htmlFor="status" className="font-semibold">Durum</label>
                <select id="status" name="status" value={form.status} onChange={handleChange} className="border-1 border-primary/20 p-2 rounded">
                  <option value="draft">Taslak</option>
                  <option value="published">Yayınlandı</option>
                </select>
              </div>
```

- [ ] **Step 9: Manuel test**

Admin panelde yeni makale eklerken "Durum" alanının varsayılan "Taslak" geldiğini doğrula. "Yayınlandı" seçip kaydet, Firebase Console'da `status: "published"` yazdığını doğrula, `/api/articles` çıktısında bu makalenin göründüğünü doğrula. Bir makaleyi düzenlerken mevcut durumunun select'te doğru seçili geldiğini doğrula.

- [ ] **Step 10: Commit**

```bash
git add src/components/admin/AddArticle.js
git commit -m "feat: makale formuna taslak/yayın durumu seçici ekle"
```

- [ ] **Step 11: Admin makale listesini admin API'sinden çek ve durum etiketi göster**

`src/app/admin/articles/page.js` dosyasında satır 16'yı değiştir:

```jsx
      const res = await fetch("/api/admin/articles", { credentials: 'include' });
```

(Önceki hâli `fetch("/api/articles")` idi — public route status filtrelemesinden sonra taslakları göstermeyeceği için admin listesi artık kendi admin route'undan çekmeli, tıpkı blog admin sayfasının zaten yaptığı gibi.)

Satır 93-98 arasındaki (author/date gösterilen) blok:

```jsx
                       <div className="absolute bg-primary shadow-xl w-full bottom-0 px-6 py-1 text-white/80 text-sm flex justify-between items-center">
                         <span>{article.author}</span>
                         <span className="flex items-center gap-2">
                           <span className={`text-xs px-2 py-0.5 rounded ${article.status === 'published' ? 'bg-green-500' : 'bg-yellow-500'}`}>
                             {article.status === 'published' ? 'Yayında' : 'Taslak'}
                           </span>
                           {article.date}
                         </span>
                       </div>
```

- [ ] **Step 12: Manuel test**

Admin makale listesinde artık taslak makalelerin de göründüğünü (sarı "Taslak" etiketiyle) ve yayınlanmış makalelerin yeşil "Yayında" etiketiyle göründüğünü doğrula.

- [ ] **Step 13: Commit**

```bash
git add src/app/admin/articles/page.js
git commit -m "feat: admin makale listesini admin API'sinden çek, durum etiketi ekle"
```

---

## Task 2: Blog Taslak/Yayın Durumu

**Files:**
- Modify: `src/app/api/admin/blogs/route.js:52-82` (POST), `:85-108` (PUT)
- Modify: `src/app/api/blogs/route.js:4-13` (GET)
- Modify: `src/components/admin/BlogAdd.js:45-51` (form state), `:59-76` (editData yükleme), `:127-131` (handleOpen), `:173-187` (JSX)
- Modify: `src/app/admin/blogs/page.js:93-96` (kart JSX — durum etiketi)

**Interfaces:**
- Produces: Firestore `blogs/{slug}` dokümanlarında `status: 'draft' | 'published'` alanı, Task 1'deki article ile aynı semantik.
- Consumes: Task 1'de kurulan desenin aynısı (bağımsız çalıştırılabilir, sıra önemli değil, sadece okunabilirlik için Task 1'den sonra yazıldı).

- [ ] **Step 1: `api/admin/blogs/route.js` POST handler'ına `status` ekle**

Satır 57-77'yi değiştir:

```js
    const body = await req.json();
    const { title, date, category, description, text, status } = body;
    if (!title || !date || !category || !description || !text) {
      return NextResponse.json({ error: 'Eksik alan var.' }, { status: 400 });
    }
    const finalStatus = status === 'published' ? 'published' : 'draft';

    // Slug'ı title'dan otomatik oluştur
    const slug = slugify(title);
    if (!slug) {
      return NextResponse.json({ error: 'Geçersiz başlık: slug oluşturulamadı.' }, { status: 400 });
    }

    const db = admin.firestore();
    await db.collection('blogs').doc(slug).set({
      slug,
      title,
      date,
      category,
      description,
      text,
      status: finalStatus
    });
```

- [ ] **Step 2: PUT handler'ına `status` ekle**

Satır 90-103'ü değiştir:

```js
    const body = await req.json();
    const { slug, title, date, category, description, text, status } = body;
    if (!slug || !title || !date || !category || !description || !text) {
      return NextResponse.json({ error: 'Eksik alan var.' }, { status: 400 });
    }
    const finalStatus = status === 'published' ? 'published' : 'draft';
    const db = admin.firestore();
    await db.collection('blogs').doc(slug).set({
      slug,
      title,
      date,
      category,
      description,
      text,
      status: finalStatus
    }, { merge: true });
```

- [ ] **Step 3: Manuel test**

`npm run dev`, admin panelde yeni blog oluştur, Firebase Console'da `status: "draft"` ile kaydedildiğini doğrula.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/admin/blogs/route.js
git commit -m "feat: blog API'sine status (draft/published) alanı ekle"
```

- [ ] **Step 5: Public `GET /api/blogs` route'unu filtrele**

`src/app/api/blogs/route.js` dosyasının tamamını değiştir:

```js
import { NextResponse } from 'next/server';
import admin from '../../../services/firebase/firebaseAdmin';

export async function GET() {
  try {
    const db = admin.firestore();
    const snapshot = await db.collection('blogs').get();
    const blogs = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      // status alanı olmayan eski bloglar geriye dönük uyumluluk için görünür kalır
      .filter(blog => blog.status !== 'draft');
    return NextResponse.json({ blogs }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

- [ ] **Step 6: Manuel test — geriye dönük uyumluluk**

Task 1 Step 6'daki aynı prosedürü blog için tekrarla: eski (status'suz) bir blog dokümanının `/api/blogs`'ta göründüğünü, `status:"draft"` yapılan bir dokümanın kaybolduğunu, `status:"published"` yapılınca tekrar göründüğünü doğrula.

- [ ] **Step 7: Commit**

```bash
git add src/app/api/blogs/route.js
git commit -m "feat: public blog listesini status=draft olanları hariç tutacak şekilde filtrele"
```

- [ ] **Step 8: `BlogAdd.js` formuna durum seçici ekle**

Satır 45-51'i değiştir:

```jsx
  const [form, setForm] = useState({
    title: "",
    date: "",
    category: "",
    description: "",
    text: "",
    status: "draft"
  });
```

Satır 59-76'yı değiştir:

```jsx
  useEffect(() => {
    if (editData) {
      setForm({
        title: editData.title || "",
        date: editData.date || "",
        category: editData.category || "",
        description: editData.description || "",
        text: editData.text || "",
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
```

Satır 127-131'i (`handleOpen`) değiştir:

```jsx
  const handleOpen = () => {
    setOpen(true);
    setRichText('');
    setForm({ title: "", date: "", category: "", description: "", text: "", status: "draft" });
  };
```

Satır 173-187 arasındaki tarih/kategori bloğunun İÇİNE (kategori seçiminin yanına) üçüncü bir grup ekle — bloğun tamamını şu şekilde değiştir:

```jsx
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
```

- [ ] **Step 9: Manuel test**

Yeni blog eklerken varsayılan "Taslak" geldiğini, kaydedince Firestore'da doğru `status` yazıldığını, düzenlerken mevcut durumun select'te doğru göründüğünü doğrula.

- [ ] **Step 10: Commit**

```bash
git add src/components/admin/BlogAdd.js
git commit -m "feat: blog formuna taslak/yayın durumu seçici ekle"
```

- [ ] **Step 11: Admin blog listesine durum etiketi ekle**

`src/app/admin/blogs/page.js` (bu sayfa zaten `/api/admin/blogs`'tan çekiyor, endpoint değişikliği gerekmiyor). Satır 93-96'yı değiştir:

```jsx
                      <div className="absolute bg-primary shadow-xl w-full bottom-0 px-6 py-1 text-white/80 text-sm flex justify-between items-center">
                        <span>{blog.date}</span>
                        <span className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded ${blog.status === 'published' ? 'bg-green-500' : 'bg-yellow-500'}`}>
                            {blog.status === 'published' ? 'Yayında' : 'Taslak'}
                          </span>
                          {blog.category}
                        </span>
                      </div>
```

- [ ] **Step 12: Manuel test**

Admin blog listesinde durum etiketinin doğru renk/metinle göründüğünü doğrula.

- [ ] **Step 13: Commit**

```bash
git add src/app/admin/blogs/page.js
git commit -m "feat: admin blog listesine durum etiketi ekle"
```

---

## Task 3: Admin Önizleme Modu

**Files:**
- Create: `src/components/admin/PreviewModal.js`
- Modify: `src/components/admin/AddArticle.js` (önizleme butonu + state)
- Modify: `src/components/admin/BlogAdd.js` (önizleme butonu + state)

**Interfaces:**
- Produces: `PreviewModal({ open, onClose, title, subtitle, meta, image, contentHtml, isRichText })` — `isRichText=true` ise içerik `TiptapEditor readOnly` ile render edilir, `false` ise düz metin `whitespace-pre-wrap` ile render edilir.
- Consumes: `src/components/tiptap/TiptapEditor` (mevcut, `readOnly` prop'u `TiptapEditor.jsx:31,41,47,63-65`'te zaten destekleniyor).

- [ ] **Step 1: `PreviewModal` bileşenini oluştur**

`src/components/admin/PreviewModal.js`:

```jsx
"use client";

import Image from "next/image";
import TiptapEditor from "../tiptap/TiptapEditor";

export default function PreviewModal({ open, onClose, title, subtitle, meta = [], image, contentHtml, isRichText }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] overflow-scroll">
      <div className="max-w-[80%] min-w-xl max-h-[90vh] overflow-scroll w-full mx-auto p-8 bg-white rounded shadow relative">
        <button
          className="absolute flex justify-center items-center w-[40px] h-[40px] top-2 right-2 text-gray-500 hover:text-white cursor-pointer font-extrabold hover:bg-primary text-xl p-2 rounded-xl"
          onClick={onClose}
          aria-label="Önizlemeyi Kapat"
          type="button"
        >
          X
        </button>
        <p className="text-xs uppercase tracking-wide text-primary/60 mb-2">Önizleme</p>
        {image && (
          <Image src={image} alt={title || "Önizleme görseli"} width={800} height={400} className="w-full h-64 object-cover rounded mb-4" />
        )}
        <h1 className="text-3xl font-bold mb-2">{title || "(Başlıksız)"}</h1>
        {subtitle && <p className="text-primary/70 mb-2">{subtitle}</p>}
        {meta.length > 0 && (
          <div className="flex gap-4 text-sm text-primary/60 mb-6">
            {meta.map((m, i) => <span key={i}>{m}</span>)}
          </div>
        )}
        <div className="border-t border-primary/10 pt-4">
          {isRichText ? (
            <TiptapEditor value={contentHtml} readOnly />
          ) : (
            <p className="whitespace-pre-wrap">{contentHtml}</p>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Manuel test — bileşen tek başına derleniyor mu**

`npm run dev` çalıştır, konsol/terminalde `PreviewModal.js` ile ilgili import/syntax hatası olmadığını doğrula (henüz hiçbir yerden çağrılmıyor, sadece derleme hatası vermediğini kontrol ediyoruz).

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/PreviewModal.js
git commit -m "feat: admin içerik önizleme modalı bileşeni ekle"
```

- [ ] **Step 4: `AddArticle.js`'e önizleme butonu ekle**

`src/components/admin/AddArticle.js` dosyasının başına import ekle (satır 5'in altına):

```jsx
import PreviewModal from "./PreviewModal";
```

`useState` tanımlarının yanına (satır 30-35 civarı) ekle:

```jsx
  const [previewOpen, setPreviewOpen] = useState(false);
```

Satır 233-237 arasındaki submit butonu bloğunu değiştir:

```jsx
                <div className="w-full flex justify-center gap-4">
                  <button type="button" onClick={() => setPreviewOpen(true)} className="max-w-[200px] min-w-[150px] bg-white border border-primary text-primary py-2 rounded font-semibold hover:bg-primary/10 cursor-pointer transition">
                    Önizle
                  </button>
                  <button type="submit" disabled={loading} className="max-w-[300px] min-w-[200px]  bg-primary text-white py-2 rounded font-semibold hover:bg-secondary cursor-pointer  transition">
                    {loading ? (editData ? "Güncelleniyor..." : "Kaydediliyor...") : (editData ? "Makale Güncelle" : "Makale Ekle")}
                  </button>
                </div>
```

Form kapanış `</form>` etiketinden sonra, `</div>` (modal container) kapanışından önce ekle (satır 239 civarı):

```jsx
            <PreviewModal
              open={previewOpen}
              onClose={() => setPreviewOpen(false)}
              title={form.title}
              subtitle={form.description}
              meta={[form.author, form.date]}
              image={form.image}
              contentHtml={form.content}
              isRichText={false}
            />
```

- [ ] **Step 5: Manuel test**

Admin panelde makale formunu aç, birkaç alanı doldur, "Önizle" butonuna bas, girilen başlık/açıklama/yazar/tarih/görsel/içeriğin modal içinde göründüğünü doğrula, X ile kapat.

- [ ] **Step 6: Commit**

```bash
git add src/components/admin/AddArticle.js
git commit -m "feat: makale formuna önizleme butonu ekle"
```

- [ ] **Step 7: `BlogAdd.js`'e önizleme butonu ekle**

Import ekle (satır 6'nın altına):

```jsx
import PreviewModal from "./PreviewModal";
```

State ekle (satır 56-57 civarı):

```jsx
  const [previewOpen, setPreviewOpen] = useState(false);
```

Satır 191-195 arasındaki submit butonu bloğunu değiştir:

```jsx
                <div className="w-full flex justify-center gap-4">
                  <button type="button" onClick={() => setPreviewOpen(true)} className="max-w-[200px] min-w-[150px] bg-white border border-primary text-primary py-2 rounded font-semibold hover:bg-primary/10 cursor-pointer transition">
                    Önizle
                  </button>
                  <button type="submit" disabled={loading} className="max-w-[300px] min-w-[200px]  bg-primary text-white py-2 rounded font-semibold hover:bg-secondary cursor-pointer  transition">
                    {loading ? (editData ? "Güncelleniyor..." : "Kaydediliyor...") : (editData ? "Blog Güncelle" : "Blog Ekle")}
                  </button>
                </div>
```

Form kapanışından sonra ekle (satır 197 civarı):

```jsx
            <PreviewModal
              open={previewOpen}
              onClose={() => setPreviewOpen(false)}
              title={form.title}
              subtitle={form.description}
              meta={[form.category, form.date]}
              contentHtml={richText}
              isRichText={true}
            />
```

- [ ] **Step 8: Manuel test**

Blog formunda Tiptap ile zengin metin yaz (kalın/başlık/liste dene), "Önizle"ye bas, biçimlendirmenin (kalın, başlıklar, listeler) önizlemede de göründüğünü doğrula (readOnly Tiptap render'ı).

- [ ] **Step 9: Commit**

```bash
git add src/components/admin/BlogAdd.js
git commit -m "feat: blog formuna önizleme butonu ekle"
```

---

## Task 4: Admin Toplu Silme

**Files:**
- Modify: `src/app/admin/articles/page.js`
- Modify: `src/app/admin/blogs/page.js`

**Interfaces:**
- Consumes: Mevcut `DELETE /api/admin/articles?slug=...` ve `DELETE /api/admin/blogs?slug=...` endpoint'leri (yeni endpoint eklenmiyor, mevcut tekli silme döngüyle çağrılıyor).

- [ ] **Step 1: Makale listesine çoklu seçim ekle**

`src/app/admin/articles/page.js`'te `deletingId` state'inin yanına (satır 12 civarı) ekle:

```jsx
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
```

`handleDelete` fonksiyonundan sonra (satır 49 civarı) ekle:

```jsx
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
```

Kart grid'inden ÖNCE (satır 74 civarı, `<section className="max-w-[1440px] w-full container mx-auto px-4 py-16">` içine, grid div'inden önce) ekle:

```jsx
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
```

Her kartın en üstüne (satır 77'deki kart div'inin İÇİNE, ilk çocuk olarak) bir checkbox ekle:

```jsx
                     <div key={article.id ?? index} className="group border-1 border-gray-300 relative flex-col flex gap-2 bg-foreground rounded-sm overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500">
                       <input
                         type="checkbox"
                         checked={selectedIds.includes(article.slug)}
                         onChange={(e) => { e.stopPropagation(); toggleSelect(article.slug); }}
                         className="absolute top-2 left-2 z-10 w-5 h-5 cursor-pointer"
                       />
```

(Bu satır mevcut `<Image .../>` satırından önce eklenir, `<Image>` satırı olduğu gibi kalır.)

- [ ] **Step 2: Manuel test**

Admin makale listesinde birkaç makaleyi checkbox ile seç, "Seçilenleri Sil (N)" butonunun göründüğünü doğrula, sil, seçilen makalelerin listeden kaybolduğunu ve toast bildirimi göründüğünü doğrula.

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/articles/page.js
git commit -m "feat: admin makale listesine toplu silme ekle"
```

- [ ] **Step 4: Blog listesine çoklu seçim ekle**

`src/app/admin/blogs/page.js`'te `deletingId` state'inin yanına (satır 11 civarı) ekle:

```jsx
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
```

`handleDelete` fonksiyonundan sonra (satır 45 civarı) ekle:

```jsx
  const toggleSelect = (slug) => {
    setSelectedIds(prev => prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`${selectedIds.length} blogu silmek istediğinize emin misiniz?`)) return;

    setBulkDeleting(true);
    let failCount = 0;
    for (const slug of selectedIds) {
      try {
        const res = await fetch(`/api/admin/blogs?slug=${slug}`, {
          method: 'DELETE',
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
      toast.error(`${failCount} blog silinemedi.`);
    } else {
      toast.success("Seçilen bloglar silindi!");
    }
    fetchBlogs();
  };
```

Grid'den önce (satır 74 civarı) ekle:

```jsx
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
```

Kart div'inin içine (satır 76'daki `<div key={blog.slug} ...>` içine, ilk çocuk olarak) checkbox ekle:

```jsx
                    <div
                        key={blog.slug}
                        className="group border-1 border-gray-300 relative flex-col flex gap-2 bg-foreground rounded-sm overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500"
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(blog.slug)}
                        onChange={(e) => { e.stopPropagation(); toggleSelect(blog.slug); }}
                        className="absolute top-2 left-2 z-10 w-5 h-5 cursor-pointer"
                      />
```

- [ ] **Step 5: Manuel test**

Admin blog listesinde çoklu seçim + toplu silmenin çalıştığını doğrula.

- [ ] **Step 6: Commit**

```bash
git add src/app/admin/blogs/page.js
git commit -m "feat: admin blog listesine toplu silme ekle"
```

---

## Task 5: Zamanlanmış Yayın

**Not:** Bu task gerçek bir cron/Cloud Function KURMAZ. Bunun yerine "lazy" (istek anında) kontrol yapılır: `status: "scheduled"` olan bir içerik, `scheduledAt` zamanı geçtiğinde bir sonraki public API isteğinde otomatik olarak yayınlanmış gibi döner. Task 1 ve Task 2'nin tamamlanmış olması gerekir (bu task onların üzerine inşa edilir).

**Files:**
- Modify: `src/app/api/articles/route.js` (GET filtre mantığı)
- Modify: `src/app/api/blogs/route.js` (GET filtre mantığı)
- Modify: `src/app/api/admin/articles/route.js` (POST/PUT — `scheduledAt` kabul et)
- Modify: `src/app/api/admin/blogs/route.js` (POST/PUT — `scheduledAt` kabul et)
- Modify: `src/components/admin/AddArticle.js` (form — `status` seçeneklerine "scheduled" ekle + tarih/saat input)
- Modify: `src/components/admin/BlogAdd.js` (aynısı)

**Interfaces:**
- Produces: `status: 'draft' | 'scheduled' | 'published'`, `scheduledAt: string (ISO datetime) | null`.
- Consumes: Task 1 Step 5'teki `articles/route.js` GET, Task 2 Step 5'teki `blogs/route.js` GET (üzerine yazılır).

- [ ] **Step 1: `api/articles/route.js` GET filtresini genişlet**

`src/app/api/articles/route.js` dosyasının tamamını değiştir:

```js
import { NextResponse } from 'next/server';
import admin from '../../../services/firebase/firebaseAdmin';

function isPubliclyVisible(doc) {
  if (doc.status === undefined) return true; // eski, status alanı olmayan makaleler
  if (doc.status === 'published') return true;
  if (doc.status === 'scheduled' && doc.scheduledAt) {
    return new Date(doc.scheduledAt).getTime() <= Date.now();
  }
  return false; // draft, veya zamanı henüz gelmemiş scheduled
}

export async function GET() {
  try {
    const db = admin.firestore();
    const snapshot = await db.collection('articles').get();
    const articles = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(isPubliclyVisible);

    // En güncel makale ilk sırada gösterilsin diye tarihe göre (yeniden eskiye) sırala
    articles.sort((a, b) => {
      const da = a.date ? new Date(a.date).getTime() : 0;
      const db_ = b.date ? new Date(b.date).getTime() : 0;
      return db_ - da;
    });

    return NextResponse.json({ articles }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

- [ ] **Step 2: Manuel test**

Firebase Console'da bir test makalesine `status: "scheduled"`, `scheduledAt: "2099-01-01T00:00:00.000Z"` (gelecekteki bir tarih) yaz. `/api/articles`'ta bu makalenin GÖRÜNMEDİĞİNİ doğrula. `scheduledAt`'ı geçmişte bir tarihe çevir (örn. `"2020-01-01T00:00:00.000Z"`), `/api/articles`'ı yenile, makalenin ARTIK GÖRÜNDÜĞÜNÜ doğrula.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/articles/route.js
git commit -m "feat: zamanlanmış makale yayınını public API'de lazy kontrol ile destekle"
```

- [ ] **Step 4: `api/blogs/route.js` GET filtresini genişlet**

`src/app/api/blogs/route.js` dosyasının tamamını değiştir:

```js
import { NextResponse } from 'next/server';
import admin from '../../../services/firebase/firebaseAdmin';

function isPubliclyVisible(doc) {
  if (doc.status === undefined) return true;
  if (doc.status === 'published') return true;
  if (doc.status === 'scheduled' && doc.scheduledAt) {
    return new Date(doc.scheduledAt).getTime() <= Date.now();
  }
  return false;
}

export async function GET() {
  try {
    const db = admin.firestore();
    const snapshot = await db.collection('blogs').get();
    const blogs = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(isPubliclyVisible);
    return NextResponse.json({ blogs }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

- [ ] **Step 5: Manuel test**

Aynı prosedürü (Step 2) blog için tekrarla.

- [ ] **Step 6: Commit**

```bash
git add src/app/api/blogs/route.js
git commit -m "feat: zamanlanmış blog yayınını public API'de lazy kontrol ile destekle"
```

- [ ] **Step 7: Admin API'lerine `scheduledAt` kabul ettir**

`src/app/api/admin/articles/route.js`'te POST handler'ında (Task 1 Step 1'de eklenen `finalStatus` satırından sonra) ekle:

```js
    const { title, description, image, author, date, content, status, scheduledAt } = body;
    if (!title || !description || !image || !author || !date || !content) {
      return NextResponse.json({ error: 'Eksik alan var.' }, { status: 400 });
    }
    const finalStatus = ['published', 'scheduled'].includes(status) ? status : 'draft';
    if (finalStatus === 'scheduled' && !scheduledAt) {
      return NextResponse.json({ error: 'Zamanlanmış yayın için tarih/saat gerekli.' }, { status: 400 });
    }
```

`db.collection('articles').doc(slug).set({...})` çağrısına `scheduledAt: finalStatus === 'scheduled' ? scheduledAt : null` alanını ekle. PUT handler'ında da aynı değişikliği yap (hem body destructuring hem `finalStatus`/`scheduledAt` validasyonu hem `set(..., { merge: true })` çağrısı).

- [ ] **Step 8: `api/admin/blogs/route.js`'e aynı değişikliği uygula**

Task 2 Step 1-2'deki POST/PUT handler'larına, Step 7'deki article mantığının aynısını (`status`/`scheduledAt` destructuring, `finalStatus` hesaplama, validasyon, Firestore'a `scheduledAt` yazma) uygula.

- [ ] **Step 9: Manuel test**

`/api/admin/articles` ve `/api/admin/blogs`'a (Postman/curl veya admin formundan, Step 10-11'de form eklenmeden önce doğrudan `fetch` ile DevTools console'dan) `status:"scheduled"` ama `scheduledAt` GÖNDERMEDEN istek at, `400` ve "Zamanlanmış yayın için tarih/saat gerekli." hatası aldığını doğrula.

- [ ] **Step 10: Commit**

```bash
git add src/app/api/admin/articles/route.js src/app/api/admin/blogs/route.js
git commit -m "feat: admin API'lerine zamanlanmış yayın (scheduledAt) validasyonu ekle"
```

- [ ] **Step 11: `AddArticle.js` formuna zamanlama seçeneği ekle**

Task 1 Step 8'de eklenen durum select'ini güncelle — `<option value="published">Yayınlandı</option>`'dan sonra ekle:

```jsx
                  <option value="scheduled">Zamanlanmış</option>
```

Form state'ine `scheduledAt: ""` ekle (Task 1 Step 8'deki üç `useState`/`handleOpen` bloğunun her birine). Durum select'inin hemen altına, `status === 'scheduled'` ise görünen bir datetime input ekle:

```jsx
              {form.status === 'scheduled' && (
                <div className="flex items-center space-x-4">
                  <label htmlFor="scheduledAt" className="font-semibold">Yayın Tarihi/Saati</label>
                  <input
                    id="scheduledAt"
                    name="scheduledAt"
                    type="datetime-local"
                    value={form.scheduledAt}
                    onChange={handleChange}
                    className="border-1 border-primary/20 p-2 rounded"
                    required
                  />
                </div>
              )}
```

`handleSubmit`'teki `payload` oluşturulurken `scheduledAt`'ı ISO string'e çevir: `payload.scheduledAt` gönderilmeden önce, `const payload = { ...form, scheduledAt: form.status === 'scheduled' && form.scheduledAt ? new Date(form.scheduledAt).toISOString() : null, ... }` şeklinde düzenle.

- [ ] **Step 12: `BlogAdd.js`'e aynı değişikliği uygula**

Task 2 Step 8'deki durum select'ine `"scheduled"` seçeneğini, form state'ine `scheduledAt` alanını ve Step 11'deki aynı datetime input JSX'ini (id'ler aynı kalabilir, iki farklı bileşende olduğu için çakışma olmaz) ekle. `handleSubmit`'teki `payload`'a aynı ISO dönüşümünü uygula.

- [ ] **Step 13: Manuel test**

Admin panelde bir makale/blogu "Zamanlanmış" seç, ileri bir tarih/saat gir, kaydet. Firebase Console'da `status:"scheduled"` ve `scheduledAt` alanının doğru ISO string olarak kaydedildiğini doğrula. `/api/articles` (veya `/blogs`) çıktısında bu içeriğin henüz görünmediğini doğrula.

- [ ] **Step 14: Commit**

```bash
git add src/components/admin/AddArticle.js src/components/admin/BlogAdd.js
git commit -m "feat: makale ve blog formlarına zamanlanmış yayın seçeneği ekle"
```

---

## Task 6: Sürüm Geçmişi

**Files:**
- Modify: `src/app/api/admin/articles/route.js` (PUT — history yazma)
- Modify: `src/app/api/admin/blogs/route.js` (PUT — history yazma)
- Create: `src/app/api/admin/articles/history/route.js` (GET — history listeleme)
- Create: `src/app/api/admin/blogs/history/route.js` (GET — history listeleme)
- Modify: `src/components/admin/AddArticle.js` (geçmiş sürümler listesi UI)
- Modify: `src/components/admin/BlogAdd.js` (geçmiş sürümler listesi UI)

**Interfaces:**
- Produces: `articles/{slug}/history/{autoId}` ve `blogs/{slug}/history/{autoId}` alt-koleksiyonlarında, güncelleme ÖNCESİ dokümanın tam kopyası + `savedAt` (ISO string) alanı.
- Consumes: Task 1/2'deki mevcut PUT handler'ları (üzerine yazılır).

- [ ] **Step 1: `api/admin/articles/route.js` PUT handler'ına history yazma ekle**

PUT handler'ında (Task 5 Step 7'de güncellenmiş hâliyle), Firestore `set(..., { merge: true })` çağrısından ÖNCE, mevcut dokümanı oku ve history'e yaz:

```js
    const db = admin.firestore();
    const docRef = db.collection('articles').doc(slug);
    const existingDoc = await docRef.get();
    if (existingDoc.exists) {
      await docRef.collection('history').add({
        ...existingDoc.data(),
        savedAt: new Date().toISOString()
      });
    }
    await docRef.set({
      slug,
      title,
      description,
      image,
      author,
      date,
      content,
      status: finalStatus,
      scheduledAt: finalStatus === 'scheduled' ? scheduledAt : null
    }, { merge: true });
```

(Not: `const db = admin.firestore();` satırı zaten vardı, `docRef` üzerinden erişime çevrilerek tekrar kullanılıyor — `db.collection('articles').doc(slug)` tekrarını `docRef`'e indirger.)

- [ ] **Step 2: Manuel test**

Bir makaleyi admin panelden iki kez farklı içerikle güncelle. Firebase Console'da `articles/{slug}/history` alt-koleksiyonunda bir doküman biriktiğini, içeriğinin güncellemeden ÖNCEKİ hâli olduğunu doğrula.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/admin/articles/route.js
git commit -m "feat: makale güncellemelerinde sürüm geçmişi kaydet"
```

- [ ] **Step 4: `api/admin/blogs/route.js` PUT handler'ına aynı değişikliği uygula**

Aynı deseni (Step 1) blog PUT handler'ına, `db.collection('blogs').doc(slug)` üzerinden uygula.

- [ ] **Step 5: Manuel test**

Aynı prosedürü (Step 2) blog için tekrarla.

- [ ] **Step 6: Commit**

```bash
git add src/app/api/admin/blogs/route.js
git commit -m "feat: blog güncellemelerinde sürüm geçmişi kaydet"
```

- [ ] **Step 7: Makale history listeleme endpoint'i oluştur**

`src/app/api/admin/articles/history/route.js`:

```js
import { NextResponse } from 'next/server';
import admin from '../../../../../services/firebase/firebaseAdmin';

async function requireAdmin(req) {
  try {
    const cookies = req.headers.get('cookie') || '';
    const baseUrl = new URL(req.url).origin;
    const sessionRes = await fetch(`${baseUrl}/api/auth/session`, {
      headers: {
        cookie: cookies,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
      },
    });
    if (!sessionRes.ok) return null;
    const session = await sessionRes.json();
    if (!session?.user) return null;
    if (session.user.isAdmin === true) return { uid: session.user.id };
    if (session.user.id) {
      const db = admin.firestore();
      const doc = await db.collection('users').doc(session.user.id).get();
      if (doc.exists && doc.data().isAdmin) return { uid: session.user.id };
    }
    return null;
  } catch (error) {
    console.error('Admin auth error:', error);
    return null;
  }
}

export async function GET(req) {
  try {
    const auth = await requireAdmin(req);
    if (!auth) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');
    if (!slug) return NextResponse.json({ error: 'slug gerekli.' }, { status: 400 });

    const db = admin.firestore();
    const snapshot = await db.collection('articles').doc(slug).collection('history').orderBy('savedAt', 'desc').get();
    const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ history }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

- [ ] **Step 8: Manuel test**

Tarayıcıda admin olarak giriş yapmış şekilde `http://localhost:3001/api/admin/articles/history?slug=<test-makale-slug>` adresini aç, Step 1-2'de biriken history dokümanlarının JSON olarak döndüğünü doğrula.

- [ ] **Step 9: Commit**

```bash
git add src/app/api/admin/articles/history/route.js
git commit -m "feat: makale sürüm geçmişi listeleme endpoint'i ekle"
```

- [ ] **Step 10: Blog history listeleme endpoint'i oluştur**

`src/app/api/admin/blogs/history/route.js` — Step 7'deki dosyanın aynısı, sadece `db.collection('articles')` yerine `db.collection('blogs')` kullan:

```js
import { NextResponse } from 'next/server';
import admin from '../../../../../services/firebase/firebaseAdmin';

async function requireAdmin(req) {
  try {
    const cookies = req.headers.get('cookie') || '';
    const baseUrl = new URL(req.url).origin;
    const sessionRes = await fetch(`${baseUrl}/api/auth/session`, {
      headers: {
        cookie: cookies,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
      },
    });
    if (!sessionRes.ok) return null;
    const session = await sessionRes.json();
    if (!session?.user) return null;
    if (session.user.isAdmin === true) return { uid: session.user.id };
    if (session.user.id) {
      const db = admin.firestore();
      const doc = await db.collection('users').doc(session.user.id).get();
      if (doc.exists && doc.data().isAdmin) return { uid: session.user.id };
    }
    return null;
  } catch (error) {
    console.error('Admin auth error:', error);
    return null;
  }
}

export async function GET(req) {
  try {
    const auth = await requireAdmin(req);
    if (!auth) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');
    if (!slug) return NextResponse.json({ error: 'slug gerekli.' }, { status: 400 });

    const db = admin.firestore();
    const snapshot = await db.collection('blogs').doc(slug).collection('history').orderBy('savedAt', 'desc').get();
    const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ history }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

- [ ] **Step 11: Manuel test**

Aynı prosedürü (Step 8) blog için tekrarla.

- [ ] **Step 12: Commit**

```bash
git add src/app/api/admin/blogs/history/route.js
git commit -m "feat: blog sürüm geçmişi listeleme endpoint'i ekle"
```

- [ ] **Step 13: `AddArticle.js`'e "Geçmiş Sürümler" listesi ekle**

`useState` tanımlarına ekle:

```jsx
  const [history, setHistory] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);
```

`editData` yüklenirken (mevcut `useEffect`'in içine, `setOpen(true);`'dan önce) history'i çek:

```jsx
      fetch(`/api/admin/articles/history?slug=${editData.slug}`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => setHistory(data.history || []))
        .catch(() => setHistory([]));
```

Önizleme butonunun yanına, SADECE `editData` varken görünecek bir "Geçmiş (N)" butonu ekle:

```jsx
                  {editData && history.length > 0 && (
                    <button type="button" onClick={() => setHistoryOpen(true)} className="max-w-[200px] min-w-[150px] bg-white border border-primary text-primary py-2 rounded font-semibold hover:bg-primary/10 cursor-pointer transition">
                      Geçmiş ({history.length})
                    </button>
                  )}
```

Modal içine, `PreviewModal`'dan sonra basit bir liste modalı ekle:

```jsx
            {historyOpen && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70]">
                <div className="max-w-lg w-full mx-auto p-6 bg-white rounded shadow relative max-h-[80vh] overflow-scroll">
                  <button onClick={() => setHistoryOpen(false)} className="absolute top-2 right-2 text-gray-500 hover:text-primary" type="button">X</button>
                  <h3 className="text-xl font-bold mb-4">Geçmiş Sürümler</h3>
                  <ul className="space-y-2">
                    {history.map(h => (
                      <li key={h.id} className="border border-primary/10 p-2 rounded">
                        <p className="text-sm text-primary/60">{new Date(h.savedAt).toLocaleString('tr-TR')}</p>
                        <p className="font-semibold">{h.title}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
```

- [ ] **Step 14: Manuel test**

Task 6 Step 2'de en az bir güncelleme geçmişi biriken bir makaleyi admin panelden düzenlemeye aç, "Geçmiş (N)" butonunun göründüğünü, tıklayınca tarih + o zamanki başlığın listelendiğini doğrula.

- [ ] **Step 15: Commit**

```bash
git add src/components/admin/AddArticle.js
git commit -m "feat: makale düzenleme formuna geçmiş sürümler listesi ekle"
```

- [ ] **Step 16: `BlogAdd.js`'e aynı "Geçmiş Sürümler" listesini ekle**

Step 13'teki aynı deseni, `/api/admin/articles/history` yerine `/api/admin/blogs/history` endpoint'ini kullanarak `BlogAdd.js`'e uygula.

- [ ] **Step 17: Manuel test**

Aynı prosedürü (Step 14) blog için tekrarla.

- [ ] **Step 18: Commit**

```bash
git add src/components/admin/BlogAdd.js
git commit -m "feat: blog düzenleme formuna geçmiş sürümler listesi ekle"
```

**Opsiyonel — geri alma (bu task'ın "tamamlandı" sayılması için ŞART DEĞİL):** Geçmiş listesindeki her satıra bir "Bu sürüme dön" butonu eklenip, tıklandığında o history dokümanının içeriği forma (`setForm`, blog için `setRichText`) yüklenebilir — kullanıcı sonra normal "Kaydet"e basarak geri yükler. Ayrı bir API endpoint'i gerekmez, mevcut PUT zaten kullanılır. İstenirse ayrı bir task olarak sonradan eklenebilir.

---

## Self-Review

**1. Spec kapsaması:** Kullanıcının istediği 5 özellik — (1) taslak/yayın durumu, (2) önizleme modu, (3) toplu işlemler, (4) zamanlanmış yayın, (5) sürüm geçmişi — sırasıyla Task 1-2, Task 3, Task 4, Task 5, Task 6'da karşılanıyor. Her task, önceki review'da bulunan gerçek dosya/satır referanslarına dayanıyor (`AddArticle.js`, `BlogAdd.js`, `TiptapEditor.jsx`, admin/public API route'ları).

**2. Placeholder taraması:** Tüm kod blokları gerçek, çalıştırılabilir kod içeriyor; "TODO"/"benzer şekilde ekle" gibi placeholder yok — tekrarlayan durumlarda (Task 5 Step 8, Task 6 Step 4/10/16) bile hangi dosyanın hangi satırının hangi koda dönüştüğü somut olarak (veya tam kod bloğu tekrar yazılarak) belirtildi.

**3. Tip/isim tutarlılığı:** `status` alanı ('draft'/'published'/'scheduled') Task 1, 2 ve 5 boyunca aynı isimle kullanıldı. `scheduledAt` (ISO string) Task 5 ve filtre fonksiyonlarında tutarlı. `isPubliclyVisible()` fonksiyonu Task 5'te her iki route'a (articles/blogs) aynı imzayla eklendi. `PreviewModal` prop isimleri (`open`, `onClose`, `title`, `subtitle`, `meta`, `image`, `contentHtml`, `isRichText`) Task 3'te tanımlandı ve Task 3 Step 4/7'de aynı isimlerle çağrıldı. History endpoint response şekli (`{ history: [...] }`) Task 6 Step 7/10'da tanımlandı, Step 13/16'daki UI kodu bu şekli tüketiyor.

**Bilinen sınırlama:** Zamanlanmış yayın (Task 5) gerçek bir arka plan job'u DEĞİLDİR — sadece public API'ye her istek geldiğinde "zamanı gelmiş mi" kontrolü yapar. Bu, kullanıcının onayladığı kapsam dahilindeydi (gerçek cron/Cloud Function kurmak bu plana dahil edilmedi).
