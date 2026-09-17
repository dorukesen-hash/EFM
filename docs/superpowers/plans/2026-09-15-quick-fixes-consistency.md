# Admin Panel Küçük Düzeltmeler ve Tutarlılık Planı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Admin panelindeki veri kaynağı tutarsızlıklarını, tekrar eden yetki-kontrol kodunu ve bozuk "resim klasörü" mantığını düzeltmek; blog'lara kapak görseli (cover image) alanı eklemek.

**Architecture:** Next.js 16 App Router + Firestore + Firebase Storage (Admin SDK) üzerinde çalışan mevcut mimariye dokunmadan, sadece hatalı/tutarsız kod yollarını düzeltmek ve blog şemasına opsiyonel bir `image` alanı eklemek. Yeni bir soyutlama katmanı eklenmiyor; tek istisna, 3 route dosyasında birebir kopyalanmış `requireAdmin` fonksiyonunun `src/services/auth/requireAdmin.js` altında ortaklanması.

**Tech Stack:** Next.js 16 (App Router, Route Handlers), next-auth v4 (JWT session), firebase-admin (Firestore + Storage), React 19 (client components), Tailwind v4, react-toastify.

**Spec:** Bu conversation'daki kod incelemesi ve kullanıcı onayına dayanır, ayrı bir spec dosyası yok.

## Global Constraints

- Bu projede otomatik test altyapısı YOK (jest/vitest/playwright kurulu değil, `package.json`'da test script'i yok). Bu nedenle her task'ın "test" adımı otomatik test DEĞİL, `npm run dev` ile başlatıp tarayıcıda belirtilen adımları izleyerek yapılan MANUEL DOĞRULAMA'dır. Yeni bir test framework kurmak bu planın kapsamı dışındadır.
- Mevcut kod stiline uy: kullanıcıya dönük metinler ve kod yorumları Türkçe, JS/JSX İngilizce isimlendirme, Tailwind utility class'ları, hata/başarı bildirimleri `react-toastify` ile.
- Kimlik doğrulaması gerektiren tüm `fetch` çağrılarında `credentials: 'include'` kullan (mevcut kodda zaten bu pattern var).
- Firestore'a yazılan dokümanlarda var olan alanları KIRMA — yeni `image` alanı blog şemasına eklenirken, resim seçilmemiş eski/yeni bloglar için boş string (`''`) kabul edilecek şekilde OPSİYONEL olacak (zorunlu alan validasyonuna eklenmeyecek).
- Değişiklik yapılan her task kendi başına çalışır ve test edilebilir olmalı; bir sonraki task'ı beklemeden commit'lenebilir.

---

## Dosya Yapısı Özeti

| Dosya | Durum | Sorumluluk |
|---|---|---|
| `src/app/admin/articles/page.js` | Değişecek | Admin makale listesini doğru (yetkili) endpoint'ten çeksin |
| `src/services/auth/requireAdmin.js` | **Yeni** | 3 route dosyasında kopyalanan admin-yetki-kontrol mantığının tek kopyası |
| `src/app/api/admin/articles/route.js` | Değişecek | Yerel `requireAdmin`'i kaldır, ortak helper'ı kullan |
| `src/app/api/admin/blogs/route.js` | Değişecek | Yerel `requireAdmin`'i kaldır, ortak helper'ı kullan; `image` alanını kabul et |
| `src/app/api/upload/route.js` | Değişecek | Yerel `requireAdmin`'i kaldır, ortak helper'ı kullan; `folder` parametresi bug'ını düzelt |
| `src/components/admin/BlogAdd.js` | Değişecek | Görsel seçici UI (yerel + Firebase Storage) eklenecek |
| `src/app/admin/blogs/page.js` | Değişecek | Blog kartlarında kapak görseli thumbnail'ı |
| `src/app/pages/blog/page.js` | Değişecek | Public blog listesinde kapak görseli |
| `src/app/pages/blog/[slug]/page.js` | Değişecek | Public blog detayında kapak görseli |

