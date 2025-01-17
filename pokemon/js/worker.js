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
        stats: {
            hp: data.stats[0].base_stat,
            attack: data.stats[1].base_stat,
            defense: data.stats[2].base_stat,
            speed: data.stats[5].base_stat
        }
    };
}

self.onmessage = async function (event) {
    const { tipo, pokemonIds } = event.data;
    let promises;

    if (tipo === 'cargarTodos') {
        promises = Array.from({ length: 1025 }, (_, i) => fetchPokemon(i + 1));
    } else if (tipo === 'cargarEquipo') {
        promises = pokemonIds.map(id => fetchPokemon(id));
    }

    const pokemones = await Promise.all(promises);
    postMessage(pokemones);
};