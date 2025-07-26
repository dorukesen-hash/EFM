import Image from "next/image";
import bioPic from "../../../assets/bio.jpg";
import Link from "next/link";

export const metadata = {
  title: "Hakkımızda - EFM Hukuk",
  description: "EFM Hukuk'un misyonu, vizyonu ve temel değerleri hakkında daha fazla bilgi edinin. Profesyonel ve güvenilir hukuki çözümler sunuyoruz.",
};

const whyUs = [
    {
        title: "Stratejik Yaklaşım",
        description: "Her davayı kendi özel koşulları içinde değerlendirir, stratejik ve sonuç odaklı bir yol haritası çizeriz."
    },
    {
        title: "Teknolojik Altyapı",
        description: "Hukuki süreçleri daha verimli yönetmek için en güncel teknolojilerden faydalanırız."
    },
    {
        title: "Güvenilirlik",
        description: "Müvekkillerimle şeffaf ve güvene dayalı bir iletişim kurarız."
    }
]

export default function AboutPage() {
  return (
    <div className="bg-background text-primary flex flex-col items-center justify-center min-h-screen">
      {/* Hero Section */}
      <section className="max-w-[1440px] w-full bg-foreground text-primary py-24 border-b-1 border-secondary">
        <div className="container mx-auto px-4 flex items-center justify-center flex-col">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            EFM Hukuk Bürosu
          </h1>
        </div>
      </section>

      {/* Hikayemiz Section */}
      <section className="py-20 rounded-lg bg-white shadow-md mt-5">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-color-primary mb-6">Hikayemiz</h2>
            <div className="prose prose-lg max-w-none text-justify text-gray-800 opacity-95">
              <p>
                EFM Hukuk, adaletin herkes için erişilebilir olması gerektiği inancıyla Av. Enver Furkan Mete tarafından kurulmuştur. Rize’de başlayan bu yolculuk, kısa sürede dürüstlük, şeffaflık ve müvekkil odaklı yaklaşımıyla güven kazanan bir hukuk bürosuna dönüşmüştür. Alanında uzman ekibiyle, hukukun karmaşık süreçlerinde müvekkillerine yol gösteren ve haklarını en etkin şekilde savunan bir çözüm ortağı olmayı ilke edinmiştir.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Misyon & Vizyon Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div className="text-center p-8 rounded-lg bg-white shadow-lg">
              <h3 className="text-3xl font-bold text-color-primary mb-4">Misyonumuz</h3>
              <div className="prose prose-lg max-w-none text-justify text-gray-800 opacity-95">
                <p>
                  EFM Hukuk’un misyonu; müvekkillerinin hukuki ihtiyaçlarını titizlikle analiz ederek, onlara özel, yenilikçi ve sonuç odaklı çözümler sunmaktır. Hukuki gelişmeleri ve değişen dünya dinamiklerini yakından takip ederek, bireysel ve kurumsal müvekkillerine yalnızca dava süreçlerinde değil, aynı zamanda önleyici danışmanlık hizmetleriyle de destek olmayı amaçlar. Temel hedefi, adalete giden yolda güvenilir bir yol arkadaşı olmaktır.
                </p>
              </div>
            </div>
            <div className="text-center p-8 rounded-lg bg-white shadow-lg">
              <h3 className="text-3xl font-bold text-color-primary mb-4">Vizyonumuz</h3>
              <div className="prose prose-lg max-w-none text-justify text-gray-800 opacity-95">
                <p>
                  EFM Hukuk’un vizyonu; hukuki danışmanlık ve avukatlık hizmetlerinde kalite, güven ve etik değerlerle anılan, ulusal düzeyde öncü bir hukuk bürosu olmaktır. Teknolojiyi ve modern yaklaşımları kullanarak hukuki süreçleri daha verimli ve erişilebilir kılmayı hedefler. Sadece bugünün sorunlarını çözmekle kalmayıp, yarının hukuki dünyasını şekillendiren, sürekli gelişen bir kurum olmayı amaç edinir.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team/Bio Section */}
      <section className="py-20 bg-foreground">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12 items-center">
            <div className="md:col-span-1">
              <Image
                src={bioPic}
                alt="Enver Furkan METE"
                width={500}
                height={500}
                className="rounded-lg shadow-xl object-cover w-full h-auto"
              />
            </div>
            <div className="md:col-span-2">
              <h2 className="text-3xl font-bold text-color-primary mb-2">Kurucu Avukat - Enver Furkan METE</h2>
              <h3 className="text-xl text-color-secondary font-semibold mb-4">Hukuk Davaları & Ceza Hukuku</h3>
              <div className="prose prose-lg max-w-none text-color-text-main opacity-90">
                <p>
                  Av. Enver Furkan Mete, ortaöğretim ve lise eğitimini Rize’de tamamlamış, ardından Ankara Üniversitesi Hukuk Fakültesi’nden mezun olmuştur. Mesleki kariyerine Rize Barosu’nda başlamış olup, halen aynı baroya bağlı olarak avukatlık hizmeti sunmaktadır.
                </p>
                <p>
                  Mesleki gelişimine önem vererek birçok konferans ve eğitim programına katılmış, çeşitli alanlarda sertifikalar almaya hak kazanmıştır. Özellikle gayrimenkul, kira, iş, boşanma, ticaret davaları ve ceza hukuku alanlarında yoğunlaşarak, müvekkillerine etkin ve güvenilir hukuki destek sağlamaktadır.
                </p>
                <ul className="list-disc pl-5">
                    <li><strong>Eğitim:</strong> Ankara Üniversitesi Hukuk Fakültesi</li>
                    <li><strong>Baro Sicil:</strong> Rize Barosu</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-color-primary">Neden EFM Hukuk?</h2>
                <p className="text-lg mt-2 text-color-text-main opacity-70">Bizi farklı kılan özelliklerimiz.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 text-center justify-center">
                {whyUs.map((item) => (
                    <div key={item.title} className="border border-primary border-opacity-10 p-8 rounded-lg hover:shadow-lg hover:scale-105 hover:border-secondary transition-transform duration-300">
                        <h3 className="text-2xl font-bold text-color-primary mb-3">{item.title}</h3>
                        <p>{item.description}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-color-secondary">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold text-color-primary mb-4">Hukuki Sorunlarınız İçin Buradayız</h2>
          <p className="text-xl text-color-primary opacity-80 mb-8 max-w-2xl mx-auto">
            Profesyonel ekibimizle tanışmak ve hukuki ihtiyaçlarınız için en doğru çözümü bulmak üzere bizimle iletişime geçin.
          </p>
          <Link href="/pages/contact" className="bg-primary text-foreground px-10 py-4 font-semibold text-lg hover:bg-secondary transition-all inline-block">
            İletişime Geçin
          </Link>
        </div>
      </section>
    </div>
  );
}
