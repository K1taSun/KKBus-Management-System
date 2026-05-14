"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Bus, ArrowUpRight, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">Przegląd Systemu</h1>
        <p className="text-text-muted mt-1">Podsumowanie dzisiejszych operacji (Kraków - Katowice)</p>
      </div>

      {/* Statystyki */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm border-l-4 border-l-action">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-text-muted font-medium mb-1">Dzisiejsze Rezerwacje</p>
                <h3 className="text-3xl font-bold text-primary">142</h3>
              </div>
              <div className="p-3 bg-action/10 rounded-lg text-action">
                <Users size={24} />
              </div>
            </div>
            <p className="text-xs text-green-600 font-medium mt-4 flex items-center gap-1">
              <TrendingUp size={14} /> +12% względem wczoraj
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-text-muted font-medium mb-1">Szacowany Przychód</p>
                <h3 className="text-3xl font-bold text-primary">3 550 zł</h3>
              </div>
              <div className="p-3 bg-green-100 rounded-lg text-green-600">
                <ArrowUpRight size={24} />
              </div>
            </div>
            <p className="text-xs text-text-muted mt-4">Tylko potwierdzone przejazdy</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-text-muted font-medium mb-1">Aktywne Autokary</p>
                <h3 className="text-3xl font-bold text-primary">2 / 3</h3>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg text-orange-600">
                <Bus size={24} />
              </div>
            </div>
            <p className="text-xs text-red-500 font-medium mt-4">1 autokar w serwisie (MAN)</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-lg">Ostatnie raporty od kierowców</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-text-muted">
                <tr>
                  <th className="px-6 py-4 font-medium">Trasa</th>
                  <th className="px-6 py-4 font-medium">Kierowca</th>
                  <th className="px-6 py-4 font-medium">Pasażerowie</th>
                  <th className="px-6 py-4 font-medium">Zużycie Paliwa</th>
                  <th className="px-6 py-4 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-primary">Kraków → Katowice (08:00)</td>
                  <td className="px-6 py-4">Marek Nowak</td>
                  <td className="px-6 py-4">48 / 50</td>
                  <td className="px-6 py-4">18.5 L</td>
                  <td className="px-6 py-4 text-right">
                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">Zatwierdzony</span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-primary">Katowice → Kraków (12:00)</td>
                  <td className="px-6 py-4">Marek Nowak</td>
                  <td className="px-6 py-4 text-text-muted">-</td>
                  <td className="px-6 py-4 text-text-muted">-</td>
                  <td className="px-6 py-4 text-right">
                    <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold">W trakcie</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
