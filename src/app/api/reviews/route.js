import { NextResponse } from "next/server";

// Hardcoded reviews - manuel olarak güncelle
function getMockReviews() {
  return {
    reviews: [
      {
        name: "Google Kullanıcısı",
        reviewId: "r1",
        reviewer: {
          displayName: "Ahmet Yılmaz",
          profilePhotoUrl:
            "https://randomuser.me/api/portraits/men/32.jpg",
        },
        starRating: 5,
        comment:
          "Avukatımızın desteği sayesinde çok zorlu bir süreci başarıyla atlattık. Her aşamada yanımızda oldu, tüm sorularımıza sabırla yanıt verdi. Kesinlikle tavsiye ediyorum.",
        createTime: "2024-06-10T12:34:56Z",
      },
      {
        name: "Google Kullanıcısı",
        reviewId: "r2",
        reviewer: {
          displayName: "Elif Kaya",
          profilePhotoUrl:
            "https://randomuser.me/api/portraits/women/44.jpg",
        },
        starRating: 4,
        comment:
          "İşlemlerimiz hızlıca tamamlandı. İletişim çok iyiydi, her aşamada bilgilendirildik. Sadece ofis biraz kalabalıktı, onun dışında her şey harikaydı.",
        createTime: "2024-05-22T09:15:00Z",
      },
      {
        name: "Google Kullanıcısı",
        reviewId: "r3",
        reviewer: {
          displayName: "Mehmet Demir",
          profilePhotoUrl:
            "https://randomuser.me/api/portraits/men/65.jpg",
        },
        starRating: 3,
        comment:
          "Genel olarak memnun kaldım. Bazı belgeler için biraz beklemek zorunda kaldık ama sonuçta istediğimiz gibi çözüldü.",
        createTime: "2024-04-18T16:40:00Z",
      },
      {
        name: "Google Kullanıcısı",
        reviewId: "r4",
        reviewer: {
          displayName: "Zeynep Aksoy",
          profilePhotoUrl:
            "https://randomuser.me/api/portraits/women/12.jpg",
        },
        starRating: 5,
        comment:
          "Çok ilgili ve profesyonel bir ekip. Tüm haklarımı en iyi şekilde savundular. Herkese tavsiye ederim.",
        createTime: "2024-03-05T11:20:00Z",
      },
      {
        name: "Google Kullanıcısı",
        reviewId: "r5",
        reviewer: {
          displayName: "Burak Şahin",
          profilePhotoUrl:
            "https://randomuser.me/api/portraits/men/23.jpg",
        },
        starRating: 2,
        comment:
          "İlk başta iletişimde bazı aksaklıklar yaşadık. Sonrasında süreç düzeldi ve istediğimiz sonuca ulaştık.",
        createTime: "2024-02-14T14:10:00Z",
      },
      {
        name: "Google Kullanıcısı",
        reviewId: "r6",
        reviewer: {
          displayName: "Selin Arslan",
          profilePhotoUrl:
            "https://randomuser.me/api/portraits/women/21.jpg",
        },
        starRating: 5,
        comment:
          "İlk başta çok endişeliydim fakat avukatımızın profesyonelliği sayesinde tüm süreci güvenle tamamladık. Her aşamada detaylı bilgilendirme yapıldı ve hiçbir sorum cevapsız kalmadı. Çok teşekkürler!",
        createTime: "2024-01-10T10:00:00Z",
      },
      {
        name: "Google Kullanıcısı",
        reviewId: "r7",
        reviewer: {
          displayName: "Kemal Özdemir",
          profilePhotoUrl:
            "https://randomuser.me/api/portraits/men/77.jpg",
        },
        starRating: 4,
        comment:
          "Hukuki sürecimizde hızlı ve etkili bir çözüm sunuldu. Sadece bazı belgeler için ek süreye ihtiyaç duyduk ama genel olarak memnun kaldık.",
        createTime: "2023-12-05T15:30:00Z",
      },
      {
        name: "Google Kullanıcısı",
        reviewId: "r8",
        reviewer: {
          displayName: "Ayşe Gül",
          profilePhotoUrl:
            "https://randomuser.me/api/portraits/women/33.jpg",
        },
        starRating: 3,
        comment:
          "İletişim konusunda bazen gecikmeler yaşadık ama sonuçta istediğimiz çözüme ulaştık. Teşekkürler.",
        createTime: "2023-11-20T18:45:00Z",
      },
      {
        name: "Google Kullanıcısı",
        reviewId: "r9",
        reviewer: {
          displayName: "Fatih Kılıç",
          profilePhotoUrl:
            "https://randomuser.me/api/portraits/men/12.jpg",
        },
        starRating: 5,
        comment:
          "Çok ilgili ve çözüm odaklı bir ekip. Tüm haklarımı en iyi şekilde savundular. Herkese tavsiye ederim.",
        createTime: "2023-10-02T09:00:00Z",
      },
    ],
    averageRating: "3.8",
    totalReviewCount: 9,
  };
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? Math.max(1, Math.min(50, Number(limitParam))) : null;

    const reviews = getMockReviews();
    
    if (limit) {
      reviews.reviews = reviews.reviews.slice(0, limit);
    }

    return NextResponse.json(reviews, {
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      }
    });
  } catch (error) {
    console.error("Reviews API hatası:", error);
    return NextResponse.json(
      { error: "Yorumlar yüklenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}


