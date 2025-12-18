import {Lady} from "../../assets/Lady";


export default function Hero() {


    return (
        <section className="max-w-[1440px] w-full page-container flex flex-col items-center justify-center text-primary backdrop-blur-sm pt-20 md:pt-30 pb-16 md:pb-20 bg-white/25">
            <Lady className="w-40 h-40 md:w-[240px] md:h-[240px] mb-6 md:mb-8 fill-primary" fill="text-primary"/>
            <h1 className="font-bold mb-4 md:mb-6 text-center">Av. Enver Furkan METE</h1>
            <p className="text-base md:text-lg mb-10 md:mb-12 text-center max-w-4xl px-2">
                Hukukun her alanında müvekkillerimize güvenilir, şeffaf ve çözüm odaklı hizmet sunuyoruz. <br/> Bireysel ve kurumsal ihtiyaçlarınıza özel danışmanlık, dava takibi ve hukuki süreç yönetimiyle yanınızdayız. <br/> Adaletin gücüne inanıyor, haklarınızı en iyi şekilde korumak için çalışıyoruz.
            </p>
        </section>
    )
}
