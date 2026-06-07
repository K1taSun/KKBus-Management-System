"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MapPin, ArrowRightLeft, Calendar, Users, Search, Bus, CheckCircle2, AlertCircle, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/LanguageContext";
import { useCart } from "@/lib/CartContext";

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
  registration_number: string;
  capacity: number;
  available_seats: number;
}

export function SearchWidget() {
  const { t, language } = useTranslation();
  const schema = getSearchSchema(t);
  const { addToCart } = useCart();

  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<TimetableItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Seat selection states
  const [selectedSchedule, setSelectedSchedule] = useState<TimetableItem | null>(null);
  const [bookedSeats, setBookedSeats] = useState<number[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);

  const seatSelectionRef = useRef<HTMLDivElement>(null);

  // Auto-scroll do wyboru miejsc, gdy zostanie otwarte
  useEffect(() => {
    if (selectedSchedule && seatSelectionRef.current) {
      setTimeout(() => {
        seatSelectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [selectedSchedule]);

  const locationOptions = language === "pl" ? LOCATION_OPTIONS_PL : LOCATION_OPTIONS_EN;

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
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

  const passengerCount = parseInt(watch("passengers") || "1", 10);

  const getPassengerLabel = (count: number) => {
    if (language === "pl") {
      if (count === 1) return "1 osoba";
      if (count >= 2 && count <= 4) return `${count} osoby`;
      return `${count} osób`;
    } else {
      if (count === 1) return "1 person";
      return `${count} people`;
    }
  };

  const onSubmit = async (data: SearchFormValues) => {
    setIsLoading(true);
    setSearchResults([]);
    setHasSearched(true);
    setSelectedSchedule(null);
    setSelectedSeats([]);

    try {
      // 1. Pobieramy rozkład jazdy z backendu
      const res = await fetch(`${BACKEND_URL}/public-info/timetable`);
      if (!res.ok) throw new Error("Błąd podczas pobierania rozkładu.");
      
      const rawData: TimetableItem[] = await res.json();
      
      // 2. Filtrujemy na podstawie wyboru użytkownika
      const isFromKrakow = data.from.toLowerCase().includes("krak");
      const isToKatowice = data.to.toLowerCase().includes("katow");

      const passengerCount = parseInt(data.passengers || "1", 10);
      const filtered = rawData.filter(item => {
        // Pomijamy jeśli brak miejsc
        if (Number(item.available_seats) < passengerCount) {
          return false;
        }

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
      setBookedSeats([]);
    }
  };

  const toggleSeat = (seatNum: number) => {
    if (bookedSeats.includes(seatNum)) return;
    
    setSelectedSeats(prev => {
      const isCurrentlySelected = prev.includes(seatNum);
      if (isCurrentlySelected) {
        return prev.filter(s => s !== seatNum);
      } else {
        if (prev.length >= passengerCount) {
          // Jeśli wybrano już maksymalną ilość, zamień pierwsze zaznaczone na nowe
          return [...prev.slice(1), seatNum];
        }
        return [...prev, seatNum];
      }
    });
  };

  const handleAddToCart = () => {
    if (!selectedSchedule || selectedSeats.length === 0) return;

    addToCart({
      scheduleId: selectedSchedule.schedule_id,
      routeName: selectedSchedule.route_name,
      departureTime: selectedSchedule.departure_time,
      price: parseFloat(selectedSchedule.price_base),
      seats: [...selectedSeats],
    });

    // Reset selection
    setSelectedSeats([]);
    setSelectedSchedule(null);
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
          <div className="w-full md:w-48 relative">
            <label className="block text-xs font-semibold text-text-muted mb-1 ml-1">{t("search.passengers")}</label>
            <div className="flex items-center justify-between h-12 px-3 rounded-lg border border-gray-200 bg-background-alt text-sm select-none">
              <button
                type="button"
                onClick={() => {
                  const current = parseInt(getValues("passengers") || "1", 10);
                  if (current > 1) {
                    setValue("passengers", String(current - 1));
                  }
                }}
                disabled={passengerCount <= 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-white border border-gray-200 text-primary hover:border-action hover:text-action disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-primary transition-all font-semibold focus:outline-none shrink-0"
              >
                <Minus size={14} />
              </button>
              <span className="font-semibold text-primary px-2 truncate">
                {getPassengerLabel(passengerCount)}
              </span>
              <button
                type="button"
                onClick={() => {
                  const current = parseInt(getValues("passengers") || "1", 10);
                  if (current < 10) {
                    setValue("passengers", String(current + 1));
                  }
                }}
                disabled={passengerCount >= 10}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-white border border-gray-200 text-primary hover:border-action hover:text-action disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-primary transition-all font-semibold focus:outline-none shrink-0"
              >
                <Plus size={14} />
              </button>
            </div>
            <input type="hidden" {...register("passengers")} />
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
                      <p className="text-xs text-text-muted mt-0.5">
                        {t("results.model")}: <span className="font-semibold text-primary">{item.bus_model}</span> ({item.registration_number})
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs font-semibold">
                        <span className="text-green-600 font-bold">{t("results.freeSeats")}: {item.available_seats} / {item.capacity}</span>
                        <span className="text-text-muted">•</span>
                        <span className="text-text-muted">{t("results.distance")}: {item.total_distance_km} km</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 justify-between w-full md:w-auto shrink-0 mt-4 md:mt-0 border-t md:border-t-0 border-gray-100 pt-4 md:pt-0">
                    <div className="text-center md:text-right flex-1 md:flex-none">
                      <div className="font-bold text-xl text-primary whitespace-nowrap flex items-center justify-center md:justify-end gap-2">
                        <span>{new Date(item.departure_time).toLocaleTimeString(language === "pl" ? "pl-PL" : "en-US", { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="text-gray-300 font-normal">-</span>
                        <span className="text-gray-600">{new Date(item.arrival_time).toLocaleTimeString(language === "pl" ? "pl-PL" : "en-US", { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="text-xs text-text-muted font-medium mt-1">{t("results.departure")}</div>
                    </div>

                    <div className="text-center md:text-right flex-1 md:flex-none border-l md:border-l-0 border-gray-100 pl-4 md:pl-0">
                      <div className="font-bold text-xl text-action whitespace-nowrap">
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
        <div ref={seatSelectionRef} className="bg-white rounded-3xl shadow-xl border border-gray-150 p-6 md:p-8 space-y-6 transition-all duration-300">
          <div className="border-b border-gray-100 pb-4 flex justify-between items-start">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-action px-2.5 py-1 bg-action/10 rounded-full">
                {language === "pl" ? "Rezerwacja Miejsc" : "Seat Booking"}
              </span>
              <h3 className="text-2xl font-black text-primary mt-2 flex items-center gap-2">
                <span>{selectedSchedule.route_name}</span>
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {language === "pl" ? "Pojazd" : "Vehicle"}: <span className="font-semibold text-gray-700">{selectedSchedule.bus_model}</span> ({selectedSchedule.registration_number})
              </p>
              <p className="text-xs text-text-muted mt-1">
                {language === "pl" ? "Odjazd" : "Departure"}: <span className="font-medium">{new Date(selectedSchedule.departure_time).toLocaleDateString(language === "pl" ? "pl-PL" : "en-US")} {language === "pl" ? "o godzinie" : "at"} {new Date(selectedSchedule.departure_time).toLocaleTimeString(language === "pl" ? "pl-PL" : "en-US", { hour: '2-digit', minute: '2-digit' })}</span>
              </p>
            </div>
            <button 
              onClick={() => setSelectedSchedule(null)}
              className="text-gray-400 hover:text-primary hover:bg-gray-100 p-2 rounded-full font-bold text-sm transition-colors"
              aria-label={t("seats.close")}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Bus Grid Layout Column (left) */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center p-4 bg-gray-50 rounded-3xl border border-gray-100">
              
              <div className="text-xs font-bold text-gray-400 mb-6 uppercase tracking-widest flex items-center gap-2">
                <span>{language === "pl" ? "Schemat Miejsc" : "Seating Chart"}</span>
              </div>

              {/* Realistic Bus Simulation Body */}
              <div className="relative w-full max-w-[320px] bg-slate-900 border-4 border-slate-800 rounded-t-[55px] rounded-b-[25px] p-6 pt-12 pb-8 shadow-2xl flex flex-col items-center">
                {/* Windshield */}
                <div className="absolute top-2 left-6 right-6 h-5 bg-cyan-500/20 border border-cyan-400/40 rounded-t-xl backdrop-blur-sm flex items-center justify-center">
                  <div className="w-12 h-0.5 bg-cyan-300/30 rounded-full" />
                </div>

                {/* Side Mirrors */}
                <div className="absolute -left-2.5 top-8 w-2 h-7 bg-slate-800 rounded-l-md border-r border-slate-700 shadow-md" />
                <div className="absolute -right-2.5 top-8 w-2 h-7 bg-slate-800 rounded-r-md border-l border-slate-700 shadow-md" />

                {/* Front Cabin Control Panel Area */}
                <div className="w-full flex justify-between items-center px-2 mb-6 border-b border-slate-800/80 pb-4">
                  {/* Driver Seat & Steering Wheel */}
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs opacity-60">
                      👨‍✈️
                    </div>
                    {/* Steering Wheel SVG */}
                    <svg className="w-7 h-7 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="9" />
                      <circle cx="12" cy="12" r="3" />
                      <path d="M12 3v6M3 12h6M15 12h6" />
                    </svg>
                  </div>
                  
                  {/* Entrance Door Indicator */}
                  <div className="h-6 px-2 rounded bg-slate-800 border border-slate-700/50 flex items-center text-[8px] font-bold text-emerald-400 uppercase tracking-widest">
                    {language === "pl" ? "WEJŚCIE" : "ENTRY"}
                  </div>
                </div>

                {/* Seating map grid (5 columns: 2 seats, aisle, 2 seats) */}
                <div className="grid grid-cols-5 gap-y-3.5 gap-x-2 max-h-[380px] overflow-y-auto w-full px-1 scrollbar-thin">
                  {Array.from({ length: Math.ceil(selectedSchedule.capacity / 4) }).map((_, rowIndex) => {
                    return [1, 2, 0, 3, 4].map((colIndex) => {
                      if (colIndex === 0) {
                        // Clean representation of the aisle
                        return (
                          <div 
                            key={`aisle-${rowIndex}`} 
                            className="w-full h-10 flex items-center justify-center border-l border-r border-slate-800/30"
                          >
                            <span className="text-[9px] text-slate-800 font-extrabold select-none opacity-20">||</span>
                          </div>
                        );
                      }

                      // Seat number logic
                      const seatNum = rowIndex * 4 + colIndex;

                      if (seatNum > selectedSchedule.capacity) {
                        return <div key={`empty-${rowIndex}-${colIndex}`} className="w-10 h-10" />;
                      }

                      const isBooked = bookedSeats.includes(seatNum);
                      const isSelected = selectedSeats.includes(seatNum);

                      return (
                        <button
                          key={`seat-${seatNum}`}
                          type="button"
                          disabled={isBooked}
                          onClick={() => toggleSeat(seatNum)}
                          className={`group relative w-10 h-10 rounded-lg flex flex-col items-center justify-between p-1.5 text-xs font-bold transition-all duration-150 ${
                            isBooked
                              ? "bg-slate-800 text-slate-600 border border-slate-750 cursor-not-allowed opacity-40"
                              : isSelected
                              ? "bg-gradient-to-b from-sky-400 to-action text-white shadow-[0_0_12px_rgba(14,165,233,0.5)] border border-sky-300 scale-105"
                              : "bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:border-action"
                          }`}
                        >
                          {/* Realistic Coach Headrest Effect */}
                          <div className={`w-7 h-2 rounded-sm transition-colors ${
                            isBooked ? "bg-slate-750" : isSelected ? "bg-sky-200" : "bg-slate-650 group-hover:bg-action/50"
                          }`} />
                          
                          <span className="leading-none mt-0.5">{seatNum}</span>
                        </button>
                      );
                    });
                  })}
                </div>
                
                {/* Bus Engine/Rear indicator */}
                <div className="w-full border-t border-slate-850/80 mt-6 pt-3 flex justify-center text-[9px] font-black text-slate-600 tracking-widest uppercase">
                  {language === "pl" ? "TYŁ POJAZDU" : "REAR"}
                </div>
              </div>
            </div>

            {/* Selection Info Panel Column (right) */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-gray-800 text-lg">{language === "pl" ? "Podsumowanie wyboru" : "Selection Summary"}</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {language === "pl" 
                      ? "Zaznacz odpowiednie miejsca na mapie po lewej." 
                      : "Please select your preferred seats on the map."}
                  </p>
                </div>

                {/* Legend Badges */}
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-wrap gap-4 items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-slate-800 border border-slate-700 flex flex-col items-center justify-between p-0.5">
                      <div className="w-3.5 h-1 rounded-sm bg-slate-650" />
                    </div>
                    <span className="text-xs font-semibold text-gray-600">{t("seats.free")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-gradient-to-b from-sky-400 to-action border border-sky-300 flex flex-col items-center justify-between p-0.5">
                      <div className="w-3.5 h-1 rounded-sm bg-sky-200" />
                    </div>
                    <span className="text-xs font-semibold text-gray-600">{t("seats.selected")}</span>
                  </div>
                  <div className="flex items-center gap-2 opacity-50">
                    <div className="w-5 h-5 rounded-md bg-slate-800 border border-slate-750 flex flex-col items-center justify-between p-0.5">
                      <div className="w-3.5 h-1 rounded-sm bg-slate-750" />
                    </div>
                    <span className="text-xs font-semibold text-gray-600">{t("seats.taken")}</span>
                  </div>
                </div>

                {/* Premium Ticket Info Box */}
                <div className="relative overflow-hidden bg-gradient-to-br from-primary to-slate-900 text-white rounded-3xl p-6 shadow-lg">
                  {/* Decorative Ticket Circle Cutouts */}
                  <div className="absolute top-1/2 -left-3 w-6 h-6 bg-white rounded-full -translate-y-1/2" />
                  <div className="absolute top-1/2 -right-3 w-6 h-6 bg-white rounded-full -translate-y-1/2" />

                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs text-sky-200 uppercase font-black tracking-widest">
                      <span>{language === "pl" ? "TWÓJ BILET" : "YOUR TICKET"}</span>
                      <span>KKBUS</span>
                    </div>

                    <div className="border-t border-white/10 my-3" />

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-sky-200/70">{t("seats.qty")}:</span>
                      <span className="text-lg font-bold text-white">{selectedSeats.length} / {passengerCount}</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-sky-200/70 mt-0.5">{t("seats.numbers")}:</span>
                      <span className="text-base font-bold text-white max-w-[200px] text-right break-words">
                        {selectedSeats.length > 0 
                          ? selectedSeats.sort((a,b)=>a-b).map(n => `#${n}`).join(", ") 
                          : t("seats.none")}
                      </span>
                    </div>

                    {/* Dashed Separator Line */}
                    <div className="border-t border-dashed border-white/20 my-4" />

                    <div className="flex justify-between items-end">
                      <span className="text-sm text-sky-200/70 font-semibold">{t("seats.total")}:</span>
                      <span className="text-2xl font-black text-sky-300">
                        {(selectedSeats.length * parseFloat(selectedSchedule.price_base)).toFixed(2)} PLN
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <Button
                  onClick={handleAddToCart}
                  disabled={selectedSeats.length !== passengerCount}
                  className="w-full h-14 bg-action hover:bg-action-hover text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform active:scale-[0.98] disabled:bg-gray-150 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span>
                    {selectedSeats.length === passengerCount 
                      ? t("seats.addToCart") 
                      : (language === "pl" 
                          ? `Wybierz jeszcze ${passengerCount - selectedSeats.length} miejsc(a)` 
                          : `Select ${passengerCount - selectedSeats.length} more seat(s)`)}
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
