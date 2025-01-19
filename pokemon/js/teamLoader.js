import Pokemon from './Pokemon.js';

export async function loadTeams(equipo1Data, equipo2Data) {
    const worker = new Worker('./worker.js');

    const loadTeam = (teamData) => {
        return new Promise((resolve) => {
            const pokemonIds = teamData.map(pokemon => 
                parseInt(pokemon.nombre.match(/\d+/)[0])
            );

            worker.postMessage({ tipo: 'cargarEquipo', pokemonIds });

            worker.onmessage = async (e) => {
                const pokemons = e.data.map(pokemon => {
                    const stats = {
                        hp: pokemon.stats.find(stat => stat.stat.name === "hp")?.base_stat || 0,
                        attack: pokemon.stats.find(stat => stat.stat.name === "attack")?.base_stat || 0,
                        defense: pokemon.stats.find(stat => stat.stat.name === "defense")?.base_stat || 0,
                        speed: pokemon.stats.find(stat => stat.stat.name === "speed")?.base_stat || 0,
                    };

                    return new Pokemon(
                        pokemon.id,
                        stats.speed,
                        stats.hp,
                        stats.defense,
                        stats.attack,
                        pokemon.name,
                        pokemon.types
                    );
                });
                resolve(pokemons);
            };
        });
    };

    const [equipo1, equipo2] = await Promise.all([
        loadTeam(equipo1Data),
        loadTeam(equipo2Data)
    ]);

    return { equipo1, equipo2 };
}
