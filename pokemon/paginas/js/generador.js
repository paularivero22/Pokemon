const buscarInput = document.querySelector('#addPokemon'); // Campo de búsqueda
const equipoDiv = document.querySelector('#equipo'); // Div donde se muestra el equipo actual
const divResultados = document.querySelector('.resultados-buscador'); // Div para mostrar resultados
const listaEquiposDiv = document.querySelector('#lista-equipos'); // Div para equipos guardados
let listaSugerencias = null; // Variable para la lista de sugerencias
const pokemons = []; // Array global de Pokémon cargados
let equiposGuardados = []; // Lista de equipos guardados

// Función para cargar los Pokémon desde la API
async function cargarPokemons() {
    const limite = 1025; // Máximo número de Pokémon en la API
    for (let i = 1; i <= limite; i++) {
        const URL = `https://pokeapi.co/api/v2/pokemon/${i}`;
        const respuesta = await fetch(URL);
        const pokemon = await respuesta.json();
        pokemons.push(pokemon);
    }
    pokemons.sort((a, b) => a.id - b.id); // Ordenar por ID
    console.log('Pokémon cargados:', pokemons.length);
}
cargarPokemons();

// Función para mostrar los resultados de búsqueda
function mostrarSugerencias(termino) {
    if (!listaSugerencias) {
        listaSugerencias = document.createElement('ul');
        listaSugerencias.classList.add('lista-sugerencias');
        divResultados.appendChild(listaSugerencias); // Agregar dentro del div resultados
    }

    const sugerencias = pokemons.filter(pokemon =>
        pokemon.name.toLowerCase().includes(termino.toLowerCase())
    );

    listaSugerencias.innerHTML = '';

    if (sugerencias.length > 0) {
        sugerencias.slice(0, 10).forEach(pokemon => {
            const item = document.createElement('li');
            item.textContent = pokemon.name;
            item.classList.add('sugerencia-item');

            item.addEventListener('click', () => {
                añadirAlEquipo(pokemon);
                listaSugerencias.innerHTML = '';
                buscarInput.value = '';
            });

            listaSugerencias.appendChild(item);
        });
    } else {
        listaSugerencias.innerHTML = '<li class="sin-resultados">Sin resultados</li>';
    }
}

function generarEquipo() {
    equipoDiv.innerHTML = '';

    if (pokemons.length === 0) {
        alert('Los Pokémon aún no se han cargado. Por favor, espera.');
        return;
    }

    const equipoAleatorio = new Set();

    while (equipoAleatorio.size < 6) {
        const indiceAleatorio = Math.floor(Math.random() * pokemons.length);
        equipoAleatorio.add(pokemons[indiceAleatorio]);
    }

    equipoAleatorio.forEach(pokemon => añadirAlEquipo(pokemon));
}

const botonGenerar = document.querySelector('#generar-equipo');
botonGenerar.addEventListener('click', generarEquipo);

function añadirAlEquipo(pokemon) {
    const equipoActual = equipoDiv.querySelectorAll('.pokemon-equipo');
    if (equipoActual.length >= 6) {
        alert('El equipo no puede tener más de 6 Pokémon');
        return;
    }

    const divPokemon = document.createElement('div');
    divPokemon.classList.add('pokemon-equipo');

    const imagen = document.createElement('img');
    imagen.src = pokemon.sprites.front_default;
    imagen.alt = pokemon.name;

    const nombre = document.createElement('p');
    nombre.textContent = `${pokemon.name} (#${pokemon.id})`;
    nombre.classList.add('pokemon-nombre');

    const botonEliminar = document.createElement('button');
    botonEliminar.textContent = 'Eliminar';
    botonEliminar.classList.add('eliminar-pokemon');
    botonEliminar.addEventListener('click', () => {
        divPokemon.remove();
    });

    divPokemon.appendChild(imagen);
    divPokemon.appendChild(nombre);
    divPokemon.appendChild(botonEliminar);

    equipoDiv.appendChild(divPokemon);
}

