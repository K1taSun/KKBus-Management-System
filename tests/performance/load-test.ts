import axios from 'axios';

const API_URL = 'http://localhost:3000/api';
const CONCURRENT_USERS = 50;

async function checkServer() {
  try {
    await axios.get(`${API_URL}/public-info/routes`);
    return true;
  } catch (err) {
    return false;
  }
}

async function runSingleRequest(id: number): Promise<{ success: boolean; latency: number; error?: string }> {
  const start = Date.now();
  try {
    // Firing request to public info timetable (which includes DB reads and caching logic)
    const res = await axios.get(`${API_URL}/public-info/timetable`);
    const end = Date.now();
    return {
      success: res.status === 200,
      latency: end - start,
    };
  } catch (err: any) {
    const end = Date.now();
    return {
      success: false,
      latency: end - start,
      error: err.message,
    };
  }
}

async function main() {
  console.log('=== URUCHAMIANIE TESTÓW WYDAJNOŚCIOWYCH ===');
  console.log(`Symulacja ${CONCURRENT_USERS} współbieżnych użytkowników odpytujących API rozkładu jazdy...`);

  const isUp = await checkServer();
  if (!isUp) {
    console.warn('\n[OSTRZEŻENIE] Serwer backendu (http://localhost:3000/api) nie działa.');
    console.warn('Test wydajnościowy wymaga działającego backendu.');
    console.warn('Test wydajnościowy zostanie pominięty.\n');
    process.exit(0);
  }

  const startTotal = Date.now();
  
  // Launch all requests concurrently
  const promises = Array.from({ length: CONCURRENT_USERS }).map((_, i) => runSingleRequest(i + 1));
  const results = await Promise.all(promises);
  
  const endTotal = Date.now();
  const totalDuration = endTotal - startTotal;

  // Analytics
  let successfulRequests = 0;
  let failedRequests = 0;
  const latencies: number[] = [];

  results.forEach(res => {
    if (res.success) {
      successfulRequests++;
      latencies.push(res.latency);
    } else {
      failedRequests++;
    }
  });

  latencies.sort((a, b) => a - b);

  const avgLatency = latencies.length > 0 ? latencies.reduce((sum, val) => sum + val, 0) / latencies.length : 0;
  const minLatency = latencies.length > 0 ? latencies[0] : 0;
  const maxLatency = latencies.length > 0 ? latencies[latencies.length - 1] : 0;
  
  // Percentiles
  const p50 = latencies.length > 0 ? latencies[Math.floor(latencies.length * 0.50)] : 0;
  const p90 = latencies.length > 0 ? latencies[Math.floor(latencies.length * 0.90)] : 0;
  const p99 = latencies.length > 0 ? latencies[Math.floor(latencies.length * 0.99)] : 0;

  console.log('\n--- WYNIKI TESTU WYDAJNOŚCIOWEGO ---');
  console.log(`Całkowity czas wykonania serii:  ${totalDuration} ms`);
  console.log(`Liczba wysłanych żądań:          ${CONCURRENT_USERS}`);
  console.log(`Udane zapytania (HTTP 200):      ${successfulRequests} (${((successfulRequests / CONCURRENT_USERS) * 100).toFixed(1)}%)`);
  console.log(`Nieudane zapytania:              ${failedRequests} (${((failedRequests / CONCURRENT_USERS) * 100).toFixed(1)}%)`);
  
  if (successfulRequests > 0) {
    console.log(`Minimalny czas odpowiedzi:       ${minLatency} ms`);
    console.log(`Maksymalny czas odpowiedzi:      ${maxLatency} ms`);
    console.log(`Średni czas odpowiedzi (Avg):    ${avgLatency.toFixed(1)} ms`);
    console.log(`Percentyl 50 (Mediana):          ${p50} ms`);
    console.log(`Percentyl 90 (p90):              ${p90} ms`);
    console.log(`Percentyl 99 (p99):              ${p99} ms`);
  }

  // SLA Verification: "Response time up to 3 seconds (3000 ms)"
  const SLA_LIMIT = 3000;
  const passedSLA = avgLatency < SLA_LIMIT && maxLatency < SLA_LIMIT && failedRequests === 0;

  console.log('\n--- WERYFIKACJA WYMAGAŃ NIEFUNKCJONALNYCH (SLA) ---');
  console.log(`Wymaganie: Czas reakcji do 3.0s dla 30-50 współbieżnych użytkowników.`);
  if (passedSLA) {
    console.log('✅ STATUS: ZDANE (Czas reakcji mieści się w limitach SLA, brak błędów HTTP).');
  } else {
    console.log('❌ STATUS: NIEZDANE (Przekroczono czas reakcji lub wystąpiły błędy).');
  }
  console.log('----------------------------------------------------');
}

main();
