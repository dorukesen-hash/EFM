import { getBlogsPage } from "../../../services/firestore/content";
import BlogLoadMore from "./BlogLoadMore";

export const metadata = {
  title: "Blog Yazıları | Av. Enver Furkan Mete",
  description: "Hukuk ve güncel konularda paylaşılan blog yazılarını keşfedin.",
};

// Firebase Admin SDK okumaları (gRPC) Next.js'in dinamik-veri algılamasına görünmez;
// bu export olmadan sayfa build zamanında statik olarak prerender edilir — yeni/güncellenen
// bloglar redeploy'a kadar görünmez ve scheduled-yayın mantığı (isPubliclyVisible'daki
// Date.now() kıyası) build anında donar. Eski client-fetch sayfanın davranışını
// (her istekte taze veri) korumak için force-dynamic kullanılıyor.
export const dynamic = 'force-dynamic';

export default async function BlogPage() {
  const { blogs, nextCursor } = await getBlogsPage({ limit: 9 });

  // BlogLoadMore sadece bu 6 alanı render ediyor; tam Firestore dokümanını (özellikle
  // ağır rich-text `text` alanını) client'a/RSC payload'a göndermemek için projeksiyon.
  const cardBlogs = blogs.map(b => ({
    slug: b.slug,
    title: b.title,
    description: b.description,
    date: b.date,
    category: b.category,
    image: b.image,
  }));

  return (
    <div className="bg-background text-primary flex flex-col items-center min-h-screen">
      {/* Hero Section */}
      <section className="max-w-[1440px] w-full bg-foreground text-primary py-24 border-b-1 border-secondary">
        <div className="container mx-auto px-4 flex items-center justify-center flex-col">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            Blog Yazıları
          </h1>
        </div>
      </section>
      <section className="max-w-[1440px] w-full container mx-auto px-4 py-16">
        <BlogLoadMore initialBlogs={cardBlogs} initialNextCursor={nextCursor} />
      </section>
    </div>
  );
}
