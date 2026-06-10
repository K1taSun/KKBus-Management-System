"use client";

import { useState, useEffect } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { Users, Bus, Calendar, Loader2, PhoneCall, Check, UserCheck, ShieldAlert, LogOut } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Phone booking states
  const [clients, setClients] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>("");
  const [scheduleDetails, setScheduleDetails] = useState<any>(null);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [selectedDiscount, setSelectedDiscount] = useState<string>("NORMAL");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [fetchingSeats, setFetchingSeats] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [mRes, cRes, sRes] = await Promise.all([
        apiGet<any>("/secretariat/dashboard"),
        apiGet<any[]>("/secretariat/clients"),
        apiGet<any[]>("/secretariat/schedules/future"),
      ]);
      setMetrics(mRes);
      setClients(cRes);
      setSchedules(sRes);
    } catch (err: any) {
      if (err?.message === "Network Error" || err?.name === "CanceledError") {
        console.warn("Przerwano żądanie sieciowe (np. wylogowanie) lub brak połączenia.");
      } else {
        console.error("Błąd ładowania danych dashboardu", err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Fetch schedule details (booked seats) when schedule is selected
  useEffect(() => {
    if (!selectedScheduleId) {
      setScheduleDetails(null);
      setSelectedSeat(null);
      return;
    }

    const fetchSeats = async () => {
      setFetchingSeats(true);
      try {
        const res = await apiGet<any>(`/schedules/${selectedScheduleId}`);
        setScheduleDetails(res);
        setSelectedSeat(null);
      } catch (err) {
        toast.error("Nie udało się pobrać schematu miejsc");
        setScheduleDetails(null);
      } finally {
        setFetchingSeats(false);
      }
    };

    fetchSeats();
  }, [selectedScheduleId]);

  const handleBookBehalf = async () => {
    if (!selectedClientId || !selectedScheduleId || !selectedSeat) {
      toast.error("Wybierz klienta, kurs oraz miejsce.");
      return;
    }

    setBookingLoading(true);
    try {
      await apiPost(`/secretariat/reservations/behalf/${selectedClientId}`, {
        scheduleId: Number(selectedScheduleId),
        seats: [
          {
            seatNumber: selectedSeat,
            discountType: selectedDiscount,
          }
        ],
        paymentMethod: "ON_BOARD",
      });

      toast.success("Rezerwacja telefoniczna została pomyślnie utworzona i opłacona!");
      setSelectedSeat(null);
      setSelectedDiscount("NORMAL");
      
      // Refresh seats and metrics
      const updatedSeats = await apiGet<any>(`/schedules/${selectedScheduleId}`);
      setScheduleDetails(updatedSeats);
      
      const updatedMetrics = await apiGet<any>("/secretariat/dashboard");
      setMetrics(updatedMetrics);
    } catch (err: any) {
      toast.error(err.message || "Błąd podczas tworzenia rezerwacji.");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiPost("/auth/logout");
      toast.success("Wylogowano pomyślnie.");
      window.location.href = "/login";
    } catch (err) {
      toast.error("Błąd podczas wylogowywania.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  // Render Seat Grid
  const renderSeatMap = () => {
    if (!scheduleDetails) return null;

    const capacity = scheduleDetails.capacity || 50;
    const bookedSeats = scheduleDetails.booked_seats || [];
    const seats = [];

    for (let i = 1; i <= capacity; i++) {
      const isBooked = bookedSeats.includes(i);
      const isSelected = selectedSeat === i;
      seats.push(
        <button
          key={i}
          type="button"
          disabled={isBooked}
          onClick={() => setSelectedSeat(i)}
          className={`h-10 w-10 text-xs font-semibold rounded-lg flex items-center justify-center border transition-all ${
            isBooked
              ? "bg-red-100 text-red-500 border-red-200 cursor-not-allowed"
              : isSelected
              ? "bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-300"
              : "bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-400"
          }`}
          title={isBooked ? `Miejsce ${i} (Zajęte)` : `Miejsce ${i} (Wolne)`}
        >
          {isBooked ? "X" : i}
        </button>
      );
    }

    // Group into rows of 4 seats (2 + aisle + 2)
    const rows = [];
    const seatsPerRow = 4;
    const totalRows = Math.ceil(capacity / seatsPerRow);

    for (let r = 0; r < totalRows; r++) {
      const rowSeats = seats.slice(r * seatsPerRow, (r + 1) * seatsPerRow);
      rows.push(
        <div key={r} className="flex justify-center gap-3 items-center">
          <div className="flex gap-2">{rowSeats.slice(0, 2)}</div>
          <div className="w-8 text-center text-[10px] text-gray-300 font-mono">Aisle</div>
          <div className="flex gap-2">{rowSeats.slice(2, 4)}</div>
        </div>
      );
    }

    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 max-h-[360px] overflow-y-auto space-y-2">
        <div className="w-full text-center py-1 bg-gray-200 text-gray-600 font-bold rounded text-xs tracking-wider uppercase mb-4">
          Przód Autokaru (Kierowca)
        </div>
        <div className="space-y-2 select-none">{rows}</div>
        <div className="w-full text-center py-1 bg-gray-200 text-gray-600 font-bold rounded text-xs tracking-wider uppercase mt-4">
          Tył Autokaru
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-gray-800">Panel Główny Sekretariatu</h1>
          <p className="text-gray-600">Szybki podgląd bieżącego stanu operacyjnego KKBus i rezerwacje.</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <LogOut size={18} />
          Wyloguj się
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center gap-4">
          <div className="bg-blue-100 p-4 rounded-full">
            <Calendar className="text-blue-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Dzisiejsze Kursy</p>
            <p className="text-2xl font-bold text-gray-800">{metrics?.todaySchedules || 0}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center gap-4">
          <div className="bg-green-100 p-4 rounded-full">
            <Bus className="text-green-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Dostępne Pojazdy</p>
            <p className="text-2xl font-bold text-gray-800">{metrics?.activeBuses || 0}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center gap-4">
          <div className="bg-purple-100 p-4 rounded-full">
            <Users className="text-purple-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Klienci (Baza)</p>
            <p className="text-2xl font-bold text-gray-800">{metrics?.totalClients || 0}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Phone Booking Section */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 border-b pb-3 mb-6">
            <PhoneCall className="text-blue-600" size={22} />
            <h2 className="text-lg font-bold text-gray-800">
              Telefoniczna Rezerwacja Miejsca
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Controls */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wybierz Klienta
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="">Wybierz...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.last_name} {c.first_name} ({c.client_number || c.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wybierz Kurs (Grafik)
                </label>
                <select
                  value={selectedScheduleId}
                  onChange={(e) => setSelectedScheduleId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="">Wybierz...</option>
                  {schedules.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.route_name} - {new Date(s.departure_time).toLocaleString("pl-PL")} ({s.bus_plate})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wybierz Ulgę / Zniżkę
                </label>
                <select
                  value={selectedDiscount}
                  onChange={(e) => setSelectedDiscount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="NORMAL">Normalny (bez ulgi)</option>
                  <option value="STUDENT">Studencki (51% zniżki)</option>
                  <option value="CHILD">Dziecięcy (30% zniżki)</option>
                </select>
              </div>

              {scheduleDetails && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-sm space-y-2">
                  <div className="font-semibold text-slate-800">Szczegóły kursu:</div>
                  <div className="flex justify-between text-slate-600">
                    <span>Trasa:</span>
                    <span className="font-medium">{scheduleDetails.route_name}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Autobus:</span>
                    <span className="font-medium font-mono">{scheduleDetails.bus_model}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Cena bazowa:</span>
                    <span className="font-medium text-blue-600 font-mono">{Number(scheduleDetails.price_base).toFixed(2)} PLN</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Wolnych miejsc:</span>
                    <span className="font-medium text-emerald-600 font-mono">{scheduleDetails.available_seats} / {scheduleDetails.capacity}</span>
                  </div>
                </div>
              )}

              {selectedSeat && (
                <div className="bg-blue-50 text-blue-800 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck size={18} />
                    <span className="text-sm font-medium">Wybrano miejsce: <strong className="text-base font-bold">{selectedSeat}</strong></span>
                  </div>
                  <button
                    onClick={() => setSelectedSeat(null)}
                    className="text-blue-500 hover:text-blue-700 text-xs font-semibold"
                  >
                    Wyczyść
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={handleBookBehalf}
                disabled={bookingLoading || !selectedClientId || !selectedScheduleId || !selectedSeat}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex justify-center items-center gap-2 mt-4 shadow-sm"
              >
                {bookingLoading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Check size={18} />
                )}
                Zarezerwuj i Opłać (Gotówka)
              </button>
            </div>

            {/* Seat Map */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Wybierz wolne miejsce na schemacie
              </label>

              {fetchingSeats ? (
                <div className="flex flex-col items-center justify-center h-64 border border-dashed border-gray-200 rounded-xl bg-gray-50 text-gray-400">
                  <Loader2 className="animate-spin text-gray-300 mb-2" size={24} />
                  <span className="text-xs">Wczytywanie miejsc...</span>
                </div>
              ) : scheduleDetails ? (
                renderSeatMap()
              ) : (
                <div className="flex flex-col items-center justify-center h-64 border border-dashed border-gray-200 rounded-xl bg-gray-50 text-gray-400 text-center px-6">
                  <ShieldAlert size={28} className="text-gray-300 mb-2" />
                  <span className="text-xs">Wybierz kurs, aby zobaczyć wolne i zajęte miejsca.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Links Column */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-gray-200 shadow-sm self-start space-y-4">
          <h2 className="text-lg font-bold text-gray-800 border-b pb-2">Skróty Operacyjne</h2>
          <div className="flex flex-col gap-3">
            <Link
              href="/clients/new"
              className="px-4 py-2 text-center border border-gray-200 rounded-lg hover:bg-gray-50 text-blue-600 font-medium transition-colors"
            >
              + Rejestracja Nowego Klienta
            </Link>
            <Link
              href="/schedules"
              className="px-4 py-2 text-center border border-gray-200 rounded-lg hover:bg-gray-50 text-blue-600 font-medium transition-colors"
            >
              + Planowanie Rozkładu Jazdy
            </Link>
            <Link
              href="/fleet"
              className="px-4 py-2 text-center border border-gray-200 rounded-lg hover:bg-gray-50 text-blue-600 font-medium transition-colors"
            >
              + Zarządzanie Flotą Autobusową
            </Link>
            <Link
              href="/reports"
              className="px-4 py-2 text-center border border-gray-200 rounded-lg hover:bg-gray-50 text-blue-600 font-medium transition-colors"
            >
              Generuj Raporty Operacyjne
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
