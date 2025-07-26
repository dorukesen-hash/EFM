import articles from "../articles";
import Image from "next/image";

export default function ArticleDetailPage({ params }) {
    const { slug } = params;
    const article = articles.find((a) => a.slug === slug);

    if (!article) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h1 className="text-3xl font-bold mb-4">Makale Bulunamadı</h1>
                <p>Aradığınız makale mevcut değil veya kaldırılmış olabilir.</p>
            </div>
        );
    }

    return (
        <div className="bg-background text-primary flex flex-col items-center min-h-screen">
            {/* Hero Section */}
            <section className="max-w-[1440px] w-full bg-foreground text-primary py-24 border-b-1 border-secondary">
                <div className="container mx-auto px-4 flex items-center justify-center flex-col">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
                        Makaleler
                    </h1>
                </div>
            </section>
            <div className="flex flex-col items-center min-h-screen w-full max-w-[1440px] pt-10 h-full">
                <h1 className="text-3xl md:text-4xl font-bold mb-4 h-full">{article.title}</h1>
                <div className="flex items-center gap-4 mb-6 text-primary text-sm">
                    <span>{article.author}</span>
                    <span>•</span>
                    <span>{article.date}</span>
                </div>
                <div className="p-6 w-full flex h-full min-h-full gap-4">
                    <Image
                        src={article.image}
                        alt={article.title}
                        width={400}
                        height={400}
                        className="h-72 min-w-[400px] min-h-[400px] object-cover "
                    />
                    <div className="h-full">
                    <p className="text-lg text-justify mb-6">{article.description}</p>
                    <div className="text-lg text-justify text-primary" >
                        {article.content}
                    </div>
                    </div>
                </div>


            </div>
        </div>
    );
}
