# Editör Birleştirme ve Makale İçerik Zenginleştirme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Makale (article) admin formundaki düz `<textarea>` içerik alanını, blog formunda zaten kullanılan Tiptap zengin metin editörüne geçirmek; Tiptap editörüne resim ve bağlantı (link) ekleme yeteneği kazandırmak; makale detay sayfasının artık HTML içerik basmasını sağlamak (eski düz-metin makalelerle geriye dönük uyumlu şekilde).

**Architecture:** Mevcut `TiptapEditor` bileşeni (`src/components/tiptap/TiptapEditor.jsx`) hem blog hem makale formunda ortak kullanılacak; bileşene `@tiptap/extension-image` ve `@tiptap/extension-link` eklenip toolbar'a "Resim Ekle" ve "Bağlantı Ekle" butonları konacak. Resim yükleme, projede zaten var olan `uploadImage()` (Firebase Storage, `/api/upload` route'u üzerinden Admin SDK ile) fonksiyonunu kullanacak. `AddArticle.js`, `BlogAdd.js`'nin zaten kullandığı desene (richText state + `TiptapEditor` value/onChange) uydurulacak. Public makale sayfası (`article/[slug]/page.js`), blog sayfasının (`blog/[slug]/page.js`) zaten yaptığı gibi `dangerouslySetInnerHTML` ile HTML basacak; eski (Tiptap öncesi) düz metin içerikler için basit bir "düz metin → paragraf HTML" dönüştürücü fallback eklenecek.

