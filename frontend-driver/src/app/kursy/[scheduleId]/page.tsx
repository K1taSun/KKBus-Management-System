"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Printer, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { getPassengerManifest, PassengerManifest } from "@/lib/driver.api";

export default function ManifestPage({ params }: { params: Promise<{ scheduleId: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const scheduleId = unwrappedParams.scheduleId;
  const [manifest, setManifest] = useState<PassengerManifest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchManifest = async () => {
      try {
        const data = await getPassengerManifest(scheduleId);
        setManifest(data);
      } catch (err: any) {
        setError(err.message || "Błąd podczas pobierania listy pasażerów.");
      } finally {
        setLoading(false);
      }
    };
    fetchManifest();
  }, [scheduleId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !manifest) {
    return (
      <Card className="max-w-md mx-auto mt-12 text-center p-8 border-red-100 shadow-sm">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-4 text-red-700">Brak Danych</h2>
        <p className="text-text-muted mb-6">{error || "Lista pasażerów jest pusta."}</p>
        <Button onClick={() => router.push("/")} variant="outline">Wróć do pulpitu</Button>
      </Card>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
          <Users className="text-action" /> Lista Pasażerów (Kurs #{scheduleId})
        </h2>
        <Button onClick={handlePrint} className="bg-primary hover:bg-primary-light text-white">
          <Printer size={18} className="mr-2" /> Drukuj / Zapisz PDF
        </Button>
      </div>

      <div className="hidden print:block mb-8">
        <h1 className="text-3xl font-bold mb-2">KKBus - Lista Pasażerów</h1>
        <p className="text-gray-600">Kurs ID: {scheduleId} • Łącznie pasażerów: {manifest.totalPassengers}</p>
        <p className="text-gray-600">Data wydruku: {new Date().toLocaleString()}</p>
        <hr className="mt-4 border-gray-300" />
      </div>

      <Card className="shadow-sm border-gray-100 print:shadow-none print:border-none">
        <CardHeader className="bg-gray-50 border-b border-gray-100 print:hidden">
          <CardTitle className="text-lg text-primary flex justify-between">
            <span>Łącznie pasażerów:</span>
            <span className="font-bold text-action">{manifest.totalPassengers}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 print:p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 print:bg-gray-100 text-left text-text-muted font-medium border-b border-gray-200">
                  <th className="px-5 py-4 w-20 text-center">Miejsce</th>
                  <th className="px-5 py-4">Pasażer</th>
                  <th className="px-5 py-4">Telefon</th>
                  <th className="px-5 py-4 text-right">Status Biletu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {manifest.passengers.map((p, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 print:hover:bg-transparent">
                    <td className="px-5 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-xs print:bg-transparent print:border print:border-gray-400">
                        {p.seat_number}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-medium text-primary">
                      {p.first_name} {p.last_name}
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {p.phone || "—"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border print:border-none print:px-0 ${
                        p.status === 'Opłacona' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 
                        p.status === 'Potwierdzona' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                        'bg-gray-100 text-gray-800 border-gray-200'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
            visibility: visible !important;
          }
          .container {
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          table, table * {
            visibility: visible;
          }
          table {
            position: absolute;
            left: 0;
            top: 150px;
            width: 100%;
          }
          .shadow-sm { box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
}
