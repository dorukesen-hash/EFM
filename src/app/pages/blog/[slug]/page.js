"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import RichTextExample from "../../../../components/slate/richtext";

export default function BlogDetailPage() {
    const { slug } = useParams();
    const [blog, setBlog] = useState(null);
    useEffect(() => {
        fetch("/api/blogs")
            .then(res => res.json())
            .then(data => {
                const found = (data.blogs || []).find(a => a.slug === slug);
                setBlog(found);
            });
    }, [slug]);

    if (!blog) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h1 className="text-3xl font-bold mb-4">Blog yazısı Bulunamadı</h1>
                <p>Aradığınız yazı mevcut değil veya kaldırılmış olabilir.</p>
            </div>
        );
    }

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
            <div className="flex flex-col items-center min-h-screen w-full max-w-[1440px] pt-10 h-full">
                <h1 className="text-3xl md:text-4xl font-bold mb-4 h-full">{blog.title}</h1>
                <div className="flex items-center gap-4 mb-6 text-primary text-sm">
                    <span>{blog.category}</span>
                    <span>•</span>
                    <span>{blog.date}</span>
                </div>
                <div className="p-6 w-full flex h-full min-h-full gap-4">
                    <div className="h-full">
                    <p className="text-lg text-justify mb-6">{blog.description}</p>
                    <div className="text-lg text-justify text-primary" >
                        <RichTextExample value={blog.text} readOnly={true} />
                    </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
