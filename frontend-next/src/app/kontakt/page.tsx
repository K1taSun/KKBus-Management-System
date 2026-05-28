"use client";

import { useState } from "react";
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

export default function KontaktPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("general");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

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
            <span>Obsługa Klienta KKBus</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">Skontaktuj się z Nami</h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            Masz pytania dotyczące podróży, biletów lub programu lojalnościowego? Napisz do nas lub zadzwoń. Chętnie pomożemy!
          </p>
        </div>

        {/* Contact Info & Form Split */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Info Details (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-primary text-white rounded-3xl p-8 shadow-xl space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl transform translate-x-12 -translate-y-12"></div>
              
              <h2 className="text-2xl font-bold border-b border-white/10 pb-4">Dane Kontaktowe</h2>
              
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <MapPin className="text-action mt-1 shrink-0" size={24} />
                  <div>
                    <strong className="block text-base mb-1">Siedziba Projektu</strong>
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
                    <strong className="block text-base mb-1">Telefon</strong>
                    <span className="text-blue-100 text-sm block">+48 (12) 628 36 30</span>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <Mail className="text-action mt-0.5 shrink-0" size={24} />
                  <div>
                    <strong className="block text-base mb-1">E-mail</strong>
                    <span className="text-blue-100 text-sm block">kontakt@kkbus.pl</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Infolinia hours */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-md space-y-4">
              <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                <Clock size={20} className="text-action" />
                Godziny Pracy Infolinii
              </h3>
              <div className="space-y-3 text-sm text-text-muted">
                <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                  <span>Poniedziałek - Piątek</span>
                  <span className="font-semibold text-primary">08:00 - 18:00</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                  <span>Sobota</span>
                  <span className="font-semibold text-primary">09:00 - 15:00</span>
                </div>
                <div className="flex justify-between items-center pb-1">
                  <span>Niedziela i Święta</span>
                  <span className="font-bold text-red-500">Nieczynne</span>
                </div>
              </div>
            </div>

            {/* Quick FAQ pointer */}
            <div className="bg-blue-50/50 rounded-3xl p-6 border border-blue-100 text-center space-y-3">
              <HelpCircle className="text-action mx-auto" size={28} />
              <h4 className="font-bold text-primary text-sm">Szukasz szybkiej odpowiedzi?</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                Większość pytań dotyczących rezerwacji, zwrotów i zniżek wyjaśniliśmy w naszym dziale pomocy.
              </p>
              <a 
                href="/faq" 
                className="inline-block px-5 py-2 rounded-xl bg-white border border-gray-200 text-primary hover:border-action font-bold text-xs transition-colors"
              >
                Przejdź do FAQ
              </a>
            </div>

          </div>

          {/* Form (3 cols) */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-lg space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-primary">Napisz do nas</h2>
                <p className="text-xs text-text-muted mt-1">Wypełnij poniższy formularz kontaktowy, a odpowiemy na Twoją wiadomość w ciągu 24 godzin.</p>
              </div>

              {submitted ? (
                <div className="p-8 bg-blue-50 border border-blue-100 rounded-3xl text-center space-y-4">
                  <div className="w-16 h-16 bg-action text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-primary">Wiadomość wysłana!</h3>
                  <p className="text-sm text-text-muted leading-relaxed max-w-sm mx-auto">
                    Dziękujemy za kontakt. Twoje zgłoszenie zostało przesłane do odpowiedniego działu. Odpowiedź otrzymasz na podany adres e-mail.
                  </p>
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="text-xs font-semibold text-action hover:underline"
                  >
                    Wyślij kolejną wiadomość
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-primary mb-1.5 uppercase">Temat zapytania</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-action transition-all text-text-main font-medium bg-gray-50/50"
                    >
                      <option value="general">Zapytanie ogólne / Pomoc techniczna</option>
                      <option value="reservation">Bilety i Rezerwacje internetowe</option>
                      <option value="refund">Zwroty biletów i anulacje</option>
                      <option value="loyalty">Program Lojalnościowy</option>
                      <option value="business">Oferta biznesowa / Wynajem autokarów</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-primary mb-1.5 uppercase">Treść Wiadomości</label>
                    <textarea
                      required
                      placeholder="Wpisz treść swojej wiadomości..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={5}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-action transition-all resize-none"
                    />
                  </div>

                  <div className="flex items-start gap-2.5 text-[10px] text-text-muted leading-relaxed">
                    <input type="checkbox" required className="mt-0.5 rounded" />
                    <span>Wyrażam zgodę na przetwarzanie moich danych osobowych przez KKBus Sp. z o.o. w celu obsługi przesłanego zapytania kontaktowego zgodnie z Polityką Prywatności.</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-action hover:bg-action-hover text-white font-bold transition-all shadow-md shadow-action/25 flex items-center justify-center gap-2 text-sm"
                  >
                    <Send size={16} /> Wyślij Wiadomość
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
