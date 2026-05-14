import { AdminSidebar } from "@/components/layout/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background-alt flex">
      {/* Pasek Boczny Desktop */}
      <AdminSidebar />
      
      {/* Główna treść - przesunięta o szerokość paska bocznego na desktopie */}
      <main className="flex-1 md:ml-64 p-8">
        {/* Mobilny nagłówek (widoczny tylko na małych ekranach, bo sidebar jest ukryty) */}
        <div className="md:hidden bg-primary text-white p-4 rounded-xl mb-6 shadow-md flex justify-between items-center">
          <h1 className="font-bold">KKBus Admin</h1>
          <button className="text-action">Menu</button>
        </div>
        
        {children}
      </main>
    </div>
  );
}
