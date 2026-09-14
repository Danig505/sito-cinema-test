import './style.css';

interface Film {
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
const moviesGrid = document.getElementById('movies-grid');

async function getFilms(): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/films`);
    
    if (!response.ok) {
      throw new Error(`Errore HTTP: ${response.status}`);
    }
    
    const films: Film[] = await response.json();
    renderFilms(films);
    
  } catch (error) {
    if (moviesGrid) {
      moviesGrid.innerHTML = `
        <div style="color: var(--primary-color); grid-column: 1 / -1; text-align: center; padding: 2rem;">
          Impossibile caricare i film al momento. Riprova più tardi.
        </div>`;
    }
  }
}

function renderFilms(films: Film[]): void {
  if (!moviesGrid) return;
  
  moviesGrid.innerHTML = films.map(film => `
    <article class="movie-card">
      <div class="poster-container">
        <img src="${film.poster_url}" alt="${film.title}" class="movie-poster" loading="lazy">
      </div>
      <div class="movie-info">
        <h3 class="movie-title">${film.title}</h3>
        <p class="movie-meta">${film.genre} • ${film.duration} min • ${film.year}</p>
        <div class="rating-badge">${film.rating}</div>
        
        <a href="/dettaglio.html?id=${film.id}" class="btn-primary">Scopri di più</a>
      </div>
    </article>
  `).join('');
}

getFilms();