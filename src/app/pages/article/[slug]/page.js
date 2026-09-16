import Image from "next/image";
import Link from "next/link";
import { getArticleBySlug, getRelatedArticles } from "../../../../services/firestore/content";
import { computeReadingTime } from "../../../../utils/content";

// Firebase Admin SDK okumaları (gRPC) Next.js'in dinamik-veri algılamasına görünmez;
// bu export olmadan sayfa build zamanında statik olarak prerender edilir — yeni/güncellenen
// makaleler redeploy'a kadar görünmez ve scheduled-yayın mantığı (isPubliclyVisible'daki
// Date.now() kıyası) build anında donar. src/app/pages/blog/[slug]/page.js'teki (Task 3) ve
// src/app/pages/article/page.js'teki (Task 4) aynı desen burada da uygulanıyor.
export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://enverfurkanmete.av.tr";

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
      images: article.image ? [{ url: article.image }] : undefined,
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

  const relatedArticles = await getRelatedArticles(article.category, article.slug);

  const html = articleContentToHtml(article.content);
  const readingMinutes = computeReadingTime(html);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    datePublished: article.date,
    author: { "@type": "Person", name: article.author },
    description: article.description,
    ...(article.image ? { image: [new URL(article.image, SITE_URL).toString()] } : {}),
  };

  return (
    <div className="bg-background text-primary flex flex-col items-center min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero Section */}
      <section className="max-w-[1440px] w-full bg-foreground text-primary py-24 border-b-1 border-secondary">
        <div className="container mx-auto px-4 flex items-center justify-center flex-col">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            Makaleler
          </h1>
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
            {/* İçerik sadece admin panelinden (auth korumalı) giriliyor; herkese açık kullanıcı
                girdisi bu alana ulaşmıyor. Bu alan ileride dış/kullanıcı kaynaklı içerik alacaksa
                dangerouslySetInnerHTML kullanmadan önce bir sanitizer (örn. DOMPurify) eklenmeli. */}
            <div
              className="article-content text-base md:text-lg text-justify text-primary"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        </div>
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
      </div>
    </div>
  );
}
