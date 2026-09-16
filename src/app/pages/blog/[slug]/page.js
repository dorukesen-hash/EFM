import Image from "next/image";
import Link from "next/link";
import { getBlogBySlug, getRelatedBlogs } from "../../../../services/firestore/content";
import { computeReadingTime, extractHeadings, addHeadingIds } from "../../../../utils/content";

// Firebase Admin SDK okumaları (gRPC) Next.js'in dinamik-veri algılamasına görünmez;
// bu export olmadan sayfa build zamanında statik olarak prerender edilir — yeni/güncellenen
// bloglar redeploy'a kadar görünmez ve scheduled-yayın mantığı (isPubliclyVisible'daki
// Date.now() kıyası) build anında donar. src/app/pages/blog/page.js'teki (Task 2) aynı
// desen burada da uygulanıyor.
export const dynamic = 'force-dynamic';

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
      images: blog.image ? [{ url: blog.image }] : undefined,
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

  const relatedBlogs = await getRelatedBlogs(blog.category, blog.slug);

  const html = getBlogHtml(blog.text);
  // Trust boundary: `html` Firestore'daki blog dokümanından geliyor ve sadece
  // admin panel üzerinden (auth arkasında) yazılabiliyor — bu yüzden
  // dangerouslySetInnerHTML burada güvenli kabul ediliyor (kullanıcı girdisi değil).
  const htmlWithIds = addHeadingIds(html);
  const headings = extractHeadings(html);
  const readingMinutes = computeReadingTime(html);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: blog.title,
    datePublished: blog.date,
    description: blog.description,
    ...(blog.image ? { image: [blog.image] } : {}),
  };

  return (
    <div className="bg-background text-primary flex flex-col items-center min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="max-w-[1440px] w-full bg-foreground text-primary py-24 border-b-1 border-secondary">
        <div className="container mx-auto px-4 flex items-center justify-center flex-col">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            Blog Yazıları
          </h1>
        </div>
      </section>
      <div className="flex flex-col items-center min-h-screen w-full max-w-[1440px] pt-10 h-full">
        {blog.image && (
          <Image
            src={blog.image}
            alt={blog.title}
            width={1200}
            height={600}
            className="w-full max-w-3xl h-64 md:h-80 object-cover rounded mb-6"
          />
        )}
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
          </div>
        </div>
      </div>
    </div>
  );
}
