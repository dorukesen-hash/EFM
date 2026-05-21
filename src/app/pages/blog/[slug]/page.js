"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

// Geriye dönük uyumluluk: eski Slate JSON → HTML dönüştürücü
function slateNodesToHtml(nodes) {
  if (!Array.isArray(nodes)) return '';
  return nodes.map(nodeToHtml).join('');
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
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
  return children.map(child =>
    child.text !== undefined ? leafToHtml(child) : nodeToHtml(child)
  ).join('');
}

function nodeToHtml(node) {
  const inner = childrenToHtml(node.children);
  const align = node.align ? ` style="text-align:${node.align}"` : '';
  switch (node.type) {
    case 'heading-one':   return `<h1${align}>${inner}</h1>`;
    case 'heading-two':   return `<h2${align}>${inner}</h2>`;
    case 'block-quote':   return `<blockquote>${inner}</blockquote>`;
    case 'bulleted-list': return `<ul>${inner}</ul>`;
    case 'numbered-list': return `<ol>${inner}</ol>`;
    case 'list-item':     return `<li>${inner}</li>`;
    default:              return `<p${align}>${inner}</p>`;
  }
}

function getBlogHtml(text) {
  if (!text) return '';
  if (Array.isArray(text)) return slateNodesToHtml(text);
  return text;
}

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
            <section className="max-w-[1440px] w-full bg-foreground text-primary py-24 border-b-1 border-secondary">
                <div className="container mx-auto px-4 flex items-center justify-center flex-col">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
                        Blog Yazıları
                    </h1>
                </div>
            </section>
            <div className="flex flex-col items-center min-h-screen w-full max-w-[1440px] pt-10 h-full">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">{blog.title}</h1>
                <div className="flex items-center gap-4 mb-6 text-primary text-sm">
                    <span>{blog.category}</span>
                    <span>•</span>
                    <span>{blog.date}</span>
                </div>
                <div className="p-6 w-full">
                    <p className="text-lg text-justify mb-6">{blog.description}</p>
                    <div
                        className="blog-content text-base text-primary"
                        dangerouslySetInnerHTML={{ __html: getBlogHtml(blog.text) }}
                    />
                </div>
            </div>
        </div>
    );
}
