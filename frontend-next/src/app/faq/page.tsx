"use client";

import { useState } from "react";
import { 
  HelpCircle, 
  Search, 
  ChevronDown, 
  Calendar, 
  CreditCard, 
  Gift, 
  ShieldAlert, 
  MessageSquare,
  Sparkles
} from "lucide-react";

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const categories = [
    { id: "all", label: "Wszystkie", icon: HelpCircle },
    { id: "reservations", label: "Rezerwacje i Bilety", icon: Calendar },
    { id: "loyalty", label: "Program Lojalnościowy", icon: Gift },
    { id: "travel", label: "Podróż i Bagaż", icon: ShieldAlert },
    { id: "other", label: "Płatności i Wsparcie", icon: CreditCard },
  ];

  const faqData: FAQItem[] = [
    {
      id: "req-1",
      category: "reservations",
      question: "Do kiedy mogę dokonać rezerwacji na przejazd?",
      answer: "Rezerwacji miejsca w naszym systemie można dokonać najpóźniej do 2 godzin przed planowaną godziną odjazdu danego kursu. Po tym czasie rezerwacja online zostaje zablokowana i zakup biletu jest możliwy wyłącznie bezpośrednio u kierowcy w pojeździe (pod warunkiem dostępności wolnych miejsc)."
    },
    {
      id: "req-2",
      category: "reservations",
      question: "Czy mogę anulować rezerwację i otrzymać zwrot pieniędzy?",
      answer: "Tak. Bezkosztowe anulowanie rezerwacji jest możliwe najpóźniej na 24 godziny przed planowanym kursem. Możesz to zrobić samodzielnie w panelu klienta w sekcji „Moje rezerwacje”. W przypadku anulowania rezerwacji w czasie krótszym niż 24 godziny przed odjazdem, środki nie są zwracane."
    },
    {
      id: "req-3",
      category: "reservations",
      question: "Co się stanie, jeśli spóźnię się na autobus (tzw. no-show)?",
      answer: "W przypadku niepojawienia się na kursie bez wcześniejszego anulowania, rezerwacja wygasa z momentem odjazdu pojazdu, a opłata nie podlega zwrotowi. W systemie rejestrowana jest informacja o niestawieniu się pasażera (tzw. 'no-show'). Powtarzające się sytuacje niestawienia się mogą skutkować nałożeniem blokady na konto użytkownika."
    },
    {
      id: "req-4",
      category: "reservations",
      question: "Jakie zniżki są honorowane przez KKBus?",
      answer: "Zapewniamy zniżki ustawowe oraz handlowe. Najważniejsze z nich to zniżka studencka (-51% za okazaniem ważnej legitymacji studenckiej), szkolna (-37% dla uczniów do 24. roku życia z legitymacją szkolną) oraz darmowy przejazd (-100%) dla dzieci do lat 4 podróżujących na kolanach opiekuna. Pamiętaj, aby zabrać ze sobą dokument uprawniający do ulgi!"
    },
    {
      id: "loy-1",
      category: "loyalty",
      question: "Jak działa Program Lojalnościowy KKBus?",
      answer: "Program lojalnościowy jest w pełni darmowy dla wszystkich zarejestrowanych pasażerów. Za każdy przebyty kilometr otrzymujesz 1 punkt (np. trasa Kraków ↔ Katowice to około 80 km, czyli 80 punktów). Punkty naliczają się na Twoje konto automatycznie w ciągu godziny od zakończenia podróży."
    },
    {
      id: "loy-2",
      category: "loyalty",
      question: "Na co mogę wymienić zgromadzone punkty lojalnościowe?",
      answer: "Zgromadzone punkty możesz w każdej chwili wymienić w panelu klienta na darmowe bilety jednorazowe na trasie Kraków ↔ Katowice lub atrakcyjne zniżki procentowe na kolejne rezerwacje. Przy rejestracji otrzymujesz również bonus na start w wysokości 100 punktów!"
    },
    {
      id: "trv-1",
      category: "travel",
      question: "Jaki bagaż mogę zabrać ze sobą w podróż?",
      answer: "W cenie każdego biletu pasażer ma prawo do przewiezienia 1 sztuki bagażu podręcznego (wielkości plecaka lub małej torby mieszczącej się pod fotelem lub na półce nad głową) oraz 1 sztuki bagażu głównego (do 20 kg, przewożonego w luku bagażowym). Nadbagaż podlega dodatkowej opłacie u kierowcy."
    },
    {
      id: "trv-2",
      category: "travel",
      question: "Czy mogę podróżować ze zwierzęciem?",
      answer: "Tak, przewóz małych zwierząt domowych (np. pies, kot) jest dozwolony pod warunkiem, że zwierzę znajduje się w bezpiecznym transporterze i nie zagraża komfortowi ani bezpieczeństwu innych podróżnych. W przypadku psów większych rozmiarów wymagane jest posiadanie kagańca, smyczy oraz opłacenie dodatkowego biletu u kierowcy."
    },
    {
      id: "pay-1",
      category: "other",
      question: "Jakie metody płatności są dostępne online?",
      answer: "Nasz zintegrowany system płatności obsługuje najpopularniejsze metody szybkiej płatności: BLIK, szybkie przelewy internetowe (Przelewy24), a także karty płatnicze VISA i MasterCard. Transakcje są w pełni szyfrowane i bezpieczne (certyfikat SSL/HTTPS)."
    },
    {
      id: "pay-2",
      category: "other",
      question: "W jakich godzinach działa infolinia i wsparcie techniczne?",
      answer: "Biuro obsługi klienta i infolinia telefoniczna pod numerem +48 (12) 628 36 30 działają od poniedziałku do piątku w godzinach 08:00 - 18:00 oraz w soboty w godzinach 09:00 - 15:00. W niedziele i dni świąteczne infolinia jest nieczynna, ale zgłoszenia e-mailowe na kontakt@kkbus.pl są przyjmowane 24/7."
    }
  ];

  const toggleItem = (id: string) => {
    setOpenItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredFaqs = faqData.filter(item => {
    const matchesSearch = 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      activeCategory === "all" || item.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <main className="min-h-screen pt-24 pb-16 bg-background-alt">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-action mb-4 text-sm font-semibold">
            <Sparkles size={16} className="animate-pulse" />
            <span>Centrum Pomocy KKBus</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">Często Zadawane Pytania</h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            Znajdź szybkie odpowiedzi na pytania dotyczące rezerwacji biletów, programu lojalnościowego oraz standardów podróży.
          </p>
        </div>

        {/* Dynamic Search Bar */}
        <div className="relative max-w-2xl mx-auto mb-10">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
            <Search size={22} />
          </div>
          <input
            type="text"
            placeholder="Wpisz słowo kluczowe (np. rezerwacja, zniżka, punkty)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-4 rounded-full border border-gray-200 bg-white text-text-main shadow-lg focus:outline-none focus:border-action focus:ring-4 focus:ring-blue-100 transition-all text-base placeholder:text-gray-400"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")} 
              className="absolute inset-y-0 right-4 flex items-center text-xs font-semibold text-text-muted hover:text-action transition-colors"
            >
              Wyczyść
            </button>
          )}
        </div>

        {/* Category Buttons / Tabs */}
        <div className="flex gap-2 md:gap-3 flex-wrap justify-center mb-12">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-full text-sm font-medium transition-all ${
                  isSelected 
                    ? "bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]" 
                    : "bg-white text-text-muted hover:text-primary hover:bg-gray-50 border border-gray-100 shadow-sm"
                }`}
              >
                <Icon size={16} className={isSelected ? "text-action" : "text-gray-400"} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => {
              const isOpen = !!openItems[faq.id];
              return (
                <div 
                  key={faq.id} 
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md"
                >
                  <button
                    onClick={() => toggleItem(faq.id)}
                    className="w-full flex items-center justify-between p-6 text-left"
                  >
                    <span className="font-bold text-primary text-base md:text-lg pr-4">{faq.question}</span>
                    <div className={`p-2 rounded-xl bg-blue-50 text-action transition-transform duration-300 ${isOpen ? "rotate-180 bg-primary text-white" : ""}`}>
                      <ChevronDown size={18} />
                    </div>
                  </button>
                  
                  <div 
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isOpen ? "max-h-[500px] border-t border-gray-50 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="p-6 bg-gray-50/50 text-text-muted leading-relaxed text-sm md:text-base">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-inner">
              <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare size={28} />
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">Brak wyników wyszukiwania</h3>
              <p className="text-text-muted max-w-sm mx-auto">
                Nie znaleźliśmy odpowiedzi na Twoje zapytanie: <strong className="text-action">"{searchQuery}"</strong>. Spróbuj użyć innych słów kluczowych lub zmień wybraną kategorię.
              </p>
            </div>
          )}
        </div>

        {/* Footer Banner */}
        <div className="mt-16 bg-primary text-white rounded-3xl shadow-xl p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl transform translate-x-12 -translate-y-12"></div>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Nadal nie znalazłeś odpowiedzi?</h2>
          <p className="text-blue-100 max-w-lg mx-auto mb-8 text-sm md:text-base">
            Nasz zespół wsparcia klienta jest gotowy do pomocy. Napisz do nas e-mail lub zadzwoń bezpośrednio na infolinię!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:kontakt@kkbus.pl" 
              className="px-6 py-3 rounded-2xl bg-action hover:bg-action-hover text-white font-bold transition-all shadow-lg shadow-action/25 text-sm md:text-base inline-block"
            >
              Napisz e-mail: kontakt@kkbus.pl
            </a>
            <a 
              href="tel:+48126283630" 
              className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold border border-white/20 transition-all text-sm md:text-base inline-block"
            >
              Zadzwoń: +48 (12) 628 36 30
            </a>
          </div>
        </div>

      </div>
    </main>
  );
}
