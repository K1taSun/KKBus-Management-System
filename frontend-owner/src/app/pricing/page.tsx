'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { 
  Save, 
  AlertCircle, 
  History, 
  DollarSign, 
  Coins, 
  GraduationCap, 
  Baby, 
  CheckCircle,
  Loader2,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';

const pricingSchema = z.object({
  versionName: z.string().min(1, 'Nazwa wersji jest wymagana'),
  basePriceMultiplier: z.number().min(0.1, 'Mnożnik musi być większy od 0').max(5, 'Mnożnik jest za wysoki'),
  studentDiscountPercent: z.number().min(0, 'Zniżka nie może być ujemna').max(100, 'Zniżka nie może przekraczać 100%'),
  childDiscountPercent: z.number().min(0, 'Zniżka nie może być ujemna').max(100, 'Zniżka nie może przekraczać 100%'),
  loyaltyPointValue: z.number().min(0, 'Wartość nie może być ujemna').max(100, 'Wartość jest za wysoka'),
});

type PricingForm = z.infer<typeof pricingSchema>;

interface PricingPolicy {
  id: number;
  version_name: string;
  base_price_multiplier: string | number;
  student_discount_percent: number;
  child_discount_percent: number;
  loyalty_point_value: string | number;
  is_current: boolean;
  created_at: string;
}

