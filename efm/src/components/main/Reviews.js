"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import reviewsData from "../../../public/reviewsSorted.json";

// Tarih formatını "bugün", "dün", "x hafta önce" gibi göster
const formatRelativeTime = (dateString) => {
	if (!dateString) return "";

	const date = new Date(dateString);
	const now = new Date();

	// Milisaniye farkı
	const diffMs = now - date;
	const diffSecs = Math.floor(diffMs / 1000);
	const diffMins = Math.floor(diffSecs / 60);
	const diffHours = Math.floor(diffMins / 60);
	const diffDays = Math.floor(diffHours / 24);

	// Yıl ve ay farkını daha doğru hesapla
	const yearsDiff = now.getFullYear() - date.getFullYear();
	const monthsDiff = now.getMonth() - date.getMonth();
	const totalMonths = yearsDiff * 12 + monthsDiff;

	// Saniye/Dakika/Saat
	if (diffSecs < 60) return "az önce";
	if (diffMins < 60) return `${diffMins} dakika önce`;
	if (diffHours < 24) return `${diffHours} saat önce`;

	// Gün
	if (diffDays === 0) return "bugün";
	if (diffDays === 1) return "dün";
	if (diffDays < 7) return `${diffDays} gün önce`;

	// Hafta (4 haftadan az)
	const diffWeeks = Math.floor(diffDays / 7);
	if (diffWeeks === 1) return "bu hafta";
	if (diffWeeks < 4) return `${diffWeeks} hafta önce`;

	// Ay (12 aydan az) - toplam ay sayısını kullan
	if (totalMonths === 1) return "bir ay önce";
	if (totalMonths > 0 && totalMonths < 12) return `${totalMonths} ay önce`;

	// Yıl - tam yıl sayısını kontrol et
	const fullYears = Math.floor(totalMonths / 12);
	if (fullYears === 1) return "bir yıl önce";
	if (fullYears > 1) return `${fullYears} yıl önce`;

	// Fallback
	return `${totalMonths} ay önce`;
};

export default function Reviews() {
	const data = reviewsData;
	const reviews = Array.isArray(data.reviews) ? data.reviews : [];
	const scrollRef = useRef(null);

	useEffect(() => {
		const el = scrollRef.current;
		if (!el) return;

		const onWheel = (event) => {
			if (el.scrollWidth <= el.clientWidth) return;

			const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY)
				? event.deltaX
				: event.deltaY;
			if (delta !== 0) {
				event.preventDefault();
				el.scrollLeft += delta;
			}
		};

		el.addEventListener("wheel", onWheel, { passive: false });
		return () => el.removeEventListener("wheel", onWheel);
	}, []);

	return (
		<section className="max-w-[1440px] w-full page-container flex flex-col items-center justify-center text-primary backdrop-blur-sm pt-20 md:pt-30 pb-16 md:pb-20 bg-white/25">
			<h2 className="text-3xl font-bold mb-2 text-center">Müvekkillerimizin Değerlendirmeleri</h2>
			<div className="mb-6 md:mb-8 text-base md:text-lg text-primary text-center">
				Ortalama Puan: {data.averageRating} / 5
			</div>

			<div
				ref={scrollRef}
				className="w-full overflow-x-auto reviews-scroll"
			>
				<div className="flex h-full gap-4 md:gap-6 pb-4 ">
					{reviews.map((review, idx) => {
						const reviewerName = review?.displayName || "Google Kullanıcısı";
						const reviewerPhoto = review?.profilePhotoUrl;
						const relativeTime = formatRelativeTime(review?.createTime);
						const comment = review?.comment || "";
						const totalReviewCount = review?.totalReviewCount || 0;

						return (
							// Card
							<div
								key={idx}
								className="flex flex-col w-[280px] md:min-w-[480px] shrink-0 bg-white rounded-xl shadow-lg p-6 md:p-8 "
							>
								{/* Resim ve  isim */}
								<div className="flex gap-3 md:gap-4 mb-4">
									<Image
										src={reviewerPhoto}
										alt={reviewerName}
										width={80}
										height={80}
										className="w-12 h-12 md:w-14 md:h-14 rounded-full border"
									/>
									<div>
										<p className="font-semibold text-md">{reviewerName}</p>
										<p className="text-sm font-light text-gray-500">
											{totalReviewCount > 1 && `${totalReviewCount} yorum `}
										</p>
									</div>
								</div>
								{/* Yıldız ve bilgi*/}
								<div className="mb-4 flex gap-1 items-center">
									{Array.from({ length: 5 }).map((_, i) => (
										<span
											key={i}
											className={`text-xl ${i < review.starRating ? "text-yellow-500" : "text-gray-300"}`}
											style={{ fontWeight: "bold", lineHeight: 1 }}
										>
											★
										</span>
									))}
									<p className="text-sm pl-2 text-gray-500">
										{relativeTime}
									</p>
									{/* Yorum metni */}
								</div>
									<p
										className="text-sm md:text-md text-gray-800 leading-relaxed"
										style={{ textAlign: "justify" }}
									>
											{comment}
										</p>
							</div>
						);
					})}
				</div>
			</div>

			<p className="mt-6 text-center text-xs md:text-sm text-primary">
				*Bu yorumlar Google işletme hesabından otomatik olarak alınmıştır.
			</p>
		</section>
	);
}
