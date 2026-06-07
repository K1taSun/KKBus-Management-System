"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return <main className="flex-1 w-full h-full">{children}</main>;
  }

  return (
    <>
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 justify-between shrink-0">
          <h1 className="text-lg font-medium text-gray-800">Panel Administracyjny</h1>
          <div className="flex items-center gap-4">
             <span className="text-sm font-medium text-gray-600">Sekretariat</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </>
  );
}
