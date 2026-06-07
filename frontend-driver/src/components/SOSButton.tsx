"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";
import { AlertCircle, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

interface SOSButtonProps {
  busId: number;
  scheduleId?: number;
}

export default function SOSButton({ busId, scheduleId }: SOSButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleSOS = () => {
    if (!confirm("OSTRZEŻENIE: Czy na pewno chcesz wysłać sygnał SOS do dyspozytorni? Używaj tylko w sytuacjach awaryjnych!")) {
      return;
    }

    setLoading(true);
    
    if (!navigator.geolocation) {
      toast.error("Geolokalizacja nie jest wspierana przez twoją przeglądarkę.");
      sendSOSWithoutLocation();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        sendSOSWithLocation(latitude, longitude);
      },
      (error) => {
        console.error("Błąd pobierania lokalizacji:", error);
        toast.error("Nie udało się pobrać lokalizacji GPS. Wysyłanie SOS bez koordynatów.");
        sendSOSWithoutLocation();
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const sendSOSWithLocation = async (latitude: number, longitude: number) => {
    try {
      await apiPost("/driver/sos", {
        busId,
        scheduleId,
        latitude,
        longitude
      });
      toast.success("Sygnał SOS wysłany pomyślnie. Dyspozytornia została powiadomiona.");
    } catch (err: any) {
      toast.error(err.message || "Błąd podczas wysyłania sygnału SOS.");
    } finally {
      setLoading(false);
    }
  };

  const sendSOSWithoutLocation = async () => {
    try {
      await apiPost("/driver/sos", {
        busId,
        scheduleId,
        // Domyślne wartości (np. 0.0), żeby zaspokoić walidację backendu DTO, 
        // ale w docelowej implementacji latitude/longitude mogłoby być optional
        latitude: 0.0,
        longitude: 0.0
      });
      toast.success("Sygnał SOS wysłany bez lokalizacji.");
    } catch (err: any) {
      toast.error(err.message || "Błąd podczas wysyłania sygnału SOS.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSOS}
      disabled={loading}
      className="fixed bottom-6 right-6 w-16 h-16 bg-red-600 text-white rounded-full shadow-[0_0_15px_rgba(220,38,38,0.6)] flex items-center justify-center hover:bg-red-700 hover:scale-105 transition-all focus:outline-none focus:ring-4 focus:ring-red-500/50 disabled:opacity-70 disabled:scale-100 z-50"
      title="Wezwij Pomoc (SOS)"
    >
      {loading ? (
        <Loader2 className="w-8 h-8 animate-spin" />
      ) : (
        <AlertCircle className="w-8 h-8" />
      )}
    </button>
  );
}
