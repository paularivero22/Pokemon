const pokemonDetailDiv = document.querySelector('#detallesPokemon');

const urlParams = new URLSearchParams(window.location.search);
const pokemonId = urlParams.get('id');
getPokemonData(pokemonId);

function getPokemonData(pokemonId) {
    const URL = `https://pokeapi.co/api/v2/pokemon/${pokemonId}`;
    fetch(URL)
        .then(response => response.json())
        .then(poke => {
            getPokemonDescription(pokemonId, poke);
        })
        .catch(error => console.error('Error al cargar los datos del Pokémon:', error));
}

function getPokemonDescription(pokemonId, poke) {
    const speciesURL = `https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`;
    fetch(speciesURL)
        .then(response => response.json())
        .then(speciesData => {
            const flavorTextEntry = speciesData.flavor_text_entries.find(
                (entry) => entry.language.name === "es"
            );

            const description = flavorTextEntry ? flavorTextEntry.flavor_text.replace(/\n/g, " ") : "No hay descripción disponible.";

            mostrarDetalle(poke, description);
        })
        .catch(error => console.error('Error al obtener la descripción del Pokémon:', error));
}

function mostrarDetalle(poke, description) {
    const pokeId = poke.id.toString().padStart(3, '0');
    let tipos = poke.types.map(type => `<p class="${type.type.name} tipo">${type.type.name}</p>`).join('');
    let stats = poke.stats.map(stat => `<p class="stat">${stat.stat.name}: ${stat.base_stat}</p>`).join('');

    const height = (poke.height / 10).toFixed(1); 
    const weight = (poke.weight / 10).toFixed(1);  
    const ability = poke.abilities.map(ability => ability.ability.name).join(", ");
    
    const speciesURL = poke.species.url;
    fetch(speciesURL)
        .then(response => response.json())
        .then(speciesData => {
            let genderHTML = "";
            //no funciona bien extraer el genero
            const genderRate = speciesData.gender_rate; 
            console.log('gender_rate:', genderRate);

            if (genderRate === -1) {
                genderHTML = "Desconocido";
            } else if (genderRate === 1) {
                genderHTML = `<img src="../img/macho.png" alt="Macho">`;
            } else if (genderRate === 2) {
                genderHTML = `<img src="../img/hembra.png" alt="Hembra">`;
            } else if (genderRate === 0) {
                genderHTML = `<img src="../img/macho.png" alt="Macho"><img src="../img/hembra.png" alt="Hembra">`;
            } else {
                genderHTML = "Desconocido"; 
            }

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

                        <h3>Descripción</h3>
                        <div class="pokemon-descripcion">
                            <p>${description}</p>
                        </div>

                        <div class="pokemon-caracteristicas">
                            <p><span>Altura:</span> ${height} m</p>
                            <p><span>Peso:</span> ${weight} kg</p>
                            <p><span>Habilidad:</span> ${ability}</p>
                            <div class="genero">
                                <p class="sexo"><span>Sexo:</span></p>
                                <div class="genero-img">
                                    <p class="sexo"> ${genderHTML}</p>
                                </div>
                            </div>
                        </div>

                        <h3>Tipo</h3>
                        <div class="pokemon-tipos">
                            ${tipos}
                            <br>
                        </div>

                        <h3>Estadísticas</h3>
                        <div class="pokemon-stats">
                            ${stats}
                            <br>
                        </div>
                    </div>
                    <div class="sprites">
                        <div class="pokemon-sprites">
                            <img src="${poke.sprites.front_default}" alt="${poke.name}">
                            <img src="${poke.sprites.back_default}" alt="${poke.name}">
                        </div>
                        <div class="pokemon-sprites-shiny">
                            <img src="${poke.sprites.front_shiny}" alt="${poke.name}">
                            <img src="${poke.sprites.back_shiny}" alt="${poke.name}">
                        </div>
                    </div>
                </div>
            `;
        })
}