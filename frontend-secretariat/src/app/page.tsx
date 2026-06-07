"use client";

import { useState, useEffect } from "react";
import { apiGet } from "@/lib/api";
import { Users, Bus, Calendar, Loader2 } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<any>("/secretariat/dashboard")
      .then(res => setMetrics(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Panel Główny Sekretariatu</h1>
      <p className="text-gray-600">Szybki podgląd bieżącego stanu operacyjnego KKBus.</p>
      
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Szybkie Akcje</h2>
          <div className="flex flex-col gap-3">
            <Link href="/clients/new" className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-blue-600 font-medium">
              + Dodaj Nowego Klienta
            </Link>
            <Link href="/schedules" className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-blue-600 font-medium">
              + Zaplanuj Nowy Kurs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
