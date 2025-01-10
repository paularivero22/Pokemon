const pokemonDetailDiv = document.querySelector('#detallesPokemon');

const urlParams = new URLSearchParams(window.location.search);
const pokemonId = urlParams.get('id');
getPokemonData(pokemonId);

function getPokemonData(pokemonId) {
    const URL = `https://pokeapi.co/api/v2/pokemon/${pokemonId}`;
    fetch(URL)
        .then(response => response.json())
        .then(poke => {
            mostrarDetalle(poke);
        })
        .catch(error => console.error('Error al cargar los datos del Pokémon:', error));
}

function mostrarDetalle(poke) {
    const pokeId = poke.id.toString().padStart(3, '0');
    let tipos = poke.types.map(type => `<p class="${type.type.name} tipo">${type.type.name}</p>`).join('');
    let stats = poke.stats.map(stat => `<p class="stat">${stat.stat.name}: ${stat.base_stat}</p>`).join('');

    pokemonDetailDiv.innerHTML = `
        <div class="pokemon">
            <div>
                <div class="pokemon-imagen">
                    <img src="${poke.sprites.other["official-artwork"].front_default}" alt="${poke.name}">
                </div>
            </div>
            <div class="pokemon-info">
                <div class="nombre-contenedor">
                    <p class="pokemon-id">#${pokeId}</p>
                    <h2 class="pokemon-nombre">${poke.name}</h2>
                    <br>
                </div>
                <div class="pokemon-tipos">
                    <p>Tipo</p>
                    ${tipos}
                    <br>
                </div>
                <div class="pokemon-debilidades">
                    <p>Debilidad</p>
                    <p>.....</p>
                    <br>
                </div>
                <div class="pokemon-fortalezas">
                    <p>Fuerte contra</p>
                    <p>.....</p>
                    <br>
                </div>
                <div class="pokemon-stats">
                    <p>Estadísticas</p>
                    ${stats}
                    <br>
                </div>
            </div>
        </div>
    `;
}