"use client";

import { CheckCircle2 } from "lucide-react";
import { useTranslation } from "@/lib/LanguageContext";

export default function CennikPage() {
  const { t, language } = useTranslation();

  return (
    <main className="min-h-screen pt-24 pb-16 bg-background-main">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6 text-center">{t("pricing.title")}</h1>
        <p className="text-lg text-text-muted text-center mb-12">
          {t("pricing.desc")}
        </p>

        {/* Cennik Bazowy */}
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10 mb-12 border border-gray-100">
          <h2 className="text-2xl font-bold text-primary mb-6 border-b pb-4">{t("pricing.ticketSingle")}</h2>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-text-main mb-2">
                {language === "pl" ? "Trasa Kraków ↔ Katowice" : "Route Kraków ↔ Katowice"}
              </h3>
              <p className="text-text-muted">{t("pricing.normalDesc")}</p>
            </div>
            <div className="text-center md:text-right">
              <span className="text-4xl font-bold text-action">20 PLN</span>
            </div>
          </div>
        </div>

        {/* Zniżki */}
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10 mb-12 border border-gray-100">
          <h2 className="text-2xl font-bold text-primary mb-6 border-b pb-4">{t("pricing.discountsTitle")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100">
              <h3 className="text-lg font-bold text-primary mb-2">{t("pricing.studentTitle")}</h3>
              <p className="text-3xl font-bold text-action mb-2">-51%</p>
              <p className="text-sm text-text-muted">{t("pricing.discountStudDesc")}</p>
            </div>
            <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100">
              <h3 className="text-lg font-bold text-primary mb-2">{t("pricing.pupilTitle")}</h3>
              <p className="text-3xl font-bold text-action mb-2">-37%</p>
              <p className="text-sm text-text-muted">{t("pricing.discountSchoolDesc")}</p>
            </div>
            <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100">
              <h3 className="text-lg font-bold text-primary mb-2">{t("pricing.childTitle")}</h3>
              <p className="text-3xl font-bold text-action mb-2">-100%</p>
              <p className="text-sm text-text-muted">{t("pricing.discountKidsDesc")}</p>
            </div>
          </div>
        </div>

        {/* Program Lojalnościowy */}
        <div className="bg-gradient-to-r from-primary to-blue-900 rounded-3xl shadow-xl p-6 md:p-10 text-white flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-4">{t("pricing.loyaltyTitle")}</h2>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="text-action" size={20} />
                <span>
                  {language === "pl" ? (
                    <>
                      <strong className="text-action">1 przejechany kilometr = 1 punkt</strong> na Twoim koncie.
                    </>
                  ) : (
                    <>
                      <strong className="text-action">1 kilometer traveled = 1 point</strong> in your account.
                    </>
                  )}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="text-action" size={20} />
                <span>{t("pricing.loyaltyExchange")}</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="text-action" size={20} />
                <span>{t("pricing.loyaltyAuto")}</span>
              </li>
            </ul>
          </div>
          <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/20 text-center w-full md:w-auto">
            <p className="text-sm font-medium mb-2 text-blue-200">{t("pricing.loyaltyStart")}</p>
            <p className="text-4xl font-bold text-white mb-2">
              {language === "pl" ? "+100 pkt" : "+100 pts"}
            </p>
            <p className="text-xs text-blue-200">{t("pricing.loyaltyTrip")}</p>
          </div>
        </div>
      </div>
    </main>
  );
}

