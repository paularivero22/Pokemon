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
        weight: data.weight
    };
}

self.onmessage = async function (event) {
    const { tipo } = event.data;
    let promises;

    if (tipo === 'cargarTodos') {
        promises = Array.from({ length: 1025 }, (_, i) => fetchPokemon(i + 1));
    }

    const pokemones = await Promise.all(promises);
    postMessage(pokemones);
};