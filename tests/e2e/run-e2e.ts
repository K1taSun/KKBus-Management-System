import axios from 'axios';
import { runClientBookingScenario } from './client-booking.scenario';
import { runBruteForceLockoutScenario } from './brute-force-lockout.scenario';

const API_URL = 'http://localhost:3000/api';

async function checkServer() {
  try {
    await axios.get(`${API_URL}/public-info/routes`);
    return true;
  } catch (err) {
    return false;
  }
}

async function main() {
  console.log('=== URUCHAMIANIE TESTÓW E2E ===');
  const isUp = await checkServer();
  if (!isUp) {
    console.warn('\n[OSTRZEŻENIE] Serwer backendu (http://localhost:3000/api) nie działa.');
    console.warn('Aby uruchomić testy scenariuszowe E2E, włącz projekt za pomocą start.sh lub docker-compose.');
    console.warn('Scenariusze E2E zostaną pominięte.\n');
    process.exit(2);
  }

  try {
    console.log('\nUruchamianie Scenariusza: Rezerwacja Klienta...');
    await runClientBookingScenario(API_URL);
    console.log('✅ Scenariusz: Rezerwacja Klienta zakończona sukcesem!');

    console.log('\nUruchamianie Scenariusza: Blokada Brute-Force...');
    await runBruteForceLockoutScenario(API_URL);
    console.log('✅ Scenariusz: Blokada Brute-Force zakończona sukcesem!');
    
    console.log('\nWszystkie testy E2E zakończone pomyślnie!');
  } catch (err: any) {
    console.error('❌ Błąd podczas wykonywania testów E2E:', err.message);
    if (err.response) {
      console.error('Status:', err.response.status, 'Dane:', err.response.data);
    }
    process.exit(1);
  }
}

main();
