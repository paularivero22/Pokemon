import Pokemon from "./Pokemon.js";
const worker = new Worker('../js/worker.js');

const sprite = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';
const spriteBack = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/';

const equipo1 = [];
const equipo2 = [];

async function crearEquipos() {
    return new Promise((resolve, reject) => {
        // Recupero los equipos
        const equiposGuardados = JSON.parse(localStorage.getItem('equiposGuardados'));
        if (!equiposGuardados || !equiposGuardados[0] || !equiposGuardados[0].equipo || !equiposGuardados[1] || !equiposGuardados[1].equipo) {
            return reject(new Error('No se encontraron equipos guardados'));
        }

        // Preparamos los IDs de los Pokémon de cada equipo
        const idsEquipo1 = equiposGuardados[0].equipo.map(pokemon => {
            const match = pokemon.nombre.match(/^(.*)\s\(#(\d+)\)$/); // Extraer nombre e ID
            if (!match) {
                throw new Error(`Formato incorrecto para el Pokémon: ${pokemon.nombre}`);
            }
            const [, , id] = match; // Solo el ID
            return parseInt(id); // Solo el ID como número
        });

        const idsEquipo2 = equiposGuardados[1].equipo.map(pokemon => {
            const match = pokemon.nombre.match(/^(.*)\s\(#(\d+)\)$/); // Extraer nombre e ID
            if (!match) {
                throw new Error(`Formato incorrecto para el Pokémon: ${pokemon.nombre}`);
            }
            const [, , id] = match; // Solo el ID
            return parseInt(id); // Solo el ID como número
        });


        // Enviamos ambos equipos al worker
        worker.postMessage({ tipo: 'cargarEquipos', idsEquipo1, idsEquipo2 });

        // Esperamos la respuesta del worker
        worker.onmessage = function (event) {
            const [equipo1Datos, equipo2Datos] = event.data;
            // Creamos los equipos con los datos recibidos
            equipo1Datos.forEach(pokemonWorker => {
                equipo1.push(new Pokemon(
                    pokemonWorker.id,
                    pokemonWorker.stats.speed,
                    pokemonWorker.stats.hp,
                    pokemonWorker.stats.defense,
                    pokemonWorker.stats.attack,
                    pokemonWorker.name,
                    pokemonWorker.types
                ));
            });

            equipo2Datos.forEach(pokemonWorker => {
                equipo2.push(new Pokemon(
                    pokemonWorker.id,
                    pokemonWorker.stats.speed,
                    pokemonWorker.stats.hp,
                    pokemonWorker.stats.defense,
                    pokemonWorker.stats.attack,
                    pokemonWorker.name,
                    pokemonWorker.types
                ));
            });

            resolve(); // Si todo está bien, resolvemos la promesa
        };

        worker.onerror = function (error) {
            reject(error); // Si hay error con el worker, rechazamos la promesa
        };
    });
}


crearEquipos()
    .then(() => {
        const textoCombate = document.querySelector('.texto');

        const vida1 = document.querySelector('.barra1');
        const vidaTexto1 = document.querySelector('.textoVida1');

        const vida2 = document.querySelector('.barra2');
        const vidaTexto2 = document.querySelector('.textoVida2');

        const contenedorPokemon1 = document.getElementById('pokemonEquipo1');
        const contenedorPokemon2 = document.getElementById('pokemonEquipo2');

        const equipoPokemon1 = equipo1;
        const equipoPokemon2 = equipo2;

        const botonAtacar = document.querySelector('.atacar');
        const botonCambiar = document.querySelector('.cambiar');
        const menuPokemon = document.getElementById('menuPokemon');
        const equipoPokemonDiv = document.getElementById('equipoPokemon');

        let puedeAtacar = true;

        let integranteEquipo1 = 0;
        let integranteEquipo2 = 0;

        let vivosEquipo1 = [...equipo1];
        let vivosEquipo2 = [...equipo2];

        if (equipoPokemon1 && equipoPokemon2) {
            function capitalizeFirstLetter(string) {
                return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
            }

            function typeWriter(element, text, duration = 1000, callback) {
                let index = 0;
                element.innerHTML = "";
                const speed = duration / text.length;

                // Deshabilitar botones mientras se escribe el texto
                botonAtacar.disabled = true;
                botonCambiar.disabled = true;

                function write() {
                    if (index < text.length) {
                        element.innerHTML += text.charAt(index);
                        index++;
                        setTimeout(write, speed);
                    } else {
                        // Habilitar botones cuando termine de escribir el texto
                        botonAtacar.disabled = false;
                        botonCambiar.disabled = false;
                        if (callback) {
                            callback();
                        }
                    }
                }

                write();
            }

            function actualizarContenedores() {
                contenedorPokemon1.innerHTML = `<img src="${sprite}${pokemonActual1.id}.png" alt="${pokemonActual1.nombre}">`;
                contenedorPokemon2.innerHTML = `<img src="${spriteBack}${pokemonActual2.id}.png" alt="${pokemonActual2.nombre}">`;
                vidaTexto1.innerHTML = 'Vida: ' + pokemonActual1.getVidaActual() + '/' + pokemonActual1.getVida();
                vidaTexto2.innerHTML = 'Vida: ' + pokemonActual2.getVidaActual() + '/' + pokemonActual2.getVida();
                vida1.style.width = `${(pokemonActual1.getVidaActual() / pokemonActual1.getVida()) * 100}%`;
                vida2.style.width = `${(pokemonActual2.getVidaActual() / pokemonActual2.getVida()) * 100}%`;
            }

            function quitarVida() {
                if (!puedeAtacar) {
                    return;
                }
                puedeAtacar = false;

                let atacante, defensor;
                let defensorAntiguo; // Variable para almacenar el defensor original

                if (pokemonActual1.getVelocidad() > pokemonActual2.getVelocidad()) {
                    atacante = pokemonActual1;
                    defensor = pokemonActual2;
                    defensorAntiguo = pokemonActual2; // Guardamos el defensor original
                } else {
                    atacante = pokemonActual2;
                    defensor = pokemonActual1;
                    defensorAntiguo = pokemonActual1; // Guardamos el defensor original
                }

                // PRIMER TURNO
                let damage = atacante.atacar();
                let ataque = defensor.quitarVida(damage);
                typeWriter(
                    textoCombate,
                    ataque > 0
                        ? `${capitalizeFirstLetter(atacante.getNombre())} atacó a ${capitalizeFirstLetter(defensor.getNombre())} y le quitó ${ataque} de vida.`
                        : `${capitalizeFirstLetter(atacante.getNombre())} atacó a ${capitalizeFirstLetter(defensor.getNombre())} pero falló.`,
                    1000,
                    () => {
                        actualizarContenedores();
                        setTimeout(() => {
                            // Verificar si el defensor ha sido derrotado
                            if (defensor.getVidaActual() <= 0) {
                                if (defensor === pokemonActual2) {
                                    vivosEquipo2 = vivosEquipo2.filter((p) => p !== pokemonActual2);
                                    if (vivosEquipo2.length === 0) {
                                        typeWriter(
                                            textoCombate,
                                            `${capitalizeFirstLetter(defensor.getNombre())} ha sido derrotado. ¡Has perdido!`,
                                            1000
                                        );
                                        guardarRegistroCombate('Equipo 1', vivosEquipo1, vivosEquipo2, equipo1.filter(p => !vivosEquipo1.includes(p)), equipo2.filter(p => !vivosEquipo2.includes(p)));
                                        return;
                                    }
                                    defensorAntiguo = pokemonActual2;
                                    pokemonActual2 = vivosEquipo2[0]; // Cambio al siguiente Pokémon vivo
                                    defensor = pokemonActual2;
                                } else {
                                    vivosEquipo1 = vivosEquipo1.filter((p) => p !== pokemonActual1);
                                    if (vivosEquipo1.length === 0) {
                                        typeWriter(
                                            textoCombate,
                                            `${capitalizeFirstLetter(defensor.getNombre())} ha sido derrotado. ¡Has ganado!`,
                                            1000
                                        );
                                        guardarRegistroCombate('Equipo 2', vivosEquipo1, vivosEquipo2, equipo1.filter(p => !vivosEquipo1.includes(p)), equipo2.filter(p => !vivosEquipo2.includes(p)));
                                        return;
                                    }
                                    defensorAntiguo = pokemonActual1;
                                    pokemonActual1 = vivosEquipo1[0]; // Cambio al siguiente Pokémon vivo
                                    defensor = pokemonActual1;
                                }
                                actualizarContenedores();
                            }

                            // SEGUNDO TURNO: Verificar si el atacante sigue vivo antes de atacar
                            if (atacante.getVidaActual() > 0) {
                                let damage = defensor.atacar();
                                let ataque = atacante.quitarVida(damage);
                                typeWriter(
                                    textoCombate,
                                    ataque > 0
                                        ? `${capitalizeFirstLetter(defensor.getNombre())} atacó a ${capitalizeFirstLetter(atacante.getNombre())} y le quitó ${ataque} de vida.`
                                        : `${capitalizeFirstLetter(defensor.getNombre())} atacó a ${capitalizeFirstLetter(atacante.getNombre())} pero falló.`,
                                    1000,
                                    () => {
                                        actualizarContenedores();
                                        setTimeout(() => {
                                            // Verificar si el atacante ha sido derrotado
                                            if (atacante.getVidaActual() <= 0) {
                                                if (atacante === pokemonActual1) {
                                                    vivosEquipo1 = vivosEquipo1.filter((p) => p !== pokemonActual1);
                                                    if (vivosEquipo1.length === 0) {
                                                        typeWriter(
                                                            textoCombate,
                                                            `${capitalizeFirstLetter(atacante.getNombre())} ha sido derrotado. ¡Has ganado!`,
                                                            1000
                                                        );
                                                        guardarRegistroCombate('Equipo 2', vivosEquipo1, vivosEquipo2, equipo1.filter(p => !vivosEquipo1.includes(p)), equipo2.filter(p => !vivosEquipo2.includes(p)));
                                                        return;
                                                    }
                                                    pokemonActual1 = vivosEquipo1[0]; // Cambio al siguiente Pokémon vivo
                                                } else {
                                                    vivosEquipo2 = vivosEquipo2.filter((p) => p !== pokemonActual2);
                                                    if (vivosEquipo2.length === 0) {
                                                        typeWriter(
                                                            textoCombate,
                                                            `${capitalizeFirstLetter(atacante.getNombre())} ha sido derrotado. ¡Has perdido!`,
                                                            1000
                                                        );
                                                        guardarRegistroCombate('Equipo 1', vivosEquipo1, vivosEquipo2, equipo1.filter(p => !vivosEquipo1.includes(p)), equipo2.filter(p => !vivosEquipo2.includes(p)));
                                                        return;
                                                    }
                                                    pokemonActual2 = vivosEquipo2[0]; // Cambio al siguiente Pokémon vivo
                                                }
                                                actualizarContenedores();
                                            }

                                            // Si el defensor original ha muerto, cambiarlo por el siguiente Pokémon correspondiente
                                            if (defensorAntiguo.getVidaActual() <= 0) {
                                                console.log('Defensor original:', defensorAntiguo);
                                                console.log('Actual 1:', pokemonActual1);
                                                if (defensorAntiguo !== pokemonActual1) {
                                                    vivosEquipo1 = vivosEquipo1.filter((p) => p !== pokemonActual1);
                                                    if (vivosEquipo1.length > 0) {
                                                        pokemonActual1 = vivosEquipo1[0]; // Cambiar al siguiente Pokémon
                                                    }
                                                } else {
                                                    vivosEquipo2 = vivosEquipo2.filter((p) => p !== pokemonActual2);
                                                    if (vivosEquipo2.length > 0) {
                                                        console.log('Cambiando a:', vivosEquipo2[0]);
                                                        pokemonActual2 = vivosEquipo2[0]; // Cambiar al siguiente Pokémon
                                                    }
                                                }
                                                actualizarContenedores();
                                            }

                                            if (vivosEquipo1.length > 0 && vivosEquipo2.length > 0) {
                                                typeWriter(textoCombate, '¿Qué quieres hacer ahora?', 1000, () => {
                                                    puedeAtacar = true;
                                                });
                                            } else {
                                                puedeAtacar = true;
                                            }
                                        }, 3000);
                                    }
                                );
                            } else {
                                // Si el atacante ya está muerto, no puede atacar en el segundo turno
                                puedeAtacar = true;
                            }
                        }, 3000);
                    }
                );
            }

            function mostrarMenuPokemon() {
                if (!puedeAtacar) {
                    return;
                }

                equipoPokemonDiv.innerHTML = '';

                equipo2.forEach((pokemon, index) => {
                    const div = document.createElement('div');
                    div.classList.add('pokemon');
                    div.innerHTML = `
                <img src="${sprite}${pokemon.id}.png" alt="${pokemon.nombre}">
                <p>${pokemon.nombre}</p>
            `;
                    div.addEventListener('click', () => cambiarPokemon(index));
                    equipoPokemonDiv.appendChild(div);
                });

                menuPokemon.style.display = 'block';
            }

            function cambiarPokemon(index) {
                if (index !== integranteEquipo2) {
                    integranteEquipo2 = index;
                    pokemonActual2 = equipo2[integranteEquipo2];
                    actualizarContenedores();
                    cerrarMenuPokemon();
                    typeWriter(textoCombate, `${capitalizeFirstLetter(pokemonActual2.getNombre())} ha sido enviado al combate.`, 1000);
                }
            }

            function cerrarMenuPokemon() {
                menuPokemon.style.display = 'none';
            }

            let pokemonActual1 = equipo1[integranteEquipo1];
            let pokemonActual2 = equipo2[integranteEquipo2];
            vidaTexto1.innerHTML = 'Vida: ' + pokemonActual1.getVidaActual() + '/' + pokemonActual1.getVida();
            vidaTexto2.innerHTML = 'Vida: ' + pokemonActual2.getVidaActual() + '/' + pokemonActual2.getVida();

            contenedorPokemon1.innerHTML = `<img src="${sprite}${pokemonActual1.id}.png" alt="${pokemonActual1.nombre}">`;
            contenedorPokemon2.innerHTML = `<img src="${spriteBack}${pokemonActual2.id}.png" alt="${pokemonActual2.nombre}">`;
            botonAtacar.addEventListener('click', quitarVida);
            botonCambiar.addEventListener('click', mostrarMenuPokemon);
            menuPokemon.addEventListener('click', cerrarMenuPokemon);
        } else {
            console.error('No se encontraron los equipos en localStorage');
        }
    })
    .catch((error) => {
        console.error('Error al cargar los equipos:', error);
    });

function guardarRegistroCombate(ganador, vivosEquipo1, vivosEquipo2, muertosEquipo1, muertosEquipo2) {
    const registroCombates = JSON.parse(localStorage.getItem('registroCombates')) || [];
    const fechaHora = new Date().toLocaleString();

    const nuevoRegistro = {
        fechaHora,
        ganador,
        vivosEquipo1: vivosEquipo1.map(p => p.getNombre()),
        vivosEquipo2: vivosEquipo2.map(p => p.getNombre()),
        muertosEquipo1: muertosEquipo1.map(p => p.getNombre()),
        muertosEquipo2: muertosEquipo2.map(p => p.getNombre())
    };

    registroCombates.push(nuevoRegistro);
    localStorage.setItem('registroCombates', JSON.stringify(registroCombates));
}

function mostrarRegistroCombates() {
    const registroCombates = JSON.parse(localStorage.getItem('registroCombates')) || [];
    const registroDiv = document.getElementById('registroCombates');
    registroDiv.innerHTML = '';

    registroCombates.forEach(registro => {
        const registroHTML = `
            <div class="registro-combate">
                <p><strong>Fecha y Hora:</strong> ${registro.fechaHora}</p>
                <p><strong>Ganador:</strong> ${registro.ganador}</p>
                <p><strong>Vivos Equipo 1:</strong> ${registro.vivosEquipo1.join(', ')}</p>
                <p><strong>Vivos Equipo 2:</strong> ${registro.vivosEquipo2.join(', ')}</p>
                <p><strong>Muertos Equipo 1:</strong> ${registro.muertosEquipo1.join(', ')}</p>
                <p><strong>Muertos Equipo 2:</strong> ${registro.muertosEquipo2.join(', ')}</p>
            </div>
        `;
        registroDiv.innerHTML += registroHTML;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const botonMostrarRegistros = document.getElementById('mostrarRegistros');
    botonMostrarRegistros.addEventListener('click', mostrarRegistroCombates);
});