import Image from 'next/image';
import ticaret from '@/assets/areas/ticaret.webp';
import aile from '@/assets/areas/aile.jpg';
import kvkk from '@/assets/areas/kvkk.jpg';
import idare from '@/assets/areas/idare.jpg';
import sigorta from '@/assets/areas/sigorta.jpg';
import ceza from '@/assets/areas/ceza.jpg';
import tazminat from '@/assets/areas/tazminat.jpg';
import boşanma from '@/assets/areas/boşanma.jpeg';
import bilişim from '@/assets/areas/bilişim.jpg';
import sağlık from '@/assets/areas/sağlık.jpg';
import gayrimenkul from '@/assets/areas/miras.jpeg';



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
            bg: boşanma
        },
        {
            icon: "💻",
            title: "Bilişim Hukuku",
            description:
                "İnternet, sosyal medya ve bilişim suçları ile ilgili hukuki danışmanlık ve dava hizmeti veriyoruz.",
            bg: bilişim
        },
        {
            icon: "🏥",
            title: "Sağlık Hukuku",
            description:
                "Sağlık hizmetlerinden kaynaklanan uyuşmazlıklar ve hasta hakları konusunda hukuki destek sunuyoruz.",
            bg: sağlık
        },
        {
            icon: "🏘️",
            title: "Gayrimenkul Hukuku",
            description:
                "Tapu işlemleri, ipotek, kira ve taşınmaz davalarında hukuki danışmanlık veriyoruz.",
            bg: gayrimenkul
        }
    ];

    return (
        <section className="max-w-[1440px] w-full flex flex-col items-center justify-center text-primary pt-30 pb-20 bg-foreground">
            <h2 className="text-4xl font-bold mb-10">Çalışma Alanlarımız</h2>
            <div className="flex flex-wrap gap-8 w-full justify-center">
                {areas.map((area, idx) => (
                    <div
                        key={idx}
                        className="group relative flex w-[360px] h-[340px] flex-col items-center justify-end text-center shadow-xl overflow-hidden rounded-md transition-all duration-500 hover:scale-105 hover:shadow-2xl"
                    >
                        <div className="absolute inset-0 z-0 transition-all duration-500 grayscale-60 group-hover:grayscale-0">
                            <Image
                                src={area.bg}
                                alt={area.title}
                                fill
                                sizes="(max-width: 768px) 100vw, 360px"
                                priority={idx < 2}
                                className="object-cover object-center w-full h-full rounded-md"
                            />
                        </div>
                        <div className="w-full flex flex-col items-center jus bg-foreground z-10 border-t-1 border-secondary h-[60px] group-hover:h-[160px] transition-all duration-800 ease-in-out">
                            <h3 className="text-lg font-bold w-full min-h-[60px] max-h-[60px] py-4">{area.title}</h3>
                            <p className="text-sm px-4 py-3 w-full max-h-0 group-hover:max-h-[160px] group-hover:min-h-[160px] transition-all duration-800 ease-in-out">{area.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}