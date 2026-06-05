"use client";

import { useEffect, useState } from "react";
import { X, Trash2, ShoppingCart, Mail, User, Phone, Download, Printer, Loader2, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/CartContext";
import { useTranslation } from "@/lib/LanguageContext";
import { apiGet, apiPost } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const localTranslations = {
  pl: {
    cartTitle: "Twój Koszyk",
    emptyCart: "Twój koszyk jest pusty",
    seatsLabel: "Miejsca",
    priceLabel: "Cena",
    removeBtn: "Usuń",
    totalPrice: "Suma do zapłaty",
    checkoutGuestTitle: "Dane pasażera (zakup gościa)",
    firstName: "Imię",
    firstNamePlaceholder: "np. Jan",
    lastName: "Nazwisko",
    lastNamePlaceholder: "np. Kowalski",
    email: "Adres e-mail",
    emailPlaceholder: "np. jan.kowalski@example.pl",
    phone: "Numer telefonu",
    phonePlaceholder: "np. +48600100200",
    checkoutBtn: "Opłać i rezerwuj",
    checkoutGuestBtn: "Opłać jako gość",
    loading: "Przetwarzanie...",
    successTitle: "Transakcja zakończona! 🎉",
    successSubtitle: "Pomyślnie zarezerwowano bilety w systemie KKBus.",
    downloadTicket: "Pobierz bilet (TXT)",
    printTicket: "Drukuj",
    closeBtn: "Zamknij",
    loggedInAs: "Konto zalogowane:",
    ticketDetail: "Bilet elektroniczny",
  },
  en: {
    cartTitle: "Your Shopping Cart",
    emptyCart: "Your cart is empty",
    seatsLabel: "Seats",
    priceLabel: "Price",
    removeBtn: "Remove",
    totalPrice: "Total Amount",
    checkoutGuestTitle: "Passenger Details (Guest)",
    firstName: "First Name",
    firstNamePlaceholder: "e.g. John",
    lastName: "Last Name",
    lastNamePlaceholder: "e.g. Doe",
    email: "Email Address",
    emailPlaceholder: "e.g. john.doe@example.com",
    phone: "Phone Number",
    phonePlaceholder: "e.g. +48600100200",
    checkoutBtn: "Confirm & Purchase",
    checkoutGuestBtn: "Purchase as Guest",
    loading: "Processing...",
    successTitle: "Purchase Completed! 🎉",
    successSubtitle: "Tickets successfully booked in the KKBus system.",
    downloadTicket: "Download Ticket (TXT)",
    printTicket: "Print Ticket",
    closeBtn: "Close",
    loggedInAs: "Authenticated as:",
    ticketDetail: "Electronic Ticket",
  }
};

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  clientNumber: string;
}

