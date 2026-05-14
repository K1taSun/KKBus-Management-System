"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MapPin, ArrowRightLeft, Calendar, Users, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const searchSchema = z.object({
  from: z.string().min(1, "Wpisz miasto wyjazdu"),
  to: z.string().min(1, "Wpisz miasto docelowe"),
  date: z.string().min(1, "Wybierz datę"),
  passengers: z.string().min(1, "Wybierz liczbę pasażerów"),
});

type SearchFormValues = z.infer<typeof searchSchema>;

export function SearchWidget() {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
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

  const onSubmit = async (data: SearchFormValues) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
  };

  const handleSwap = () => {
    const currentFrom = getValues("from");
    const currentTo = getValues("to");
    setValue("from", currentTo);
    setValue("to", currentFrom);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 relative z-10 w-full max-w-5xl mx-auto -mt-24 md:-mt-16">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col md:flex-row items-end gap-4 md:gap-2">
        {/* Od */}
        <div className="w-full md:flex-1 relative">
          <label htmlFor="from" className="block text-xs font-semibold text-text-muted mb-1 ml-1">Skąd</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              id="from"
              placeholder="Miasto wyjazdu"
              {...register("from")}
              className={`w-full h-12 pl-10 pr-3 rounded-lg border bg-background-alt text-sm focus:outline-none focus:ring-2 focus:ring-action transition-all ${
                errors.from ? "border-red-500 focus:ring-red-500" : "border-gray-200"
              }`}
            />
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
            <label htmlFor="to" className="block text-xs font-semibold text-text-muted ml-1">Dokąd</label>
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
              placeholder="Miasto docelowe"
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
    </div>
  );
}
