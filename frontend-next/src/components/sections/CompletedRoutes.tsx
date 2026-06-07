"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/lib/LanguageContext";

// Przykładowa baza tras do losowania
const sampleRoutes = [
  { from: "Kraków", to: "Katowice" },
  { from: "Katowice", to: "Kraków" },
];

interface CompletedRoute {
  id: string;
  from: string;
  to: string;
  time: string;
}

const BACKEND_URL = "http://localhost:3000/api";

export function CompletedRoutes() {
  const [routes, setRoutes] = useState<CompletedRoute[]>([]);
  const { t } = useTranslation();

  // Pobieranie danych z API z pollingiem co 5 sekund
  useEffect(() => {
    const fetchCompletedRoutes = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/public-info/completed-courses`);
        if (!res.ok) throw new Error("Network response was not ok");
        const data = await res.json();
        
        const parsed = data.map((row: any) => {
          const parts = row.route_name.split('–');
          const from = parts[0]?.trim() || 'Kraków';
          const to = parts[1]?.replace(/\(.*\)/, '')?.trim() || 'Katowice';
          const date = new Date(row.submitted_at);
          return {
            id: String(row.id),
            from,
            to,
            time: date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }),
          };
        });

        if (parsed.length === 0) {
          // Dane próbne jeśli baza jest pusta
          const initialRoutes = Array.from({ length: 4 }).map((_, i) => {
            const route = sampleRoutes[Math.floor(Math.random() * sampleRoutes.length)];
            const date = new Date();
            date.setMinutes(date.getMinutes() - (i * 15 + 2)); // Cofamy czas
            return {
              id: `initial-${i}`,
              from: route.from,
              to: route.to,
              time: date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }),
            };
          });
          setRoutes(initialRoutes);
        } else {
          setRoutes(parsed);
        }
      } catch (err) {
        console.error("Błąd podczas pobierania zrealizowanych kursów:", err);
      }
    };

    fetchCompletedRoutes();
    const interval = setInterval(fetchCompletedRoutes, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-16 bg-background-main border-t border-gray-100">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          
          <div className="md:w-1/2 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-semibold">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              {t("live.status")}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-primary">{t("live.title")}</h2>
            <p className="text-lg text-text-muted">
              {t("live.desc")}
            </p>
          </div>

          <div className="md:w-1/2 w-full max-w-md mx-auto">
            <Card className="border-0 shadow-2xl bg-white overflow-hidden rounded-2xl">
              <CardHeader className="bg-primary text-white border-b border-primary-light pb-4">
                <CardTitle className="flex items-center text-lg gap-2">
                  <CheckCircle2 size={20} className="text-green-400" />
                  {t("live.cardTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 bg-slate-50">
                <div className="relative h-[320px] overflow-hidden p-4 flex flex-col gap-3">
                  <AnimatePresence mode="popLayout">
                    {routes.map((route) => (
                      <motion.div
                        key={route.id}
                        layout
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-action/10 flex items-center justify-center text-action">
                            <MapPin size={18} />
                          </div>
                          <div>
                            <div className="font-bold text-primary text-sm md:text-base">
                              {route.from} <span className="text-action mx-1">→</span> {route.to}
                            </div>
                            <div className="text-xs text-green-600 font-medium mt-0.5 flex items-center gap-1">
                              <CheckCircle2 size={12} /> {t("live.success")}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end text-xs text-text-muted font-medium">
                          <Clock size={14} className="mb-1 text-gray-400" />
                          {route.time}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {/* Efekt zanikania na dole listy */}
                  <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none" />
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </section>
  );
}
