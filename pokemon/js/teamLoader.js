import Pokemon from './Pokemon.js';

export async function loadTeams(equipo1Data, equipo2Data) {
    const worker = new Worker('js/worker.js');
    
    const loadTeam = (teamData) => {
        return new Promise((resolve) => {
            const pokemonIds = teamData.map(pokemon => 
                parseInt(pokemon.nombre.match(/\d+/)[0])
            );
            
            worker.postMessage({ tipo: 'cargarEquipo', pokemonIds });
            
            worker.onmessage = async (e) => {
                const pokemons = await Promise.all(
                    e.data.map(pokemon => Pokemon.fromAPI(pokemon))
                );
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