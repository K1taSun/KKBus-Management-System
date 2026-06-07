"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Users, FileText, AlertCircle, Loader2, Navigation } from "lucide-react";
import { getDriverSchedules, DriverSchedule } from "@/lib/driver.api";
import { useTranslation } from "@/lib/LanguageContext";
import { apiGet } from "@/lib/api";

export default function DriverDashboard() {
  const router = useRouter();
  const { language } = useTranslation();
  const [schedules, setSchedules] = useState<DriverSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);

  useEffect(() => {
    const fetchProfileAndSchedules = async () => {
      try {
        const profile = await apiGet<{ role?: string }>("/auth/profile");
        // In a real app we might verify profile.role === 'Kierowca', but backend enforces it via guards.
      } catch {
        setNeedsLogin(true);
        return;
      }

      try {
        const data = await getDriverSchedules();
        setSchedules(data);
      } catch (err: any) {
        setError(err.message || "Wystąpił błąd podczas ładowania kursów.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileAndSchedules();
  }, []);

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString(language === "pl" ? "pl-PL" : "en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(language === "pl" ? "pl-PL" : "en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (needsLogin) {
    return (
      <Card className="max-w-md mx-auto mt-12 text-center p-8">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-4">Wymagane logowanie</h2>
        <Button onClick={() => router.push("/login")}>Zaloguj się</Button>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
        <AlertCircle size={20} />
        {error}
      </div>
    );
  }

  const upcomingSchedules = schedules.filter(s => new Date(s.departure_time) >= new Date(new Date().setHours(0,0,0,0)));
  const pastSchedules = schedules.filter(s => new Date(s.departure_time) < new Date(new Date().setHours(0,0,0,0)));

  const renderScheduleList = (list: DriverSchedule[], emptyMessage: string, showReportBtn = false) => {
    if (list.length === 0) {
      return <p className="text-text-muted py-8 text-center">{emptyMessage}</p>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {list.map(schedule => (
          <Card key={schedule.id} className="border-gray-100 shadow-sm hover:shadow-md transition-all h-full flex flex-col">
            <CardContent className="p-5 flex-1 flex flex-col gap-4">
              <div className="flex-1 space-y-4">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-action uppercase tracking-wider bg-action/10 px-2 py-1 rounded-md inline-block mb-2">
                      {formatDate(schedule.departure_time)}
                    </span>
                    <div className="font-bold text-lg text-primary">
                      <div className="flex items-start gap-2">
                        <MapPin size={18} className="text-action shrink-0 mt-0.5" />
                        <span className="break-words leading-tight">{schedule.route_name}</span>
                      </div>
                      {schedule.stops && schedule.stops.length > 0 && (
                        <div className="text-xs text-text-muted font-normal italic max-w-full break-words leading-relaxed pl-6 mt-1.5">
                          Przez: {schedule.stops.join(" ➔ ")}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono bg-gray-100 px-2 py-1 rounded text-sm text-gray-700 font-semibold border border-gray-200">
                      {schedule.registration_number}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm text-text-muted border-y border-gray-50 py-3">
                  <div className="flex items-center gap-1.5">
                    <Navigation size={16} className="text-gray-400" />
                    <span className="font-medium text-gray-700">{formatTime(schedule.departure_time)}</span>
                    <span className="text-xs text-gray-400 mx-1">→</span>
                    <span className="font-medium text-gray-700">{formatTime(schedule.arrival_time)}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2 mt-auto flex-wrap">
                <Button 
                  onClick={() => router.push(`/kursy/${schedule.id}/check-in`)}
                  className="flex-1 bg-primary hover:bg-primary-light text-white flex items-center gap-2"
                >
                  <Users size={16} /> Odbiór / Lista
                </Button>
                <Button 
                  onClick={() => router.push(`/pojazdy/1/teczka`)} // Hardcoded busId=1 for simplicity, docelowo z schedule.bus_id
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <FileText size={16} /> Teczka
                </Button>
                {showReportBtn && (
                  <Button 
                    variant="outline"
                    onClick={() => router.push(`/kursy/${schedule.id}/raport`)}
                    className="flex-1 border-action text-action hover:bg-action hover:text-white flex items-center gap-2"
                  >
                    <FileText size={16} /> Raport
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
          <Clock className="text-action" /> Nadchodzące i Dzisiejsze Kursy
        </h2>
        {renderScheduleList(upcomingSchedules, "Brak zaplanowanych kursów na dziś i w przyszłości.", true)}
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-400 mb-4 flex items-center gap-2">
          <FileText className="text-gray-400" /> Historia Kursów
        </h2>
        {renderScheduleList(pastSchedules, "Brak historii kursów.", true)}
      </section>
    </div>
  );
}
