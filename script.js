
const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyNGI2MDRhOGRkMmRkOWY5OGIwNDdkYzRmNWRlYTMwNyIsIm5iZiI6MTc3NzU1OTUzMS41NjQ5OTk4LCJzdWIiOiI2OWYzNjdlYjZkNDY1NTZkOGViNzIxN2YiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.7npxWyEU6UXnx4APUvFFLrAUtpMmatya1bbelWCNzKY';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w342';
const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/w1280';
const GENRE_URL = `${BASE_URL}/genre/movie/list?language=pt-BR`;
const MOVIES_URL = `${BASE_URL}/movie/now_playing?language=pt-BR&page=1&region=BR`;
const UPCOMING_URL = `${BASE_URL}/movie/upcoming?language=pt-BR&page=1&region=BR`;

let allMovies = [];
let genresMap = {};

// Função para buscar os gêneros
async function fetchGenres() {
    try {
        const response = await fetch(GENRE_URL, {
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json;charset=utf-8'
            }
        });
        const data = await response.json();
        data.genres.forEach(genre => {
            genresMap[genre.id] = genre.name;
        });
    } catch (error) {
        console.error('Erro ao buscar gêneros:', error);
    }
}

// Função para buscar os filmes em cartaz
async function fetchMovies() {
    try {
        const response = await fetch(MOVIES_URL, {
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json;charset=utf-8'
            }
        });
        const data = await response.json();
        allMovies = data.results;
        
        // Configurar o Hero Dinâmico com o primeiro filme da lista
        if (allMovies.length > 0) {
            updateHero(allMovies[0]);
        }

        renderMovies(allMovies, 'moviesList');
        
        // Inicializa botões e evento de scroll
        const moviesContainer = document.getElementById('moviesList');
        moviesContainer.addEventListener('scroll', () => updateCarouselButtons(moviesContainer));
        setTimeout(() => updateCarouselButtons(moviesContainer), 500); // Aguarda renderização

    } catch (error) {
        console.error('Erro ao buscar filmes:', error);
        document.getElementById('moviesList').innerHTML = '<p class="error">Erro ao carregar filmes.</p>';
    }
}

// Função para buscar próximos lançamentos
async function fetchUpcoming() {
    try {
        const response = await fetch(UPCOMING_URL, {
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json;charset=utf-8'
            }
        });
        const data = await response.json();
        const upcomingMovies = data.results;
        
        // Adiciona ao pool global de filmes para que o clique funcione
        allMovies = [...allMovies, ...upcomingMovies];
        
        renderMovies(upcomingMovies, 'upcomingList');

        // Inicializa botões e evento de scroll
        const upcomingContainer = document.getElementById('upcomingList');
        upcomingContainer.addEventListener('scroll', () => updateCarouselButtons(upcomingContainer));
        setTimeout(() => updateCarouselButtons(upcomingContainer), 500);

    } catch (error) {
        console.error('Erro ao buscar próximos lançamentos:', error);
        document.getElementById('upcomingList').innerHTML = '<p class="error">Erro ao carregar lançamentos.</p>';
    }
}

// Função para atualizar o Hero no topo
function updateHero(movie) {
    const heroBg = document.getElementById('heroBg');
    if (movie.backdrop_path) {
        heroBg.style.backgroundImage = `url('${BACKDROP_BASE_URL}${movie.backdrop_path}')`;
    }
}

// Função para renderizar os filmes
function renderMovies(movies, containerId) {
    const moviesList = document.getElementById(containerId);
    if (!moviesList) return;
    moviesList.innerHTML = '';

    if (movies.length === 0) {
        moviesList.innerHTML = '<div class="empty-state"><h2>Nenhum filme encontrado</h2><p>Tente outra pesquisa.</p></div>';
        return;
    }

    movies.forEach(movie => {
        const year = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';
        const rating = movie.vote_average.toFixed(1);
        const posterPath = movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : 'https://via.placeholder.com/185x270?text=Sem+Poster';
        
        // Mapear gêneros
        const genres = movie.genre_ids.map(id => genresMap[id]).filter(name => name).join(', ');

        const movieCard = `
            <div class="gPoster-wrapper" onclick="showMovieDetails(${movie.id})">
                <a href="#" title="${movie.title}" class="gPoster" onclick="event.preventDefault()">
                    <div class="inner">
                        <div class="p">
                            <img src="${posterPath}" class="img" width="185" height="270" alt="${movie.title}" loading="lazy">
                            <div class="e">
                                <h3>${movie.title}</h3>
                                <div class="g">${genres}</div>
                                <p>${movie.overview || 'Sem descrição disponível.'}</p>
                            </div>
                        </div>
                        <div class="i">
                            <span>${movie.title}</span>
                            <div class="mi">
                                <div class="y">${year}</div>
                                <div class="r">${rating}</div>
                            </div>
                        </div>
                    </div>
                </a>
            </div>
        `;
        moviesList.innerHTML += movieCard;
    });
}

