"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L, { Map as LeafletMap } from "leaflet";

interface City {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

const cities: City[] = [
  { id: "katowice", name: "Katowice", lat: 50.2649, lng: 19.0238 },
  { id: "krakow", name: "Kraków", lat: 50.0647, lng: 19.9450 },
];

const routes = [
  ["katowice", "krakow"],
];

// Ikona przystanku (Tailwind)
const createCustomIcon = (name: string) => {
  return L.divIcon({
    className: "custom-leaflet-icon",
    html: `
      <div style="position: relative; display: flex; flex-direction: column; items-center; justify-content: center; transform: translate(-50%, -50%);">
        <div style="width: 16px; height: 16px; background-color: #0EA5E9; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>
        <div style="position: absolute; top: 20px; white-space: nowrap; font-weight: bold; color: #0F3460; font-size: 13px; text-shadow: 1px 1px 0px white, -1px -1px 0px white, 1px -1px 0px white, -1px 1px 0px white;">${name}</div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
};

export default function DynamicMap() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Globalny fix dla Leaflet w środowisku z Hot Reloading:
    // Czyści ewentualne stare instancje mapy pozostawione w DOM przez Next.js
    return () => {
      const container = L.DomUtil.get('leaflet-map');
      if (container) {
        // @ts-ignore
        container._leaflet_id = null;
      }
    };
  }, []);

  const center: [number, number] = [50.1648, 19.4844];

  if (!isMounted) return null;

  return (
    <div id="leaflet-map" style={{ height: "100%", width: "100%", zIndex: 0 }}>
      <MapContainer 
        center={center} 
        zoom={10} 
        scrollWheelZoom={false} 
        style={{ height: "100%", width: "100%", borderRadius: "1.5rem" }}
        className="z-0"
      >
        <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      
      {/* Połączenia */}
      {routes.map((route, idx) => {
        const city1 = cities.find(c => c.id === route[0]);
        const city2 = cities.find(c => c.id === route[1]);
        if (!city1 || !city2) return null;
        
        return (
          <Polyline 
            key={idx} 
            positions={[[city1.lat, city1.lng], [city2.lat, city2.lng]]} 
            pathOptions={{ color: '#0EA5E9', weight: 3, opacity: 0.6 }} 
          />
        );
      })}

      {/* Przystanki */}
      {cities.map((city) => (
        <Marker 
          key={city.id} 
          position={[city.lat, city.lng]} 
          icon={createCustomIcon(city.name)}
        >
          <Popup>
            <div className="font-semibold text-primary">{city.name}</div>
            <div className="text-sm">Sprawdź rozkład jazdy</div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
    </div>
  );
}
