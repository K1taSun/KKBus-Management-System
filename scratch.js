const item = {
  departure_time: new Date('2026-06-10 22:13:10'),
  available_seats: "50",
  stops: ["Kraków MDA", "Rondo Ofiar Katynia", "Chrzanów", "Jaworzno", "Katowice Sądowa"],
  price_base: "35.00",
  total_distance_km: 79,
  route_name: "Kraków - Katowice"
};
const from = "Jaworzno";
const to = "Katowice Sądowa";
const date = "2026-06-10";
const passengers = 1;

const searchDate = new Date(date).toISOString().split('T')[0];
const itemDate = new Date(item.departure_time).toISOString().split('T')[0];

console.log("searchDate:", searchDate, "itemDate:", itemDate);

let parsedStops = item.stops;
const stopsList = Array.isArray(parsedStops) ? parsedStops : [];
const stopNames = stopsList.map((s) => typeof s === 'string' ? s.toLowerCase() : (s.name || '').toLowerCase());
const fromIdx = stopNames.indexOf(from.toLowerCase());
const toIdx = stopNames.indexOf(to.toLowerCase());

console.log("fromIdx:", fromIdx, "toIdx:", toIdx);

if (fromIdx !== -1 && toIdx !== -1 && fromIdx < toIdx) {
  const newItem = { ...item };
  const totalSegments = Math.max(1, stopNames.length - 1);
  const travelledSegments = toIdx - fromIdx;
  const ratio = travelledSegments / totalSegments;

  newItem.price_base = (parseFloat(item.price_base) * ratio).toFixed(2);
  newItem.total_distance_km = Math.round(item.total_distance_km * ratio);
  newItem.stops = stopsList.slice(fromIdx, toIdx + 1).map((s) => typeof s === 'string' ? s : s.name);

  console.log("newItem:", newItem);
}

