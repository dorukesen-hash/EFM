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
      {/* Hero Section */}
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
