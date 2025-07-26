import {Lady} from "../../assets/Lady";


export default function Hero() {


    return (
        <section className="max-w-[1440px] w-full flex flex-col items-center justify-center text-primary backdrop-blur-sm pt-30 pb-20 bg-white/25">
            <Lady className="w-[240px] h-[240px] mb-8 fill-primary" fill="text-primary"/>
            <h1 className="text-6xl font-bold mb-6">Av. Enver Furkan METE</h1>
            <p className="text-lg mb-12 text-center">
                Hukukun her alanında müvekkillerimize güvenilir, şeffaf ve çözüm odaklı hizmet sunuyoruz. <br/> Bireysel ve kurumsal ihtiyaçlarınıza özel danışmanlık, dava takibi ve hukuki süreç yönetimiyle yanınızdayız. <br/> Adaletin gücüne inanıyor, haklarınızı en iyi şekilde korumak için çalışıyoruz.
            </p>
        </section>
    )
}
