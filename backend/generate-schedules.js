const { Client } = require('pg');

const client = new Client({
  user: 'kkbus_user',
  host: 'localhost',
  database: 'kkbus_db',
  password: 'kkbus_pass',
  port: 5432,
});

async function generate() {
  await client.connect();

  console.log("Pobieranie aktualnych tras...");
  const routesRes = await client.query(`SELECT id, name, total_distance_km, stops, color FROM routes WHERE name LIKE 'Trasa %' AND name NOT LIKE '% POWRÓT'`);
  const originalRoutes = routesRes.rows;

  console.log("Pobieranie tras powrotnych...");
  const pairs = [];

  for (const route of originalRoutes) {
    const returnName = route.name.replace('Kraków', 'TEMP').replace('Katowice', 'Kraków').replace('TEMP', 'Katowice') + " POWRÓT";
    
    let returnRouteRes = await client.query(`SELECT id, name, total_distance_km, stops, color FROM routes WHERE name = $1`, [returnName]);
    
    if (returnRouteRes.rows.length === 0) {
      let reversedStops = [...route.stops].reverse();
      returnRouteRes = await client.query(`
        INSERT INTO routes (name, total_distance_km, stops, color, is_active)
        VALUES ($1, $2, $3, $4, true)
        RETURNING id, name, total_distance_km, stops, color
      `, [returnName, route.total_distance_km, JSON.stringify(reversedStops), route.color]);
    }

    pairs.push({
      toKat: route,
      toKrk: returnRouteRes.rows[0]
    });
  }

  console.log("Pobieranie autobusów i kierowców...");
  const busesRes = await client.query(`SELECT id FROM buses WHERE status = 'Aktywny'`);
  const buses = busesRes.rows.map(r => r.id);

  const driversRes = await client.query(`SELECT id FROM users WHERE role_id = 2`);
  const drivers = driversRes.rows.map(r => r.id);

  console.log("Czyszczenie starych rozkładów...");
  await client.query(`DELETE FROM schedules`);

  const now = new Date();
  
  const createSchedule = async (date, hour, minute, route, driverId, busId) => {
    if (!route) throw new Error("Route is undefined");
    const departure = new Date(date);
    departure.setHours(hour, minute, 0, 0);
    
    const durationMinutes = Math.round(route.total_distance_km / 60 * 1.5 * 60);
    const arrival = new Date(departure.getTime() + durationMinutes * 60000);
    const price = route.total_distance_km > 75 ? 35.00 : 25.00;

    await client.query(`
      INSERT INTO schedules (route_id, bus_id, driver_id, departure_time, arrival_time, price_base)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [route.id, busId, driverId, departure, arrival, price]);
  };

  console.log("Generowanie logicznych rozkładów powrotnych na 14 dni...");
  let scheduleCount = 0;
  
  for (let d = 0; d < 14; d++) {
    const targetDate = new Date();
    targetDate.setDate(now.getDate() + d);
    const dayOfWeek = targetDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const shiftStarts = isWeekend ? [8, 12, 16] : [6, 8, 10, 12, 14, 16, 18];

    for (let shiftIdx = 0; shiftIdx < shiftStarts.length; shiftIdx++) {
      const startHour = shiftStarts[shiftIdx];
      const pair = pairs[shiftIdx % pairs.length];
      const busId = buses[(d + shiftIdx) % buses.length];
      const driverId = drivers[(d + shiftIdx) % drivers.length];

      let currentHour = startHour;
      let currentMinute = 0;
      const rounds = startHour > 16 ? 1 : 2;

      for (let round = 0; round < rounds; round++) {
        // 1. TAM
        await createSchedule(targetDate, currentHour, currentMinute, pair.toKat, driverId, busId);
        scheduleCount++;
        
        const durationMinutes = Math.round(pair.toKat.total_distance_km / 60 * 1.5 * 60);
        let totalMinutes = currentHour * 60 + currentMinute + durationMinutes + 30;
        currentHour = Math.floor(totalMinutes / 60);
        currentMinute = totalMinutes % 60;

        // 2. POWRÓT
        await createSchedule(targetDate, currentHour, currentMinute, pair.toKrk, driverId, busId);
        scheduleCount++;

        totalMinutes = currentHour * 60 + currentMinute + durationMinutes + 30;
        currentHour = Math.floor(totalMinutes / 60);
        currentMinute = totalMinutes % 60;
      }
    }
  }

  console.log(`Zakończono. Wygenerowano ${scheduleCount} logicznych kursów powrotnych.`);
  await client.end();
}

generate().catch(console.error);