export default function PricingPage() {
  const [policies, setPolicies] = useState<PricingPolicy[]>([]);
  const [activePolicy, setActivePolicy] = useState<PricingPolicy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<PricingForm>({
    resolver: zodResolver(pricingSchema),
    defaultValues: {
      versionName: '',
      basePriceMultiplier: 1.0,
      studentDiscountPercent: 50,
      childDiscountPercent: 30,
      loyaltyPointValue: 0.1,
    }
  });

  const fetchPolicies = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/owner/pricing-policies');
      setPolicies(res.data);
      const active = res.data.find((p: PricingPolicy) => p.is_current);
      if (active) {
        setActivePolicy(active);
        // Prefill form with current active policy's values
        reset({
          versionName: 'Korekta cennika: ' + active.version_name,
          basePriceMultiplier: Number(active.base_price_multiplier),
          studentDiscountPercent: active.student_discount_percent,
          childDiscountPercent: active.child_discount_percent,
          loyaltyPointValue: Number(active.loyalty_point_value),
        });
      }
    } catch (err) {
      console.error(err);
      toast.error('Nie udało się pobrać historii cenników');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const onSubmit = async (data: PricingForm) => {
    try {
      setIsSaving(true);
      await api.post('/owner/pricing-policies', data);
      toast.success('Nowa polityka cenowa została wdrożona!');
      await fetchPolicies();
    } catch (error) {
      console.error(error);
      toast.error('Błąd podczas zapisywania cennika');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
          <DollarSign className="text-blue-600 w-8 h-8" />
          Polityka Cenowa i Lojalnościowa
        </h1>
        <p className="text-slate-500 text-sm mt-1">Zarządzanie taryfami biletów, zniżkami oraz przelicznikiem punktów lojalnościowych.</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 text-blue-800 shadow-sm">
        <AlertCircle className="w-5 h-5 flex-shrink-0 text-blue-600 mt-0.5" />
        <div className="text-sm">
          <strong>Uwaga:</strong> Publikacja nowego cennika natychmiastowo <strong className="text-blue-900">zarchiwizuje stary cennik</strong> dla wszystkich nowych rezerwacji. Bilety już zakupione zachowają ceny z momentu zakupu.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm p-6 self-start space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
              <Save size={18} className="text-slate-700" />
              Zdefiniuj Nowy Cennik
            </h2>
            <p className="text-xs text-slate-400 mt-1">Wartości domyślne są wczytywane z obecnie obowiązującej polityki.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Nazwa Wersji Cennika</label>
              <input
                type="text"
                {...register('versionName')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                placeholder="np. Cennik Zimowy 2026"
              />
              {errors.versionName && <p className="mt-1 text-xs text-red-600">{errors.versionName.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Coins size={14} className="text-amber-500" />
                  Mnożnik ceny (1.0 = 100%)
                </label>
                <input
                  type="number"
                  step="0.05"
                  {...register('basePriceMultiplier', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono"
                />
                {errors.basePriceMultiplier && <p className="mt-1 text-xs text-red-600">{errors.basePriceMultiplier.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Coins size={14} className="text-blue-500" />
                  Pkt Lojalnościowy (PLN)
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('loyaltyPointValue', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono"
                />
                {errors.loyaltyPointValue && <p className="mt-1 text-xs text-red-600">{errors.loyaltyPointValue.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <GraduationCap size={14} className="text-purple-600" />
                  Zniżka studencka (%)
                </label>
                <input
                  type="number"
                  {...register('studentDiscountPercent', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono"
                />
                {errors.studentDiscountPercent && <p className="mt-1 text-xs text-red-600">{errors.studentDiscountPercent.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Baby size={14} className="text-green-600" />
                  Zniżka dziecięca (%)
                </label>
                <input
                  type="number"
                  {...register('childDiscountPercent', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono"
                />
                {errors.childDiscountPercent && <p className="mt-1 text-xs text-red-600">{errors.childDiscountPercent.message}</p>}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 text-sm cursor-pointer"
              >
                {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                {isSaving ? 'Wdrażanie...' : 'Wdróż Politykę Cenową'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Active Preview & History */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Preview */}
          {activePolicy && (
            <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 shadow-lg relative overflow-hidden">
              <div className="absolute right-0 top-0 -mt-6 -mr-6 w-32 h-32 bg-blue-600/10 rounded-full blur-xl" />
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Aktualnie Obowiązujący Cennik
                  </span>
                  <h3 className="text-xl font-bold mt-1 text-white">{activePolicy.version_name}</h3>
                </div>
                <CheckCircle className="text-emerald-400 w-6 h-6 shrink-0" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                <div className="bg-slate-800/60 rounded-lg p-3 border border-slate-800">
                  <div className="text-slate-400 text-xs">Mnożnik Bazowy</div>
                  <div className="text-lg font-extrabold font-mono text-blue-400 mt-1">x{Number(activePolicy.base_price_multiplier).toFixed(2)}</div>
                </div>

                <div className="bg-slate-800/60 rounded-lg p-3 border border-slate-800">
                  <div className="text-slate-400 text-xs">1 Pkt lojalnościowy</div>
                  <div className="text-lg font-extrabold font-mono text-amber-400 mt-1">{Number(activePolicy.loyalty_point_value).toFixed(2)} zł</div>
                </div>

                <div className="bg-slate-800/60 rounded-lg p-3 border border-slate-800">
                  <div className="text-slate-400 text-xs">Zniżka studencka</div>
                  <div className="text-lg font-extrabold font-mono text-purple-400 mt-1">{activePolicy.student_discount_percent}%</div>
                </div>

                <div className="bg-slate-800/60 rounded-lg p-3 border border-slate-800">
                  <div className="text-slate-400 text-xs">Zniżka dziecięca</div>
                  <div className="text-lg font-extrabold font-mono text-green-400 mt-1">{activePolicy.child_discount_percent}%</div>
                </div>
              </div>
            </div>
          )}

          {/* History */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
              <History size={16} className="text-slate-700" />
              <h3 className="font-bold text-slate-800 text-sm">Rejestr Zmian Polityk Cenowych</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase">Nazwa wersji</th>
                    <th className="px-4 py-2.5 text-center text-xs font-semibold text-slate-500 uppercase">Mnożnik</th>
                    <th className="px-4 py-2.5 text-center text-xs font-semibold text-slate-500 uppercase">Zniżka st./dz.</th>
                    <th className="px-4 py-2.5 text-center text-xs font-semibold text-slate-500 uppercase">Wartość pkt</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase">Wdrożono</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200 text-sm">
                  {policies.map((p) => (
                    <tr key={p.id} className={`hover:bg-slate-50/50 transition-colors ${p.is_current ? 'bg-blue-50/20' : ''}`}>
                      <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                          <span>{p.version_name}</span>
                          {p.is_current && (
                            <span className="inline-flex items-center px-1.5 py-0.2 bg-green-100 text-green-800 text-[10px] font-bold rounded-md border border-green-200">
                              ACTIVE
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center font-mono font-medium text-slate-700">
                        x{Number(p.base_price_multiplier).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center text-slate-600 font-mono">
                        {p.student_discount_percent}% / {p.child_discount_percent}%
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center text-slate-600 font-mono">
                        {Number(p.loyalty_point_value).toFixed(2)} zł
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-slate-400 text-xs">
                        <div className="flex items-center justify-end gap-1 font-medium">
                          <Calendar size={12} />
                          <span>{format(new Date(p.created_at), 'yyyy-MM-dd HH:mm')}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {policies.length === 0 && !isLoading && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                        Brak zarejestrowanych polityk.
                      </td>
                    </tr>
                  )}
                  {isLoading && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="animate-spin text-blue-600" size={16} />
                          <span>Ładowanie historii...</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
