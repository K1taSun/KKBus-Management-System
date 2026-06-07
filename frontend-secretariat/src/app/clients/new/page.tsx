"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiPost } from "@/lib/api";
import { toast } from "react-hot-toast";
import { UserPlus, Save, Loader2 } from "lucide-react";

const clientSchema = z.object({
  firstName: z.string().min(2, "Imię musi mieć co najmniej 2 znaki"),
  lastName: z.string().min(2, "Nazwisko musi mieć co najmniej 2 znaki"),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format daty: YYYY-MM-DD"),
  email: z.string().email("Nieprawidłowy adres email"),
  phone: z.string().min(9, "Telefon musi mieć co najmniej 9 cyfr").optional().or(z.literal("")),
  loyaltyOptIn: z.boolean().optional(),
});

type ClientFormValues = z.infer<typeof clientSchema>;

export default function NewClientPage() {
  const [loading, setLoading] = useState(false);
  const [createdClient, setCreatedClient] = useState<{ clientNumber: string; tempPassword: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      loyaltyOptIn: false,
    },
  });

  const onSubmit = async (data: ClientFormValues) => {
    setLoading(true);
    setCreatedClient(null);
    try {
      const response = await apiPost<{ message: string; clientNumber: string; tempPassword: string }>("/secretariat/clients", data);
      setCreatedClient({ clientNumber: response.clientNumber, tempPassword: response.tempPassword });
      toast.success("Konto klienta zostało pomyślnie utworzone!");
      reset();
    } catch (err: any) {
      toast.error(err.message || "Wystąpił błąd podczas tworzenia klienta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <UserPlus className="text-blue-600" size={28} />
        <h1 className="text-2xl font-bold text-gray-800">Zakładanie Konta Klienta</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Imię *</label>
              <input
                {...register("firstName")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Jan"
              />
              {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nazwisko *</label>
              <input
                {...register("lastName")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Kowalski"
              />
              {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Urodzenia *</label>
              <input
                type="date"
                {...register("dateOfBirth")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                {...register("email")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="jan.kowalski@example.com"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
              <input
                type="tel"
                {...register("phone")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="+48 123 456 789"
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
            </div>
          </div>

          <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <input
              type="checkbox"
              id="loyaltyOptIn"
              {...register("loyaltyOptIn")}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="loyaltyOptIn" className="text-sm font-medium text-gray-700 cursor-pointer">
              Zgoda na udział w programie lojalnościowym
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex justify-center items-center gap-2 disabled:bg-blue-400"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {loading ? "Zapisywanie..." : "Utwórz konto klienta"}
          </button>
        </form>

        {createdClient && (
          <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-green-800 mb-2">Sukces! Konto utworzone</h3>
            <p className="text-green-700 mb-4">Podaj klientowi poniższe dane do logowania, zostały one również wysłane na podany adres email.</p>
            <div className="bg-white rounded border border-green-200 p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Numer Klienta:</span>
                <span className="font-mono font-bold text-gray-800">{createdClient.clientNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Tymczasowe Hasło:</span>
                <span className="font-mono font-bold text-gray-800">{createdClient.tempPassword}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
