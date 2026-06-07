"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/LanguageContext";

// Dynamiczny import z wyłączeniem SSR jest wymagany dla biblioteki Leaflet
const DynamicMap = dynamic(() => import("@/components/sections/DynamicMap"), { 
  ssr: false,
  loading: () => <Skeleton className="w-full h-full rounded-3xl min-h-[500px]" />
});

export default function StopsPage() {
  const { t, language } = useTranslation();

  useEffect(() => {
    document.title = language === "pl" ? "Przystanki - KKBus" : "Bus Stops - KKBus";
  }, [language]);

  return (
    <main className="min-h-screen bg-background-alt pt-28 pb-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">{t("stops.title")}</h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            {t("stops.subtitle")}
          </p>
        </div>

        <div className="relative w-full max-w-6xl mx-auto h-[600px] md:h-[700px] bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden z-0">
          <DynamicMap />
        </div>
      </div>
    </main>
  );
}

