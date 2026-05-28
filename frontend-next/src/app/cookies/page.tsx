"use client";

import { useState } from "react";
import { 
  FileCheck, 
  HelpCircle, 
  Settings, 
  ShieldCheck, 
  Cookie,
  Sparkles
} from "lucide-react";

interface CookieInfo {
  name: string;
  type: string;
  purpose: string;
  duration: string;
}

export default function CookiesPage() {
  const [cookieConsent, setCookieConsent] = useState(true);

  const cookiesList: CookieInfo[] = [
    {
      name: "kkbus_session",
      type: "Niezbędne",
      purpose: "Utrzymanie sesji zalogowanego użytkownika oraz obsługa koszyka zakupowego.",
      duration: "Do końca sesji (zamknięcie przeglądarki)"
    },
    {
      name: "jwt_token",
      type: "Niezbędne / Bezpieczeństwo",
      purpose: "Zaszyfrowany token uwierzytelniający sesję RODO i zabezpieczający panel klienta przed nieautoryzowanym dostępem.",
      duration: "7 dni"
    },
    {
      name: "loyalty_pref",
      type: "Funkcjonalne",
      purpose: "Zapamiętanie preferencji użytkownika dotyczących programu lojalnościowego.",
      duration: "1 rok"
    },
    {
      name: "_ga, _gid",
      type: "Analityczne",
      purpose: "Google Analytics – zbieranie anonimowych statystyk dotyczących ruchu na stronie w celu optymalizacji wydajności i interfejsu.",
      duration: "Do 2 lat"
    }
  ];

  return (
    <main className="min-h-screen pt-24 pb-16 bg-background-alt">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-action mb-4 text-sm font-semibold">
            <Cookie size={16} />
            <span>Zarządzanie Ciasteczkami</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">Polityka Cookies</h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            Dowiedz się, w jaki sposób i w jakich celach KKBus sp. z o.o. wykorzystuje pliki cookies (ciasteczka) na naszej platformie.
          </p>
        </div>

        {/* Dynamic State Info Box */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-md mb-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-lg font-bold text-primary flex items-center justify-center md:justify-start gap-2">
              <ShieldCheck className="text-action" size={22} />
              Status Twojej Zgody
            </h3>
            <p className="text-sm text-text-muted">
              {cookieConsent 
                ? "Wyraziłeś zgodę na korzystanie z niezbędnych, funkcjonalnych oraz analitycznych plików cookies." 
                : "Zezwalasz wyłącznie na korzystanie z niezbędnych plików cookies."}
            </p>
          </div>
          <button
            onClick={() => setCookieConsent(!cookieConsent)}
            className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-md ${
              cookieConsent 
                ? "bg-primary hover:bg-primary-light text-white" 
                : "bg-action hover:bg-action-hover text-white shadow-action/25"
            }`}
          >
            {cookieConsent ? "Ogranicz do niezbędnych" : "Zgadzam się na wszystkie"}
          </button>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          
          {/* Section 1 */}
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-4">
            <h2 className="text-2xl font-bold text-primary flex items-center gap-2.5">
              <HelpCircle className="text-action" size={24} />
              Co to są pliki cookies?
            </h2>
            <p className="text-text-muted leading-relaxed text-sm md:text-base">
              Pliki cookies (ciasteczka) to małe pliki tekstowe wysyłane przez nasz serwer i zapisywane na Twoim urządzeniu końcowym (komputerze, telefonie lub tablecie). Przechowują one podstawowe informacje ułatwiające korzystanie z naszej platformy, przyspieszające jej działanie oraz zapewniające bezpieczeństwo transakcji.
            </p>
          </div>

          {/* Section 2 */}
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-4">
            <h2 className="text-2xl font-bold text-primary flex items-center gap-2.5">
              <FileCheck className="text-action" size={24} />
              Jakich plików cookies używamy?
            </h2>
            <p className="text-text-muted leading-relaxed text-sm md:text-base mb-6">
              Stosujemy ciasteczka w podziale na 3 główne kategorie:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100/50 space-y-2">
                <h4 className="font-bold text-primary text-sm">Niezbędne</h4>
                <p className="text-xs text-text-muted leading-relaxed">Umożliwiają bezpieczne logowanie, koszyk zakupowy, poprawność rezerwacji miejsc. Bez nich system nie działa prawidłowo.</p>
              </div>
              <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100/50 space-y-2">
                <h4 className="font-bold text-primary text-sm">Funkcjonalne</h4>
                <p className="text-xs text-text-muted leading-relaxed">Zapamiętują wybrane przez Ciebie preferencje językowe, ulubione trasy lub dane wyszukiwania w celu ułatwienia kolejnych podróży.</p>
              </div>
              <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100/50 space-y-2">
                <h4 className="font-bold text-primary text-sm">Analityczne</h4>
                <p className="text-xs text-text-muted leading-relaxed">Pomagają nam mierzyć ruch na stronie, najpopularniejsze kursy oraz czas wczytywania stron. Wszystkie dane są całkowicie zanonimizowane.</p>
              </div>
            </div>
          </div>

          {/* Cookie Table Breakdown */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm space-y-4 overflow-hidden">
            <h2 className="text-2xl font-bold text-primary flex items-center gap-2.5">
              <Sparkles className="text-action" size={24} />
              Wykaz Stosowanych Plików Cookies
            </h2>
            <div className="overflow-x-auto rounded-2xl border border-gray-100">
              <table className="w-full border-collapse text-left text-xs md:text-sm">
                <thead>
                  <tr className="bg-gray-50 text-primary border-b border-gray-100">
                    <th className="p-4 font-bold">Nazwa ciasteczka</th>
                    <th className="p-4 font-bold">Typ</th>
                    <th className="p-4 font-bold">Zadanie i rola</th>
                    <th className="p-4 font-bold">Czas ważności</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-text-muted">
                  {cookiesList.map((cookie, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/40">
                      <td className="p-4 font-mono font-bold text-primary">{cookie.name}</td>
                      <td className="p-4"><span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-primary-light text-[10px] font-semibold">{cookie.type}</span></td>
                      <td className="p-4 leading-relaxed">{cookie.purpose}</td>
                      <td className="p-4 font-medium">{cookie.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3 */}
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-4">
            <h2 className="text-2xl font-bold text-primary flex items-center gap-2.5">
              <Settings className="text-action" size={24} />
              Jak zmienić ustawienia w przeglądarce?
            </h2>
            <p className="text-text-muted leading-relaxed text-sm md:text-base">
              Większość przeglądarek internetowych domyślnie akceptuje pliki cookies. W każdej chwili możesz samodzielnie zmienić te ustawienia za pomocą menu konfiguracyjnego swojej przeglądarki (np. Chrome, Safari, Firefox). Możesz zablokować zapisywanie ciasteczek na swoim urządzeniu lub ustawić powiadomienie przed ich ponownym zapisaniem.
            </p>
            <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl text-orange-800 text-xs leading-relaxed">
              <strong>Pamiętaj:</strong> Wyłączenie niezbędnych plików cookies w przeglądarce uniemożliwi poprawne logowanie, rezerwację biletów oraz korzystanie z programu lojalnościowego na platformie KKBus.
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}
