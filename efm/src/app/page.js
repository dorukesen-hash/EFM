import Link from "next/link";


export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[color:var(--background)] text-[color:var(--foreground)]">
      <section className="w-full max-w-3xl text-center py-16 px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-[color:var(--color-primary)] drop-shadow-lg">
          EFM Hukuk & Danışmanlık
        </h1>
        <p className="text-lg md:text-xl text-[color:var(--color-muted)] mb-6">
          Deneyimli ekibimizle bireysel ve kurumsal müvekkillerimize güvenilir, şeffaf ve çözüm odaklı avukatlık hizmetleri sunuyoruz.
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center mb-8">
          <a href="/services" className="px-6 py-3 rounded bg-[color:var(--color-primary)] text-white font-semibold hover:bg-[color:var(--color-secondary)] transition">Hizmetlerimiz</a>
          <a href="/contact" className="px-6 py-3 rounded border border-[color:var(--color-primary)] text-[color:var(--color-primary)] font-semibold hover:bg-[color:var(--color-primary)] hover:text-white transition">İletişim</a>
        </div>
        <div className="flex flex-wrap justify-center gap-6 mt-8">
          <div className="w-64 bg-white/80 rounded shadow p-6 text-left">
            <h2 className="text-xl font-bold mb-2 text-[color:var(--color-primary)]">Hukuki Danışmanlık</h2>
            <p className="text-sm text-[color:var(--color-muted)]">Sözleşme, dava, icra ve şirketler hukuku başta olmak üzere her alanda profesyonel danışmanlık.</p>
          </div>
          <div className="w-64 bg-white/80 rounded shadow p-6 text-left">
            <h2 className="text-xl font-bold mb-2 text-[color:var(--color-primary)]">Arabuluculuk</h2>
            <p className="text-sm text-[color:var(--color-muted)]">Ticari, iş, aile ve diğer uyuşmazlıklarda hızlı ve dostane çözüm yolları.</p>
          </div>
          <div className="w-64 bg-white/80 rounded shadow p-6 text-left">
            <h2 className="text-xl font-bold mb-2 text-[color:var(--color-primary)]">Güncel Bilgi</h2>
            <p className="text-sm text-[color:var(--color-muted)]">Makaleler ve blog yazılarımızla hukuki gelişmeleri takip edin.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
