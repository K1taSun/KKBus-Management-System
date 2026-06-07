'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { LogOut, LayoutDashboard, Users, Map, CalendarClock, CircleDollarSign } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const navItems = [
  { href: '/', label: 'Analityka', icon: LayoutDashboard },
  { href: '/users', label: 'Użytkownicy', icon: Users },
  { href: '/routes', label: 'Trasy', icon: Map },
  { href: '/schedules', label: 'Grafiki', icon: CalendarClock },
  { href: '/pricing', label: 'Cennik', icon: CircleDollarSign },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/login') {
    return (
      <>
        {children}
        <Toaster position="top-right" />
      </>
    );
  }

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      router.push('/login');
      toast.success('Wylogowano pomyślnie');
    } catch {
      toast.error('Błąd podczas wylogowywania');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-tight text-white">KKBus <span className="text-blue-400">Owner</span></h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-lg text-red-400 hover:bg-slate-800 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Wyloguj</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      <Toaster position="top-right" />
    </div>
  );
}
