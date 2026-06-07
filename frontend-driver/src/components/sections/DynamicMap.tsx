"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { routes, Route } from "@/lib/routesData";
import { useTranslation } from "@/lib/LanguageContext";



const createStopIcon = (isTerminal: boolean, routeColor: string, isHovered: boolean) => {
  const size = isTerminal ? 18 : 12;
  const border = isTerminal ? 3 : 2;
  const shadow = isHovered ? "0 0 12px rgba(0,0,0,0.35)" : "0 2px 6px rgba(0,0,0,0.2)";
  const scale = isHovered ? "scale(1.25)" : "scale(1)";

  return L.divIcon({
    className: "custom-leaflet-icon",
    html: `
      <div style="
        width: ${size}px; 
        height: ${size}px; 
        background: ${routeColor}; 
        border-radius: 50%; 
        border: ${border}px solid white; 
        box-shadow: ${shadow};
        transform: translate(-50%, -50%) ${scale};
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      "></div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
};

const createLabelIcon = (name: string, routeColor: string) => {
  return L.divIcon({
    className: "custom-leaflet-label",
    html: `
      <div style="
        position: absolute;
        top: 12px;
        left: 50%;
        transform: translateX(-50%);
        white-space: nowrap;
        font-weight: 600;
        color: ${routeColor};
        font-size: 11px;
        text-shadow: 
          1px 1px 0 white, -1px -1px 0 white, 
          1px -1px 0 white, -1px 1px 0 white,
          0 1px 0 white, 0 -1px 0 white,
          1px 0 0 white, -1px 0 0 white;
        pointer-events: none;
      ">${name}</div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
};

/* ─── Map controller to fit bounds ─── */

function FitBounds({ route }: { route: Route | null }) {
  const map = useMap();

  useEffect(() => {
    if (!route) {
      // Fit to all routes
      const allCoords = routes.flatMap((r) =>
        r.stops.map((s) => [s.lat, s.lng] as [number, number])
      );
      if (allCoords.length > 0) {
        map.fitBounds(L.latLngBounds(allCoords), { padding: [40, 40] });
      }
    } else {
      const coords = route.stops.map((s) => [s.lat, s.lng] as [number, number]);
      if (coords.length > 0) {
        map.fitBounds(L.latLngBounds(coords), { padding: [50, 50] });
      }
    }
  }, [route, map]);

  return null;
}

/* ─── Stop List Panel ─── */

function StopList({ route }: { route: Route }) {
  return (
    <div className="space-y-0">
      {route.stops.map((stop, idx) => {
        const isFirst = idx === 0;
        const isLast = idx === route.stops.length - 1;
        return (
          <div key={stop.id} className="flex items-stretch gap-3">
            {/* Timeline */}
            <div className="flex flex-col items-center w-5 shrink-0">
              <div
                className="shrink-0 rounded-full border-2"
                style={{
                  width: isFirst || isLast ? 14 : 10,
                  height: isFirst || isLast ? 14 : 10,
                  borderColor: route.color,
                  backgroundColor: isFirst || isLast ? route.color : "white",
                }}
              />
              {!isLast && (
                <div
                  className="flex-1 w-0.5 min-h-[20px]"
                  style={{ backgroundColor: route.color, opacity: 0.3 }}
                />
              )}
            </div>
            {/* Stop Name */}
            <div
              className={`pb-3 text-sm ${isFirst || isLast
                  ? "font-bold text-primary"
                  : "text-text-muted"
                }`}
            >
              {stop.name}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Main Component ─── */

export default function DynamicMap() {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [hoveredStop, setHoveredStop] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    setIsMounted(true);
    return () => {
      const container = L.DomUtil.get("leaflet-map");
      if (container) {
        // @ts-ignore
        container._leaflet_id = null;
      }
    };
  }, []);

  const activeRoute = useMemo(
    () => routes.find((r) => r.id === selectedRoute) || null,
    [selectedRoute]
  );

  const visibleRoutes = useMemo(
    () => (activeRoute ? [activeRoute] : routes),
    [activeRoute]
  );

  const center: [number, number] = [50.1648, 19.4844];

  const handleRouteToggle = useCallback((routeId: string) => {
    setSelectedRoute((prev) => (prev === routeId ? null : routeId));
  }, []);

  if (!isMounted) return null;

  return (
    <div className="flex flex-col lg:flex-row gap-0 h-full">
      {/* ─── Sidebar ─── */}
      <div className="lg:w-[320px] shrink-0 bg-white border-r border-gray-100 flex flex-col overflow-hidden">
        {/* Route Selector Tabs */}
        <div className="p-3 border-b border-gray-100 space-y-1.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
            {t("map.choose")}
          </h3>
          {routes.map((route) => {
            const isActive = selectedRoute === route.id;
            return (
              <button
                key={route.id}
                onClick={() => handleRouteToggle(route.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-3 group ${isActive
                    ? "shadow-md ring-1"
                    : "hover:bg-gray-50"
                  }`}
                style={
                  isActive
                    ? {
                      backgroundColor: `${route.color}10`,
                      outline: `2px solid ${route.color}`,
                      outlineOffset: "-2px",
                      borderColor: route.color,
                      boxShadow: `0 2px 8px ${route.color}25`,
                    }
                    : undefined
                }
              >
                <div
                  className="w-3.5 h-3.5 rounded-full shrink-0 border-2 transition-transform group-hover:scale-110"
                  style={{
                    backgroundColor: isActive ? route.color : "transparent",
                    borderColor: route.color,
                  }}
                />
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-primary truncate">
                    {route.name}: {route.label}
                  </div>
                  <div className="text-xs text-text-muted truncate">
                    {route.description}
                  </div>
                </div>
                <div
                  className="ml-auto text-xs font-bold shrink-0 px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${route.color}15`,
                    color: route.color,
                  }}
                >
                  {route.stops.length}
                </div>
              </button>
            );
          })}
        </div>

        {/* Stop list when route is selected */}
        {activeRoute && (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: activeRoute.color }}
              />
              <h4 className="text-sm font-bold text-primary">
                {t("map.stopsCount")} — {activeRoute.name}
              </h4>
            </div>
            <StopList route={activeRoute} />
          </div>
        )}

        {!activeRoute && (
          <div className="flex-1 flex items-center justify-center p-6 text-center">
            <div>
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-action/10 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-action"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
              </div>
              <p className="text-sm text-text-muted">
                {t("map.helper")}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ─── Map ─── */}
      <div
        id="leaflet-map"
        className="flex-1 relative"
        style={{ minHeight: "400px", zIndex: 0 }}
      >
        <MapContainer
          center={center}
          zoom={10}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%", borderRadius: "0 1rem 1rem 0" }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          <FitBounds route={activeRoute} />

          {/* Polylines */}
          {visibleRoutes.map((route) => {
            const coords = route.stops.map(
              (s) => [s.lat, s.lng] as [number, number]
            );
            const isActive = selectedRoute === route.id;
            const isBackground = selectedRoute !== null && !isActive;

            return (
              <Polyline
                key={route.id}
                positions={coords}
                pathOptions={{
                  color: route.color,
                  weight: isActive ? 5 : isBackground ? 2 : 3,
                  opacity: isBackground ? 0.25 : 0.85,
                  dashArray: isBackground ? "8 6" : undefined,
                  lineCap: "round",
                  lineJoin: "round",
                }}
              />
            );
          })}

          {/* Stop Markers */}
          {visibleRoutes.map((route) =>
            route.stops.map((stop, idx) => {
              const isTerminal =
                idx === 0 || idx === route.stops.length - 1;
              const isHovered = hoveredStop === stop.id;

              return (
                <Marker
                  key={stop.id}
                  position={[stop.lat, stop.lng]}
                  icon={createStopIcon(isTerminal, route.color, isHovered)}
                  eventHandlers={{
                    mouseover: () => setHoveredStop(stop.id),
                    mouseout: () => setHoveredStop(null),
                  }}
                >
                  <Popup>
                    <div style={{ minWidth: 160 }}>
                      <div
                        className="font-bold text-sm mb-1"
                        style={{ color: route.color }}
                      >
                        {stop.name}
                      </div>
                      <div className="text-xs text-gray-500 mb-2">
                        {route.name}: {route.label}
                      </div>
                      <div className="text-xs text-gray-400">
                        {t("map.stopIndex")} {idx + 1} {t("map.of")} {route.stops.length}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })
          )}

          {/* Terminal Labels (only when zoomed into a single route) */}
          {activeRoute &&
            [activeRoute.stops[0], activeRoute.stops[activeRoute.stops.length - 1]].map(
              (stop) => (
                <Marker
                  key={`label-${stop.id}`}
                  position={[stop.lat, stop.lng]}
                  icon={createLabelIcon(stop.name, activeRoute.color)}
                  interactive={false}
                />
              )
            )}
        </MapContainer>

        {/* Map legend overlay */}
        {!selectedRoute && (
          <div className="absolute bottom-4 right-4 z-[1000] bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-100 p-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2">
              {t("map.legend")}
            </div>
            {routes.map((route) => (
              <div
                key={route.id}
                className="flex items-center gap-2 py-0.5 cursor-pointer hover:opacity-70 transition-opacity"
                onClick={() => handleRouteToggle(route.id)}
              >
                <div
                  className="w-4 h-0.5 rounded-full"
                  style={{ backgroundColor: route.color }}
                />
                <span className="text-[11px] text-text-muted">
                  {route.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
