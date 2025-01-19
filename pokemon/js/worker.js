const URL = "https://pokeapi.co/api/v2/pokemon/";

async function fetchPokemon(id) {
    const response = await fetch(URL + id);
    if (!response.ok) throw new Error(`Pokémon con ID ${id} no encontrado.`);
    const data = await response.json();

    return {
        id: data.id,
        name: data.name,
        image: data.sprites.other["official-artwork"].front_default,
        types: data.types.map(type => type.type.name),
        height: data.height,
        weight: data.weight,
        stats: {
            hp: data.stats.find(stat => stat.stat.name === "hp")?.base_stat || 0, // Vida
            attack: data.stats.find(stat => stat.stat.name === "attack")?.base_stat || 0, // Ataque
            defense: data.stats.find(stat => stat.stat.name === "defense")?.base_stat || 0, // Defensa
            speed: data.stats.find(stat => stat.stat.name === "speed")?.base_stat || 0 // Velocidad
        }
    };
}

// Función que carga todos los Pokémon de ambos equipos
async function cargarEquipos(idsEquipo1, idsEquipo2) {
    const equipo1Promesas = idsEquipo1.map(id => fetchPokemon(id));
    const equipo2Promesas = idsEquipo2.map(id => fetchPokemon(id));

    try {
        const equipo1 = await Promise.all(equipo1Promesas);
        const equipo2 = await Promise.all(equipo2Promesas);

        postMessage([equipo1, equipo2]);  // Enviar los dos equipos al hilo principal
    } catch (error) {
        postMessage({ error: error.message });  // Enviar el error al hilo principal
    }
}

self.onmessage = async function (event) {
    const { tipo, idsEquipo1, idsEquipo2 } = event.data;

    if (tipo === 'loadPokemons') {
        try {
            const promises = Array.from({ length: 1025 }, (_, i) => fetchPokemon(i + 1));
            const allPokemons = await Promise.all(promises);
            postMessage(allPokemons);  // Enviar todos los Pokémon al hilo principal
        } catch (error) {
            postMessage({ error: error.message });  // Enviar el error al hilo principal
        }
    } else if (tipo === 'cargarEquipos') {
        cargarEquipos(idsEquipo1, idsEquipo2);
    }
};