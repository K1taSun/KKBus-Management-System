import { Shield, Eye, Lock, UserCheck } from "lucide-react";

export default function PolitykaPrywatnosciPage() {
  return (
    <main className="min-h-screen pt-24 pb-16 bg-background-alt">
      <div className="container mx-auto px-4 md:px-6 max-w-3xl">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-action mb-4 text-sm font-semibold">
            <Shield size={16} />
            <span>Ochrona Danych</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">Polityka Prywatności</h1>
          <p className="text-base text-text-muted">
            Maksymalnie uproszczone zasady przetwarzania i ochrony Twoich danych osobowych w systemie KKBus.
          </p>
        </div>

        {/* Simplified Cards Layout */}
        <div className="space-y-6">
          
          {/* Admin */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm flex gap-4 md:gap-6">
            <div className="w-10 h-10 bg-blue-50 text-action rounded-xl flex items-center justify-center shrink-0">
              <Shield size={20} />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-primary">Kto zarządza Twoimi danymi?</h2>
              <p className="text-sm text-text-muted leading-relaxed">
                Administratorem danych jest firma <strong>KKBus Sp. z o.o.</strong> z siedzibą w Krakowie. Wszelkie pytania możesz kierować na adres: <strong className="text-primary">rodo@kkbus.pl</strong>.
              </p>
            </div>
          </div>

          {/* Scope */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm flex gap-4 md:gap-6">
            <div className="w-10 h-10 bg-blue-50 text-action rounded-xl flex items-center justify-center shrink-0">
              <Eye size={20} />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-primary">Po co i jakie dane zbieramy?</h2>
              <p className="text-sm text-text-muted leading-relaxed">
                Zbieramy wyłącznie podstawowe dane niezbędne do realizacji Twojej podróży:
              </p>
              <ul className="list-disc pl-5 text-sm text-text-muted space-y-1">
                <li>Imię i nazwisko, e-mail oraz telefon – do wystawienia biletu i wysłania rezerwacji.</li>
                <li>Dystans podróży – do automatycznego naliczania punktów lojalnościowych.</li>
              </ul>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm flex gap-4 md:gap-6">
            <div className="w-10 h-10 bg-blue-50 text-action rounded-xl flex items-center justify-center shrink-0">
              <Lock size={20} />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-primary">Jak chronimy Twoje dane?</h2>
              <p className="text-sm text-text-muted leading-relaxed">
                Stosujemy najwyższe standardy bezpieczeństwa IT:
              </p>
              <ul className="list-disc pl-5 text-sm text-text-muted space-y-1">
                <li>Połączenie ze stroną jest w pełni szyfrowane certyfikatem <strong>HTTPS/SSL</strong>.</li>
                <li>Hasła kont pasażerów są jednostronnie hashowane kryptograficznie (są nieznane administratorom).</li>
                <li>System blokuje dostęp do konta po 3 nieudanych próbach logowania.</li>
              </ul>
            </div>
          </div>

          {/* Rights */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm flex gap-4 md:gap-6">
            <div className="w-10 h-10 bg-blue-50 text-action rounded-xl flex items-center justify-center shrink-0">
              <UserCheck size={20} />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-primary">Jakie masz prawa?</h2>
              <p className="text-sm text-text-muted leading-relaxed">
                Masz pełną kontrolę nad swoimi danymi. W każdej chwili możesz edytować swój profil w panelu klienta lub napisać na <strong className="text-primary">rodo@kkbus.pl</strong>, aby:
              </p>
              <ul className="list-disc pl-5 text-sm text-text-muted space-y-1">
                <li>Otrzymać wgląd w swoje dane osobowe.</li>
                <li>Całkowicie usunąć swoje konto pasażera („prawo do bycia zapomnianym”).</li>
              </ul>
            </div>
          </div>

        </div>

        {/* Short footer call to action */}
        <div className="mt-12 text-center text-xs text-text-muted">
          Ostatnia aktualizacja: 28 maja 2026 r. KKBus sp. z o.o.
        </div>

      </div>
    </main>
  );
}
