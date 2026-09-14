import './style.css';

interface FilmMock {
  id: number;
  title: string;
  genre: string;
  year: number;
  description: string;
}

const mockFilms: FilmMock[] = [
  {
    id: 1,
    title: "film1",
    genre: "Biografico",
    year: 2026,
    description: "test1"
  },
  {
    id: 2,
    title: "film",
    genre: "Drammatico",
    year: 2023,
    description: "descrizione"
  },
  {
    id: 3,
    title: "film!",
    genre: "Grottesco",
    year: 2024,
    description: "test"
  }
];

const moviesGrid = document.getElementById('movies-grid');

function renderMockFilms(films: FilmMock[]): void {
  if (!moviesGrid) return;
  
  moviesGrid.innerHTML = films.map(film => `
    <article class="movie-card" style="padding: 1.5rem; background-color: var(--card-bg); border-radius: 12px; margin-bottom: 1rem;">
      <h3 class="movie-title" style="margin-bottom: 0.5rem; font-size: 1.5rem; color: var(--primary-color);">${film.title}</h3>
      <p class="movie-meta" style="color: var(--text-muted); margin-bottom: 1rem; font-size: 0.9rem;">${film.genre} • ${film.year}</p>
      <p style="line-height: 1.5;">${film.description}</p>
    </article>
  `).join('');
}

renderMockFilms(mockFilms);