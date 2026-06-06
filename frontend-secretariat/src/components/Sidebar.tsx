"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Calendar, Bus, FileText, LayoutDashboard } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  if (pathname === '/login') return null;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <span className="text-xl font-bold text-blue-600">KKBus Sekretariat</span>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
          <LayoutDashboard size={20} /> Dashboard
        </Link>
        <Link href="/clients/new" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
          <Users size={20} /> Klienci
        </Link>
        <Link href="/schedules" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
          <Calendar size={20} /> Grafiki
        </Link>
        <Link href="/fleet" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
          <Bus size={20} /> Flota
        </Link>
        <Link href="/reports" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
          <FileText size={20} /> Raporty
        </Link>
      </nav>
    </aside>
  );
}
