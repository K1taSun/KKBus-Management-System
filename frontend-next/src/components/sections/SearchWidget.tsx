"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MapPin, ArrowRightLeft, Calendar, Users, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/CartProvider";

const LOCATION_OPTIONS = [
  "Kraków MDA",
  "Kraków Balice Lotnisko",
  "Chrzanów",
  "Jaworzno",
  "Mysłowice",
  "Olkusz",
  "Dąbrowa Górnicza",
  "Oświęcim",
  "Tychy",
  "Katowice Dworzec",
  "Katowice Pyrzowice Lotnisko",
];

const ROUTE_STOPS = [
  "Kraków MDA",
  "Kraków Balice Lotnisko",
  "Chrzanów",
  "Jaworzno",
  "Mysłowice",
  "Olkusz",
  "Dąbrowa Górnicza",
  "Oświęcim",
  "Tychy",
  "Katowice Dworzec",
  "Katowice Pyrzowice Lotnisko",
];

const DEPARTURE_TIMES = ["05:40", "07:10", "09:30", "12:00", "14:20", "16:45", "19:15", "21:10"];

const WEEK_DAYS = ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"];
const MONTHS = [
  "Styczeń",
  "Luty",
  "Marzec",
  "Kwiecień",
  "Maj",
  "Czerwiec",
  "Lipiec",
  "Sierpień",
  "Wrzesień",
  "Październik",
  "Listopad",
  "Grudzień",
];

const STOP_OFFSETS: Record<string, number> = {
  "Kraków MDA": 0,
  "Kraków Balice Lotnisko": 25,
  "Chrzanów": 55,
  "Jaworzno": 75,
  "Mysłowice": 95,
  "Olkusz": 70,
  "Dąbrowa Górnicza": 105,
  "Oświęcim": 85,
  "Tychy": 120,
  "Katowice Dworzec": 110,
  "Katowice Pyrzowice Lotnisko": 155,
};

const isValidLocation = (val: string) => {
  const v = val.trim().toLowerCase();
  return LOCATION_OPTIONS.some(opt => opt.toLowerCase() === v);
};

const searchSchema = z.object({
  from: z.string().min(1, "Wpisz miejsce wyjazdu").refine(isValidLocation, "Wybierz przystanek z listy"),
  to: z.string().min(1, "Wpisz miejsce docelowe").refine(isValidLocation, "Wybierz przystanek z listy"),
  date: z.string().min(1, "Wybierz datę"),
  passengers: z.string().min(1, "Wybierz liczbę pasażerów"),
}).refine(data => data.from !== data.to, {
  message: "Skąd i Dokąd muszą być różne",
  path: ["to"]
});

type SearchFormValues = z.infer<typeof searchSchema>;

interface Connection {
  id: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  duration: string;
  route: string;
  seats: number;
  price: string;
}

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const toTime = (minutes: number) => {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60).toString().padStart(2, "0");
  const mins = (normalized % 60).toString().padStart(2, "0");

  return `${hours}:${mins}`;
};

