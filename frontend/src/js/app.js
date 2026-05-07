/* ═══════════════════════════════════════════════════════════════
   KKBus – Frontend Interactivity
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ─── Header scroll effect ───────────────────────────────────
  const header = document.getElementById('header');
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ─── Mobile menu toggle ─────────────────────────────────────
  const menuToggle = document.getElementById('menuToggle');
  const mobileNav = document.getElementById('mobileNav');

  menuToggle.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    menuToggle.classList.toggle('active', isOpen);
    menuToggle.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close mobile menu on link click
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      menuToggle.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // ─── Set today as default date ──────────────────────────────
  const dateInput = document.getElementById('date');
  if (dateInput) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    dateInput.value = `${yyyy}-${mm}-${dd}`;
    dateInput.min = `${yyyy}-${mm}-${dd}`;
  }

  // ─── Swap "from" ↔ "to" fields ─────────────────────────────
  const swapBtn = document.getElementById('swapBtn');
  const fromInput = document.getElementById('from');
  const toInput = document.getElementById('to');

  if (swapBtn) {
    swapBtn.addEventListener('click', () => {
      const tmp = fromInput.value;
      fromInput.value = toInput.value;
      toInput.value = tmp;
    });
  }

  // ─── Search form submission & Validation ──────────────────────
  const searchForm = document.getElementById('searchForm');
  searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const fromInput = document.getElementById('from');
    const toInput = document.getElementById('to');
    const from = fromInput.value.trim();
    const to = toInput.value.trim();
    const dateStr = dateInput.value;
    const passengers = document.getElementById('passengers').value;

    // Client-side validation
    let hasError = false;

    // Walidacja miast (tylko litery, spacje, myślniki, polskie znaki)
    const cityRegex = /^[A-Za-zĄąĆćĘęŁłŃńÓóŚśŹźŻż\s\-]{2,50}$/;
    
    if (!cityRegex.test(from)) {
      alert('Podaj poprawne miasto wyjazdu (tylko litery, min. 2 znaki).');
      fromInput.focus();
      hasError = true;
      return;
    }

    if (!cityRegex.test(to)) {
      alert('Podaj poprawne miasto docelowe (tylko litery, min. 2 znaki).');
      toInput.focus();
      hasError = true;
      return;
    }

    if (from.toLowerCase() === to.toLowerCase()) {
      alert('Miasto docelowe nie może być takie samo jak miasto wyjazdu!');
      toInput.focus();
      hasError = true;
      return;
    }

    // Walidacja daty (nie w przeszłości)
    const selectedDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // wyzerowanie godzin do porownania
    if (selectedDate < today) {
      alert('Wybrana data wyjazdu jest w przeszłości!');
      dateInput.focus();
      hasError = true;
      return;
    }

    if (hasError) return;

    try {
      const submitBtn = searchForm.querySelector('.search-submit');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '⏳ Szukam...';
      submitBtn.disabled = true;

      // Wywołanie API na Nginx Reverse Proxy -> Backend
      const response = await fetch(`/api/schedules?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${encodeURIComponent(dateStr)}`);
      
      if (!response.ok) {
        throw new Error(`Błąd serwera: ${response.status}`);
      }

      const data = await response.json();
      
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;

      if (data.length === 0) {
        alert(`Brak połączeń na trasie ${from} -> ${to} w dniu ${dateStr}.`);
      } else {
        // Docelowo: dynamiczne wyrenderowanie kart z wynikami
        let msg = `Znaleziono ${data.length} połączeń:\n\n`;
        data.forEach(s => {
          msg += `🚌 ${s.route_name}\nWyjazd: ${new Date(s.departure_time).toLocaleTimeString()} | Miejsc: ${s.available_seats}\nCena: ${s.price_base} PLN\n\n`;
        });
        alert(msg);
      }
    } catch (err) {
      alert('Błąd połączenia z serwerem. Upewnij się, że kontenery działają (docker-compose up).');
      console.error(err);
    }
  });

  // ─── Scroll reveal animations ───────────────────────────────
  const reveals = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Stagger animation for siblings
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, index * 100);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px'
    });

    reveals.forEach(el => observer.observe(el));
  } else {
    // Fallback: show all elements
    reveals.forEach(el => el.classList.add('visible'));
  }

  // ─── Smooth scroll for anchor links ─────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      e.preventDefault();
      const target = document.querySelector(targetId);
      if (target) {
        const offset = header.offsetHeight + 16;
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

});
