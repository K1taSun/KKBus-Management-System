"use client";

import { useState, useEffect } from "react";
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
import { useTranslation } from "@/lib/LanguageContext";

const localTranslations = {
  pl: {
    badge: "Dokumenty Oficjalne",
    title: "Regulamin Przewozów",
    subtitle: "Zasady korzystania z usług przewozowych oraz systemu rezerwacji KKBus sp. z o.o. na trasie Kraków ↔ Katowice.",
    downloadPdf: "Pobierz PDF (wersja 2026)",
    toc: "Spis Treści",
    sections: {
      general: "Postanowienia Ogólne",
      tickets: "Rezerwacje i Bilety",
      pricing: "Cennik i Ulgi",
      loyalty: "Program Lojalnościowy",
      passenger: "Obowiązki Pasażera",
      complaints: "Reklamacje i Zwroty"
    },
    generalTitle: "§ 1. Postanowienia Ogólne",
    generalText1: "1. Niniejszy Regulamin określa warunki przewozu osób, bagażu oraz zwierząt realizowanych przez firmę KKBus Sp. z o.o. z siedzibą w Krakowie (zwaną dalej „Przewoźnikiem”) na trasie Kraków ↔ Katowice.",
    generalText2: "2. Korzystanie z usług Przewoźnika, w szczególności dokonanie rezerwacji lub wejście na pokład pojazdu, oznacza pełną akceptację postanowień niniejszego Regulaminu.",
    generalText3: "3. Pasażer zobowiązany jest do przestrzegania zaleceń kierowcy oraz personelu naziemnego w celu zapewnienia bezpieczeństwa i punktualności przejazdów.",
    ticketsTitle: "§ 2. Rezerwacje i Zakup Biletów",
    limitsTitle: "Ważne limity czasowe:",
    limitsText: "Rezerwacja miejsc może być dokonana najpóźniej 2 godziny przed odjazdem. Bezkosztowe anulowanie rezerwacji jest możliwe najpóźniej 24 godziny przed kursem.",
    ticketsText1: "1. Rezerwacja biletów odbywa się za pośrednictwem systemu internetowego KKBus, aplikacji mobilnej lub bezpośrednio u kierowcy (w przypadku wolnych miejsc).",
    ticketsText2: "2. Pasażer dokonujący rezerwacji online otrzymuje bilet elektroniczny z przypisanym numerem miejsca w pojeździe. Rezerwacja gwarantuje dostępność wybranego miejsca.",
    ticketsText3: "3. Rezerwację można bezkosztowo anulować w panelu klienta do 24 godzin przed zaplanowaną godziną odjazdu. Po tym czasie zwrot środków lub anulowanie nie jest możliwe.",
    ticketsText4: "4. W przypadku niepojawienia się na kursie bez wcześniejszego anulowania (tzw. no-show), rezerwacja przepada, a środki nie podlegają zwrotowi. Wielokrotne niestawienie się na kurs może skutkować czasową blokadą konta.",
    pricingTitle: "§ 3. Cennik i Ulgi",
    pricingText1: "1. Podstawowy cennik biletów jednorazowych oraz okresowych jest publikowany na oficjalnej stronie internetowej Przewoźnika. Cena bazowa biletu normalnego wynosi 20 PLN.",
    pricingText2: "2. Przewoźnik honoruje zniżki ustawowe oraz oferuje własne ulgi handlowe:",
    pricingDiscount1: "Studencka (-51%): Dla studentów do 26. roku życia za okazaniem ważnej legitymacji studenckiej.",
    pricingDiscount2: "Szkolna (-37%): Dla dzieci i młodzieży szkolnej do 24. roku życia za okazaniem legitymacji.",
    pricingDiscount3: "Dziecięca (-100%): Dla dzieci do lat 4 podróżujących na kolanach opiekuna (wymagane pobranie bezpłatnego biletu zerowego).",
    pricingText3: "3. Brak dokumentu uprawniającego do zniżki w momencie wejścia do pojazdu skutkuje koniecznością dopłaty do pełnej ceny biletu normalnego u kierowcy.",
    loyaltyTitle: "§ 4. Program Lojalnościowy",
    loyaltyText1: "1. Zarejestrowani klienci mogą przystąpić do Programu Lojalnościowego KKBus. Przystąpienie do programu jest całkowicie bezpłatne i dobrowolne.",
    loyaltyText2: "2. Punkty naliczane są automatycznie po zakończeniu odbytej podróży wg przelicznika: 1 przejechany kilometr = 1 punkt lojalnościowy.",
    loyaltyText3: "3. Zgromadzone punkty mogą być wymieniane na nagrody, w tym darmowe przejazdy jednorazowe lub kupony zniżkowe na kolejne rezerwacje, zgodnie z progami opublikowanymi w panelu klienta.",
    loyaltyText4: "4. Punkty lojalnościowe są przypisane do konkretnego konta i nie podlegają wymianie na gotówkę ani przeniesieniu na innego pasażera.",
    passengerTitle: "§ 5. Prawa i Obowiązki Pasażera",
    passengerText1: "1. Pasażer ma prawo do bezpiecznego i komfortowego przejazdu zarezerwowanym pojazdem na wybranej trasie zgodnie z rozkładem jazdy.",
    passengerText2: "2. Pasażer jest zobowiązany do stawienia się na przystanku początkowym co najmniej 10 minut przed planowanym odjazdem pojazdu.",
    passengerText3: "3. Wewnątrz pojazdu obowiązuje całkowity zakaz palenia tytoniu, papierosów elektronicznych, spożywania alkoholu oraz substancji odurzających.",
    passengerText4: "4. Przewoźnik ma prawo odmówić wejścia na pokład pasażerom będącym pod widocznym wpływem alkoholu, zachowującym się agresywnie lub zagrażającym bezpieczeństwu przejazdu.",
    complaintsTitle: "§ 6. Reklamacje i Zwroty",
    complaintsText1: "1. Wszelkie reklamacje dotyczące usług przewozowych oraz funkcjonowania systemu rezerwacji można składać pisemnie na adres e-mail: kontakt@kkbus.pl w terminie 14 dni od wystąpienia zdarzenia.",
    complaintsText2: "2. Prawidłowo zgłoszona reklamacja powinna zawierać imię, nazwisko, adres e-mail pasażera, numer biletu/rezerwacji oraz szczegółowy opis sytuacji.",
    complaintsText3: "3. Przewoźnik rozpatruje reklamacje w terminie 14 dni roboczych od dnia ich wpłynięcia.",
    complaintsText4: "4. Odpowiedzialność Przewoźnika za opóźnienia lub odwołanie kursów z przyczyn niezależnych od niego (np. ekstremalne warunki pogodowe, blokady dróg) jest ograniczona do zwrotu kosztu biletu."
  },
  en: {
    badge: "Official Documents",
    title: "Terms of Service",
    subtitle: "Rules for using transport services and the booking system of KKBus sp. z o.o. on the Kraków ↔ Katowice route.",
    downloadPdf: "Download PDF (2026 version)",
    toc: "Table of Contents",
    sections: {
      general: "General Provisions",
      tickets: "Reservations & Tickets",
      pricing: "Pricing & Discounts",
      loyalty: "Loyalty Program",
      passenger: "Passenger Obligations",
      complaints: "Complaints & Refunds"
    },
    generalTitle: "§ 1. General Provisions",
    generalText1: "1. These Terms of Service define the conditions for the transport of passengers, luggage, and animals carried out by KKBus Sp. z o.o. with its registered office in Kraków (hereinafter referred to as the 'Carrier') on the Kraków ↔ Katowice route.",
    generalText2: "2. Use of the Carrier's services, in particular making a reservation or boarding the vehicle, implies full acceptance of the provisions of these Terms of Service.",
    generalText3: "3. The Passenger is obliged to follow the instructions of the driver and ground staff to ensure the safety and punctuality of the trips.",
    ticketsTitle: "§ 2. Reservations and Ticket Purchase",
    limitsTitle: "Important time limits:",
    limitsText: "Seat reservations can be made at least 2 hours before departure. Free cancellation of the reservation is possible at least 24 hours before the trip.",
    ticketsText1: "1. Ticket booking takes place via the KKBus online system, mobile app, or directly from the driver (subject to seat availability).",
    ticketsText2: "2. A passenger booking online receives an electronic ticket with an assigned seat number in the vehicle. The reservation guarantees availability of the selected seat.",
    ticketsText3: "3. The reservation can be cancelled free of charge in the customer panel up to 24 hours before the scheduled departure time. After this time, a refund or cancellation is not possible.",
    ticketsText4: "4. In case of failure to show up for the trip without prior cancellation (so-called no-show), the reservation is forfeited and the funds are non-refundable. Repeated no-shows may result in a temporary account suspension.",
    pricingTitle: "§ 3. Pricing and Discounts",
    pricingText1: "1. The basic price list for single and season tickets is published on the Carrier's official website. The base price of a standard ticket is 20 PLN.",
    pricingText2: "2. The Carrier honors statutory discounts and offers its own commercial discounts:",
    pricingDiscount1: "Student (-51%): For students up to 26 years of age upon presentation of a valid student ID.",
    pricingDiscount2: "School (-37%): For school children and youth up to 24 years of age upon presentation of a school ID.",
    pricingDiscount3: "Child (-100%): For children up to 4 years old traveling on the lap of a guardian (requires downloading a free zero-value ticket).",
    pricingText3: "3. Failure to produce a document authorizing a discount at the time of boarding will require paying the difference to the full standard ticket price to the driver.",
    loyaltyTitle: "§ 4. Loyalty Program",
    loyaltyText1: "1. Registered customers can join the KKBus Loyalty Program. Joining the program is completely free and voluntary.",
    loyaltyText2: "2. Points are accumulated automatically after the completed trip according to the formula: 1 kilometer traveled = 1 loyalty point.",
    loyaltyText3: "3. Accumulated points can be exchanged for rewards, including free single trips or discount coupons for future bookings, according to the thresholds published in the customer panel.",
    loyaltyText4: "4. Loyalty points are assigned to a specific account and are not exchangeable for cash or transferable to another passenger.",
    passengerTitle: "§ 5. Rights and Obligations of the Passenger",
    passengerText1: "1. The Passenger has the right to a safe and comfortable journey in the reserved vehicle on the selected route in accordance with the timetable.",
    passengerText2: "2. The Passenger is required to arrive at the starting stop at least 10 minutes before the scheduled vehicle departure.",
    passengerText3: "3. Inside the vehicle, there is a strict ban on smoking tobacco, electronic cigarettes, consuming alcohol, or taking intoxicants.",
    passengerText4: "4. The Carrier has the right to refuse boarding to passengers under the visible influence of alcohol, behaving aggressively, or threatening the safety of the trip.",
    complaintsTitle: "§ 6. Complaints and Refunds",
    complaintsText1: "1. Any complaints regarding transport services and the operation of the booking system can be submitted in writing to the email address: kontakt@kkbus.pl within 14 days of the incident.",
    complaintsText2: "2. A properly submitted complaint should contain the passenger's name, surname, email address, ticket/reservation number, and a detailed description of the situation.",
    complaintsText3: "3. The Carrier considers complaints within 14 business days from the date of receipt.",
    complaintsText4: "4. The Carrier's liability for delays or cancellation of trips due to reasons beyond its control (e.g., extreme weather conditions, road blocks) is limited to the refund of the ticket price."
  }
};