// Función para guardar el equipo actual
function guardarEquipo() {
    const equipoActual = equipoDiv.querySelectorAll('.pokemon-equipo');

    if (equipoActual.length === 0) {
        alert('No hay Pokémon en el equipo para guardar.');
        return;
    }

    const equipo = Array.from(equipoActual).map(pokemonDiv => {
        const nombre = pokemonDiv.querySelector('.pokemon-nombre').textContent;
        const imagenSrc = pokemonDiv.querySelector('img').src;
        return { nombre, imagenSrc };
    });

    const nombreEquipo = document.querySelector('#nombre-equipo').value.trim();
    if (!nombreEquipo) {
        alert('Por favor, ingresa un nombre para el equipo.');
        return;
    }

    equiposGuardados.push({ nombre: nombreEquipo, equipo });

    localStorage.setItem('equiposGuardados', JSON.stringify(equiposGuardados));

    mostrarEquiposGuardados();

    equipoDiv.innerHTML = '';
    document.querySelector('#nombre-equipo').value = '';
    alert(`Equipo "${nombreEquipo}" guardado con éxito.`);
}

// Función para mostrar los equipos guardados
function mostrarEquiposGuardados() {
    listaEquiposDiv.innerHTML = '';

    const equipos = JSON.parse(localStorage.getItem('equiposGuardados')) || [];

    equipos.forEach((equipoGuardado, index) => {
        const equipoDiv = document.createElement('div');
        equipoDiv.classList.add('equipo-guardado');

        const titulo = document.createElement('h3');
        titulo.textContent = equipoGuardado.nombre;
        equipoDiv.appendChild(titulo);

        const pokemonsDiv = document.createElement('div');
        pokemonsDiv.classList.add('equipo-pokemons');
        equipoGuardado.equipo.forEach(pokemon => {
            const pokemonDiv = document.createElement('div');
            pokemonDiv.classList.add('pokemon-guardado');

            const imagen = document.createElement('img');
            imagen.src = pokemon.imagenSrc;
            imagen.alt = pokemon.nombre;

            const nombre = document.createElement('p');
            nombre.textContent = pokemon.nombre;

            pokemonDiv.appendChild(imagen);
            pokemonDiv.appendChild(nombre);
            pokemonsDiv.appendChild(pokemonDiv);
        });

        const eliminarBtn = document.createElement('button');
        eliminarBtn.textContent = 'Eliminar';
        eliminarBtn.classList.add('eliminar-equipo');
        eliminarBtn.addEventListener('click', () => eliminarEquipo(index));

        equipoDiv.appendChild(pokemonsDiv);
        equipoDiv.appendChild(eliminarBtn);
        listaEquiposDiv.appendChild(equipoDiv);
    });
}

// Función para eliminar un equipo guardado
function eliminarEquipo(index) {
    equiposGuardados.splice(index, 1);
    localStorage.setItem('equiposGuardados', JSON.stringify(equiposGuardados));
    mostrarEquiposGuardados();
}

const botonGuardar = document.querySelector('#guardar-equipo');
botonGuardar.addEventListener('click', guardarEquipo);

document.addEventListener('DOMContentLoaded', () => {
    equiposGuardados = JSON.parse(localStorage.getItem('equiposGuardados')) || [];
    mostrarEquiposGuardados();
});

// Evento al escribir en el buscador
buscarInput.addEventListener('input', (e) => {
    const termino = e.target.value.trim();
    if (termino.length > 0) {
        mostrarSugerencias(termino);
    } else if (listaSugerencias) {
        listaSugerencias.innerHTML = '';
    }
});

// Evento para cerrar la lista de sugerencias al hacer clic fuera
document.addEventListener('click', (e) => {
    if (listaSugerencias && !buscarInput.contains(e.target) && !divResultados.contains(e.target)) {
        listaSugerencias.innerHTML = '';
    }
});
