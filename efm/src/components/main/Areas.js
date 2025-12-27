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
        <section className="max-w-[1440px] w-full page-container flex flex-col items-center justify-center text-primary pt-20 md:pt-30 pb-16 md:pb-20 bg-foreground">
            <h2 className="text-4xl font-bold mb-10">Çalışma Alanlarımız</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                {areas.map((area, idx) => (
                    <div
                        key={area.title}
                        className="group relative flex w-full h-[100px] sm:h-[360px] flex-col items-center justify-end text-center shadow-xl overflow-hidden rounded-md transition-all duration-500 md:hover:scale-105 md:hover:shadow-2xl"
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

                        {/* Mobil: başlık ortada yarı saydam arka planla */}
                        <div className="sm:hidden absolute inset-0 flex items-center justify-center z-10">
                            <div className="absolute inset-0 bg-black/40 z-0"></div>
                            <h3 className="text-base font-bold w-full px-3 py-2 text-center text-white relative z-10">{area.title}</h3>
                        </div>

                        {/* Tablet ve Desktop: alt panel hover efektli */}
                        <div className="hidden sm:flex h-[180px] w-full flex-col items-center bg-foreground/95 backdrop-blur-sm z-10 border-t-1 border-secondary transition-all duration-500 ease-in-out md:group-hover:bg-foreground/98">
                            {/* Başlık - her zaman görünür */}
                            <h3 className="text-lg font-bold w-full py-3 px-4 transition-all duration-500">{area.title}</h3>

                            {/* Kısa açıklama - normal durumda 3-4 satır görünür */}
                            <div className="w-full px-4 overflow-hidden transition-all duration-500 md:max-h-[60px] md:group-hover:max-h-[200px]">
                                <p className="text-sm pb-2 line-clamp-3 md:group-hover:line-clamp-none transition-all duration-500">{area.description}</p>
                            </div>

                            {/* Tarih - hover'da görünür */}
                            <div className="w-full px-4 pb-3 transition-all duration-500 opacity-0 max-h-0 md:group-hover:opacity-100 md:group-hover:max-h-[40px] overflow-hidden">
                                <p className="text-xs text-primary/70 italic">Güncelleme: {new Date().toLocaleDateString('tr-TR')}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}