export default function RegulaminPage() {
  const { language } = useTranslation();
  const tLocal = localTranslations[language] || localTranslations["pl"];

  const [activeSection, setActiveSection] = useState("general");

  useEffect(() => {
    document.title = language === "pl" ? "Regulamin - KKBus" : "Terms of Service - KKBus";
  }, [language]);

  const sections = [
    { id: "general", label: tLocal.sections.general, icon: BookOpen },
    { id: "tickets", label: tLocal.sections.tickets, icon: Clock },
    { id: "pricing", label: tLocal.sections.pricing, icon: Scale },
    { id: "loyalty", label: tLocal.sections.loyalty, icon: Coins },
    { id: "passenger", label: tLocal.sections.passenger, icon: ShieldCheck },
    { id: "complaints", label: tLocal.sections.complaints, icon: AlertTriangle },
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
            <span>{tLocal.badge}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">{tLocal.title}</h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            {tLocal.subtitle}
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <a 
              href="/regulamin-przewozow-kkbus-2026.pdf" 
              download="regulamin-przewozow-kkbus-2026.pdf"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 hover:border-action text-sm font-medium text-text-main transition-colors shadow-sm cursor-pointer"
            >
              <Download size={16} /> {tLocal.downloadPdf}
            </a>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Quick-Nav Sidebar (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white rounded-3xl border border-gray-100 p-4 shadow-lg space-y-1">
              <p className="text-xs font-bold text-gray-400 px-3 mb-2 tracking-wider uppercase">{tLocal.toc}</p>
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
                <h2 className="text-2xl font-bold text-primary">{tLocal.generalTitle}</h2>
              </div>
              <div className="space-y-4 text-text-muted leading-relaxed">
                <p>
                  {tLocal.generalText1}
                </p>
                <p>
                  {tLocal.generalText2}
                </p>
                <p>
                  {tLocal.generalText3}
                </p>
              </div>
            </section>

            {/* Tickets Section */}
            <section id="tickets" className="bg-white rounded-3xl border border-gray-100 p-8 shadow-md">
              <div className="flex items-center gap-3 mb-6 border-b pb-4">
                <div className="w-10 h-10 bg-blue-50 text-action rounded-xl flex items-center justify-center">
                  <Clock size={20} />
                </div>
                <h2 className="text-2xl font-bold text-primary">{tLocal.ticketsTitle}</h2>
              </div>
              <div className="space-y-4 text-text-muted leading-relaxed">
                <div className="p-4 bg-orange-50/70 border border-orange-100 rounded-2xl flex gap-3 text-orange-800 text-sm mb-4">
                  <Clock className="text-orange-600 shrink-0 mt-0.5" size={18} />
                  <div>
                    <strong className="font-semibold block mb-0.5">{tLocal.limitsTitle}</strong>
                    {tLocal.limitsText}
                  </div>
                </div>
                <p>
                  {tLocal.ticketsText1}
                </p>
                <p>
                  {tLocal.ticketsText2}
                </p>
                <p>
                  {tLocal.ticketsText3}
                </p>
                <p>
                  {tLocal.ticketsText4}
                </p>
              </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="bg-white rounded-3xl border border-gray-100 p-8 shadow-md">
              <div className="flex items-center gap-3 mb-6 border-b pb-4">
                <div className="w-10 h-10 bg-blue-50 text-action rounded-xl flex items-center justify-center">
                  <Scale size={20} />
                </div>
                <h2 className="text-2xl font-bold text-primary">{tLocal.pricingTitle}</h2>
              </div>
              <div className="space-y-4 text-text-muted leading-relaxed">
                <p>
                  {tLocal.pricingText1}
                </p>
                <p>
                  {tLocal.pricingText2}
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>{tLocal.pricingDiscount1}</li>
                  <li>{tLocal.pricingDiscount2}</li>
                  <li>{tLocal.pricingDiscount3}</li>
                </ul>
                <p>
                  {tLocal.pricingText3}
                </p>
              </div>
            </section>

            {/* Loyalty Points */}
            <section id="loyalty" className="bg-white rounded-3xl border border-gray-100 p-8 shadow-md">
              <div className="flex items-center gap-3 mb-6 border-b pb-4">
                <div className="w-10 h-10 bg-blue-50 text-action rounded-xl flex items-center justify-center">
                  <Coins size={20} />
                </div>
                <h2 className="text-2xl font-bold text-primary">{tLocal.loyaltyTitle}</h2>
              </div>
              <div className="space-y-4 text-text-muted leading-relaxed">
                <p>
                  {tLocal.loyaltyText1}
                </p>
                <p>
                  {tLocal.loyaltyText2}
                </p>
                <p>
                  {tLocal.loyaltyText3}
                </p>
                <p>
                  {tLocal.loyaltyText4}
                </p>
              </div>
            </section>

            {/* Passenger Obligations */}
            <section id="passenger" className="bg-white rounded-3xl border border-gray-100 p-8 shadow-md">
              <div className="flex items-center gap-3 mb-6 border-b pb-4">
                <div className="w-10 h-10 bg-blue-50 text-action rounded-xl flex items-center justify-center">
                  <ShieldCheck size={20} />
                </div>
                <h2 className="text-2xl font-bold text-primary">{tLocal.passengerTitle}</h2>
              </div>
              <div className="space-y-4 text-text-muted leading-relaxed">
                <p>
                  {tLocal.passengerText1}
                </p>
                <p>
                  {tLocal.passengerText2}
                </p>
                <p>
                  {tLocal.passengerText3}
                </p>
                <p>
                  {tLocal.passengerText4}
                </p>
              </div>
            </section>

            {/* Complaints and Liability */}
            <section id="complaints" className="bg-white rounded-3xl border border-gray-100 p-8 shadow-md">
              <div className="flex items-center gap-3 mb-6 border-b pb-4">
                <div className="w-10 h-10 bg-blue-50 text-action rounded-xl flex items-center justify-center">
                  <AlertTriangle size={20} />
                </div>
                <h2 className="text-2xl font-bold text-primary">{tLocal.complaintsTitle}</h2>
              </div>
              <div className="space-y-4 text-text-muted leading-relaxed">
                <p>
                  {tLocal.complaintsText1}
                </p>
                <p>
                  {tLocal.complaintsText2}
                </p>
                <p>
                  {tLocal.complaintsText3}
                </p>
                <p>
                  {tLocal.complaintsText4}
                </p>
              </div>
            </section>

          </div>
        </div>

      </div>
    </main>
  );
}
