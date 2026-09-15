# SEO/SSR Mimarisi ve İçerik Deneyimi Implementasyon Planı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Blog ve makale sayfalarını client-side fetch mimarisinden server-side render'a (generateMetadata + gerçek SEO) taşımak; API'lere pagination eklemek; kategori filtresi, ilgili yazılar, arama, okuma süresi ve içindekiler (TOC) özelliklerini eklemek.

**Architecture:** Public blog/makale liste ve detay sayfaları `"use client"` + `useEffect`+`fetch` yerine Next.js Server Component olacak; veri doğrudan Firebase Admin SDK (`src/services/firebase/firebaseAdmin.js`) üzerinden sunucuda çekilecek. Sadece kullanıcı etkileşimi gereken kısımlar (arama kutusu, kategori filtresi, "daha fazla yükle") küçük client bileşenlerine ayrılacak ve mevcut public API route'larını (artık pagination destekli) çağıracak.

**Tech Stack:** Next.js 16 (App Router), firebase-admin (Firestore), React 19 Server/Client Components. Yeni bağımlılık eklenmiyor.

**Spec:** Bu conversation'daki kod incelemesi ve kullanıcı onayına dayanır, ayrı bir spec dosyası yok.

## Global Constraints

- Bu projede otomatik test altyapısı (jest/vitest vb.) YOK. Her task'ın doğrulama adımı MANUEL: `npm run dev` ile sunucuyu ayağa kaldırıp tarayıcıda/`curl` ile gözle kontrol.
- Server component'lerde SSR'ı doğrulamanın standart yolu: `curl -s http://localhost:3000/pages/blog | grep "<beklenen metin>"` — eğer içerik `curl` çıktısında (JS çalışmadan) görünüyorsa SSR çalışıyor demektir. View-source'un aksine `curl` terminalden otomatik çalıştırılabilir, bu planda hep bu yöntem kullanılacak.
- Firestore Admin SDK sadece sunucu tarafında (server component, route handler) import edilebilir — `"use client"` dosyalarına import ETME.
- Mevcut Tailwind class'ları ve markup, açıkça değiştirilmesi istenmeyen yerlerde KORUNACAK (görsel regresyon riski).
- `blogs` ve `articles` koleksiyonlarında doküman ID'si = `slug` (bkz. `src/app/api/admin/blogs/route.js:70`, `src/app/api/admin/articles/route.js:69`). Bu, slug ile tekil doküman okumayı (`.doc(slug).get()`) mümkün kılar — mevcut kod bunu kullanmıyor, bu planda kullanılacak.
- `date` alanı `<input type="date">` ile üretiliyor (`YYYY-MM-DD`), bu format lexicographic olarak doğru sıralanır — Firestore `.orderBy('date','desc')` güvenle kullanılabilir.
- **UYARI — pilot yaklaşım:** Task 2 (blog liste sayfası) bu planın en riskli/en geniş kapsamlı işidir çünkü mevcut mimarinin (client-fetch → server-fetch) ilk gerçek dönüşümüdür. Task 2 tamamlanıp doğrulanmadan Task 4/5 (makale sayfaları, aynı deseni tekrar eden) işine BAŞLANMAMALI — Task 2'de ortaya çıkacak sorunlar (örn. Next.js cache davranışı, admin SDK'nın server component'te initialize sırası) diğer görevleri de etkiler.
- Cursor-tabanlı pagination'da aynı `date` değerine sahip birden fazla yazı varsa sınırda tekrar/atlama riski vardır (single-field cursor). Bu MVP kapsamında kabul edilebilir bir basitleştirmedir, compound cursor (date+id) sonraki bir iyileştirme konusu.

---

### Task 1: Sunucu tarafı veri katmanı + API pagination

**Files:**
- Create: `src/services/firestore/content.js`
- Modify: `src/app/api/articles/route.js`
- Modify: `src/app/api/blogs/route.js`

**Interfaces:**
- Produces: `getArticlesPage({limit, cursor}) → {articles, nextCursor}`, `getAllArticles() → article[]`, `getArticleBySlug(slug) → article|null`, `getBlogsPage({limit, cursor}) → {blogs, nextCursor}`, `getAllBlogs() → blog[]`, `getBlogBySlug(slug) → blog|null` — Task 2-5, 7-9 bu fonksiyonları kullanacak.

- [ ] **Step 1: `src/services/firestore/content.js` dosyasını oluştur**

```js
// src/services/firestore/content.js
// Blog ve makale içerikleri için sunucu tarafı (Admin SDK) veri erişim fonksiyonları.
// Sadece server component / API route içinde kullanılır — client component'lere import etme.
import admin from '../firebase/firebaseAdmin';

const DEFAULT_PAGE_SIZE = 9;

function safeDecode(slug) {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

export async function getArticlesPage({ limit = DEFAULT_PAGE_SIZE, cursor = null } = {}) {
  const db = admin.firestore();
  let query = db.collection('articles').orderBy('date', 'desc').limit(limit);
  if (cursor) query = query.startAfter(cursor);

  const snapshot = await query.get();
  const articles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const last = articles[articles.length - 1];
  const nextCursor = articles.length === limit && last ? last.date : null;
  return { articles, nextCursor };
}

export async function getAllArticles() {
  const db = admin.firestore();
  const snapshot = await db.collection('articles').orderBy('date', 'desc').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getArticleBySlug(slug) {
  if (!slug) return null;
  const db = admin.firestore();
  const doc = await db.collection('articles').doc(safeDecode(slug)).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

export async function getBlogsPage({ limit = DEFAULT_PAGE_SIZE, cursor = null } = {}) {
  const db = admin.firestore();
  let query = db.collection('blogs').orderBy('date', 'desc').limit(limit);
  if (cursor) query = query.startAfter(cursor);

  const snapshot = await query.get();
  const blogs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const last = blogs[blogs.length - 1];
  const nextCursor = blogs.length === limit && last ? last.date : null;
  return { blogs, nextCursor };
}

export async function getAllBlogs() {
  const db = admin.firestore();
  const snapshot = await db.collection('blogs').orderBy('date', 'desc').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getBlogBySlug(slug) {
  if (!slug) return null;
  const db = admin.firestore();
  const doc = await db.collection('blogs').doc(safeDecode(slug)).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}
```

