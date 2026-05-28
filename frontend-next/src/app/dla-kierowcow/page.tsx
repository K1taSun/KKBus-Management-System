"use client";

import { useState } from "react";
import { 
  Users, 
  Calendar, 
  ClipboardList, 
  FileCheck2, 
  ShieldCheck, 
  LogIn,
  CheckSquare,
  AlertOctagon,
  Wrench,
  Bus
} from "lucide-react";

export default function DlaKierowcowPage() {
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    lights: false,
    brakes: false,
    tires: false,
    cleanliness: false,
    fluids: false,
    documents: false,
  });

  const toggleChecklistItem = (key: string) => {
    setChecklist(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const checklistItems = [
    { key: "lights", label: "Oświetlenie zewnętrzne i kierunkowskazy" },
    { key: "brakes", label: "Układ hamulcowy (roboczy i postojowy)" },
    { key: "tires", label: "Stan opon (ciśnienie, głębokość bieżnika)" },
    { key: "cleanliness", label: "Czystość przestrzeni pasażerskiej" },
    { key: "fluids", label: "Poziom płynów eksploatacyjnych (olej, płyn chłodzący, spryskiwacze)" },
    { key: "documents", label: "Komplet dokumentów pojazdu oraz apteczka pierwszej pomocy" }
  ];

  const allChecked = Object.values(checklist).every(val => val);

  return (
    <main className="min-h-screen pt-24 pb-16 bg-background-alt">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-action mb-4 text-sm font-semibold">
            <Bus size={16} />
            <span>Strefa Kierowcy KKBus</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">Informacje dla Kierowców</h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            Wskazówki operacyjne, procedury oraz strefa wiedzy dla kierowców obsługujących linię Kraków ↔ Katowice.
          </p>
        </div>

        {/* Portal Login Banner */}
        <div className="bg-gradient-to-r from-primary to-blue-900 rounded-3xl shadow-xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Dostęp do Panelu Kierowcy</h2>
            <p className="text-blue-100 text-sm max-w-xl">
              Zaloguj się do swojego indywidualnego konta, aby sprawdzić grafik pracy, pobrać listę pasażerów przypisanych do dzisiejszych kursów lub zgłosić raport po trasie.
            </p>
          </div>
          <a 
            href="/driver" 
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-action hover:bg-action-hover text-white font-bold transition-all shadow-lg shadow-action/25 text-sm shrink-0"
          >
            <LogIn size={18} /> Zaloguj się do Panelu
          </a>
        </div>

        {/* Main Duties Grid */}
        <h2 className="text-2xl font-bold text-primary mb-6">Procedury i Narzędzia Pracy</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          
          {/* Grafik i dyspozycyjność */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex gap-6">
            <div className="w-12 h-12 bg-blue-50 text-action rounded-2xl flex items-center justify-center shrink-0">
              <Calendar size={24} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-primary">Grafik i Dyspozycyjność</h3>
              <p className="text-text-muted text-sm leading-relaxed">
                Twój grafik pracy jest generowany i aktualizowany przez pracowników sekretariatu. Zgłoszenia dyspozycyjności (dostępność, niedostępność lub wnioski urlopowe) należy składać w panelu kierowcy z co najmniej 7-dniowym wyprzedzeniem.
              </p>
            </div>
          </div>

          {/* Lista Pasażerów */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex gap-6">
            <div className="w-12 h-12 bg-blue-50 text-action rounded-2xl flex items-center justify-center shrink-0">
              <Users size={24} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-primary">Lista Pasażerów</h3>
              <p className="text-text-muted text-sm leading-relaxed">
                Przed każdym kursem masz dostęp do pełnej listy pasażerów przypisanych do Twojego pojazdu. Podczas wchodzenia pasażerów na pokład należy weryfikować ich tożsamość oraz ważność zakupionych biletów (normalnych lub ulgowych).
              </p>
            </div>
          </div>

          {/* Raporty z Kursów */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex gap-6">
            <div className="w-12 h-12 bg-blue-50 text-action rounded-2xl flex items-center justify-center shrink-0">
              <ClipboardList size={24} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-primary">Raportowanie Po Zakończeniu Trasy</h3>
              <p className="text-text-muted text-sm leading-relaxed">
                Po każdym odbytym kursie masz obowiązek wygenerować w systemie krótki raport z trasy. Należy w nim podać: faktyczną liczbę pasażerów na pokładzie, przebieg początkowy/końcowy oraz koszt paliwa lub litry dotankowane w drodze.
              </p>
            </div>
          </div>

          {/* Bezpieczeństwo i standardy */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex gap-6">
            <div className="w-12 h-12 bg-blue-50 text-action rounded-2xl flex items-center justify-center shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-primary">Standardy Bezpieczeństwa</h3>
              <p className="text-text-muted text-sm leading-relaxed">
                Twoim najważniejszym celem jest dbanie o bezpieczeństwo i komfort pasażerów. Zobowiązujesz się do bezwzględnego przestrzegania przepisów ruchu drogowego, limitów prędkości oraz dopuszczalnego czasu pracy kierowcy.
              </p>
            </div>
          </div>

        </div>

        {/* Pre-Trip Inspection Checklist Tool */}
        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-lg space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-primary flex items-center gap-2.5">
                <FileCheck2 className="text-action" size={26} />
                Przegląd Codzienny Pojazdu (OC)
              </h2>
              <p className="text-xs text-text-muted mt-1">Przed wyjazdem z bazy w trasę Kraków ↔ Katowice przeprowadź kontrolę stanu technicznego:</p>
            </div>
            <div className={`px-4 py-2 rounded-2xl text-xs font-bold self-start sm:self-center transition-all ${allChecked ? "bg-green-50 text-green-700 border border-green-100" : "bg-orange-50 text-orange-700 border border-orange-100"}`}>
              {allChecked ? "✔️ Pojazd gotowy do trasy" : "⚠️ Wymagana pełna weryfikacja"}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {checklistItems.map((item) => (
              <button
                key={item.key}
                onClick={() => toggleChecklistItem(item.key)}
                className={`flex items-start gap-3 p-4 rounded-2xl border text-left transition-all ${
                  checklist[item.key]
                    ? "bg-blue-50/50 border-action text-primary shadow-sm"
                    : "bg-gray-50/30 border-gray-100 text-text-muted hover:bg-gray-50/50"
                }`}
              >
                <div className={`mt-0.5 shrink-0 transition-colors ${checklist[item.key] ? "text-action" : "text-gray-300"}`}>
                  <CheckSquare size={20} fill={checklist[item.key] ? "currentColor" : "none"} className={checklist[item.key] ? "text-white" : ""} />
                </div>
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Action boxes depending on checklist */}
          {allChecked ? (
            <div className="p-4 bg-green-50 border border-green-100 text-green-800 text-xs rounded-2xl leading-relaxed flex gap-3">
              <ShieldCheck className="text-green-600 shrink-0 mt-0.5" size={18} />
              <div>
                <strong className="font-semibold block mb-0.5">Wszystkie testy zaliczone pomyślnie!</strong>
                Pojazd spełnia wymagania bezpieczeństwa i jest przygotowany do obsługi pasażerów na trasie. Pamiętaj o zabraniu w drogę dobrego humoru i życzliwości dla podróżnych.
              </div>
            </div>
          ) : (
            <div className="p-4 bg-orange-50 border border-orange-100 text-orange-800 text-xs rounded-2xl leading-relaxed flex gap-3">
              <AlertOctagon className="text-orange-600 shrink-0 mt-0.5" size={18} />
              <div>
                <strong className="font-semibold block mb-0.5">Procedura sprawdzania w toku:</strong>
                Upewnij się, że zweryfikowałeś każdy z powyższych punktów przed wejściem na pokład i rozpoczęciem podróży. Bezpieczeństwo Twoje i pasażerów jest dla nas priorytetem.
              </div>
            </div>
          )}

          {/* Report Malfunction */}
          <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
            <span className="text-text-muted flex items-center gap-1.5 font-medium"><Wrench size={16} className="text-gray-400" /> Zauważyłeś usterkę techniczną w pojeździe?</span>
            <button className="px-5 py-2.5 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 font-bold transition-all">
              Zgłoś usterkę do Serwisu Floty
            </button>
          </div>

        </div>

      </div>
    </main>
  );
}
