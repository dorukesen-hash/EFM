import Image from "next/image";
import Link from "next/link";

import bio from "../../assets/bio.jpg";

export default function Bio() {
  return (
    <section className="max-w-[1440px] w-full page-container flex flex-col md:flex-row items-center justify-center text-primary pt-20 md:pt-24 lg:pt-30 pb-16 md:pb-16 lg:pb-20 px-4 md:px-8 lg:px-12 bg-white shadow-lg">
      <div className="w-full md:w-2/5 lg:w-1/3 flex justify-center items-center mb-6 md:mb-0">
        <Image
          src={bio}
          alt="Av. Enver Furkan METE"
          width={320}
          height={420}
          className="rounded-2xl shadow-lg object-cover w-56 h-72 md:w-64 md:h-80 lg:w-[320px] lg:h-[420px]"
        />
      </div>
      <div className="w-full md:w-3/5 lg:w-2/3 flex flex-col justify-center items-start text-left max-w-3xl md:pl-6 lg:pl-8">
        <h2 className="text-4xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-3 lg:mb-4">Av. Enver Furkan METE</h2>
        <p className="text-base md:text-base lg:text-lg mb-4 md:mb-3 lg:mb-4">
          Av. Enver Furkan Mete ortaöğretim ve lise eğitimini Rize&apos;de tamamlamış, lisans eğitimini ise Ankara Üniversitesi Hukuk Fakültesi&apos;nde bitirmiştir. Mezuniyetinin ardından avukatlık kariyerine Rize Barosu&apos;nda başlamış olup halen Rize Barosu&apos;na bağlı olarak mesleğini sürdürmektedir.
        </p>
        <p className="text-base md:text-base lg:text-lg mb-2">
          Avukatlık mesleğini icra ederken birçok mesleki konferans ve eğitime katılmış, çeşitli alanlarda sertifikalar almaya hak kazanmıştır. Özellikle gayrimenkul, kira, iş, boşanma ve ticaret davaları ile ceza hukuku alanında çalışmalarını yoğunlaştırmıştır.
        </p>
        <p className="text-base md:text-base lg:text-lg mb-2">
          Müvekkillerinin haklarını en iyi şekilde korumak ve adaletin sağlanmasına katkı sunmak için şeffaflık, güven ve çözüm odaklı bir yaklaşımla hizmet vermektedir. Hukuki süreçlerinizde yanınızda olmaktan mutluluk duyar.
        </p>
        <div className="mt-6 md:mt-4 lg:mt-6 flex gap-4 text-lg md:text-base lg:text-lg">
          <Link href="/pages/about" className="px-6 py-2 bg-primary text-white shadow hover:bg-secondary transition">Hakkında</Link>
        </div>
      </div>
    </section>
  )
}
