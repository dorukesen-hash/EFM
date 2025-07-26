"use client";
import React, {useState} from "react";

export default function faqPage() {
    const [openIdxs, setOpenIdxs] = useState([]);

    const faq = [
        {
            question: "Hukuki uzmanlık alanlarınız nelerdir?",
            answer: "Büromuz, başta İcra ve İflas Hukuku, Ticaret Hukuku, Aile Hukuku, Ceza Hukuku ve Bilişim Hukuku olmak üzere geniş bir yelpazede hukuki hizmet sunmaktadır. Detaylı bilgi için hizmetlerimiz sayfamızı inceleyebilirsiniz."
        },
        {
            question: "Avukatlık ücreti nasıl belirleniyor?",
            answer: "Avukatlık ücreti, davanın niteliğine, harcanacak emeğe ve zamana göre değişiklik göstermektedir. İlk danışmanlık görüşmemizde, davanızın özelliklerine göre şeffaf bir ücretlendirme politikası sunuyoruz. Türkiye Barolar Birliği'nin belirlediği asgari ücret tarifesi de göz önünde bulundurulur."
        },
        {
            question: "Benim davama benzer davalarda tecrübeniz var mı?",
            answer: "Evet, portföyümüzde benzer nitelikte birçok dava bulunmaktadır. Müvekkil gizliliği esastır ancak genel olarak tecrübelerimizi ve benzer davalardaki yaklaşımımızı ilk görüşmemizde sizinle paylaşabiliriz."
        },
        {
            question: "Davamla kim ilgilenecek?",
            answer: "Davanız, ilgili alanda uzmanlaşmış avukatlarımızdan biri tarafından bizzat takip edilecektir. Süreç boyunca ekibimizdeki diğer avukatlar ve yardımcı personel de destek sağlayacaktır. Davanızın her aşamasında doğrudan sorumlu avukatınızla iletişim halinde olacaksınız."
        },
        {
            question: "Dava süreci hakkında ne sıklıkla bilgilendirileceğim?",
            answer: "Müvekkillerimizi davanın her önemli aşamasında (duruşma tarihleri, ara kararlar, bilirkişi raporları vb.) derhal bilgilendiriyoruz. Ayrıca, dilediğiniz zaman telefon veya e-posta yoluyla bize ulaşarak davanızın durumu hakkında bilgi alabilirsiniz. Şeffaf iletişim en temel prensibimizdir."
        },
        {
            question: "Davamın olası sonuçları nelerdir?",
            answer: "Her davanın kendine özgü koşulları vardır ve kesin bir sonuç garantisi vermek hukuken ve etik olarak mümkün değildir. Ancak ilk değerlendirmemizin ardından, dosyanızın mevcut durumuna göre davanızın güçlü ve zayıf yönlerini, olası riskleri ve lehinize sonuçlanma ihtimalini sizinle dürüst bir şekilde paylaşırız."
        },
        {
            question: "Davam ne kadar sürede sonuçlanır?",
            answer: "Dava süresi, mahkemenin iş yoğunluğuna, davanın karmaşıklığına, delillerin toplanma sürecine ve diğer birçok faktöre bağlı olarak değişmektedir. Size, benzer davalardaki tecrübelerimize dayanarak tahmini bir zaman aralığı sunabiliriz, ancak bu sürenin kesin olmadığını belirtmek isteriz."
        },
        {
            question: "İlk görüşme için ne hazırlamam gerekiyor?",
            answer: "İlk görüşmeye gelirken, davanızla ilgili tüm belgeleri (sözleşmeler, ihtarname, yazışmalar, fotoğraflar vb.), olayların kronolojik bir özetini ve varsa karşı tarafla ilgili bilgileri yanınızda getirmeniz, süreci hızlandıracaktır."
        },
        {
            question: "Danışmanlık hizmeti almadan doğrudan dava açabilir miyim?",
            answer: "Evet, dava açabilirsiniz. Ancak, dava açmadan önce bir avukattan danışmanlık hizmeti almak, haklarınızı ve davanın potansiyelini daha iyi anlamanıza, olası riskleri görmenize ve stratejinizi doğru belirlemenize yardımcı olur. Bu, gereksiz masraf ve hak kayıplarını önleyebilir."
        },
        {
            question: "Müvekkil-avukat gizliliği neleri kapsar?",
            answer: "Müvekkil-avukat gizliliği, bizimle paylaştığınız tüm bilgilerin, belgelerin ve konuşmaların meslek sırrı kapsamında korunması demektir. Bu bilgiler, sizin izniniz olmadan asla üçüncü kişilerle paylaşılamaz. Bu gizlilik, aramızdaki güven ilişkisinin temelidir."
        }
    ]

    return (
        <div className="bg-background text-primary flex flex-col items-center min-h-screen">
            <section className="max-w-[1440px] w-full bg-foreground text-primary py-24 border-b-1 border-secondary">
                <div className="container mx-auto px-4 flex items-center justify-center flex-col">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
                        Sıkça Sorulan Sorular
                    </h1>
                </div>
            </section>
                <div className="flex flex-col gap-6 w-full max-w-[1440px] mx-auto p-8">
                    {faq.map((item, idx) => (
                        <div
                            key={idx}
                            className="overflow-hidden transition-all duration-300 border-1 border-transparent "
                        >
                            <button
                                className={`flex items-center w-full px-6 py-4 text-left transition-colors ${openIdxs.includes(idx) ? 'bg-primary text-white' : 'bg-foreground text-primary'} cursor-pointer`}
                                onClick={() => {
                                    setOpenIdxs((prev) =>
                                        prev.includes(idx)
                                            ? prev.filter((i) => i !== idx)
                                            : [...prev, idx]
                                    );
                                }}
                                aria-expanded={openIdxs.includes(idx)}
                            >
                                <span className="font-semibold text-lg flex-1">{item.question}</span>
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
                                className={`border-x-1 border-b-1 border-secondary transition-all duration-800 ease-in-out px-4 text-justify ${openIdxs.includes(idx) ? 'max-h-40 py-10 opacity-100' : 'max-h-0 py-0 opacity-0'} overflow-hidden text-primary`}
                                style={{
                                    transitionProperty: 'max-height, opacity, padding',
                                }}
                            >
                                <p>{item.answer}</p>
                            </div>
                        </div>
                    ))}
                </div>

        </div>
    );


}
