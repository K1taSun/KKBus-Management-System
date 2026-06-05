"use client";

import { useEffect } from "react";
import { Shield, Eye, Lock, UserCheck } from "lucide-react";
import { useTranslation } from "@/lib/LanguageContext";

const localTranslations = {
  pl: {
    badge: "Ochrona Danych",
    title: "Polityka Prywatności",
    subtitle: "Maksymalnie uproszczone zasady przetwarzania i ochrony Twoich danych osobowych w systemie KKBus.",
    q1: "Kto zarządza Twoimi danymi?",
    a1: "Administratorem danych jest firma KKBus Sp. z o.o. z siedzibą w Krakowie. Wszelkie pytania możesz kierować na adres: rodo@kkbus.pl.",
    q2: "Po co i jakie dane zbieramy?",
    a2: "Zbieramy wyłącznie podstawowe dane niezbędne do realizacji Twojej podróży:",
    ul2_1: "Imię i nazwisko, e-mail oraz telefon – do wystawienia biletu i wysłania rezerwacji.",
    ul2_2: "Dystans podróży – do automatycznego naliczania punktów lojalnościowych.",
    q3: "Jak chronimy Twoje dane?",
    a3: "Stosujemy najwyższe standardy bezpieczeństwa IT:",
    ul3_1: "Połączenie ze stroną jest w pełni szyfrowane certyfikatem HTTPS/SSL.",
    ul3_2: "Hasła kont pasażerów są jednostronnie hashowane kryptograficznie (są nieznane administratorom).",
    ul3_3: "System blokuje dostęp do konta po 3 nieudanych próbach logowania.",
    q4: "Jakie masz prawa?",
    a4: "Masz pełną kontrolę nad swoimi danymi. W każdej chwili możesz edytować swój profil w panelu klienta lub napisać na rodo@kkbus.pl, aby:",
    ul4_1: "Otrzymać wgląd w swoje dane osobowe.",
    ul4_2: "Całkowicie usunąć swoje konto pasażera („prawo do bycia zapomnianym”).",
    footerText: "Ostatnia aktualizacja: 28 maja 2026 r. KKBus sp. z o.o."
  },
  en: {
    badge: "Data Protection",
    title: "Privacy Policy",
    subtitle: "Maximum simplified rules for the processing and protection of your personal data in the KKBus system.",
    q1: "Who manages your data?",
    a1: "The data administrator is KKBus Sp. z o.o. with its registered office in Kraków. You can direct any questions to: rodo@kkbus.pl.",
    q2: "Why and what data do we collect?",
    a2: "We only collect basic data necessary to carry out your trip:",
    ul2_1: "First and last name, email, and phone – to issue the ticket and send the reservation.",
    ul2_2: "Travel distance – for automatic calculation of loyalty points.",
    q3: "How do we protect your data?",
    a3: "We apply the highest IT security standards:",
    ul3_1: "The connection to the website is fully encrypted with an HTTPS/SSL certificate.",
    ul3_2: "Passenger account passwords are one-way cryptographically hashed (unknown to administrators).",
    ul3_3: "The system blocks account access after 3 failed login attempts.",
    q4: "What are your rights?",
    a4: "You have full control over your data. At any time you can edit your profile in the customer panel or write to rodo@kkbus.pl to:",
    ul4_1: "Access your personal data.",
    ul4_2: "Completely delete your passenger account ('right to be forgotten').",
    footerText: "Last update: May 28, 2026. KKBus sp. z o.o."
  }
};

export default function PolitykaPrywatnosciPage() {
  const { language } = useTranslation();
  const tLocal = localTranslations[language] || localTranslations["pl"];

  useEffect(() => {
    document.title = language === "pl" ? "Polityka Prywatności - KKBus" : "Privacy Policy - KKBus";
  }, [language]);

  return (
    <main className="min-h-screen pt-24 pb-16 bg-background-alt">
      <div className="container mx-auto px-4 md:px-6 max-w-3xl">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-action mb-4 text-sm font-semibold">
            <Shield size={16} />
            <span>{tLocal.badge}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">{tLocal.title}</h1>
          <p className="text-base text-text-muted">
            {tLocal.subtitle}
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
              <h2 className="text-lg font-bold text-primary">{tLocal.q1}</h2>
              <p className="text-sm text-text-muted leading-relaxed">
                {tLocal.a1}
              </p>
            </div>
          </div>

          {/* Scope */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm flex gap-4 md:gap-6">
            <div className="w-10 h-10 bg-blue-50 text-action rounded-xl flex items-center justify-center shrink-0">
              <Eye size={20} />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-primary">{tLocal.q2}</h2>
              <p className="text-sm text-text-muted leading-relaxed">
                {tLocal.a2}
              </p>
              <ul className="list-disc pl-5 text-sm text-text-muted space-y-1">
                <li>{tLocal.ul2_1}</li>
                <li>{tLocal.ul2_2}</li>
              </ul>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm flex gap-4 md:gap-6">
            <div className="w-10 h-10 bg-blue-50 text-action rounded-xl flex items-center justify-center shrink-0">
              <Lock size={20} />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-primary">{tLocal.q3}</h2>
              <p className="text-sm text-text-muted leading-relaxed">
                {tLocal.a3}
              </p>
              <ul className="list-disc pl-5 text-sm text-text-muted space-y-1">
                <li>{tLocal.ul3_1}</li>
                <li>{tLocal.ul3_2}</li>
                <li>{tLocal.ul3_3}</li>
              </ul>
            </div>
          </div>

          {/* Rights */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm flex gap-4 md:gap-6">
            <div className="w-10 h-10 bg-blue-50 text-action rounded-xl flex items-center justify-center shrink-0">
              <UserCheck size={20} />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-primary">{tLocal.q4}</h2>
              <p className="text-sm text-text-muted leading-relaxed">
                {tLocal.a4}
              </p>
              <ul className="list-disc pl-5 text-sm text-text-muted space-y-1">
                <li>{tLocal.ul4_1}</li>
                <li>{tLocal.ul4_2}</li>
              </ul>
            </div>
          </div>

        </div>

        {/* Short footer call to action */}
        <div className="mt-12 text-center text-xs text-text-muted">
          {tLocal.footerText}
        </div>

      </div>
    </main>
  );
}
