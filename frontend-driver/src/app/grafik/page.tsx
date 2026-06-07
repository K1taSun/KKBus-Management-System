"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Save, AlertCircle, Loader2, CheckCircle2, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { getDriverAvailability, setDriverAvailability, deleteDriverAvailability, AvailabilityStatus } from "@/lib/driver.api";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, parseISO } from "date-fns";
import { pl } from "date-fns/locale";

export default function DriverGrafik() {
  const [availabilities, setAvailabilities] = useState<AvailabilityStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Selected day state for the form
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [status, setStatus] = useState("Dostępny");

  useEffect(() => {
    fetchAvailabilities();
  }, []);

  const fetchAvailabilities = async () => {
    try {
      const data = await getDriverAvailability();
      setAvailabilities(data);
    } catch {
      setMessage({ text: "Nie udało się pobrać grafiku.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const getAvailabilityForDate = (date: Date) => {
    return availabilities.find(a => isSameDay(parseISO(a.available_date), date));
  };

  const handleDateClick = (day: Date) => {
    const isAlreadySelected = selectedDates.some(d => isSameDay(d, day));
    
    if (isAlreadySelected) {
      // Remove it
      setSelectedDates(prev => prev.filter(d => !isSameDay(d, day)));
    } else {
      // Add it
      setSelectedDates(prev => [...prev, day]);
      
      // Auto-set the status if it's the first selection
      if (selectedDates.length === 0) {
        const existing = getAvailabilityForDate(day);
        if (existing) setStatus(existing.status);
        else setStatus("Dostępny");
      }
    }
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDates.length === 0) return;

    setSaving(true);
    setMessage(null);

    try {
      const promises = selectedDates.map(date => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        return setDriverAvailability({ availableDate: dateStr, status });
      });
      
      await Promise.all(promises);
      setMessage({ text: `Zaktualizowano dostępność dla ${selectedDates.length} dni.`, type: "success" });
      await fetchAvailabilities();
      setSelectedDates([]); // clear selection after success
    } catch (err: any) {
      setMessage({ text: err.message || "Błąd podczas zapisu.", type: "error" });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDelete = async () => {
    if (selectedDates.length === 0) return;
    
    const datesToDelete = selectedDates.filter(d => getAvailabilityForDate(d));
    if (datesToDelete.length === 0) return;

    if (!confirm(`Czy na pewno chcesz usunąć dyspozycyjność dla wybranych (${datesToDelete.length}) dni?`)) return;
    
    setMessage(null);
    try {
      const promises = datesToDelete.map(date => {
        const existing = getAvailabilityForDate(date);
        const dateOnly = new Date(existing!.available_date).toISOString().split('T')[0];
        return deleteDriverAvailability(dateOnly);
      });

      await Promise.all(promises);
      setMessage({ text: "Usunięto wybrane dyspozycyjności.", type: "success" });
      setSelectedDates([]);
      await fetchAvailabilities();
    } catch (err: any) {
      setMessage({ text: err.message || "Błąd podczas usuwania.", type: "error" });
    } finally {
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case "Dostępny": return "bg-emerald-500";
      case "Niedostępny": return "bg-red-500";
      case "Urlop": return "bg-blue-500";
      case "Zwolnienie": return "bg-purple-500";
      default: return "bg-gray-300";
    }
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, "d");
        const cloneDay = day;
        const av = getAvailabilityForDate(cloneDay);
        const isSelected = selectedDates.some(d => isSameDay(d, cloneDay));
        const isCurrentMonth = isSameMonth(day, monthStart);

        days.push(
          <div
            key={day.toString()}
            onClick={() => handleDateClick(cloneDay)}
            className={`min-h-[80px] p-2 border border-gray-100 flex flex-col cursor-pointer transition-all ${
              !isCurrentMonth ? "bg-gray-50 text-gray-400" : "bg-white hover:bg-gray-50"
            } ${isSelected ? "ring-2 ring-inset ring-action z-10" : ""}`}
          >
            <div className="flex justify-between items-start mb-1">
              <span className={`text-sm font-semibold ${isSelected ? "text-action" : ""}`}>
                {formattedDate}
              </span>
              {av && (
                <div 
                  className={`w-2.5 h-2.5 rounded-full ${getStatusColor(av.status)}`}
                  title={av.status}
                />
              )}
            </div>
            {av && (
              <div className="mt-auto">
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full text-white truncate block text-center ${getStatusColor(av.status)}`}>
                  {av.status}
                </span>
              </div>
            )}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">{rows}</div>;
  };

  const renderDays = () => {
    const days = ["Pon", "Wto", "Śro", "Czw", "Pią", "Sob", "Nie"];
    return (
      <div className="grid grid-cols-7 mb-2 bg-gray-50 rounded-t-xl border border-gray-200 border-b-0 overflow-hidden">
        {days.map((day, i) => (
          <div key={i} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  // Ensure we display some selection info
  const hasSelectedWithExisting = selectedDates.some(d => getAvailabilityForDate(d));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Kolumna boczna: Formularz edycji wybranego dnia */}
      <div className="lg:col-span-1 order-2 lg:order-1">
        <Card className="shadow-sm border-gray-100 sticky top-24">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-primary">
              <CalendarIcon size={20} className="text-action" /> 
              Dyspozycyjność
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100 text-center">
              <div className="text-sm text-gray-500 uppercase tracking-wider mb-1">Wybrane Dni</div>
              {selectedDates.length === 0 ? (
                <div className="text-gray-400 font-medium">Kliknij dni w kalendarzu</div>
              ) : (
                <div className="flex flex-col gap-1">
                  <div className="text-xl font-bold text-gray-800">
                    Wybrano {selectedDates.length} dni
                  </div>
                  <div className="text-xs text-gray-500 overflow-y-auto max-h-24">
                    {selectedDates.map(d => format(d, "dd.MM.yyyy")).join(", ")}
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value)}
                  className="flex h-12 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-md ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
                >
                  <option value="Dostępny">Dostępny</option>
                  <option value="Niedostępny">Niedostępny</option>
                  <option value="Urlop">Urlop</option>
                  <option value="Zwolnienie">Zwolnienie</option>
                </select>
              </div>

              {message && (
                <div className={`p-3 rounded-xl text-sm flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                  {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  {message.text}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button 
                  type="submit" 
                  className="flex-1 bg-action hover:bg-action-hover h-12" 
                  disabled={saving || selectedDates.length === 0}
                >
                  {saving ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Zapisz
                </Button>
                
                {hasSelectedWithExisting && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="h-12 w-12 p-0 flex-shrink-0 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200" 
                    onClick={handleDelete}
                    title="Usuń wpis"
                    disabled={saving}
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Kolumna główna: Interaktywny Kalendarz */}
      <div className="lg:col-span-2 order-1 lg:order-2">
        <Card className="shadow-sm border-gray-100">
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <CardTitle className="text-xl text-primary font-bold">
              Grafik Pracy
            </CardTitle>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={prevMonth} className="h-8 w-8 rounded-full">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-md font-semibold min-w-[120px] text-center capitalize">
                {format(currentMonth, "MMMM yyyy", { locale: pl })}
              </span>
              <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8 rounded-full">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {renderDays()}
            {renderCells()}
            
            <div className="mt-6 flex flex-wrap gap-4 text-xs text-gray-500 font-medium">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Dostępny</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500"></div> Niedostępny</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-blue-500"></div> Urlop</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-purple-500"></div> Zwolnienie</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
