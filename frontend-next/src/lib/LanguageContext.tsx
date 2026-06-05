"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "pl" | "en";

export const translations = {
  pl: {
    // Navbar & Common
    "nav.timetable": "Rozkład jazdy",
    "nav.stops": "Przystanki",
    "nav.pricing": "Cennik",
    "nav.info": "Informacje",
    "nav.login": "Zaloguj się",
    "nav.profile": "Profil",
    "nav.logout": "Wyloguj",
    "nav.cart": "Koszyk",
    "nav.myCart": "Mój koszyk",
    "nav.changeLang": "Change to English",

    // Hero Section
    "hero.title": "Podróżuj wygodnie, ",
    "hero.titleHighlight": "tanio",
    "hero.titleEnd": " i na czas",
    "hero.subtitle": "Znajdź idealne połączenie na szybkiej i wygodnej trasie Kraków ↔ Katowice.",
    "timetable.subtitle": "Wyszukaj i zarezerwuj dogodne połączenia na trasie Kraków ↔ Katowice. Wybierz przystanki i datę podróży.",
    "stops.title": "Nasze przystanki",
    "stops.subtitle": "Sprawdź sieć połączeń KKBus. Wybierz trasę z bocznego panelu, aby zobaczyć szczegóły przystanków i dokładny przebieg drogi na mapie.",

    // Search Widget
    "search.from": "Skąd",
    "search.to": "Dokąd",
    "search.date": "Data",
    "search.passengers": "Pasażerowie",
    "search.passengers.1": "1 osoba",
    "search.passengers.2": "2 osoby",
    "search.passengers.3": "3 osoby",
    "search.passengers.4": "4+ osób",
    "search.placeholder": "Miasto lub przystanek",
    "search.button": "Szukaj",
    "search.swap": "Zamień",
    "search.errors.from": "Wpisz miasto wyjazdu",
    "search.errors.to": "Wpisz miasto docelowe",
    "search.errors.date": "Wybierz datę",
    "search.errors.different": "Skąd i Dokąd muszą być różne",
    "search.errors.invalid": "Wybierz przystanek w Krakowie lub Katowicach",

    // Timetable Results
    "results.title": "Dostępne Połączenia",
    "results.empty": "Brak wolnych kursów w wybranym dniu i kierunku.",
    "results.model": "Model autokaru",
    "results.freeSeats": "Wolne miejsca",
    "results.distance": "Dystans",
    "results.departure": "Odjazd z MDA",
    "results.price": "Cena biletu",
    "results.buy": "Kup bilet",

    // Seating Map
    "seats.title": "Wybór miejsc",
    "seats.close": "Zamnij",
    "seats.front": "Przód pojazdu",
    "seats.back": "Tył pojazdu",
    "seats.steering": "Kierownica",
    "seats.selected": "Wybrane",
    "seats.taken": "Zajęte",
    "seats.free": "Wolne",
    "seats.qty": "Liczba biletów",
    "seats.numbers": "Wybrane numery",
    "seats.none": "Brak",
    "seats.total": "Do zapłaty",
    "seats.confirm": "Kupuję i Rezerwuję",
    "seats.success": "Rezerwacja zatwierdzona! Zarezerwowano miejsca",
    "seats.disclaimer": "Klikając przycisk automatycznie zalogujesz się jako klient testowy (Jan Kowalski) i opłacisz bilet.",

    // Value Proposition Section
    "val.title": "Dlaczego KKBus?",
    "val.comfort": "Komfort podróży",
    "val.comfortDesc": "Nowoczesne autokary z klimatyzacją, darmowym Wi-Fi i wygodnymi fotelami.",
    "val.punctual": "Punktualność",
    "val.punctualDesc": "Dbamy o czas naszych pasażerów. 98% naszych kursów dojeżdża na czas.",
    "val.points": "Program Lojalnościowy",
    "val.pointsDesc": "Zbieraj punkty za każdy przejechany kilometr i wymieniaj je na darmowe bilety.",

    // Route Map Section
    "map.title": "Nasza sieć połączeń",
    "map.subtitle": "4 trasy łączące Kraków z Katowicami. Kliknij wybraną trasę, aby zobaczyć szczegóły przystanków i przebieg drogi na mapie.",
    "map.choose": "Wybierz trasę",
    "map.stopsCount": "Przystanki",
    "map.helper": "Kliknij trasę, aby zobaczyć listę przystanków",
    "map.legend": "Legenda",

    // Pricing Page
    "pricing.title": "Cennik Biletów",
    "pricing.subtitle": "Przejazdy na trasie Kraków ↔ Katowice. Sprawdź dostępne zniżki i bilety okresowe.",
    "pricing.desc": "Przejrzyste ceny na trasie Kraków ↔ Katowice. Żadnych ukrytych opłat.",
    "pricing.ticketSingle": "Jednorazowe",
    "pricing.ticketPeriod": "Miesięczne",
    "pricing.basePrice": "Cena bazowa",
    "pricing.discountStud": "Studencki (-51%)",
    "pricing.discountStudDesc": "Dla studentów do 26 roku życia za okazaniem legitymacji.",
    "pricing.discountSchool": "Szkolny (-37%)",
    "pricing.discountSchoolDesc": "Dla dzieci i młodzieży szkolnej za okazaniem legitymacji.",
    "pricing.discountKids": "Dziecięcy (-100%)",
    "pricing.discountKidsDesc": "Dla dzieci do lat 4 podróżujących na kolanach opiekuna.",
    "pricing.normalDesc": "Bilet normalny w jedną stronę, obowiązuje na wszystkie kursy w danym dniu.",
    "pricing.discountsTitle": "Zniżki Ustawowe i Regulaminowe",
    "pricing.studentTitle": "Student",
    "pricing.pupilTitle": "Uczeń",
    "pricing.childTitle": "Dziecko",
    "pricing.loyaltyTitle": "Program Lojalnościowy KKBus",
    "pricing.loyaltyPoints": "1 przejechany kilometr = 1 punkt na Twoim koncie.",
    "pricing.loyaltyExchange": "Wymieniaj punkty na darmowe bilety i zniżki procentowe.",
    "pricing.loyaltyAuto": "Punkty naliczają się automatycznie po zakończonym przejeździe.",
    "pricing.loyaltyStart": "Załóż konto i odbierz na start",
    "pricing.loyaltyTrip": "na pierwszą podróż",

    // Info Page
    "info.title": "O firmie KKBus",
    "info.desc": "KKBus to nowoczesna platforma transportowa zaprojektowana dla firmy KKBus sp. z o.o., dedykowana szybkiej i komfortowej obsłudze pasażerów. Łączymy dwa kluczowe miasta południowej Polski: Kraków i Katowice, stawiając na innowacje, bezpieczeństwo oraz niezawodność.",
    "info.fleetTitle": "Nasza Flota i Trasa",
    "info.fleetDesc": "Specjalizujemy się w przewozie osób na trasie Kraków ↔ Katowice. Dzięki flocie nowoczesnych autokarów i busów, zapewniamy wysoki standard podróży. W przyszłości planujemy rozwinięcie naszej oferty o kolejne kierunki, jednak obecnie naszym priorytetem jest doskonała obsługa tej kluczowej linii.",
    "info.systemTitle": "Innowacyjny System",
    "info.systemDesc": "Korzystamy z autorskiego, zintegrowanego systemu zarządzania, który automatyzuje rezerwacje i wyklucza zjawisko tzw. overbookingu (sprzedaży większej liczby biletów niż miejsc). Oprogramowanie to zostało zaprojektowane by zagwarantować najwyższą jakość obsługi klienta.",
    "info.contactTitle": "Kontakt z Nami",
    "info.officeTitle": "Siedziba i biuro projektu",
    "info.phoneTitle": "Telefon",
    "info.hoursTitle": "Godziny pracy infolinii",
    "info.weekdays": "Poniedziałek - Piątek",
    "info.saturday": "Sobota",
    "info.sundays": "Niedziela i Święta",
    "info.closed": "Nieczynne",

    // Footer
    "footer.rights": "Wszelkie prawa zastrzeżone.",
    "footer.links": "Przydatne linki",
    "footer.press": "Biuro prasowe",
    "footer.terms": "Regulamin",
    "footer.privacy": "Polityka prywatności",
    "footer.contact": "Kontakt",
    "footer.desc": "Nowoczesne linie autokarowe na trasie Kraków ↔ Katowice. Podróżuj bezpiecznie, wygodnie i zawsze na czas.",
    "footer.aboutUs": "O nas",
    "footer.payments": "Metody płatności",
    "footer.trust": "Zaufanie",
    "footer.certificate": "Certyfikat Bezpiecznego Przewoźnika 2026.",
    "footer.project": "Projekt realizowany w ramach: Katedra Informatyki Stosowanej M-7, Wydział Mechaniczny, Politechnika Krakowska im. T. Kościuszki",
    "footer.cookies": "Cookies",
    "footer.faq": "FAQ",
    "footer.stopsAndMaps": "Przystanki i mapy",
    "footer.timetable": "Rozkład jazdy",
    "footer.pricing": "Cennik biletów",
    "footer.company": "Firma",

    // Live Feed
    "live.status": "Live Status",
    "live.title": "Tysiące zadowolonych pasażerów każdego dnia",
    "live.desc": "Nasze autokary bezustannie przemierzają Polskę, dowożąc pasażerów bezpiecznie i na czas. Obserwuj na żywo aktualizowany strumień właśnie zakończonych kursów.",
    "live.cardTitle": "Ostatnio zrealizowane kursy",
    "live.success": "Zrealizowane pomyślnie",
    "map.stopIndex": "Przystanek",
    "map.of": "z",

    // Value Proposition (extended)
    "val.subtitle": "Stawiamy na najwyższy komfort i bezpieczeństwo. Zobacz, co przygotowaliśmy dla Ciebie na pokładzie.",
    "val.wifi": "Darmowe Wi-Fi",
    "val.wifiDesc": "Szybki internet na pokładzie pozwala pracować lub oglądać filmy przez całą podróż.",
    "val.seats": "Wygodne fotele",
    "val.seatsDesc": "Dużo miejsca na nogi i regulowane oparcia gwarantują relaks nawet na długich trasach.",
    "val.power": "Gniazdka i USB",
    "val.powerDesc": "Ładuj swoje urządzenia w trakcie jazdy dzięki gniazdkom 230V i portom USB przy każdym fotelu.",
    "val.eco": "Ekologiczna podróż",
    "val.ecoDesc": "Nasze nowoczesne autokary spełniają najwyższe normy emisji spalin, dbając o środowisko.",

    // Dashboard / Profil klienta
    "dash.welcome": "Witaj",
    "dash.tabOverview": "Przegląd",
    "dash.tabReservations": "Rezerwacje",
    "dash.tabLoyalty": "Program Lojalnościowy",
    "dash.tabSettings": "Ustawienia",
    "dash.loyaltyCard": "Punkty Lojalnościowe",
    "dash.loyaltyPoints": "pkt",
    "dash.loyaltyMissing": "Brakuje Ci",
    "dash.loyaltyMissingEnd": "pkt do darmowego biletu!",
    "dash.activeRes": "Aktywne Rezerwacje",
    "dash.noActiveRes": "Brak aktywnych rezerwacji",
    "dash.yourAccount": "Twoje Konto",
    "dash.clientNumber": "Nr klienta",
    "dash.memberSince": "Klient od",
    "dash.editProfile": "Edytuj dane",
    "dash.resHistory": "Historia Przejazdów",
    "dash.resRoute": "Trasa",
    "dash.resDeparture": "Odjazd",
    "dash.resSeat": "Miejsce",
    "dash.resStatus": "Status",
    "dash.resPrice": "Cena",
    "dash.resActions": "Akcje",
    "dash.resCancel": "Anuluj",
    "dash.resCancelConfirm": "Czy na pewno chcesz anulować tę rezerwację?",
    "dash.resCancelled": "Rezerwacja anulowana pomyślnie.",
    "dash.resEmpty": "Nie masz jeszcze żadnych rezerwacji.",
    "dash.resConfirmed": "Potwierdzona",
    "dash.resPaid": "Opłacona",
    "dash.resCancelledStatus": "Anulowana",
    "dash.loyaltyBalance": "Saldo punktów",
    "dash.loyaltyRewards": "Katalog Nagród",
    "dash.loyaltyRedeem": "Wymień",
    "dash.loyaltyRequired": "Wymagane",
    "dash.loyaltyHistory": "Historia Transakcji",
    "dash.loyaltyNoHistory": "Brak transakcji.",
    "dash.loyaltyDate": "Data",
    "dash.loyaltyDesc": "Opis",
    "dash.loyaltyDelta": "Punkty",
    "dash.loyaltyNotEnrolled": "Nie jesteś zapisany do programu lojalnościowego.",
    "dash.settingsTitle": "Ustawienia Profilu",
    "dash.settingsFirstName": "Imię",
    "dash.settingsLastName": "Nazwisko",
    "dash.settingsPhone": "Telefon",
    "dash.settingsEmail": "E-mail",
    "dash.settingsSave": "Zapisz zmiany",
    "dash.settingsSaved": "Profil zaktualizowany pomyślnie.",
    "dash.settingsAccountInfo": "Informacje o koncie",
    "dash.settingsDob": "Data urodzenia",
    "dash.settingsStatus": "Status konta",
    "dash.settingsLogout": "Wyloguj się",
    "dash.loading": "Ładowanie...",
    "dash.error": "Wystąpił błąd. Spróbuj ponownie.",
    "dash.loginRequired": "Zaloguj się, aby zobaczyć profil.",
    "dash.loginBtn": "Przejdź do logowania",
  },
  en: {
    // Navbar & Common
    "nav.timetable": "Timetable",
    "nav.stops": "Bus Stops",
    "nav.pricing": "Pricing",
    "nav.info": "Information",
    "nav.login": "Log In",
    "nav.profile": "Profile",
    "nav.logout": "Log Out",
    "nav.cart": "Cart",
    "nav.myCart": "My Cart",
    "nav.changeLang": "Zmień na Polski",

    // Hero Section
    "hero.title": "Travel comfortably, ",
    "hero.titleHighlight": "cheaply",
    "hero.titleEnd": " and on time",
    "hero.subtitle": "Find the perfect connection on the fast and comfortable Kraków ↔ Katowice route.",
    "timetable.subtitle": "Search and book convenient connections on the Kraków ↔ Katowice route. Select stops and trip date.",
    "stops.title": "Our Bus Stops",
    "stops.subtitle": "Check the KKBus network connection. Select a route from the sidebar to see stop details and the exact route on the map.",

    // Search Widget
    "search.from": "From",
    "search.to": "To",
    "search.date": "Date",
    "search.passengers": "Passengers",
    "search.passengers.1": "1 person",
    "search.passengers.2": "2 people",
    "search.passengers.3": "3 people",
    "search.passengers.4": "4+ people",
    "search.placeholder": "City or stop",
    "search.button": "Search",
    "search.swap": "Swap",
    "search.errors.from": "Enter departure city",
    "search.errors.to": "Enter destination city",
    "search.errors.date": "Select date",
    "search.errors.different": "Origin and destination must be different",
    "search.errors.invalid": "Choose a stop in Kraków or Katowice",

    // Timetable Results
    "results.title": "Available Connections",
    "results.empty": "No available trips found for the selected date and direction.",
    "results.model": "Coach model",
    "results.freeSeats": "Free seats",
    "results.distance": "Distance",
    "results.departure": "Departure from MDA",
    "results.price": "Ticket price",
    "results.buy": "Buy ticket",

    // Seating Map
    "seats.title": "Seat selection",
    "seats.close": "Close",
    "seats.front": "Front of vehicle",
    "seats.back": "Back of vehicle",
    "seats.steering": "Wheel",
    "seats.selected": "Selected",
    "seats.taken": "Taken",
    "seats.free": "Free",
    "seats.qty": "Ticket count",
    "seats.numbers": "Selected seats",
    "seats.none": "None",
    "seats.total": "Total due",
    "seats.confirm": "Buy & Book",
    "seats.success": "Reservation confirmed! Booked seats",
    "seats.disclaimer": "Clicking the button will automatically log you in as a test user (Jan Kowalski) and purchase the ticket.",

    // Value Proposition Section
    "val.title": "Why choose KKBus?",
    "val.comfort": "Travel Comfort",
    "val.comfortDesc": "Modern coaches equipped with AC, free Wi-Fi and comfortable seating.",
    "val.punctual": "Punctuality",
    "val.punctualDesc": "We value our passengers' time. 98% of our rides arrive right on schedule.",
    "val.points": "Loyalty Program",
    "val.pointsDesc": "Earn points for each kilometer traveled and exchange them for free tickets.",

    // Route Map Section
    "map.title": "Our Connections Network",
    "map.subtitle": "4 routes connecting Kraków and Katowice. Click a route to see details and stops on the map.",
    "map.choose": "Select route",
    "map.stopsCount": "Stops",
    "map.helper": "Click a route to view its list of stops",
    "map.legend": "Legend",

    // Pricing Page
    "pricing.title": "Tickets Pricing",
    "pricing.subtitle": "Trips on the route Kraków ↔ Katowice. Check available discounts and monthly passes.",
    "pricing.desc": "Transparent prices on the Kraków ↔ Katowice route. No hidden fees.",
    "pricing.ticketSingle": "Single tickets",
    "pricing.ticketPeriod": "Monthly tickets",
    "pricing.basePrice": "Base Price",
    "pricing.discountStud": "Student (-51%)",
    "pricing.discountStudDesc": "For students up to 26 years old with a valid student ID.",
    "pricing.discountSchool": "School (-37%)",
    "pricing.discountSchoolDesc": "For children and school youth with a valid school ID.",
    "pricing.discountKids": "Children (-100%)",
    "pricing.discountKidsDesc": "For children under 4 traveling on the lap of a guardian.",
    "pricing.normalDesc": "Standard one-way ticket, valid for all departures on the selected day.",
    "pricing.discountsTitle": "Statutory and Standard Discounts",
    "pricing.studentTitle": "Student",
    "pricing.pupilTitle": "Student (School)",
    "pricing.childTitle": "Child",
    "pricing.loyaltyTitle": "KKBus Loyalty Program",
    "pricing.loyaltyPoints": "1 kilometer traveled = 1 point in your account.",
    "pricing.loyaltyExchange": "Exchange points for free tickets and percentage discounts.",
    "pricing.loyaltyAuto": "Points are credited automatically after the trip is completed.",
    "pricing.loyaltyStart": "Register and receive as a start bonus",
    "pricing.loyaltyTrip": "for your first trip",

    // Info Page
    "info.title": "About KKBus",
    "info.desc": "KKBus is a modern transport platform designed for KKBus sp. z o.o., dedicated to fast and comfortable passenger service. We connect two key cities of southern Poland: Kraków and Katowice, focusing on innovation, safety, and reliability.",
    "info.fleetTitle": "Our Fleet & Route",
    "info.fleetDesc": "We specialize in passenger transport on the Kraków ↔ Katowice route. With our fleet of modern coaches and buses, we ensure high standard of travel. In the future, we plan to expand our offer to other destinations, but currently our priority is the excellent service of this key line.",
    "info.systemTitle": "Innovative System",
    "info.systemDesc": "We use a proprietary, integrated management system that automates bookings and eliminates the phenomenon of overbooking (selling more tickets than seats). This software is designed to guarantee the highest quality of customer service.",
    "info.contactTitle": "Contact Us",
    "info.officeTitle": "Headquarters and project office",
    "info.phoneTitle": "Phone",
    "info.hoursTitle": "Helpline business hours",
    "info.weekdays": "Monday - Friday",
    "info.saturday": "Saturday",
    "info.sundays": "Sunday and Holidays",
    "info.closed": "Closed",

    // Footer
    "footer.rights": "All rights reserved.",
    "footer.links": "Useful Links",
    "footer.career": "Career",
    "footer.press": "Press Room",
    "footer.terms": "Regulations",
    "footer.privacy": "Privacy Policy",
    "footer.contact": "Contact Us",
    "footer.desc": "Modern coach lines on the Kraków ↔ Katowice route. Travel safely, comfortably, and always on time.",
    "footer.aboutUs": "About Us",
    "footer.forDrivers": "For Drivers",
    "footer.payments": "Payment Methods",
    "footer.trust": "Trust",
    "footer.certificate": "Safe Carrier Certificate 2026.",
    "footer.project": "Project implemented within: Department of Applied Computer Science M-7, Faculty of Mechanical Engineering, Cracow University of Technology",
    "footer.cookies": "Cookies",
    "footer.faq": "FAQ",
    "footer.stopsAndMaps": "Bus stops & Maps",
    "footer.timetable": "Timetable",
    "footer.pricing": "Ticket Pricing",
    "footer.company": "Company",

    // Live Feed
    "live.status": "Live Status",
    "live.title": "Thousands of satisfied passengers every day",
    "live.desc": "Our coaches constantly travel across Poland, delivering passengers safely and on time. Watch the live updated stream of recently completed trips.",
    "live.cardTitle": "Recently completed trips",
    "live.success": "Completed successfully",
    "map.stopIndex": "Stop",
    "map.of": "of",

    // Value Proposition (extended)
    "val.subtitle": "We prioritize top comfort and safety. See what we have prepared for you on board.",
    "val.wifi": "Free Wi-Fi",
    "val.wifiDesc": "Fast on-board internet allows you to work or watch movies throughout the journey.",
    "val.seats": "Comfortable seats",
    "val.seatsDesc": "Plenty of legroom and adjustable backrests guarantee relaxation even on long routes.",
    "val.power": "Power outlets & USB",
    "val.powerDesc": "Charge your devices on the go with 230V outlets and USB ports at every seat.",
    "val.eco": "Eco-friendly travel",
    "val.ecoDesc": "Our modern coaches meet the highest emission standards, caring for the environment.",

    // Dashboard / Client profile
    "dash.welcome": "Welcome",
    "dash.tabOverview": "Overview",
    "dash.tabReservations": "Reservations",
    "dash.tabLoyalty": "Loyalty Program",
    "dash.tabSettings": "Settings",
    "dash.loyaltyCard": "Loyalty Points",
    "dash.loyaltyPoints": "pts",
    "dash.loyaltyMissing": "You need",
    "dash.loyaltyMissingEnd": "pts more for a free ticket!",
    "dash.activeRes": "Active Reservations",
    "dash.noActiveRes": "No active reservations",
    "dash.yourAccount": "Your Account",
    "dash.clientNumber": "Client No.",
    "dash.memberSince": "Member since",
    "dash.editProfile": "Edit profile",
    "dash.resHistory": "Trip History",
    "dash.resRoute": "Route",
    "dash.resDeparture": "Departure",
    "dash.resSeat": "Seat",
    "dash.resStatus": "Status",
    "dash.resPrice": "Price",
    "dash.resActions": "Actions",
    "dash.resCancel": "Cancel",
    "dash.resCancelConfirm": "Are you sure you want to cancel this reservation?",
    "dash.resCancelled": "Reservation cancelled successfully.",
    "dash.resEmpty": "You don't have any reservations yet.",
    "dash.resConfirmed": "Confirmed",
    "dash.resPaid": "Paid",
    "dash.resCancelledStatus": "Cancelled",
    "dash.loyaltyBalance": "Points balance",
    "dash.loyaltyRewards": "Rewards Catalog",
    "dash.loyaltyRedeem": "Redeem",
    "dash.loyaltyRequired": "Required",
    "dash.loyaltyHistory": "Transaction History",
    "dash.loyaltyNoHistory": "No transactions.",
    "dash.loyaltyDate": "Date",
    "dash.loyaltyDesc": "Description",
    "dash.loyaltyDelta": "Points",
    "dash.loyaltyNotEnrolled": "You are not enrolled in the loyalty program.",
    "dash.settingsTitle": "Profile Settings",
    "dash.settingsFirstName": "First name",
    "dash.settingsLastName": "Last name",
    "dash.settingsPhone": "Phone",
    "dash.settingsEmail": "E-mail",
    "dash.settingsSave": "Save changes",
    "dash.settingsSaved": "Profile updated successfully.",
    "dash.settingsAccountInfo": "Account information",
    "dash.settingsDob": "Date of birth",
    "dash.settingsStatus": "Account status",
    "dash.settingsLogout": "Log out",
    "dash.loading": "Loading...",
    "dash.error": "An error occurred. Please try again.",
    "dash.loginRequired": "Log in to view your profile.",
    "dash.loginBtn": "Go to login",
  }
};

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: keyof typeof translations.pl) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("pl");

  // Załaduj zapisany język z localStorage po zamontowaniu
  useEffect(() => {
    const saved = localStorage.getItem("kkbus_lang") as Language;
    if (saved === "pl" || saved === "en") {
      setLanguage(saved);
    }
  }, []);

  const toggleLanguage = () => {
    const nextLang: Language = language === "pl" ? "en" : "pl";
    setLanguage(nextLang);
    localStorage.setItem("kkbus_lang", nextLang);
  };

  const t = (key: keyof typeof translations.pl): string => {
    const dict = translations[language];
    return dict[key] || translations["pl"][key] || String(key);
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
}
