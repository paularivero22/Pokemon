const buscadores = document.querySelectorAll('.barraBusqueda');
const listasPokemon = document.querySelectorAll('.pokemon-todos');
const divsComparadores = document.querySelectorAll('.comparadorPokemon');
const loading = document.querySelectorAll('.loading');
let pokemonSeleccionado1 = null;
let pokemonSeleccionado2 = null;

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
        filtrarPokemon(searchTerm, buscador, listaPokemon, divComparador, indice);
    });
});

document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('allPokemons')) {
        worker.postMessage({ tipo: 'cargarTodos' });
    }

    // Cargar Pokémon para comparar desde detalles
    const pokemonComparar = localStorage.getItem('pokemonParaComparar');
    if (pokemonComparar) {
        const { poke, indice } = JSON.parse(pokemonComparar);
        mostrarPokemonAComparar(poke, divsComparadores[indice], indice);
        // Limpiar localStorage para evitar conflictos futuros
        localStorage.removeItem('pokemonParaComparar');
    }
});

worker.onmessage = function (event) {
    const pokemones = event.data;
    localStorage.setItem('allPokemons', JSON.stringify(pokemones));
    pokemons = pokemones;

    loading.forEach(indicador => {
        indicador.style.display = 'none';
    });
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

function filtrarPokemon(searchTerm, buscador, listaPokemon, divComparador, indice) {
    const pokemones = JSON.parse(localStorage.getItem('allPokemons'));
    listaPokemon.innerHTML = '';
    
    const filteredPokemones = isNaN(searchTerm) 
        ? pokemones.filter(poke => poke.name.toLowerCase().includes(searchTerm.toLowerCase()))
        : pokemones.filter(poke => poke.id === parseInt(searchTerm));
    
    currentPage = 1; // Reset to the first page when filtering
    renderFilteredPage(filteredPokemones, currentPage, buscador, listaPokemon, divComparador, indice);
}

function renderFilteredPage(filteredPokemones, page, buscador, listaPokemon, divComparador, indice) {
    const start = (page - 1) * pokemonsPerPage;
    const end = start + pokemonsPerPage;
    const paginatedPokemons = filteredPokemones.slice(start, end);
    mostrarPokemon(paginatedPokemons, buscador, listaPokemon, divComparador, indice);
}

function mostrarPokemon(pokemons, buscador, listaPokemon, divComparador, indice) {
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
            mostrarPokemonAComparar(poke, divComparador, indice)
            listaPokemon.innerHTML='';
            buscador.value='';
        });

        listaPokemon.appendChild(div);
    });
}

function mostrarPokemonAComparar(poke, divComparador, indice) {
    let tipos = poke.types.map(type => `<p class="${type} tipo">${type}</p>`).join('');
    let stats = poke.stats.map(stat => {
        const statsEsp = statsTraducidas[stat.stat.name] || stat.stat.name;
        return `<p class="stat" data-stat="${stat.stat.name}">${statsEsp}: ${stat.base_stat}</p>`;
    }).join('');
    let totalStats = 0;
    poke.stats.forEach(stat => {
        totalStats += stat.base_stat;
    });

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
                    <p class="stat">Base Total Estadisticas: ${totalStats}</p>
                </div>
            </div>
        </div>
    `;

    if(indice === 0){
        pokemonSeleccionado1 = poke;
    }else{
        pokemonSeleccionado2 = poke;
    }

    if(pokemonSeleccionado1 && pokemonSeleccionado2){
        compararPokemons();
    }
}

function compararPokemons() {

    const stats1 = pokemonSeleccionado1.stats;
    const stats2 = pokemonSeleccionado2.stats;

    const div1 = divsComparadores[0].querySelector('.pokemon-stats');
    const div2 = divsComparadores[1].querySelector('.pokemon-stats');

    // Comparar cada estadística
    stats1.forEach((stat1, index) => {
        const stat2 = stats2[index];

        const statElement1 = div1.querySelector(`[data-stat="${stat1.stat.name}"]`);
        const statElement2 = div2.querySelector(`[data-stat="${stat2.stat.name}"]`);

        if (stat1.base_stat > stat2.base_stat) {
            statElement1.style.color = 'green';
            statElement2.style.color = 'red';
        } else if (stat1.base_stat < stat2.base_stat) {
            statElement1.style.color = 'red';
            statElement2.style.color = 'green';
        } else {
            statElement1.style.color = 'gray';
            statElement2.style.color = 'gray';
        }
    });

    // Comparar la suma total de estadísticas
    const total1 = stats1.reduce((total, stat) => total + stat.base_stat, 0);
    const total2 = stats2.reduce((total, stat) => total + stat.base_stat, 0);

    const comparador1 = divsComparadores[0].querySelector('.pokemon-seleccionado');
    const comparador2 = divsComparadores[1].querySelector('.pokemon-seleccionado');

    if (total1 > total2) {
        comparador1.style.backgroundColor = 'lightgreen';
        comparador2.style.backgroundColor = 'lightcoral';
    } else if (total1 < total2) {
        comparador1.style.backgroundColor = 'lightcoral';
        comparador2.style.backgroundColor = 'lightgreen';
    } else {
        comparador1.style.backgroundColor = 'gray';
        comparador2.style.backgroundColor = 'gray';
        }
}




// Call iniciar to start the process
iniciar();