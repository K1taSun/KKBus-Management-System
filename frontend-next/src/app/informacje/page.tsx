import { MapPin, Phone, Mail, ShieldCheck, Bus } from "lucide-react";

export default function InformacjePage() {
  return (
    <main className="min-h-screen pt-24 pb-16 bg-background-main">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        
        {/* O firmie */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">O firmie KKBus</h1>
          <p className="text-lg text-text-muted max-w-3xl mx-auto leading-relaxed">
            KKBus to nowoczesna platforma transportowa zaprojektowana dla firmy <strong>KKBus sp. z o.o.</strong>, dedykowana szybkiej i komfortowej obsłudze pasażerów. Łączymy dwa kluczowe miasta południowej Polski: Kraków i Katowice, stawiając na innowacje, bezpieczeństwo oraz niezawodność.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          {/* Nasza Misja */}
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 flex flex-col items-start">
            <div className="w-14 h-14 bg-blue-50 text-action rounded-2xl flex items-center justify-center mb-6">
              <Bus size={28} />
            </div>
            <h2 className="text-2xl font-bold text-primary mb-4">Nasza Flota i Trasa</h2>
            <p className="text-text-muted leading-relaxed mb-4">
              Specjalizujemy się w przewozie osób na trasie <strong>Kraków ↔ Katowice</strong>. 
              Dzięki flocie nowoczesnych autokarów i busów, zapewniamy wysoki standard podróży. W przyszłości planujemy rozwinięcie naszej oferty o kolejne kierunki, jednak obecnie naszym priorytetem jest doskonała obsługa tej kluczowej linii.
            </p>
          </div>

          {/* System i Bezpieczeństwo */}
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 flex flex-col items-start">
            <div className="w-14 h-14 bg-blue-50 text-action rounded-2xl flex items-center justify-center mb-6">
              <ShieldCheck size={28} />
            </div>
            <h2 className="text-2xl font-bold text-primary mb-4">Innowacyjny System</h2>
            <p className="text-text-muted leading-relaxed">
              Korzystamy z autorskiego, zintegrowanego systemu zarządzania, który automatyzuje rezerwacje i wyklucza zjawisko tzw. <em>overbookingu</em> (sprzedaży większej liczby biletów niż miejsc). Oprogramowanie to zostało zaprojektowane by zagwarantować najwyższą jakość obsługi klienta.
            </p>
          </div>
        </div>

        {/* Kontakt */}
        <div className="bg-primary text-white rounded-3xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-8 md:p-12">
              <h2 className="text-3xl font-bold mb-8">Kontakt z Nami</h2>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <MapPin className="text-action mt-1" size={24} />
                  <div>
                    <strong className="block text-lg mb-1">Siedziba i biuro projektu</strong>
                    <span className="text-blue-100">
                      Katedra Informatyki Stosowanej M-7<br/>
                      Wydział Mechaniczny, Politechnika Krakowska im. T. Kościuszki<br/>
                      Al. Jana Pawła II 137, 31-864 Kraków
                    </span>
                  </div>
                </li>
                <li className="flex items-center gap-4">
                  <Phone className="text-action" size={24} />
                  <div>
                    <strong className="block text-lg mb-1">Telefon</strong>
                    <span className="text-blue-100">+48 (12) 628 36 30</span>
                  </div>
                </li>
                <li className="flex items-center gap-4">
                  <Mail className="text-action" size={24} />
                  <div>
                    <strong className="block text-lg mb-1">E-mail</strong>
                    <span className="text-blue-100">kontakt@kkbus.pl</span>
                  </div>
                </li>
              </ul>
            </div>
            <div className="bg-blue-900 p-8 md:p-12 flex flex-col justify-center">
              <h3 className="text-2xl font-bold mb-6">Godziny pracy infolinii</h3>
              <ul className="space-y-4">
                <li className="flex justify-between items-center border-b border-blue-800 pb-2">
                  <span className="text-blue-200">Poniedziałek - Piątek</span>
                  <span className="font-semibold">08:00 - 18:00</span>
                </li>
                <li className="flex justify-between items-center border-b border-blue-800 pb-2">
                  <span className="text-blue-200">Sobota</span>
                  <span className="font-semibold">09:00 - 15:00</span>
                </li>
                <li className="flex justify-between items-center pb-2">
                  <span className="text-blue-200">Niedziela i Święta</span>
                  <span className="font-semibold text-action">Nieczynne</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
