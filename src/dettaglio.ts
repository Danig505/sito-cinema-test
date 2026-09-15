import './style.css';

interface FilmDetail {
  id: number;
  title: string;
  genre: string;
  duration: number;
  director: string;
  description: string;
  poster_url: string;
  year: number;
  rating: string;
}

interface Hall {
  id: number;
  name: string;
  capacity: number;
}

interface Screening {
  id: number;
  starts_at: string;
  hall: Hall;
  available_seats: number;
}

const API_URL = 'https://its-cinema.vercel.app/api';
const detailContainer = document.getElementById('movie-detail');
const screeningsList = document.getElementById('screenings-list');

// Elementi della Modale
const modal = document.getElementById('booking-modal');
const closeModalBtn = document.getElementById('close-modal');
const bookingForm = document.getElementById('booking-form') as HTMLFormElement;
const screeningIdInput = document.getElementById('screening-id') as HTMLInputElement;
const bookingMessage = document.getElementById('booking-message');

let currentFilmId: string | null = null;

async function initPage(): Promise<void> {
  const urlParams = new URLSearchParams(window.location.search);
  currentFilmId = urlParams.get('id');

  if (!currentFilmId) {
    if (detailContainer) detailContainer.innerHTML = '<p>Nessun film selezionato.</p>';
    return;
  }

  await getFilmDetail(currentFilmId);
  await getScreenings(currentFilmId);
  setupModal();
}

async function getFilmDetail(filmId: string): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/films/${filmId}`);
    if (!response.ok) throw new Error('Errore HTTP');
    
    const film: FilmDetail = await response.json();
    renderDetail(film);
  } catch (error) {
    if (detailContainer) detailContainer.innerHTML = '<p>Errore nel caricamento del film.</p>';
  }
}

async function getScreenings(filmId: string): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/films/${filmId}/screenings`);
    if (!response.ok) throw new Error('Errore HTTP');
    
    const screenings: Screening[] = await response.json();
    renderScreenings(screenings);
  } catch (error) {
    if (screeningsList) screeningsList.innerHTML = '<p>Spettacoli non disponibili al momento.</p>';
  }
}

function renderDetail(film: FilmDetail): void {
  if (!detailContainer) return;

  detailContainer.innerHTML = `
    <div class="detail-poster">
      <img src="${film.poster_url}" alt="${film.title}">
    </div>
    <div class="detail-info">
      <h1 class="detail-title">${film.title.toUpperCase()}</h1>
      
      <div class="detail-badges">
        <span class="badge badge-outline">${film.genre.toUpperCase()}</span>
        <span class="badge badge-outline">${film.year}</span>
        <span class="badge badge-primary">${film.rating}</span>
        <span class="badge badge-outline">${film.duration} MIN</span>
      </div>

      <div class="detail-row">
        <span class="detail-label">REGISTA</span>
        <span class="detail-value">${film.director}</span>
      </div>
      
      <div class="detail-row">
        <span class="detail-label">TRAMA</span>
        <span class="detail-value">${film.description}</span>
      </div>
    </div>
  `;
}

function renderScreenings(screenings: Screening[]): void {
  if (!screeningsList) return;
  
  if (screenings.length === 0) {
    screeningsList.innerHTML = '<p>Nessuno spettacolo in programma.</p>';
    return;
  }

  screeningsList.innerHTML = screenings.map(s => {
    // Trasformiamo la data del server in un formato leggibile italiano
    const dateObj = new Date(s.starts_at);
    const dateStr = dateObj.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }).toUpperCase();
    const timeStr = dateObj.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    
    const isFull = s.available_seats === 0;
    
    return `
      <div class="screening-card">
        <div class="screening-time">
          <span class="s-date">${dateStr}</span>
          <span class="s-hour">${timeStr}</span>
        </div>
        <div class="screening-info">
          <span class="s-room">${s.hall.name}</span>
          <span class="s-seats">${s.available_seats} / ${s.hall.capacity} posti disponibili</span>
        </div>
        <button class="btn-primary book-btn ${isFull ? 'btn-disabled' : ''}" ${isFull ? 'disabled' : ''} data-id="${s.id}">
          ${isFull ? 'ESAURITO' : 'DISPONIBILE'}
        </button>
      </div>
    `;
  }).join('');

  // Aggiungiamo il click ad ogni pulsante "Disponibile"
  document.querySelectorAll('.book-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const screeningId = (e.currentTarget as HTMLButtonElement).getAttribute('data-id');
      if (screeningId) openModal(screeningId);
    });
  });
}

// --- LOGICA MODALE PRENOTAZIONE ---

function setupModal(): void {
  if (closeModalBtn && modal) {
    closeModalBtn.addEventListener('click', () => {
      modal.classList.add('hidden');
    });
  }

  if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await submitBooking();
    });
  }
}

function openModal(screeningId: string): void {
  if (!modal || !screeningIdInput) return;
  screeningIdInput.value = screeningId;
  if (bookingMessage) bookingMessage.innerHTML = '';
  if (bookingForm) bookingForm.reset();
  modal.classList.remove('hidden');
}

async function submitBooking(): Promise<void> {
  const screeningId = screeningIdInput?.value;
  const name = (document.getElementById('nome') as HTMLInputElement).value;
  const surname = (document.getElementById('cognome') as HTMLInputElement).value;
  const email = (document.getElementById('email') as HTMLInputElement).value;

  try {
    const response = await fetch(`${API_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        film_id: currentFilmId ? parseInt(currentFilmId) : null,
        screening_id: parseInt(screeningId),
        name,
        surname,
        email
      })
    });

    if (!response.ok) throw new Error();

    if (bookingMessage) {
      bookingMessage.innerHTML = '<p class="success-msg">Prenotazione confermata! 🍿</p>';
    }

    // Ricarica gli spettacoli per far scendere i posti disponibili
    if (currentFilmId) await getScreenings(currentFilmId);

    // Chiude la modale da sola dopo 2 secondi
    setTimeout(() => {
      if (modal) modal.classList.add('hidden');
    }, 2000);

  } catch (error) {
    if (bookingMessage) {
      bookingMessage.innerHTML = '<p class="error-msg">Ops! Errore di rete. Riprova.</p>';
    }
  }
}

initPage();