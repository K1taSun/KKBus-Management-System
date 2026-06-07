"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { apiPostFormData } from "@/lib/api";
import { AlertTriangle, Wrench, Camera, Loader2, Bus } from "lucide-react";

export default function UsterkiPage() {
  const busId = 1; // Przykładowo sztywny, ale docelowo wybrany z kontekstu
  const scheduleId = undefined;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    severity: "NISKA",
    description: "",
  });
  const [photo, setPhoto] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description) {
      toast.error("Podaj opis usterki.");
      return;
    }

    setLoading(true);
    const data = new FormData();
    data.append("busId", String(busId));
    if (scheduleId) data.append("scheduleId", String(scheduleId));
    data.append("severity", formData.severity);
    data.append("description", formData.description);
    if (photo) {
      data.append("photo", photo);
    }

    try {
      await apiPostFormData("/driver/defects", data);
      toast.success("Usterka została pomyślnie zgłoszona!");
      setFormData({ severity: "NISKA", description: "" });
      setPhoto(null);
    } catch (err: any) {
      toast.error(err.message || "Błąd podczas zgłaszania usterki.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col p-6">
      <div className="mb-6 flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-[#0B2136] flex items-center gap-2">
          <Wrench className="w-8 h-8 text-orange-500" />
          Zgłoś Usterkę
        </h1>
        <p className="text-[#64748B] text-sm">
          Dokumentacja uszkodzeń pojazdu i usterek mechanicznych.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex-1 flex flex-col gap-6">
        
        <div>
          <label className="block text-sm font-semibold text-[#0B2136] mb-2">Poziom Pilności</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "NISKA", label: "Niska", color: "bg-green-100 text-green-700 border-green-200" },
              { id: "ŚREDNIA", label: "Średnia", color: "bg-orange-100 text-orange-700 border-orange-200" },
              { id: "KRYTYCZNA", label: "Krytyczna", color: "bg-red-100 text-red-700 border-red-200" },
            ].map((severity) => (
              <button
                key={severity.id}
                type="button"
                onClick={() => setFormData({ ...formData, severity: severity.id })}
                className={`p-3 rounded-xl border text-sm font-bold transition-all ${
                  formData.severity === severity.id 
                    ? `ring-2 ring-offset-1 ${severity.id === 'KRYTYCZNA' ? 'ring-red-500' : severity.id === 'ŚREDNIA' ? 'ring-orange-500' : 'ring-green-500'} ${severity.color}`
                    : "bg-[#F8FAFC] border-gray-200 text-[#64748B] hover:bg-gray-50"
                }`}
              >
                {severity.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#0B2136] mb-2">Opis Usterki *</label>
          <textarea 
            rows={4}
            required
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E5FF] transition-all bg-[#F8FAFC] resize-none"
            placeholder="Opisz co dokładnie się stało lub co nie działa..."
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#0B2136] mb-2">Zdjęcie Dowodowe (Opcjonalnie)</label>
          <div className="flex items-center justify-center w-full">
            <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${photo ? 'border-[#00E5FF] bg-cyan-50' : 'border-gray-300 bg-[#F8FAFC] hover:bg-gray-50'}`}>
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Camera className={`w-8 h-8 mb-2 ${photo ? 'text-[#00E5FF]' : 'text-gray-400'}`} />
                <p className="text-sm text-gray-500 font-medium">
                  {photo ? photo.name : "Kliknij, aby zrobić zdjęcie lub wybrać plik"}
                </p>
              </div>
              <input 
                type="file" 
                accept="image/*"
                capture="environment"
                className="hidden" 
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setPhoto(e.target.files[0]);
                  }
                }}
              />
            </label>
          </div>
        </div>

        <div className="mt-auto pt-6">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0B2136] text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-[#1a3652] transition-colors disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <AlertTriangle className="w-6 h-6 text-orange-400" />}
            Wyślij Zgłoszenie
          </button>
        </div>
      </form>
    </div>
  );
}