---

### Task 1: Admin makale listesini doğru endpoint'ten çek

**Sorun:** `src/app/admin/articles/page.js:16` herkese açık `/api/articles`'tan veri çekiyor; `src/app/admin/blogs/page.js:15` ise doğru şekilde `/api/admin/blogs`'tan çekiyor. `src/app/api/admin/articles/route.js:138-150`'de zaten yetkili bir `GET` var, kullanılmıyor.

**Files:**
- Modify: `src/app/admin/articles/page.js:14-23`

**Interfaces:**
- Consumes: `GET /api/admin/articles` (mevcut, `src/app/api/admin/articles/route.js:138-150`) — `{ articles: [...] }` döner, yetkisizse `{ error }` + 401.
- Produces: Yok (sayfa bileşeni, başka task tarafından tüketilmiyor).

- [ ] **Step 1: Kodu değiştir**

`src/app/admin/articles/page.js` içindeki `fetchArticles` fonksiyonunu şu şekilde güncelle:

```js
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
```

(Tek fark: URL `/api/articles` → `/api/admin/articles` ve `credentials: 'include'` eklendi — dosyadaki diğer admin fetch çağrılarıyla tutarlı olsun diye.)

- [ ] **Step 2: Manuel doğrulama**

1. `npm run dev` ile sunucuyu başlat.
2. Admin hesabıyla giriş yap, `/admin/articles` sayfasına git.
3. Tarayıcı DevTools → Network sekmesinde, sayfanın `/api/admin/articles` isteği attığını doğrula (artık `/api/articles` değil).
4. Makale listesinin öncekiyle aynı şekilde göründüğünü doğrula (kart sayısı, başlıklar değişmemiş olmalı).
5. Bir makaleyi düzenle/sil, işlemin hâlâ çalıştığını doğrula.

Beklenen: Liste sorunsuz yükleniyor, network isteği `/api/admin/articles`'a gidiyor, mevcut düzenle/sil akışı bozulmamış.

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/articles/page.js
git commit -m "fix: admin makale listesi artık /api/admin/articles kullanıyor"
```

---

### Task 2: `requireAdmin` fonksiyonunu ortak bir helper'a çıkar (DRY)

**Sorun:** Birebir aynı `requireAdmin(req)` fonksiyonu 3 dosyada kopyalanmış: `src/app/api/admin/articles/route.js:5-49`, `src/app/api/admin/blogs/route.js:5-49`, `src/app/api/upload/route.js:4-42`. Her çağrıda kendi origin'ine ekstra bir `fetch('/api/auth/session')` yapıyor — gereksiz network round-trip. `getServerSession(authOptions)` App Router route handler'larında request/response parametresi almadan doğrudan çağrılabilir (next-auth v4.22+, cookie'leri `next/headers` üzerinden otomatik okur) ve bu projede next-auth `^4.24.13` kullanılıyor.

**Files:**
- Create: `src/services/auth/requireAdmin.js`
- Modify: `src/app/api/admin/articles/route.js:1-49`
- Modify: `src/app/api/admin/blogs/route.js:1-49`
- Modify: `src/app/api/upload/route.js:1-42`

**Interfaces:**
- Produces: `requireAdmin(): Promise<{ uid: string } | null>` — parametre almaz (önceki `requireAdmin(req)`'den farklı olarak `req` parametresi YOK, çünkü `getServerSession` cookie'leri kendi okuyor). Bu task'tan sonraki hiçbir task bu fonksiyonu değiştirmiyor.

- [ ] **Step 1: Ortak helper'ı oluştur**

`src/services/auth/requireAdmin.js`:

```js
// src/services/auth/requireAdmin.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../app/api/auth/[...nextauth]/route";
import admin from "../firebase/firebaseAdmin";

