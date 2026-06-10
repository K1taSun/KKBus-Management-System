import axios from 'axios';

export async function runBruteForceLockoutScenario(apiUrl: string) {
  const email = `e2e.lockout.${Math.floor(Math.random() * 100000)}@example.com`;
  const correctPassword = 'CorrectPassword123!';
  const wrongPassword = 'WrongPassword999';

  console.log(`  -> Rejestrowanie użytkownika testowego: ${email}...`);
  await axios.post(`${apiUrl}/auth/register`, {
    email,
    password: correctPassword,
    first_name: 'Blokada',
    last_name: 'Test',
    dateOfBirth: '1990-01-01',
    phone: '555666777',
    loyaltyProgramConsent: false,
  });

  console.log('  -> Próba logowania z błędnym hasłem [Próba 1/3]...');
  try {
    await axios.post(`${apiUrl}/auth/login`, { email, password: wrongPassword });
  } catch (err: any) {
    if (err.response.status !== 401) {
      throw new Error(`Oczekiwano statusu 401, otrzymano: ${err.response.status}`);
    }
  }

  console.log('  -> Próba logowania z błędnym hasłem [Próba 2/3]...');
  try {
    await axios.post(`${apiUrl}/auth/login`, { email, password: wrongPassword });
  } catch (err: any) {
    if (err.response.status !== 401) {
      throw new Error(`Oczekiwano statusu 401, otrzymano: ${err.response.status}`);
    }
  }

  console.log('  -> Próba logowania z błędnym hasłem [Próba 3/3 - powinna wywołać zawieszenie]...');
  let lockoutMessage = '';
  try {
    await axios.post(`${apiUrl}/auth/login`, { email, password: wrongPassword });
    throw new Error('Trzecia nieudana próba powinna zostać odrzucona!');
  } catch (err: any) {
    if (err.response.status !== 401) {
      throw new Error(`Oczekiwano statusu 401, otrzymano: ${err.response.status}`);
    }
    lockoutMessage = err.response.data.message || '';
  }

  console.log(`  -> Komunikat po 3. próbie: "${lockoutMessage}"`);

  // 4. Próba zalogowania POPRAWNYM hasłem podczas trwania zawieszenia
  console.log('  -> Próba zalogowania POPRAWNYM hasłem podczas aktywnego zawieszenia...');
  try {
    await axios.post(`${apiUrl}/auth/login`, { email, password: correctPassword });
    throw new Error('Logowanie poprawnym hasłem powinno być zablokowane podczas zawieszenia konta!');
  } catch (err: any) {
    if (err.response.status === 401) {
      console.log(`  -> [SUKCES] Logowanie poprawnym hasłem zostało odrzucone z komunikatem: "${err.response.data.message}"`);
    } else {
      throw err;
    }
  }
}
