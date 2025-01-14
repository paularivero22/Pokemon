const listaPokemon = document.querySelector('#listaPokemon'); // Seleccionamos el div donde se van a mostrar los pokemons
const botonesTipo = document.querySelectorAll('.btn-tipo'); // Seleccionamos los botones del header
const botonesGen = document.querySelectorAll('.btn-gen'); // Seleccionamos los botones de generación
const buscador = document.querySelector('#barraBusqueda');
const loadingIndicator = document.querySelector('#loading');
const worker = new Worker('js/worker.js');
let pokemons = []; // Array para almacenar los datos de los pokemons
let currentPage = 1;
const pokemonsPerPage = 30;

buscador.addEventListener('input', (event) => {
    const searchTerm = event.target.value.toLowerCase();
    filtrarPokemon(searchTerm);
});

document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('allPokemons')) {
        worker.postMessage({ tipo: 'cargarTodos' });
    } else {
        renderPage(1);
    }
});

worker.onmessage = function (event) {
    const pokemones = event.data;
    localStorage.setItem('allPokemons', JSON.stringify(pokemones));
    pokemons = pokemones;
    renderPage(currentPage);
    loadingIndicator.style.display = 'none';
};

function iniciar() {
    const cachedPokemones = localStorage.getItem('allPokemons');
    if (cachedPokemones) {
        const pokemones = JSON.parse(cachedPokemones);
        pokemons = pokemones;
        renderPage(currentPage);
        loadingIndicator.style.display = 'none';
    } else {
        worker.postMessage('loadPokemons');
        loadingIndicator.style.display = 'block';
    }

    botonesTipo.forEach(boton => {
        boton.addEventListener('click', (event) => {
            filtrarPorTipo(event.target.id)
        });
    });

    botonesGen.forEach(boton => {
        boton.addEventListener('click', (event) => {
            filtrarPorGeneracion(event.target.id);
        });
    });
}

function mostrarPokemon(pokemons) {
    listaPokemon.innerHTML = ''; // Clear previous content
    pokemons.forEach(poke => {
        let tipos = poke.types.map(type => `<p class="${type} tipo">${type}</p>`).join('');

        let pokeId = poke.id.toString().padStart(3, '0'); // Asegura que el ID tenga 3 dígitos

        const div = document.createElement("div");
        div.classList.add("pokemon");

        div.innerHTML = `
            <p class="pokemon-id-back">#${pokeId}</p>
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
            window.location.href = `./detalle.html?id=${poke.id}`;
        });

        listaPokemon.appendChild(div);
    });
}

function renderPage(page) {
    const start = (page - 1) * pokemonsPerPage;
    const end = start + pokemonsPerPage;
    const paginatedPokemons = pokemons.slice(start, end);
    mostrarPokemon(paginatedPokemons);
    renderPagination();
}

function renderPagination() {
    const totalPages = Math.ceil(pokemons.length / pokemonsPerPage);
    const paginationContainer = document.querySelector('#pagination');
    paginationContainer.innerHTML = '';

    const prevButton = document.createElement('button');
    prevButton.textContent = '❮';
    prevButton.classList.add('pagination-arrow');
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderPage(currentPage);
        }
    });
    paginationContainer.appendChild(prevButton);

    const nextButton = document.createElement('button');
    nextButton.textContent = '❯';
    nextButton.classList.add('pagination-arrow');
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderPage(currentPage);
        }
    });
    paginationContainer.appendChild(nextButton);
}

function filtrarPokemon(searchTerm) {
    const pokemones = JSON.parse(localStorage.getItem('allPokemons'));
    listaPokemon.innerHTML = '';
    
    if (searchTerm === '') {
        renderPage(1);
        return;
    }

    const filteredPokemones = isNaN(searchTerm) 
        ? pokemones.filter(poke => poke.name.toLowerCase().includes(searchTerm.toLowerCase()))
        : pokemones.filter(poke => poke.id === parseInt(searchTerm));
    
    currentPage = 1; // Reset to the first page when filtering
    renderFilteredPage(filteredPokemones, currentPage);
}

function filtrarPorGeneracion(generacionId) {
    const pokemones = JSON.parse(localStorage.getItem('allPokemons'));
    listaPokemon.innerHTML = '';

    const GENERACIONES = {
        gen1: [1, 151],
        gen2: [152, 251],
        gen3: [252, 386],
        gen4: [387, 493],
        gen5: [494, 649],
        gen6: [650, 721],
        gen7: [722, 809],
        gen8: [810, 898],
        gen9: [899, 1025]
    };

    const [inicio, fin] = GENERACIONES[generacionId];
    const filteredPokemones = pokemones.filter(poke => poke.id >= inicio && poke.id <= fin);

    currentPage = 1; // Reset to the first page when filtering
    renderFilteredPage(filteredPokemones, currentPage);
}

function filtrarPorTipo(tipo) {
    const pokemones = JSON.parse(localStorage.getItem('allPokemons'));
    listaPokemon.innerHTML = '';
    
    if (tipo === 'ver-todos') {
        renderPage(1);
        return;
    }
    console.log(pokemones);
    const filteredPokemones = pokemones.filter(poke => poke.types.includes(tipo));
    
    currentPage = 1; // Reset to the first page when filtering
    renderFilteredPage(filteredPokemones, currentPage);
}

function renderFilteredPage(filteredPokemones, page) {
    const start = (page - 1) * pokemonsPerPage;
    const end = start + pokemonsPerPage;
    const paginatedPokemons = filteredPokemones.slice(start, end);
    mostrarPokemon(paginatedPokemons);
    renderFilteredPagination(filteredPokemones);
}

function renderFilteredPagination(filteredPokemones) {
    const totalPages = Math.ceil(filteredPokemones.length / pokemonsPerPage);
    const paginationContainer = document.querySelector('#pagination');
    paginationContainer.innerHTML = '';

    const prevButton = document.createElement('button');
    prevButton.textContent = '←';
    prevButton.classList.add('pagination-arrow');
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderFilteredPage(filteredPokemones, currentPage);
        }
    });
    paginationContainer.appendChild(prevButton);

    const nextButton = document.createElement('button');
    nextButton.textContent = '→';
    nextButton.classList.add('pagination-arrow');
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderFilteredPage(filteredPokemones, currentPage);
        }
    });
    paginationContainer.appendChild(nextButton);
}

// Call iniciar to start the process
iniciar();