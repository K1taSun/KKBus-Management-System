"use client";

import { useState, useEffect } from "react";
import { 
  Cookie, 
  HelpCircle, 
  ShieldCheck
} from "lucide-react";
import { useTranslation } from "@/lib/LanguageContext";

const localTranslations = {
  pl: {
    title: "Polityka Cookies",
    subtitle: "Krótko i konkretnie o plikach cookies (ciasteczkach) używanych w KKBus.",
    badge: "Zarządzanie Cookies",
    statusTitle: "Status Twojej Zgody",
    statusAll: "Aktywowałeś wszystkie pliki cookies (w tym analityczne).",
    statusNecessary: "Zezwalasz tylko na pliki niezbędne.",
    btnNecessary: "Ogranicz do niezbędnych",
    btnAll: "Zgadzam się na wszystkie",
    whatAreCookiesTitle: "Czym są ciasteczka?",
    whatAreCookiesDesc: "Pliki cookies to małe pliki tekstowe zapisywane na Twoim urządzeniu. Dzięki nim strona działa poprawnie, pamięta zawartość Twojego koszyka, ułatwia logowanie i pomaga nam bezpiecznie przetwarzać rezerwacje.",
    tableTitle: "Pliki, których używamy",
    tableName: "Nazwa",
    tableType: "Typ",
    tablePurpose: "Zadanie",
    tableExpiration: "Ważność",
    roles: {
      necessary: "Niezbędne",
      security: "Bezpieczeństwo",
      analytics: "Analityka",
    },
    purposes: {
      session: "Utrzymanie koszyka i zalogowanej sesji zakupowej.",
      jwt: "Ochrona i uwierzytelnianie zalogowanego konta.",
      analytics: "Anonimowe statystyki odwiedzin w celu optymalizacji strony.",
    },
    expirations: {
      session: "Koniec sesji",
      days: "7 dni",
      years: "Do 2 lat",
    },
    footnote: "Ostatnia aktualizacja: 28 maja 2026 r. KKBus sp. z o.o."
  },
  en: {
    title: "Cookie Policy",
    subtitle: "Briefly and specifically about the cookies used at KKBus.",
    badge: "Cookie Management",
    statusTitle: "Your Consent Status",
    statusAll: "You have enabled all cookies (including analytical).",
    statusNecessary: "You only allow necessary cookies.",
    btnNecessary: "Limit to necessary",
    btnAll: "Agree to all",
    whatAreCookiesTitle: "What are cookies?",
    whatAreCookiesDesc: "Cookies are small text files saved on your device. Thanks to them, the website functions properly, remembers your shopping cart, facilitates login, and helps us process reservations securely.",
    tableTitle: "Cookies we use",
    tableName: "Name",
    tableType: "Type",
    tablePurpose: "Purpose",
    tableExpiration: "Expiration",
    roles: {
      necessary: "Necessary",
      security: "Security",
      analytics: "Analytics",
    },
    purposes: {
      session: "Maintaining the cart and logged-in shopping session.",
      jwt: "Protection and authentication of the logged-in account.",
      analytics: "Anonymous visit statistics for page optimization.",
    },
    expirations: {
      session: "End of session",
      days: "7 days",
      years: "Up to 2 years",
    },
    footnote: "Last update: May 28, 2026. KKBus sp. z o.o."
  }
};

export default function CookiesPage() {
  const { language } = useTranslation();
  const tLocal = localTranslations[language] || localTranslations["pl"];

  const [cookieConsent, setCookieConsent] = useState(true);

  useEffect(() => {
    document.title = language === "pl" ? "Polityka Cookies - KKBus" : "Cookie Policy - KKBus";
  }, [language]);

  const cookiesList = [
    {
      name: "kkbus_session",
      role: tLocal.roles.necessary,
      purpose: tLocal.purposes.session,
      expiration: tLocal.expirations.session
    },
    {
      name: "jwt_token",
      role: tLocal.roles.security,
      purpose: tLocal.purposes.jwt,
      expiration: tLocal.expirations.days
    },
    {
      name: "_ga, _gid",
      role: tLocal.roles.analytics,
      purpose: tLocal.purposes.analytics,
      expiration: tLocal.expirations.years
    }
  ];

  return (
    <main className="min-h-screen pt-24 pb-16 bg-background-alt">
      <div className="container mx-auto px-4 md:px-6 max-w-3xl">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-action mb-4 text-sm font-semibold">
            <Cookie size={16} />
            <span>{tLocal.badge}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">{tLocal.title}</h1>
          <p className="text-base text-text-muted">
            {tLocal.subtitle}
          </p>
        </div>

        {/* Dynamic State Info Box */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm mb-8 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-bold text-primary flex items-center justify-center sm:justify-start gap-2">
              <ShieldCheck className="text-action" size={22} />
              {tLocal.statusTitle}
            </h3>
            <p className="text-sm text-text-muted">
              {cookieConsent 
                ? tLocal.statusAll 
                : tLocal.statusNecessary}
            </p>
          </div>
          <button
            onClick={() => setCookieConsent(!cookieConsent)}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm shrink-0 ${
              cookieConsent 
                ? "bg-primary hover:bg-primary-light text-white" 
                : "bg-action hover:bg-action-hover text-white shadow-action/25"
            }`}
          >
            {cookieConsent ? tLocal.btnNecessary : tLocal.btnAll}
          </button>
        </div>

        {/* Explanatory cards */}
        <div className="space-y-6">
          
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-3">
            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
              <HelpCircle className="text-action" size={20} />
              {tLocal.whatAreCookiesTitle}
            </h3>
            <p className="text-sm text-text-muted leading-relaxed">
              {tLocal.whatAreCookiesDesc}
            </p>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-primary">{tLocal.tableTitle}</h3>
            <div className="overflow-x-auto rounded-xl border border-gray-50">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-primary border-b border-gray-100">
                    <th className="p-3 font-bold">{tLocal.tableName}</th>
                    <th className="p-3 font-bold">{tLocal.tableType}</th>
                    <th className="p-3 font-bold">{tLocal.tablePurpose}</th>
                    <th className="p-3 font-bold">{tLocal.tableExpiration}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-text-muted">
                  {cookiesList.map((cookie, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/40">
                      <td className="p-3 font-mono font-bold text-primary">{cookie.name}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                          cookie.role === tLocal.roles.necessary || cookie.role === tLocal.roles.security
                            ? "bg-green-50 text-green-700" 
                            : "bg-blue-50 text-blue-700"
                        }`}>
                          {cookie.role}
                        </span>
                      </td>
                      <td className="p-3 leading-relaxed">{cookie.purpose}</td>
                      <td className="p-3 font-medium">{cookie.expiration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Footnote */}
        <div className="mt-12 text-center text-xs text-text-muted">
          {tLocal.footnote}
        </div>

      </div>
    </main>
  );
}
