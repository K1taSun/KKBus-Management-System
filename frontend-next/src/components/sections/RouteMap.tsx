"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/LanguageContext";

// Dynamiczny import wyłącza Server-Side Rendering (SSR) dla mapy, 
// ponieważ biblioteka Leaflet operuje bezpośrednio na obiekcie 'window'.
const DynamicMap = dynamic(() => import("./DynamicMap"), { 
  ssr: false,
  loading: () => <Skeleton className="w-full h-full rounded-3xl" />
});

export function RouteMap() {
  const { t } = useTranslation();

  return (
    <section id="route-map" className="py-20 bg-background-alt overflow-hidden z-0 relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">{t("map.title")}</h2>
          <p className="text-lg text-text-muted max-w-2xl">
            {t("map.subtitle")}
          </p>
        </div>

        <div className="relative w-full max-w-6xl mx-auto h-[550px] md:h-[650px] lg:h-[700px] bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden z-0">
          <DynamicMap />
        </div>
      </div>
    </section>
  );
}
