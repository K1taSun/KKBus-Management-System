export interface Stop {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface Route {
  id: string;
  name: string;
  label: string;
  description: string;
  color: string;
  stops: Stop[];
}

export const routes: Route[] = [
  {
    id: "route-1",
    name: "Trasa 1",
    label: "Korytarz Północny",
    description: "DK94 — przez Olkusz i Dąbrowę Górniczą",
    color: "#E63946",
    stops: [
      { id: "r1-01", name: "Kraków Dworzec MDA", lat: 50.068212, lng: 19.948835 },
      { id: "r1-02", name: "Kraków Bronowice SKA", lat: 50.081614, lng: 19.888440 },
      { id: "r1-03", name: "Modlnica Skrzyżowanie", lat: 50.125284, lng: 19.867689 },
      { id: "r1-04", name: "Szyce Centrum", lat: 50.141750, lng: 19.832710 },
      { id: "r1-05", name: "Jerzmanowice Kościół", lat: 50.198305, lng: 19.749320 },
      { id: "r1-06", name: "Przeginia Skrzyżowanie", lat: 50.222728, lng: 19.684136 },
      { id: "r1-07", name: "Olkusz Dworzec Autobusowy", lat: 50.274151, lng: 19.575005 },
      { id: "r1-08", name: "Bolesław Centrum", lat: 50.292911, lng: 19.492576 },
      { id: "r1-09", name: "Sławków Rynek", lat: 50.298790, lng: 19.388758 },
      { id: "r1-10", name: "Sławków Zakościele", lat: 50.301548, lng: 19.361955 },
      { id: "r1-11", name: "Dąbrowa Górnicza Gołonóg", lat: 50.338990, lng: 19.234673 },
      { id: "r1-12", name: "Dąbrowa Górnicza Centrum", lat: 50.324987, lng: 19.188044 },
      { id: "r1-13", name: "Sosnowiec Zagórze", lat: 50.312589, lng: 19.194664 },
      { id: "r1-14", name: "Sosnowiec Dworzec PKP", lat: 50.278557, lng: 19.127147 },
      { id: "r1-15", name: "Katowice Zawodzie Dworzec", lat: 50.257008, lng: 19.056976 },
      { id: "r1-16", name: "Katowice Sądowa / Dworzec Główny", lat: 50.258793, lng: 19.011036 },
    ],
  },
  {
    id: "route-2",
    name: "Trasa 2",
    label: "Korytarz Środkowy",
    description: "DK79 — przez Krzeszowice, Trzebinię i Chrzanów",
    color: "#0EA5E9",
    stops: [
      { id: "r2-01", name: "Kraków Dworzec MDA", lat: 50.068212, lng: 19.948835 },
      { id: "r2-02", name: "Kraków Rondo Ofiar Katynia", lat: 50.087996, lng: 19.892313 },
      { id: "r2-03", name: "Zabierzów Rynek", lat: 50.116436, lng: 19.799947 },
      { id: "r2-04", name: "Kochanów", lat: 50.114848, lng: 19.748529 },
      { id: "r2-05", name: "Rudawa Szkoła", lat: 50.123208, lng: 19.706460 },
      { id: "r2-06", name: "Krzeszowice Dworzec Autobusowy", lat: 50.131661, lng: 19.636580 },
      { id: "r2-07", name: "Wola Filipowska", lat: 50.131581, lng: 19.592530 },
      { id: "r2-08", name: "Dulowa", lat: 50.142376, lng: 19.520162 },
      { id: "r2-09", name: "Trzebinia Dworzec PKP", lat: 50.155212, lng: 19.454203 },
      { id: "r2-10", name: "Trzebinia Rynek", lat: 50.159274, lng: 19.465985 },
      { id: "r2-11", name: "Chrzanów Śródmieście", lat: 50.144083, lng: 19.404515 },
      { id: "r2-12", name: "Chrzanów Węzeł Baliński", lat: 50.148560, lng: 19.378120 },
      { id: "r2-13", name: "Jaworzno Szczakowa", lat: 50.252843, lng: 19.273817 },
      { id: "r2-14", name: "Jaworzno Leopold", lat: 50.215489, lng: 19.255207 },
      { id: "r2-15", name: "Jaworzno Centrum", lat: 50.203411, lng: 19.271253 },
      { id: "r2-16", name: "Mysłowice Dworzec PKP", lat: 50.237151, lng: 19.141104 },
      { id: "r2-17", name: "Katowice Zawodzie Centrum Przesiadkowe", lat: 50.259685, lng: 19.064321 },
      { id: "r2-18", name: "Katowice Sądowa / Dworzec Główny", lat: 50.258793, lng: 19.011036 },
    ],
  },
  {
    id: "route-3",
    name: "Trasa 3",
    label: "Korytarz Południowy",
    description: "DW780/934 — przez Alwernię, Libiąż i Chełmek",
    color: "#2DC653",
    stops: [
      { id: "r3-01", name: "Kraków Dworzec MDA", lat: 50.068212, lng: 19.948835 },
      { id: "r3-02", name: "Kraków Most Grunwaldzki", lat: 50.048590, lng: 19.933256 },
      { id: "r3-03", name: "Kraków Salwator", lat: 50.052680, lng: 19.915125 },
      { id: "r3-04", name: "Kryspinów Baza", lat: 50.057390, lng: 19.805175 },
      { id: "r3-05", name: "Liszki Urząd Gminy", lat: 50.038653, lng: 19.767420 },
      { id: "r3-06", name: "Kaszów", lat: 50.039300, lng: 19.725523 },
      { id: "r3-07", name: "Rybna", lat: 50.042295, lng: 19.645068 },
      { id: "r3-08", name: "Alwernia Rynek", lat: 50.061480, lng: 19.539870 },
      { id: "r3-09", name: "Kwaczała", lat: 50.064004, lng: 19.491125 },
      { id: "r3-10", name: "Babice Centrum", lat: 50.070636, lng: 19.444297 },
      { id: "r3-11", name: "Libiąż Jowisz", lat: 50.106596, lng: 19.317505 },
      { id: "r3-12", name: "Chełmek Dworzec", lat: 50.100155, lng: 19.254145 },
      { id: "r3-13", name: "Imielin Centrum Przesiadkowe", lat: 50.142382, lng: 19.175986 },
      { id: "r3-14", name: "Mysłowice Kosztowy", lat: 50.188719, lng: 19.159022 },
      { id: "r3-15", name: "Katowice Sądowa / Dworzec Główny", lat: 50.258793, lng: 19.011036 },
    ],
  },
  {
    id: "route-4",
    name: "Trasa 4",
    label: "Korytarz Przyspieszony",
    description: "A4/DK79/S1 — ekspres z przystankami P&R",
    color: "#F77F00",
    stops: [
      { id: "r4-01", name: "Kraków Dworzec MDA", lat: 50.068212, lng: 19.948835 },
      { id: "r4-02", name: "Kraków Rondo Matecznego", lat: 50.036921, lng: 19.939870 },
      { id: "r4-03", name: "Kraków Borek Fałęcki", lat: 50.011640, lng: 19.926676 },
      { id: "r4-04", name: "Balice Port Lotniczy (Terminal / P&R)", lat: 50.077671, lng: 19.784405 },
      { id: "r4-05", name: "Aleksandrowice (węzeł A4)", lat: 50.088190, lng: 19.761005 },
      { id: "r4-06", name: "Rudno (zjazd na zamek / Krzeszowice)", lat: 50.100985, lng: 19.569420 },
      { id: "r4-07", name: "Chrzanów Trzebińska (węzeł Chrzanów)", lat: 50.134375, lng: 19.418245 },
      { id: "r4-08", name: "Jaworzno Jeleń (węzeł)", lat: 50.177078, lng: 19.245228 },
      { id: "r4-09", name: "Mysłowice Brzęczkowice", lat: 50.216781, lng: 19.157250 },
      { id: "r4-10", name: "Katowice Francuska (Os. Paderewskiego)", lat: 50.246417, lng: 19.027814 },
      { id: "r4-11", name: "Katowice Sądowa / Dworzec Główny", lat: 50.258793, lng: 19.011036 },
    ],
  },
];

// All unique stops (deduplicated by name) for shared nodes
export function getAllUniqueStops(): Stop[] {
  const seen = new Map<string, Stop>();
  for (const route of routes) {
    for (const stop of route.stops) {
      if (!seen.has(stop.name)) {
        seen.set(stop.name, stop);
      }
    }
  }
  return Array.from(seen.values());
}
