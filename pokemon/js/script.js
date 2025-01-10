const listaPokemon = document.querySelector('#listaPokemon'); // Seleccionamos el div donde se van a mostrar los pokemons
const botonesTipo = document.querySelectorAll('.btn-tipo'); // Seleccionamos los botones del header
const botonesGen = document.querySelectorAll('.btn-gen');
let URL = 'https://pokeapi.co/api/v2/pokemon/'; // URL base de la API
let pokemons = []; // Array para almacenar los datos de los pokemons

for (let i = 1; i <= 1025; i++) { // Hacemos un loop para traer los primeros 1025 pokemons
    fetch(URL + i) // Hacemos un fetch a la URL de la API con el número del pokemon más el número del loop
        .then(response => response.json()) // Convertimos la respuesta a JSON
        .then(poke => {
            pokemons.push(poke); // Almacenamos los datos del pokemon en el array
            if (pokemons.length === 1025) { // Verificamos si ya tenemos todos los pokemons
                pokemons.sort((a, b) => a.id - b.id); // Ordenamos los pokemons por su ID
                pokemons.forEach(poke => mostrarPokemon(poke)); // Mostramos los pokemons en el HTML
            }
        });
}

function mostrarPokemon(poke) {
    let tipos = poke.types.map(type => `<p class="${type.type.name} tipo">${type.type.name}</p>`).join('');
    
    let pokeId = poke.id.toString().padStart(3, '0'); // Asegura que el ID tenga 3 dígitos
    let stats = poke.stats.map(stat => `<p class="stat">${stat.stat.name}: ${stat.base_stat}</p>`).join('');

    const div = document.createElement("div");
    div.classList.add("pokemon");

    div.innerHTML = `
        <p class="pokemon-id-back">#${pokeId}</p>
        <div class="pokemon-imagen">
            <img src="${poke.sprites.other["official-artwork"].front_default}" alt="${poke.name}">
        </div>
        <div class="pokemon-info">
            <div class="nombre-contenedor">
                <p class="pokemon-id">#${pokeId}</p>
                <h2 class="pokemon-nombre">${poke.name}</h2>
            </div>
            <div class="pokemon-tipos">
                ${tipos}
            </div>
            <div class="pokemon-stats">
                ${stats}
            </div>
        </div>
    `;

    // Evento para redirigir a la página de detalles del Pokémon
    div.addEventListener('click', () => {
        window.location.href = `./paginas/detalle.html?id=${poke.id}`;
    });

    // Añadir el Pokémon a la lista
    listaPokemon.append(div);
}

const barraBusqueda = document.querySelector('#barraBusqueda'); 
const botonBuscar = document.querySelector('#botonBuscar'); 

botonBuscar.addEventListener('click', () => {
    const searchTerm = barraBusqueda.value.toLowerCase();
    listaPokemon.innerHTML = ''; 

    const pokemonsFiltrados = pokemons.filter(poke => poke.name.toLowerCase().includes(searchTerm));

    if (pokemonsFiltrados.length > 0) {
        pokemonsFiltrados.forEach(poke => mostrarPokemon(poke));
    } else {
        listaPokemon.innerHTML = '<p>No se encontraron Pokémon con ese nombre.</p>';
    }
});

//filtrar por generación.
const generations = {
    gen1: [0, 151],
    gen2: [151, 251],
    gen3: [251, 386],
    gen4: [386, 494],
    gen5: [494, 649],
    gen6: [649, 721],
    gen7: [721, 809],
    gen8: [809, 905],
    gen9: [905, 1025]
};

botonesGen.forEach(button => {
    button.addEventListener('click', () => {
        const genId = button.id;
        const [start, end] = generations[genId];
        const filteredPokemon = pokemons.slice(start, end);
        displayPokemon(filteredPokemon);
    });
});

function displayPokemon(pokemon) {
    listaPokemon.innerHTML = '';
    pokemon.forEach(poke => {
        mostrarPokemon(poke);
    });
}

botonesTipo.forEach(boton => boton.addEventListener('click', (event) => {
    const botonId = event.currentTarget.id;

    listaPokemon.innerHTML = '';

    if (botonId === 'ver-todos') {
        pokemons.forEach(poke => mostrarPokemon(poke));
    } else {
        const pokemonsFiltrados = pokemons.filter(poke => poke.types.some(type => type.type.name.includes(botonId)));
        pokemonsFiltrados.forEach(poke => mostrarPokemon(poke));
    }
}));