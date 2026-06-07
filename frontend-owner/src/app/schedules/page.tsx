'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { 
  CalendarClock, 
  AlertTriangle, 
  Search, 
  Calendar, 
  X, 
  Save, 
  User, 
  Bus as BusIcon, 
  Clock, 
  Loader2, 
  ArrowRight,
  Filter
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: {
    name: string;
  };
}

interface Bus {
  id: number;
  registration_number: string;
  model: string;
  capacity: number;
  status: string;
}

interface Schedule {
  id: number;
  departure_time: string;
  arrival_time: string;
  status: string;
  driver: {
    id: string;
    first_name: string;
    last_name: string;
  };
  bus: {
    id: number;
    registration_number: string;
  };
  route: {
    name: string;
  };
}

const formatForDatetimeLocal = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [drivers, setDrivers] = useState<User[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filtering & search
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [searchQuery, setSearchQuery] = useState('');

  // Modal / Editing State
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [editDriverId, setEditDriverId] = useState('');
  const [editBusId, setEditBusId] = useState('');
  const [editDepartureTime, setEditDepartureTime] = useState('');
  const [editArrivalTime, setEditArrivalTime] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async (date: string) => {
    setIsLoading(true);
    try {
      const [schedulesRes, usersRes, busesRes] = await Promise.all([
        api.get(`/owner/schedules?date=${date}`),
        api.get('/owner/users'),
        api.get('/owner/buses')
      ]);
      
      setSchedules(schedulesRes.data);
      
      // Filter for drivers
      const filteredDrivers = usersRes.data.filter((u: any) => 
        u.role?.name?.toLowerCase() === 'kierowca' || u.role?.name === 'Driver'
      );
      setDrivers(filteredDrivers);
      setBuses(busesRes.data);
    } catch (err: any) {
      toast.error('Błąd podczas pobierania danych grafików i floty');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedDate);
  }, [selectedDate]);

  const openOverrideModal = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setEditDriverId(schedule.driver.id);
    setEditBusId(schedule.bus.id.toString());
    setEditDepartureTime(formatForDatetimeLocal(schedule.departure_time));
    setEditArrivalTime(formatForDatetimeLocal(schedule.arrival_time));
  };

  const closeOverrideModal = () => {
    setSelectedSchedule(null);
  };

  const handleOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchedule) return;

    if (!editDriverId || !editBusId || !editDepartureTime || !editArrivalTime) {
      toast.error('Proszę uzupełnić wszystkie wymagane pola');
      return;
    }

    if (new Date(editArrivalTime) <= new Date(editDepartureTime)) {
      toast.error('Czas przyjazdu musi być późniejszy niż czas odjazdu');
      return;
    }

    setIsSaving(true);
    try {
      await api.patch(`/owner/schedules/${selectedSchedule.id}/override`, {
        driverId: editDriverId,
        busId: Number(editBusId),
        departureTime: new Date(editDepartureTime).toISOString(),
        arrivalTime: new Date(editArrivalTime).toISOString()
      });

      toast.success('Grafik został pomyślnie nadpisany!');
      closeOverrideModal();
      fetchData(selectedDate);
    } catch (error: any) {
      console.error(error);
      const errMsg = error.response?.data?.message || 'Błąd podczas nadpisywania grafiku';
      toast.error(errMsg, { duration: 6000 });
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered schedules for search query
  const filteredSchedules = schedules.filter(s => {
    const query = searchQuery.toLowerCase();
    const routeName = s.route?.name?.toLowerCase() || '';
    const driverName = `${s.driver?.first_name} ${s.driver?.last_name}`.toLowerCase();
    const busPlate = s.bus?.registration_number?.toLowerCase() || '';
    
    return routeName.includes(query) || driverName.includes(query) || busPlate.includes(query);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <CalendarClock className="text-blue-600 w-8 h-8" />
            Nadzór nad Grafikami
          </h1>
          <p className="text-sm text-slate-500 mt-1">Zarządzanie terminami, pojazdami i kierowcami z weryfikacją kolizji.</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl flex items-start gap-2.5 max-w-md shadow-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-semibold block mb-0.5">Tryb Wymuszenia (Override)</span>
            Wymuszanie zmian pomija standardowe ograniczenia handlowe, ale wciąż sprawdza dostępność kierowcy pod kątem nakładających się zmian.
          </div>
        </div>
      </div>

      {/* Control panel (date picker and search bar) */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-9 pr-4 py-2 w-full border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <span className="text-xs text-slate-400 flex items-center gap-1 font-medium bg-slate-50 px-2.5 py-1.5 rounded-md border">
            <Filter size={12} /> Dzień
          </span>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Szukaj trasy, kierowcy lub autobusu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 w-full border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Table grid */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Trasa</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Czas (Od - Do)</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Kierowca</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Pojazd</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Opcje</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredSchedules.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                    {s.route.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-slate-400" />
                      <span>{format(new Date(s.departure_time), 'HH:mm')}</span>
                      <ArrowRight size={12} className="text-slate-400" />
                      <span>{format(new Date(s.arrival_time), 'HH:mm')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-xs font-bold">
                        {s.driver.first_name[0]}{s.driver.last_name[0]}
                      </div>
                      <span>{s.driver.first_name} {s.driver.last_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <BusIcon size={14} className="text-slate-400" />
                      <span className="font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs border border-slate-200">
                        {s.bus.registration_number}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {s.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openOverrideModal(s)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 rounded-lg transition-all font-semibold cursor-pointer border border-blue-100"
                    >
                      <CalendarClock className="w-4 h-4" />
                      Edytuj / Override
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSchedules.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <CalendarClock className="w-8 h-8 text-slate-300" />
                      <span className="font-medium">Brak grafików pasujących do wybranych kryteriów.</span>
                    </div>
                  </td>
                </tr>
              )}
              {isLoading && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex justify-center items-center gap-2">
                      <Loader2 className="animate-spin text-blue-600" size={20} />
                      <span>Ładowanie danych...</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Override Dialog / Modal */}
      {selectedSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity" 
            onClick={closeOverrideModal}
          />

          {/* Modal content container */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden relative z-10 transform transition-all animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="bg-slate-950 p-6 text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <CalendarClock className="text-blue-400" />
                  Wymuszenie nadpisania kursu
                </h2>
                <p className="text-xs text-slate-400 mt-1 font-medium">Kurs #{selectedSchedule.id} &bull; {selectedSchedule.route.name}</p>
              </div>
              <button 
                onClick={closeOverrideModal}
                className="text-slate-400 hover:text-white transition-colors p-1 bg-slate-900 rounded-lg border border-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleOverrideSubmit} className="p-6 space-y-4">
              {/* Alert notice */}
              <div className="bg-orange-50 border border-orange-100 p-3 rounded-lg flex items-start gap-2 text-xs text-orange-800">
                <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Uwaga:</strong> Zapisanie tych zmian zastąpi aktualne przypisania floty i kierowców dla wybranej tury.
                </div>
              </div>

              {/* Driver Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Kierowca
                </label>
                <select
                  value={editDriverId}
                  onChange={(e) => setEditDriverId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                >
                  <option value="">Wybierz kierowcę...</option>
                  {drivers.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.first_name} {d.last_name} ({d.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Bus Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Pojazd / Autobus
                </label>
                <select
                  value={editBusId}
                  onChange={(e) => setEditBusId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                >
                  <option value="">Wybierz pojazd...</option>
                  {buses.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.registration_number} - {b.model} (Miejsc: {b.capacity})
                    </option>
                  ))}
                </select>
              </div>

              {/* Times Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Godzina Odjazdu
                  </label>
                  <input
                    type="datetime-local"
                    value={editDepartureTime}
                    onChange={(e) => setEditDepartureTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Godzina Przyjazdu
                  </label>
                  <input
                    type="datetime-local"
                    value={editArrivalTime}
                    onChange={(e) => setEditArrivalTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  />
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeOverrideModal}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Zapisywanie...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Wymuś Nadpisanie
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
