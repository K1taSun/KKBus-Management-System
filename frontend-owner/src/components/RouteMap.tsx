"use client";

import dynamic from "next/dynamic";
import { StopDto } from "@/types"; // assuming this will be imported
import "leaflet/dist/leaflet.css";

// Dynamic import with no SSR
const RouteMapInner = dynamic(() => import("./RouteMapInner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-slate-100 animate-pulse text-slate-500 rounded-lg">
      Ładowanie mapy...
    </div>
  ),
});

interface RouteMapProps {
  stops: StopDto[];
  onStopsChange: (stops: StopDto[]) => void;
  isEditing: boolean;
}

export default function RouteMap(props: RouteMapProps) {
  return <RouteMapInner {...props} />;
}
