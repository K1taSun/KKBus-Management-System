const fs = require('fs');

const stops = [
  "Kraków Dworzec MDA", "Kraków Bronowice SKA", "Modlnica", "Szyce", "Jerzmanowice", "Przeginia", "Olkusz Dworzec Autobusowy", "Bolesław", "Sławków Rynek", "Sławków Zakościele", "Dąbrowa Górnicza Gołonóg", "Dąbrowa Górnicza Centrum", "Sosnowiec Zagórze", "Sosnowiec Dworzec PKP", "Katowice Zawodzie Centrum Przesiadkowe", "Katowice Sądowa"
];

async function fetchCoords() {
  for (const stop of stops) {
    const q = encodeURIComponent(stop + ", Poland");
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`, {
      headers: { 'User-Agent': 'Node Script / kkbus' }
    });
    const data = await res.json();
    if (data.length > 0) {
      console.log(`${stop} -> lat: ${data[0].lat}, lng: ${data[0].lon}`);
    } else {
      console.log(`${stop} -> NOT FOUND`);
    }
    await new Promise(r => setTimeout(r, 1000));
  }
}

fetchCoords();
