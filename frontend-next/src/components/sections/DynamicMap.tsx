"use client";

import { Fragment, useEffect, useState } from "react";
import { MapContainer, TileLayer, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

interface RouteVariant {
  id: string;
  name: string;
  description: string;
  color: string;
  waypoints: [number, number][];
}

type RouteLines = Record<string, [number, number][]>;

const routeVariants: RouteVariant[] = [
  {
    id: "a4",
    name: "Kraków MDA - Balice - Katowice Dworzec - Pyrzowice",
    description: "Wariant A4 przez Kraków Balice, Chrzanów, Jaworzno i Mysłowice.",
    color: "#0EA5E9",
    waypoints: [
      [50.0679, 19.9474],
      [50.0777, 19.7848],
      [50.1355, 19.4020],
      [50.2051, 19.2749],
      [50.2419, 19.1392],
      [50.2571, 19.0170],
      [50.4743, 19.0800],
    ],
  },
  {
    id: "olkusz",
    name: "Kraków MDA - Olkusz - Katowice Dworzec",
    description: "Północny wariant drogą krajową 94 przez Jerzmanowice, Olkusz i Dąbrowę Górniczą.",
    color: "#F97316",
    waypoints: [
      [50.0679, 19.9474],
      [50.2814, 19.5654],
      [50.3217, 19.1949],
      [50.2571, 19.0170],
    ],
  },
  {
    id: "oswiecim",
    name: "Kraków MDA - Oświęcim - Tychy - Katowice Dworzec",
    description: "Południowy wariant przez Skawinę, Zator, Oświęcim, Bieruń i Tychy.",
    color: "#16A34A",
    waypoints: [
      [50.0679, 19.9474],
      [50.0344, 19.2098],
      [50.1372, 18.9664],
      [50.2571, 19.0170],
    ],
  },
];

const buildOsrmUrl = (waypoints: [number, number][]) => {
  const coordinates = waypoints.map(([lat, lng]) => `${lng},${lat}`).join(";");

  return `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`;
};

const getRouteGeometry = async (route: RouteVariant): Promise<[string, [number, number][]]> => {
  const response = await fetch(buildOsrmUrl(route.waypoints));

  if (!response.ok) {
    throw new Error(`Nie udało się pobrać trasy ${route.id}`);
  }

  const data = await response.json();
  const coordinates = data.routes?.[0]?.geometry?.coordinates;

  if (!Array.isArray(coordinates)) {
    throw new Error(`Brak geometrii trasy ${route.id}`);
  }

  return [
    route.id,
    coordinates.map(([lng, lat]: [number, number]) => [lat, lng]),
  ];
};

function FitRoutes({ routeLines }: { routeLines: RouteLines }) {
  const map = useMap();

  useEffect(() => {
    const positions = Object.values(routeLines).flat();

    if (positions.length === 0) return;

    map.fitBounds(L.latLngBounds(positions), {
      padding: [34, 34],
      maxZoom: 10,
      animate: true,
    });
  }, [map, routeLines]);

  return null;
}

export default function DynamicMap() {
  const [routeLines, setRouteLines] = useState<RouteLines>({});
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(true);

  useEffect(() => {
    // Globalny fix dla Leaflet w środowisku z Hot Reloading:
    // Czyści ewentualne stare instancje mapy pozostawione w DOM przez Next.js
    return () => {
      const container = L.DomUtil.get("leaflet-map");
      if (container) {
        (container as HTMLElement & { _leaflet_id?: number | null })._leaflet_id = null;
      }
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    Promise.allSettled(routeVariants.map(getRouteGeometry))
      .then((routes) => {
        if (!isActive) return;

        const loadedRoutes = routes
          .filter((route): route is PromiseFulfilledResult<[string, [number, number][]]> => {
            return route.status === "fulfilled";
          })
          .map((route) => route.value);

        setRouteLines(Object.fromEntries(loadedRoutes));
        setIsLoadingRoutes(false);
      })
      .catch((error) => {
        if (!isActive) return;

        console.error("Nie udało się pobrać geometrii tras drogowych.", error);
        setIsLoadingRoutes(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const center: [number, number] = [50.2500, 19.4300];

  return (
    <div id="leaflet-map" className="relative" style={{ height: "100%", width: "100%", zIndex: 0 }}>
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
        <FitRoutes routeLines={routeLines} />

        {/* Warianty przejazdu prowadzone po głównych drogach między miastami */}
        {routeVariants.map((route) => (
          routeLines[route.id] ? (
            <Fragment key={route.id}>
              <Polyline
                positions={routeLines[route.id]}
                pathOptions={{
                  color: "#FFFFFF",
                  weight: route.id === "a4" ? 9 : 8,
                  opacity: 0.95,
                  lineCap: "round",
                  lineJoin: "round",
                }}
              />
              <Polyline
                positions={routeLines[route.id]}
                pathOptions={{
                  color: route.color,
                  weight: route.id === "a4" ? 5 : 4,
                  opacity: route.id === "a4" ? 0.95 : 0.82,
                  lineCap: "round",
                  lineJoin: "round",
                }}
              >
                <Popup>
                  <div className="font-semibold text-primary">{route.name}</div>
                  <div className="text-sm text-text-muted">{route.description}</div>
                </Popup>
              </Polyline>
            </Fragment>
          ) : null
        ))}

      </MapContainer>
      {isLoadingRoutes && (
        <div className="absolute inset-0 z-[450] flex items-center justify-center rounded-2xl bg-white/70 backdrop-blur-sm">
          <div className="rounded-lg bg-white px-4 py-3 text-sm font-semibold text-primary shadow-lg">
            Wczytywanie tras po drogach...
          </div>
        </div>
      )}
      <div className="absolute left-4 bottom-4 z-[500] max-w-[calc(100%-2rem)] rounded-lg bg-white/95 p-3 shadow-lg border border-gray-100">
        <div className="text-xs font-semibold uppercase tracking-wide text-text-muted mb-2">Możliwe trasy</div>
        <div className="space-y-2">
          {routeVariants.map((route) => (
            <div key={route.id} className="flex items-start gap-2 text-sm text-text-main">
              <span
                className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: route.color }}
              />
              <span className="leading-tight">{route.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
