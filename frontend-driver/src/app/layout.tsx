"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, User as UserIcon, LogOut, ChevronLeft, Wrench } from "lucide-react";
import { LanguageProvider } from "@/lib/LanguageContext";
import { apiPost } from "@/lib/api";
import SOSButton from "@/components/SOSButton";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await apiPost("/auth/logout");
      window.location.href = "/login";
    } catch {
      window.location.href = "/login";
    }
  };

  const navItems = [
    { href: "/", label: "Pulpit", icon: <UserIcon size={24} /> },
    { href: "/grafik", label: "Grafik", icon: <Calendar size={24} /> },
    { href: "/usterki", label: "Usterki", icon: <Wrench size={24} /> },
  ];

  // Don't show bottom nav on login page
  const isLoginPage = pathname === "/login";

  return (
    <html lang="pl">
      <head>
        <title>Panel Kierowcy - KKBus</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </head>
      <body className="antialiased bg-gray-50 text-gray-900 flex flex-col min-h-screen">
        <LanguageProvider>
          {!isLoginPage && (
            <header className="bg-primary text-white shadow-md sticky top-0 z-50">
              <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  {pathname !== "/" && pathname !== "/grafik" && (
                    <button onClick={() => window.history.back()} className="p-2 -ml-2 text-white/80 hover:text-white">
                      <ChevronLeft size={24} />
                    </button>
                  )}
                  <h1 className="text-xl font-bold tracking-tight">KKBus Kierowca</h1>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-white/80 hover:text-white transition-colors"
                >
                  <LogOut size={22} />
                </button>
              </div>
            </header>
          )}

          <main className={`flex-1 overflow-y-auto ${!isLoginPage ? "pb-20 pt-4" : ""}`}>
            <div className="container mx-auto px-4 max-w-2xl animate-fade-in">
              {children}
            </div>
          </main>

          {!isLoginPage && (
            <nav className="bg-white border-t border-gray-200 fixed bottom-0 w-full z-50 pb-safe">
              <div className="container mx-auto max-w-md flex justify-around p-2">
                {navItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex flex-col items-center justify-center w-full py-2 px-1 rounded-xl transition-all ${
                        isActive 
                          ? "text-primary font-semibold" 
                          : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <div className={`mb-1 ${isActive ? "scale-110 transition-transform" : ""}`}>
                        {item.icon}
                      </div>
                      <span className="text-xs">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </nav>
          )}

          {!isLoginPage && <SOSButton busId={1} scheduleId={undefined} />}

        </LanguageProvider>

        <Toaster position="top-center" />

        <style jsx global>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fadeIn 0.3s ease-out;
          }
          .pb-safe {
            padding-bottom: env(safe-area-inset-bottom);
          }
        `}</style>
      </body>
    </html>
  );
}