// App Router route handler'larında req/res parametresi gerekmez;
// getServerSession cookie'leri next/headers üzerinden kendi okur.
export async function requireAdmin() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return null;
    }

    // Session'da isAdmin varsa doğrudan kullan
    if (session.user.isAdmin === true) {
      return { uid: session.user.id };
    }

    // Session'da isAdmin eksikse Firestore'dan kontrol et
    if (session.user.id) {
      const db = admin.firestore();
      const doc = await db.collection('users').doc(session.user.id).get();
      if (doc.exists && doc.data().isAdmin) {
        return { uid: session.user.id };
      }
    }

    return null;
  } catch (error) {
    console.error('Admin auth error:', error);
    return null;
  }
}
```

- [ ] **Step 2: `admin/articles/route.js`'i güncelle**

`src/app/api/admin/articles/route.js` dosyasının başındaki (satır 1-49) importları ve yerel `requireAdmin` fonksiyonunu kaldır, yerine ortak helper'ı import et:

```js
import { NextResponse } from 'next/server';
import admin from '../../../../services/firebase/firebaseAdmin';
import { slugify } from '../../../../utils/slugify';
import { requireAdmin } from '../../../../services/auth/requireAdmin';
```

Dosyanın kalanında `requireAdmin(req)` çağrılan her yeri (POST, PUT, DELETE, GET içinde) `requireAdmin()` olarak güncelle (parametresiz):

```js
    const auth = await requireAdmin();
```

- [ ] **Step 3: `admin/blogs/route.js`'i aynı şekilde güncelle**

`src/app/api/admin/blogs/route.js` için Step 2'deki aynı değişikliği uygula: import'u ekle, yerel `requireAdmin` fonksiyonunu (satır 5-49) sil, tüm `requireAdmin(req)` çağrılarını `requireAdmin()` yap.

- [ ] **Step 4: `upload/route.js`'i aynı şekilde güncelle**

`src/app/api/upload/route.js` için de aynı değişikliği uygula: en üste

```js
import { NextResponse } from 'next/server';
import admin from '../../../services/firebase/firebaseAdmin';
import { requireAdmin } from '../../../services/auth/requireAdmin';
```

(dikkat: bu dosya `admin/articles` ve `admin/blogs`'tan bir dizin daha yukarıda olduğu için import path'i `../../../services/...` — üç seviye, dört değil), yerel `requireAdmin` fonksiyonunu (satır 4-42) sil, POST/GET/DELETE içindeki `requireAdmin(req)` çağrılarını `requireAdmin()` yap.

- [ ] **Step 5: Manuel doğrulama**

1. `npm run dev` ile sunucuyu başlat.
2. Admin hesabıyla giriş yap.
3. `/admin/articles`'ta bir makale ekle, düzenle, sil — üçü de başarıyla tamamlanmalı (toast mesajları görünmeli).
4. `/admin/blogs`'ta bir blog ekle, düzenle, sil — üçü de başarıyla tamamlanmalı.
5. `/admin/images`'tan bir resim yükle, listele, sil — üçü de başarıyla tamamlanmalı.
6. Admin olmayan bir hesapla (veya çıkış yapmış halde) `/admin/articles` sayfasında bir düzenleme isteği göndermeyi dene (örn. tarayıcı console'undan `fetch('/api/admin/articles', {method:'DELETE', credentials:'include'})`), 401 döndüğünü doğrula.
7. Terminal'de (dev server konsolu) hata/exception olmadığını doğrula.

Beklenen: Tüm admin CRUD akışları öncekiyle birebir aynı şekilde çalışıyor, yetkisiz istekler hâlâ 401 alıyor, konsolda hata yok.

- [ ] **Step 6: Commit**

```bash
git add src/services/auth/requireAdmin.js src/app/api/admin/articles/route.js src/app/api/admin/blogs/route.js src/app/api/upload/route.js
git commit -m "refactor: requireAdmin fonksiyonunu ortak helper'a çıkar, getServerSession kullan"
```

---

### Task 3: `/api/upload`'daki kırık `folder` parametresini düzelt

**Sorun:** `src/services/firebase/firebaseStorage.js` çağıran koddan bir `folder` parametresi gönderiyor (`uploadImage(file, 'articles')`, `listImages('blogs')` gibi), ama `src/app/api/upload/route.js` bunu tamamen yok sayıyor:
- POST'ta (satır 56) `const folder = 'EFM';` hardcoded — form-data'dan gelen `folder` hiç okunmuyor.
- GET'te (satır 131) `searchParams.get('EFM')` yanlış key okuyor (olması gereken `'folder'`), ve (satır 140) `prefix: 'EFM/'` hardcoded.

Sonucu: `listImages('articles')` ile `listImages('blogs')` her ikisi de aynı `EFM/` klasöründeki TÜM resimleri döndürüyor — "klasöre göre ayırma" özelliği fiilen çalışmıyor. Bu, Task 5'te blog'lara eklenecek görsel seçicinin de makale resimleriyle karışık görünmesine yol açar.

**Files:**
- Modify: `src/app/api/upload/route.js` (Task 2'de zaten değişmiş haliyle üzerine)

**Interfaces:**
- Consumes: `src/services/firebase/firebaseStorage.js`'deki `uploadImage(file, folder)` ve `listImages(folder)` — bunlar zaten `folder` parametresini backend'e gönderiyor, DEĞİŞMİYOR.
- Produces: `POST /api/upload` artık dosyayı `<folder>/<timestamp>_<name>` altına yükler; `GET /api/upload?folder=<folder>` artık sadece o klasördeki resimleri döndürür.

- [ ] **Step 1: POST'ta `folder`'ı form-data'dan oku**

`src/app/api/upload/route.js` içinde:

```js
    // Form data'yı al
    const formData = await req.formData();
    const file = formData.get('file');
    const folder = formData.get('folder') || 'EFM';
