import {Honest} from "../../assets/values/Honest";
import {Privacy} from "../../assets/values/Privacy";
import {Professional} from "../../assets/values/Professional";
import {Solution} from "../../assets/values/Solution";
import {Improvement} from "../../assets/values/Improvement";

export default function Values() {
    return (
        <section className="max-w-[1440px] w-full page-container flex flex-col items-center justify-center text-primary bg-white pt-20 md:pt-30 pb-16 md:pb-20 border-t-1 border-secondary">
            <h2 className="text-4xl font-bold mb-10">Değerlerimiz</h2>
            <div className="flex flex-wrap justify-center gap-6 w-full">
                <div className="p-6 flex w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] flex-col items-center text-center value-card rounded-lg">
                    <Honest className="fill-secondary"/>
                    <h3 className="text-xl font-semibold mb-2 text-primary mt-4">Dürüstlük ve Şeffaflık</h3>
                    <p className="text-primary">Tüm süreçlerde müvekkillerimize karşı açık, dürüst ve şeffaf bir iletişim kurarız. Güven ilişkisini temel alırız.</p>
                </div>
                <div className="p-6 flex w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] flex-col items-center text-center value-card rounded-lg">
                    <Privacy className="fill-secondary"/>
                    <h3 className="text-xl font-semibold mb-2 text-primary mt-4">Gizlilik</h3>
                    <p className="text-primary">Müvekkillerimizin tüm bilgi ve belgelerini gizlilikle korur, üçüncü kişilerle paylaşmayız.</p>
                </div>
                <div className="p-6 flex w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] flex-col items-center text-center value-card rounded-lg">
                    <Professional className="fill-secondary"/>
                    <h3 className="text-xl font-semibold mb-2 text-primary mt-4">Profesyonellik</h3>
                    <p className="text-primary">Her aşamada mesleki etik ve profesyonellikten ödün vermeden hizmet sunarız.</p>
                </div>
                <div className="p-6 flex w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] flex-col items-center text-center value-card rounded-lg">
                    <Solution className="fill-secondary"/>
                    <h3 className="text-xl font-semibold mb-2 text-primary mt-4">Çözüm Odaklılık</h3>
                    <p className="text-primary">Müvekkillerimizin ihtiyaçlarına en uygun ve hızlı çözümleri üretmeyi hedefleriz.</p>
                </div>
                <div className="p-6 flex w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] flex-col items-center text-center value-card rounded-lg">
                    <Improvement className="fill-secondary"/>
                    <h3 className="text-xl font-semibold mb-2 text-primary mt-4">Sürekli Gelişim</h3>
                    <p className="text-primary">Hukuki gelişmeleri yakından takip eder, kendimizi ve hizmetlerimizi sürekli geliştiririz.</p>
                </div>
            </div>
        </section>
    )
}