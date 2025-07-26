import Image from "next/image";
import Link from "next/link";

import bio from "../../assets/bio.jpg";

export default function Bio() {


    return (
        <section className="max-w-[1440px] w-full flex flex-col md:flex-row items-center justify-center text-primary pt-30 pb-20 px-12 bg-white shadow-lg">
            <div className="w-full md:w-1/3 flex justify-center items-center">
                <Image
                    src={bio}
                    alt="Av. Enver Furkan METE"
                    width={240}
                    height={360}
                    className="rounded-2xl shadow-lg object-cover w-[320px] h-[420px]"
                />
            </div>
            <div className="w-full md:w-2/3 flex flex-col justify-center items-start text-left">
                <h2 className="text-4xl font-bold mb-4">Av. Enver Furkan METE</h2>
                <p className="text-lg mb-4">
                    Av. Enver Furkan Mete ortaöğretim ve lise eğitimini Rize'de tamamlamış, lisans eğitimini ise Ankara Üniversitesi Hukuk Fakültesi’nde bitirmiştir. Mezuniyetinin ardından avukatlık kariyerine Rize Barosu’nda başlamış olup halen Rize Barosu’na bağlı olarak mesleğini sürdürmektedir.
                </p>
                <p className="text-lg mb-2">
                    Avukatlık mesleğini icra ederken birçok mesleki konferans ve eğitime katılmış, çeşitli alanlarda sertifikalar almaya hak kazanmıştır. Özellikle gayrimenkul, kira, iş, boşanma ve ticaret davaları ile ceza hukuku alanında çalışmalarını yoğunlaştırmıştır.
                </p>
                <p className="text-lg mb-2">
                    Müvekkillerinin haklarını en iyi şekilde korumak ve adaletin sağlanmasına katkı sunmak için şeffaflık, güven ve çözüm odaklı bir yaklaşımla hizmet vermektedir. Hukuki süreçlerinizde yanınızda olmaktan mutluluk duyar.
                </p>
                <div className="mt-6 flex gap-4 text-lg">
                    <Link href="/pages/about" className="px-6 py-2 bg-primary text-white shadow hover:bg-secondary transition">Hakkında</Link>
                </div>
            </div>
        </section>
    )
}