```

(Sadece `const folder = 'EFM';` satırını yukarıdaki gibi değiştir.)

- [ ] **Step 2: GET'te `folder` query param'ını doğru oku ve kullan**

```js
    const { searchParams } = new URL(req.url);
    const folder = searchParams.get('folder') || 'EFM';
```

ve birkaç satır altındaki:

```js
      const files = await bucket.getFiles({ prefix: `${folder}/` });
```

(Önceki `searchParams.get('EFM')` ve `prefix: 'EFM/'` satırlarını yukarıdaki gibi değiştir.)

- [ ] **Step 3: Manuel doğrulama**

1. `npm run dev` ile başlat, admin girişi yap.
2. `/admin/articles`'ta "Makale Ekle"yi aç, "Görsel Seç" bölümünde Firebase Storage'a yeni bir resim yükle (varsa mevcut bir resim seç, yoksa `/admin/images`'tan `articles` klasörüne bir resim yükle).
3. `/admin/blogs`'ta (Task 5 tamamlandıktan sonra tekrar test edilecek, şimdilik) `/admin/images` sayfasından farklı bir `folder` değeriyle (örn. geçici olarak `ImageUpload` bileşenine `folder="blogs"` verip) bir resim yükle.
4. Firebase Console → Storage'da dosyanın gerçekten `articles/...` ve `blogs/...` altında (tek bir `EFM/` klasöründe değil) göründüğünü doğrula.
5. `articles` klasörü için `listImages` çağrıldığında `blogs` klasöründeki resimlerin listede ÇIKMADIĞINI doğrula (Network sekmesinde `/api/upload?folder=articles` isteğinin cevabını kontrol et).

Beklenen: Klasörler artık gerçekten ayrışıyor; bir klasörün resim listesi başka klasörün resimlerini içermiyor.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/upload/route.js
git commit -m "fix: /api/upload artık folder parametresini gerçekten kullanıyor"
```

---

### Task 4: Blog şemasına `image` alanını backend'de destekle

**Sorun:** `blogs` koleksiyonunda kapak görseli alanı yok; `src/app/api/admin/blogs/route.js`'deki POST/PUT bunu kabul etmiyor.

