async function run() {
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'kierowca@kkbus.pl', password: 'Test1234!' })
  });
  
  const cookies = loginRes.headers.get('set-cookie');
  let cookieHeader = '';
  if (cookies) {
    cookieHeader = cookies.split(';')[0];
  }

  const setRes = await fetch('http://localhost:3000/api/driver/availability', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookieHeader
    },
    body: JSON.stringify({ availableDate: '2026-06-19', status: 'Niedostępny' })
  });

  console.log('Set Status:', setRes.status);
  const setText = await setRes.text();
  console.log('Set Response:', setText);

  const getRes = await fetch('http://localhost:3000/api/driver/availability', {
    method: 'GET',
    headers: {
      'Cookie': cookieHeader
    }
  });

  console.log('Get Status:', getRes.status);
  const getText = await getRes.text();
  console.log('Get Response:', getText);
}

run().catch(console.error);
