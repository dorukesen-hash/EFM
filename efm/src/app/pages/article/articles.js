// Ortak makale verisi
// const articles = [
//     {
//         slug: "aile-hukuku",
//         title: "Aile Hukuku",
//         description: "Aile Hukuku, evlilik, boşanma, velayet, nafaka ve mal paylaşımı gibi aile bireyleri arasındaki ilişkileri düzenleyen hukuk dalıdır. Toplumun temel taşı olan ailenin korunması ve aile içi uyuşmazlıkların adil şekilde çözülmesi için önemli yasal düzenlemeler içerir.",
//         image: "/assets/areas/aile.jpg",
//         author: "BHM Hukuk ve Danışmanlık",
//         date: "26 Temmuz 2025",
//         content: `Aile Hukuku, toplumun en küçük birimi olan ailenin korunması ve aile bireyleri arasındaki ilişkilerin düzenlenmesi amacıyla oluşturulmuş bir hukuk dalıdır. Evlilik, boşanma, velayet, nafaka, mal paylaşımı, evlat edinme ve soybağı gibi konular Aile Hukuku'nun kapsamına girer. Aile içi anlaşmazlıkların çözümünde, tarafların haklarının korunması ve çocukların üstün yararının gözetilmesi esastır. Aile Hukuku, toplumsal barışın sağlanmasında ve bireylerin haklarının korunmasında önemli bir rol oynar.`
//     },
//     {
//         slug: "ceza-hukuku",
//         title: "Ceza Hukuku",
//         description: "Ceza Hukuku, suç teşkil eden fiillerin tanımlanması, cezaların belirlenmesi ve adil yargılanma süreçlerinin yürütülmesini sağlayan temel hukuk dalıdır. Bireylerin temel hak ve özgürlüklerinin korunmasında önemli bir rol oynar.",
//         image: "/assets/areas/ceza.jpg",
//         author: "BHM Hukuk ve Danışmanlık",
//         date: "25 Temmuz 2025",
//         content: `Ceza Hukuku, toplum düzenini korumak amacıyla hangi fiillerin suç sayılacağını ve bu fiillere uygulanacak yaptırımları belirler. Suçun unsurları, ceza sorumluluğu, ceza yargılaması, savunma hakkı ve adil yargılanma ilkeleri Ceza Hukuku'nun temel konularıdır. Ceza Hukuku, bireylerin haklarının korunması ve toplumsal güvenliğin sağlanması için vazgeçilmezdir. Suç isnadı altında olan kişilerin haklarının korunması ve adil bir yargılama süreci yürütülmesi, hukuk devleti ilkesinin gereğidir.`
//     },
//     {
//         slug: "ticaret-hukuku",
//         title: "Ticaret Hukuku",
//         description: "Ticaret Hukuku, ticari işletmelerin kuruluşu, işleyişi, birleşme ve devralmaları ile ticari sözleşmeler ve haksız rekabet gibi konuları düzenler. Şirketlerin hukuki güvenliğini sağlamak için temel kuralları içerir.",
//         image: "/assets/areas/ticaret.webp",
//         author: "BHM Hukuk ve Danışmanlık",
//         date: "24 Temmuz 2025",
//         content: `Ticaret Hukuku, ticari işletmelerin ve şirketlerin kuruluşundan tasfiyesine kadar olan tüm süreçleri kapsar. Ticari sözleşmeler, ortaklık yapıları, birleşme ve devralmalar, haksız rekabet, çek ve senet işlemleri gibi konular bu alanın başlıca başlıklarıdır. Ticaret Hukuku, ticari hayatın düzenli ve güvenli bir şekilde işlemesini sağlar. Şirketlerin hukuki risklerini minimize etmek ve ticari faaliyetlerini yasal çerçevede yürütmek için Ticaret Hukuku'na uygun hareket edilmesi gereklidir.`
//     },
//     {
//         slug: "bilisim-hukuku",
//         title: "Bilişim Hukuku",
//         description: "Bilişim Hukuku, dijital dünyada ortaya çıkan hukuki sorunları, siber suçları, kişisel verilerin korunmasını ve internet ortamındaki hak ve yükümlülükleri düzenler.",
//         image: "/assets/areas/bilisim.jpg",
//         author: "BHM Hukuk ve Danışmanlık",
//         date: "23 Temmuz 2025",
//         content: `Bilişim Hukuku, teknolojinin gelişmesiyle birlikte ortaya çıkan yeni hukuki sorunları kapsar. Kişisel verilerin korunması (KVKK), siber suçlar, e-ticaret, internet üzerinden yapılan sözleşmeler ve sosyal medya kullanımı bu alanın başlıca konularıdır. Dijital dünyada bireylerin ve kurumların haklarının korunması, bilgi güvenliği ve veri gizliliği Bilişim Hukuku'nun temel amaçlarındandır. Hızla değişen dijital ortamda, güncel yasal düzenlemelerin takibi büyük önem taşır.`
//     },
//     {
//         slug: "idare-hukuku",
//         title: "İdare Hukuku",
//         description: "İdare Hukuku, devletin idari organlarının bireylerle olan ilişkilerini, idari işlemleri ve bu işlemlere karşı başvurulabilecek yasal yolları düzenler.",
//         image: "/assets/areas/idare.jpg",
//         author: "BHM Hukuk ve Danışmanlık",
//         date: "22 Temmuz 2025",
//         content: `İdare Hukuku, devletin yürütme organlarının bireylerle olan ilişkilerini düzenler. İdari işlemler, idari sözleşmeler, kamu hizmetleri, idari yaptırımlar ve idari yargı bu alanın temel konularıdır. Bireylerin idarenin işlemlerine karşı haklarını arayabilmeleri için iptal ve tam yargı davaları açma hakkı vardır. İdare Hukuku, hukuk devleti ilkesinin hayata geçirilmesinde ve kamu yararının sağlanmasında önemli bir rol oynar.`
//     },
//     {
//         slug: "sigorta-hukuku",
//         title: "Sigorta Hukuku",
//         description: "Sigorta Hukuku, sigorta sözleşmelerinden doğan hak ve yükümlülükleri, tazminat taleplerini ve sigorta şirketleriyle yaşanan uyuşmazlıkların çözüm yollarını düzenler.",
//         image: "/assets/areas/sigorta.jpg",
//         author: "BHM Hukuk ve Danışmanlık",
//         date: "21 Temmuz 2025",
//         content: `Sigorta Hukuku, sigorta sözleşmelerinden doğan hak ve yükümlülükleri düzenler. Trafik kazaları, iş kazaları, yangın, deprem ve diğer sigorta poliçeleri kapsamında tazminat talepleri bu alanın başlıca konularıdır. Sigorta şirketleriyle yaşanan uyuşmazlıkların çözümünde, hak kaybı yaşanmaması için sürecin uzman avukatlarca takip edilmesi büyük önem taşır. Sigorta Hukuku, bireylerin ve kurumların maddi güvenliğini sağlamada önemli bir rol oynar.`
//     }
// ];
