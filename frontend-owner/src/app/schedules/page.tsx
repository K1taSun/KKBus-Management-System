'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { CalendarClock, AlertTriangle, CheckCircle2 } from 'lucide-react';

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

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSchedules = async () => {
    try {
      // W normalnej apce zrobilibyśmy endpoint GET /owner/schedules,
      // ale załóżmy, że pobieramy z sekretariatu na razie by widzieć cokolwiek, albo symulujemy.
      // Moduł Ownera pozwala na PATCH /owner/schedules/:id/override.
      // Backend Owner ma: (no GET endpoint implemented for schedules in owner module).
      const res = await api.get('/owner/schedules?date=' + format(new Date(), 'yyyy-MM-dd'));
      setSchedules(res.data);
    } catch {
      toast.error('Nie udało się pobrać grafiku (Możliwy brak uprawnień - wymagany GET /owner/schedules)');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleOverride = async (scheduleId: number) => {
    const driverId = prompt('Podaj UUID nowego kierowcy:');
    if (!driverId) return;

    try {
      await api.patch(`/owner/schedules/${scheduleId}/override`, { driverId });
      toast.success('Grafik nadpisany (Brak konfliktów)');
      fetchSchedules();
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error('Konflikt! Ten kierowca ma już zaplanowany kurs w tym czasie.', { duration: 5000 });
      } else {
        toast.error('Błąd podczas nadpisywania');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Nadzór nad Grafikami</h1>
        <p className="text-sm text-slate-500 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Moduł wymuszania zmian z weryfikacją nakładających się kursów (Overlap Check)
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Trasa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Czas (Od - Do)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Kierowca</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Pojazd</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Wymuszenie</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {schedules.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {s.route.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {format(new Date(s.departure_time), 'HH:mm')} - {format(new Date(s.arrival_time), 'HH:mm')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {s.driver.first_name} {s.driver.last_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {s.bus.registration_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleOverride(s.id)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-50 text-orange-700 hover:bg-orange-100 rounded-md transition-colors"
                    >
                      <CalendarClock className="w-4 h-4" />
                      Override
                    </button>
                  </td>
                </tr>
              ))}
              {schedules.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Brak grafików na dzisiaj.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
