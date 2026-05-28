"use client";

import { useState } from "react";
import { 
  Award, 
  Ticket, 
  User as UserIcon, 
  Calendar, 
  PlusCircle, 
  Compass, 
  CreditCard, 
  Trash2, 
  CheckCircle,
  AlertTriangle,
  History,
  Check,
  ChevronRight,
  Info,
  CircleCheck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Reservation {
  id: string;
  from: string;
  to: string;
  date: string;
  time: string;
  seat: number;
  price: string;
  pointsEarned: number;
}

interface PastTrip {
  id: string;
  from: string;
  to: string;
  date: string;
  points: number;
  price: string;
}

export default function ClientDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "book" | "history" | "profile">("overview");
  
  // Real-time states
  const [loyaltyPoints, setLoyaltyPoints] = useState(158);
  const [reservations, setReservations] = useState<Reservation[]>([
    {
      id: "res-1",
      from: "Kraków",
      to: "Katowice",
      date: "2026-05-29",
      time: "08:00",
      seat: 12,
      price: "20.00 PLN",
      pointsEarned: 80
    }
  ]);

  const [pastTrips, setPastTrips] = useState<PastTrip[]>([
    {
      id: "past-1",
      from: "Katowice",
      to: "Kraków",
      date: "15.05.2026",
      points: 80,
      price: "20.00 PLN"
    },
    {
      id: "past-2",
      from: "Kraków",
      to: "Katowice",
      date: "10.05.2026",
      points: 80,
      price: "9.80 PLN (Student)"
    }
  ]);

  // Form states
  const [route, setRoute] = useState("krk-kat");
  const [date, setDate] = useState("2026-05-30");
  const [time, setTime] = useState("10:00");
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [discount, setDiscount] = useState("none");
  const [payWithPoints, setPayWithPoints] = useState(false);

  // Modals & Notices
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Seat list for autokar visual mapping
  // Let's mock some occupied seats: 3, 4, 10, 15, 16, 22, 23, 28, 35
  const occupiedSeats = [3, 4, 10, 15, 16, 22, 23, 28, 35];
  const totalSeats = 40;

  // Real-time price calculation
  const getBasePrice = () => 20.00;
  
  const getFinalPrice = () => {
    let base = getBasePrice();
    if (discount === "student") base = base * 0.49; // -51%
    if (discount === "school") base = base * 0.63; // -37%
    return base;
  };

  const getPointsCost = () => {
    // 1 point = 0.1 PLN, so a 20 PLN ticket costs 200 points
    return Math.round(getFinalPrice() * 10);
  };

  const handleCancelClick = (id: string) => {
    setCancelTargetId(id);
    setShowCancelModal(true);
  };

  const confirmCancel = () => {
    if (!cancelTargetId) return;
    
    // Remove reservation
    const target = reservations.find(r => r.id === cancelTargetId);
    setReservations(prev => prev.filter(r => r.id !== cancelTargetId));
    
    // Display cancel notification
    setSuccessMessage(`Rezerwacja została pomyślnie anulowana. Zwrot środków został przetworzony.`);
    setShowCancelModal(false);
    setCancelTargetId(null);
    
    // Smooth scroll to top to see notification
    window.scrollTo({ top: 0, behavior: "smooth" });
    
    // Remove notice after 5 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 5000);
  };

  const handleNewBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSeat === null) {
      alert("Proszę wybrać miejsce w pojeździe!");
      return;
    }

    const priceNum = getFinalPrice();
    const pointsCost = getPointsCost();

    if (payWithPoints && loyaltyPoints < pointsCost) {
      alert("Niewystarczająca liczba punktów lojalnościowych!");
      return;
    }

    // Process payment / booking
    if (payWithPoints) {
      setLoyaltyPoints(prev => prev - pointsCost);
    } else {
      // Earn points (distance Krakow-Katowice is approx 80km = 80 points)
      setLoyaltyPoints(prev => prev + 80);
    }

    const newRes: Reservation = {
      id: `res-${Date.now()}`,
      from: route === "krk-kat" ? "Kraków" : "Katowice",
      to: route === "krk-kat" ? "Katowice" : "Kraków",
      date: date,
      time: time,
      seat: selectedSeat,
      price: payWithPoints ? `${pointsCost} pkt` : `${priceNum.toFixed(2)} PLN`,
      pointsEarned: payWithPoints ? 0 : 80
    };

    setReservations(prev => [newRes, ...prev]);
    setSuccessMessage(`Bilet zarezerwowany pomyślnie! Miejsce ${selectedSeat} zostało przypisane do Twojego konta.`);
    
    // Reset selection & return to overview
    setSelectedSeat(null);
    setPayWithPoints(false);
    setActiveTab("overview");
    
    // Smooth scroll to top to see notification
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Remove notice after 5 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 5000);
  };

  return (
    <div className="container mx-auto px-4 py-24 max-w-6xl relative min-h-screen">
      
      {/* Dynamic Success Banner */}
      {successMessage && (
        <div className="mb-8 p-4 rounded-2xl bg-blue-50 border border-blue-100 text-blue-900 shadow-sm flex items-start gap-3 animate-fade-in">
          <CircleCheck className="text-action shrink-0 mt-0.5" size={20} />
          <div className="text-sm font-medium">
            {successMessage}
          </div>
        </div>
      )}

      {/* Main Title & Welcome banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary">Witaj, Janie!</h1>
          <p className="text-sm text-text-muted mt-1">Oto Twój panel pasażera. Zarządzaj swoimi podróżami w jednym miejscu.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setActiveTab("book")} 
            className={`rounded-xl px-5 py-2.5 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all ${
              activeTab === "book" 
                ? "bg-action hover:bg-action-hover text-white scale-[1.02] shadow-action/20" 
                : "bg-white text-primary border border-gray-100 hover:bg-gray-50"
            }`}
          >
            <PlusCircle size={16} /> Nowa Rezerwacja
          </Button>
        </div>
      </div>

      {/* Grid: Navigation Sidebar & Tabs Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Navigation Sidebar (left) */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl border border-gray-100 p-4 shadow-lg space-y-1">
            <p className="text-xs font-bold text-gray-400 px-3 mb-2 tracking-wider uppercase">Nawigacja</p>
            
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center justify-between px-3 py-3 rounded-2xl text-left text-sm font-medium transition-all ${
                activeTab === "overview" 
                  ? "bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]" 
                  : "text-text-muted hover:text-primary hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <Compass size={18} className={activeTab === "overview" ? "text-action" : "text-gray-400"} />
                <span>Przegląd Konta</span>
              </div>
              {activeTab === "overview" && <ChevronRight size={16} className="text-action" />}
            </button>

            <button
              onClick={() => setActiveTab("book")}
              className={`w-full flex items-center justify-between px-3 py-3 rounded-2xl text-left text-sm font-medium transition-all ${
                activeTab === "book" 
                  ? "bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]" 
                  : "text-text-muted hover:text-primary hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <PlusCircle size={18} className={activeTab === "book" ? "text-action" : "text-gray-400"} />
                <span>Zarezerwuj Bilet</span>
              </div>
              {activeTab === "book" && <ChevronRight size={16} className="text-action" />}
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`w-full flex items-center justify-between px-3 py-3 rounded-2xl text-left text-sm font-medium transition-all ${
                activeTab === "history" 
                  ? "bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]" 
                  : "text-text-muted hover:text-primary hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <History size={18} className={activeTab === "history" ? "text-action" : "text-gray-400"} />
                <span>Historia Podróży</span>
              </div>
              {activeTab === "history" && <ChevronRight size={16} className="text-action" />}
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center justify-between px-3 py-3 rounded-2xl text-left text-sm font-medium transition-all ${
                activeTab === "profile" 
                  ? "bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]" 
                  : "text-text-muted hover:text-primary hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <UserIcon size={18} className={activeTab === "profile" ? "text-action" : "text-gray-400"} />
                <span>Twoje Dane</span>
              </div>
              {activeTab === "profile" && <ChevronRight size={16} className="text-action" />}
            </button>
          </div>

          {/* Sidebar loyalty info widget */}
          <div className="bg-gradient-to-r from-primary to-blue-900 rounded-3xl shadow-lg p-6 text-white mt-6 space-y-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Award size={18} className="text-yellow-400" />
              Szybki Skrót
            </h3>
            <div className="space-y-1">
              <span className="text-[10px] text-blue-200 uppercase font-bold tracking-wider">Konto Lojalnościowe</span>
              <div className="text-3xl font-extrabold">{loyaltyPoints} pkt</div>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden border border-white/5">
              <div 
                className="bg-action h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min((loyaltyPoints / 200) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-blue-100">
              {loyaltyPoints >= 200 
                ? "Gratulacje! Możesz odebrać darmowy bilet za zebrane punkty!" 
                : `Brakuje Ci ${200 - loyaltyPoints} punktów do darmowego biletu.`}
            </p>
          </div>
        </div>

        {/* Dynamic content rendering (right) */}
        <div className="lg:col-span-3">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-8 animate-fade-in">
              
              {/* Three summary cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Loyalty points card */}
                <Card className="bg-gradient-to-br from-primary to-primary-light text-white border-0 shadow-lg p-6 flex flex-col justify-between rounded-3xl min-h-[140px]">
                  <CardHeader className="p-0 pb-2">
                    <CardTitle className="text-base flex items-center gap-2 font-bold">
                      <Award size={18} className="text-yellow-400" />
                      Program Lojalnościowy
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="text-4xl font-extrabold">{loyaltyPoints} <span className="text-lg font-normal opacity-85">pkt</span></div>
                    <p className="text-xs mt-2 opacity-80 leading-relaxed">
                      Wymieniaj zgromadzone kilometry na darmowe przejazdy i zniżki!
                    </p>
                  </CardContent>
                </Card>

                {/* Active reservations card */}
                <Card className="bg-white border border-gray-100 shadow-sm p-6 flex flex-col justify-between rounded-3xl min-h-[140px]">
                  <CardHeader className="p-0 pb-2">
                    <CardTitle className="text-base flex items-center gap-2 font-bold text-primary">
                      <Ticket size={18} className="text-action" />
                      Aktywne Rezerwacje
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="text-4xl font-extrabold text-primary">{reservations.length}</div>
                    <p className="text-xs text-text-muted mt-2 leading-relaxed">
                      {reservations.length > 0 
                        ? `Najbliższy kurs: ${reservations[0].from} → ${reservations[0].to} (${reservations[0].date}, o ${reservations[0].time})`
                        : "Nie posiadasz obecnie żadnych aktywnych rezerwacji."}
                    </p>
                  </CardContent>
                </Card>

                {/* Profile short card */}
                <Card className="bg-white border border-gray-100 shadow-sm p-6 flex flex-col justify-between rounded-3xl min-h-[140px]">
                  <CardHeader className="p-0 pb-2">
                    <CardTitle className="text-base flex items-center gap-2 font-bold text-primary">
                      <UserIcon size={18} className="text-action" />
                      Twoje Konto
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="text-sm text-text-muted">
                      <p className="font-bold text-primary">Jan Kowalski</p>
                      <p className="text-xs">klient@kkbus.pl</p>
                      <p className="text-xs">+48 600 100 200</p>
                    </div>
                  </CardContent>
                </Card>

              </div>

              {/* Active Reservations Details */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-primary">Aktywne Bilety i Rezerwacje</h2>
                
                {reservations.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {reservations.map((res) => (
                      <div 
                        key={res.id} 
                        className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                      >
                        <div className="flex gap-4 items-center">
                          <div className="w-12 h-12 bg-blue-50 text-action rounded-2xl flex items-center justify-center shrink-0">
                            <Ticket size={24} />
                          </div>
                          <div>
                            <div className="text-lg font-bold text-primary">{res.from} ↔ {res.to}</div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted font-medium mt-1">
                              <span>📅 {res.date}</span>
                              <span>⏰ Godzina: {res.time}</span>
                              <span>💺 Miejsce: {res.seat}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex md:flex-col items-start md:items-end justify-between w-full md:w-auto border-t md:border-0 pt-4 md:pt-0 gap-2">
                          <div className="text-right">
                            <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Cena biletu</span>
                            <span className="text-lg font-extrabold text-primary">{res.price}</span>
                          </div>
                          <button
                            onClick={() => handleCancelClick(res.id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-red-100 text-red-500 hover:bg-red-50 font-bold text-xs transition-colors self-end md:self-auto"
                          >
                            <Trash2 size={14} /> Anuluj rezerwację
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 shadow-inner text-text-muted space-y-3">
                    <Ticket className="mx-auto text-gray-300" size={32} />
                    <p className="text-sm font-semibold">Brak aktywnych rezerwacji</p>
                    <p className="text-xs max-w-xs mx-auto">
                      Planujesz podróż? Zarezerwuj bilet w kilka sekund, korzystając z naszego intuicyjnego kreatora rezerwacji.
                    </p>
                    <button 
                      onClick={() => setActiveTab("book")} 
                      className="px-4 py-2 bg-primary hover:bg-primary-light text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                    >
                      Kup bilet teraz
                    </button>
                  </div>
                )}
              </div>

              {/* History preview */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-primary">Ostatnie Podróże</h2>
                  <button 
                    onClick={() => setActiveTab("history")} 
                    className="text-xs font-bold text-action hover:underline"
                  >
                    Zobacz całą historię
                  </button>
                </div>
                <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                  {pastTrips.slice(0, 2).map((trip, idx) => (
                    <div 
                      key={trip.id} 
                      className={`flex justify-between items-center py-3 text-sm ${
                        idx !== 0 ? "border-t border-gray-50" : ""
                      }`}
                    >
                      <div className="space-y-0.5">
                        <strong className="text-primary font-bold">{trip.from} → {trip.to}</strong>
                        <span className="block text-xs text-text-muted">{trip.date}</span>
                      </div>
                      <div className="text-right">
                        <strong className="block text-primary">{trip.price}</strong>
                        <span className="text-[10px] text-green-600 font-bold">+{trip.points} pkt</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: NEW BOOKING (WITH SEAT PICKER) */}
          {activeTab === "book" && (
            <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-lg space-y-8 animate-fade-in">
              <div>
                <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
                  <PlusCircle className="text-action" size={24} />
                  Kreator Rezerwacji Biletów
                </h2>
                <p className="text-xs text-text-muted mt-1">Wybierz parametry kursu, dopasuj zniżki oraz wskaż swoje ulubione miejsce w pojeździe.</p>
              </div>

              <form onSubmit={handleNewBooking} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Form fields (left) */}
                <div className="space-y-6">
                  
                  {/* Route select */}
                  <div>
                    <label className="block text-xs font-bold text-primary mb-1.5 uppercase tracking-wider">Trasa przejazdu</label>
                    <select
                      value={route}
                      onChange={(e) => {
                        setRoute(e.target.value);
                        setSelectedSeat(null); // Reset seat on route change
                      }}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-action transition-all text-text-main font-medium bg-gray-50/50"
                    >
                      <option value="krk-kat">Kraków → Katowice</option>
                      <option value="kat-krk">Katowice → Kraków</option>
                    </select>
                  </div>

                  {/* Date & Time select */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-primary mb-1.5 uppercase tracking-wider">Data wyjazdu</label>
                      <input
                        type="date"
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-action transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-primary mb-1.5 uppercase tracking-wider">Godzina odjazdu</label>
                      <select
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-action transition-all text-text-main font-medium bg-gray-50/50"
                      >
                        <option value="06:00">06:00 (Ekspres)</option>
                        <option value="08:00">08:00 (Standard)</option>
                        <option value="10:00">10:00 (Standard)</option>
                        <option value="12:00">12:00 (Standard)</option>
                        <option value="15:00">15:00 (Ekspres)</option>
                        <option value="18:00">18:00 (Standard)</option>
                      </select>
                    </div>
                  </div>

                  {/* Discount type */}
                  <div>
                    <label className="block text-xs font-bold text-primary mb-1.5 uppercase tracking-wider">Ulgi / Zniżki</label>
                    <select
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-action transition-all text-text-main font-medium bg-gray-50/50"
                    >
                      <option value="none">Bilet normalny (brak zniżek)</option>
                      <option value="student">Student (-51%) – wymagana legitymacja</option>
                      <option value="school">Uczeń (-37%) – wymagana legitymacja</option>
                    </select>
                  </div>

                  {/* Loyalty Points option */}
                  {loyaltyPoints >= getPointsCost() && (
                    <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <strong className="text-xs font-bold text-primary flex items-center gap-1.5">
                          <Award size={16} className="text-yellow-500 shrink-0" />
                          Kup bilet za punkty lojalnościowe!
                        </strong>
                        <p className="text-[10px] text-text-muted leading-relaxed">
                          Koszt tego przejazdu to: <strong className="text-primary">{getPointsCost()} pkt</strong>. Posiadasz wystarczający bilans!
                        </p>
                      </div>
                      <input 
                        type="checkbox"
                        checked={payWithPoints}
                        onChange={(e) => setPayWithPoints(e.target.checked)}
                        className="rounded h-4 w-4 text-action focus:ring-action border-gray-300"
                      />
                    </div>
                  )}

                  {/* Final Calculation Summary */}
                  <div className="bg-gray-50/50 border border-gray-100 p-5 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center text-xs font-semibold text-text-muted">
                      <span>Cena bazowa bilet normalny:</span>
                      <span>20.00 PLN</span>
                    </div>
                    {discount !== "none" && (
                      <div className="flex justify-between items-center text-xs font-semibold text-action">
                        <span>Wybrana zniżka:</span>
                        <span>{discount === "student" ? "Student (-51%)" : "Uczeń (-37%)"}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-200/60 pt-3 flex justify-between items-center">
                      <span className="text-sm font-bold text-primary">Do zapłaty:</span>
                      <span className="text-xl font-extrabold text-action">
                        {payWithPoints ? `${getPointsCost()} pkt` : `${getFinalPrice().toFixed(2)} PLN`}
                      </span>
                    </div>
                    {!payWithPoints && (
                      <div className="text-[10px] text-green-600 font-bold flex items-center gap-1">
                        <Check size={12} /> Zyskasz +80 punktów lojalnościowych po odbytym przejeździe!
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-action hover:bg-action-hover text-white font-bold transition-all shadow-md shadow-action/25 flex items-center justify-center gap-2 text-sm cursor-pointer"
                  >
                    <CircleCheck size={16} /> Zarezerwuj Miejsce
                  </button>

                </div>

                {/* Seat Picker Visual Map (right) */}
                <div className="border border-gray-100 rounded-3xl p-6 bg-gray-50/30 flex flex-col items-center">
                  <div className="w-full text-center mb-6">
                    <label className="block text-xs font-bold text-primary uppercase tracking-wider">Wybierz miejsce w autokarze</label>
                    <p className="text-[10px] text-text-muted mt-0.5">Wybrane miejsce: {selectedSeat !== null ? <strong className="text-action">Numer {selectedSeat}</strong> : "Brak"}</p>
                  </div>

                  {/* Visual Coach/Bus Layout */}
                  <div className="w-full max-w-[280px] bg-white rounded-3xl border-2 border-gray-200 p-4 shadow-sm space-y-4">
                    
                    {/* Front of the Coach (Driver dashboard / steering wheel representation) */}
                    <div className="border-b border-gray-100 pb-3 flex justify-between items-center px-2 text-xs font-semibold text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-[10px] font-bold">W</div>
                        <span>Kierowca</span>
                      </div>
                      <span>Wejście 🚪</span>
                    </div>

                    {/* 40 Seats Grid (Rows of 4, with Aisle in between) */}
                    <div className="grid grid-cols-5 gap-2 justify-center">
                      {Array.from({ length: 10 }).map((_, rowIndex) => {
                        const seatLeft1 = rowIndex * 4 + 1;
                        const seatLeft2 = rowIndex * 4 + 2;
                        const seatRight1 = rowIndex * 4 + 3;
                        const seatRight2 = rowIndex * 4 + 4;

                        return (
                          <div key={rowIndex} className="col-span-5 grid grid-cols-5 gap-2">
                            {/* Seat 1 (left window) */}
                            <button
                              type="button"
                              disabled={occupiedSeats.includes(seatLeft1)}
                              onClick={() => setSelectedSeat(seatLeft1)}
                              className={`h-8 rounded-lg text-xs font-bold transition-all border flex items-center justify-center ${
                                occupiedSeats.includes(seatLeft1)
                                  ? "bg-gray-100 border-gray-100 text-gray-300 cursor-not-allowed"
                                  : selectedSeat === seatLeft1
                                  ? "bg-action border-action text-white shadow-sm"
                                  : "bg-white border-primary text-primary hover:bg-blue-50"
                              }`}
                            >
                              {seatLeft1}
                            </button>

                            {/* Seat 2 (left aisle) */}
                            <button
                              type="button"
                              disabled={occupiedSeats.includes(seatLeft2)}
                              onClick={() => setSelectedSeat(seatLeft2)}
                              className={`h-8 rounded-lg text-xs font-bold transition-all border flex items-center justify-center ${
                                occupiedSeats.includes(seatLeft2)
                                  ? "bg-gray-100 border-gray-100 text-gray-300 cursor-not-allowed"
                                  : selectedSeat === seatLeft2
                                  ? "bg-action border-action text-white shadow-sm"
                                  : "bg-white border-primary text-primary hover:bg-blue-50"
                              }`}
                            >
                              {seatLeft2}
                            </button>

                            {/* Aisle (middle col, empty space) */}
                            <div className="w-4 h-8 flex items-center justify-center text-[9px] text-gray-300 font-bold select-none">
                              |
                            </div>

                            {/* Seat 3 (right aisle) */}
                            <button
                              type="button"
                              disabled={occupiedSeats.includes(seatRight1)}
                              onClick={() => setSelectedSeat(seatRight1)}
                              className={`h-8 rounded-lg text-xs font-bold transition-all border flex items-center justify-center ${
                                occupiedSeats.includes(seatRight1)
                                  ? "bg-gray-100 border-gray-100 text-gray-300 cursor-not-allowed"
                                  : selectedSeat === seatRight1
                                  ? "bg-action border-action text-white shadow-sm"
                                  : "bg-white border-primary text-primary hover:bg-blue-50"
                              }`}
                            >
                              {seatRight1}
                            </button>

                            {/* Seat 4 (right window) */}
                            <button
                              type="button"
                              disabled={occupiedSeats.includes(seatRight2)}
                              onClick={() => setSelectedSeat(seatRight2)}
                              className={`h-8 rounded-lg text-xs font-bold transition-all border flex items-center justify-center ${
                                occupiedSeats.includes(seatRight2)
                                  ? "bg-gray-100 border-gray-100 text-gray-300 cursor-not-allowed"
                                  : selectedSeat === seatRight2
                                  ? "bg-action border-action text-white shadow-sm"
                                  : "bg-white border-primary text-primary hover:bg-blue-50"
                              }`}
                            >
                              {seatRight2}
                            </button>

                          </div>
                        );
                      })}
                    </div>

                    {/* Back of the coach */}
                    <div className="border-t border-gray-100 pt-3 text-center text-[10px] text-gray-400 font-bold select-none">
                      TYŁ POJAZDU
                    </div>

                  </div>

                  {/* Seat legend */}
                  <div className="flex gap-4 mt-6 text-xs font-semibold text-text-muted justify-center">
                    <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-white border border-primary block"></span> Wolne</span>
                    <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-gray-100 block"></span> Zajęte</span>
                    <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-action block"></span> Wybrane</span>
                  </div>

                </div>

              </form>
            </div>
          )}

          {/* TAB 3: TRAVEL HISTORY */}
          {activeTab === "history" && (
            <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-lg space-y-6 animate-fade-in">
              <div>
                <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
                  <History className="text-action" size={24} />
                  Pełna Historia Podróży
                </h2>
                <p className="text-xs text-text-muted mt-1">Tutaj zgromadzone są wszystkie Twoje zakończone przejazdy autokarami KKBus.</p>
              </div>

              {pastTrips.length > 0 ? (
                <div className="overflow-hidden rounded-2xl border border-gray-100">
                  <table className="w-full text-left text-xs md:text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-primary border-b border-gray-100">
                        <th className="p-4 font-bold">Data przejazdu</th>
                        <th className="p-4 font-bold">Trasa</th>
                        <th className="p-4 font-bold">Cena biletu</th>
                        <th className="p-4 font-bold">Naliczone punkty</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-text-muted">
                      {pastTrips.map((trip) => (
                        <tr key={trip.id} className="hover:bg-gray-50/40">
                          <td className="p-4 font-semibold">{trip.date}</td>
                          <td className="p-4 font-bold text-primary">{trip.from} → {trip.to}</td>
                          <td className="p-4">{trip.price}</td>
                          <td className="p-4 font-bold text-green-600">+{trip.points} pkt</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-text-muted text-center py-6">Historia Twoich podróży jest obecnie pusta.</p>
              )}
            </div>
          )}

          {/* TAB 4: PROFILE DATA */}
          {activeTab === "profile" && (
            <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-lg space-y-6 animate-fade-in">
              <div>
                <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
                  <UserIcon className="text-action" size={24} />
                  Dane Osobowe i RODO
                </h2>
                <p className="text-xs text-text-muted mt-1">Zarządzaj swoimi danymi oraz preferencjami bezpieczeństwa konta.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="p-5 border border-gray-100 rounded-2xl bg-gray-50/20 space-y-1">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Imię i Nazwisko</span>
                  <p className="text-base font-bold text-primary">Jan Kowalski</p>
                </div>
                <div className="p-5 border border-gray-100 rounded-2xl bg-gray-50/20 space-y-1">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Adres E-mail</span>
                  <p className="text-base font-bold text-primary">klient@kkbus.pl</p>
                </div>
                <div className="p-5 border border-gray-100 rounded-2xl bg-gray-50/20 space-y-1">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Numer Telefonu</span>
                  <p className="text-base font-bold text-primary">+48 600 100 200</p>
                </div>
                <div className="p-5 border border-gray-100 rounded-2xl bg-gray-50/20 space-y-1">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Program lojalnościowy</span>
                  <p className="text-base font-bold text-green-600">Aktywny (Przystąpiono)</p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6 flex justify-between items-center">
                <button className="px-5 py-2.5 rounded-xl border border-gray-200 hover:border-action text-xs font-bold text-primary transition-colors">
                  Zmień hasło konta
                </button>
                <button className="px-5 py-2.5 rounded-xl border border-red-100 text-red-500 hover:bg-red-50 font-bold text-xs transition-colors">
                  Usuń konto
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* CANCEL RESERVATION CONFIRMATION MODAL */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-center gap-3 text-red-500 border-b pb-4">
              <AlertTriangle size={24} />
              <h3 className="text-xl font-bold text-primary">Potwierdź anulowanie</h3>
            </div>
            
            <p className="text-sm text-text-muted leading-relaxed">
              Czy na pewno chcesz anulować wybraną rezerwację? 
              <br/><br/>
              Zgodnie z regulaminem, bezkosztowe anulowanie jest możliwe najpóźniej na <strong>24 godziny przed odjazdem</strong>. Środki zostaną zwrócone automatycznie na Twoją kartę/konto w ciągu 3 dni roboczych.
            </p>

            <div className="flex gap-4 pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-primary font-bold text-xs transition-colors cursor-pointer"
              >
                Cofnij
              </button>
              <button
                onClick={confirmCancel}
                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs shadow-md shadow-red-500/10 cursor-pointer"
              >
                Tak, anuluj przejazd
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
