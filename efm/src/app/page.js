import Image from "next/image";
import parallax from "../assets/hero-1.png";
import Hero from "../components/main/Hero";
import Bio from "../components/main/Bio";
import Reviews from "../components/main/Reviews";
import Services from "../components/main/Services";
import Areas from "../components/main/Areas";
import Values from "../components/main/Values";
import Blog from "../components/main/Blog";

export default function HomePage() {

  return (
    <main className="relative min-h-screen flex flex-col items-center text-foreground overflow-hidden">
      <Image
        src={parallax}
        alt="bg"
        priority
        className="w-full h-full fixed top-0 left-0 -z-50"
      />
       <Hero />
       <Bio />
       <Reviews />
       <Services />
       <Values/>
       <Areas/>
       <Blog/>
    </main>
  );
}
