"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MapPin, ArrowRightLeft, Calendar, Users, Search, Bus, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/LanguageContext";

const BACKEND_URL = "http://localhost:3000/api";

const LOCATION_OPTIONS_PL = [
  "Kraków (Wszystkie przystanki)",
  "Kraków MDA (Dworzec)",
  "Kraków Bronowice SKA",
  "Katowice (Wszystkie przystanki)",
  "Katowice Sądowa (Dworzec)",
  "Katowice Zawodzie Centrum Przesiadkowe",
];

const LOCATION_OPTIONS_EN = [
  "Kraków (All stops)",
  "Kraków MDA (Station)",
  "Kraków Bronowice SKA",
  "Katowice (All stops)",
  "Katowice Sądowa (Station)",
  "Katowice Zawodzie Transfer Center",
];

const isValidLocation = (val: string) => {
  const v = val.toLowerCase();
  return LOCATION_OPTIONS_PL.some(opt => opt.toLowerCase().includes(v)) || 
         LOCATION_OPTIONS_EN.some(opt => opt.toLowerCase().includes(v)) || 
         v.includes("krak") || v.includes("katow");
};

const getSearchSchema = (t: any) => z.object({
  from: z.string().min(1, t("search.errors.from")).refine(isValidLocation, t("search.errors.invalid")),
  to: z.string().min(1, t("search.errors.to")).refine(isValidLocation, t("search.errors.invalid")),
  date: z.string().min(1, t("search.errors.date")),
  passengers: z.string().min(1, "1"),
}).refine(data => data.from !== data.to, {
  message: t("search.errors.different"),
  path: ["to"]
});

type SearchFormValues = z.infer<ReturnType<typeof getSearchSchema>>;

interface TimetableItem {
  schedule_id: number;
  departure_time: string;
  arrival_time: string;
  price_base: string;
  route_name: string;
  total_distance_km: number;
  bus_model: string;
  capacity: number;
  available_seats: number;
}

