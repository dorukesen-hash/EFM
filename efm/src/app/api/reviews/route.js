import { NextResponse } from "next/server";
import { refreshAccessToken } from '../../../services/google/gbpOAuth';
import { getGbpOAuthConfig } from '../../../services/firestore/firestore';

const businessAccountId = process.env.GOOGLE_BUSINESS_ACCOUNT_ID;
const locationId = process.env.GOOGLE_BUSINESS_LOCATION_ID;

function normalizeReviewsPayload(payload) {
  const reviews = payload?.reviews || payload?.locationReviews || [];
  const nextPageToken = payload?.nextPageToken || "";
  return { reviews, nextPageToken };
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? Math.max(1, Math.min(50, Number(limitParam))) : null;

    const isDevelopment = !businessAccountId || !locationId ||
      businessAccountId === 'your_account_id_here' ||
      locationId === 'your_location_id_here';

    if (isDevelopment) {
      const mock = getMockReviews();
      if (limit) mock.reviews = mock.reviews.slice(0, limit);
      return NextResponse.json(mock, { headers: { 'Cache-Control': 'no-store' } });
    }

    // OAuth config yoksa mock'a düş (kurulum tamamlanana kadar site boş kalmasın)
    const cfg = await getGbpOAuthConfig();
    if (!cfg?.refreshToken) {
      const mock = getMockReviews();
      if (limit) mock.reviews = mock.reviews.slice(0, limit);
      return NextResponse.json(mock, { headers: { 'Cache-Control': 'no-store' } });
    }

    const accessToken = await refreshAccessToken(cfg.refreshToken);

    const response = await fetch(
      `https://mybusiness.googleapis.com/v4/accounts/${businessAccountId}/locations/${locationId}/reviews`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API isteği başarısız: ${response.status} ${response.statusText}`);
    }

    const raw = await response.json();
    const { reviews: rawReviews, nextPageToken } = normalizeReviewsPayload(raw);
    const reviews = limit ? rawReviews.slice(0, limit) : rawReviews;

    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, review) => sum + getNumericRating(review.starRating), 0) / reviews.length
      : 0;

    return NextResponse.json({
      reviews,
      averageRating: averageRating.toFixed(1),
      totalReviewCount: reviews.length,
      nextPageToken,
    }, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
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

// Yıldız derecelendirmesini sayıya çevir
function getNumericRating(starRating) {
  const ratingMap = {
    'FIVE': 5,
    'FOUR': 4,
    'THREE': 3,
    'TWO': 2,
    'ONE': 1,
  };
  return ratingMap[starRating] || 0;
}

// Test/Mock verileri
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
          starRating: "FIVE",
          comment:
            "Avukatımızın desteği sayesinde çok zorlu bir süreci başarıyla atlattık. Her aşamada yanımızda oldu, tüm sorularımıza sabırla yanıt verdi. Kesinlikle tavsiye ediyorum.",
          createTime: "2024-06-10T12:34:56Z",
          reviewReply: {
            comment:
              "Güzel yorumunuz için teşekkür ederiz. Size yardımcı olabilmek bizim için büyük mutluluk!",
          },
        },
        {
          name: "Google Kullanıcısı",
          reviewId: "r2",
          reviewer: {
            displayName: "Elif Kaya",
            profilePhotoUrl:
              "https://randomuser.me/api/portraits/women/44.jpg",
          },
          starRating: "FOUR",
          comment:
            "İşlemlerimiz hızlıca tamamlandı. İletişim çok iyiydi, her aşamada bilgilendirildik. Sadece ofis biraz kalabalıktı, onun dışında her şey harikaydı.",
          createTime: "2024-05-22T09:15:00Z",
          reviewReply: {
            comment:
              "Geri bildiriminiz için teşekkürler. Ofis yoğunluğunu azaltmak için çalışmalarımız devam ediyor.",
          },
        },
        {
          name: "Google Kullanıcısı",
          reviewId: "r3",
          reviewer: {
            displayName: "Mehmet Demir",
            profilePhotoUrl:
              "https://randomuser.me/api/portraits/men/65.jpg",
          },
          starRating: "THREE",
          comment:
            "Genel olarak memnun kaldım. Bazı belgeler için biraz beklemek zorunda kaldık ama sonuçta istediğimiz gibi çözüldü.",
          createTime: "2024-04-18T16:40:00Z",
          reviewReply: {
            comment:
              "Süreçte yaşanan gecikme için özür dileriz. Daha hızlı hizmet için ek önlemler alıyoruz.",
          },
        },
        {
          name: "Google Kullanıcısı",
          reviewId: "r4",
          reviewer: {
            displayName: "Zeynep Aksoy",
            profilePhotoUrl:
              "https://randomuser.me/api/portraits/women/12.jpg",
          },
          starRating: "FIVE",
          comment:
            "Çok ilgili ve profesyonel bir ekip. Tüm haklarımı en iyi şekilde savundular. Herkese tavsiye ederim.",
          createTime: "2024-03-05T11:20:00Z",
          reviewReply: {
            comment:
              "Güveniniz için teşekkürler. Her zaman yanınızdayız!",
          },
        },
        {
          name: "Google Kullanıcısı",
          reviewId: "r5",
          reviewer: {
            displayName: "Burak Şahin",
            profilePhotoUrl:
              "https://randomuser.me/api/portraits/men/23.jpg",
          },
          starRating: "TWO",
          comment:
            "İlk başta iletişimde bazı aksaklıklar yaşadık. Sonrasında süreç düzeldi ve istediğimiz sonuca ulaştık.",
          createTime: "2024-02-14T14:10:00Z",
          reviewReply: {
            comment:
              "İletişim sorununu hızlıca çözmek için ekibimizle görüştük. Anlayışınız için teşekkürler.",
          },
        },
        {
          name: "Google Kullanıcısı",
          reviewId: "r6",
          reviewer: {
            displayName: "Selin Arslan",
            profilePhotoUrl:
              "https://randomuser.me/api/portraits/women/21.jpg",
          },
          starRating: "FIVE",
          comment:
            "İlk başta çok endişeliydim fakat avukatımızın profesyonelliği sayesinde tüm süreci güvenle tamamladık. Her aşamada detaylı bilgilendirme yapıldı ve hiçbir sorum cevapsız kalmadı. Çok teşekkürler!",
          createTime: "2024-01-10T10:00:00Z",
          reviewReply: {
            comment:
              "Güveniniz için teşekkür ederiz. Her zaman yanınızdayız!",
          },
        },
        {
          name: "Google Kullanıcısı",
          reviewId: "r7",
          reviewer: {
            displayName: "Kemal Özdemir",
            profilePhotoUrl:
              "https://randomuser.me/api/portraits/men/77.jpg",
          },
          starRating: "FOUR",
          comment:
            "Hukuki sürecimizde hızlı ve etkili bir çözüm sunuldu. Sadece bazı belgeler için ek süreye ihtiyaç duyduk ama genel olarak memnun kaldık.",
          createTime: "2023-12-05T15:30:00Z",
          reviewReply: {
            comment:
              "Geri bildiriminiz için teşekkürler. Belgelerle ilgili süreçleri hızlandırmak için çalışmalarımız sürüyor.",
          },
        },
        {
          name: "Google Kullanıcısı",
          reviewId: "r8",
          reviewer: {
            displayName: "Ayşe Gül",
            profilePhotoUrl:
              "https://randomuser.me/api/portraits/women/33.jpg",
          },
          starRating: "THREE",
          comment:
            "İletişim konusunda bazen gecikmeler yaşadık ama sonuçta istediğimiz çözüme ulaştık. Teşekkürler.",
          createTime: "2023-11-20T18:45:00Z",
          reviewReply: {
            comment:
              "İletişim aksaklığı için özür dileriz. Süreçlerimizi geliştirmeye devam ediyoruz.",
          },
        },
        {
          name: "Google Kullanıcısı",
          reviewId: "r9",
          reviewer: {
            displayName: "Fatih Kılıç",
            profilePhotoUrl:
              "https://randomuser.me/api/portraits/men/12.jpg",
          },
          starRating: "FIVE",
          comment:
            "Çok ilgili ve çözüm odaklı bir ekip. Tüm haklarımı en iyi şekilde savundular. Herkese tavsiye ederim.",
          createTime: "2023-10-02T09:00:00Z",
          reviewReply: {
            comment:
              "Güzel yorumunuz için teşekkürler. Size yardımcı olabilmek bizim için büyük mutluluk!",
          },
        },
      ],
      averageRating: 3.8,
      totalReviewCount: 5,
      nextPageToken: "",
    };
}
