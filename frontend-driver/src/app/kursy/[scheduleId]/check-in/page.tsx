"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { apiPost } from "@/lib/api";
import { CheckSquare, ArrowRight, Loader2, Bus } from "lucide-react";

export default function CheckInPage({ params }: { params: Promise<{ scheduleId: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const scheduleId = parseInt(unwrappedParams.scheduleId, 10);
  const busId = 1; // W przyszłości pobierane z kontekstu kursu (getSchedules -> bus_id)
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    mileage: "",
    fuelLevel: "50",
    lightsOk: true,
    tiresOk: true,
    interiorOk: true,
    fluidsOk: true,
    emergencyEquipmentOk: true,
    notes: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.mileage || isNaN(Number(formData.mileage))) {
      toast.error("Podaj poprawny przebieg.");
      return;
    }

    setLoading(true);
    try {
      await apiPost("/driver/inspections", {
        scheduleId,
        busId,
        type: "PRE_TRIP",
        mileage: Number(formData.mileage),
        fuelLevel: Number(formData.fuelLevel),
        lightsOk: formData.lightsOk,
        tiresOk: formData.tiresOk,
        interiorOk: formData.interiorOk,
        fluidsOk: formData.fluidsOk,
        emergencyEquipmentOk: formData.emergencyEquipmentOk,
        notes: formData.notes
      });
      toast.success("Odbiór pojazdu zatwierdzony!");
      // Po udanym check-in przekierowujemy kierowcę do widoku manifestu pasażerów
      router.push(`/kursy/${scheduleId}`);
    } catch (err: any) {
      toast.error(err.message || "Błąd podczas zapisu inspekcji.");
    } finally {
      setLoading(false);
    }
  };

  const toggleCheck = (field: keyof typeof formData) => {
    setFormData(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col p-6">
      <div className="mb-6 flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-[#0B2136] flex items-center gap-2">
          <Bus className="w-8 h-8 text-[#00E5FF]" />
          Odbiór Pojazdu
        </h1>
        <p className="text-[#64748B] text-sm">
          Wypełnij listę kontrolną przed wyruszeniem w trasę (Kurs #{scheduleId}).
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex-1 flex flex-col gap-6">
        
        {/* Przebieg i Paliwo */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#0B2136] mb-2">Przebieg (km) *</label>
            <input 
              type="number"
              required
              value={formData.mileage}
              onChange={(e) => setFormData({...formData, mileage: e.target.value})}
              className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E5FF] transition-all bg-[#F8FAFC]"
              placeholder="np. 145000"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#0B2136] mb-2">Paliwo (%)</label>
            <input 
              type="number"
              min="0" max="100"
              required
              value={formData.fuelLevel}
              onChange={(e) => setFormData({...formData, fuelLevel: e.target.value})}
              className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E5FF] transition-all bg-[#F8FAFC]"
              placeholder="0 - 100"
            />
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Checklist */}
        <div>
          <h3 className="font-semibold text-[#0B2136] mb-4">Stan Techniczny</h3>
          <div className="flex flex-col gap-3">
            {[
              { id: "lightsOk", label: "Oświetlenie działa poprawnie" },
              { id: "tiresOk", label: "Stan opon w normie" },
              { id: "interiorOk", label: "Wnętrze posprzątane" },
              { id: "fluidsOk", label: "Płyny eksploatacyjne w normie" },
              { id: "emergencyEquipmentOk", label: "Wyposażenie awaryjne (gaśnica, apteczka)" },
            ].map((item) => (
              <label key={item.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-[#F8FAFC] cursor-pointer hover:bg-gray-50 transition-colors">
                <input 
                  type="checkbox" 
                  checked={formData[item.id as keyof typeof formData] as boolean}
                  onChange={() => toggleCheck(item.id as keyof typeof formData)}
                  className="w-5 h-5 accent-[#00E5FF] cursor-pointer"
                />
                <span className="text-[#0B2136] font-medium text-sm">{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Uwagi */}
        <div>
          <label className="block text-sm font-semibold text-[#0B2136] mb-2">Uwagi dodatkowe</label>
          <textarea 
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E5FF] transition-all bg-[#F8FAFC] resize-none"
            placeholder="Widoczne nowe zarysowania, brak płynu do spryskiwaczy..."
          />
        </div>

        <div className="mt-auto pt-6">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0B2136] text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-[#1a3652] transition-colors disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckSquare className="w-6 h-6 text-[#00E5FF]" />}
            Zatwierdź Odbiór
            {!loading && <ArrowRight className="w-5 h-5 ml-1" />}
          </button>
        </div>
      </form>
    </div>
  );
}