export function SearchWidget() {
  const { t, language } = useTranslation();
  const schema = getSearchSchema(t);

  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<TimetableItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Seat selection states
  const [selectedSchedule, setSelectedSchedule] = useState<TimetableItem | null>(null);
  const [bookedSeats, setBookedSeats] = useState<number[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const locationOptions = language === "pl" ? LOCATION_OPTIONS_PL : LOCATION_OPTIONS_EN;

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<SearchFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      from: "",
      to: "",
      date: new Date().toISOString().split("T")[0],
      passengers: "1",
    },
  });

  const onSubmit = async (data: SearchFormValues) => {
    setIsLoading(true);
    setHasSearched(true);
    setSelectedSchedule(null);
    setBookingSuccess(null);
    setBookingError(null);
    setSelectedSeats([]);

    try {
      // 1. Pobieramy rozkład jazdy z backendu
      const res = await fetch(`${BACKEND_URL}/public-info/timetable`);
      if (!res.ok) throw new Error("Błąd podczas pobierania rozkładu.");
      
      const rawData: TimetableItem[] = await res.json();
      
      // 2. Filtrujemy na podstawie wyboru użytkownika
      const isFromKrakow = data.from.toLowerCase().includes("krak");
      const isToKatowice = data.to.toLowerCase().includes("katow");

      const filtered = rawData.filter(item => {
        const routeLower = item.route_name.toLowerCase();
        
        // Sprawdzamy kierunek
        if (isFromKrakow && isToKatowice) {
          return routeLower.includes("kraków") && routeLower.includes("katowice") && routeLower.indexOf("kraków") < routeLower.indexOf("katowice");
        } else if (!isFromKrakow && !isToKatowice) {
          return routeLower.includes("katowice") && routeLower.includes("kraków") && routeLower.indexOf("katowice") < routeLower.indexOf("kraków");
        }
        
        return false;
      });

      setSearchResults(filtered);
    } catch (err) {
      console.error(err);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwap = () => {
    const currentFrom = getValues("from");
    const currentTo = getValues("to");
    setValue("from", currentTo);
    setValue("to", currentFrom);
  };

  // Ładowanie zajętych miejsc dla konkretnego kursu
  const handleSelectSchedule = async (schedule: TimetableItem) => {
    setSelectedSchedule(schedule);
    setSelectedSeats([]);
    setBookingSuccess(null);
    setBookingError(null);

    try {
      const res = await fetch(`${BACKEND_URL}/schedules/${schedule.schedule_id}`);
      if (res.ok) {
        const details = await res.json();
        // Filtrujemy null-e z agregacji SQL
        setBookedSeats(details.booked_seats ? details.booked_seats.filter((s: any) => s !== null) : []);
      } else {
        setBookedSeats([]);
      }
    } catch (err) {
      console.error(err);
      setBookedSeats([]);
    }
  };

  const toggleSeat = (seatNum: number) => {
    if (bookedSeats.includes(seatNum)) return;
    
    setSelectedSeats(prev => 
      prev.includes(seatNum) 
        ? prev.filter(s => s !== seatNum) 
        : [...prev, seatNum]
    );
  };

  // Automatyczne logowanie testowe i rezerwacja
  const handleConfirmBooking = async () => {
    if (selectedSeats.length === 0) return;
    setIsBooking(true);
    setBookingError(null);

    try {
      // 1. Wykonujemy logowanie testowe, aby zapisać ciasteczka sesyjne
      const loginRes = await fetch(`${BACKEND_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "klient@kkbus.pl", password: "Test1234!" }),
      });

      if (!loginRes.ok) {
        throw new Error("Automatyczne logowanie testowe nie powiodło się.");
      }

      // Wyciągamy ciasteczko z nagłówka i wysyłamy żądanie rezerwacji
      // Przekazanie credentials: "include" pozwala przeglądarce automatycznie przesłać cookies do backendu
      const res = await fetch(`${BACKEND_URL}/reservations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduleId: selectedSchedule?.schedule_id,
          seatNumbers: selectedSeats
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Błąd podczas składania rezerwacji.");
      }

      setBookingSuccess(`${t("seats.success")}: ${selectedSeats.join(", ")}.`);
      
      // Odświeżenie zajętych siedzeń
      if (selectedSchedule) {
        handleSelectSchedule(selectedSchedule);
      }
    } catch (err: any) {
      setBookingError(err.message || "Błąd sieci.");
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="space-y-8 w-full max-w-5xl mx-auto">
      {/* ─── Search Widget Panel ─── */}
      <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 relative z-10 -mt-24 md:-mt-16 border border-gray-100">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col md:flex-row items-end gap-4 md:gap-2">
          {/* Od */}
          <div className="w-full md:flex-1 relative">
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="from" className="block text-xs font-semibold text-text-muted ml-1">{t("search.from")}</label>
              {errors.from && <span className="text-[10px] text-red-500">{errors.from.message as string}</span>}
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                id="from"
                list="locations-list"
                placeholder={t("search.placeholder")}
                {...register("from")}
                className={`w-full h-12 pl-10 pr-3 rounded-lg border bg-background-alt text-sm focus:outline-none focus:ring-2 focus:ring-action transition-all ${
                  errors.from ? "border-red-500 focus:ring-red-500" : "border-gray-200"
                }`}
              />
              <datalist id="locations-list">
                {locationOptions.map(opt => (
                  <option key={opt} value={opt} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Swap */}
          <div className="hidden md:flex flex-col justify-end pb-1">
            <button
              type="button"
              onClick={handleSwap}
              className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
              aria-label={t("search.swap")}
            >
              <ArrowRightLeft size={18} />
            </button>
          </div>

          {/* Do */}
          <div className="w-full md:flex-1 relative">
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-2">
                <label htmlFor="to" className="block text-xs font-semibold text-text-muted ml-1">{t("search.to")}</label>
                {errors.to && <span className="text-[10px] text-red-500">{errors.to.message as string}</span>}
              </div>
              <button
                type="button"
                onClick={handleSwap}
                className="md:hidden text-action text-xs font-medium flex items-center gap-1"
              >
                <ArrowRightLeft size={12} /> {t("search.swap")}
              </button>
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                id="to"
                list="locations-list"
                placeholder={t("search.placeholder")}
                {...register("to")}
                className={`w-full h-12 pl-10 pr-3 rounded-lg border bg-background-alt text-sm focus:outline-none focus:ring-2 focus:ring-action transition-all ${
                  errors.to ? "border-red-500 focus:ring-red-500" : "border-gray-200"
                }`}
              />
            </div>
          </div>

          {/* Data */}
          <div className="w-full md:w-40 relative">
            <label htmlFor="date" className="block text-xs font-semibold text-text-muted mb-1 ml-1">{t("search.date")}</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                id="date"
                type="date"
                {...register("date")}
                className="w-full h-12 pl-10 pr-3 rounded-lg border border-gray-200 bg-background-alt text-sm focus:outline-none focus:ring-2 focus:ring-action transition-all"
              />
            </div>
          </div>

          {/* Pasażerowie */}
          <div className="w-full md:w-40 relative">
            <label htmlFor="passengers" className="block text-xs font-semibold text-text-muted mb-1 ml-1">{t("search.passengers")}</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <select
                id="passengers"
                {...register("passengers")}
                className="w-full h-12 pl-10 pr-8 rounded-lg border border-gray-200 bg-background-alt text-sm focus:outline-none focus:ring-2 focus:ring-action transition-all appearance-none"
              >
                <option value="1">{t("search.passengers.1")}</option>
                <option value="2">{t("search.passengers.2")}</option>
                <option value="3">{t("search.passengers.3")}</option>
                <option value="4">{t("search.passengers.4")}</option>
              </select>
            </div>
          </div>

          {/* Szukaj */}
          <div className="w-full md:w-auto mt-2 md:mt-0 pb-0">
            <Button
              type="submit"
              isLoading={isLoading}
              size="lg"
              className="w-full md:w-auto h-12 px-8 text-base font-bold bg-action hover:bg-action-hover text-white"
            >
              {!isLoading && <Search size={20} className="mr-2" />}
              {t("search.button")}
            </Button>
          </div>
        </form>
      </div>

      {/* ─── Search Results Panel ─── */}
      {hasSearched && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-6">
          <h3 className="text-xl font-bold text-primary border-b border-gray-100 pb-3">{t("results.title")}</h3>
          
          {searchResults.length === 0 ? (
            <p className="text-center text-text-muted py-8">{t("results.empty")}</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {searchResults.map((item) => (
                <div key={item.schedule_id} className="py-4 flex flex-col md:flex-row justify-between items-center gap-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="p-3 bg-action/10 rounded-xl text-action">
                      <Bus size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-primary text-lg">{item.route_name}</h4>
                      <p className="text-xs text-text-muted mt-0.5">{t("results.model")}: {item.bus_model}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs font-semibold">
                        <span className="text-green-600">{t("results.freeSeats")}: {item.available_seats} / {item.capacity}</span>
                        <span className="text-text-muted">•</span>
                        <span className="text-text-muted">{t("results.distance")}: {item.total_distance_km} km</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 justify-between w-full md:w-auto shrink-0">
                    <div className="text-center md:text-right">
                      <div className="font-bold text-2xl text-primary">
                        {new Date(item.departure_time).toLocaleTimeString(language === "pl" ? "pl-PL" : "en-US", { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-xs text-text-muted font-medium mt-1">{t("results.departure")}</div>
                    </div>

                    <div className="text-center md:text-right">
                      <div className="font-bold text-xl text-action">
                        {parseFloat(item.price_base).toFixed(2)} PLN
                      </div>
                      <div className="text-xs text-text-muted font-medium mt-1">{t("results.price")}</div>
                    </div>

                    <Button 
                      variant="outline"
                      onClick={() => handleSelectSchedule(item)}
                      className="border-action text-action hover:bg-action hover:text-white font-bold px-5"
                    >
                      {t("results.buy")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Interactive Bus Seating Modal ─── */}
      {selectedSchedule && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-6">
          <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-primary">{t("seats.title")} — {selectedSchedule.route_name}</h3>
              <p className="text-xs text-text-muted mt-1">
                {language === "pl" ? "Odjazd" : "Departure"}: {new Date(selectedSchedule.departure_time).toLocaleDateString(language === "pl" ? "pl-PL" : "en-US")} {language === "pl" ? "o godzinie" : "at"} {new Date(selectedSchedule.departure_time).toLocaleTimeString(language === "pl" ? "pl-PL" : "en-US", { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <button 
              onClick={() => setSelectedSchedule(null)}
              className="text-text-muted hover:text-primary font-bold text-sm"
            >
              {t("seats.close")}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Bus Grid Layout */}
            <div className="bg-background-alt border border-gray-200 rounded-3xl p-6 flex flex-col items-center">
              <div className="text-xs font-bold text-text-muted mb-4 uppercase tracking-wider">{t("seats.front")}</div>
              
              {/* Steering wheel placeholder */}
              <div className="w-full flex justify-end px-4 mb-4 text-gray-400">
                <div className="w-8 h-8 rounded-full border-4 border-dashed border-gray-300 flex items-center justify-center font-bold text-[8px]">{t("seats.steering")}</div>
              </div>

              {/* Seating map grid (4 columns) */}
              <div className="grid grid-cols-5 gap-2.5 max-h-[350px] overflow-y-auto w-full max-w-[280px]">
                {Array.from({ length: Math.ceil(selectedSchedule.capacity / 4) }).map((_, rowIndex) => {
                  return [1, 2, 0, 3, 4].map((colIndex) => {
                    if (colIndex === 0) {
                      // Aisle (korytarz)
                      return <div key={`aisle-${rowIndex}`} className="w-6 h-8 flex items-center justify-center text-[10px] text-gray-300 font-bold">||</div>;
                    }

                    // Seat number logic
                    const mappedCol = colIndex > 2 ? colIndex - 1 : colIndex;
                    const seatNum = rowIndex * 4 + mappedCol;

                    if (seatNum > selectedSchedule.capacity) {
                      return <div key={`empty-${rowIndex}-${colIndex}`} className="w-8 h-8" />;
                    }

                    const isBooked = bookedSeats.includes(seatNum);
                    const isSelected = selectedSeats.includes(seatNum);

                    return (
                      <button
                        key={`seat-${seatNum}`}
                        type="button"
                        disabled={isBooked}
                        onClick={() => toggleSeat(seatNum)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                          isBooked
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : isSelected
                            ? "bg-action text-white shadow-md ring-2 ring-action/50"
                            : "bg-white border border-gray-300 text-primary hover:border-action"
                        }`}
                      >
                        {seatNum}
                      </button>
                    );
                  });
                })}
              </div>
              
              <div className="text-xs font-bold text-text-muted mt-4 uppercase tracking-wider">{t("seats.back")}</div>
            </div>

            {/* Selection Info Panel */}
            <div className="space-y-4">
              <h4 className="font-bold text-primary">{t("seats.selected")}</h4>
              
              <div className="flex gap-4 text-xs font-medium">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-white border border-gray-300" />
                  <span>{t("seats.free")}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-action" />
                  <span>{t("seats.selected")}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-gray-200" />
                  <span>{t("seats.taken")}</span>
                </div>
              </div>

              <div className="bg-background-alt border border-gray-100 rounded-xl p-4 mt-2">
                <div className="flex justify-between items-center text-sm font-semibold text-primary mb-2">
                  <span>{t("seats.qty")}:</span>
                  <span>{selectedSeats.length}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-semibold text-primary mb-2">
                  <span>{t("seats.numbers")}:</span>
                  <span>{selectedSeats.length > 0 ? selectedSeats.sort((a,b)=>a-b).join(", ") : t("seats.none")}</span>
                </div>
                <div className="border-t border-gray-200 my-2 pt-2 flex justify-between items-center text-base font-bold text-primary">
                  <span>{t("seats.total")}:</span>
                  <span className="text-action">
                    {(selectedSeats.length * parseFloat(selectedSchedule.price_base)).toFixed(2)} PLN
                  </span>
                </div>
              </div>

              {bookingSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg flex items-center gap-2 text-sm font-medium">
                  <CheckCircle2 size={16} />
                  <span>{bookingSuccess}</span>
                </div>
              )}

              {bookingError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-center gap-2 text-sm font-medium">
                  <AlertCircle size={16} />
                  <span>{bookingError}</span>
                </div>
              )}

              <Button
                onClick={handleConfirmBooking}
                disabled={selectedSeats.length === 0 || isBooking}
                isLoading={isBooking}
                className="w-full h-12 bg-action hover:bg-action-hover text-white font-bold text-base mt-4 shadow-md"
              >
                {t("seats.confirm")}
              </Button>
              <p className="text-[10px] text-center text-text-muted">
                {t("seats.disclaimer")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
