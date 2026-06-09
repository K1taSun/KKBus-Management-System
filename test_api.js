const http = require('http');

const from = encodeURIComponent("Kraków Dworzec MDA");
const to = encodeURIComponent("Katowice Sądowa / Dworzec Główny");
const date = "2026-06-10";

http.get(`http://localhost:3000/api/public-info/search?from=${from}&to=${to}&date=${date}&passengers=1`, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log("Response:", data);
  });
}).on('error', (err) => {
  console.log("Error:", err.message);
});
