import Pokemon from "./Pokemon.js";

const equipo1 = [
    new Pokemon(1, 45, 100, 50, 49, 'bulbasaur', ['grass', 'poison'], 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png'),
    new Pokemon(4, 65, 100, 43, 52, 'charmander', ['fire'], 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png')
];

const equipo2 = [
    new Pokemon(7, 43, 100, 65, 48, 'squirtle', ['water'], 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/7.png'),
    new Pokemon(25, 90, 100, 40, 55, 'pikachu', ['electric'], 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/25.png')
];

const equipo1Data = equipo1.map(pokemon => ({
    id: pokemon.id,
    velocidad: pokemon.velocidad,
    vida: pokemon.vida,
    defensa: pokemon.defensa,
    ataque: pokemon.ataque,
    nombre: pokemon.nombre,
    types: pokemon.types,
    sprite: pokemon.sprite
}));

const equipo2Data = equipo2.map(pokemon => ({
    id: pokemon.id,
    velocidad: pokemon.velocidad,
    vida: pokemon.vida,
    defensa: pokemon.defensa,
    ataque: pokemon.ataque,
    nombre: pokemon.nombre,
    types: pokemon.types,
    sprite: pokemon.sprite
}));

// Guardar en localStorage
localStorage.setItem('equipo1', JSON.stringify(equipo1Data));
localStorage.setItem('equipo2', JSON.stringify(equipo2Data));

const textoCombate = document.querySelector('.texto');

const vida1 = document.querySelector('.barra1');
const vidaTexto1 = document.querySelector('.textoVida1');

const vida2 = document.querySelector('.barra2');
const vidaTexto2 = document.querySelector('.textoVida2');

const contenedorPokemon1 = document.getElementById('pokemonEquipo1');
const contenedorPokemon2 = document.getElementById('pokemonEquipo2');

const equipoPokemon1 = localStorage.getItem('equipo1');
const equipoPokemon2 = localStorage.getItem('equipo2');

const botonAtacar = document.querySelector('.atacar');
let puedeAtacar = true;

let integranteEquipo1 = 0;
let integranteEquipo2 = 0;

if (equipoPokemon1 && equipoPokemon2) {
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    }

    function typeWriter(element, text, duration = 1000, callback) {
        let index = 0;
        element.innerHTML = "";
        const speed = duration / text.length;

        function write() {
            if (index < text.length) {
                element.innerHTML += text.charAt(index);
                index++;
                setTimeout(write, speed);
            } else if (callback) {
                callback();
            }
        }

        write();
    }

    function actualizarContenedores() {
        contenedorPokemon1.innerHTML = `<img src="${pokemonActual1.sprite}" alt="${pokemonActual1.nombre}">`;
        contenedorPokemon2.innerHTML = `<img src="${pokemonActual2.sprite}" alt="${pokemonActual2.nombre}">`;
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

        if (pokemonActual1.getVelocidad() > pokemonActual2.getVelocidad()) {
            atacante = pokemonActual1;
            defensor = pokemonActual2;
        } else {
            atacante = pokemonActual2;
            defensor = pokemonActual1;
        }

        let damage = atacante.atacar();
        let ataque = defensor.quitarVida(damage);
        if (ataque > 0) {
            typeWriter(textoCombate, `${capitalizeFirstLetter(atacante.getNombre())} atacó a ${capitalizeFirstLetter(defensor.getNombre())} y le quitó ${ataque} de vida.`, 1000, () => {
                actualizarContenedores();
                setTimeout(() => {
                    if (defensor.getVidaActual() <= 0) {
                        if (defensor === pokemonActual2) {
                            if (++integranteEquipo2 >= equipo2.length) {
                                typeWriter(textoCombate, `${capitalizeFirstLetter(defensor.getNombre())} ha sido derrotado. ¡Has ganado!`, 1000);
                                return;
                            }
                            pokemonActual2 = equipo2[integranteEquipo2];
                        } else {
                            if (++integranteEquipo1 >= equipo1.length) {
                                typeWriter(textoCombate, `${capitalizeFirstLetter(defensor.getNombre())} ha sido derrotado. ¡Has perdido!`, 1000);
                                return;
                            }
                            pokemonActual1 = equipo1[integranteEquipo1];
                        }
                        actualizarContenedores();
                    }

                    let damage = defensor.atacar();
                    let ataque = atacante.quitarVida(damage);
                    if (ataque > 0) {
                        typeWriter(textoCombate, `${capitalizeFirstLetter(defensor.getNombre())} atacó a ${capitalizeFirstLetter(atacante.getNombre())} y le quitó ${ataque} de vida.`, 1000, () => {
                            actualizarContenedores();
                            setTimeout(() => {
                                typeWriter(textoCombate, '¿Qué quieres hacer ahora?', 1000);
                                puedeAtacar = true;
                                if (atacante.getVidaActual() <= 0) {
                                    if (atacante === pokemonActual1) {
                                        if (++integranteEquipo1 >= equipo1.length) {
                                            typeWriter(textoCombate, `${capitalizeFirstLetter(atacante.getNombre())} ha sido derrotado. ¡Has perdido!`, 1000);
                                            return;
                                        }
                                        pokemonActual1 = equipo1[integranteEquipo1];
                                    } else {
                                        if (++integranteEquipo2 >= equipo2.length) {
                                            typeWriter(textoCombate, `${capitalizeFirstLetter(atacante.getNombre())} ha sido derrotado. ¡Has ganado!`, 1000);
                                            return;
                                        }
                                        pokemonActual2 = equipo2[integranteEquipo2];
                                    }
                                    actualizarContenedores();
                                }
                            }, 3000);
                        });
                    } else {
                        typeWriter(textoCombate, `${capitalizeFirstLetter(defensor.getNombre())} atacó a ${capitalizeFirstLetter(atacante.getNombre())} pero falló.`, 1000, () => {
                            actualizarContenedores();
                            setTimeout(() => {
                                typeWriter(textoCombate, '¿Qué quieres hacer ahora?', 1000);
                                puedeAtacar = true;
                                if (atacante.getVidaActual() <= 0) {
                                    if (atacante === pokemonActual1) {
                                        if (++integranteEquipo1 >= equipo1.length) {
                                            typeWriter(textoCombate, `${capitalizeFirstLetter(atacante.getNombre())} ha sido derrotado. ¡Has perdido!`, 1000);
                                            return;
                                        }
                                        pokemonActual1 = equipo1[integranteEquipo1];
                                    } else {
                                        if (++integranteEquipo2 >= equipo2.length) {
                                            typeWriter(textoCombate, `${capitalizeFirstLetter(atacante.getNombre())} ha sido derrotado. ¡Has ganado!`, 1000);
                                            return;
                                        }
                                        pokemonActual2 = equipo2[integranteEquipo2];
                                    }
                                    actualizarContenedores();
                                }
                            }, 3000);
                        });
                    }
                }, 3000);
            });
        } else {
            typeWriter(textoCombate, `${capitalizeFirstLetter(atacante.getNombre())} atacó a ${capitalizeFirstLetter(defensor.getNombre())} pero falló.`, 1000, () => {
                actualizarContenedores();
                setTimeout(() => {
                    if (defensor.getVidaActual() <= 0) {
                        if (defensor === pokemonActual2) {
                            if (++integranteEquipo2 >= equipo2.length) {
                                typeWriter(textoCombate, `${capitalizeFirstLetter(defensor.getNombre())} ha sido derrotado. ¡Has ganado!`, 1000);
                                return;
                            }
                            pokemonActual2 = equipo2[integranteEquipo2];
                        } else {
                            if (++integranteEquipo1 >= equipo1.length) {
                                typeWriter(textoCombate, `${capitalizeFirstLetter(defensor.getNombre())} ha sido derrotado. ¡Has perdido!`, 1000);
                                return;
                            }
                            pokemonActual1 = equipo1[integranteEquipo1];
                        }
                        actualizarContenedores();
                    }

                    let damage = defensor.atacar();
                    let ataque = atacante.quitarVida(damage);
                    if (ataque > 0) {
                        typeWriter(textoCombate, `${capitalizeFirstLetter(defensor.getNombre())} atacó a ${capitalizeFirstLetter(atacante.getNombre())} y le quitó ${ataque} de vida.`, 1000, () => {
                            actualizarContenedores();
                            setTimeout(() => {
                                typeWriter(textoCombate, '¿Qué quieres hacer ahora?', 1000);
                                puedeAtacar = true;
                                if (atacante.getVidaActual() <= 0) {
                                    if (atacante === pokemonActual1) {
                                        if (++integranteEquipo1 >= equipo1.length) {
                                            typeWriter(textoCombate, `${capitalizeFirstLetter(atacante.getNombre())} ha sido derrotado. ¡Has perdido!`, 1000);
                                            return;
                                        }
                                        pokemonActual1 = equipo1[integranteEquipo1];
                                    } else {
                                        if (++integranteEquipo2 >= equipo2.length) {
                                            typeWriter(textoCombate, `${capitalizeFirstLetter(atacante.getNombre())} ha sido derrotado. ¡Has ganado!`, 1000);
                                            return;
                                        }
                                        pokemonActual2 = equipo2[integranteEquipo2];
                                    }
                                    actualizarContenedores();
                                }
                            }, 3000);
                        });
                    } else {
                        typeWriter(textoCombate, `${capitalizeFirstLetter(defensor.getNombre())} atacó a ${capitalizeFirstLetter(atacante.getNombre())} pero falló.`, 1000, () => {
                            actualizarContenedores();
                            setTimeout(() => {
                                typeWriter(textoCombate, '¿Qué quieres hacer ahora?', 1000);
                                puedeAtacar = true;
                                if (atacante.getVidaActual() <= 0) {
                                    if (atacante === pokemonActual1) {
                                        if (++integranteEquipo1 >= equipo1.length) {
                                            typeWriter(textoCombate, `${capitalizeFirstLetter(atacante.getNombre())} ha sido derrotado. ¡Has perdido!`, 1000);
                                            return;
                                        }
                                        pokemonActual1 = equipo1[integranteEquipo1];
                                    } else {
                                        if (++integranteEquipo2 >= equipo2.length) {
                                            typeWriter(textoCombate, `${capitalizeFirstLetter(atacante.getNombre())} ha sido derrotado. ¡Has ganado!`, 1000);
                                            return;
                                        }
                                        pokemonActual2 = equipo2[integranteEquipo2];
                                    }
                                    actualizarContenedores();
                                }
                            }, 3000);
                        });
                    }
                }, 3000);
            });
        }
    }

    let pokemonActual1 = equipo1[integranteEquipo1];
    let pokemonActual2 = equipo2[integranteEquipo2];
    vidaTexto1.innerHTML = 'Vida: ' + pokemonActual1.getVidaActual() + '/' + pokemonActual1.getVida();
    vidaTexto2.innerHTML = 'Vida: ' + pokemonActual2.getVidaActual() + '/' + pokemonActual2.getVida();

    contenedorPokemon1.innerHTML = `<img src="${pokemonActual1.sprite}" alt="${pokemonActual1.name}">`;
    contenedorPokemon2.innerHTML = `<img src="${pokemonActual2.sprite}" alt="${pokemonActual2.name}">`;
    botonAtacar.addEventListener('click', quitarVida);
} else {
    console.error('No se encontraron los equipos en localStorage');
}