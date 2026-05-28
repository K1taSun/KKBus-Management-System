"use client";

import { useState } from "react";
import { 
  Shield, 
  Eye, 
  Lock, 
  UserCheck, 
  Scale, 
  HelpCircle,
  ChevronRight,
  Download
} from "lucide-react";

export default function PolitykaPrywatnosciPage() {
  const [activeSection, setActiveSection] = useState("admin");

  const sections = [
    { id: "admin", label: "Administrator Danych", icon: Shield },
    { id: "scope", label: "Cel i Zakres Zbierania", icon: Eye },
    { id: "security", label: "Bezpieczeństwo i HTTPS", icon: Lock },
    { id: "rights", label: "Prawa Użytkownika", icon: UserCheck },
    { id: "sharing", label: "Odbiorcy Danych", icon: Scale },
  ];

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <main className="min-h-screen pt-24 pb-16 bg-background-alt">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-action mb-4 text-sm font-semibold">
            <Shield size={16} />
            <span>Ochrona Danych Osobowych</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">Polityka Prywatności</h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            Dowiedz się, w jaki sposób KKBus sp. z o.o. przetwarza i chroni Twoje dane osobowe w naszym zintegrowanym systemie.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 hover:border-action text-sm font-medium text-text-main transition-colors shadow-sm">
              <Download size={16} /> Pobierz wersję PDF (RODO 2026)
            </button>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Quick-Nav Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white rounded-3xl border border-gray-100 p-4 shadow-lg space-y-1">
              <p className="text-xs font-bold text-gray-400 px-3 mb-2 tracking-wider uppercase">Spis Sekcji</p>
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full flex items-center justify-between px-3 py-3 rounded-2xl text-left text-sm font-medium transition-all ${
                      isActive 
                        ? "bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]" 
                        : "text-text-muted hover:text-primary hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} className={isActive ? "text-action" : "text-gray-400"} />
                      <span>{section.label}</span>
                    </div>
                    {isActive && <ChevronRight size={16} className="text-action" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Policy Content */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Administrator Section */}
            <section id="admin" className="bg-white rounded-3xl border border-gray-100 p-8 shadow-md">
              <div className="flex items-center gap-3 mb-6 border-b pb-4">
                <div className="w-10 h-10 bg-blue-50 text-action rounded-xl flex items-center justify-center">
                  <Shield size={20} />
                </div>
                <h2 className="text-2xl font-bold text-primary">1. Administrator Danych Osobowych</h2>
              </div>
              <div className="space-y-4 text-text-muted leading-relaxed">
                <p>
                  1. Administratorem Twoich danych osobowych jest firma <strong>KKBus Sp. z o.o.</strong> z siedzibą w Krakowie, realizująca połączenia transportowe oraz zarządzająca systemem rezerwacji.
                </p>
                <p>
                  2. W sprawach związanych z ochroną danych osobowych oraz realizacją Twoich praw możesz skontaktować się z naszym Inspektorem Ochrony Danych (IOD) za pośrednictwem poczty elektronicznej pod adresem: <strong>rodo@kkbus.pl</strong>.
                </p>
                <p>
                  3. Dbamy o to, aby przetwarzanie Twoich danych osobowych odbywało się zgodnie z rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 (RODO).
                </p>
              </div>
            </section>

            {/* Scope Section */}
            <section id="scope" className="bg-white rounded-3xl border border-gray-100 p-8 shadow-md">
              <div className="flex items-center gap-3 mb-6 border-b pb-4">
                <div className="w-10 h-10 bg-blue-50 text-action rounded-xl flex items-center justify-center">
                  <Eye size={20} />
                </div>
                <h2 className="text-2xl font-bold text-primary">2. Cel i Zakres Zbierania Danych</h2>
              </div>
              <div className="space-y-4 text-text-muted leading-relaxed">
                <p>
                  Dane osobowe pasażerów są zbierane i przetwarzane wyłącznie w minimalnym zakresie niezbędnym do realizacji celów biznesowych:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Obsługa rezerwacji i biletów:</strong> Przetwarzamy imię, nazwisko, e-mail oraz telefon w celu wystawienia biletu i przypisania miejsca w wybranym kursie.</li>
                  <li><strong>Program Lojalnościowy:</strong> Zbieramy dane o przebytych trasach w celu naliczania punktów lojalnościowych na Twoim koncie.</li>
                  <li><strong>Wsparcie i Kontakt:</strong> Przetwarzamy dane podane w formularzu kontaktowym w celu udzielenia odpowiedzi na zapytanie.</li>
                </ul>
                <p>
                  Podanie danych jest dobrowolne, ale niezbędne do dokonania rezerwacji miejsca i zakupu biletu online.
                </p>
              </div>
            </section>

            {/* Security Section */}
            <section id="security" className="bg-white rounded-3xl border border-gray-100 p-8 shadow-md">
              <div className="flex items-center gap-3 mb-6 border-b pb-4">
                <div className="w-10 h-10 bg-blue-50 text-action rounded-xl flex items-center justify-center">
                  <Lock size={20} />
                </div>
                <h2 className="text-2xl font-bold text-primary">3. Bezpieczeństwo i Szyfrowanie</h2>
              </div>
              <div className="space-y-4 text-text-muted leading-relaxed">
                <p>
                  1. Bezpieczeństwo danych osobowych jest dla nas priorytetem. Cała transmisja danych między Twoją przeglądarką a naszym serwerem jest zabezpieczona certyfikatem <strong>HTTPS (SSL)</strong>.
                </p>
                <p>
                  2. Twoje hasło dostępowe do konta KKBus jest jednostronnie szyfrowane za pomocą algorytmów kryptograficznych przed zapisaniem w bazie danych. Nikt, łącznie z administratorem systemu, nie ma dostępu do Twojego hasła w postaci jawnej.
                </p>
                <p>
                  3. System automatycznie blokuje dostęp do konta po **3 kolejnych błędnych próbach logowania** w celu zapobieżenia nieautoryzowanemu dostępowi metodą słownikową (brute force).
                </p>
              </div>
            </section>

            {/* Rights Section */}
            <section id="rights" className="bg-white rounded-3xl border border-gray-100 p-8 shadow-md">
              <div className="flex items-center gap-3 mb-6 border-b pb-4">
                <div className="w-10 h-10 bg-blue-50 text-action rounded-xl flex items-center justify-center">
                  <UserCheck size={20} />
                </div>
                <h2 className="text-2xl font-bold text-primary">4. Twoje Prawa</h2>
              </div>
              <div className="space-y-4 text-text-muted leading-relaxed">
                <p>
                  W związku z przetwarzaniem danych osobowych przysługuje Ci pełen pakiet praw gwarantowanych przez RODO:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Prawo do dostępu do swoich danych oraz otrzymania ich kopii.</li>
                  <li>Prawo do sprostowania (poprawiania) swoich danych w panelu profilu.</li>
                  <li>Prawo do usunięcia danych („prawo do bycia zapomnianym”) – usunięcie konta pasażera.</li>
                  <li>Prawo do wniesienia sprzeciwu wobec przetwarzania oraz wycofania zgód w dowolnym momencie.</li>
                </ul>
                <p>
                  W celu realizacji swoich praw napisz do nas bezpośrednio na adres <strong>rodo@kkbus.pl</strong>.
                </p>
              </div>
            </section>

            {/* Sharing Section */}
            <section id="sharing" className="bg-white rounded-3xl border border-gray-100 p-8 shadow-md">
              <div className="flex items-center gap-3 mb-6 border-b pb-4">
                <div className="w-10 h-10 bg-blue-50 text-action rounded-xl flex items-center justify-center">
                  <Scale size={20} />
                </div>
                <h2 className="text-2xl font-bold text-primary">5. Odbiorcy Danych</h2>
              </div>
              <div className="space-y-4 text-text-muted leading-relaxed">
                <p>
                  1. KKBus nie sprzedaje ani nie udostępnia Twoich danych osobowych podmiotom trzecim w celach marketingowych.
                </p>
                <p>
                  2. Twoje dane mogą być przekazywane wyłącznie zaufanym partnerom technologicznym współpracującym przy obsłudze przejazdu:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Operatorzy płatności:</strong> (np. PayU, Przelewy24, Blik) w celu przetworzenia płatności za rezerwację.</li>
                  <li><strong>Dostawca hostingu i baz danych:</strong> w celach przechowywania danych w bezpiecznym centrum danych.</li>
                </ul>
              </div>
            </section>

          </div>
        </div>

      </div>
    </main>
  );
}
