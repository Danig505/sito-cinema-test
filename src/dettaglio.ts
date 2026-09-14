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

const API_URL = 'https://its-cinema.vercel.app/api';
const detailContainer = document.getElementById('movie-detail');

async function getFilmDetail(): Promise<void> {
  const urlParams = new URLSearchParams(window.location.search);
  const filmId = urlParams.get('id');

  if (!filmId) {
    if (detailContainer) detailContainer.innerHTML = '<p>Nessun film selezionato.</p>';
    return;
  }

  try {
    const response = await fetch(`${API_URL}/films/${filmId}`);
    if (!response.ok) throw new Error('Errore HTTP');
    
    const film: FilmDetail = await response.json();
    renderDetail(film);
  } catch (error) {
    if (detailContainer) detailContainer.innerHTML = '<p>Errore nel caricamento del film.</p>';
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

getFilmDetail();