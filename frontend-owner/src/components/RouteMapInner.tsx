"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { StopDto } from "@/types";

// Fix Leaflet's default icon path issues with Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface RouteMapInnerProps {
  stops: StopDto[];
  onStopsChange: (stops: StopDto[]) => void;
  isEditing: boolean;
}

function MapEvents({ onMapClick, isEditing }: { onMapClick: (e: L.LeafletMouseEvent) => void, isEditing: boolean }) {
  useMapEvents({
    click(e) {
      if (isEditing) {
        onMapClick(e);
      }
    },
  });
  return null;
}

export default function RouteMapInner({ stops, onStopsChange, isEditing }: RouteMapInnerProps) {
  // Center map on Poland or on the first stop
  const center: L.LatLngTuple = stops.length > 0 ? [stops[0].lat, stops[0].lng] : [52.069, 19.480];
  const zoom = stops.length > 0 ? 10 : 6;

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    const newStop: StopDto = {
      name: `Nowy przystanek ${stops.length + 1}`,
      lat: e.latlng.lat,
      lng: e.latlng.lng,
    };
    onStopsChange([...stops, newStop]);
  };

  const updateStopPosition = (index: number, lat: number, lng: number) => {
    const updated = [...stops];
    updated[index] = { ...updated[index], lat, lng };
    onStopsChange(updated);
  };

  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden border border-slate-200 z-0 relative">
      <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEvents onMapClick={handleMapClick} isEditing={isEditing} />
        
        {stops.map((stop, index) => (
          <Marker
            key={index}
            position={[stop.lat, stop.lng]}
            draggable={isEditing}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                const position = marker.getLatLng();
                updateStopPosition(index, position.lat, position.lng);
              },
            }}
          >
            <Popup>
              {stop.name} <br />
              Kolejność: {index + 1}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
