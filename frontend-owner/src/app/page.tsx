'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Activity, DollarSign, Fuel, Users } from 'lucide-react';
import toast from 'react-hot-toast';

interface FinancialMetrics {
  totalRevenue: number;
  totalTickets: number;
  totalReservations: number;
  revenueByRoute: { routeName: string; revenue: number }[];
  revenueByDate: { date: string; revenue: number }[];
}

interface FuelMetrics {
  totalDistance: number;
  totalFuelUsed: number;
  avgFuelConsumption: number;
  efficiencyByRoute: { routeName: string; totalDistance: number; totalFuel: number; consumptionPer100km: number }[];
}

export default function Dashboard() {
  const [financial, setFinancial] = useState<FinancialMetrics | null>(null);
  const [fuel, setFuel] = useState<FuelMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [finRes, fuelRes] = await Promise.all([
          api.get('/owner/analytics/financial'),
          api.get('/owner/analytics/fuel'),
        ]);
        setFinancial(finRes.data);
        setFuel(fuelRes.data);
      } catch {
        toast.error('Nie udało się pobrać danych analitycznych');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-slate-500">Ładowanie analityki...</div>;
  }

  if (!financial || !fuel) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Analityka Platformy</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Całkowity Przychód</p>
            <p className="text-2xl font-bold text-slate-900">{Number(financial.totalRevenue).toFixed(2)} PLN</p>
          </div>
          <div className="bg-green-100 p-3 rounded-lg"><DollarSign className="w-6 h-6 text-green-600" /></div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Sprzedane Bilety</p>
            <p className="text-2xl font-bold text-slate-900">{financial.totalTickets}</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-lg"><Users className="w-6 h-6 text-blue-600" /></div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Zużyte Paliwo</p>
            <p className="text-2xl font-bold text-slate-900">{Number(fuel.totalFuelUsed).toFixed(1)} L</p>
          </div>
          <div className="bg-orange-100 p-3 rounded-lg"><Fuel className="w-6 h-6 text-orange-600" /></div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Śr. Spalanie</p>
            <p className="text-2xl font-bold text-slate-900">{Number(fuel.avgFuelConsumption).toFixed(2)} L/100km</p>
          </div>
          <div className="bg-purple-100 p-3 rounded-lg"><Activity className="w-6 h-6 text-purple-600" /></div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Area Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Przychody (Ostatnie Dni)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={financial.revenueByDate} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Efficiency Bar Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Wydajność Paliwowa per Trasa (L/100km)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fuel.efficiencyByRoute} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="routeName" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="consumptionPer100km" name="Spalanie (L/100km)" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