export function CartDrawer() {
  const { cartItems, isCartOpen, setCartOpen, removeFromCart, clearCart } = useCart();
  const { t, language } = useTranslation();
  const tLocal = localTranslations[language] || localTranslations["pl"];

  // Authenticated user state
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Guest checkout state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Processing checkout states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [purchaseResults, setPurchaseResults] = useState<any[] | null>(null);
  const [checkoutClientNumber, setCheckoutClientNumber] = useState("");
  const [checkoutEmail, setCheckoutEmail] = useState("");

  // Fetch session on drawer open
  useEffect(() => {
    if (isCartOpen) {
      setError(null);
      setPurchaseResults(null);
      apiGet<UserProfile>("/auth/profile")
        .then((data) => setProfile(data))
        .catch(() => setProfile(null));
    }
  }, [isCartOpen]);

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.seats.length), 0);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    setLoading(true);
    setError(null);

    const results: any[] = [];
    let clientNum = profile?.clientNumber || "";
    let clientMail = profile?.email || email;

    try {
      if (profile) {
        // Logged in checkout
        for (const item of cartItems) {
          const res = await apiPost<{ message: string; reservationIds: string[] }>("/reservations", {
            scheduleId: item.scheduleId,
            seatNumbers: item.seats,
          });
          results.push({
            ...item,
            reservationIds: res.reservationIds,
            guestName: `${profile.firstName} ${profile.lastName}`,
          });
        }
      } else {
        // Guest checkout
        if (!firstName || !lastName || !email || !phone) {
          throw new Error("Wszystkie dane pasażera są wymagane do zakupu jako gość.");
        }

        for (const item of cartItems) {
          const res = await apiPost<{ message: string; clientNumber: string; email: string; reservationIds: string[] }>(
            "/reservations/guest",
            {
              scheduleId: item.scheduleId,
              seatNumbers: item.seats,
              email,
              first_name: firstName,
              last_name: lastName,
              phone,
            }
          );
          clientNum = res.clientNumber;
          clientMail = res.email;
          results.push({
            ...item,
            reservationIds: res.reservationIds,
            guestName: `${firstName} ${lastName}`,
          });
        }
      }

      setCheckoutClientNumber(clientNum);
      setCheckoutEmail(clientMail);
      setPurchaseResults(results);
      clearCart();
    } catch (err: any) {
      setError(err.message || "Błąd podczas składania rezerwacji.");
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString(language === "pl" ? "pl-PL" : "en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDownloadTXT = (ticket: any) => {
    const content = `========================================
                 KKBUS TICKET
========================================
Klient / Client: ${ticket.guestName || "Pasażer KKBus"}
E-mail: ${checkoutEmail}
Numer Klienta / Client No: ${checkoutClientNumber || "KKB-GUEST"}
Trasa / Route: ${ticket.routeName}
Odjazd / Departure: ${formatDateTime(ticket.departureTime)}
Miejsca / Seats: ${ticket.seats.join(", ")}
Suma / Total: ${(ticket.seats.length * ticket.price).toFixed(2)} PLN
Status: OPŁACONY / CONFIRMED
ID Rezerwacji / Booking ID: ${ticket.reservationIds.join(", ")}
========================================
Życzymy przyjemnej podróży! KKBus sp. z o.o.
Barcode: *KKB-${ticket.reservationIds[0]?.substring(0,8)}*
========================================`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `KKBus_Bilet_${ticket.reservationIds[0]?.substring(0,8)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = (ticket: any) => {
    const printContent = `
      <html>
        <head>
          <title>Drukuj bilet KKBus</title>
          <style>
            body { font-family: monospace; padding: 20px; color: #333; max-width: 400px; margin: 0 auto; border: 1px dashed #ccc; }
            .header { text-align: center; font-weight: bold; font-size: 16px; margin-bottom: 20px; border-bottom: 2px dashed #000; padding-bottom: 10px; }
            .row { display: flex; justify-content: space-between; margin: 8px 0; }
            .label { font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; border-top: 2px dashed #000; padding-top: 15px; font-size: 12px; }
            .barcode { font-size: 10px; margin-top: 5px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            🚌 KKBus MDA Dworzec<br>BILET ELEKTRONICZNY
          </div>
          <div class="row"><span class="label">Pasażer:</span><span>${ticket.guestName || "Klient KKBus"}</span></div>
          <div class="row"><span class="label">E-mail:</span><span>${checkoutEmail}</span></div>
          <div class="row"><span class="label">Numer klienta:</span><span>${checkoutClientNumber || "KKB-GUEST"}</span></div>
          <div class="row"><span class="label">Trasa:</span><span>${ticket.routeName}</span></div>
          <div class="row"><span class="label">Odjazd:</span><span>${formatDateTime(ticket.departureTime)}</span></div>
          <div class="row"><span class="label">Miejsca:</span><span>${ticket.seats.join(", ")}</span></div>
          <div class="row"><span class="label">Cena:</span><span>${(ticket.seats.length * ticket.price).toFixed(2)} PLN</span></div>
          <div class="footer">
            Życzymy bezpiecznej podróży!<br>
            Dziękujemy za wybranie KKBus.
            <div class="barcode">ID: ${ticket.reservationIds[0]}</div>
          </div>
        </body>
      </html>
    `;
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(printContent);
      win.document.close();
      // Wait for rendering then trigger print
      setTimeout(() => win.print(), 500);
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-[90] transition-opacity duration-300"
          onClick={() => {
            if (!loading) setCartOpen(false);
          }}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[100] transition-all duration-300 ease-in-out transform flex flex-col ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-primary text-white">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} className="text-action" />
            <h3 className="font-bold text-lg">{tLocal.cartTitle}</h3>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            disabled={loading}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors text-white disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5">
          {purchaseResults ? (
            /* SUCCESS STATE */
            <div className="space-y-6 py-4 animate-fade-in">
              <div className="text-center space-y-2">
                <h4 className="text-xl font-bold text-emerald-600">{tLocal.successTitle}</h4>
                <p className="text-xs text-text-muted px-4">{tLocal.successSubtitle}</p>
              </div>

              <div className="space-y-4">
                {purchaseResults.map((ticket, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-action">
                          {tLocal.ticketDetail}
                        </span>
                        <h5 className="font-bold text-primary text-sm mt-0.5">{ticket.routeName}</h5>
                      </div>
                      <span className="font-mono text-xs font-bold text-primary">
                        {(ticket.seats.length * ticket.price).toFixed(2)} PLN
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-text-muted">
                      <p>
                        {language === "pl" ? "Odjazd" : "Departure"}:{" "}
                        <span className="font-semibold text-primary">{formatDateTime(ticket.departureTime)}</span>
                      </p>
                      <p>
                        {tLocal.seatsLabel}:{" "}
                        <span className="font-semibold text-primary">{ticket.seats.join(", ")}</span>
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadTXT(ticket)}
                        className="text-xs border-gray-300 hover:bg-gray-100 flex items-center justify-center gap-1.5 h-9"
                      >
                        <Download size={13} />
                        {tLocal.downloadTicket}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePrint(ticket)}
                        className="text-xs border-gray-300 hover:bg-gray-100 flex items-center justify-center gap-1.5 h-9"
                      >
                        <Printer size={13} />
                        {tLocal.printTicket}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => {
                  setPurchaseResults(null);
                  setCartOpen(false);
                }}
                className="w-full bg-primary hover:bg-primary-light text-white py-5 rounded-xl font-bold"
              >
                {tLocal.closeBtn}
              </Button>
            </div>
          ) : cartItems.length === 0 ? (
            /* EMPTY CART */
            <div className="h-full flex flex-col items-center justify-center text-center text-text-muted gap-3 py-10 animate-fade-in">
              <ShoppingCart size={48} className="text-gray-300" />
              <p className="font-medium">{tLocal.emptyCart}</p>
            </div>
          ) : (
            /* ITEMS LIST & CHECKOUT FORM */
            <div className="space-y-6 animate-fade-in">
              {/* Items */}
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-start p-3.5 border border-gray-100 rounded-xl bg-background-alt hover:shadow-sm transition-shadow relative overflow-hidden"
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <h4 className="font-bold text-primary text-sm truncate">{item.routeName}</h4>
                      <p className="text-xs text-text-muted mt-1">{formatDateTime(item.departureTime)}</p>
                      <p className="text-xs text-text-muted mt-1.5">
                        {tLocal.seatsLabel}: <span className="font-mono text-primary font-bold">{item.seats.join(", ")}</span>
                      </p>
                    </div>
                    <div className="text-right shrink-0 flex flex-col items-end justify-between h-full gap-4">
                      <span className="font-semibold text-sm text-primary">
                        {(item.price * item.seats.length).toFixed(2)} PLN
                      </span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        disabled={loading}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        title={tLocal.removeBtn}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Checkout Form */}
              <form onSubmit={handleCheckout} className="border-t border-gray-100 pt-5 space-y-4">
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs border border-red-100 font-medium">
                    {error}
                  </div>
                )}

                {profile ? (
                  /* Logged In Info */
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-xs text-emerald-800 space-y-1">
                    <p className="font-bold uppercase tracking-wider">{tLocal.loggedInAs}</p>
                    <p className="font-semibold text-sm text-emerald-950">
                      {profile.firstName} {profile.lastName}
                    </p>
                    <p>{profile.email}</p>
                  </div>
                ) : (
                  /* Guest Details Inputs */
                  <div className="space-y-3">
                    <h5 className="font-bold text-primary text-sm mb-1">{tLocal.checkoutGuestTitle}</h5>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-text-muted uppercase ml-0.5">
                          {tLocal.firstName}
                        </label>
                        <Input
                          type="text"
                          required
                          placeholder={tLocal.firstNamePlaceholder}
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="h-10 text-xs rounded-lg border-gray-200"
                          disabled={loading}
                          icon={<User size={13} className="text-gray-400" />}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-text-muted uppercase ml-0.5">
                          {tLocal.lastName}
                        </label>
                        <Input
                          type="text"
                          required
                          placeholder={tLocal.lastNamePlaceholder}
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="h-10 text-xs rounded-lg border-gray-200"
                          disabled={loading}
                          icon={<User size={13} className="text-gray-400" />}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-text-muted uppercase ml-0.5">
                        {tLocal.email}
                      </label>
                      <Input
                        type="email"
                        required
                        placeholder={tLocal.emailPlaceholder}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-10 text-xs rounded-lg border-gray-200"
                        disabled={loading}
                        icon={<Mail size={13} className="text-gray-400" />}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-text-muted uppercase ml-0.5">
                        {tLocal.phone}
                      </label>
                      <Input
                        type="text"
                        required
                        placeholder={tLocal.phonePlaceholder}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="h-10 text-xs rounded-lg border-gray-200"
                        disabled={loading}
                        icon={<Phone size={13} className="text-gray-400" />}
                      />
                    </div>
                  </div>
                )}

                {/* Subtotal & Checkout Button */}
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center font-bold text-primary text-sm">
                    <span>{tLocal.totalPrice}:</span>
                    <span className="text-action text-lg">{subtotal.toFixed(2)} PLN</span>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-action hover:bg-action-hover text-white py-5 rounded-xl font-bold flex items-center justify-center gap-2 text-sm shadow-md"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        {tLocal.loading}
                      </>
                    ) : (
                      <>
                        {profile ? tLocal.checkoutBtn : tLocal.checkoutGuestBtn}
                        <ArrowRight size={16} />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Fade-in animation style */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
}
