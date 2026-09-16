// src/utils/content.js
// Tiptap'in ürettiği HTML içeriğinden okuma süresi ve içindekiler (TOC) türetme.

export function computeReadingTime(html) {
  if (!html) return 1;
  const text = html.replace(/<[^>]*>/g, ' ');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const WORDS_PER_MINUTE = 200;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

function slugifyHeading(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}

export function extractHeadings(html) {
  if (!html) return [];
  const matches = [...html.matchAll(/<h([23])[^>]*>(.*?)<\/h\1>/gi)];
  return matches.map((m, i) => {
    const level = parseInt(m[1], 10);
    const text = m[2].replace(/<[^>]*>/g, '').trim();
    const id = `${slugifyHeading(text)}-${i}`;
    return { id, text, level };
  });
}

// Not: extractHeadings ve addHeadingIds aynı sırada aynı ID üretim mantığını
// (slugifyHeading + index) kullanmalı, yoksa TOC linkleri sayfadaki gerçek
// id'lerle eşleşmez. Bu yüzden ikisi de bu dosyada, aynı slugifyHeading
// fonksiyonunu paylaşıyor.
export function addHeadingIds(html) {
  if (!html) return html;
  let i = 0;
  return html.replace(/<h([23])([^>]*)>(.*?)<\/h\1>/gi, (full, level, attrs, inner) => {
    const text = inner.replace(/<[^>]*>/g, '').trim();
    const id = `${slugifyHeading(text)}-${i}`;
    i += 1;
    return `<h${level}${attrs} id="${id}">${inner}</h${level}>`;
  });
}
