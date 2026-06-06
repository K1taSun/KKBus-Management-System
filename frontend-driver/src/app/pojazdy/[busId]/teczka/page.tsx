"use client";

import { useState, useEffect } from "react";
import { apiGet } from "@/lib/api";
import { FileText, ShieldCheck, AlertCircle, FileKey } from "lucide-react";

interface VehicleDocument {
  doc_type: string;
  expiry_date: string;
  document_url: string;
}

export default function CyfrowaTeczkaPage({ params }: { params: { busId: string } }) {
  const [documents, setDocuments] = useState<VehicleDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const busId = params.busId;

  useEffect(() => {
    async function fetchDocs() {
      try {
        const data = await apiGet<VehicleDocument[]>(`/driver/vehicles/${busId}/documents`);
        setDocuments(data);
      } catch (err) {
        console.error("Błąd ładowania dokumentów:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDocs();
  }, [busId]);

  const isExpired = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  const getDocIcon = (type: string) => {
    switch (type) {
      case "OC":
      case "AC":
        return <ShieldCheck className="w-8 h-8 text-[#00E5FF]" />;
      case "PRZEGLĄD_TECHNICZNY":
        return <FileKey className="w-8 h-8 text-indigo-500" />;
      default:
        return <FileText className="w-8 h-8 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col p-6">
      <div className="mb-6 flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-[#0B2136] flex items-center gap-2">
          <FileText className="w-8 h-8 text-[#00E5FF]" />
          Cyfrowa Teczka
        </h1>
        <p className="text-[#64748B] text-sm">
          Dokumenty, polisy ubezpieczeniowe i przeglądy dla pojazdu #{busId}.
        </p>
      </div>

      {loading ? (
        <div className="flex-1 flex justify-center items-center">
          <div className="w-10 h-10 border-4 border-[#00E5FF] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex-1 flex flex-col items-center justify-center text-center">
          <FileText className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-[#0B2136]">Brak dokumentów</h2>
          <p className="text-[#64748B] mt-2">Dla tego pojazdu nie wgrano jeszcze żadnych cyfrowych dokumentów.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc, idx) => {
            const expired = isExpired(doc.expiry_date);
            return (
              <div key={idx} className={`bg-white p-5 rounded-2xl shadow-sm border flex items-center gap-4 transition-all ${expired ? 'border-red-300 bg-red-50' : 'border-gray-100'}`}>
                <div className={`p-3 rounded-xl ${expired ? 'bg-red-100' : 'bg-blue-50'}`}>
                  {getDocIcon(doc.doc_type)}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-[#0B2136] text-lg">{doc.doc_type.replace(/_/g, " ")}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-sm font-medium ${expired ? 'text-red-600' : 'text-[#64748B]'}`}>
                      Ważne do: {new Date(doc.expiry_date).toLocaleDateString()}
                    </span>
                    {expired && (
                      <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-200 px-2 py-0.5 rounded-full">
                        <AlertCircle className="w-3 h-3" /> Wygasło
                      </span>
                    )}
                  </div>
                </div>
                {doc.document_url && (
                  <a 
                    href={doc.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-[#0B2136] text-[#00E5FF] rounded-xl hover:bg-[#1a3652] transition-colors font-bold text-sm"
                  >
                    Otwórz
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