const toInputDate = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDisplayDate = (dateValue: string) => {
  if (!dateValue) return "Wybierz datę";

  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${dateValue}T12:00:00`));
};

const getCalendarDays = (monthDate: Date) => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const firstWeekday = (firstDay.getDay() + 6) % 7;
  const days: Array<Date | null> = Array.from({ length: firstWeekday }, () => null);

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    days.push(new Date(year, month, day));
  }

  while (days.length % 7 !== 0) {
    days.push(null);
  }

  return days;
};

const getStopIndex = (stop: string) => ROUTE_STOPS.indexOf(stop);

const getDurationLabel = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return hours > 0 ? `${hours}h ${mins.toString().padStart(2, "0")}min` : `${mins}min`;
};

const getRouteLabel = (from: string, to: string, isForward: boolean) => {
  if ([from, to].some((stop) => stop === "Olkusz" || stop === "Dąbrowa Górnicza")) {
    return isForward ? "Przez Olkusz" : "Przez Dąbrowę Górniczą i Olkusz";
  }

  if ([from, to].some((stop) => stop === "Oświęcim" || stop === "Tychy")) {
    return isForward ? "Przez Oświęcim i Tychy" : "Przez Tychy i Oświęcim";
  }

  return isForward ? "Przez A4" : "Przez A4 do Krakowa";
};

const getPassengerLabel = (passengers: string) => {
  if (passengers === "1") return "1 osoba";
  if (passengers === "4") return "4+ osoby";

  return `${passengers} osoby`;
};

const getConnections = ({ from, to, date, passengers }: SearchFormValues): Connection[] => {
  const fromIndex = getStopIndex(from);
  const toIndex = getStopIndex(to);

  if (fromIndex === -1 || toIndex === -1) return [];

  const isForward = fromIndex < toIndex;
  const distanceInStops = Math.max(1, Math.abs(toIndex - fromIndex));
  const duration = Math.abs(STOP_OFFSETS[to] - STOP_OFFSETS[from]);
  const dateSeed = date.split("-").reduce((sum, part) => sum + Number(part), 0);
  const passengerCount = Number(passengers);

  return DEPARTURE_TIMES.map((baseTime, index) => {
    const baseMinutes = toMinutes(baseTime);
    const departureMinutes = isForward
      ? baseMinutes + STOP_OFFSETS[from]
      : baseMinutes + STOP_OFFSETS[ROUTE_STOPS[ROUTE_STOPS.length - 1]] - STOP_OFFSETS[from];
    const arrivalMinutes = departureMinutes + duration;
    const price = (19 + distanceInStops * 5 + (index % 3) * 2) * passengerCount;

    return {
      id: `${date}-${from}-${to}-${baseTime}`,
      from,
      to,
      departure: toTime(departureMinutes),
      arrival: toTime(arrivalMinutes),
      duration: getDurationLabel(duration),
      route: getRouteLabel(from, to, isForward),
      seats: 8 + ((dateSeed + index * 7) % 34),
      price: `${price} zł`,
    };
  });
};

export function SearchWidget() {
  const [isLoading, setIsLoading] = useState(false);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [searched, setSearched] = useState<SearchFormValues | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const { addTicket } = useCart();

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      from: "",
      to: "",
      date: new Date().toISOString().split("T")[0],
      passengers: "1",
    },
  });

  const selectedDate = watch("date");
  const calendarDays = useMemo(() => getCalendarDays(visibleMonth), [visibleMonth]);
  const todayValue = toInputDate(new Date());

  const onSubmit = async (data: SearchFormValues) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setConnections(getConnections(data));
    setSearched(data);
    setIsLoading(false);
  };

  const handleSwap = () => {
    const currentFrom = getValues("from");
    const currentTo = getValues("to");
    setValue("from", currentTo);
    setValue("to", currentFrom);
  };

  const handleSelectDate = (date: Date) => {
    setValue("date", toInputDate(date), { shouldValidate: true });
    setIsCalendarOpen(false);
  };

  const handleAddToCart = (connection: Connection) => {
    if (!searched) return;

    addTicket({
      id: `${connection.id}-${searched.passengers}`,
      from: connection.from,
      to: connection.to,
      date: searched.date,
      departure: connection.departure,
      arrival: connection.arrival,
      duration: connection.duration,
      route: connection.route,
      passengers: getPassengerLabel(searched.passengers),
      price: connection.price,
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 relative z-10 w-full max-w-5xl mx-auto -mt-24 md:-mt-16">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col md:flex-row items-end gap-4 md:gap-2">
        {/* Od */}
        <div className="w-full md:flex-1 relative">
           <div className="flex justify-between items-center mb-1">
            <label htmlFor="from" className="block text-xs font-semibold text-text-muted ml-1">Skąd</label>
            {errors.from && <span className="text-[10px] text-red-500">{errors.from.message}</span>}
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              id="from"
              list="locations-list"
              placeholder="Miasto lub przystanek"
              {...register("from")}
              className={`w-full h-12 pl-10 pr-3 rounded-lg border bg-background-alt text-sm focus:outline-none focus:ring-2 focus:ring-action transition-all ${
                errors.from ? "border-red-500 focus:ring-red-500" : "border-gray-200"
              }`}
            />
            <datalist id="locations-list">
              {LOCATION_OPTIONS.map(opt => (
                <option key={opt} value={opt} />
              ))}
            </datalist>
          </div>
        </div>

        {/* Swap Button (Mobile: hidden or inline, Desktop: icon button) */}
        <div className="hidden md:flex flex-col justify-end pb-1">
          <button
            type="button"
            onClick={handleSwap}
            className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
            aria-label="Zamień miejscami"
          >
            <ArrowRightLeft size={18} />
          </button>
        </div>

        {/* Do */}
        <div className="w-full md:flex-1 relative">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-2">
              <label htmlFor="to" className="block text-xs font-semibold text-text-muted ml-1">Dokąd</label>
              {errors.to && <span className="text-[10px] text-red-500">{errors.to.message}</span>}
            </div>
            {/* Mobile swap button */}
            <button
              type="button"
              onClick={handleSwap}
              className="md:hidden text-action text-xs font-medium flex items-center gap-1"
            >
              <ArrowRightLeft size={12} /> Zamień
            </button>
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              id="to"
              list="locations-list"
              placeholder="Miasto lub przystanek"
              {...register("to")}
              className={`w-full h-12 pl-10 pr-3 rounded-lg border bg-background-alt text-sm focus:outline-none focus:ring-2 focus:ring-action transition-all ${
                errors.to ? "border-red-500 focus:ring-red-500" : "border-gray-200"
              }`}
            />
          </div>
        </div>

        {/* Data */}
        <div className="w-full md:w-40 relative">
          <label htmlFor="date" className="block text-xs font-semibold text-text-muted mb-1 ml-1">Data</label>
          <div className="relative">
            <input id="date" type="hidden" {...register("date")} />
            <button
              type="button"
              onClick={() => setIsCalendarOpen((open) => !open)}
              className={`flex h-12 w-full items-center gap-2 rounded-lg border bg-background-alt px-3 text-left text-sm transition-all focus:outline-none focus:ring-2 focus:ring-action ${
                errors.date ? "border-red-500 focus:ring-red-500" : "border-gray-200"
              }`}
            >
              <Calendar className="shrink-0 text-gray-400" size={18} />
              <span className="truncate">{formatDisplayDate(selectedDate)}</span>
            </button>
            {isCalendarOpen && (
              <div className="absolute left-0 top-[calc(100%+0.5rem)] z-30 w-[min(19rem,calc(100vw-2rem))] rounded-lg border border-gray-100 bg-white p-3 shadow-2xl">
                <div className="mb-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setVisibleMonth((date) => new Date(date.getFullYear(), date.getMonth() - 1, 1))}
                    className="rounded-md p-2 text-text-muted hover:bg-background-alt hover:text-primary"
                    aria-label="Poprzedni miesiąc"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <div className="text-sm font-bold text-primary">
                    {MONTHS[visibleMonth.getMonth()]} {visibleMonth.getFullYear()}
                  </div>
                  <button
                    type="button"
                    onClick={() => setVisibleMonth((date) => new Date(date.getFullYear(), date.getMonth() + 1, 1))}
                    className="rounded-md p-2 text-text-muted hover:bg-background-alt hover:text-primary"
                    aria-label="Następny miesiąc"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-text-muted">
                  {WEEK_DAYS.map((day) => (
                    <div key={day} className="py-1">{day}</div>
                  ))}
                </div>
                <div className="mt-1 grid grid-cols-7 gap-1">
                  {calendarDays.map((date, index) => {
                    if (!date) {
                      return <div key={`empty-${index}`} className="h-9" />;
                    }

                    const value = toInputDate(date);
                    const isSelected = value === selectedDate;
                    const isPast = value < todayValue;

                    return (
                      <button
                        key={value}
                        type="button"
                        disabled={isPast}
                        onClick={() => handleSelectDate(date)}
                        className={`h-9 rounded-md text-sm font-medium transition-colors ${
                          isSelected
                            ? "bg-action text-white shadow-sm"
                            : "text-text-main hover:bg-background-alt"
                        } disabled:text-gray-300 disabled:hover:bg-transparent`}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pasażerowie */}
        <div className="w-full md:w-40 relative">
          <label htmlFor="passengers" className="block text-xs font-semibold text-text-muted mb-1 ml-1">Pasażerowie</label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <select
              id="passengers"
              {...register("passengers")}
              className="w-full h-12 pl-10 pr-8 rounded-lg border border-gray-200 bg-background-alt text-sm focus:outline-none focus:ring-2 focus:ring-action transition-all appearance-none"
            >
              <option value="1">1 osoba</option>
              <option value="2">2 osoby</option>
              <option value="3">3 osoby</option>
              <option value="4">4+ osób</option>
            </select>
          </div>
        </div>

        {/* Submit */}
        <div className="w-full md:w-auto mt-2 md:mt-0 pb-0">
          <Button
            type="submit"
            isLoading={isLoading}
            size="lg"
            className="w-full md:w-auto h-12 px-8 text-base font-bold bg-action hover:bg-action-hover"
          >
            {!isLoading && <Search size={20} className="mr-2" />}
            Szukaj
          </Button>
        </div>
      </form>

      {searched && (
        <div className="mt-6 border-t border-gray-100 pt-5">
          <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-primary">Dostępne kursy</h3>
              <p className="text-sm text-text-muted">
                {searched.from} → {searched.to}, {searched.date}
              </p>
            </div>
            <p className="text-sm font-medium text-action">{connections.length} połączeń</p>
          </div>

          <div className="space-y-3">
            {connections.map((connection) => (
              <div
                key={connection.id}
                className="grid gap-3 rounded-lg border border-gray-100 bg-background-alt p-4 md:grid-cols-[1fr_auto_auto] md:items-center"
              >
                <div>
                  <div className="flex items-center gap-3 text-primary">
                    <span className="text-xl font-bold">{connection.departure}</span>
                    <span className="h-px w-8 bg-gray-300" />
                    <span className="text-xl font-bold">{connection.arrival}</span>
                  </div>
                  <p className="mt-1 text-sm text-text-muted">
                    {connection.from} → {connection.to} · {connection.duration} · {connection.route}
                  </p>
                </div>
                <div className="text-sm text-text-muted md:text-right">
                  <span className="font-semibold text-text-main">{connection.seats}</span> wolnych miejsc
                </div>
                <div className="flex items-center justify-between gap-4 md:justify-end">
                  <span className="text-lg font-bold text-primary">{connection.price}</span>
                  <Button
                    type="button"
                    onClick={() => handleAddToCart(connection)}
                    className="h-10 bg-action hover:bg-action-hover"
                  >
                    Wybierz
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
