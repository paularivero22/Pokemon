const pokemonDetailDiv = document.querySelector('#detallesPokemon');
const urlParams = new URLSearchParams(window.location.search);
const pokemonId = parseInt(urlParams.get('id')); // Obtener el ID del Pokémon

const statsTraducidas = {
    "hp": "Puntos de Salud",
    "attack": "Ataque",
    "defense": "Defensa",
    "special-attack": "Ataque Especial",
    "special-defense": "Defensa Especial",
    "speed": "Velocidad"
};

// Función principal para cargar el detalle del Pokémon
function cargarDetallePokemon(pokemonId) {
    const pokemones = JSON.parse(localStorage.getItem('allPokemons'));

    if (!pokemones || pokemones.length === 0) {
        console.error('No se encontraron datos en localStorage.');
        pokemonDetailDiv.innerHTML = `<p>Error: No se encontraron datos del Pokémon.</p>`;
        return;
    }

    const poke = pokemones.find(pokemon => pokemon.id === pokemonId);

    if (!poke) {
        console.error(`Pokémon con ID ${pokemonId} no encontrado.`);
        pokemonDetailDiv.innerHTML = `<p>Error: Pokémon no encontrado.</p>`;
        return;
    }

    obtenerEfectividades(poke.types);
    mostrarDetalle(poke);
}

// Obtener efectividades del Pokémon
function obtenerEfectividades(tipos) {
    const promesasTipos = tipos.map(tipo =>
        fetch(`https://pokeapi.co/api/v2/type/${tipo}`).then(response => response.json())
    );

    Promise.all(promesasTipos).then(datosTipos => {
        const efectividades = {
            doble_dano: [],
            mitad_dano: [],
            sin_dano: [],
            inflige_doble_dano: [],
            inflige_mitad_dano: [],
            inflige_sin_dano: []
        };

        datosTipos.forEach(data => {
            // Daños recibidos
            data.damage_relations.double_damage_from.forEach(tipo => efectividades.doble_dano.push(tipo.name));
            data.damage_relations.half_damage_from.forEach(tipo => efectividades.mitad_dano.push(tipo.name));
            data.damage_relations.no_damage_from.forEach(tipo => efectividades.sin_dano.push(tipo.name));
            
            // Daños infligidos
            data.damage_relations.double_damage_to.forEach(tipo => efectividades.inflige_doble_dano.push(tipo.name));
            data.damage_relations.half_damage_to.forEach(tipo => efectividades.inflige_mitad_dano.push(tipo.name));
            data.damage_relations.no_damage_to.forEach(tipo => efectividades.inflige_sin_dano.push(tipo.name));
        });

        // Eliminar duplicados
        for (const key in efectividades) {
            efectividades[key] = [...new Set(efectividades[key])];
        }

        generarTablaEfectividades(efectividades);
    }).catch(error => console.error('Error al obtener las efectividades:', error));
}

