import { DriverNav } from "@/components/layout/DriverNav";

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-primary text-white p-4 sticky top-0 z-10 shadow-md">
        <h1 className="font-bold text-lg text-center">Panel Kierowcy</h1>
      </header>
      
      <main className="p-4 max-w-md mx-auto">
        {children}
      </main>

      <DriverNav />
    </div>
  );
}
