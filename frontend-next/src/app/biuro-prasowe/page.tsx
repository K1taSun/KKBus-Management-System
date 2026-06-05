"use client";

import { useState, useEffect } from "react";
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
import { useTranslation } from "@/lib/LanguageContext";

interface PressRelease {
  id: string;
  date: string;
  title: string;
  lead: string;
  category: string;
}

const localTranslations = {
  pl: {
    badge: "Materiały dla mediów",
    title: "Biuro Prasowe",
    subtitle: "Aktualne komunikaty prasowe, paczki graficzne i zdjęcia do pobrania oraz kontakt dla dziennikarzy.",
    contactBadge: "Kontakt dla dziennikarzy",
    spokespersonTitle: "Rzecznik Prasowy KKBus",
    contactDesc: "Jeżeli jesteś dziennikarzem i potrzebujesz dodatkowych informacji prasowych, komentarza eksperckiego lub zgody na nagrania, skontaktuj się bezpośrednio z naszym działem PR.",
    emailLabel: "E-mail prasowy",
    phoneLabel: "Telefon kontaktowy",
    hoursLabel: "Godziny kontaktu",
    hoursVal: "Poniedziałek - Piątek, 09:00 - 16:00",
    releasesTitle: "Komunikaty Prasowe",
    all: "Wszystkie",
    innowacje: "Innowacje",
    flota: "Flota",
    biznes: "Biznes",
    readFull: "Czytaj cały komunikat",
    share: "Udostępnij",
    kitTitle: "Materiały do Pobrania (Press Kit)",
    kitSize: "Rozmiar",
    downloadBtn: "Pobierz",
    releases: [
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
    ],
    pressKits: [
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
    ]
  },
  en: {
    badge: "Media Materials",
    title: "Press Room",
    subtitle: "Current press releases, graphics packs, download assets, and spokesperson contact information.",
    contactBadge: "Contact for Journalists",
    spokespersonTitle: "KKBus Spokesperson",
    contactDesc: "If you are a journalist and need additional press materials, expert commentary, or recording approval, please contact our PR department directly.",
    emailLabel: "Press Email",
    phoneLabel: "Contact Phone",
    hoursLabel: "Contact Hours",
    hoursVal: "Monday - Friday, 09:00 - 16:00",
    releasesTitle: "Press Releases",
    all: "All",
    innowacje: "Innovations",
    flota: "Fleet",
    biznes: "Business",
    readFull: "Read full release",
    share: "Share",
    kitTitle: "Download Materials (Press Kit)",
    kitSize: "Size",
    downloadBtn: "Download",
    releases: [
      {
        id: "pr-1",
        date: "20.05.2026",
        title: "KKBus launches modern passenger ride reservation platform",
        lead: "The innovative booking system eliminates overbooking, offering automated seat assignment and a modern loyalty program with point redemptions.",
        category: "innowacje"
      },
      {
        id: "pr-2",
        date: "28.04.2026",
        title: "KKBus fleet expands by 5 green Euro 6 compliant coaches",
        lead: "The carrier continues its investment in green transport. New vehicles will enter the Kraków ↔ Katowice route in May, ensuring top standards and low exhaust emissions.",
        category: "flota"
      },
      {
        id: "pr-3",
        date: "15.03.2026",
        title: "KKBus exceeded the threshold of 100,000 satisfied passengers this year",
        lead: "Thanks to high frequency of service, safety, and a comfortable fleet, KKBus is becoming the first choice for travelers between the capitals of Małopolska and Silesia.",
        category: "biznes"
      }
    ],
    pressKits: [
      {
        title: "KKBus Sp. z o.o. Logotypes",
        description: "Package containing official logos in vector formats (SVG, EPS) and raster formats (PNG, JPG) in light and dark versions.",
        size: "2.4 MB"
      },
      {
        title: "Coaches and Buses Photos",
        description: "High-quality promotional photos of our vehicle fleet in resolutions suitable for print and online publications.",
        size: "18.5 MB"
      },
      {
        title: "Company Fact Sheet Materials",
        description: "Folder containing KKBus company history, statistical data regarding the Kraków-Katowice route, and board bios.",
        size: "1.2 MB"
      }
    ]
  }
};

