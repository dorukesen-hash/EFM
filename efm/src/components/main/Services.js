"use client"
import React, { useState } from "react";

export default function Services() {
    const [openIdxs, setOpenIdxs] = useState([]);

    const services = [
        {
            icon: "⚖️",
            title: "Dava ve Uyuşmazlık Çözümü",
            description:
                "Bireysel ve kurumsal müvekkillerimize dava takibi, arabuluculuk ve alternatif uyuşmazlık çözüm yolları sunuyoruz."
        },
        {
            icon: "📄",
            title: "Sözleşme Hazırlama ve İnceleme",
            description:
                "Ticari ve bireysel sözleşmelerin hazırlanması, incelenmesi ve müzakere süreçlerinde profesyonel destek sağlıyoruz."
        },
        {
            icon: "📑",
            title: "Dava Takibi",
            description:
                "Her türlü hukuki uyuşmazlıkta dava sürecinin başından sonuna kadar profesyonel takip hizmeti sunuyoruz."
        },

        {
            icon: "📬",
            title: "İcra Takibi",
            description:
                "Alacakların tahsili için icra takibi başlatılması ve yürütülmesinde profesyonel hizmet veriyoruz."
        },
        {
            icon: "📚",
            title: "Hukuki Danışmanlık",
            description:
                "Bireysel ve kurumsal tüm hukuki sorunlarınızda danışmanlık hizmeti sunuyoruz."
        },
        {
            icon: "📝",
            title: "Sözleşme Hazırlama",
            description:
                "Her türlü sözleşmenin hazırlanması, incelenmesi ve revize edilmesinde profesyonel destek sunuyoruz."
        },
        {
            icon: "✍️",
            title: "Dilekçe Hazırlama",
            description:
                "Dava, başvuru ve itiraz dilekçelerinizin hazırlanmasında uzman ekibimizle yanınızdayız."
        }
    ];

    return (
        <section
            className="max-w-[1440px] w-full page-container flex flex-col items-center justify-center text-primary pt-20 md:pt-30 pb-16 md:pb-20 bg-white"
            aria-labelledby="services-title"
        >
            <h2 id="services-title" className="text-4xl font-bold mb-8 md:mb-10 text-center">
                Hizmetlerimiz
            </h2>
            <div className="flex flex-col gap-4 md:gap-6 w-full max-w-2xl">
                {services.map((service, idx) => (
                    <div
                        key={service.title}
                        className="overflow-hidden transition-all duration-300 border-1 border-transparent "
                    >
                        <button
                            className={`flex items-center w-full px-4 md:px-6 py-3 md:py-4 text-left transition-colors ${openIdxs.includes(idx) ? 'bg-primary text-white' : 'bg-foreground text-primary'} cursor-pointer`}
                            onClick={() => {
                                setOpenIdxs((prev) =>
                                    prev.includes(idx)
                                        ? prev.filter((i) => i !== idx)
                                        : [...prev, idx]
                                );
                            }}
                            aria-expanded={openIdxs.includes(idx)}
                        >
                            <span className="font-semibold text-base md:text-lg flex-1">{service.title}</span>
                            <svg
                                className={`w-5 h-5 ml-2 transform transition-transform duration-300 ${openIdxs.includes(idx) ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        <div
                            className={`border-x-1 border-b-1 border-secondary transition-all duration-700 ease-in-out px-4 text-center md:text-justify ${openIdxs.includes(idx) ? 'max-h-48 py-6 opacity-100' : 'max-h-0 py-0 opacity-0'} overflow-hidden text-primary`}
                            style={{
                                transitionProperty: 'max-height, opacity, padding',
                            }}
                        >
                            <p>{service.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}