"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiGet, apiPost } from "@/lib/api";
import { toast } from "react-hot-toast";
import { Calendar, Save, Loader2, RefreshCw } from "lucide-react";

const scheduleSchema = z.object({
  routeId: z.string().min(1, "Wybierz trasę"),
  busId: z.string().min(1, "Wybierz pojazd"),
  driverId: z.string().uuid("Wybierz kierowcę"),
  departureTime: z.string().min(1, "Wybierz czas odjazdu"),
  arrivalTime: z.string().min(1, "Wybierz czas przyjazdu"),
  priceBase: z.string().min(1, "Wprowadź cenę bazową"),
});

type ScheduleFormValues = z.infer<typeof scheduleSchema>;

export default function SchedulesPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      routeId: "",
      busId: "",
      priceBase: "",
      driverId: "",
      departureTime: "",
      arrivalTime: ""
    }
  });

  const fetchData = async () => {
    setFetching(true);
    try {
      const [dRes, rRes, bRes, sRes] = await Promise.all([
        apiGet<any[]>("/secretariat/drivers"),
        apiGet<any[]>("/secretariat/routes"),
        apiGet<any[]>("/secretariat/buses"),
        apiGet<any[]>("/secretariat/schedules"),
      ]);
      setDrivers(dRes);
      setRoutes(rRes);
      setBuses(bRes);
      setSchedules(sRes);
    } catch (err) {
      toast.error("Błąd podczas pobierania danych");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = async (data: ScheduleFormValues) => {
    setLoading(true);
    try {
      await apiPost("/secretariat/schedules", {
        ...data,
        routeId: Number(data.routeId),
        busId: Number(data.busId),
        priceBase: Number(data.priceBase)
      });
      toast.success("Grafik został utworzony!");
      reset();
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Wystąpił błąd");
    } finally {
      setLoading(false);
    }
  };

  if (fetching && schedules.length === 0) {
    return <div className="flex items-center justify-center p-12"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="text-blue-600" size={28} />
          <h1 className="text-2xl font-bold text-gray-800">Zarządzanie Grafikami i Flotą</h1>
        </div>
        <button onClick={fetchData} className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
          <RefreshCw size={20} className={fetching ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Nowy Grafik (Kurs)</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trasa</label>
              <select {...register("routeId")} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
                <option value="">Wybierz trasę...</option>
                {routes.map(r => <option key={r.id} value={r.id}>{r.name} ({r.estimated_duration_minutes} min)</option>)}
              </select>
              {errors.routeId && <p className="text-red-500 text-sm mt-1">{errors.routeId.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pojazd</label>
              <select {...register("busId")} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
                <option value="">Wybierz autobus...</option>
                {buses.map(b => (
                  <option key={b.id} value={b.id} disabled={b.status === 'W serwisie' || b.status === 'Złom'}>
                    {b.plate_number} - Miejsc: {b.capacity} ({b.status})
                  </option>
                ))}
              </select>
              {errors.busId && <p className="text-red-500 text-sm mt-1">{errors.busId.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kierowca</label>
              <select {...register("driverId")} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
                <option value="">Wybierz kierowcę...</option>
                {drivers.map(d => <option key={d.id} value={d.id}>{d.first_name} {d.last_name}</option>)}
              </select>
              {errors.driverId && <p className="text-red-500 text-sm mt-1">{errors.driverId.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Czas odjazdu</label>
              <input type="datetime-local" {...register("departureTime")} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
              {errors.departureTime && <p className="text-red-500 text-sm mt-1">{errors.departureTime.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Czas przyjazdu</label>
              <input type="datetime-local" {...register("arrivalTime")} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
              {errors.arrivalTime && <p className="text-red-500 text-sm mt-1">{errors.arrivalTime.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cena bazowa (PLN)</label>
              <input type="number" step="0.01" {...register("priceBase")} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
              {errors.priceBase && <p className="text-red-500 text-sm mt-1">{errors.priceBase.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex justify-center items-center gap-2 mt-4"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Zapisz Grafik
            </button>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center shrink-0">
             <h2 className="text-lg font-semibold text-gray-800">Aktualne Grafiki (Kursy)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3">Trasa</th>
                  <th className="px-4 py-3">Kierowca</th>
                  <th className="px-4 py-3">Pojazd</th>
                  <th className="px-4 py-3">Odjazd</th>
                  <th className="px-4 py-3">Przyjazd</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((s) => (
                  <tr key={s.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{s.route_name}</td>
                    <td className="px-4 py-3">{s.driver_first_name} {s.driver_last_name}</td>
                    <td className="px-4 py-3 font-mono text-xs">{s.bus_plate}</td>
                    <td className="px-4 py-3">{new Date(s.departure_time).toLocaleString('pl-PL')}</td>
                    <td className="px-4 py-3">{new Date(s.arrival_time).toLocaleString('pl-PL')}</td>
                  </tr>
                ))}
                {schedules.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">Brak zaplanowanych kursów.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