**Files:**
- Modify: `src/app/api/admin/blogs/route.js` (POST: satır ~57-77, PUT: satır ~90-103 — Task 2 sonrası satır numaraları kayabilir, fonksiyon isimleriyle bul)

**Interfaces:**
- Produces: `blogs` koleksiyonundaki dokümanlar artık opsiyonel `image: string` alanı içerebilir (seçilmemişse `''`). Task 5, 6, 7 bu alanı okuyor.

- [ ] **Step 1: POST'a `image` ekle**

```js
    const body = await req.json();
    const { title, date, category, description, text, image } = body;
    if (!title || !date || !category || !description || !text) {
      return NextResponse.json({ error: 'Eksik alan var.' }, { status: 400 });
    }

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
      image: image || ''
    });
```

(Not: `image` bilerek zorunlu alan kontrolüne EKLENMEDİ — mevcut bloglar resimsiz kalabilsin.)

- [ ] **Step 2: PUT'a `image` ekle**

```js
    const body = await req.json();
    const { slug, title, date, category, description, text, image } = body;
    if (!slug || !title || !date || !category || !description || !text) {
      return NextResponse.json({ error: 'Eksik alan var.' }, { status: 400 });
    }
    const db = admin.firestore();
    await db.collection('blogs').doc(slug).set({
      slug,
      title,
      date,
      category,
      description,
      text,
      image: image || ''
    }, { merge: true });
```

- [ ] **Step 3: Manuel doğrulama**

1. `npm run dev` ile başlat, admin girişi yap.
2. Tarayıcı DevTools console'unda şu isteği manuel gönder (formdaki UI henüz `image` göndermiyor, Task 5'te eklenecek):
   ```js
   fetch('/api/admin/blogs', {
     method: 'POST',
     credentials: 'include',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ title: 'Test Blog', date: '2026-09-15', category: 'Hukuk', description: 'test', text: '<p>test</p>', image: 'https://example.com/test.jpg' })
   }).then(r => r.json()).then(console.log)
   ```
3. Firestore Console'da `blogs/test-blog` dokümanında `image: "https://example.com/test.jpg"` alanının kaydedildiğini doğrula.
4. Aynı isteği `image` GÖNDERMEDEN de tekrarla (başka bir title ile), dokümanın `image: ""` ile başarıyla oluştuğunu doğrula (400 hatası ALMAMALI).
5. Test için oluşturduğun dokümanları admin panelden sil.

Beklenen: `image` alanı hem verilince hem verilmeyince hatasız kaydediliyor.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/admin/blogs/route.js
git commit -m "feat: blog şemasına opsiyonel image alanı ekle"
```

---

### Task 5: Admin Blog formuna görsel seçici ekle

**Sorun:** `src/components/admin/BlogAdd.js`'de resim seçme UI'ı yok; `src/components/admin/AddArticle.js`'de zaten var olan pattern (yerel görsel listesi + Firebase Storage görselleri) blog formuna da eklenmeli.

**Files:**
- Modify: `src/components/admin/BlogAdd.js`

**Interfaces:**
- Consumes: Task 4'teki `image` alanı (backend artık kabul ediyor); `listImages(folder)` (`src/services/firebase/firebaseStorage.js`, Task 3'te düzeltildi — artık gerçekten klasöre göre filtreliyor).
- Produces: Yok.

- [ ] **Step 1: Import'ları ve state'i güncelle**

`src/components/admin/BlogAdd.js` en üstteki import'ları güncelle:

```js
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
```

`form` state'ine `image` ekle:

```js
  const [form, setForm] = useState({
    title: "",
    date: "",
    category: "",
    description: "",
    text: "",
    image: ""
  });