- [ ] **Step 2: `src/app/api/articles/route.js`'i pagination kullanacak şekilde yeniden yaz**

```js
import { NextResponse } from 'next/server';
import { getArticlesPage } from '../../../services/firestore/content';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '9', 10);
    const cursor = searchParams.get('cursor') || null;

    const { articles, nextCursor } = await getArticlesPage({ limit, cursor });
    return NextResponse.json({ articles, nextCursor }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

- [ ] **Step 3: `src/app/api/blogs/route.js`'i pagination kullanacak şekilde yeniden yaz**

```js
import { NextResponse } from 'next/server';
import { getBlogsPage } from '../../../services/firestore/content';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '9', 10);
    const cursor = searchParams.get('cursor') || null;

    const { blogs, nextCursor } = await getBlogsPage({ limit, cursor });
    return NextResponse.json({ blogs, nextCursor }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

- [ ] **Step 4: Manuel doğrulama**

Firestore Console'dan `blogs`/`articles` koleksiyonlarındaki `date` alanına göre bir composite index gerekip gerekmediğini kontrol et (tek alanlı `orderBy` genelde otomatik index'e sahiptir, ekstra index gerekmez). Sonra:

```bash
npm run dev
# ayrı bir terminalde:
curl -s "http://localhost:3000/api/articles?limit=2" | head -c 500
curl -s "http://localhost:3000/api/blogs?limit=2" | head -c 500
```

Beklenen: Her ikisinde de `{"articles":[...],"nextCursor":"..."}` / `{"blogs":[...],"nextCursor":"..."}` şeklinde JSON, en fazla 2 öğe, en yeni tarihliler önce. Eğer koleksiyonda 2'den fazla dokuman varsa `nextCursor` dolu, değilse `null` olmalı.

- [ ] **Step 5: Commit**

```bash
git add src/services/firestore/content.js src/app/api/articles/route.js src/app/api/blogs/route.js
git commit -m "feat: add server-side content data layer with cursor pagination"
```

---

### Task 2: Blog liste sayfasını Server Component'e taşı (PİLOT) + generateMetadata

**Files:**
- Modify: `src/app/pages/blog/page.js`
- Create: `src/app/pages/blog/BlogLoadMore.js`

**Interfaces:**
- Consumes: `getBlogsPage({limit, cursor})` (Task 1, `src/services/firestore/content.js`)
- Produces: Bu sayfanın markup/class yapısı Task 7'de (kategori filtresi) genişletilecek — `BlogLoadMore` client component'i props olarak `initialBlogs`, `initialNextCursor` alır.

- [ ] **Step 1: `src/app/pages/blog/BlogLoadMore.js` client bileşenini oluştur**

