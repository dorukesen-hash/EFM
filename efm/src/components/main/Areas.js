import Image from 'next/image';
import ticaret from '../../assets/areas/ticaret.webp';
import aile from '../../assets/areas/aile.jpg';
import kvkk from '../../assets/areas/kvkk.jpg';
import idare from '../../assets/areas/idare.jpg';
import sigorta from '../../assets/areas/sigorta.jpg';
import ceza from '../../assets/areas/ceza.jpg';
import tazminat from '../../assets/areas/tazminat.jpg';
import bosanma from '../../assets/areas/boşanma.jpeg';
import bilisim from '../../assets/areas/bilişim.jpg';
import saglik from '../../assets/areas/sağlık.jpg';
import miras from '../../assets/areas/miras.jpeg';



export default function Areas() {


    const areas = [
        {
            icon: "🏢",
            title: "Ticaret Hukuku",
            description:
                "Şirket kuruluşu, birleşme & devralma, genel kurul ve ticari işlemlerinizde hukuki danışmanlık veriyoruz.",
            bg: ticaret
        },
        {
            icon: "👨‍👩‍👧‍👦",
            title: "Aile ve Miras Hukuku",
            description:
                "Velayet, nafaka, miras paylaşımı gibi aile ve miras hukuku alanlarında yanınızdayız.",
            bg: aile
        },
        {
            icon: "🔒",
            title: "Kişisel Verilerin Korunması (KVKK)",
            description:
                "KVKK uyum süreçleri, veri envanteri oluşturma ve veri ihlali yönetimi konularında danışmanlık sunuyoruz.",
            bg: kvkk
        },
        {
            icon: "🏛️",
            title: "İdare Hukuku",
            description:
                "İdari işlemlere karşı dava açılması, iptal davaları ve idareyle ilgili hukuki süreçlerde yanınızdayız.",
            bg: idare
        },
        {
            icon: "🛡️",
            title: "Sigorta Hukuku",
            description:
                "Sigorta sözleşmeleri, tazminat talepleri ve sigorta şirketleriyle yaşanan uyuşmazlıklarda hukuki danışmanlık sağlıyoruz.",
            bg: sigorta
        },
        {
            icon: "⚔️",
            title: "Ceza Hukuku",
            description:
                "Ceza davaları, soruşturma ve kovuşturma süreçlerinde etkin savunma ve hukuki destek veriyoruz.",
            bg: ceza
        },
        {
            icon: "💰",
            title: "Tazminat Davaları",
            description:
                "Maddi ve manevi tazminat davalarında haklarınızı korumak için yanınızdayız.",
            bg: tazminat
        },
        {
            icon: "💔",
            title: "Boşanma Davaları",
            description:
                "Boşanma, velayet, nafaka ve mal paylaşımı davalarında uzman desteği sağlıyoruz.",
            bg: bosanma
        },
        {
            icon: "💻",
            title: "Bilişim Hukuku",
            description:
                "İnternet, sosyal medya ve bilişim suçları ile ilgili hukuki danışmanlık ve dava hizmeti veriyoruz.",
            bg: bilisim
        },
        {
            icon: "🏥",
            title: "Sağlık Hukuku",
            description:
                "Sağlık hizmetlerinden kaynaklanan uyuşmazlıklar ve hasta hakları konusunda hukuki destek sunuyoruz.",
            bg: saglik
        },
        {
            icon: "🏘️",
            title: "Gayrimenkul Hukuku",
            description:
                "Tapu işlemleri, ipotek, kira ve taşınmaz davalarında hukuki danışmanlık veriyoruz.",
            bg: miras
        }
    ];

    return (
        <section className="max-w-[1440px]

        w-full page-container flex flex-col items-center justify-center text-primary pt-20 md:pt-30 pb-16 md:pb-20 bg-foreground">
            <h2 className="text-4xl font-bold mb-10">Çalışma Alanlarımız</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                {areas.map((area, idx) => (
                    <div
                        key={area.title}
                        className="group h-[100px] md:h-[240px] relative flex w-full aspect-[4/3] sm:aspect-[9/8] md:aspect-[9/7] lg:aspect-[9/7] flex-col items-center justify-center text-center shadow-xl overflow-hidden rounded-md transition-all duration-500 md:hover:scale-105 md:hover:shadow-2xl"
                    >
                        <div className="absolute inset-0 z-0 transition-all duration-500 grayscale-60 md:group-hover:grayscale-0">
                            <Image
                                src={area.bg}
                                alt={area.title}
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                priority={idx === 0}
                                className="object-cover object-center w-full h-full rounded-md"
                            />
                        </div>
                        {/* Mobil: başlık üzerine arka plan, Desktop: alt panel */}
                        <div className="sm:hidden absolute inset-0 flex items-center justify-center z-10">
                            <div className="absolute inset-0 bg-black/40 z-0"></div>
                            <h3 className="text-base font-bold w-full px-3 py-2 text-center text-white relative z-10">{area.title}</h3>
                        </div>
                        <div className="hidden sm:flex w-full flex-col items-center bg-foreground/95 backdrop-blur-sm z-10 border-t-1 border-secondary min-h-[60px] transition-all duration-500">
                            <h3 className="text-lg font-bold w-full py-4">{area.title}</h3>
                            <p className="text-sm px-4 pb-4 max-h-0 md:group-hover:max-h-[200px] md:group-hover:py-2 overflow-hidden transition-all duration-500 ease-in-out">{area.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}