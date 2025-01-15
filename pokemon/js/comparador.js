// https://veekun.com/dex/gadgets/compare_pokemon?pokemon=bulbasur&pokemon=charmander
const buscadores = document.querySelectorAll('.barraBusqueda');
const listasPokemon = document.querySelectorAll('.pokemon-todos');
const divsComparadores = document.querySelectorAll('.comparadorPokemon');
const loading = document.querySelectorAll('.loading');

const worker = new Worker('js/worker.js');
let pokemons = []; // Array para almacenar los datos de los pokemons
let currentPage = 1;
const pokemonsPerPage = 3;

const statsTraducidas = {
    "hp": "Puntos de Salud",
    "attack": "Ataque",
    "defense": "Defensa",
    "special-attack": "Ataque Especial",
    "special-defense": "Defensa Especial",
    "speed": "Velocidad"
};

buscadores.forEach((buscador, indice) => {
    buscador.addEventListener('input', (event) => {
        const searchTerm = event.target.value.toLowerCase();
        const listaPokemon = listasPokemon[indice];
        const divComparador = divsComparadores[indice];
        filtrarPokemon(searchTerm, buscador, listaPokemon, divComparador);
    });
});

worker.onmessage = function (event) {
    const pokemones = event.data;
    localStorage.setItem('allPokemons', JSON.stringify(pokemones));
    pokemons = pokemones;

    loading.forEach(indicador => {
        indicador.style.display = 'none';
    })
};

function iniciar() {
    const cachedPokemones = localStorage.getItem('allPokemons');
    if (cachedPokemones) {
        const pokemones = JSON.parse(cachedPokemones);
        pokemons = pokemones;
        loading.forEach(indicador => {
            indicador.style.display = 'none';
        })
    } else {
        worker.postMessage('loadPokemons');
        loading.forEach(indicador => {
            indicador.style.display = 'block';
        })
    }
}

function filtrarPokemon(searchTerm, buscador, listaPokemon, divComparador) {
    const pokemones = JSON.parse(localStorage.getItem('allPokemons'));
    listaPokemon.innerHTML = '';
    
    const filteredPokemones = isNaN(searchTerm) 
        ? pokemones.filter(poke => poke.name.toLowerCase().includes(searchTerm.toLowerCase()))
        : pokemones.filter(poke => poke.id === parseInt(searchTerm));
    
    currentPage = 1; // Reset to the first page when filtering
    renderFilteredPage(filteredPokemones, currentPage, buscador, listaPokemon, divComparador);
}

function renderFilteredPage(filteredPokemones, page, buscador, listaPokemon, divComparador) {
    const start = (page - 1) * pokemonsPerPage;
    const end = start + pokemonsPerPage;
    const paginatedPokemons = filteredPokemones.slice(start, end);
    mostrarPokemon(paginatedPokemons, buscador, listaPokemon, divComparador);
}

function mostrarPokemon(pokemons, buscador, listaPokemon, divComparador) {
    listaPokemon.innerHTML = ''; // Clear previous content
    pokemons.forEach(poke => {
        let tipos = poke.types.map(type => `<p class="${type} tipo">${type}</p>`).join('');

        const div = document.createElement("div");
        div.classList.add("pokemon");

        div.innerHTML = `
            <div class="pokemon-imagen">
                <img src="${poke.image}" alt="${poke.name}">
            </div>
            <div class="pokemon-info">
                <div class="nombre-contenedor">
                    <p class="pokemon-nombre">${poke.name}</p>
                </div>
                <div class="pokemon-tipos">
                    ${tipos}
                </div>
            </div>
        `;

        div.addEventListener('click', () => {
            mostrarPokemonAComparar(poke, divComparador)
            listaPokemon.innerHTML='';
            buscador.value='';
        });

        listaPokemon.appendChild(div);
    });
}

function mostrarPokemonAComparar(poke, divComparador) {
    let tipos = poke.types.map(type => `<p class="${type} tipo">${type}</p>`).join('');
    let stats = poke.stats.map(stat => {
        const statsEsp = statsTraducidas[stat.stat.name] || stat.stat.name;
        return `<p class="stat"><b>${statsEsp}:</b> ${stat.base_stat}</p>`;
    }).join('');
    let totalStats = 0;
    // poke.stats.forEach(stat => stat.base_stat);
    
    divComparador.innerHTML = `
        <div class="pokemon-seleccionado">
            <div class="pokemon-imagen">
                <img src="${poke.image}" alt="${poke.name}">
            </div>
            <div class="pokemon-info">
                <h2>${poke.name.toUpperCase()}</h2>
                <div class="pokemon-tipos">
                    ${tipos}
                </div>
                <div class="pokemon-stats">
                    ${stats}
                    <p class="totalStats"><b>Base Total Estadisticas:</b> ${totalStats}</p>
                </div>
            </div>
        </div>
    `;
}

// Call iniciar to start the process
iniciar();