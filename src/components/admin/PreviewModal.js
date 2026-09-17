"use client";

import Image from "next/image";
import TiptapEditor from "../tiptap/TiptapEditor";

export default function PreviewModal({ open, onClose, title, subtitle, meta = [], image, contentHtml, isRichText }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] overflow-scroll">
      <div className="max-w-[80%] min-w-xl max-h-[90vh] overflow-scroll w-full mx-auto p-8 bg-white rounded shadow relative">
        <button
          className="absolute flex justify-center items-center w-[40px] h-[40px] top-2 right-2 text-gray-500 hover:text-white cursor-pointer font-extrabold hover:bg-primary text-xl p-2 rounded-xl"
          onClick={onClose}
          aria-label="Önizlemeyi Kapat"
          type="button"
        >
          X
        </button>
        <p className="text-xs uppercase tracking-wide text-primary/60 mb-2">Önizleme</p>
        {image && (
          <Image src={image} alt={title || "Önizleme görseli"} width={800} height={400} className="w-full h-64 object-cover rounded mb-4" />
        )}
        <h1 className="text-3xl font-bold mb-2">{title || "(Başlıksız)"}</h1>
        {subtitle && <p className="text-primary/70 mb-2">{subtitle}</p>}
        {meta.length > 0 && (
          <div className="flex gap-4 text-sm text-primary/60 mb-6">
            {meta.map((m, i) => <span key={i}>{m}</span>)}
          </div>
        )}
        <div className="border-t border-primary/10 pt-4">
          {isRichText ? (
            <TiptapEditor value={contentHtml} readOnly />
          ) : (
            <p className="whitespace-pre-wrap">{contentHtml}</p>
          )}
        </div>
      </div>
    </div>
  );
}
