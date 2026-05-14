"use client";

import Link from "next/link";
import { LayoutDashboard, Map, Users, BusFront, Settings, LogOut, BarChart3 } from "lucide-react";

export function AdminSidebar() {
  return (
    <aside className="w-64 bg-primary text-white hidden md:flex flex-col min-h-screen fixed left-0 top-0">
      <div className="p-6 border-b border-primary-light">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BusFront size={28} className="text-action" />
          KKBus Admin
        </h2>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <Link href="/admin" className="flex items-center gap-3 px-4 py-3 bg-action/20 text-action rounded-lg font-medium transition-colors">
          <LayoutDashboard size={20} />
          Panel Główny
        </Link>
        
        <Link href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-primary-light rounded-lg text-gray-300 hover:text-white transition-colors">
          <Map size={20} />
          Zarządzaj Trasami
        </Link>

        <Link href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-primary-light rounded-lg text-gray-300 hover:text-white transition-colors">
          <Users size={20} />
          Klienci i Rezerwacje
        </Link>

        <Link href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-primary-light rounded-lg text-gray-300 hover:text-white transition-colors">
          <BusFront size={20} />
          Flota i Kierowcy
        </Link>

        <Link href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-primary-light rounded-lg text-gray-300 hover:text-white transition-colors">
          <BarChart3 size={20} />
          Analityka (Raporty)
        </Link>
      </nav>

      <div className="p-4 border-t border-primary-light">
        <button className="flex items-center gap-3 px-4 py-3 w-full hover:bg-red-500/20 text-red-400 rounded-lg transition-colors">
          <LogOut size={20} />
          Wyloguj
        </button>
      </div>
    </aside>
  );
}
