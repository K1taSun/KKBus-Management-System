"use client";

import { MapPin, Users, FileText, Calendar } from "lucide-react";

export function DriverNav() {
  return (
    <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 pb-safe z-50">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        <button className="flex flex-col items-center justify-center w-full h-full text-action font-medium">
          <MapPin size={24} className="mb-1" />
          <span className="text-[10px]">Trasy</span>
        </button>
        <button className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-gray-600">
          <Users size={24} className="mb-1" />
          <span className="text-[10px]">Pasażerowie</span>
        </button>
        <button className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-gray-600">
          <FileText size={24} className="mb-1" />
          <span className="text-[10px]">Raporty</span>
        </button>
        <button className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-gray-600">
          <Calendar size={24} className="mb-1" />
          <span className="text-[10px]">Grafik</span>
        </button>
      </div>
    </nav>
  );
}
