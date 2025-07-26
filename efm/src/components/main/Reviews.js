"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function Reviews() {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [page, setPage] = useState(0);

	useEffect(() => {
		fetch("/api/reviews")
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

	return (
		<section className="max-w-[1440px] w-full flex flex-col items-center justify-center text-primary backdrop-blur-sm pt-30 pb-20 bg-white/25">
			<h2 className="text-3xl font-bold mb-2">Müvekkillerimizin Değerlendirmeleri</h2>
			<div className="mb-8 text-lg text-primary">
				Ortalama Puan: {data.averageRating} / 5
			</div>
			<div className="flex flex-col justify-between w-full px-8 h-[480px]">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					{data.reviews.slice(page * 3, (page + 1) * 3).map((review, idx) => (
						<div key={review.reviewId || idx} className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-start">
							<div className="flex items-center gap-4 mb-2">
								<Image
									src={review.reviewer.profilePhotoUrl}
									alt={review.reviewer.displayName}
									width={80}
									height={80}
									className="w-10 h-10 rounded-full border"
								/>
								<div>
									<p className="font-semibold text-lg">
										{review.reviewer.displayName}
									</p>
									<p className="text-xs font-light">
										{new Date(review.createTime).toLocaleDateString()}
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
							<p className="text-md text-gray-800 mb-2">
								{review.comment}
							</p>
							{review.reviewReply?.comment && (
								<div className="mt-2 p-2 bg-gray-100 rounded text-sm text-gray-600">
									<span className="font-semibold">Yanıt:</span>{" "}
									{review.reviewReply.comment}
								</div>
							)}
						</div>
					))}
				</div>
				{/* Pagination & Buttons */}
				<div className="flex flex-col  justify-center items-center mt-8">
					<p className="col-span-4 text-center w-full mb-6 text-sm text-primary">*Bu yorumlar Google işletme hesabından otomatik olarak alınmıştır.</p>
					<div className="flex gap-2">
						{Array.from({ length: Math.ceil(data.reviews.length / 4) }).map((_, i) => (
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
