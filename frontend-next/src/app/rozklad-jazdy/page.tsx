"use client";

import { useEffect } from "react";
import { SearchWidget } from "@/components/sections/SearchWidget";
import { useTranslation } from "@/lib/LanguageContext";

export default function TimetablePage() {
  const { t, language } = useTranslation();

  useEffect(() => {
    document.title = language === "pl" ? "Rozkład Jazdy - KKBus" : "Timetable - KKBus";
  }, [language]);

  return (
    <main className="min-h-screen bg-background-alt pt-28 pb-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">{t("nav.timetable")}</h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            {t("timetable.subtitle")}
          </p>
        </div>

        {/* We place the SearchWidget directly here. The negative margin -mt-24 is compensated by pt-28 and container padding */}
        <div className="pt-8">
          <SearchWidget />
        </div>
      </div>
    </main>
  );
}

