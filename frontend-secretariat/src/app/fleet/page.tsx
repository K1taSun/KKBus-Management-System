"use client";

import { useState, useEffect } from "react";
import { apiGet, apiPatch } from "@/lib/api";
import { toast } from "react-hot-toast";
import { Bus, Loader2, Wrench, CheckCircle, AlertTriangle } from "lucide-react";

export default function FleetPage() {
  const [buses, setBuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  const fetchBuses = async () => {
    setLoading(true);
    try {
      const res = await apiGet<any[]>("/secretariat/buses");
      setBuses(res);
    } catch (err) {
      toast.error("Błąd podczas pobierania floty");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuses();
  }, []);

  const handleStatusChange = async (busId: number, newStatus: string) => {
    setUpdating(busId);
    try {
      await apiPatch(`/secretariat/buses/${busId}/status`, { status: newStatus });
      toast.success("Status pojazdu zaktualizowany");
      fetchBuses();
    } catch (err: any) {
      toast.error(err.message || "Wystąpił błąd");
    } finally {
      setUpdating(null);
    }
  };

  if (loading && buses.length === 0) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Dostępny': return 'text-green-600 bg-green-50 border-green-200';
      case 'W trasie': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'W serwisie': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Złom': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Dostępny': return <CheckCircle size={16} />;
      case 'W trasie': return <Bus size={16} />;
      case 'W serwisie': return <Wrench size={16} />;
      case 'Złom': return <AlertTriangle size={16} />;
      default: return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Bus className="text-blue-600" size={28} />
        <h1 className="text-2xl font-bold text-gray-800">Zarządzanie Flotą</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b text-xs uppercase text-gray-700">
            <tr>
              <th className="px-6 py-4">ID / Numer Rejestracyjny</th>
              <th className="px-6 py-4">Pojemność</th>
              <th className="px-6 py-4">Obecny Status</th>
              <th className="px-6 py-4">Akcje (Zmień Status)</th>
            </tr>
          </thead>
          <tbody>
            {buses.map((bus) => (
              <tr key={bus.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-mono font-medium text-gray-900">
                  {bus.plate_number} <span className="text-gray-400 text-xs">(ID: {bus.id})</span>
                </td>
                <td className="px-6 py-4">{bus.capacity} miejsc</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(bus.status)}`}>
                    {getStatusIcon(bus.status)}
                    {bus.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <select 
                    className="border border-gray-300 rounded px-2 py-1 text-sm disabled:opacity-50"
                    value={bus.status}
                    disabled={updating === bus.id}
                    onChange={(e) => handleStatusChange(bus.id, e.target.value)}
                  >
                    <option value="Dostępny">Dostępny</option>
                    <option value="W trasie">W trasie</option>
                    <option value="W serwisie">W serwisie</option>
                    <option value="Złom">Złom</option>
                  </select>
                  {updating === bus.id && <Loader2 className="inline ml-2 animate-spin text-gray-400" size={16} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
