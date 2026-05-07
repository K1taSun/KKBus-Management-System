document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('kkbus_token');
  if (!token) {
    alert('Brak autoryzacji! Zaloguj się jako administrator.');
    window.location.href = '/index.html';
    return;
  }

  // Wylogowanie
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('kkbus_token');
      window.location.href = '/index.html';
    });
  }

  const loadReports = async () => {
    try {
      const container = document.getElementById('reportsContainer');
      if (!container) return;

      container.innerHTML = '<p>Ładowanie raportów...</p>';

      // Pobieranie popularności
      const popRes = await fetch('/api/reports/popularity', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // Pobieranie finansów
      const finRes = await fetch('/api/reports/finance', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!popRes.ok || !finRes.ok) {
        throw new Error('Brak dostępu lub błąd serwera (Zaloguj się z rolą Admin)');
      }

      const popData = await popRes.json();
      const finData = await finRes.json();

      let html = '<h3>Popularność tras:</h3><ul>';
      popData.forEach(r => {
         html += `<li>${r.route_name} - ${r.total_reservations} rezerwacji</li>`;
      });
      html += '</ul>';

      html += '<h3>Estymacje finansowe (brutto):</h3><ul>';
      finData.forEach(f => {
         html += `<li>Kurs (ID: ${f.schedule_id}): ${f.estimated_revenue} PLN</li>`;
      });
      html += '</ul>';

      container.innerHTML = html;

    } catch (err) {
      console.error(err);
      alert(err.message || 'Wystąpił błąd podczas ładowania raportów.');
    }
  };

  const loadBtn = document.getElementById('loadReportsBtn');
  if (loadBtn) {
    loadBtn.addEventListener('click', loadReports);
  } else {
    // Automatycznie ładuj jeśli przycisk nie istnieje
    loadReports();
  }
});
