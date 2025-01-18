const URL = "https://pokeapi.co/api/v2/pokemon/";
const URL2 = "https://pokeapi.co/api/v2/pokemon-species/";

async function fetchPokemon(id) {
    try {
        // Fetch del Pokémon
        const response = await fetch(URL + id);
        if (!response.ok) throw new Error(`Pokémon con ID ${id} no encontrado.`);
        const data = await response.json();

        // Fetch de la especie del Pokémon
        const response2 = await fetch(URL2 + id);
        if (!response2.ok) throw new Error(`Especie del Pokémon con ID ${id} no encontrada.`);
        const data2 = await response2.json();

        // Obtener la descripción en español
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
        return null; // Devuelve null en caso de error
    }
}

self.onmessage = async function (event) {
    const { tipo } = event.data;

    if (tipo === 'cargarTodos') {
        try {
            // Generar las promesas para todos los Pokémon
            const promises = Array.from({ length: 1025 }, (_, i) => fetchPokemon(i + 1));

            // Esperar a todas las promesas
            const pokemones = await Promise.all(promises);

            // Filtrar los resultados no válidos (null)
            const pokemonesFiltrados = pokemones.filter(pokemon => pokemon !== null);

            // Enviar los datos al hilo principal
            postMessage(pokemonesFiltrados);
        } catch (error) {
            console.error("Error al cargar los datos de todos los Pokémon:", error);
        }
    }
};