**Tech Stack:** Next.js 16 (App Router, client component'ler), React 19, Tiptap 3.23.5 (`@tiptap/react`, `@tiptap/starter-kit`, yeni: `@tiptap/extension-image`, `@tiptap/extension-link`), Firebase Storage (Admin SDK üzerinden `/api/upload`), Tailwind v4 + `src/app/globals.css`'te elle yazılmış `.tiptap-content` / `.blog-content` tipografi kuralları.

**Spec:** Bu conversation'daki kod incelemesi ve kullanıcı onayına dayanır, ayrı bir spec dosyası yok.

## Global Constraints

- Bu projede otomatik test altyapısı (Jest/Vitest/Playwright vb.) YOK. Her task'ın doğrulama adımı **manuel**: `npm run dev` ile sunucuyu başlat, tarayıcıda ilgili admin formunu / public sayfayı aç, belirtilen davranışı gözle doğrula. "Test" kelimesi bu planda "manuel tarayıcı doğrulaması" anlamına gelir.
- Tiptap paketlerinin tümü `^3.23.5` sabitlenmiş (package.json) — yeni eklenen `@tiptap/extension-image` ve `@tiptap/extension-link` de aynı major/minor ile (`^3.23.5`) kurulmalı, sürüm uyumsuzluğu riskini önlemek için.
- `dangerouslySetInnerHTML` kullanımı: içerik sadece admin panelinden (kimlik doğrulamalı, `requireAdmin` korumalı) giriliyor, herkese açık kullanıcı girdisi (yorum vb.) bu alana ulaşmıyor — blog sayfası zaten aynı deseni kullanıyor. Bu geçerli bir güven sınırı ama ileride herkese açık bir "yorum" veya kullanıcı girdisi bu alana eklenirse (örn. dış kaynaklı içerik alınırsa) DOMPurify gibi bir sanitizer eklenmeden `dangerouslySetInnerHTML` kullanılmamalı — bu not koda kısa bir yorum olarak da eklenmeli.
- **Kapsam dışı (bilinçli olarak plana alınmadı):** `src/app/api/upload/route.js` içinde gerçek bir bug var — POST handler'ı formData'dan gelen `folder` alanını kullanmıyor, hep hardcoded `'EFM'` klasörüne yazıyor; GET handler'ı da `folder` yerine yanlış query param adı (`'EFM'`) okuyup hep `EFM/` prefix'iyle listeliyor. Bu, bu plandaki `imageFolder` prop'unun (madde altında Task 1) fiilen klasör ayrımı yapmasını engelliyor — yüklenen tüm resimler pratikte `EFM/` altında toplanacak. Yükleme/silme/listeleme fonksiyonel olarak çalışır (resim başarıyla yüklenir ve editöre eklenir), sadece klasör ayrımı işlemez. Bu, ayrı bir "küçük düzeltmeler" planında ele alınmalı; burada sadece bilgi notu olarak bırakılıyor.

---

## File Structure

- **Modify:** `package.json` — `@tiptap/extension-image`, `@tiptap/extension-link` bağımlılıkları eklenecek (npm install ile otomatik).
- **Modify:** `src/components/tiptap/TiptapEditor.jsx` — Image/Link extension'ları, `imageFolder` prop'u, resim yükleme ve link ekleme toolbar butonları.
- **Modify:** `src/components/admin/BlogAdd.js` — `TiptapEditor`'e `imageFolder="blogs"` prop'unu geçir (satır ~189).
- **Modify:** `src/components/admin/AddArticle.js` — `<textarea name="content">` kaldırılıp `TiptapEditor` ile değiştirilecek, `richText` state'i eklenecek.
- **Modify:** `src/app/pages/article/[slug]/page.js` — İçerik artık `dangerouslySetInnerHTML` ile basılacak, eski düz-metin içerikler için fallback dönüştürücü eklenecek.
- **Modify:** `src/app/globals.css` — Tiptap `img`/`a` node'ları için stil kuralları (`.tiptap-content`, `.blog-content`) ve yeni `.article-content` sınıfı için blog-content ile aynı tipografi kuralları.

---

### Task 1: TiptapEditor'e Resim ve Link Extension'ları Ekle

**Files:**
- Modify: `package.json` (npm install ile)
- Modify: `src/components/tiptap/TiptapEditor.jsx`
- Modify: `src/app/globals.css:59-66` (`.tiptap-content` kuralları civarı)

**Interfaces:**
- Consumes: `uploadImage(file, folder)` — `src/services/firebase/firebaseStorage.js:5`, dönen değer `{ url, path, name }` (Promise).
- Produces: `TiptapEditor({ value, onChange, readOnly, imageFolder = 'articles' })` — Task 2 ve mevcut `BlogAdd.js` bu güncellenmiş prop imzasını kullanacak.

- [ ] **Step 1: Tiptap extension paketlerini kur**

Çalıştır:
```bash
npm install @tiptap/extension-image@^3.23.5 @tiptap/extension-link@^3.23.5
```

- [ ] **Step 2: Kurulumu doğrula**

Çalıştır: `grep '"@tiptap/extension-image"\|"@tiptap/extension-link"' package.json`
Beklenen: İkisi de `^3.23.5` ile listelensin.

- [ ] **Step 3: `TiptapEditor.jsx` import ve extension listesini güncelle**

`src/components/tiptap/TiptapEditor.jsx` dosyasının başındaki import bloğunu şu şekilde değiştir:

```jsx
'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle, FontSize } from '@tiptap/extension-text-style';
import TiptapImage from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { useEffect, useState } from 'react';
import { uploadImage } from '@/services/firebase/firebaseStorage';
```

`useEditor` çağrısındaki `extensions` dizisini güncelle:

```jsx
export default function TiptapEditor({ value = '', onChange, readOnly = false, imageFolder = 'articles' }) {
  const [uploadingImage, setUploadingImage] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ history: true }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      FontSize,
      TiptapImage.configure({ HTMLAttributes: { class: 'tiptap-image' } }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { class: 'tiptap-link' },
      }),
    ],
    content: value || '<p></p>',
    editable: !readOnly,
    onUpdate({ editor }) {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: readOnly
          ? 'tiptap-content outline-none'
          : 'tiptap-content outline-none min-h-[200px] px-3 py-2',
      },
    },
  });
```

- [ ] **Step 4: Resim yükleme ve link ekleme handler'larını ekle**

`if (readOnly) { return <EditorContent editor={editor} />; }` satırından hemen sonra, `currentFontSize` tanımından önce şu handler'ları ekle:

```jsx
  const handleImageButtonClick = () => {
    document.getElementById('tiptap-image-input')?.click();
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const uploaded = await uploadImage(file, imageFolder);
      editor.chain().focus().setImage({ src: uploaded.url }).run();
    } catch (err) {
      console.error('Tiptap resim yükleme hatası:', err);
      alert('Resim yüklenemedi: ' + (err.message || 'Bilinmeyen hata'));
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleLinkButtonClick = () => {
    const previousUrl = editor.getAttributes('link').href || '';
    const url = window.prompt("Bağlantı URL'si (boş bırakıp onaylarsan link kaldırılır):", previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

```

- [ ] **Step 5: Toolbar'a resim ve link butonlarını ekle**

Toolbar JSX'inde, `Alıntı` butonundan (`toggleBlockquote`) sonra, toolbar `div`'i kapanmadan önce şunu ekle:

```jsx
        <Divider />

        <input
          id="tiptap-image-input"
          type="file"
          accept="image/*"
          onChange={handleImageFileChange}
          className="hidden"
        />
        <ToolbarButton onClick={handleImageButtonClick} active={false} title="Resim Ekle">
          {uploadingImage ? '⏳' : '🖼️'}
        </ToolbarButton>
        <ToolbarButton onClick={handleLinkButtonClick} active={editor.isActive('link')} title="Bağlantı Ekle/Düzenle">
          🔗
        </ToolbarButton>
```

- [ ] **Step 6: Yayınlanan içerikte resim/link için CSS ekle**

`src/app/globals.css` dosyasında `.tiptap-content code { ... }` satırından (satır 66) hemen sonra şunu ekle:

```css
.tiptap-content img { max-width: 100%; height: auto; border-radius: 0.375rem; margin: 0.5rem 0; }
.tiptap-content a { color: var(--color-secondary); text-decoration: underline; }
```

Ve `.blog-content code { ... }` satırından (satır 76) hemen sonra:

```css
.blog-content img { max-width: 100%; height: auto; border-radius: 0.375rem; margin: 0.75rem 0; }
.blog-content a { color: var(--color-secondary); text-decoration: underline; }
```

- [ ] **Step 7: Manuel doğrulama**

Çalıştır: `npm run dev`
Tarayıcıda: `/admin/blogs` (veya `/admin/dashboard` üzerinden blog ekleme modalı) aç → "Blog Ekle" → İçerik alanında toolbar'da yeni 🖼️ ve 🔗 butonlarının göründüğünü doğrula.
- 🖼️ butonuna bas, bir resim dosyası seç → editöre resmin eklendiğini ve önizlemede göründüğünü doğrula.
- Bir metin seç, 🔗 butonuna bas, bir URL gir (örn. `https://example.com`) → seçili metnin altı çizili/link rengiyle göründüğünü doğrula.
- Formu kaydet, aynı blogu tekrar düzenlemeye aç → resmin ve linkin içerikte hâlâ göründüğünü doğrula (HTML olarak Firestore'a kaydedildiğini teyit eder).

Beklenen: Hepsi yukarıdaki gibi çalışır, konsolda hata olmaz.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json src/components/tiptap/TiptapEditor.jsx src/app/globals.css
git commit -m "feat: tiptap editörüne resim ve link ekleme desteği ekle"
```

---

### Task 2: Makale Formunu (`AddArticle.js`) Tiptap Editörüne Geçir

**Files:**
- Modify: `src/components/admin/AddArticle.js`
- Modify: `src/components/admin/BlogAdd.js:189` (imageFolder prop'unu açıkça belirt)

**Interfaces:**
- Consumes: `TiptapEditor({ value, onChange, imageFolder })` — Task 1'de üretildi.
- Produces: `AddArticle` bileşeni artık `form.content` alanına düz metin yerine Tiptap HTML string'i koyuyor; Task 3 bu HTML'i public sayfada basacak.

- [ ] **Step 1: `BlogAdd.js`'de `imageFolder` prop'unu açıkça belirt**

`src/components/admin/BlogAdd.js` satır 189'daki:

```jsx
              <TiptapEditor value={richText} onChange={handleRichTextChange} />
```

satırını şu şekilde değiştir:

```jsx
              <TiptapEditor value={richText} onChange={handleRichTextChange} imageFolder="blogs" />
```

- [ ] **Step 2: `AddArticle.js`'e `TiptapEditor` import'u ve `richText` state'i ekle**

`src/components/admin/AddArticle.js` dosyasının başındaki importlara ekle:

```jsx
import TiptapEditor from "../tiptap/TiptapEditor";
```

`useState` bloklarının yanına (mevcut `const [loadingImages, setLoadingImages] = useState(false);` satırından sonra) ekle:

```jsx
  const [richText, setRichText] = useState("");
```

- [ ] **Step 3: `editData` useEffect'inde `richText`'i doldur**

Mevcut:

```jsx
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
```

Şu şekilde değiştir (eski düz-metin içerikleri Tiptap'in düzgün gösterebilmesi için basit bir HTML'e çevirme eklenir):

```jsx
  useEffect(() => {
    if (editData) {
      const content = editData.content || "";
      setForm({
        title: editData.title || "",
        description: editData.description || "",
        image: editData.image || "",
        author: editData.author || "",
        date: editData.date || "",
        content
      });
      setRichText(plainOrHtmlToEditorHtml(content));
      setOpen(true);
    }
  }, [editData]);
```

Bu useEffect'ten önce (dosyanın en üstünde, `const localImageOptions = [...]` bloğundan önce) şu yardımcı fonksiyonu ekle:

```jsx
// Eski (Tiptap öncesi) düz metin içerikleri HTML'e çevir; içerik zaten HTML ise dokunma.
function plainOrHtmlToEditorHtml(content) {
  if (!content) return "";
  if (/<[a-z][\s\S]*>/i.test(content)) return content;
  return content
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br>")}</p>`)
    .join("");
}
```

- [ ] **Step 4: `handleRichTextChange` handler'ı ekle**

`handleChange` fonksiyonunun hemen üstüne ekle:

```jsx
  const handleRichTextChange = (html) => {
    setRichText(html);
    setForm((prev) => ({ ...prev, content: html }));
  };
```

- [ ] **Step 5: `<textarea>` alanını `TiptapEditor` ile değiştir**

Mevcut:

```jsx
              <textarea name="content" value={form.content} onChange={handleChange} placeholder="İçerik" className=" min-h-[300px] border-1 border-primary/20 p-2 rounded" required />
```

Şu şekilde değiştir:

```jsx
              <label className="font-semibold">İçerik</label>
              <TiptapEditor value={richText} onChange={handleRichTextChange} imageFolder="articles" />
```

- [ ] **Step 6: `handleOpen` ve başarılı submit sonrası formu sıfırlarken `richText`'i de sıfırla**

`handleOpen` fonksiyonunu:

```jsx
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
```

şu şekilde güncelle:

```jsx
  const handleOpen = () => {
    setOpen(true);
    setRichText("");
    setForm({
      title: "",
      description: "",
      image: "",
      author: "",
      date: "",
      content: ""
    });
  };
```

`handleSubmit` içindeki başarı bloğunda (`if (res.ok) { setSuccess(true); setForm({...}); ...`) `setForm({...})` çağrısının hemen altına `setRichText("");` ekle.

- [ ] **Step 7: Manuel doğrulama**

Çalıştır: `npm run dev`
Tarayıcıda: `/admin/articles` → "Makale Ekle" → İçerik alanının artık Tiptap toolbar'lı editör olduğunu doğrula (textarea değil).
- Kalın/başlık/liste uygula, kaydet.
- Listeye geri dön, az önce eklenen makaleyi "Düzenle" ile aç → biçimlendirmenin (kalın/başlık/liste) editörde korunduğunu doğrula.
- Eski (bu değişiklikten önce eklenmiş, düz metinli) bir makaleyi düzenlemeye aç → içeriğin en azından paragraf olarak (satır kaybı olmadan) göründüğünü doğrula.

Beklenen: Hepsi yukarıdaki gibi çalışır, konsolda hata olmaz.

- [ ] **Step 8: Commit**

```bash
git add src/components/admin/AddArticle.js src/components/admin/BlogAdd.js
git commit -m "feat: makale formunu tiptap zengin metin editörüne geçir"
```

---

### Task 3: Makale Detay Sayfasını HTML İçerik Basacak Şekilde Güncelle

**Files:**
- Modify: `src/app/pages/article/[slug]/page.js`
- Modify: `src/app/globals.css` (`.article-content` sınıfı eklenecek)

**Interfaces:**
- Consumes: `article.content` — Task 2 sonrası yeni makalelerde Tiptap HTML string'i, eski makalelerde düz metin (satır sonlu) string.
- Produces: Sayfa artık `article.content`'i HTML olarak basıyor; başka task bu çıktıya bağımlı değil (plan sonu).

- [ ] **Step 1: Düz-metin → HTML fallback fonksiyonunu ekle**

`src/app/pages/article/[slug]/page.js` dosyasının başındaki importlardan sonra, `export default function ArticleDetailPage()` tanımından önce ekle:

```jsx
// Eski (Tiptap öncesi) düz metin makaleler için basit paragraf dönüştürücü;
// içerik zaten HTML (Tiptap çıktısı) ise olduğu gibi kullanılır.
function articleContentToHtml(content) {
  if (!content) return "";
  if (/<[a-z][\s\S]*>/i.test(content)) return content;
  return content
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br>")}</p>`)
    .join("");
}
```

- [ ] **Step 2: İçerik render'ını `dangerouslySetInnerHTML` ile değiştir**

Mevcut:

```jsx
                    <div className="flex-1">
                        <p className="text-base md:text-lg text-justify mb-6">{article.description}</p>
                        <div className="text-base md:text-lg text-justify text-primary">
                            {article.content}
                        </div>
                    </div>
```

Şu şekilde değiştir:

```jsx
                    <div className="flex-1">
                        <p className="text-base md:text-lg text-justify mb-6">{article.description}</p>
                        {/* İçerik sadece admin panelinden (auth korumalı) giriliyor; herkese açık kullanıcı
                            girdisi bu alana ulaşmıyor. Bu alan ileride dış/kullanıcı kaynaklı içerik alacaksa
                            dangerouslySetInnerHTML kullanmadan önce bir sanitizer (örn. DOMPurify) eklenmeli. */}
                        <div
                            className="article-content text-base md:text-lg text-justify text-primary"
                            dangerouslySetInnerHTML={{ __html: articleContentToHtml(article.content) }}
                        />
                    </div>
```

- [ ] **Step 3: `.article-content` CSS sınıfını ekle**

`src/app/globals.css` dosyasında Task 1'de eklenen `.blog-content a { ... }` satırından hemen sonra ekle:

```css
.article-content h1 { font-size: 1.8rem; font-weight: 700; margin: 1rem 0; }
.article-content h2 { font-size: 1.4rem; font-weight: 700; margin: 0.85rem 0; }
.article-content h3 { font-size: 1.15rem; font-weight: 600; margin: 0.65rem 0; }
.article-content p  { margin: 0.5rem 0; line-height: 1.75; }
.article-content ul { list-style: disc; padding-left: 1.75rem; margin: 0.6rem 0; }
.article-content ol { list-style: decimal; padding-left: 1.75rem; margin: 0.6rem 0; }
.article-content li { margin: 0.25rem 0; }
.article-content blockquote { border-left: 3px solid var(--color-secondary); padding-left: 1rem; margin: 0.75rem 0; font-style: italic; color: #555; }
.article-content code { background: #f0f0f0; padding: 0.1em 0.35em; border-radius: 3px; font-size: 0.9em; }
.article-content img { max-width: 100%; height: auto; border-radius: 0.375rem; margin: 0.75rem 0; }
.article-content a { color: var(--color-secondary); text-decoration: underline; }
```

- [ ] **Step 4: Manuel doğrulama**

Çalıştır: `npm run dev`
Tarayıcıda:
- Task 2'de Tiptap ile eklenen (kalın/başlık/liste/resim/link içeren) yeni bir makalenin public sayfasını (`/pages/article/<slug>`) aç → biçimlendirmenin (kalın, başlık, liste, resim, link) doğru göründüğünü doğrula.
- Eski, düz metinli bir makalenin public sayfasını aç → paragrafların satır kaybı olmadan (boş satırların paragraf ayrımı, tek satır sonlarının `<br>` olarak) göründüğünü doğrula.

Beklenen: Her iki durumda da içerik okunabilir ve biçimlendirme korunuyor, konsolda hata yok.

- [ ] **Step 5: Commit**

```bash
git add src/app/pages/article/[slug]/page.js src/app/globals.css
git commit -m "fix: makale detay sayfasinda zengin icerigi HTML olarak bas"
```

---

## Self-Review

**1. Spec kapsaması:**
- Madde 1 (textarea → Tiptap geçişi) → Task 2 tarafından tam kapsanıyor.
- Madde 2 (Image/Link extension + resim yükleme entegrasyonu) → Task 1 tarafından tam kapsanıyor; mevcut `uploadImage()`/`ImageUpload.js` altyapısı okunup gerçek fonksiyon imzasıyla kullanıldı.
- Madde 3 (public sayfa HTML render + eski düz-metin fallback) → Task 3 tarafından tam kapsanıyor.
- Ek olarak: `BlogAdd.js`'nin yeni `imageFolder` prop'unu açıkça kullanması Task 2 Step 1'de eklendi (Task 1'de prop default'u `'articles'` olduğu için, eklenmezse blog resimleri de yanlışlıkla `imageFolder='articles'` ile işaretlenirdi — default'a güvenmek yerine açıkça belirtildi).
- `/api/upload` route'undaki klasör bug'ı kapsam dışı bırakıldı ve Global Constraints'te not edildi (ayrı plana bırakılacak).

**2. Placeholder taraması:** "TBD", "benzer şekilde", kod içermeyen adım bulunamadı — her adımda gerçek, kopyala-yapıştır kod veya tam komut var.

**3. Tip/isim tutarlılığı:** `TiptapEditor` prop'ları (`value`, `onChange`, `readOnly`, `imageFolder`) Task 1'de tanımlandı, Task 2'de (`BlogAdd.js`, `AddArticle.js`) aynı isimlerle kullanıldı. `articleContentToHtml` (Task 3) ve `plainOrHtmlToEditorHtml` (Task 2) aynı mantığı taşıyor ama isimleri farklı — bu kasıtlı: ikisi ayrı dosyada, birbirinden bağımsız yaşayan yardımcı fonksiyonlar (repodaki mevcut `slateToHtml`/`slateNodesToHtml` ikili-kopya deseniyle tutarlı, `BlogAdd.js` ve `blog/[slug]/page.js` de aynı mantığı iki kere taşıyor). Ortak bir `utils` dosyasına çıkarmak DRY açısından cazip olsa da mevcut kod tabanının kurulu deseniyle (duplicate-per-file) tutarlı kalmak için bilerek ayrı tutuldu.