```

Firebase Storage görselleri için yeni state ekle (mevcut `richText`/`error` state'lerinin yanına):

```js
  const [storageImages, setStorageImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
```

- [ ] **Step 2: `editData` effect'ini ve resetleri güncelle**

```js
  useEffect(() => {
    if (editData) {
      setForm({
        title: editData.title || "",
        date: editData.date || "",
        category: editData.category || "",
        description: editData.description || "",
        text: editData.text || "",
        image: editData.image || ""
      });
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
```

`handleSubmit`'teki reset satırını güncelle:

```js
        setForm({ title: "", date: "", category: "", description: "", text: "", image: "" });
```

`handleOpen`'daki reset'i güncelle:

```js
  const handleOpen = () => {
    setOpen(true);
    setRichText('');
    setForm({ title: "", date: "", category: "", description: "", text: "", image: "" });
  };
```

- [ ] **Step 3: Görsel seçici UI'ı ekle**

Kategori seçim `div`'inden sonra, `<label className="font-semibold">İçerik</label>` satırından ÖNCE şu bloğu ekle:

```jsx
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
```

- [ ] **Step 4: Manuel doğrulama**

1. `npm run dev` ile başlat, admin girişi yap, `/admin/blogs`'a git.
2. "Blog Ekle"yi aç, "Kapak Görseli" bölümünde bir yerel görsele tıkla, seçilen görselin çevresinde `border-secondary` vurgusu göründüğünü doğrula.
3. Formu doldur ve kaydet; Firestore Console'da yeni dokümanda `image` alanının seçtiğin görsel yoluyla dolduğunu doğrula.
4. Aynı blogu "Düzenle" ile aç, kapak görselinin daha önce seçilmiş olarak vurgulandığını doğrula.
5. Firebase Storage'a (Task 3 sonrası) `blogs` klasörüne bir resim yüklüysen, "☁️ Firebase Storage" bölümünde göründüğünü ve seçilebildiğini doğrula.

Beklenen: Görsel seçimi state'e yansıyor, kaydedilen dokümanda `image` alanı doğru, düzenleme modunda önceki seçim korunuyor.

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/BlogAdd.js
git commit -m "feat: BlogAdd formuna kapak görseli seçici ekle"
```

---

### Task 6: Admin blog listesinde ve public blog sayfalarında kapak görselini göster

**Files:**
- Modify: `src/app/admin/blogs/page.js`
- Modify: `src/app/pages/blog/page.js`
- Modify: `src/app/pages/blog/[slug]/page.js`

**Interfaces:**
- Consumes: Task 4/5'te eklenen `blog.image` (string, boş olabilir).
- Produces: Yok.

- [ ] **Step 1: Admin blog listesine thumbnail ekle**

`src/app/admin/blogs/page.js` en üste `Image` import'u ekle:

```js
import Image from "next/image";
```

Blog kartındaki `<h2>` başlığını içeren `<div className="flex flex-col items-center w-full px-6 overflow-hidden">` satırından HEMEN ÖNCE (kart `div`'inin ilk çocuğu olarak) ekle:

```jsx
                    {blog.image && (
                      <Image
                        src={blog.image}
                        alt={blog.title}
                        width={400}
                        height={200}
                        className="w-full h-40 object-cover cursor-pointer hover:opacity-80 transition"
                        onClick={() => setEditBlog(blog)}
                      />
                    )}
```

- [ ] **Step 2: Public blog listesine kapak görseli ekle**

`src/app/pages/blog/page.js`'de (Image zaten import edilmiş, satır 5) `<Link>` içindeki ilk `<div className="flex flex-col items-center w-full px-6 overflow-hidden">` satırından ÖNCE ekle, ve o div'in `pt-12` class'ını görsel varken küçültmek için koşullu hale getir:

```jsx
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
```

(Kapanan `</div>` ve altındaki kod aynı kalıyor, sadece açılış satırındaki class değişti.)

- [ ] **Step 3: Public blog detay sayfasına kapak görseli ekle**

`src/app/pages/blog/[slug]/page.js` en üste `Image` import'u ekle:

```js
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
```

`<h1 className="text-3xl md:text-4xl font-bold mb-4">{blog.title}</h1>` satırından ÖNCE ekle:

```jsx
                {blog.image && (
                  <Image
                    src={blog.image}
                    alt={blog.title}
                    width={1200}
                    height={600}
                    className="w-full max-w-3xl h-64 md:h-80 object-cover rounded mb-6"
                  />
                )}
```

- [ ] **Step 4: Manuel doğrulama**

1. `npm run dev` ile başlat.
2. Task 5'te kapak görseli eklenmiş bir blogu `/admin/blogs`'ta görüntüle: kartta thumbnail görünmeli.
3. Aynı blogu `/pages/blog` listesinde görüntüle: kapak görseli kartın üstünde görünmeli.
4. Aynı blogu `/pages/blog/<slug>` detay sayfasında görüntüle: kapak görseli başlığın üstünde görünmeli.
5. Kapak görseli OLMAYAN eski bir blogu (varsa) her üç sayfada da görüntüle: `<Image>` render edilmemeli, sayfa HATA VERMEDEN eskisi gibi görünmeli (boş `src` nedeniyle console'da next/image hatası OLMAMALI).

Beklenen: Görseli olan bloglar görselle, olmayanlar eskisi gibi hatasız görünüyor.

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/blogs/page.js src/app/pages/blog/page.js "src/app/pages/blog/[slug]/page.js"
git commit -m "feat: admin ve public blog sayfalarında kapak görselini göster"
```

---

## Self-Review

**1. Spec coverage:**
- Madde 1 (admin makale listesi tutarsızlığı) → Task 1 ✅
- Madde 2 (`requireAdmin` fazladan fetch + DRY) → Task 2 ✅ (ayrıca `upload/route.js`'deki 3. kopya da temizlendi, kapsam genişletildi ama aynı köke ait)
- Madde 3 (blog kapak görseli: şema + admin form + public gösterim) → Task 4, 5, 6 ✅
- Ek bulunan küçük bug (`/api/upload` folder parametresi tamamen yok sayılıyor) → Task 3 ✅

**2. Placeholder scan:** Tüm adımlarda gerçek dosya yolları, gerçek satır referansları ve çalışır kod blokları var; "TBD/implement later/add validation" tarzı placeholder yok.

**3. Type/isim tutarlılığı:**
- `requireAdmin()` imzası Task 2'de tanımlandı (parametresiz, `Promise<{uid:string}|null>`) ve Task 3'te dokunulan `upload/route.js`'te de aynı imza kullanıldı.
- `image` alanı Task 4'te backend'de `image: string` (boş `''` olabilir) olarak tanımlandı; Task 5 formda `form.image` adıyla, Task 6'da `blog.image` adıyla tutarlı şekilde tüketiliyor — isim değişmiyor.
- `listImages(folder)` ve `uploadImage(file, folder)` imzaları değişmedi (Task 3 sadece backend'in bu parametreyi doğru okumasını sağlıyor).

## Deploy Notes

Bu branch öncesinde yüklenen tüm görseller (hedef klasör ne olursa olsun) Firebase Storage'da tek bir `EFM/` klasörü altında toplanıyordu — bu bir bug idi ve bu branch'te düzeltildi. `EFM/` altındaki mevcut görseller zaten kullanıldıkları yerlerde (makale/blog kayıtlarındaki URL'ler değişmediği için) sorunsuz render edilmeye devam edecek, ancak artık `/admin/images` üzerinden görünmeyecek/yönetilemeyecekler; çünkü admin arayüzü artık sadece `articles/` ve `blogs/` klasörlerini listeliyor. Projeyi deploy eden kişi, Firebase Console üzerinden `EFM/*` dosyalarını `articles/*` klasörüne taşımayı (önerilen) veya bu eski havuzu bundan sonra sadece Console üzerinden yönetmeyi kabul etmeyi değerlendirmeli — aksi halde "yüklediğim eski görseller nereye kayboldu?" sorusuyla karşılaşabilir.
