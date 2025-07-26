"use client";

import { services } from "./servicesData";
import React, { useState, useEffect } from "react";

export default function ServicesPage() {
	const [selected, setSelected] = useState(services[0].key);
	const selectedService = services.find((s) => s.key === selected);

	// URL hash ile doğrudan hizmet açılması için effect
	useEffect(() => {
		if (typeof window !== "undefined") {
			const onHashChange = () => {
				const hash = window.location.hash.replace("#", "");
				if (hash) {
					const found = services.find((s) => s.key === hash);
					if (found) setSelected(hash);
				}
				window.scrollTo({ top: 0, behavior: 'smooth' }); // Hash değişince en başa dön
			};
			onHashChange(); // İlk yüklemede hash kontrolü
			window.addEventListener("hashchange", onHashChange);
			return () => window.removeEventListener("hashchange", onHashChange);
		}
	}, []);

	// Navigasyon tıklamasında hash güncelle (scroll olmadan)
	const handleNavClick = (key) => {
		setSelected(key);
		if (typeof window !== "undefined") {
			history.replaceState(null, '', `#${key}`);
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	};

	return (
		<div className="bg-background text-primary flex flex-col items-center min-h-screen">
			<section className="max-w-[1440px] w-full bg-foreground text-primary py-24 border-b-1 border-secondary">
				<div className="container mx-auto px-4 flex items-center justify-center flex-col">
					<h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
						Hizmetlerimiz
					</h1>
				</div>
			</section>
			<div className="flex flex-col md:flex-row w-full max-w-[1440px] mx-auto bg-white mt-10">
				{/* Sol Navigasyon */}
				<nav className="md:w-1/3 min-w-[220px] max-w-[400px]">
					<ul className="space-y-2">
						{services.map((service) => (
							<li key={service.key} id={service.key}>
								<button
									className={`w-full text-left px-4 py-2 bg-foreground transition font-medium cursor-pointer ${
										selected === service.key
											? "bg-primary text-white"
											: "hover:bg-primary/10 text-primary"
									}`}
									onClick={() => handleNavClick(service.key)}
								>
									{service.title}
								</button>
							</li>
						))}
					</ul>
				</nav>
				{/* Sağ İçerik */}
				<section className="flex-1 p-8 flex flex-col justify-start">
					<h2 className="text-2xl font-bold mb-4 text-primary">
						{selectedService.title}
					</h2>
					<p className="text-lg  leading-relaxed">
						{selectedService.description}
					</p>
				</section>
			</div>
		</div>
	);
}
