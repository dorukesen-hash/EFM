import Image from "next/image";
import Link from "next/link";
import articles from "./articles";

export default function ArticlePage(){

    return(
        <div className="bg-background text-primary flex flex-col items-center min-h-screen">
            {/* Hero Section */}
            <section className="max-w-[1440px] w-full bg-foreground text-primary py-24 border-b-1 border-secondary">
                <div className="container mx-auto px-4 flex items-center justify-center flex-col">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
                        Makaleler
                    </h1>
                </div>
            </section>

            {/* Articles Grid */}
            <section className="max-w-[1440px] w-full container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {articles.map((article) => (
                        <Link key={article.slug} href={`/pages/article/${article.slug}`} className="group border-1 border-gray-300 relative flex-col flex gap-2 bg-foreground rounded-sm overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105">
                            <Image
                                src={article.image}
                                alt={article.title}
                                width={400}
                                height={250}

                                className="w-full h-56 object-cover"
                            />
                            <div className="w-full px-6 overflow-hidden">
                                <h2 className="text-xl font-bold text-primary mb-2 group-hover:text-secondary transition-colors duration-300">
                                    {article.title}
                                </h2>
                                <p className="text-primary/80 mb-4 line-clamp-5 pb-20">
                                    {article.description}
                                </p>
                            </div>
                                <div className="absolute bg-primary shadow-xl w-full bottom-0 px-6 py-1 text-white/80 text-sm  flex justify-between items-center">
                                    <span>{article.author}</span>
                                    <span>{article.date}</span>
                                </div>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    )
}