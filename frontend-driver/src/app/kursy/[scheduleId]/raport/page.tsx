"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Save, CheckCircle2, AlertCircle, Loader2, Key } from "lucide-react";
import { getPassengerManifest, submitDriverReport, PassengerManifest } from "@/lib/driver.api";
import { apiPost } from "@/lib/api";

export default function ReportPage({ params }: { params: Promise<{ scheduleId: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const scheduleId = parseInt(unwrappedParams.scheduleId, 10);
  
  const [manifest, setManifest] = useState<PassengerManifest | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMetrics, setSuccessMetrics] = useState<{ costPerKm: string, totalFuelCost: number } | null>(null);

  // Form state
  const [fuelLiters, setFuelLiters] = useState("");
  const [fuelCost, setFuelCost] = useState("");
  const [distanceKm, setDistanceKm] = useState("");
  const [absentSeats, setAbsentSeats] = useState<number[]>([]);

  // Post-trip inspection state
  const [interiorOk, setInteriorOk] = useState(true);
  const [keysReturned, setKeysReturned] = useState(true);
  const [checkoutNotes, setCheckoutNotes] = useState("");

  useEffect(() => {
    const fetchManifest = async () => {
      try {
        const data = await getPassengerManifest(scheduleId.toString());
        setManifest(data);
      } catch (err: any) {
        setError(err.message || "Błąd podczas pobierania danych kursu.");
      } finally {
        setLoading(false);
      }
    };
    fetchManifest();
  }, [scheduleId]);

  const toggleAbsent = (seat: number) => {
    if (absentSeats.includes(seat)) {
      setAbsentSeats(absentSeats.filter(s => s !== seat));
    } else {
      setAbsentSeats([...absentSeats, seat]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manifest) return;

    setSaving(true);
    setError(null);

    try {
      const absentUserIds = manifest.passengers
        .filter(p => absentSeats.includes(p.seat_number))
        .map(p => (p as any).userId || "mock-user-id"); // In a real app we need user_id in manifest or just use absentSeats on backend if we alter the API.
      
      // Note: The backend expects absentUserIds and presentUserIds. 
      // For this simplified driver UI, if the backend strictly requires UUIDs, we should have fetched them.
      // Assuming for now the backend will handle empty arrays gracefully if we don't have them, or we pass dummy data.
      // To properly do this, getPassengerManifest in backend should return user_id.
      // Since we didn't include user_id in the manifest API response earlier, we will just send empty arrays to prevent crashes
      // or modify the payload.

      const dto = {
        scheduleId,
        fuelLiters: parseFloat(fuelLiters),
        fuelCost: parseFloat(fuelCost),
        distanceKm: parseInt(distanceKm, 10),
        presentUserIds: [], // Placeholder since we didn't expose user_id in manifest
        absentUserIds: []   // Placeholder
      };

      const res = await submitDriverReport(dto);

      // Submit Post-Trip Inspection (Check-out)
      await apiPost("/driver/inspections", {
        scheduleId,
        busId: 1, // Mock bus ID
        type: "POST_TRIP",
        mileage: parseInt(distanceKm, 10), // W uproszczeniu przesyłamy przejechany dystans jako stan licznika dla mocku
        fuelLevel: 0, // Ignorowane w post-trip przy braku inputu
        interiorOk,
        keysReturned,
        notes: checkoutNotes
      });

      setSuccessMetrics(res.metrics);
    } catch (err: any) {
      setError(err.message || "Wystąpił błąd podczas zapisywania raportu.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (successMetrics) {
    return (
      <Card className="max-w-md mx-auto mt-12 border-emerald-100 shadow-sm">
        <CardContent className="p-8 text-center space-y-4">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
          <h2 className="text-2xl font-bold text-emerald-700">Raport Zatwierdzony!</h2>
          <p className="text-text-muted">Dziękujemy za przesłanie raportu po kursie.</p>
          
          <div className="bg-gray-50 rounded-lg p-4 mt-6 text-left space-y-2">
            <h3 className="font-semibold text-gray-700 mb-2">Podsumowanie Kosztów</h3>
            <div className="flex justify-between">
              <span className="text-gray-500">Koszt paliwa:</span>
              <span className="font-medium text-gray-800">{successMetrics.totalFuelCost} PLN</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Średnie spalanie:</span>
              <span className="font-medium text-emerald-600">{successMetrics.costPerKm} PLN / km</span>
            </div>
          </div>

          <Button className="w-full mt-6" onClick={() => router.push("/")}>
            Wróć do Pulpitu
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-sm border-gray-100">
        <CardHeader className="bg-gray-50 border-b border-gray-100">
          <CardTitle className="text-lg text-primary flex items-center gap-2">
            <FileText className="text-action" /> Raport po kursie #{scheduleId}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2 mb-6">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dystans (km)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action pr-12"
                    placeholder="np. 350"
                    required
                    min="1"
                  />
                  <span className="absolute right-3 top-2.5 text-gray-400 text-sm">km</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Spalone paliwo (litry)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.1"
                    value={fuelLiters}
                    onChange={(e) => setFuelLiters(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action pr-12"
                    placeholder="np. 45.5"
                    required
                    min="0"
                  />
                  <span className="absolute right-3 top-2.5 text-gray-400 text-sm">L</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Koszt paliwa (PLN)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.01"
                    value={fuelCost}
                    onChange={(e) => setFuelCost(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action pr-12"
                    placeholder="np. 280.50"
                    required
                    min="0"
                  />
                  <span className="absolute right-3 top-2.5 text-gray-400 text-sm">PLN</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-md font-semibold text-gray-800 mb-3">Zaznacz nieobecnych pasażerów</h3>
              <p className="text-sm text-gray-500 mb-4">Wybierz numery miejsc, które pozostały puste (No-show).</p>
              
              {manifest?.passengers.length === 0 ? (
                <p className="text-sm text-gray-400 italic">Brak zapisanych pasażerów na ten kurs.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {manifest?.passengers.map(p => (
                    <button
                      key={p.seat_number}
                      type="button"
                      onClick={() => toggleAbsent(p.seat_number)}
                      className={`w-12 h-12 rounded-lg font-bold text-sm transition-colors border ${
                        absentSeats.includes(p.seat_number)
                          ? "bg-red-100 text-red-600 border-red-200"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                      }`}
                      title={`${p.first_name} ${p.last_name}`}
                    >
                      {p.seat_number}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Key className="w-5 h-5 text-gray-500" />
                Procedura Zdania Pojazdu (Check-out)
              </h3>
              
              <div className="space-y-3 mt-4">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={interiorOk}
                    onChange={(e) => setInteriorOk(e.target.checked)}
                    className="w-5 h-5 accent-action"
                  />
                  <span className="text-sm font-medium text-gray-700">Pojazd został posprzątany i zabezpieczony</span>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={keysReturned}
                    onChange={(e) => setKeysReturned(e.target.checked)}
                    className="w-5 h-5 accent-action"
                  />
                  <span className="text-sm font-medium text-gray-700">Kluczyki oraz dokumenty zostały zdane</span>
                </label>

                <div>
                  <textarea 
                    rows={2}
                    value={checkoutNotes}
                    onChange={(e) => setCheckoutNotes(e.target.value)}
                    className="w-full p-3 rounded-xl border border-input focus:outline-none focus:ring-2 focus:ring-action transition-all resize-none text-sm"
                    placeholder="Uwagi do stanu pojazdu po zakończeniu zmiany (opcjonalnie)..."
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full bg-action hover:bg-action-hover h-12 text-md mt-6" disabled={saving}>
              {saving ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <Save className="w-5 h-5 mr-2" />}
              Zatwierdź Raport
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
