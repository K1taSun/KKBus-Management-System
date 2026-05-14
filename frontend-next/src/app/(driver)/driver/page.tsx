"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Clock, Users } from "lucide-react";

export default function DriverPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-primary">Dzisiejsze Trasy</h2>
        <p className="text-sm text-text-muted">Czwartek, 14 Maja</p>
      </div>

      <div className="space-y-4">
        {/* Aktywna Trasa */}
        <Card className="border-2 border-action shadow-md">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded mb-2">Teraz Trwa</span>
                <h3 className="font-bold text-primary">Kraków → Katowice</h3>
                <p className="text-sm text-text-muted">Autokar: KR 12345</p>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">08:00</div>
                <div className="text-xs text-text-muted">Wyjazd</div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100">
              <div className="flex items-center gap-2 text-primary font-medium text-sm">
                <Users size={16} className="text-action" />
                48/50 Pasażerów
              </div>
              <button className="text-xs font-bold text-white bg-action px-3 py-1.5 rounded-md w-full">Lista Obecności</button>
            </div>
          </CardContent>
        </Card>

        {/* Przyszła Trasa */}
        <Card className="border border-gray-200 shadow-sm opacity-70">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-primary">Katowice → Kraków</h3>
              <p className="text-sm text-text-muted">Zaraz po zakończeniu obecnej</p>
            </div>
            <div className="text-right">
              <div className="font-bold text-lg flex items-center justify-end gap-1"><Clock size={16}/> 14:00</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <button className="w-full bg-primary text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2">
          <CheckCircle2 size={20} />
          Zakończ Kurs i Generuj Raport
        </button>
        <p className="text-xs text-center text-text-muted mt-2">Wymagane wpisanie stanu paliwa</p>
      </div>
    </div>
  );
}
