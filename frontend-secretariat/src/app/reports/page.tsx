"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiClient } from "@/lib/api";
import { toast } from "react-hot-toast";
import { FileText, Download, Loader2 } from "lucide-react";

const reportSchema = z.object({
  startDate: z.string().min(1, "Wybierz datę początkową"),
  endDate: z.string().min(1, "Wybierz datę końcową"),
});

type ReportFormValues = z.infer<typeof reportSchema>;

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
  });

  const onSubmit = async (data: ReportFormValues) => {
    setLoading(true);
    try {
      // Use axios directly to handle blob
      const response = await apiClient.get("/secretariat/reports", {
        params: data,
        responseType: "blob",
      });
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data as any]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `raport_operacyjny_${data.startDate}_${data.endDate}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("Raport wygenerowany pomyślnie");
    } catch (err: any) {
      toast.error("Wystąpił błąd podczas generowania raportu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <FileText className="text-blue-600" size={28} />
        <h1 className="text-2xl font-bold text-gray-800">Raporty Operacyjne</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p className="text-gray-600 mb-6">Wybierz zakres dat, aby wygenerować raport PDF zrealizowanych kursów, przypisanych kierowców, pojazdów oraz liczby pasażerów.</p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Od daty</label>
              <input
                type="date"
                {...register("startDate")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Do daty</label>
              <input
                type="date"
                {...register("endDate")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate.message}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex justify-center items-center gap-2 disabled:bg-blue-400"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
            {loading ? "Generowanie..." : "Pobierz Raport (PDF)"}
          </button>
        </form>
      </div>
    </div>
  );
}
