import { NextResponse } from "next/server";
import { google } from "googleapis";

const serviceAccount = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
const businessAccountId = process.env.GOOGLE_BUSINESS_ACCOUNT_ID;
const locationId = process.env.GOOGLE_BUSINESS_LOCATION_ID;

export async function GET() {
  try {
    // if (!serviceAccount || !businessAccountId || !locationId) {
    //   return NextResponse.json(
    //     { error: "API kimlik bilgileri eksik." },
    //     { status: 400 }
    //   );
    // }

    // const auth = new google.auth.GoogleAuth({
    //   credentials: JSON.parse(serviceAccount),
    //   scopes: ["https://www.googleapis.com/auth/business.manage"],
    // });
    // const mybusiness = google.mybusiness({ version: "v4", auth });
    // const parent = `accounts/${businessAccountId}/locations/${locationId}`;
    // const res = await mybusiness.accounts.locations.reviews.list({ parent });
    // return NextResponse.json(res.data);

    return NextResponse.json({
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
    });
  } catch (error) {
    return NextResponse.json(
      { error: "İç sunucu hatası." },
      { status: 500 }
    );
  }
}
