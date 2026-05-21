import { CheckCircle2 } from "lucide-react";

export default function CennikPage() {
  return (
    <main className="min-h-screen pt-24 pb-16 bg-background-main">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6 text-center">Cennik Biletów</h1>
        <p className="text-lg text-text-muted text-center mb-12">
          Przejrzyste ceny na trasie Kraków ↔ Katowice. Żadnych ukrytych opłat.
        </p>

        {/* Cennik Bazowy */}
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10 mb-12 border border-gray-100">
          <h2 className="text-2xl font-bold text-primary mb-6 border-b pb-4">Bilety Jednorazowe</h2>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-text-main mb-2">Trasa Kraków ↔ Katowice</h3>
              <p className="text-text-muted">Bilet normalny w jedną stronę, obowiązuje na wszystkie kursy w danym dniu.</p>
            </div>
            <div className="text-center md:text-right">
              <span className="text-4xl font-bold text-action">20 PLN</span>
            </div>
          </div>
        </div>

        {/* Zniżki */}
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10 mb-12 border border-gray-100">
          <h2 className="text-2xl font-bold text-primary mb-6 border-b pb-4">Zniżki Ustawowe i Regulaminowe</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100">
              <h3 className="text-lg font-bold text-primary mb-2">Student</h3>
              <p className="text-3xl font-bold text-action mb-2">-51%</p>
              <p className="text-sm text-text-muted">Za okazaniem ważnej legitymacji studenckiej.</p>
            </div>
            <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100">
              <h3 className="text-lg font-bold text-primary mb-2">Uczeń</h3>
              <p className="text-3xl font-bold text-action mb-2">-37%</p>
              <p className="text-sm text-text-muted">Dla uczniów do 24. roku życia z legitymacją szkolną.</p>
            </div>
            <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100">
              <h3 className="text-lg font-bold text-primary mb-2">Dziecko</h3>
              <p className="text-3xl font-bold text-action mb-2">-100%</p>
              <p className="text-sm text-text-muted">Dzieci do lat 4 podróżujące na kolanach opiekuna jadą bezpłatnie.</p>
            </div>
          </div>
        </div>

        {/* Program Lojalnościowy */}
        <div className="bg-gradient-to-r from-primary to-blue-900 rounded-3xl shadow-xl p-6 md:p-10 text-white flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-4">Program Lojalnościowy KKBus</h2>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="text-action" size={20} />
                <span><strong className="text-action">1 przejechany kilometr = 1 punkt</strong> na Twoim koncie.</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="text-action" size={20} />
                <span>Wymieniaj punkty na darmowe bilety i zniżki procentowe.</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="text-action" size={20} />
                <span>Punkty naliczają się automatycznie po zakończonym przejeździe.</span>
              </li>
            </ul>
          </div>
          <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/20 text-center w-full md:w-auto">
            <p className="text-sm font-medium mb-2 text-blue-200">Załóż konto i odbierz na start</p>
            <p className="text-4xl font-bold text-white mb-2">+100 pkt</p>
            <p className="text-xs text-blue-200">na pierwszą podróż</p>
          </div>
        </div>
      </div>
    </main>
  );
}
