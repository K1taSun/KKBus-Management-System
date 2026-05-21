"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// Dynamiczny import wyłącza Server-Side Rendering (SSR) dla mapy, 
// ponieważ biblioteka Leaflet operuje bezpośrednio na obiekcie 'window'.
const DynamicMap = dynamic(() => import("./DynamicMap"), { 
  ssr: false,
  loading: () => <Skeleton className="w-full h-full rounded-3xl" />
});

export function RouteMap() {
  return (
    <section className="py-20 bg-background-alt overflow-hidden z-0 relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Nasza sieć połączeń</h2>
          <p className="text-lg text-text-muted">Nowoczesne autokary łączące Kraków i Katowice.</p>
        </div>

        <div className="relative w-full max-w-5xl mx-auto h-[500px] md:h-[600px] bg-white rounded-3xl shadow-lg border border-gray-100 p-2 md:p-4 z-0">
          <div className="relative w-full h-full rounded-2xl overflow-hidden z-0">
             <DynamicMap />
          </div>
        </div>
      </div>
    </section>
  );
}

