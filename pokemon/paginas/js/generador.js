const buscarInput = document.querySelector('#addPokemon'); // Campo de búsqueda
const equipoDiv = document.querySelector('#equipo'); // Div donde se muestra el equipo actual
const divResultados = document.querySelector('.resultados-buscador'); // Div para mostrar resultados
let listaSugerencias = null; // Variable para la lista de sugerencias
const pokemons = []; // Array global de Pokémon cargados

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
    // Crear lista de sugerencias si no existe
    if (!listaSugerencias) {
        listaSugerencias = document.createElement('ul');
        listaSugerencias.classList.add('lista-sugerencias');
        divResultados.appendChild(listaSugerencias); // Agregar dentro del div resultados
    }

    // Filtrar Pokémon según el término de búsqueda
    const sugerencias = pokemons.filter(pokemon =>
        pokemon.name.toLowerCase().includes(termino.toLowerCase())
    );

    // Limpiar la lista de sugerencias
    listaSugerencias.innerHTML = '';

    // Agregar sugerencias nuevas
    if (sugerencias.length > 0) {
        sugerencias.slice(0, 10).forEach(pokemon => {
            const item = document.createElement('li');
            item.textContent = pokemon.name;
            item.classList.add('sugerencia-item');

            // Agregar al equipo al hacer clic
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