export default function BiuroPrasowePage() {
  const { language } = useTranslation();
  const tLocal = localTranslations[language] || localTranslations["pl"];

  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    document.title = language === "pl" ? "Biuro Prasowe - KKBus" : "Press Room - KKBus";
  }, [language]);

  const pressReleases: PressRelease[] = tLocal.releases;
  const pressKits = tLocal.pressKits;

  const filteredReleases = activeCategory === "all" 
    ? pressReleases 
    : pressReleases.filter(r => r.category === activeCategory);

  const categoriesList = [
    { id: "all", label: tLocal.all },
    { id: "innowacje", label: tLocal.innowacje },
    { id: "flota", label: tLocal.flota },
    { id: "biznes", label: tLocal.biznes }
  ];

  return (
    <main className="min-h-screen pt-24 pb-16 bg-background-alt">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-action mb-4 text-sm font-semibold">
            <Newspaper size={16} />
            <span>{tLocal.badge}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">{tLocal.title}</h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            {tLocal.subtitle}
          </p>
        </div>

        {/* Media Spokesperson contact */}
        <div className="bg-primary text-white rounded-3xl shadow-xl overflow-hidden mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-8 md:p-12 space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-action">
                <Sparkles size={12} />
                <span>{tLocal.contactBadge}</span>
              </div>
              <h2 className="text-3xl font-bold">{tLocal.spokespersonTitle}</h2>
              <p className="text-blue-100 text-sm leading-relaxed">
                {tLocal.contactDesc}
              </p>
            </div>
            
            <div className="bg-blue-900/60 p-8 md:p-12 flex flex-col justify-center space-y-6 border-t md:border-t-0 md:border-l border-white/5 backdrop-blur-sm">
              <ul className="space-y-4 text-sm">
                <li className="flex items-center gap-3.5">
                  <Mail className="text-action" size={20} />
                  <div>
                    <span className="block text-[10px] text-blue-200 uppercase font-bold tracking-wider">{tLocal.emailLabel}</span>
                    <strong className="text-base">pr@kkbus.pl</strong>
                  </div>
                </li>
                <li className="flex items-center gap-3.5">
                  <Phone className="text-action" size={20} />
                  <div>
                    <span className="block text-[10px] text-blue-200 uppercase font-bold tracking-wider">{tLocal.phoneLabel}</span>
                    <strong className="text-base">+48 500 600 700</strong>
                  </div>
                </li>
                <li className="flex items-center gap-3.5">
                  <Clock className="text-action" size={20} />
                  <div>
                    <span className="block text-[10px] text-blue-200 uppercase font-bold tracking-wider">{tLocal.hoursLabel}</span>
                    <span className="font-semibold text-blue-100">{tLocal.hoursVal}</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Press Releases List */}
        <div className="mb-16">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
            <h2 className="text-2xl font-bold text-primary">{tLocal.releasesTitle}</h2>
            
            {/* Category pills */}
            <div className="flex gap-2 flex-wrap">
              {categoriesList.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                    activeCategory === cat.id 
                      ? "bg-primary text-white border-primary shadow-sm"
                      : "bg-white text-text-muted border-gray-100 hover:border-action"
                  }`}
                >
                  {cat.label}
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
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-action text-[10px] uppercase">
                    {release.category === "innowacje" ? tLocal.innowacje : release.category === "flota" ? tLocal.flota : tLocal.biznes}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-primary hover:text-action transition-colors cursor-pointer">{release.title}</h3>
                <p className="text-text-muted leading-relaxed text-sm">{release.lead}</p>
                
                <div className="flex items-center justify-between pt-2 border-t border-gray-50 text-xs font-bold text-action">
                  <button className="flex items-center gap-1 hover:underline">
                    {tLocal.readFull} <ArrowRight size={14} />
                  </button>
                  <button className="flex items-center gap-1 text-gray-400 hover:text-action transition-colors">
                    <Share2 size={14} /> {tLocal.share}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Press Kit Download */}
        <h2 className="text-2xl font-bold text-primary mb-6">{tLocal.kitTitle}</h2>
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
                <span>{tLocal.kitSize}: {kit.size}</span>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-blue-50 hover:text-action transition-colors">
                  <Download size={14} /> {tLocal.downloadBtn}
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
