"use client";

import { useState } from "react";
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  CircleDollarSign, 
  Send, 
  CheckCircle,
  FileText,
  TrendingUp,
  Heart,
  Smile
} from "lucide-react";

interface JobOffer {
  id: string;
  title: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  requirements: string[];
}

export default function KarieraPage() {
  const [selectedJob, setSelectedJob] = useState<string>("driver");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [cvFile, setCvFile] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);

  const jobOffers: JobOffer[] = [
    {
      id: "driver",
      title: "Kierowca Autokaru (kat. D)",
      location: "Kraków / Katowice",
      type: "Pełny etat / Grafik elastyczny",
      salary: "7 000 - 9 500 PLN brutto",
      description: "Poszukujemy profesjonalnych i odpowiedzialnych kierowców z prawem jazdy kat. D do obsługi regularnych kursów autokarowych na trasie Kraków ↔ Katowice. Dbamy o komfort pracy oraz nowoczesną, bezpieczną flotę pojazdów.",
      requirements: [
        "Prawo jazdy kat. D oraz aktualne uprawnienia (kod 95).",
        "Wysoka kultura osobista i opanowanie.",
        "Karta kierowcy do tachografu cyfrowego.",
        "Gotowość do pracy w systemie zmianowym (w tym niektóre weekendy)."
      ]
    },
    {
      id: "secretariat",
      title: "Pracownik Sekretariatu i Obsługi Klienta",
      location: "Kraków (Biuro Główne)",
      type: "Pełny etat",
      salary: "4 800 - 6 000 PLN brutto",
      description: "Do Twoich obowiązków należeć będzie bieżąca obsługa pasażerów w biurze, telefoniczna pomoc techniczna, koordynacja rezerwacji oraz tworzenie i edycja grafików pracy kierowców przy użyciu naszego zintegrowanego systemu zarządzania.",
      requirements: [
        "Dobra organizacja pracy i sumienność.",
        "Komunikatywność i wysoka kultura obsługi klienta.",
        "Sprawna obsługa komputera (MS Office, systemy rezerwacyjne).",
        "Znajomość języka angielskiego na poziomie komunikatywnym (B1/B2)."
      ]
    },
    {
      id: "mechanic",
      title: "Mechanik / Serwisant Floty Autokarowej",
      location: "Katowice (Zaplecze Techniczne)",
      type: "Pełny etat",
      salary: "6 500 - 8 500 PLN brutto",
      description: "Poszukujemy doświadczonego mechanika do dbania o stan techniczny naszych nowoczesnych autokarów i busów. Praca w doskonale wyposażonym warsztacie, nastawiona na profilaktykę oraz usuwanie bieżących usterek mechanicznych.",
      requirements: [
        "Doświadczenie w naprawie pojazdów ciężarowych lub autobusów.",
        "Znajomość mechaniki i elektromechaniki samochodowej.",
        "Prawo jazdy kat. B (kat. C lub D będzie dodatkowym atutem).",
        "Dokładność, sumienność i dbałość o standardy bezpieczeństwa."
      ]
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) return;
    
    // In production we would send data to backend API
    setSubmitted(true);
    setName("");
    setEmail("");
    setPhone("");
    setMessage("");
    setCvFile("");
  };

  return (
    <main className="min-h-screen pt-24 pb-16 bg-background-alt">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-action mb-4 text-sm font-semibold">
            <Briefcase size={16} />
            <span>Dołącz do zespołu KKBus</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">Rozwijaj się z nami!</h1>
          <p className="text-lg text-text-muted max-w-3xl mx-auto leading-relaxed">
            KKBus sp. z o.o. to zgrany zespół profesjonalistów, który codziennie dba o to, by tysiące pasażerów bezpiecznie podróżowało na trasie Kraków ↔ Katowice. Sprawdź aktualne oferty i aplikuj już dziś!
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center flex flex-col items-center">
            <div className="w-14 h-14 bg-blue-50 text-action rounded-2xl flex items-center justify-center mb-6">
              <TrendingUp size={28} />
            </div>
            <h3 className="text-xl font-bold text-primary mb-2">Stabilność finansowa</h3>
            <p className="text-text-muted text-sm leading-relaxed">
              Oferujemy wysokie, regularne zarobki, premie uznaniowe oraz stabilne zatrudnienie na podstawie umowy o pracę.
            </p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center flex flex-col items-center">
            <div className="w-14 h-14 bg-blue-50 text-action rounded-2xl flex items-center justify-center mb-6">
              <Heart size={28} />
            </div>
            <h3 className="text-xl font-bold text-primary mb-2">Nowoczesna flota</h3>
            <p className="text-text-muted text-sm leading-relaxed">
              Nasi kierowcy pracują na nowoczesnych, klimatyzowanych i w pełni sprawnych technicznie pojazdach Euro 6.
            </p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center flex flex-col items-center">
            <div className="w-14 h-14 bg-blue-50 text-action rounded-2xl flex items-center justify-center mb-6">
              <Smile size={28} />
            </div>
            <h3 className="text-xl font-bold text-primary mb-2">Elastyczność grafiku</h3>
            <p className="text-text-muted text-sm leading-relaxed">
              Układamy grafiki z uwzględnieniem Twoich dyspozycyjności, tak abyś mógł pogodzić pracę z życiem prywatnym.
            </p>
          </div>
        </div>

        {/* Job Listings & Apply Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Offers List */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-primary mb-6">Aktualne oferty pracy</h2>
            
            {jobOffers.map((offer) => (
              <div 
                key={offer.id}
                className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm hover:shadow-md transition-all space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-primary">{offer.title}</h3>
                    <div className="flex items-center gap-4 text-xs font-semibold text-text-muted mt-2">
                      <span className="flex items-center gap-1"><MapPin size={14} className="text-action" /> {offer.location}</span>
                      <span className="flex items-center gap-1"><Clock size={14} className="text-action" /> {offer.type}</span>
                    </div>
                  </div>
                  <div className="bg-blue-50 text-primary-light px-4 py-2 rounded-2xl text-sm font-bold flex items-center gap-1.5 self-start sm:self-center">
                    <CircleDollarSign size={16} className="text-action" />
                    <span>{offer.salary}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-text-muted leading-relaxed text-sm md:text-base">{offer.description}</p>
                  <div>
                    <p className="font-bold text-primary text-sm mb-2">Nasze wymagania:</p>
                    <ul className="space-y-2 text-sm text-text-muted">
                      {offer.requirements.map((req, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <CheckCircle className="text-action shrink-0 mt-0.5" size={16} />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    onClick={() => {
                      setSelectedJob(offer.id);
                      document.getElementById("apply-form")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="px-6 py-2.5 rounded-2xl bg-primary hover:bg-primary-light text-white font-bold text-sm transition-all"
                  >
                    Aplikuj na to stanowisko
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div id="apply-form" className="lg:col-span-1">
            <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-lg sticky top-28 space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-primary">Szybka aplikacja</h3>
                <p className="text-xs text-text-muted mt-1">Wypełnij krótki formularz, a nasz sekretariat skontaktuje się z Tobą telefonicznie.</p>
              </div>

              {submitted ? (
                <div className="p-6 bg-blue-50 border border-blue-100 rounded-3xl text-center space-y-4">
                  <div className="w-16 h-16 bg-action text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle size={32} />
                  </div>
                  <h4 className="text-lg font-bold text-primary">Aplikacja wysłana!</h4>
                  <p className="text-xs text-text-muted leading-relaxed">
                    Dziękujemy za przesłanie zgłoszenia. Zgłoszenie zostało pomyślnie zarejestrowane. Skontaktujemy się z Tobą w ciągu najbliższych 48 godzin.
                  </p>
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="text-xs font-semibold text-action hover:underline"
                  >
                    Wyślij kolejne zgłoszenie
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-primary mb-1.5 uppercase">Wybierz stanowisko</label>
                    <select
                      value={selectedJob}
                      onChange={(e) => setSelectedJob(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-action transition-all text-text-main font-medium bg-gray-50/50"
                    >
                      <option value="driver">Kierowca Autokaru (kat. D)</option>
                      <option value="secretariat">Pracownik Sekretariatu</option>
                      <option value="mechanic">Mechanik Floty</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-primary mb-1.5 uppercase">Imię i Nazwisko</label>
                    <input
                      type="text"
                      required
                      placeholder="np. Jan Kowalski"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-action transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-primary mb-1.5 uppercase">Adres E-mail</label>
                    <input
                      type="email"
                      required
                      placeholder="np. jan.kowalski@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-action transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-primary mb-1.5 uppercase">Numer Telefonu</label>
                    <input
                      type="tel"
                      required
                      placeholder="np. +48 500 600 700"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-action transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-primary mb-1.5 uppercase">Załącz CV (np. PDF / DOCX)</label>
                    <div className="relative flex items-center justify-center border-2 border-dashed border-gray-200 hover:border-action rounded-2xl p-4 transition-colors bg-gray-50/50 cursor-pointer">
                      <input
                        type="file"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            setCvFile(e.target.files[0].name);
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <div className="text-center text-text-muted space-y-1">
                        <FileText size={24} className="mx-auto text-gray-400" />
                        <span className="block text-xs font-semibold">{cvFile ? cvFile : "Kliknij, aby wybrać plik CV"}</span>
                        <span className="block text-[10px] text-gray-400">Maksymalny rozmiar pliku: 5 MB</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-primary mb-1.5 uppercase">List motywacyjny / Uwagi (Opcjonalnie)</label>
                    <textarea
                      placeholder="Napisz kilka zdań o sobie..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-action transition-all resize-none"
                    />
                  </div>

                  <div className="flex items-start gap-2.5 text-[10px] text-text-muted leading-relaxed">
                    <input type="checkbox" required className="mt-0.5 rounded" />
                    <span>Wyrażam zgodę na przetwarzanie moich danych osobowych przez KKBus Sp. z o.o. w celu przeprowadzenia obecnego procesu rekrutacyjnego.</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-2xl bg-action hover:bg-action-hover text-white font-bold transition-all shadow-md shadow-action/25 flex items-center justify-center gap-2 text-sm"
                  >
                    <Send size={16} /> Prześlij Aplikację
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}
