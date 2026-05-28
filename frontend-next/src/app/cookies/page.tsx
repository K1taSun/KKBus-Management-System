"use client";

import { useState } from "react";
import { 
  Cookie, 
  HelpCircle, 
  ShieldCheck
} from "lucide-react";

export default function CookiesPage() {
  const [cookieConsent, setCookieConsent] = useState(true);

  const cookiesList = [
    {
      name: "kkbus_session",
      role: "Niezbędne",
      purpose: "Utrzymanie koszyka i zalogowanej sesji zakupowej.",
      expiration: "Koniec sesji"
    },
    {
      name: "jwt_token",
      role: "Bezpieczeństwo",
      purpose: "Ochrona i uwierzytelnianie zalogowanego konta.",
      expiration: "7 dni"
    },
    {
      name: "_ga, _gid",
      role: "Analityka",
      purpose: "Anonimowe statystyki odwiedzin w celu optymalizacji strony.",
      expiration: "Do 2 lat"
    }
  ];

  return (
    <main className="min-h-screen pt-24 pb-16 bg-background-alt">
      <div className="container mx-auto px-4 md:px-6 max-w-3xl">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-action mb-4 text-sm font-semibold">
            <Cookie size={16} />
            <span>Zarządzanie Cookies</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">Polityka Cookies</h1>
          <p className="text-base text-text-muted">
            Krótko i konkretnie o plikach cookies (ciasteczkach) używanych w KKBus.
          </p>
        </div>

        {/* Dynamic State Info Box */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm mb-8 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-bold text-primary flex items-center justify-center sm:justify-start gap-2">
              <ShieldCheck className="text-action" size={22} />
              Status Twojej Zgody
            </h3>
            <p className="text-sm text-text-muted">
              {cookieConsent 
                ? "Aktywowałeś wszystkie pliki cookies (w tym analityczne)." 
                : "Zezwalasz tylko na pliki niezbędne."}
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
            {cookieConsent ? "Ogranicz do niezbędnych" : "Zgadzam się na wszystkie"}
          </button>
        </div>

        {/* Explanatory cards */}
        <div className="space-y-6">
          
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-3">
            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
              <HelpCircle className="text-action" size={20} />
              Czym są ciasteczka?
            </h3>
            <p className="text-sm text-text-muted leading-relaxed">
              Pliki cookies to małe pliki tekstowe zapisywane na Twoim urządzeniu. Dzięki nim strona działa poprawnie, pamięta zawartość Twojego koszyka, ułatwia logowanie i pomaga nam bezpiecznie przetwarzać rezerwacje.
            </p>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-primary">Pliki, których używamy</h3>
            <div className="overflow-x-auto rounded-xl border border-gray-50">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-primary border-b border-gray-100">
                    <th className="p-3 font-bold">Nazwa</th>
                    <th className="p-3 font-bold">Typ</th>
                    <th className="p-3 font-bold">Zadanie</th>
                    <th className="p-3 font-bold">Ważność</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-text-muted">
                  {cookiesList.map((cookie, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/40">
                      <td className="p-3 font-mono font-bold text-primary">{cookie.name}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                          cookie.role === "Niezbędne" || cookie.role === "Bezpieczeństwo"
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
          Ostatnia aktualizacja: 28 maja 2026 r. KKBus sp. z o.o.
        </div>

      </div>
    </main>
  );
}
