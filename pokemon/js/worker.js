const URL = "https://pokeapi.co/api/v2/pokemon/";
const URL2 = "https://pokeapi.co/api/v2/pokemon-species/";

async function fetchPokemon(id) {
    try {
        const response = await fetch(URL + id);
        if (!response.ok) throw new Error(`Pokémon con ID ${id} no encontrado.`);
        const data = await response.json();

        const response2 = await fetch(URL2 + id);
        if (!response2.ok) throw new Error(`Especie del Pokémon con ID ${id} no encontrada.`);
        const data2 = await response2.json();

        const flavorTextEntry = data2.flavor_text_entries.find(
            (entry) => entry.language.name === "es"
        );

        return {
            id: data.id,
            name: data.name,
            image: data.sprites.other["official-artwork"].front_default,
            types: data.types.map(type => type.type.name),
            height: data.height,
            weight: data.weight,
            stats: data.stats,
            ability: data.abilities.map(entry => entry.ability.name),
            description: flavorTextEntry ? flavorTextEntry.flavor_text.replace(/\n/g, " ") : "No hay descripción disponible.",
            gender: data2.gender_rate,
            otherImages: Object.fromEntries(
                Object.entries(data.sprites).filter(([key, value]) => 
                    (key === "front_default" || key === "front_shiny") && value !== null
                )
            ),
        };
    } catch (error) {
        console.error(`Error en fetchPokemon(${id}):`, error);
        return null;
    }
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

    if (tipo === 'cargarTodos') {
        try {
            const promises = Array.from({ length: 1025 }, (_, i) => fetchPokemon(i + 1));
            const pokemones = await Promise.all(promises);
            const pokemonesFiltrados = pokemones.filter(pokemon => pokemon !== null);
            postMessage(pokemonesFiltrados);
        } catch (error) {
            console.error("Error al cargar los datos de todos los Pokémon:", error);
        }
    } else if (tipo === 'cargarEquipos') {
        cargarEquipos(idsEquipo1, idsEquipo2);
    }
};
