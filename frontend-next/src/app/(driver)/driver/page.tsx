"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  Clock, 
  Users, 
  Calendar, 
  FileText, 
  LogIn, 
  KeyRound, 
  Bus, 
  CheckSquare, 
  Gauge, 
  Fuel, 
  Send,
  AlertCircle,
  PlusCircle
} from "lucide-react";

interface Passenger {
  seat: number;
  name: string;
  ticketType: string;
  checkedIn: boolean;
}

interface AvailabilityRecord {
  date: string;
  status: string;
}

export default function DriverPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Login form states
  const [email, setEmail] = useState("kierowca@kkbus.pl");
  const [password, setPassword] = useState("haslo123");

  // Driver operational states
  const [passengers, setPassengers] = useState<Passenger[]>([
    { seat: 1, name: "Jan Kowalski", ticketType: "Normalny", checkedIn: false },
    { seat: 2, name: "Anna Nowak", ticketType: "Studencki (-51%)", checkedIn: false },
    { seat: 5, name: "Piotr Wiśniewski", ticketType: "Szkolny (-37%)", checkedIn: false },
    { seat: 12, name: "Katarzyna Wójcik", ticketType: "Normalny", checkedIn: false },
    { seat: 15, name: "Mateusz Kowalczyk", ticketType: "Studencki (-51%)", checkedIn: false },
    { seat: 20, name: "Agnieszka Kamińska", ticketType: "Normalny", checkedIn: false }
  ]);

  const [availability, setAvailability] = useState<AvailabilityRecord[]>([
    { date: "2026-06-01", status: "Dostępny" },
    { date: "2026-06-02", status: "Urlop" },
    { date: "2026-06-03", status: "Dostępny" }
  ]);

  // Form states
  const [availDate, setAvailDate] = useState("2026-06-04");
  const [availStatus, setAvailStatus] = useState("Dostępny");
  
  // Course report states
  const [passengersCount, setPassengersCount] = useState("48");
  const [fuelLiters, setFuelLiters] = useState("65.50");
  const [mileageKm, setMileageKm] = useState("142200");
  
  const [activeShiftStatus, setActiveShiftStatus] = useState<"active" | "submitting" | "completed">("active");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassengerList, setShowPassengerList] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === "kierowca@kkbus.pl" && password === "haslo123") {
      setIsLoggedIn(true);
    } else {
      alert("Błędny e-mail lub hasło! (Użyj: kierowca@kkbus.pl / haslo123)");
    }
  };

  const togglePassengerCheck = (seat: number) => {
    setPassengers(prev => prev.map(p => {
      if (p.seat === seat) {
        return { ...p, checkedIn: !p.checkedIn };
      }
      return p;
    }));
  };

  const handleAddAvailability = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord = { date: availDate, status: availStatus };
    setAvailability(prev => [...prev, newRecord].sort((a,b) => a.date.localeCompare(b.date)));
    setSuccessMessage(`Zgłoszono dyspozycyjność na dzień ${availDate} (${availStatus}).`);
    
    setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveShiftStatus("completed");
    setSuccessMessage("Raport z kursu został pomyślnie wysłany do sekretariatu. Status trasy zaktualizowany.");
    
    setTimeout(() => {
      setSuccessMessage(null);
    }, 5000);
  };

  const checkedInCount = passengers.filter(p => p.checkedIn).length;

  // UNAUTHENTICATED DRIVER LOGIN VIEW
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 -mt-24">
        <Card className="w-full max-w-md bg-slate-800 text-white border-slate-700 rounded-3xl shadow-2xl p-6 md:p-8 space-y-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-action text-white rounded-full flex items-center justify-center shadow-lg shadow-action/25">
              <Bus size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Panel Kierowcy KKBus</h1>
              <p className="text-xs text-slate-400 mt-1">Dedykowana strefa logowania dla kierowców i personelu floty.</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">E-mail służbowy</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-700/50 border border-slate-600 focus:outline-none focus:border-action text-sm text-white"
                />
                <LogIn className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Hasło zabezpieczające</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-700/50 border border-slate-600 focus:outline-none focus:border-action text-sm text-white"
                />
                <KeyRound className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-action hover:bg-action-hover text-white font-bold text-sm transition-all shadow-lg shadow-action/25 cursor-pointer"
            >
              Zaloguj się do Systemu
            </button>
          </form>

          <div className="bg-slate-700/30 border border-slate-700 p-4 rounded-2xl text-[10px] text-slate-400 leading-relaxed">
            <strong>Wskazówka (Konto testowe):</strong><br/>
            E-mail: <strong className="text-white">kierowca@kkbus.pl</strong><br/>
            Hasło: <strong className="text-white">haslo123</strong>
          </div>
        </Card>
      </div>
    );
  }

  // AUTHENTICATED DRIVER CABINET VIEW
  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Top Welcome Bar */}
      <div className="flex justify-between items-center bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
        <div className="space-y-0.5">
          <span className="text-[10px] text-action font-bold uppercase tracking-wider">Zalogowany Kierowca</span>
          <h2 className="text-xl font-bold text-primary">Nikita Parkovskyi</h2>
        </div>
        <button 
          onClick={() => setIsLoggedIn(false)}
          className="text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-xl border border-red-100 transition-colors"
        >
          Wyloguj
        </button>
      </div>

      {/* Dynamic Success Notice */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-blue-900 shadow-sm flex items-start gap-3 animate-fade-in">
          <CheckCircle2 className="text-action shrink-0 mt-0.5" size={20} />
          <div className="text-sm font-medium">{successMessage}</div>
        </div>
      )}

      {/* Today's schedule & active route */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-primary">Dzisiejsze Trasy</h3>
        
        {/* Kraków -> Katowice active shift */}
        <Card className={`rounded-3xl shadow-md overflow-hidden transition-all ${
          activeShiftStatus === "completed" 
            ? "border border-gray-200 opacity-60" 
            : "border-2 border-action"
        }`}>
          <CardContent className="p-6 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold mb-2 ${
                  activeShiftStatus === "completed" 
                    ? "bg-gray-100 text-gray-500" 
                    : "bg-blue-100 text-blue-700"
                }`}>
                  {activeShiftStatus === "completed" ? "Zakończono" : "Teraz W Trasie"}
                </span>
                <h4 className="text-xl font-bold text-primary">Kraków → Katowice</h4>
                <p className="text-xs text-text-muted mt-0.5">Autokar: <strong className="text-primary">KR 12345</strong> (Pojemność: 50 miejsc)</p>
              </div>
              <div className="text-right">
                <div className="font-extrabold text-xl text-primary">08:00</div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Wyjazd</div>
              </div>
            </div>

            {/* Checked-in counter & passenger board toggle */}
            {activeShiftStatus !== "completed" && (
              <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-gray-50">
                <div className="flex-1 bg-gray-50 border border-gray-100 p-3 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                    <Users size={16} className="text-action" />
                    Boarding: {checkedInCount} / {passengers.length} pasażerów
                  </div>
                  <button
                    onClick={() => setShowPassengerList(!showPassengerList)}
                    className="text-xs font-bold text-action hover:underline"
                  >
                    {showPassengerList ? "Ukryj listę" : "Lista obecności"}
                  </button>
                </div>
              </div>
            )}

            {/* Boarding Passenger Checklist */}
            {showPassengerList && activeShiftStatus !== "completed" && (
              <div className="space-y-2 pt-2 border-t border-gray-50 animate-fade-in">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">Lista Obecności (Odznacz obecnych):</p>
                <div className="grid grid-cols-1 gap-2 max-h-[220px] overflow-y-auto pr-1">
                  {passengers.map((p) => (
                    <button
                      key={p.seat}
                      onClick={() => togglePassengerCheck(p.seat)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-left text-xs transition-all ${
                        p.checkedIn 
                          ? "bg-green-50/50 border-green-200 text-green-800" 
                          : "bg-white border-gray-100 text-text-muted hover:bg-gray-50"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <strong className="text-primary block font-bold">Miejsce {p.seat}: {p.name}</strong>
                        <span className="text-[10px] text-text-muted block">{p.ticketType}</span>
                      </div>
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-colors ${
                        p.checkedIn 
                          ? "bg-green-500 border-green-500 text-white" 
                          : "border-gray-200 text-transparent"
                      }`}>
                        <CheckSquare size={14} fill={p.checkedIn ? "currentColor" : "none"} className={p.checkedIn ? "text-white" : ""} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Future/Return route */}
        <Card className="border border-gray-100 shadow-sm bg-white rounded-3xl p-6 flex justify-between items-center opacity-70">
          <div>
            <h4 className="font-bold text-primary text-base">Katowice → Kraków</h4>
            <p className="text-xs text-text-muted mt-0.5">Kurs powrotny, powiązany grafikowo</p>
          </div>
          <div className="text-right flex items-center gap-1.5 font-bold text-primary">
            <Clock size={16} className="text-action" />
            <span>14:00</span>
          </div>
        </Card>
      </div>

      {/* Course Report form */}
      {activeShiftStatus === "active" && (
        <Card className="border border-gray-100 shadow-lg rounded-3xl p-6 md:p-8 bg-white space-y-6">
          <div>
            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
              <FileText className="text-action" size={20} />
              Raport Końcowy Kursu
            </h3>
            <p className="text-xs text-text-muted mt-1">Po zakończeniu trasy Kraków → Katowice wypełnij poniższe dane operacyjne:</p>
          </div>

          <form onSubmit={handleReportSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-primary mb-1.5 uppercase tracking-wider">Liczba pasażerów</label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    value={passengersCount}
                    onChange={(e) => setPassengersCount(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-action"
                  />
                  <Users className="absolute left-3 top-3 text-gray-400" size={14} />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-primary mb-1.5 uppercase tracking-wider">Dotankowane paliwo (l)</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={fuelLiters}
                    onChange={(e) => setFuelLiters(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-action"
                  />
                  <Fuel className="absolute left-3 top-3 text-gray-400" size={14} />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-primary mb-1.5 uppercase tracking-wider">Stan licznika (km)</label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    value={mileageKm}
                    onChange={(e) => setMileageKm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-action"
                  />
                  <Gauge className="absolute left-3 top-3 text-gray-400" size={14} />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-primary hover:bg-primary-light text-white font-bold text-xs shadow-md flex justify-center items-center gap-2 cursor-pointer"
            >
              <Send size={14} /> Wyślij Raport i Zakończ Kurs
            </button>
          </form>
        </Card>
      )}

      {/* Driver Availability and Schedule Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Availability List */}
        <Card className="border border-gray-100 shadow-md rounded-3xl p-6 bg-white space-y-4">
          <h3 className="text-lg font-bold text-primary flex items-center gap-2">
            <Calendar className="text-action" size={20} />
            Zgłoszona Dyspozycyjność
          </h3>
          
          <div className="divide-y divide-gray-50 text-xs">
            {availability.map((avail, idx) => (
              <div key={idx} className="flex justify-between items-center py-2.5">
                <span className="font-semibold text-text-main">{avail.date}</span>
                <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] ${
                  avail.status === "Dostępny" 
                    ? "bg-green-50 text-green-700" 
                    : avail.status === "Urlop" 
                    ? "bg-blue-50 text-blue-700" 
                    : "bg-red-50 text-red-700"
                }`}>
                  {avail.status}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Add availability form */}
        <Card className="border border-gray-100 shadow-md rounded-3xl p-6 bg-white space-y-4">
          <h3 className="text-lg font-bold text-primary flex items-center gap-2">
            <PlusCircle className="text-action" size={20} />
            Zgłoś Grafik / Dyspozycyjność
          </h3>

          <form onSubmit={handleAddAvailability} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-primary mb-1.5 uppercase tracking-wider">Wybierz datę</label>
                <input
                  type="date"
                  required
                  value={availDate}
                  onChange={(e) => setAvailDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-action"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-primary mb-1.5 uppercase tracking-wider">Status dostępności</label>
                <select
                  value={availStatus}
                  onChange={(e) => setAvailStatus(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-action text-text-main font-semibold bg-gray-50/50"
                >
                  <option value="Dostępny">Dostępny do pracy</option>
                  <option value="Niedostępny">Niedostępny</option>
                  <option value="Urlop">Wniosek urlopowy</option>
                  <option value="Zwolnienie">Zwolnienie lekarskie</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-action hover:bg-action-hover text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
            >
              Prześlij Zgłoszenie
            </button>
          </form>
        </Card>

      </div>

    </div>
  );
}
