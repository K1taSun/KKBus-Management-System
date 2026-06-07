"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from "@/lib/api";
import { toast } from "react-hot-toast";
import { Bus, Loader2, Wrench, CheckCircle, AlertTriangle, Trash2, Edit, Plus, X, Save } from "lucide-react";

const busSchema = z.object({
  plateNumber: z.string().min(2, "Wprowadź numer rejestracyjny (min. 2 znaki)"),
  model: z.string().min(2, "Wprowadź model pojazdu (min. 2 znaki)"),
  capacity: z.string().min(1, "Wprowadź pojemność").refine(val => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Pojemność musi być liczbą dodatnią",
  }),
});

type BusFormValues = z.infer<typeof busSchema>;

export default function FleetPage() {
  const [buses, setBuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [updating, setUpdating] = useState<number | null>(null);
  const [editingBus, setEditingBus] = useState<any | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<BusFormValues>({
    resolver: zodResolver(busSchema),
    defaultValues: {
      plateNumber: "",
      model: "",
      capacity: "",
    },
  });

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

  const startEdit = (bus: any) => {
    setEditingBus(bus);
    setValue("plateNumber", bus.plate_number);
    setValue("model", bus.model || "");
    setValue("capacity", String(bus.capacity));
  };

  const cancelEdit = () => {
    setEditingBus(null);
    reset();
  };

  const onSubmit = async (data: BusFormValues) => {
    setActionLoading(true);
    try {
      if (editingBus) {
        await apiPut(`/secretariat/buses/${editingBus.id}`, {
          registrationNumber: data.plateNumber,
          model: data.model,
          capacity: Number(data.capacity),
        });
        toast.success("Dane pojazdu zostały zaktualizowane!");
      } else {
        await apiPost("/secretariat/buses", {
          registrationNumber: data.plateNumber,
          model: data.model,
          capacity: Number(data.capacity),
        });
        toast.success("Nowy pojazd został dodany do floty!");
      }
      cancelEdit();
      fetchBuses();
    } catch (err: any) {
      toast.error(err.message || "Wystąpił błąd");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (busId: number, plateNumber: string) => {
    if (!window.confirm(`Czy na pewno chcesz usunąć pojazd ${plateNumber}?`)) {
      return;
    }

    try {
      await apiDelete(`/secretariat/buses/${busId}`);
      toast.success("Pojazd został usunięty z floty");
      if (editingBus?.id === busId) {
        cancelEdit();
      }
      fetchBuses();
    } catch (err: any) {
      toast.error(err.message || "Nie można usunąć pojazdu.");
    }
  };

  if (loading && buses.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Dostępny":
        return "text-green-600 bg-green-50 border-green-200";
      case "W trasie":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "W serwisie":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "Złom":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Dostępny":
        return <CheckCircle size={16} />;
      case "W trasie":
        return <Bus size={16} />;
      case "W serwisie":
        return <Wrench size={16} />;
      case "Złom":
        return <AlertTriangle size={16} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Bus className="text-blue-600" size={28} />
        <h1 className="text-2xl font-bold text-gray-800">Zarządzanie Flotą (Pojazdy)</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Panel */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6 self-start">
          <div className="flex items-center justify-between mb-4 border-b pb-2">
            <h2 className="text-lg font-semibold text-gray-800">
              {editingBus ? "Edycja Pojazdu" : "Nowy Pojazd"}
            </h2>
            {editingBus && (
              <button
                type="button"
                onClick={cancelEdit}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numer Rejestracyjny
              </label>
              <input
                type="text"
                placeholder="np. KR 12345"
                {...register("plateNumber")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 font-mono"
              />
              {errors.plateNumber && (
                <p className="text-red-500 text-sm mt-1">{errors.plateNumber.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model Pojazdu
              </label>
              <input
                type="text"
                placeholder="np. Mercedes Tourismo"
                {...register("model")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.model && (
                <p className="text-red-500 text-sm mt-1">{errors.model.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pojemność (Miejsca)
              </label>
              <input
                type="number"
                placeholder="np. 50"
                {...register("capacity")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.capacity && (
                <p className="text-red-500 text-sm mt-1">{errors.capacity.message}</p>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              {editingBus && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Anuluj
                </button>
              )}
              <button
                type="submit"
                disabled={actionLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex justify-center items-center gap-2"
              >
                {actionLoading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : editingBus ? (
                  <Save size={18} />
                ) : (
                  <Plus size={18} />
                )}
                {editingBus ? "Zapisz" : "Dodaj"}
              </button>
            </div>
          </form>
        </div>

        {/* List Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b text-xs uppercase text-gray-700">
              <tr>
                <th className="px-6 py-4">Rejestracja / Model</th>
                <th className="px-6 py-4">Pojemność</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {buses.map((bus) => (
                <tr key={bus.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-mono font-medium text-gray-900">
                      {bus.plate_number}
                    </div>
                    <div className="text-xs text-gray-400">
                      {bus.model || "Nieokreślony model"} (ID: {bus.id})
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-800">{bus.capacity} miejsc</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        bus.status
                      )}`}
                    >
                      {getStatusIcon(bus.status)}
                      {bus.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
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

                      <button
                        onClick={() => startEdit(bus)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edytuj dane pojazdu"
                      >
                        <Edit size={16} />
                      </button>

                      <button
                        onClick={() => handleDelete(bus.id, bus.plate_number)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Usuń pojazd z floty"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {buses.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    Brak pojazdów we flocie.
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
