"use client";

import { useState, useEffect } from "react";
import { Clock, Map as MapIcon, Calendar, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

const BACKEND_URL = "http://localhost:3000/api";

interface TimetableItem {
  schedule_id: number;
  departure_time: string;
  arrival_time: string;
  route_name: string;
  stops: any;
}

interface RouteDirection {
  directionName: string;
  weekdays: string[];
  weekends: string[];
}

interface GroupedSchedule {
  baseRouteName: string;
  directions: RouteDirection[];
}

export function TimetableBoard() {
  const [groupedSchedules, setGroupedSchedules] = useState<GroupedSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BACKEND_URL}/public-info/timetable`)
      .then(res => res.json())
      .then((data: TimetableItem[]) => {
        const baseRoutesMap = new Map<string, { [dir: string]: { weekdays: Set<string>, weekends: Set<string> } }>();

        data.forEach(item => {
          let baseName = item.route_name;
          let directionName = "Kierunek: Główny";

          if (item.route_name.includes("POWRÓT")) {
            baseName = item.route_name.replace(" POWRÓT", "").replace("Katowice", "TEMP").replace("Kraków", "Katowice").replace("TEMP", "Kraków");
            // Extract the destination city from the original name
            const parts = item.route_name.replace(" POWRÓT", "").split(" – ");
            directionName = `Kierunek: ${parts[parts.length - 1]}`;
          } else {
            const parts = item.route_name.split(" – ");
            directionName = `Kierunek: ${parts[parts.length - 1]}`;
          }

          if (!baseRoutesMap.has(baseName)) {
            baseRoutesMap.set(baseName, {});
          }
          if (!baseRoutesMap.get(baseName)![directionName]) {
            baseRoutesMap.get(baseName)![directionName] = { weekdays: new Set(), weekends: new Set() };
          }
          
          const date = new Date(item.departure_time);
          const hours = date.getHours().toString().padStart(2, '0');
          const minutes = date.getMinutes().toString().padStart(2, '0');
          const timeString = `${hours}:${minutes}`;
          
          const day = date.getDay();
          const isWeekend = day === 0 || day === 6;

          if (isWeekend) {
            baseRoutesMap.get(baseName)![directionName].weekends.add(timeString);
          } else {
            baseRoutesMap.get(baseName)![directionName].weekdays.add(timeString);
          }
        });

        const parsed: GroupedSchedule[] = Array.from(baseRoutesMap.entries()).map(([baseRouteName, dirs]) => {
          const directions: RouteDirection[] = Object.entries(dirs).map(([directionName, sets]) => ({
            directionName,
            weekdays: Array.from(sets.weekdays).sort(),
            weekends: Array.from(sets.weekends).sort(),
          })).sort((a, b) => a.directionName.localeCompare(b.directionName));
          
          return { baseRouteName, directions };
        }).sort((a, b) => a.baseRouteName.localeCompare(b.baseRouteName));

        setGroupedSchedules(parsed);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching timetable:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (groupedSchedules.length === 0) {
    return (
      <div className="text-center py-20 bg-background rounded-2xl border border-border">
        <AlertCircle className="mx-auto h-12 w-12 text-text-muted mb-4" />
        <h3 className="text-xl font-medium text-text">Brak dostępnych rozkładów jazdy</h3>
        <p className="text-text-muted mt-2">Obecnie nie ma zaplanowanych żadnych kursów w systemie.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 mt-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-text flex items-center justify-center gap-3">
          <Calendar className="text-primary h-8 w-8" />
          Grafik Stałych Odjazdów
        </h2>
        <p className="text-text-muted mt-2">
          Poniżej znajduje się stały rozkład jazdy (godziny początkowe na głównym przystanku).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {groupedSchedules.map((route, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={route.baseRouteName} 
            className="bg-background rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4 mb-6 border-b border-border pb-4">
              <div className="bg-primary/10 p-3 rounded-xl shrink-0">
                <MapIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-text leading-tight">{route.baseRouteName}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-secondary/20 text-secondary text-xs font-medium">
                    Autobus Premium
                  </span>
                  {route.baseRouteName.includes("Ekspres") && (
                    <span className="px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-600 text-xs font-medium">
                      Trasa Ekspresowa
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {route.directions.map((dir, dIdx) => (
                <div key={dIdx} className="space-y-4">
                  <h4 className="text-lg font-bold text-primary border-l-4 border-primary pl-3">
                    {dir.directionName}
                  </h4>
                  
                  <div className="pl-4 space-y-4">
                    {/* Dni Robocze */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-text-muted" />
                        <span className="text-sm font-semibold text-text">Dni Robocze (Pon - Pt)</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {dir.weekdays.length > 0 ? dir.weekdays.map(time => (
                          <span key={time} className="px-2.5 py-1 bg-background-alt border border-border rounded-lg text-sm font-medium text-text hover:border-primary/50 hover:text-primary transition-colors cursor-default">
                            {time}
                          </span>
                        )) : (
                          <span className="text-sm text-text-muted">Brak kursów</span>
                        )}
                      </div>
                    </div>

                    {/* Weekendy */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-text-muted" />
                        <span className="text-sm font-semibold text-text">Weekendy (Sob - Niedz)</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {dir.weekends.length > 0 ? dir.weekends.map(time => (
                          <span key={time} className="px-2.5 py-1 bg-primary/5 border border-primary/20 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 transition-colors cursor-default">
                            {time}
                          </span>
                        )) : (
                          <span className="text-sm text-text-muted">Brak kursów</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
