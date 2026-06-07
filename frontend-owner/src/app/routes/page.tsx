'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { MapPin, MapPinOff, Edit, Plus, Save, X, Trash2 } from 'lucide-react';
import { Route, StopDto } from '@/types';
import RouteMap from '@/components/RouteMap';

export default function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Edit / Create State
  const [editingRoute, setEditingRoute] = useState<Route | Partial<Route> | null>(null);

  const fetchRoutes = async () => {
    try {
      const res = await api.get('/owner/routes');
      // Normalize stops depending on old format vs new format
      const normalizedRoutes = res.data.map((r: any) => ({
        ...r,
        stops: Array.isArray(r.stops) 
          ? r.stops.map((s: any) => typeof s === 'string' ? { name: s, lat: 52.0, lng: 19.0 } : s)
          : []
      }));
      setRoutes(normalizedRoutes);
    } catch {
      toast.error('Nie udało się pobrać tras');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleDeactivate = async (id: number) => {
    const reason = prompt('Podaj powód dezaktywacji (np. Koniec sezonu):');
    if (!reason) return;

    try {
      await api.patch(`/owner/routes/${id}/deactivate`, { reason });
      toast.success('Trasa została zarchiwizowana');
      fetchRoutes();
    } catch {
      toast.error('Błąd podczas archiwizacji trasy');
    }
  };

  const handleSaveRoute = async () => {
    if (!editingRoute?.name || !editingRoute.stops || editingRoute.stops.length === 0) {
      toast.error('Nazwa trasy oraz minimum jeden przystanek są wymagane');
      return;
    }

    const payload = {
      name: editingRoute.name,
      totalDistanceKm: editingRoute.total_distance_km || 100, // Default distance if empty
      stops: editingRoute.stops,
    };

    try {
      if ('id' in editingRoute && editingRoute.id) {
        // Update existing
        await api.put(`/owner/routes/${editingRoute.id}`, payload);
        toast.success('Trasa zaktualizowana');
      } else {
        // Create new
        await api.post('/owner/routes', payload);
        toast.success('Nowa trasa została utworzona');
      }
      setEditingRoute(null);
      fetchRoutes();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Wystąpił błąd podczas zapisywania');
    }
  };

  const updateStopName = (index: number, newName: string) => {
    if (!editingRoute) return;
    const newStops = [...(editingRoute.stops || [])];
    newStops[index].name = newName;
    setEditingRoute({ ...editingRoute, stops: newStops });
  };

  const removeStop = (index: number) => {
    if (!editingRoute) return;
    const newStops = [...(editingRoute.stops || [])];
    newStops.splice(index, 1);
    setEditingRoute({ ...editingRoute, stops: newStops });
  };

  if (isLoading) return <div className="p-4 text-slate-500">Ładowanie tras...</div>;

  if (editingRoute) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-slate-900">
            {editingRoute.id ? 'Edycja Trasy' : 'Nowa Trasa'}
          </h1>
          <div className="flex gap-3">
            <button
              onClick={() => setEditingRoute(null)}
              className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-2 font-medium"
            >
              <X className="w-5 h-5" />
              Anuluj
            </button>
            <button
              onClick={handleSaveRoute}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 font-medium shadow-sm"
            >
              <Save className="w-5 h-5" />
              Zapisz
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formularz trasy */}
          <div className="lg:col-span-1 space-y-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nazwa trasy</label>
              <input
                type="text"
                className="w-full rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                value={editingRoute.name || ''}
                onChange={(e) => setEditingRoute({ ...editingRoute, name: e.target.value })}
                placeholder="np. Kraków - Zakopane"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Całkowity dystans (km)</label>
              <input
                type="number"
                min="1"
                className="w-full rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                value={editingRoute.total_distance_km || ''}
                onChange={(e) => setEditingRoute({ ...editingRoute, total_distance_km: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-slate-900">Przystanki</h3>
                <span className="text-xs text-slate-500">Kliknij na mapie, by dodać</span>
              </div>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {(editingRoute.stops || []).map((stop: StopDto, index: number) => (
                  <div key={index} className="flex gap-2 items-center bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                      {index + 1}
                    </div>
                    <input
                      type="text"
                      className="flex-1 text-sm border-slate-300 rounded focus:ring-blue-500 focus:border-blue-500 p-1.5"
                      value={stop.name}
                      onChange={(e) => updateStopName(index, e.target.value)}
                    />
                    <button
                      onClick={() => removeStop(index)}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {(!editingRoute.stops || editingRoute.stops.length === 0) && (
                  <p className="text-sm text-slate-500 text-center py-4">Brak przystanków. Kliknij na mapę!</p>
                )}
              </div>
            </div>
          </div>

          {/* Mapa */}
          <div className="lg:col-span-2">
            <RouteMap
              stops={editingRoute.stops as StopDto[] || []}
              onStopsChange={(stops) => setEditingRoute({ ...editingRoute, stops })}
              isEditing={true}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Zarządzanie Trasami</h1>
        <button
          onClick={() => setEditingRoute({ name: '', total_distance_km: 100, stops: [] })}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 font-medium shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Dodaj Trasę
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {routes.map((route) => (
          <div key={route.id} className={`bg-white p-6 rounded-xl border shadow-sm flex flex-col ${route.is_active ? 'border-slate-200' : 'border-red-200 opacity-75'}`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{route.name}</h3>
                <p className="text-sm text-slate-500">Dystans: {route.total_distance_km} km</p>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${route.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {route.is_active ? 'Aktywna' : 'Zarchiwizowana'}
              </span>
            </div>

            <div className="flex-1">
              <div className="text-sm text-slate-600 space-y-2 mb-6">
                {route.stops && route.stops.map((stop, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-blue-500 bg-white z-10 shrink-0" />
                    <span className="truncate">{stop.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setEditingRoute(route)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium text-sm"
              >
                <Edit className="w-4 h-4" />
                Edytuj
              </button>
              {route.is_active && (
                <button
                  onClick={() => handleDeactivate(route.id)}
                  className="flex items-center justify-center px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  title="Archiwizuj"
                >
                  <MapPinOff className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
        {routes.length === 0 && (
          <div className="col-span-full p-8 text-center bg-white rounded-xl border border-slate-200">
            <p className="text-slate-500">Brak tras w systemie.</p>
          </div>
        )}
      </div>
    </div>
  );
}