```jsx
// src/app/pages/blog/BlogLoadMore.js
"use client";

import { useState } from "react";
import Link from "next/link";

export default function BlogLoadMore({ initialBlogs, initialNextCursor }) {
  const [blogs, setBlogs] = useState(initialBlogs);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [loading, setLoading] = useState(false);

  const loadMore = async () => {
    if (!nextCursor || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/blogs?limit=9&cursor=${encodeURIComponent(nextCursor)}`);
      const data = await res.json();
      setBlogs(prev => [...prev, ...(data.blogs || [])]);
      setNextCursor(data.nextCursor || null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
                <p className="line-clamp-5 text-justify">{blog.description}</p>
              </div>
            </div>
            <div className="absolute bg-primary shadow-xl w-full bottom-0 px-6 py-1 text-white/80 text-sm flex justify-between items-center">
              <span>{blog.date}</span>
              <span>{blog.category}</span>
            </div>
          </Link>
        ))}
      </div>
      {nextCursor && (
        <div className="w-full flex justify-center mt-10">
          <button
            onClick={loadMore}
            disabled={loading}
            className="bg-primary text-white py-2 px-6 rounded font-semibold hover:bg-secondary transition disabled:opacity-50"
          >
            {loading ? "Yükleniyor..." : "Daha Fazla Yükle"}
          </button>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: `src/app/pages/blog/page.js`'i Server Component'e çevir**

```jsx
// src/app/pages/blog/page.js
import { getBlogsPage } from "../../../services/firestore/content";
import BlogLoadMore from "./BlogLoadMore";

export const metadata = {
  title: "Blog Yazıları | Av. Enver Furkan Mete",
  description: "Hukuk ve güncel konularda paylaşılan blog yazılarını keşfedin.",
};

export default async function BlogPage() {
  const { blogs, nextCursor } = await getBlogsPage({ limit: 9 });

  return (
    <div className="bg-background text-primary flex flex-col items-center min-h-screen">
      <section className="max-w-[1440px] w-full bg-foreground text-primary py-24 border-b-1 border-secondary">
        <div className="container mx-auto px-4 flex items-center justify-center flex-col">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            Blog Yazıları
          </h1>
        </div>
      </section>
      <section className="max-w-[1440px] w-full container mx-auto px-4 py-16">
        <BlogLoadMore initialBlogs={blogs} initialNextCursor={nextCursor} />
      </section>
    </div>
  );
}
```

Not: `loading`/`error` state'leri artık gereksiz — server component hata fırlatırsa Next.js'in `error.js` boundary'si (yoksa varsayılan hata sayfası) devreye girer; veri her zaman ilk render'da hazır olduğu için ayrı bir yükleniyor state'ine gerek yok.

- [ ] **Step 3: Manuel doğrulama — SSR gerçekten çalışıyor mu?**

```bash
npm run dev
curl -s http://localhost:3000/pages/blog | grep -o "Blog Yazıları"
curl -s http://localhost:3000/pages/blog | grep -c "group border-1"
```

Beklenen: İlk komut `Blog Yazıları` yazdırmalı (JS çalışmadan HTML'de mevcut). İkinci komut, Firestore'daki blog sayısı kadar (en fazla 9) `group border-1` eşleşmesi döndürmeli — yani kart HTML'leri sunucuda render edilmiş olmalı. Ayrıca tarayıcıda `/pages/blog` sayfasını aç, "Daha Fazla Yükle" butonunun (varsa >9 blog) çalıştığını gözle doğrula.

- [ ] **Step 4: Commit**

```bash
git add src/app/pages/blog/page.js src/app/pages/blog/BlogLoadMore.js
git commit -m "feat: convert blog list page to server component with SSR + load-more"
```

---

### Task 3: Blog detay sayfasını Server Component'e taşı + generateMetadata + JSON-LD + okuma süresi/TOC

**Files:**
- Modify: `src/app/pages/blog/[slug]/page.js`
- Create: `src/utils/content.js`

**Interfaces:**
- Consumes: `getBlogBySlug(slug)` (Task 1)
- Produces: `computeReadingTime(html) → number` (dakika), `extractHeadings(html) → {id, text, level}[]` — Task 5 (makale detay) bu iki fonksiyonu da tekrar kullanacak.

- [ ] **Step 1: `src/utils/content.js` oluştur (okuma süresi + TOC)**

```js
// src/utils/content.js
// Tiptap'in ürettiği HTML içeriğinden okuma süresi ve içindekiler (TOC) türetme.

export function computeReadingTime(html) {
  if (!html) return 1;
  const text = html.replace(/<[^>]*>/g, ' ');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const WORDS_PER_MINUTE = 200;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

function slugifyHeading(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}

export function extractHeadings(html) {
  if (!html) return [];
  const matches = [...html.matchAll(/<h([23])[^>]*>(.*?)<\/h\1>/gi)];
  return matches.map((m, i) => {
    const level = parseInt(m[1], 10);
    const text = m[2].replace(/<[^>]*>/g, '').trim();
    const id = `${slugifyHeading(text)}-${i}`;
    return { id, text, level };
  });
}

export function addHeadingIds(html) {
  if (!html) return html;
  let i = 0;
  return html.replace(/<h([23])([^>]*)>(.*?)<\/h\1>/gi, (full, level, attrs, inner) => {
    const text = inner.replace(/<[^>]*>/g, '').trim();
    const id = `${slugifyHeading(text)}-${i}`;
    i += 1;
    return `<h${level}${attrs} id="${id}">${inner}</h${level}>`;
  });
}
```

Not: `extractHeadings` ve `addHeadingIds` aynı sırada aynı ID üretim mantığını (`slugifyHeading` + index) kullanmalı, yoksa TOC linkleri sayfadaki gerçek `id`'lerle eşleşmez. Bu yüzden ikisi de aynı dosyada, aynı `slugifyHeading` fonksiyonunu paylaşıyor.

- [ ] **Step 2: `src/app/pages/blog/[slug]/page.js`'i Server Component'e çevir**

Mevcut dosyadaki Slate→HTML geriye-dönük-uyumluluk fonksiyonları (`slateNodesToHtml`, `escapeHtml`, `leafToHtml`, `childrenToHtml`, `nodeToHtml`, `getBlogHtml`) DEĞİŞMEDEN taşınır (server component içinde de saf JS fonksiyon olarak çalışırlar).

```jsx
// src/app/pages/blog/[slug]/page.js
import { getBlogBySlug } from "../../../../services/firestore/content";
import { computeReadingTime, extractHeadings, addHeadingIds } from "../../../../utils/content";

// Geriye dönük uyumluluk: eski Slate JSON → HTML dönüştürücü
function slateNodesToHtml(nodes) {
  if (!Array.isArray(nodes)) return '';
  return nodes.map(nodeToHtml).join('');
}
function escapeHtml(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function leafToHtml(leaf) {
  let html = escapeHtml(leaf.text || '');
  if (leaf.bold) html = `<strong>${html}</strong>`;
  if (leaf.italic) html = `<em>${html}</em>`;
  if (leaf.underline) html = `<u>${html}</u>`;
  if (leaf.code) html = `<code>${html}</code>`;
  return html;
}
function childrenToHtml(children = []) {
  return children.map(child => child.text !== undefined ? leafToHtml(child) : nodeToHtml(child)).join('');
}
function nodeToHtml(node) {
  const inner = childrenToHtml(node.children);
  const align = node.align ? ` style="text-align:${node.align}"` : '';
  switch (node.type) {
    case 'heading-one': return `<h1${align}>${inner}</h1>`;
    case 'heading-two': return `<h2${align}>${inner}</h2>`;
    case 'block-quote': return `<blockquote>${inner}</blockquote>`;
    case 'bulleted-list': return `<ul>${inner}</ul>`;
    case 'numbered-list': return `<ol>${inner}</ol>`;
    case 'list-item': return `<li>${inner}</li>`;
    default: return `<p${align}>${inner}</p>`;
  }
}
function getBlogHtml(text) {
  if (!text) return '';
  if (Array.isArray(text)) return slateNodesToHtml(text);
  return text;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);
  if (!blog) return { title: "Blog Yazısı Bulunamadı" };
  return {
    title: `${blog.title} | Av. Enver Furkan Mete`,
    description: blog.description,
    openGraph: {
      title: blog.title,
      description: blog.description,
      type: "article",
      publishedTime: blog.date,
    },
  };
}

export default async function BlogDetailPage({ params }) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold mb-4">Blog yazısı Bulunamadı</h1>
        <p>Aradığınız yazı mevcut değil veya kaldırılmış olabilir.</p>
      </div>
    );
  }

  const html = getBlogHtml(blog.text);
  const htmlWithIds = addHeadingIds(html);
  const headings = extractHeadings(html);
  const readingMinutes = computeReadingTime(html);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: blog.title,
    datePublished: blog.date,
    description: blog.description,
  };

  return (
    <div className="bg-background text-primary flex flex-col items-center min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="max-w-[1440px] w-full bg-foreground text-primary py-24 border-b-1 border-secondary">
        <div className="container mx-auto px-4 flex items-center justify-center flex-col">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">Blog Yazıları</h1>
        </div>
      </section>
      <div className="flex flex-col items-center min-h-screen w-full max-w-[1440px] pt-10 h-full">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{blog.title}</h1>
        <div className="flex items-center gap-4 mb-6 text-primary text-sm">
          <span>{blog.category}</span>
          <span>•</span>
          <span>{blog.date}</span>
          <span>•</span>
          <span>{readingMinutes} dk okuma</span>
        </div>
        <div className="p-6 w-full flex flex-col md:flex-row gap-8">
          {headings.length > 0 && (
            <nav className="md:w-64 flex-shrink-0 order-2 md:order-1">
              <p className="font-semibold mb-2">İçindekiler</p>
              <ul className="space-y-1 text-sm">
                {headings.map(h => (
                  <li key={h.id} className={h.level === 3 ? "ml-4" : ""}>
                    <a href={`#${h.id}`} className="hover:text-secondary">{h.text}</a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          <div className="flex-1 order-1 md:order-2">
            <p className="text-lg text-justify mb-6">{blog.description}</p>
            <div
              className="blog-content text-base text-primary"
              dangerouslySetInnerHTML={{ __html: htmlWithIds }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
```

Not: Bu proje Next.js 16 kullanıyor; App Router'da `params` artık Promise döndürür, bu yüzden `generateMetadata` ve sayfa fonksiyonunda `await params` kullanılıyor (Next.js 16'nın gerektirdiği davranış).

- [ ] **Step 3: Manuel doğrulama**

```bash
npm run dev
# Firestore'da var olan gerçek bir blog slug'ı ile değiştir:
curl -s http://localhost:3000/pages/blog/ORNEK-SLUG | grep -o "<title>[^<]*</title>"
curl -s http://localhost:3000/pages/blog/ORNEK-SLUG | grep -o "application/ld+json"
curl -s http://localhost:3000/pages/blog/ORNEK-SLUG | grep -o "dk okuma"
```

Beklenen: `<title>` gerçek blog başlığını içermeli (generateMetadata çalışıyor), `application/ld+json` script tag'i HTML'de bulunmalı, "dk okuma" metni görünmeli. Tarayıcıda sayfayı açıp İçindekiler linklerine tıklayarak doğru başlığa scroll ettiğini gözle kontrol et.

- [ ] **Step 4: Commit**

```bash
git add src/app/pages/blog/[slug]/page.js src/utils/content.js
git commit -m "feat: convert blog detail page to SSR with metadata, JSON-LD, reading time and TOC"
```

---

### Task 4: Makale liste sayfasını Server Component'e taşı + generateMetadata

**Files:**
- Modify: `src/app/pages/article/page.js`
- Create: `src/app/pages/article/ArticleLoadMore.js`

**Interfaces:**
- Consumes: `getArticlesPage({limit, cursor})` (Task 1)

- [ ] **Step 1: `src/app/pages/article/ArticleLoadMore.js` client bileşenini oluştur**

```jsx
// src/app/pages/article/ArticleLoadMore.js
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function ArticleLoadMore({ initialArticles, initialNextCursor }) {
  const [articles, setArticles] = useState(initialArticles);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [loading, setLoading] = useState(false);

  const loadMore = async () => {
    if (!nextCursor || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/articles?limit=9&cursor=${encodeURIComponent(nextCursor)}`);
      const data = await res.json();
      setArticles(prev => [...prev, ...(data.articles || [])]);
      setNextCursor(data.nextCursor || null);
    } finally {
      setLoading(false);
    }
  };

  if (articles.length === 0) {
    return (
      <div className="flex items-center justify-center py-10">
        <p className="text-primary/70">Şu anda görüntülenecek makale bulunmuyor.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {articles.map((article, index) => (
          <Link
            key={article.id ?? index}
            href={`/pages/article/${article.slug}`}
            className="group border-1 border-gray-300 relative flex flex-col bg-foreground rounded-md overflow-hidden shadow-md md:shadow-lg transition-all duration-300 md:hover:shadow-xl md:hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary h-full"
            aria-label={`${article.title} makalesini görüntüle`}
          >
            <Image
              src={article.image}
              alt={article.title}
              width={800}
              height={450}
              className="w-full sm:h-56 sm:max-h-56 object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <div className="w-full px-6 pb-12 md:pb-14 overflow-hidden h-48 md:h-56">
              <h2 className="text-lg md:text-xl font-bold text-primary mb-2 group-hover:text-secondary transition-colors duration-200 line-clamp-2">
                {article.title}
              </h2>
              <p className="text-sm md:text-base text-primary/80 mb-0 line-clamp-3 md:line-clamp-4">
                {article.description}
              </p>
            </div>
            <div className="absolute bg-primary shadow-xl w-full bottom-0 px-6 h-10 md:h-12 text-white/80 text-xs md:text-sm flex justify-between items-center">
              <span className="truncate max-w-[55%] md:max-w-[60%]">{article.author}</span>
              <span>{article.date}</span>
            </div>
          </Link>
        ))}
      </div>
      {nextCursor && (
        <div className="w-full flex justify-center mt-10">
          <button
            onClick={loadMore}
            disabled={loading}
            className="bg-primary text-white py-2 px-6 rounded font-semibold hover:bg-secondary transition disabled:opacity-50"
          >
            {loading ? "Yükleniyor..." : "Daha Fazla Yükle"}
          </button>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: `src/app/pages/article/page.js`'i Server Component'e çevir**

```jsx
// src/app/pages/article/page.js
import { getArticlesPage } from "../../../services/firestore/content";
import ArticleLoadMore from "./ArticleLoadMore";

export const metadata = {
  title: "Makaleler | Av. Enver Furkan Mete",
  description: "Hukuk ve güncel konularda paylaştığımız makaleleri keşfedin.",
};

export default async function ArticlePage() {
  const { articles, nextCursor } = await getArticlesPage({ limit: 9 });

  return (
    <div className="bg-background text-primary flex flex-col items-center min-h-screen">
      <section className="max-w-[1440px] w-full bg-foreground text-primary py-16 md:py-24 border-b-1 border-secondary">
        <div className="container mx-auto px-3 md:px-4 flex items-center justify-center flex-col text-center">
          <h1 className="text-3xl md:text-6xl font-bold tracking-tight mb-2 md:mb-4">
            Makaleler
          </h1>
          <p className="text-sm md:text-base text-primary/70 max-w-2xl">
            Hukuk ve güncel konularda paylaştığımız makaleleri keşfedin.
          </p>
        </div>
      </section>
      <section className="max-w-[1440px] w-full container mx-auto px-3 md:px-4 py-10 md:py-16">
        <ArticleLoadMore initialArticles={articles} initialNextCursor={nextCursor} />
      </section>
    </div>
  );
}
```

Not: Skeleton/loading UI kaldırıldı çünkü server component ilk render'da veriyle birlikte gelir; ayrı bir yükleniyor state'i gerekmiyor.

- [ ] **Step 3: Manuel doğrulama**

```bash
npm run dev
curl -s http://localhost:3000/pages/article | grep -o "Makaleler"
curl -s http://localhost:3000/pages/article | grep -c "group border-1"
```

Beklenen: `Makaleler` metni JS çalışmadan görünmeli; kart sayısı Firestore'daki makale sayısıyla (en fazla 9) eşleşmeli. Tarayıcıda "Daha Fazla Yükle" butonunu (varsa) test et.

- [ ] **Step 4: Commit**

```bash
git add src/app/pages/article/page.js src/app/pages/article/ArticleLoadMore.js
git commit -m "feat: convert article list page to server component with SSR + load-more"
```

---

### Task 5: Makale detay sayfasını Server Component'e taşı + generateMetadata + JSON-LD

**Files:**
- Modify: `src/app/pages/article/[slug]/page.js`

**Interfaces:**
- Consumes: `getArticleBySlug(slug)` (Task 1), `computeReadingTime(text)` (Task 3, `src/utils/content.js` — makale içeriği düz metin olduğu için HTML tag'i içermez, fonksiyon zaten `<[^>]*>` bulamazsa kelime sayımını olduğu gibi yapar, ek işlem gerekmez)

- [ ] **Step 1: `src/app/pages/article/[slug]/page.js`'i Server Component'e çevir**

```jsx
// src/app/pages/article/[slug]/page.js
import Image from "next/image";
import { getArticleBySlug } from "../../../../services/firestore/content";
import { computeReadingTime } from "../../../../utils/content";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Makale Bulunamadı" };
  return {
    title: `${article.title} | Av. Enver Furkan Mete`,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
      publishedTime: article.date,
      images: article.image ? [article.image] : [],
    },
  };
}

export default async function ArticleDetailPage({ params }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold mb-4">Makale Bulunamadı</h1>
        <p>Aradığınız makale mevcut değil veya kaldırılmış olabilir.</p>
      </div>
    );
  }

  const readingMinutes = computeReadingTime(article.content);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    datePublished: article.date,
    author: { "@type": "Person", name: article.author },
    description: article.description,
    image: article.image,
  };

  return (
    <div className="bg-background text-primary flex flex-col items-center min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="max-w-[1440px] w-full bg-foreground text-primary py-24 border-b-1 border-secondary">
        <div className="container mx-auto px-4 flex items-center justify-center flex-col">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">Makaleler</h1>
        </div>
      </section>
      <div className="flex flex-col items-center min-h-screen w-full max-w-[1440px] pt-10 page-container">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center w-full">{article.title}</h1>
        <div className="flex items-center gap-4 mb-6 text-primary text-sm flex-wrap justify-center">
          <span>{article.author}</span>
          <span>•</span>
          <span>{article.date}</span>
          <span>•</span>
          <span>{readingMinutes} dk okuma</span>
        </div>
        <div className="w-full flex flex-col md:flex-row gap-4 md:gap-6">
          <div className="w-full md:w-[400px] md:flex-shrink-0">
            <Image
              src={article.image}
              alt={article.title}
              width={800}
              height={600}
              className="w-full h-auto object-cover rounded-md"
            />
          </div>
          <div className="flex-1">
            <p className="text-base md:text-lg text-justify mb-6">{article.description}</p>
            <div className="text-base md:text-lg text-justify text-primary whitespace-pre-line">
              {article.content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

Not: `whitespace-pre-line` eklendi çünkü makale içeriği düz metin (`<textarea>` çıktısı) ve satır sonlarının görünür olması için CSS ile korunması gerekiyor — bu, önceki koddaki "satır sonları render olmuyor" sorununu da düzeltir (bkz. önceki inceleme raporu).

- [ ] **Step 2: Manuel doğrulama**

```bash
npm run dev
curl -s http://localhost:3000/pages/article/ORNEK-SLUG | grep -o "<title>[^<]*</title>"
curl -s http://localhost:3000/pages/article/ORNEK-SLUG | grep -o "application/ld+json"
curl -s http://localhost:3000/pages/article/ORNEK-SLUG | grep -o "dk okuma"
```

Beklenen: `<title>` gerçek makale başlığını içermeli, JSON-LD script mevcut olmalı, "dk okuma" görünmeli. Tarayıcıda birden çok satırlı bir makale içeriğinin artık satır sonlarıyla göründüğünü kontrol et.

- [ ] **Step 3: Commit**

```bash
git add src/app/pages/article/[slug]/page.js
git commit -m "feat: convert article detail page to SSR with metadata, JSON-LD and reading time"
```

---

### Task 6: Makaleye kategori alanı ekleme

**Files:**
- Modify: `src/components/admin/AddArticle.js`
- Modify: `src/app/api/admin/articles/route.js`

**Interfaces:**
- Produces: `article.category` alanı — Task 7 (blog filtresi zaten kategoriye sahip) ve Task 8 (ilgili yazılar) makale tarafında bu alanı kullanacak.

- [ ] **Step 1: `AddArticle.js`'e kategori seçimi ekle**

`src/components/admin/AddArticle.js:7` üstüne (import satırlarından sonra) kategori listesini ekle, `BlogAdd.js:8` ile aynı sabit listeyi kullan:

```js
const categories = ["Hukuk", "Teknoloji", "Güncel", "Eğitim", "Sağlık"];
```

`form` state'ine (satır 22-29) `category: ""` ekle:

```js
const [form, setForm] = useState({
  title: "",
  description: "",
  image: "",
  author: "",
  date: "",
  category: "",
  content: ""
});
```

`editData` useEffect'ine (satır 38-46) `category: editData.category || ""` ekle. `handleOpen`'daki (satır 122-132) ve submit-sonrası reset'teki (satır 100-108) form nesnelerine de aynı alanı ekle.

Formda, `author` input'undan (satır 222) önce kategori `<select>` ekle:

```jsx
<select
  name="category"
  value={form.category}
  onChange={handleChange}
  className="border-1 border-primary/20 p-2 rounded"
  required
>
  <option value="">Kategori Seç</option>
  {categories.map((cat) => (
    <option key={cat} value={cat}>{cat}</option>
  ))}
</select>
```

- [ ] **Step 2: `src/app/api/admin/articles/route.js`'de `category` alanını kabul et**

`POST` fonksiyonunda (satır 56-77):

```js
const { title, description, image, author, date, category, content } = body;
if (!title || !description || !image || !author || !date || !category || !content) {
  return NextResponse.json({ error: 'Eksik alan var.' }, { status: 400 });
}
// ...
await db.collection('articles').doc(slug).set({
  slug, title, description, image, author, date, category, content
});
```

`PUT` fonksiyonunda (satır 84-108) aynı şekilde `category`'yi destructure et, zorunlu alan kontrolüne ekle ve `.set(...)` çağrısına dahil et.

- [ ] **Step 3: Manuel doğrulama**

```bash
npm run dev
```

Tarayıcıda `/admin/articles` sayfasını aç, admin olarak giriş yapmış olarak yeni bir makale eklerken kategori seçmenin zorunlu olduğunu (boş bırakınca submit olmadığını) doğrula. Ekledikten sonra:

```bash
curl -s "http://localhost:3000/api/articles?limit=1" | grep -o '"category":"[^"]*"'
```

Beklenen: Yeni eklenen makalenin `category` alanı JSON çıktısında görünmeli.

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/AddArticle.js src/app/api/admin/articles/route.js
git commit -m "feat: add category field to articles"
```

---

### Task 7: Blog listesinde kategoriye göre filtreleme

**Files:**
- Modify: `src/app/pages/blog/BlogLoadMore.js`

**Interfaces:**
- Consumes: `blog.category` (zaten mevcut alan, bkz. `src/components/admin/BlogAdd.js:8`)

- [ ] **Step 1: `BlogLoadMore.js`'e kategori filtresi ekle**

`src/app/pages/blog/BlogLoadMore.js`'deki state tanımlarının (Task 2, Step 1) altına ekle:

```jsx
const CATEGORIES = ["Hukuk", "Teknoloji", "Güncel", "Eğitim", "Sağlık"];

// ...component içinde, mevcut state'lerin yanına:
const [activeCategory, setActiveCategory] = useState(null);

const visibleBlogs = activeCategory
  ? blogs.filter(b => b.category === activeCategory)
  : blogs;
```

Kart grid'inden (`<div className="grid ...">`) önce filtre çubuğunu ekle, ve grid'de `blogs.map` yerine `visibleBlogs.map` kullan:

```jsx
<div className="flex flex-wrap gap-2 mb-8 justify-center">
  <button
    onClick={() => setActiveCategory(null)}
    className={`px-4 py-1 rounded-full text-sm border transition ${
      activeCategory === null ? "bg-primary text-white border-primary" : "border-gray-300 hover:border-primary"
    }`}
  >
    Tümü
  </button>
  {CATEGORIES.map((cat) => (
    <button
      key={cat}
      onClick={() => setActiveCategory(cat)}
      className={`px-4 py-1 rounded-full text-sm border transition ${
        activeCategory === cat ? "bg-primary text-white border-primary" : "border-gray-300 hover:border-primary"
      }`}
    >
      {cat}
    </button>
  ))}
</div>
```

Not: Filtre şu an ekranda görünen (yüklenmiş) blogları filtreliyor; sunucu tarafında kategoriye göre sorgu YAPMIYOR (basit MVP). "Daha Fazla Yükle" hâlâ tüm kategorilerden sırayla yükler; kullanıcı bir kategori seçtiğinde henüz yüklenmemiş o kategorideki yazılar listede görünmeyebilir. Bu bilinen bir sınırlamadır; sunucu taraflı kategori filtresi ileride ayrı bir iyileştirme konusu.

- [ ] **Step 2: Manuel doğrulama**

Tarayıcıda `/pages/blog` sayfasını aç, en az iki farklı kategoride blog olduğundan emin ol (gerekirse admin panelden ekle), kategori butonlarına tıklayıp listenin doğru filtrelendiğini gözle doğrula. "Tümü" butonunun tüm yazıları geri gösterdiğini kontrol et.

- [ ] **Step 3: Commit**

```bash
git add src/app/pages/blog/BlogLoadMore.js
git commit -m "feat: add category filter to blog list"
```

---

### Task 8: İlgili yazılar (blog + makale detay sayfaları)

**Files:**
- Modify: `src/services/firestore/content.js`
- Modify: `src/app/pages/blog/[slug]/page.js`
- Modify: `src/app/pages/article/[slug]/page.js`

**Interfaces:**
- Produces: `getRelatedBlogs(category, excludeSlug, count=3)`, `getRelatedArticles(category, excludeSlug, count=3)`

- [ ] **Step 1: `content.js`'e ilgili-içerik fonksiyonlarını ekle**

`src/services/firestore/content.js`'in sonuna ekle:

```js
export async function getRelatedBlogs(category, excludeSlug, count = 3) {
  if (!category) return [];
  const db = admin.firestore();
  const snapshot = await db.collection('blogs')
    .where('category', '==', category)
    .orderBy('date', 'desc')
    .limit(count + 1)
    .get();
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(b => b.slug !== excludeSlug)
    .slice(0, count);
}

export async function getRelatedArticles(category, excludeSlug, count = 3) {
  if (!category) return [];
  const db = admin.firestore();
  const snapshot = await db.collection('articles')
    .where('category', '==', category)
    .orderBy('date', 'desc')
    .limit(count + 1)
    .get();
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(a => a.slug !== excludeSlug)
    .slice(0, count);
}
```

Not: `.where('category', '==', ...).orderBy('date', 'desc')` beraber kullanıldığında Firestore composite index isteyebilir — ilk çalıştırmada hata Firestore Console'da index oluşturma linki verir, o linke tıklanıp index oluşturulmalı (Step 3'te bu doğrulanacak).

- [ ] **Step 2: Blog detay sayfasına "İlgili Yazılar" bölümü ekle**

`src/app/pages/blog/[slug]/page.js`'deki import satırına ekle:

```js
import { getBlogBySlug, getRelatedBlogs } from "../../../../services/firestore/content";
import Link from "next/link";
```

`BlogDetailPage` içinde `blog` bulunduktan sonra:

```js
const relatedBlogs = await getRelatedBlogs(blog.category, blog.slug);
```

Ana içerik `<div>` kapanışından (`</div>` — mevcut `blog-content` div'inin hemen sonrası) önce:

```jsx
{relatedBlogs.length > 0 && (
  <div className="w-full mt-12 pt-8 border-t border-gray-200">
    <h3 className="text-xl font-bold mb-4">İlgili Yazılar</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {relatedBlogs.map(rb => (
        <Link
          key={rb.slug}
          href={`/pages/blog/${rb.slug}`}
          className="block p-4 border border-gray-200 rounded hover:border-secondary transition"
        >
          <p className="font-semibold line-clamp-2">{rb.title}</p>
          <p className="text-sm text-primary/60 mt-1">{rb.date}</p>
        </Link>
      ))}
    </div>
  </div>
)}
```

- [ ] **Step 3: Makale detay sayfasına "İlgili Makaleler" bölümü ekle**

`src/app/pages/article/[slug]/page.js`'deki import satırına ekle:

```js
import { getArticleBySlug, getRelatedArticles } from "../../../../services/firestore/content";
import Link from "next/link";
```

`ArticleDetailPage` içinde `article` bulunduktan sonra:

```js
const relatedArticles = await getRelatedArticles(article.category, article.slug);
```

Ana `<div className="w-full flex flex-col md:flex-row gap-4 md:gap-6">` kapanışından sonra, en dış `<div>` kapanmadan önce:

```jsx
{relatedArticles.length > 0 && (
  <div className="w-full mt-12 pt-8 border-t border-gray-200">
    <h3 className="text-xl font-bold mb-4">İlgili Makaleler</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {relatedArticles.map(ra => (
        <Link
          key={ra.slug}
          href={`/pages/article/${ra.slug}`}
          className="block p-4 border border-gray-200 rounded hover:border-secondary transition"
        >
          <p className="font-semibold line-clamp-2">{ra.title}</p>
          <p className="text-sm text-primary/60 mt-1">{ra.date}</p>
        </Link>
      ))}
    </div>
  </div>
)}
```

- [ ] **Step 4: Manuel doğrulama**

Aynı kategoride en az 2 blog ve en az 2 makale olduğundan emin ol (gerekirse admin panelden ekle — makalede Task 6'da eklenen kategori alanını kullan). Sonra:

```bash
npm run dev
curl -s http://localhost:3000/pages/blog/ORNEK-SLUG | grep -o "İlgili Yazılar"
curl -s http://localhost:3000/pages/article/ORNEK-SLUG | grep -o "İlgili Makaleler"
```

Beklenen: İkisi de metni JS çalışmadan HTML'de göstermeli. Eğer Firestore composite index hatası alınırsa (terminal loglarında görünür), verilen Firebase Console linkine gidip index'i oluştur, sunucuyu yeniden başlat ve tekrar dene.

- [ ] **Step 5: Commit**

```bash
git add src/services/firestore/content.js src/app/pages/blog/[slug]/page.js src/app/pages/article/[slug]/page.js
git commit -m "feat: add related posts to blog and article detail pages"
```

---

### Task 9: Arama (client-side, blog ve makale listesi)

**Files:**
- Modify: `src/app/pages/blog/BlogLoadMore.js`
- Modify: `src/app/pages/article/ArticleLoadMore.js`

**Interfaces:**
- Consumes: Task 7'de eklenen `activeCategory`/`visibleBlogs` deseni (blog tarafında arama, kategori filtresiyle birlikte AND mantığıyla çalışır)

- [ ] **Step 1: `BlogLoadMore.js`'e arama kutusu ekle**

Mevcut state'lerin yanına (Task 7'den sonra):

```js
const [searchTerm, setSearchTerm] = useState("");

const visibleBlogs = blogs.filter(b => {
  const matchesCategory = !activeCategory || b.category === activeCategory;
  const matchesSearch = !searchTerm || b.title.toLowerCase().includes(searchTerm.toLowerCase());
  return matchesCategory && matchesSearch;
});
```

(Bu, Task 7'deki `visibleBlogs` tanımının yerini alır — iki filtre birleştirilir.)

Kategori filtre çubuğından önce arama kutusunu ekle:

```jsx
<div className="w-full max-w-md mx-auto mb-6">
  <input
    type="text"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    placeholder="Başlıkta ara..."
    className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-secondary"
  />
</div>
```

- [ ] **Step 2: `ArticleLoadMore.js`'e arama kutusu ekle**

`src/app/pages/article/ArticleLoadMore.js`'deki state tanımlarının yanına ekle:

```js
const [searchTerm, setSearchTerm] = useState("");

const visibleArticles = articles.filter(a =>
  !searchTerm || a.title.toLowerCase().includes(searchTerm.toLowerCase())
);
```

`articles.map` yerine `visibleArticles.map` kullan (kart grid'inde), boş-durum kontrolünü (`articles.length === 0`) da `visibleArticles.length === 0` olacak şekilde güncelle. Grid'den önce arama kutusunu ekle (Step 1'deki JSX ile aynı, placeholder: `"Makale başlığında ara..."`).

- [ ] **Step 3: Manuel doğrulama**

Tarayıcıda `/pages/blog` ve `/pages/article` sayfalarını aç, arama kutusuna bilinen bir başlığın parçasını yaz, listenin anlık filtrelendiğini gözle doğrula. Blog sayfasında arama + kategori filtresini birlikte deneyip AND mantığının (ikisi de eşleşmeli) çalıştığını kontrol et.

- [ ] **Step 4: Commit**

```bash
git add src/app/pages/blog/BlogLoadMore.js src/app/pages/article/ArticleLoadMore.js
git commit -m "feat: add client-side title search to blog and article lists"
```

---

## Self-Review

**1. Spec kapsaması:** Kullanıcının onayladığı 6 madde (server component+metadata, JSON-LD, pagination, kategori/ilgili yazılar, arama, okuma süresi+TOC) → Task 2-5 (SSR+metadata), Task 3&5 (JSON-LD), Task 1 (pagination), Task 6-8 (kategori+ilgili yazılar), Task 9 (arama), Task 3 (okuma süresi+TOC). Tüm maddeler kapsandı.

**2. Placeholder taraması:** Tüm adımlarda gerçek kod ve gerçek dosya/satır referansları var; "TBD", "benzer şekilde X yap" gibi ifadeler yalnızca zaten tam kodu yazılmış bir deseni tekrarlarken (Task 7 Step 1 içindeki `visibleBlogs` güncellemesi Task 9 Step 1'de netleştirildi) kullanıldı — kod her yerde tam yazılı.

**3. Tip/isim tutarlılığı düzeltmesi:** Task 7 Step 1'de tanımlanan `visibleBlogs` filtresi Task 9 Step 1'de arama ile birleştirilecek şekilde güncellendi (aynı isim, genişletilmiş mantık) — çakışma yok. `getBlogsPage`/`getArticlesPage` dönüş şekli (`{blogs, nextCursor}` / `{articles, nextCursor}`) Task 1'de tanımlandığı gibi Task 2 ve 4'te birebir kullanıldı.

**Bilinen sınırlamalar (plan kapsamı dışında, not olarak bırakıldı):** Kategori filtresi (Task 7) sunucu tarafında değil, yüklenmiş veri üzerinde çalışır; cursor pagination `date` alanı tekilliğine dayanır (aynı tarihli çoklu yazılarda sınır riski).
