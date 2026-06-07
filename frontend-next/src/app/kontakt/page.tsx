"use client";

import { useState, useEffect } from "react";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Send, 
  CheckCircle,
  Clock,
  Sparkles,
  HelpCircle
} from "lucide-react";
import { useTranslation } from "@/lib/LanguageContext";

const localTranslations = {
  pl: {
    title: "Skontaktuj się z Nami",
    subtitle: "Masz pytania dotyczące podróży, biletów lub programu lojalnościowego? Napisz do nas lub zadzwoń. Chętnie pomożemy!",
    supportLabel: "Obsługa Klienta KKBus",
    daneKontaktowe: "Dane Kontaktowe",
    siedziba: "Siedziba Projektu",
    telefon: "Telefon",
    email: "E-mail",
    infolinia: "Godziny Pracy Infolinii",
    weekdays: "Poniedziałek - Piątek",
    saturday: "Sobota",
    sundays: "Niedziela i Święta",
    closed: "Nieczynne",
    faqTitle: "Szukasz szybkiej odpowiedzi?",
    faqDesc: "Większość pytań dotyczących rezerwacji, zwrotów i zniżek wyjaśniliśmy w naszym dziale pomocy.",
    faqBtn: "Przejdź do FAQ",
    formTitle: "Napisz do nas",
    formDesc: "Wypełnij poniższy formularz kontaktowy, a odpowiemy na Twoją wiadomość w ciągu 24 godzin.",
    sentTitle: "Wiadomość wysłana!",
    sentDesc: "Dziękujemy za kontakt. Twoje zgłoszenie zostało przesłane do odpowiedniego działu. Odpowiedź otrzymasz na podany adres e-mail.",
    sendNext: "Wyślij kolejną wiadomość",
    nameLabel: "Imię i Nazwisko",
    namePlh: "np. Jan Kowalski",
    emailLabel: "Adres E-mail",
    emailPlh: "np. jan.kowalski@example.com",
    subjectLabel: "Temat zapytania",
    subjectGeneral: "Zapytanie ogólne / Pomoc techniczna",
    subjectRes: "Bilety i Rezerwacje internetowe",
    subjectRefund: "Zwroty biletów i anulacje",
    subjectLoyalty: "Program Lojalnościowy",
    subjectBusiness: "Oferta biznesowa / Wynajem autokarów",
    messageLabel: "Treść Wiadomości",
    messagePlh: "Wpisz treść swojej wiadomości...",
    consent: "Wyrażam zgodę na przetwarzanie moich danych osobowych przez KKBus Sp. z o.o. w celu obsługi przesłanego zapytania kontaktowego zgodnie z Polityką Prywatności.",
    sendBtn: "Wyślij Wiadomość",
  },
  en: {
    title: "Contact Us",
    subtitle: "Do you have questions about travel, tickets or the loyalty program? Write to us or call. We are happy to help!",
    supportLabel: "KKBus Customer Service",
    daneKontaktowe: "Contact Details",
    siedziba: "Project Headquarters",
    telefon: "Phone",
    email: "E-mail",
    infolinia: "Helpline Business Hours",
    weekdays: "Monday - Friday",
    saturday: "Saturday",
    sundays: "Sunday and Holidays",
    closed: "Closed",
    faqTitle: "Looking for a quick answer?",
    faqDesc: "Most questions regarding reservations, refunds and discounts are explained in our help section.",
    faqBtn: "Go to FAQ",
    formTitle: "Write to us",
    formDesc: "Fill out the contact form below and we will reply to your message within 24 hours.",
    sentTitle: "Message sent!",
    sentDesc: "Thank you for contacting us. Your request has been forwarded to the appropriate department. You will receive a reply to the email address provided.",
    sendNext: "Send another message",
    nameLabel: "First & Last Name",
    namePlh: "e.g. John Doe",
    emailLabel: "Email Address",
    emailPlh: "e.g. john.doe@example.com",
    subjectLabel: "Subject of inquiry",
    subjectGeneral: "General inquiry / Technical support",
    subjectRes: "Tickets and online reservations",
    subjectRefund: "Ticket refunds and cancellations",
    subjectLoyalty: "Loyalty Program",
    subjectBusiness: "Business offer / Coach rental",
    messageLabel: "Message Content",
    messagePlh: "Type the content of your message...",
    consent: "I consent to the processing of my personal data by KKBus Sp. z o.o. for the purpose of handling the submitted contact inquiry in accordance with the Privacy Policy.",
    sendBtn: "Send Message",
  }
};

