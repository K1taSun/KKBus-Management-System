'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { Save, AlertCircle } from 'lucide-react';

const pricingSchema = z.object({
  versionName: z.string().min(1, 'Nazwa wersji jest wymagana'),
  basePriceMultiplier: z.number().min(0.1).max(5),
  studentDiscountPercent: z.number().min(0).max(100),
  childDiscountPercent: z.number().min(0).max(100),
  loyaltyPointValue: z.number().min(0).max(100),
});

type PricingForm = z.infer<typeof pricingSchema>;

export default function PricingPage() {
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<PricingForm>({
    resolver: zodResolver(pricingSchema),
    defaultValues: {
      versionName: 'Wersja Sezonowa ' + new Date().getFullYear(),
      basePriceMultiplier: 1.0,
      studentDiscountPercent: 50,
      childDiscountPercent: 30,
      loyaltyPointValue: 0.1,
    }
  });

  const onSubmit = async (data: PricingForm) => {
    try {
      setIsLoading(true);
      await api.post('/owner/pricing-policies', data);
      toast.success('Nowa polityka cenowa została wdrożona!');
      reset(data);
    } catch {
      toast.error('Błąd podczas zapisywania cennika');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Polityka Cenowa</h1>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 text-blue-800">
        <AlertCircle className="w-6 h-6 flex-shrink-0" />
        <p className="text-sm">
          Uwaga: Publikacja nowego cennika natychmiastowo <strong>zarchiwizuje stary cennik</strong> dla nowych rezerwacji. Historia transakcji i zakupione już bilety zachowają stare ceny.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nazwa Wersji Cennika</label>
            <input
              type="text"
              {...register('versionName')}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="np. Cennik Zimowy 2026"
            />
            {errors.versionName && <p className="mt-1 text-sm text-red-600">{errors.versionName.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mnożnik Ceny Bazowej (1.0 = 100%)</label>
              <input
                type="number"
                step="0.1"
                {...register('basePriceMultiplier', { valueAsNumber: true })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              {errors.basePriceMultiplier && <p className="mt-1 text-sm text-red-600">{errors.basePriceMultiplier.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Wartość 1 Punktu Lojalnościowego (PLN)</label>
              <input
                type="number"
                step="0.01"
                {...register('loyaltyPointValue', { valueAsNumber: true })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              {errors.loyaltyPointValue && <p className="mt-1 text-sm text-red-600">{errors.loyaltyPointValue.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Zniżka Studencka (%)</label>
              <input
                type="number"
                {...register('studentDiscountPercent', { valueAsNumber: true })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              {errors.studentDiscountPercent && <p className="mt-1 text-sm text-red-600">{errors.studentDiscountPercent.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Zniżka Dziecięca (%)</label>
              <input
                type="number"
                {...register('childDiscountPercent', { valueAsNumber: true })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              {errors.childDiscountPercent && <p className="mt-1 text-sm text-red-600">{errors.childDiscountPercent.message}</p>}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {isLoading ? 'Zapisywanie...' : 'Zapisz nową politykę'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
