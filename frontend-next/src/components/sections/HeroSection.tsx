import Image from "next/image";
import { SearchWidget } from "./SearchWidget";

// Base64 encoded tiny blur image
const blurData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

export function HeroSection() {
  return (
    <section className="relative w-full">
      {/* Background Image Container */}
      <div className="relative h-[600px] md:h-[700px] w-full overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop"
          alt="Nowoczesny autokar na trasie"
          fill
          priority
          placeholder="blur"
          blurDataURL={blurData}
          className="object-cover"
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/50 to-primary/80 mix-blend-multiply" />
        
        {/* Hero Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight max-w-4xl drop-shadow-md">
            Podróżuj wygodnie, <span className="text-action">tanio</span> i na czas
          </h1>
          <h2 className="text-lg md:text-2xl text-gray-200 font-medium max-w-2xl drop-shadow-sm">
            Znajdź idealne połączenie na szybkiej i wygodnej trasie Kraków ↔ Katowice.
          </h2>
        </div>
      </div>

      {/* Floating Search Widget */}
      <div className="container mx-auto px-4 md:px-6">
        <SearchWidget />
      </div>
    </section>
  );
}
