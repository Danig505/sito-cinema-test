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

interface Screening {
  id: number;
  date: string;
  time: string;
  room: string;
  booked_seats: number;
  total_seats: number;
}

const API_URL = 'https://its-cinema.vercel.app/api';
const detailContainer = document.getElementById('movie-detail');
const screeningsList = document.getElementById('screenings-list');

async function initPage(): Promise<void> {
  const urlParams = new URLSearchParams(window.location.search);
  const filmId = urlParams.get('id');

  if (!filmId) {
    if (detailContainer) detailContainer.innerHTML = '<p>Nessun film selezionato.</p>';
    return;
  }

  await getFilmDetail(filmId);
  await getScreenings(filmId);
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
    const isFull = s.booked_seats >= s.total_seats;
    return `
      <div class="screening-card">
        <div class="screening-time">
          <span class="s-date">${s.date}</span>
          <span class="s-hour">${s.time}</span>
        </div>
        <div class="screening-info">
          <span class="s-room">${s.room}</span>
          <span class="s-seats">${s.total_seats - s.booked_seats} / ${s.total_seats} posti disponibili</span>
        </div>
        <button class="btn-primary ${isFull ? 'btn-disabled' : ''}" ${isFull ? 'disabled' : ''}>
          ${isFull ? 'ESAURITO' : 'DISPONIBILE'}
        </button>
      </div>
    `;
  }).join('');
}

initPage();