// Generar tabla de efectividades
function generarTablaEfectividades(efectividades) {
    const crearTiposHTML = tipos => tipos.map(tipo => `<p class="${tipo} tipo">${tipo}</p>`).join('');

    const tablaHTML = `
        <div class="pokemon-efectividades">
            <h3>Tabla de Efectividades</h3>
            <table>
                <thead>
                    <tr>
                        <th>Recibe Doble Daño</th>
                        <th>Recibe Mitad de Daño</th>
                        <th>No Recibe Daño</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${crearTiposHTML(efectividades.doble_dano) || 'Ninguno'}</td>
                        <td>${crearTiposHTML(efectividades.mitad_dano) || 'Ninguno'}</td>
                        <td>${crearTiposHTML(efectividades.sin_dano) || 'Ninguno'}</td>
                    </tr>
                </tbody>
            </table>
            <table>
                <thead>
                    <tr>
                        <th>Inflige Doble Daño</th>
                        <th>Inflige Mitad de Daño</th>
                        <th>No Inflige Daño</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${crearTiposHTML(efectividades.inflige_doble_dano) || 'Ninguno'}</td>
                        <td>${crearTiposHTML(efectividades.inflige_mitad_dano) || 'Ninguno'}</td>
                        <td>${crearTiposHTML(efectividades.inflige_sin_dano) || 'Ninguno'}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;

    document.querySelector('.tabla-efect').innerHTML = tablaHTML;
}

// Mostrar los detalles del Pokémon en el DOM
function mostrarDetalle(poke) {

    const pokeId = poke.id.toString().padStart(3, '0');
    const tiposHTML = poke.types.map(type => `<p class="${type} tipo">${type}</p>`).join('');
    const stats = poke.stats.map(stat => {
        const statsEsp = statsTraducidas[stat.stat.name] || stat.stat.name;
        return `<p class="stat"><b>${statsEsp}:</b> ${stat.base_stat}</p>`;
    }).join('');
    const height = (poke.height / 10).toFixed(1);
    const weight = (poke.weight / 10).toFixed(1);
    const abilities = poke.ability.map(ability => ability).join(", ") || "No disponible";

    let genderHTML = "";
    const genderRate = poke.gender;

    if (genderRate === -1) {
        genderHTML = "Desconocido";
    } else if (genderRate === 0) {
        genderHTML = `<img src="./img/macho.png" alt="Macho">`;
    } else if (genderRate === 8) {
        genderHTML = `<img src="./img/hembra.png" alt="Hembra">`;
    } else {
        genderHTML = `<img src="./img/macho.png" alt="Macho"><img src="./img/hembra.png" alt="Hembra">`;
    }

    const otherImagesHTML = Object.values(poke.otherImages)
        .filter(url => url !== null) // Filtrar las URLs que no sean null
        .map(url => `<img src="${url}" alt="Imagen adicional de ${poke.name}" class="other-image">`) // Crear elementos img
        .join('');

    pokemonDetailDiv.innerHTML = `
        <div class="pokemon">
            <div class="imagenes">
                <img class="pokemon-imagen" src="${poke.image}" alt="${poke.name}">
                <div class="sprites">
                    <div class="pokemon-sprites">
                        <img src="${poke.otherImages.front_default}" alt="${poke.name}">
                    </div>
                    <div class="pokemon-sprites-shiny">
                        <img src="${poke.otherImages.front_shiny}" alt="${poke.name}">
                    </div>
            </div>
            </div>
            <div class="pokemon-info">
                <div class="nombre-contenedor">
                    <p class="pokemon-id">#${pokeId}</p>
                    <h2 class="pokemon-nombre">${poke.name.toUpperCase()}</h2>
                    <br>
                </div>

                <h3>Descripción</h3>
                <div class="pokemon-descripcion">
                    <p>${poke.description}</p>
                </div>

                <div class="pokemon-caracteristicas">
                    <p><span>Altura:</span> ${height} m</p>
                    <p><span>Peso:</span> ${weight} kg</p>
                    <p><span>Habilidad:</span> ${abilities}</p>
                    <div class="genero">
                        <p class="sexo"><span>Sexo:</span></p>
                        <div class="genero-img">
                            <p class="sexo"> ${genderHTML}</p>
                        </div>
                    </div>
                </div>

                <h3>Tipo</h3>
                <div class="pokemon-tipos">
                    ${tiposHTML}
                    <br>
                </div>

                <h3>Estadísticas</h3>
                <div class="pokemon-stats">
                    ${stats}
                    <br>
                </div>

                <div class="tabla-efect">

                </div>
            </div>
        </div>
    `;
}

// Navegación entre Pokémon
document.querySelector('.btn-volver').addEventListener('click', () => {
    window.location.href = 'index.html';
});

document.querySelector('.btn-siguiente').addEventListener('click', () => {
    if (pokemonId < 1025) {
        window.location.href = './detalle.html?id=' + (pokemonId + 1);
    } else {
        window.location.href = './detalle.html?id=1';
    }
});

document.querySelector('.btn-anterior').addEventListener('click', () => {
    if (pokemonId > 1) {
        window.location.href = './detalle.html?id=' + (pokemonId - 1);
    } else {
        window.location.href = './detalle.html?id=1025';
    }
});

// Comparar Pokémon
document.querySelector('.btn-comparar').addEventListener('click', () => {
    const pokemones = JSON.parse(localStorage.getItem('allPokemons'));
    const poke = pokemones.find(pokemon => pokemon.id === pokemonId);

    if (poke) {
        // Guarda el Pokémon seleccionado en localStorage
        localStorage.setItem('pokemonParaComparar', JSON.stringify({ poke, indice: 0 }));
        // Redirige al comparador
        window.location.href = './comparador.html';
    } else {
        console.error('Error: Pokémon no encontrado para comparar.');
    }
});


// Iniciar carga del detalle
cargarDetallePokemon(pokemonId);