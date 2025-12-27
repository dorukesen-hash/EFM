"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function Reviews() {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [page, setPage] = useState(0);

	useEffect(() => {
		fetch("/api/reviews?limit=30")
			.then((res) => res.json())
			.then((json) => {
				setData(json);
				setLoading(false);
			})
			.catch((err) => {
				setError("Yorumlar alınamadı.");
				console.log(err);
				setLoading(false);
			});
	}, []);

	if (loading)
		return <div className="text-center py-12">Yükleniyor...</div>;
	if (error)
		return (
			<div className="text-center py-12 text-red-500">{error}</div>
		);
	if (!data || !data.reviews) return null;

	const pageSize = 3;
	const reviews = Array.isArray(data.reviews) ? data.reviews : [];
	const pageCount = Math.max(1, Math.ceil(reviews.length / pageSize));
	const currentReviews = reviews.slice(page * pageSize, (page + 1) * pageSize);

	return (
		<section className="max-w-[1440px] w-full page-container flex flex-col items-center justify-center text-primary backdrop-blur-sm pt-20 md:pt-30 pb-16 md:pb-20 bg-white/25">
			<h2 className="text-3xl font-bold mb-2 text-center">Müvekkillerimizin Değerlendirmeleri</h2>
			<div className="mb-6 md:mb-8 text-base md:text-lg text-primary text-center">
				Ortalama Puan: {data.averageRating} / 5
			</div>
			<div className="flex flex-col justify-between w-full">
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
					{currentReviews.map((review, idx) => {
						const reviewerName = review?.reviewer?.displayName || "Google Kullanıcısı";
						const reviewerPhoto = review?.reviewer?.profilePhotoUrl || "/vercel.svg";
						const createdAt = review?.createTime ? new Date(review.createTime) : null;
						const comment = review?.comment || "";

						return (
							<div key={review?.reviewId || idx} className="bg-white rounded-xl shadow-lg p-4 md:p-6 flex flex-col items-start">
								<div className="flex items-center gap-3 md:gap-4 mb-2">
									<Image
										src={reviewerPhoto}
										alt={reviewerName}
										width={80}
										height={80}
										className="w-8 h-8 md:w-10 md:h-10 rounded-full border"
									/>
									<div>
										<p className="font-semibold text-base md:text-lg">{reviewerName}</p>
										<p className="text-xs font-light">
											{createdAt ? createdAt.toLocaleDateString() : ""}
										</p>
									</div>
								</div>
								<div className="mb-2 pt-2 flex gap-0.5">
									{Array.from({ length: 5 }).map((_, i) => (
										<span
											key={i}
											className={`text-xl ${i < (
												review.starRating === "FIVE" ? 5 :
												review.starRating === "FOUR" ? 4 :
												review.starRating === "THREE" ? 3 :
												review.starRating === "TWO" ? 2 :
												review.starRating === "ONE" ? 1 : 0
											) ? "text-yellow-500" : "text-gray-300"}`}
											style={{ fontWeight: "bold", lineHeight: 1 }}
										>
											★
										</span>
									))}
								</div>
								{comment && (
									<p className="text-sm md:text-md text-gray-800 mb-2">{comment}</p>
								)}
								{review.reviewReply?.comment && (
									<div className="mt-2 p-2 bg-gray-100 rounded text-sm text-gray-600">
										<span className="font-semibold">Yanıt:</span>{" "}
										{review.reviewReply.comment}
									</div>
								)}
							</div>
						);
					})}
				</div>
				<div className="flex flex-col justify-center items-center mt-6 md:mt-8">
					<p className="text-center w-full mb-4 md:mb-6 text-xs md:text-sm text-primary">*Bu yorumlar Google işletme hesabından otomatik olarak alınmıştır.</p>
					<div className="flex gap-2">
						{Array.from({ length: pageCount }).map((_, i) => (
							<button
								key={i}
								onClick={() => setPage(i)}
								className={`w-8 h-8 flex items-center justify-center text-white font-bold transition-colors ${i === page ? 'bg-secondary ' : 'bg-primary'} cursor-pointer`}
							>
								{i + 1}
							</button>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
