import { getArticlesPage } from "../../../services/firestore/content";
import ArticleLoadMore from "./ArticleLoadMore";

export const metadata = {
  title: "Makaleler | Av. Enver Furkan Mete",
  description: "Hukuk ve güncel konularda paylaştığımız makaleleri keşfedin.",
};

// Firebase Admin SDK okumaları (gRPC) Next.js'in dinamik-veri algılamasına görünmez;
// bu export olmadan sayfa build zamanında statik olarak prerender edilir — yeni/güncellenen
// makaleler redeploy'a kadar görünmez ve scheduled-yayın mantığı (isPubliclyVisible'daki
// Date.now() kıyası) build anında donar. Eski client-fetch sayfanın davranışını
// (her istekte taze veri) korumak için force-dynamic kullanılıyor.
export const dynamic = 'force-dynamic';

export default async function ArticlePage() {
  const { articles, nextCursor } = await getArticlesPage({ limit: 9 });

  // ArticleLoadMore sadece bu alanları render ediyor; tam Firestore dokümanını
  // (özellikle ağır `content` alanını) client'a/RSC payload'a göndermemek için projeksiyon.
  const cardArticles = articles.map(a => ({
    id: a.id,
    slug: a.slug,
    title: a.title,
    description: a.description,
    date: a.date,
    author: a.author,
    image: a.image,
  }));

  return (
    <div className="bg-background text-primary flex flex-col items-center min-h-screen">
      {/* Hero Section */}
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

      {/* Articles Grid */}
      <section className="max-w-[1440px] w-full container mx-auto px-3 md:px-4 py-10 md:py-16">
        <ArticleLoadMore initialArticles={cardArticles} initialNextCursor={nextCursor} />
      </section>
    </div>
  );
}
