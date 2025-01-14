const listaPokemon = document.querySelector('#listaPokemon');
const botonesTipo = document.querySelectorAll('.btn-tipo');
const botonesGen = document.querySelectorAll('.btn-gen');
const buscador = document.querySelector('#barraBusqueda');
const loadingIndicator = document.querySelector('#loading');
const worker = new Worker('js/worker.js');

let pokemons = [];
let currentPage = 1;
const pokemonsPerPage = 30;

// Evento para buscar por nombre o número
buscador.addEventListener('input', (event) => {
    const searchTerm = event.target.value.toLowerCase();
    filtrarPokemon(searchTerm);
});

// Cargar Pokémon desde la API o localStorage
document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('allPokemons')) {
        worker.postMessage({ tipo: 'cargarTodos' });
    } else {
        renderPage(1);
    }
});

// Recibir datos del Worker
worker.onmessage = function (event) {
    const pokemones = event.data;
    localStorage.setItem('allPokemons', JSON.stringify(pokemones));
    pokemons = pokemones;
    renderPage(currentPage);
    loadingIndicator.style.display = 'none';
};

// Inicializar la aplicación
function iniciar() {
    const cachedPokemones = localStorage.getItem('allPokemons');
    if (cachedPokemones) {
        pokemons = JSON.parse(cachedPokemones);
        renderPage(currentPage);
        loadingIndicator.style.display = 'none';
    } else {
        worker.postMessage('loadPokemons');
        loadingIndicator.style.display = 'block';
    }

    botonesTipo.forEach(boton => {
        boton.addEventListener('click', (event) => filtrarPorTipo(event.target.id));
    });

    botonesGen.forEach(boton => {
        boton.addEventListener('click', (event) => filtrarPorGeneracion(event.target.id));
    });
}

// Mostrar Pokémon en el DOM
function mostrarPokemon(pokemons) {
    listaPokemon.innerHTML = '';
    pokemons.forEach(poke => {
        let tipos = poke.types.map(type => `<p class="${type} tipo">${type}</p>`).join('');
        let pokeId = poke.id.toString().padStart(3, '0');

        const div = document.createElement("div");
        div.classList.add("pokemon");
        div.innerHTML = `
            <p class="pokemon-id-back">#${pokeId}</p>
            <div class="pokemon-imagen">
                <img src="${poke.image}" alt="${poke.name}">
            </div>
            <div class="pokemon-info">
                <p class="pokemon-nombre">${poke.name}</p>
                <div class="pokemon-tipos">${tipos}</div>
            </div>
        `;
        div.addEventListener('click', () => window.location.href = `./detalle.html?id=${poke.id}`);
        listaPokemon.appendChild(div);
    });
}

// Función para filtrar Pokémon
function filtrarPokemon(searchTerm) { /* Código ya incluido */ }
function filtrarPorGeneracion(generacionId) { /* Código ya incluido */ }
function filtrarPorTipo(tipo) { /* Código ya incluido */ }
function renderPage(page) { /* Código ya incluido */ }

// Inicializar
iniciar();