// Função para mostrar detalhes no estilo Vizer Original
function showMovieDetails(movieId) {
    const movie = allMovies.find(m => m.id === movieId);
    if (!movie) return;

    const section = document.getElementById('movieDetailsSection');
    const year = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';
    const rating = movie.vote_average.toFixed(1);
    const starsPercent = (movie.vote_average * 10).toFixed(0); // Para a barra de estrelas
    
    const posterPath = movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : 'https://via.placeholder.com/350x500?text=Sem+Poster';
    const backdropPath = movie.backdrop_path ? `${BACKDROP_BASE_URL}${movie.backdrop_path}` : '';
    
    document.getElementById('modalTitle').innerText = movie.title.toUpperCase();
    document.getElementById('modalSubtitle').innerText = `DISPONÍVEL NOS CINEMAS`;
    document.getElementById('modalYear').innerText = year;
    document.getElementById('modalRating').innerText = rating;
    document.getElementById('modalStars').style.width = `${starsPercent}%`;
    document.getElementById('modalDesc').innerText = movie.overview || 'Sem descrição disponível.';
    document.getElementById('modalPoster').src = posterPath;
    document.getElementById('launcherBg').style.backgroundImage = backdropPath ? `url('${backdropPath}')` : 'none';

    // Exibir seção e rolar para o topo
    section.style.display = 'block';
    document.body.classList.add('detail-active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Função para fechar os detalhes
function closeDetails() {
    document.getElementById('movieDetailsSection').style.display = 'none';
    document.body.classList.remove('detail-active');
}

// Função de filtro
function filterMovies() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const filtered = allMovies.filter(movie => {
        const titleMatch = movie.title.toLowerCase().includes(query);
        const overviewMatch = movie.overview.toLowerCase().includes(query);
        return titleMatch || overviewMatch;
    });

    renderMovies(filtered, 'moviesList');
    document.getElementById('upcomingListing').style.display = query ? 'none' : 'block';
}

// Função para rolar o carrossel
function scrollCarousel(containerId, direction) {
    const container = document.getElementById(containerId);
    const scrollAmount = container.offsetWidth * 0.8;
    container.scrollBy({
        left: direction * scrollAmount,
        behavior: 'smooth'
    });
}

// Função para atualizar visibilidade dos botões do carrossel
function updateCarouselButtons(container) {
    const containerId = container.id;
    const parent = container.parentElement;
    const prevBtn = parent.querySelector('.prev');
    const nextBtn = parent.querySelector('.next');

    if (!prevBtn || !nextBtn) return;

    // Mostrar/Esconder botão Anterior
    if (container.scrollLeft <= 5) {
        prevBtn.style.opacity = '0';
        prevBtn.style.pointerEvents = 'none';
    } else {
        prevBtn.style.opacity = '1';
        prevBtn.style.pointerEvents = 'all';
    }

    // Mostrar/Esconder botão Próximo
    // Tolerância de 5px para arredondamentos de browser
    const isAtEnd = container.scrollLeft + container.offsetWidth >= container.scrollWidth - 5;
    if (isAtEnd) {
        nextBtn.style.opacity = '0';
        nextBtn.style.pointerEvents = 'none';
    } else {
        nextBtn.style.opacity = '1';
        nextBtn.style.pointerEvents = 'all';
    }
}

// Inicialização
async function init() {
    await fetchGenres();
    await fetchMovies();
    await fetchUpcoming();

    // Event listener para o campo de busca
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', filterMovies);
    
    // Quando clicar para pesquisar, fecha os detalhes do filme em evidência
    searchInput.addEventListener('focus', () => {
        if (document.body.classList.contains('detail-active')) {
            closeDetails();
        }
    });

    // Event listener para fechar detalhes
    const closeBtn = document.getElementById('closeDetails');
    if(closeBtn) closeBtn.onclick = closeDetails;
}

document.addEventListener('DOMContentLoaded', init);
