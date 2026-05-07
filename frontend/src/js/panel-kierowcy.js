document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('kkbus_token');
  if (!token) {
    alert('Brak autoryzacji! Zaloguj się najpierw.');
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

  const loadDriverSchedules = async () => {
    try {
      // Przyjęto uproszczony schemat - backend musiałby filtrować po ID kierowcy z JWT
      // W celach poglądowych pobieramy listę wszystkich kursów
      const res = await fetch('/api/schedules', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          alert('Sesja wygasła lub brak uprawnień.');
          localStorage.removeItem('kkbus_token');
          window.location.href = '/index.html';
          return;
        }
        throw new Error('Błąd ładowania danych');
      }

      const schedules = await res.json();
      
      const container = document.getElementById('schedulesContainer');
      if (!container) return; // Jeśli HTML nie ma takiego kontenera

      if (schedules.length === 0) {
        container.innerHTML = '<p>Brak przypisanych kursów na dzisiaj.</p>';
        return;
      }

      container.innerHTML = '';
      schedules.forEach(s => {
        const div = document.createElement('div');
        div.className = 'schedule-card';
        div.innerHTML = `
          <h3>Trasa: ${s.route_name}</h3>
          <p>Wyjazd: ${new Date(s.departure_time).toLocaleString()}</p>
          <p>Autobus: ${s.bus_model} | Miejsc wolnych: ${s.available_seats} / ${s.capacity}</p>
          <button class="btn btn-primary" onclick="showPassengers(${s.id})">Pokaż pasażerów</button>
        `;
        container.appendChild(div);
      });

    } catch (err) {
      console.error(err);
      alert('Wystąpił błąd podczas komunikacji z serwerem API.');
    }
  };

  loadDriverSchedules();
});

// Funkcja globalna dla przycisków
window.showPassengers = async function(scheduleId) {
  const token = localStorage.getItem('kkbus_token');
  try {
    const res = await fetch(`/api/schedules/${scheduleId}`, {
       headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    let msg = `Lista zajętych miejsc dla kursu ${data.route_name}:\n`;
    if (!data.booked_seats || data.booked_seats.length === 0 || data.booked_seats[0] === null) {
       msg += "Brak pasażerów.";
    } else {
       msg += data.booked_seats.sort((a,b) => a-b).join(', ');
    }
    alert(msg);
  } catch (e) {
    alert('Błąd pobierania pasażerów.');
  }
};