export default function KontaktPage() {
  const { language } = useTranslation();
  const tLocal = localTranslations[language] || localTranslations["pl"];

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("general");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    document.title = language === "pl" ? "Kontakt - KKBus" : "Contact Us - KKBus";
  }, [language]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    
    // In production we would send contact request to backend API
    setSubmitted(true);
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <main className="min-h-screen pt-24 pb-16 bg-background-alt">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-action mb-4 text-sm font-semibold">
            <Sparkles size={16} className="animate-pulse" />
            <span>{tLocal.supportLabel}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">{tLocal.title}</h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            {tLocal.subtitle}
          </p>
        </div>

        {/* Contact Info & Form Split */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Info Details (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-primary text-white rounded-3xl p-8 shadow-xl space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl transform translate-x-12 -translate-y-12"></div>
              
              <h2 className="text-2xl font-bold border-b border-white/10 pb-4">{tLocal.daneKontaktowe}</h2>
              
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <MapPin className="text-action mt-1 shrink-0" size={24} />
                  <div>
                    <strong className="block text-base mb-1">{tLocal.siedziba}</strong>
                    <span className="text-blue-100 text-sm leading-relaxed block">
                      Katedra Informatyki Stosowanej M-7<br/>
                      Wydział Mechaniczny<br/>
                      Politechnika Krakowska im. T. Kościuszki<br/>
                      Al. Jana Pawła II 137, 31-864 Kraków
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <Phone className="text-action mt-0.5 shrink-0" size={24} />
                  <div>
                    <strong className="block text-base mb-1">{tLocal.telefon}</strong>
                    <span className="text-blue-100 text-sm block">+48 (12) 628 36 30</span>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <Mail className="text-action mt-0.5 shrink-0" size={24} />
                  <div>
                    <strong className="block text-base mb-1">{tLocal.email}</strong>
                    <span className="text-blue-100 text-sm block">kontakt@kkbus.pl</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Infolinia hours */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-md space-y-4">
              <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                <Clock size={20} className="text-action" />
                {tLocal.infolinia}
              </h3>
              <div className="space-y-3 text-sm text-text-muted">
                <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                  <span>{tLocal.weekdays}</span>
                  <span className="font-semibold text-primary">08:00 - 18:00</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                  <span>{tLocal.saturday}</span>
                  <span className="font-semibold text-primary">09:00 - 15:00</span>
                </div>
                <div className="flex justify-between items-center pb-1">
                  <span>{tLocal.sundays}</span>
                  <span className="font-bold text-red-500">{tLocal.closed}</span>
                </div>
              </div>
            </div>

            {/* Quick FAQ pointer */}
            <div className="bg-blue-50/50 rounded-3xl p-6 border border-blue-100 text-center space-y-3">
              <HelpCircle className="text-action mx-auto" size={28} />
              <h4 className="font-bold text-primary text-sm">{tLocal.faqTitle}</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                {tLocal.faqDesc}
              </p>
              <a 
                href="/faq" 
                className="inline-block px-5 py-2 rounded-xl bg-white border border-gray-200 text-primary hover:border-action font-bold text-xs transition-colors"
              >
                {tLocal.faqBtn}
              </a>
            </div>

          </div>

          {/* Form (3 cols) */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-lg space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-primary">{tLocal.formTitle}</h2>
                <p className="text-xs text-text-muted mt-1">{tLocal.formDesc}</p>
              </div>

              {submitted ? (
                <div className="p-8 bg-blue-50 border border-blue-100 rounded-3xl text-center space-y-4">
                  <div className="w-16 h-16 bg-action text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-primary">{tLocal.sentTitle}</h3>
                  <p className="text-sm text-text-muted leading-relaxed max-w-sm mx-auto">
                    {tLocal.sentDesc}
                  </p>
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="text-xs font-semibold text-action hover:underline"
                  >
                    {tLocal.sendNext}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-primary mb-1.5 uppercase">{tLocal.nameLabel}</label>
                      <input
                        type="text"
                        required
                        placeholder={tLocal.namePlh}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-action transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-primary mb-1.5 uppercase">{tLocal.emailLabel}</label>
                      <input
                        type="email"
                        required
                        placeholder={tLocal.emailPlh}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-action transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-primary mb-1.5 uppercase">{tLocal.subjectLabel}</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-action transition-all text-text-main font-medium bg-gray-50/50"
                    >
                      <option value="general">{tLocal.subjectGeneral}</option>
                      <option value="reservation">{tLocal.subjectRes}</option>
                      <option value="refund">{tLocal.subjectRefund}</option>
                      <option value="loyalty">{tLocal.subjectLoyalty}</option>
                      <option value="business">{tLocal.subjectBusiness}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-primary mb-1.5 uppercase">{tLocal.messageLabel}</label>
                    <textarea
                      required
                      placeholder={tLocal.messagePlh}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={5}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-action transition-all resize-none"
                    />
                  </div>

                  <div className="flex items-start gap-2.5 text-[10px] text-text-muted leading-relaxed">
                    <input type="checkbox" required className="mt-0.5 rounded" />
                    <span>{tLocal.consent}</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-action hover:bg-action-hover text-white font-bold transition-all shadow-md shadow-action/25 flex items-center justify-center gap-2 text-sm"
                  >
                    <Send size={16} /> {tLocal.sendBtn}
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
