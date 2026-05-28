"use client";

import { useState } from "react";
import { 
  Newspaper, 
  Download, 
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  ArrowRight,
  FileDown,
  Sparkles,
  Share2
} from "lucide-react";

interface PressRelease {
  id: string;
  date: string;
  title: string;
  lead: string;
  category: string;
}

export default function BiuroPrasowePage() {
  const [activeCategory, setActiveCategory] = useState("all");

  const pressReleases: PressRelease[] = [
    {
      id: "pr-1",
      date: "20.05.2026",
      title: "KKBus wdraża nowoczesną platformę rezerwacji przejazdów dla pasażerów",
      lead: "Innowacyjny system rezerwacji eliminuje zjawisko overbookingu, oferując automatyczne przypisywanie miejsc oraz nowoczesny program lojalnościowy z wymianą punktów.",
      category: "innowacje"
    },
    {
      id: "pr-2",
      date: "28.04.2026",
      title: "Flota KKBus powiększa się o 5 ekologicznych autokarów spełniających normy Euro 6",
      lead: "Przewoźnik kontynuuje inwestycje w zielony transport. Nowe pojazdy wyjadą na trasę Kraków ↔ Katowice już od maja, zapewniając najwyższy standard i niską emisję spalin.",
      category: "flota"
    },
    {
      id: "pr-3",
      date: "15.03.2026",
      title: "KKBus przekroczył próg 100 000 zadowolonych pasażerów w tym roku",
      lead: "Dzięki wysokiej częstotliwości kursowania, bezpieczeństwu oraz komfortowej flocie, KKBus staje się pierwszym wyborem dla osób podróżujących między stolicami Małopolski i Śląska.",
      category: "biznes"
    }
  ];

  const pressKits = [
    {
      title: "Logotypy KKBus Sp. z o.o.",
      description: "Paczka zawierająca oficjalne logo w formatach wektorowych (SVG, EPS) oraz rastrowych (PNG, JPG) w wersjach jasnej i ciemnej.",
      size: "2.4 MB"
    },
    {
      title: "Zdjęcia autokarów i busów",
      description: "Wysokiej jakości zdjęcia promocyjne naszej floty pojazdów w rozdzielczości do publikacji prasowych oraz internetowych.",
      size: "18.5 MB"
    },
    {
      title: "Materiały informacyjne o firmie",
      description: "Folder zawierający historię firmy KKBus, dane statystyczne dotyczące połączenia Kraków-Katowice oraz życiorysy zarządu.",
      size: "1.2 MB"
    }
  ];

  const filteredReleases = activeCategory === "all" 
    ? pressReleases 
    : pressReleases.filter(r => r.category === activeCategory);

  return (
    <main className="min-h-screen pt-24 pb-16 bg-background-alt">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-action mb-4 text-sm font-semibold">
            <Newspaper size={16} />
            <span>Materiały dla mediów</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">Biuro Prasowe</h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            Aktualne komunikaty prasowe, paczki graficzne i zdjęcia do pobrania oraz kontakt dla dziennikarzy.
          </p>
        </div>

        {/* Media Spokesperson contact */}
        <div className="bg-primary text-white rounded-3xl shadow-xl overflow-hidden mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-8 md:p-12 space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-action">
                <Sparkles size={12} />
                <span>Kontakt dla dziennikarzy</span>
              </div>
              <h2 className="text-3xl font-bold">Rzecznik Prasowy KKBus</h2>
              <p className="text-blue-100 text-sm leading-relaxed">
                Jeżeli jesteś dziennikarzem i potrzebujesz dodatkowych informacji prasowych, komentarza eksperckiego lub zgody na nagrania, skontaktuj się bezpośrednio z naszym działem PR.
              </p>
            </div>
            
            <div className="bg-blue-900/60 p-8 md:p-12 flex flex-col justify-center space-y-6 border-t md:border-t-0 md:border-l border-white/5 backdrop-blur-sm">
              <ul className="space-y-4 text-sm">
                <li className="flex items-center gap-3.5">
                  <Mail className="text-action" size={20} />
                  <div>
                    <span className="block text-[10px] text-blue-200 uppercase font-bold tracking-wider">E-mail prasowy</span>
                    <strong className="text-base">pr@kkbus.pl</strong>
                  </div>
                </li>
                <li className="flex items-center gap-3.5">
                  <Phone className="text-action" size={20} />
                  <div>
                    <span className="block text-[10px] text-blue-200 uppercase font-bold tracking-wider">Telefon kontaktowy</span>
                    <strong className="text-base">+48 500 600 700</strong>
                  </div>
                </li>
                <li className="flex items-center gap-3.5">
                  <Clock className="text-action" size={20} />
                  <div>
                    <span className="block text-[10px] text-blue-200 uppercase font-bold tracking-wider">Godziny kontaktu</span>
                    <span className="font-semibold text-blue-100">Poniedziałek - Piątek, 09:00 - 16:00</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Press Releases List */}
        <div className="mb-16">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
            <h2 className="text-2xl font-bold text-primary">Komunikaty Prasowe</h2>
            
            {/* Category pills */}
            <div className="flex gap-2 flex-wrap">
              {["all", "innowacje", "flota", "biznes"].map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                    activeCategory === cat 
                      ? "bg-primary text-white border-primary shadow-sm"
                      : "bg-white text-text-muted border-gray-100 hover:border-action"
                  }`}
                >
                  {cat === "all" ? "Wszystkie" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {filteredReleases.map(release => (
              <div 
                key={release.id} 
                className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                <div className="flex items-center gap-3 text-xs text-text-muted font-bold">
                  <span className="flex items-center gap-1"><Calendar size={14} className="text-action" /> {release.date}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-action text-[10px]">{release.category}</span>
                </div>
                <h3 className="text-xl font-bold text-primary hover:text-action transition-colors cursor-pointer">{release.title}</h3>
                <p className="text-text-muted leading-relaxed text-sm">{release.lead}</p>
                
                <div className="flex items-center justify-between pt-2 border-t border-gray-50 text-xs font-bold text-action">
                  <button className="flex items-center gap-1 hover:underline">
                    Czytaj cały komunikat <ArrowRight size={14} />
                  </button>
                  <button className="flex items-center gap-1 text-gray-400 hover:text-action transition-colors">
                    <Share2 size={14} /> Udostępnij
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Press Kit Download */}
        <h2 className="text-2xl font-bold text-primary mb-6">Materiały do Pobrania (Press Kit)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pressKits.map((kit, idx) => (
            <div 
              key={idx} 
              className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 bg-blue-50 text-action rounded-xl flex items-center justify-center">
                  <FileDown size={20} />
                </div>
                <h3 className="font-bold text-primary text-base">{kit.title}</h3>
                <p className="text-xs text-text-muted leading-relaxed">{kit.description}</p>
              </div>
              
              <div className="pt-6 border-t border-gray-50 mt-6 flex justify-between items-center text-xs font-bold text-text-muted">
                <span>Rozmiar: {kit.size}</span>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-blue-50 hover:text-action transition-colors">
                  <Download size={14} /> Pobierz
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
