"use client";

import { useState } from "react";
import { 
  ScrollText, 
  BookOpen, 
  Clock, 
  Coins, 
  ShieldCheck, 
  Scale, 
  AlertTriangle,
  ChevronRight,
  Download
} from "lucide-react";

export default function RegulaminPage() {
  const [activeSection, setActiveSection] = useState("general");

  const sections = [
    { id: "general", label: "Postanowienia Ogólne", icon: BookOpen },
    { id: "tickets", label: "Rezerwacje i Bilety", icon: Clock },
    { id: "pricing", label: "Cennik i Ulgi", icon: Scale },
    { id: "loyalty", label: "Program Lojalnościowy", icon: Coins },
    { id: "passenger", label: "Obowiązki Pasażera", icon: ShieldCheck },
    { id: "complaints", label: "Reklamacje i Zwroty", icon: AlertTriangle },
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
        
        {/* Hero Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-action mb-4 text-sm font-semibold">
            <ScrollText size={16} />
            <span>Dokumenty Oficjalne</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">Regulamin Przewozów</h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            Zasady korzystania z usług przewozowych oraz systemu rezerwacji KKBus sp. z o.o. na trasie Kraków ↔ Katowice.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <a 
              href="/regulamin-przewozow-kkbus-2026.pdf" 
              download="regulamin-przewozow-kkbus-2026.pdf"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 hover:border-action text-sm font-medium text-text-main transition-colors shadow-sm cursor-pointer"
            >
              <Download size={16} /> Pobierz PDF (wersja 2026)
            </a>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Quick-Nav Sidebar (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white rounded-3xl border border-gray-100 p-4 shadow-lg space-y-1">
              <p className="text-xs font-bold text-gray-400 px-3 mb-2 tracking-wider uppercase">Spis Treści</p>
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

          {/* Regulations Content */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* General Section */}
            <section id="general" className="bg-white rounded-3xl border border-gray-100 p-8 shadow-md">
              <div className="flex items-center gap-3 mb-6 border-b pb-4">
                <div className="w-10 h-10 bg-blue-50 text-action rounded-xl flex items-center justify-center">
                  <BookOpen size={20} />
                </div>
                <h2 className="text-2xl font-bold text-primary">§ 1. Postanowienia Ogólne</h2>
              </div>
              <div className="space-y-4 text-text-muted leading-relaxed">
                <p>
                  1. Niniejszy Regulamin określa warunki przewozu osób, bagażu oraz zwierząt realizowanych przez firmę <strong>KKBus Sp. z o.o.</strong> z siedzibą w Krakowie (zwaną dalej „Przewoźnikiem”) na trasie Kraków ↔ Katowice.
                </p>
                <p>
                  2. Korzystanie z usług Przewoźnika, w szczególności dokonanie rezerwacji lub wejście na pokład pojazdu, oznacza pełną akceptację postanowień niniejszego Regulaminu.
                </p>
                <p>
                  3. Pasażer zobowiązany jest do przestrzegania zaleceń kierowcy oraz personelu naziemnego w celu zapewnienia bezpieczeństwa i punktualności przejazdów.
                </p>
              </div>
            </section>

            {/* Tickets Section */}
            <section id="tickets" className="bg-white rounded-3xl border border-gray-100 p-8 shadow-md">
              <div className="flex items-center gap-3 mb-6 border-b pb-4">
                <div className="w-10 h-10 bg-blue-50 text-action rounded-xl flex items-center justify-center">
                  <Clock size={20} />
                </div>
                <h2 className="text-2xl font-bold text-primary">§ 2. Rezerwacje i Zakup Biletów</h2>
              </div>
              <div className="space-y-4 text-text-muted leading-relaxed">
                <div className="p-4 bg-orange-50/70 border border-orange-100 rounded-2xl flex gap-3 text-orange-800 text-sm mb-4">
                  <Clock className="text-orange-600 shrink-0 mt-0.5" size={18} />
                  <div>
                    <strong className="font-semibold block mb-0.5">Ważne limity czasowe:</strong>
                    Rezerwacja miejsc może być dokonana najpóźniej <strong>2 godziny przed odjazdem</strong>.
                    Bezkosztowe anulowanie rezerwacji jest możliwe najpóźniej <strong>24 godziny przed kursem</strong>.
                  </div>
                </div>
                <p>
                  1. Rezerwacja biletów odbywa się za pośrednictwem systemu internetowego KKBus, aplikacji mobilnej lub bezpośrednio u kierowcy (w przypadku wolnych miejsc).
                </p>
                <p>
                  2. Pasażer dokonujący rezerwacji online otrzymuje bilet elektroniczny z przypisanym numerem miejsca w pojeździe. Rezerwacja gwarantuje dostępność wybranego miejsca.
                </p>
                <p>
                  3. Rezerwację można bezkosztowo anulować w panelu klienta do **24 godzin** przed zaplanowaną godziną odjazdu. Po tym czasie zwrot środków lub anulowanie nie jest możliwe.
                </p>
                <p>
                  4. W przypadku niepojawienia się na kursie bez wcześniejszego anulowania (tzw. *no-show*), rezerwacja przepada, a środki nie podlegają zwrotowi. Wielokrotne niestawienie się na kurs może skutkować czasową blokadą konta.
                </p>
              </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="bg-white rounded-3xl border border-gray-100 p-8 shadow-md">
              <div className="flex items-center gap-3 mb-6 border-b pb-4">
                <div className="w-10 h-10 bg-blue-50 text-action rounded-xl flex items-center justify-center">
                  <Scale size={20} />
                </div>
                <h2 className="text-2xl font-bold text-primary">§ 3. Cennik i Ulgi</h2>
              </div>
              <div className="space-y-4 text-text-muted leading-relaxed">
                <p>
                  1. Podstawowy cennik biletów jednorazowych oraz okresowych jest publikowany na oficjalnej stronie internetowej Przewoźnika. Cena bazowa biletu normalnego wynosi <strong>20 PLN</strong>.
                </p>
                <p>
                  2. Przewoźnik honoruje zniżki ustawowe oraz oferuje własne ulgi handlowe:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li><strong>Studencka (-51%):</strong> Dla studentów do 26. roku życia za okazaniem ważnej legitymacji studenckiej.</li>
                  <li><strong>Szkolna (-37%):</strong> Dla dzieci i młodzieży szkolnej do 24. roku życia za okazaniem legitymacji.</li>
                  <li><strong>Dziecięca (-100%):</strong> Dla dzieci do lat 4 podróżujących na kolanach opiekuna (wymagane pobranie bezpłatnego biletu zerowego).</li>
                </ul>
                <p>
                  3. Brak dokumentu uprawniającego do zniżki w momencie wejścia do pojazdu skutkuje koniecznością dopłaty do pełnej ceny biletu normalnego u kierowcy.
                </p>
              </div>
            </section>

            {/* Loyalty Points */}
            <section id="loyalty" className="bg-white rounded-3xl border border-gray-100 p-8 shadow-md">
              <div className="flex items-center gap-3 mb-6 border-b pb-4">
                <div className="w-10 h-10 bg-blue-50 text-action rounded-xl flex items-center justify-center">
                  <Coins size={20} />
                </div>
                <h2 className="text-2xl font-bold text-primary">§ 4. Program Lojalnościowy</h2>
              </div>
              <div className="space-y-4 text-text-muted leading-relaxed">
                <p>
                  1. Zarejestrowani klienci mogą przystąpić do Programu Lojalnościowego KKBus. Przystąpienie do programu jest całkowicie bezpłatne i dobrowolne.
                </p>
                <p>
                  2. Punkty naliczane są automatycznie po zakończeniu odbytej podróży wg przelicznika: <strong>1 przejechany kilometr = 1 punkt lojalnościowy</strong>.
                </p>
                <p>
                  3. Zgromadzone punkty mogą być wymieniane na nagrody, w tym darmowe przejazdy jednorazowe lub kupony zniżkowe na kolejne rezerwacje, zgodnie z progami opublikowanymi w panelu klienta.
                </p>
                <p>
                  4. Punkty lojalnościowe są przypisane do konkretnego konta i nie podlegają wymianie na gotówkę ani przeniesieniu na innego pasażera.
                </p>
              </div>
            </section>

            {/* Passenger Obligations */}
            <section id="passenger" className="bg-white rounded-3xl border border-gray-100 p-8 shadow-md">
              <div className="flex items-center gap-3 mb-6 border-b pb-4">
                <div className="w-10 h-10 bg-blue-50 text-action rounded-xl flex items-center justify-center">
                  <ShieldCheck size={20} />
                </div>
                <h2 className="text-2xl font-bold text-primary">§ 5. Prawa i Obowiązki Pasażera</h2>
              </div>
              <div className="space-y-4 text-text-muted leading-relaxed">
                <p>
                  1. Pasażer ma prawo do bezpiecznego i komfortowego przejazdu zarezerwowanym pojazdem na wybranej trasie zgodnie z rozkładem jazdy.
                </p>
                <p>
                  2. Pasażer jest zobowiązany do stawienia się na przystanku początkowym co najmniej 10 minut przed planowanym odjazdem pojazdu.
                </p>
                <p>
                  3. Wewnątrz pojazdu obowiązuje całkowity zakaz palenia tytoniu, papierosów elektronicznych, spożywania alkoholu oraz substancji odurzających.
                </p>
                <p>
                  4. Przewoźnik ma prawo odmówić wejścia na pokład pasażerom będącym pod widocznym wpływem alkoholu, zachowującym się agresywnie lub zagrażającym bezpieczeństwu przejazdu.
                </p>
              </div>
            </section>

            {/* Complaints and Liability */}
            <section id="complaints" className="bg-white rounded-3xl border border-gray-100 p-8 shadow-md">
              <div className="flex items-center gap-3 mb-6 border-b pb-4">
                <div className="w-10 h-10 bg-blue-50 text-action rounded-xl flex items-center justify-center">
                  <AlertTriangle size={20} />
                </div>
                <h2 className="text-2xl font-bold text-primary">§ 6. Reklamacje i Zwroty</h2>
              </div>
              <div className="space-y-4 text-text-muted leading-relaxed">
                <p>
                  1. Wszelkie reklamacje dotyczące usług przewozowych oraz funkcjonowania systemu rezerwacji można składać pisemnie na adres e-mail: <strong>kontakt@kkbus.pl</strong> w terminie 14 dni od wystąpienia zdarzenia.
                </p>
                <p>
                  2. Prawidłowo zgłoszona reklamacja powinna zawierać imię, nazwisko, adres e-mail pasażera, numer biletu/rezerwacji oraz szczegółowy opis sytuacji.
                </p>
                <p>
                  3. Przewoźnik rozpatruje reklamacje w terminie 14 dni roboczych od dnia ich wpłynięcia.
                </p>
                <p>
                  4. Odpowiedzialność Przewoźnika za opóźnienia lub odwołanie kursów z przyczyn niezależnych od niego (np. ekstremalne warunki pogodowe, blokady dróg) jest ograniczona do zwrotu kosztu biletu.
                </p>
              </div>
            </section>

          </div>
        </div>

      </div>
    </main>
  );
}
