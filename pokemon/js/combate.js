import Pokemon from "./Pokemon.js";

const sprite = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';
const spriteBack = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/';

const textoCombate = document.querySelector('.texto');

const vida1 = document.querySelector('.barra1');
const vidaTexto1 = document.querySelector('.textoVida1');

const vida2 = document.querySelector('.barra2');
const vidaTexto2 = document.querySelector('.textoVida2');

const contenedorPokemon1 = document.getElementById('pokemonEquipo1');
const contenedorPokemon2 = document.getElementById('pokemonEquipo2');

const botonAtacar = document.querySelector('.atacar');
const botonCambiar = document.querySelector('.cambiar');
const menuPokemon = document.getElementById('menuPokemon');
const equipoPokemonDiv = document.getElementById('equipoPokemon');

let puedeAtacar = true;

let integranteEquipo1 = 0;
let integranteEquipo2 = 0;

// Cargar equipos desde localStorage
const equiposGuardados = JSON.parse(localStorage.getItem('equiposGuardados')) || [];
if (equiposGuardados.length < 2) {
    console.error('No se encontraron suficientes equipos guardados en localStorage');
}

const equipo1Data = equiposGuardados[0].equipo;
const equipo2Data = equiposGuardados[1].equipo;

const equipo1 = equipo1Data.map(pokemon => new Pokemon(
    parseInt(pokemon.nombre.match(/\d+/)[0]), // ID
    50, // Vida (puedes ajustar esto según tus necesidades)
    1, // Vida actual (puedes ajustar esto según tus necesidades)
    50, // Defensa (puedes ajustar esto según tus necesidades)
    50, // Ataque (puedes ajustar esto según tus necesidades)
    pokemon.nombre.split(' ')[0], // Nombre
    [] // Tipos (puedes ajustar esto según tus necesidades)
));

const equipo2 = equipo2Data.map(pokemon => new Pokemon(
    parseInt(pokemon.nombre.match(/\d+/)[0]), // ID
    50, // Vida (puedes ajustar esto según tus necesidades)
    1, // Vida actual (puedes ajustar esto según tus necesidades)
    50, // Defensa (puedes ajustar esto según tus necesidades)
    50, // Ataque (puedes ajustar esto según tus necesidades)
    pokemon.nombre.split(' ')[0], // Nombre
    [] // Tipos (puedes ajustar esto según tus necesidades)
));

let vivosEquipo1 = [...equipo1];
let vivosEquipo2 = [...equipo2];

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

// ...existing code...

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
                        vivosEquipo2 = vivosEquipo2.filter(p => p !== pokemonActual2);
                        if (vivosEquipo2.length === 0) {
                            typeWriter(textoCombate, `${capitalizeFirstLetter(defensor.getNombre())} ha sido derrotado. ¡Has ganado!`, 1000);
                            return;
                        }
                        pokemonActual2 = vivosEquipo2[0];
                    } else {
                        vivosEquipo1 = vivosEquipo1.filter(p => p !== pokemonActual1);
                        if (vivosEquipo1.length === 0) {
                            typeWriter(textoCombate, `${capitalizeFirstLetter(defensor.getNombre())} ha sido derrotado. ¡Has perdido!`, 1000);
                            return;
                        }
                        pokemonActual1 = vivosEquipo1[0];
                    }
                    actualizarContenedores();
                }

                let damage = defensor.atacar();
                let ataque = atacante.quitarVida(damage);
                if (ataque > 0) {
                    typeWriter(textoCombate, `${capitalizeFirstLetter(defensor.getNombre())} atacó a ${capitalizeFirstLetter(atacante.getNombre())} y le quitó ${ataque} de vida.`, 1000, () => {
                        actualizarContenedores();
                        setTimeout(() => {

                            if (vivosEquipo1.length > 0 && vivosEquipo2.length > 0) {
                                typeWriter(textoCombate, '¿Qué quieres hacer ahora?', 1000);
                            } else if (atacante.getVidaActual() > 0 && defensor.getVidaActual() > 0) {
                                typeWriter(textoCombate, '¿Qué quieres hacer ahora?', 1000);
                            }
                            puedeAtacar = true;
                            if (atacante.getVidaActual() <= 0) {
                                if (atacante === pokemonActual1) {
                                    vivosEquipo1 = vivosEquipo1.filter(p => p !== pokemonActual1);
                                    if (vivosEquipo1.length === 0) {
                                        typeWriter(textoCombate, `${capitalizeFirstLetter(atacante.getNombre())} ha sido derrotado. ¡Has perdido!`, 1000);
                                        return;
                                    }
                                    pokemonActual1 = vivosEquipo1[0];
                                } else {
                                    vivosEquipo2 = vivosEquipo2.filter(p => p !== pokemonActual2);
                                    if (vivosEquipo2.length === 0) {
                                        typeWriter(textoCombate, `${capitalizeFirstLetter(atacante.getNombre())} ha sido derrotado. ¡Has ganado!`, 1000);
                                        return;
                                    }
                                    pokemonActual2 = vivosEquipo2[0];
                                }
                                actualizarContenedores();
                            }
                        }, 3000);
                    });
                } else {
                    typeWriter(textoCombate, `${capitalizeFirstLetter(defensor.getNombre())} atacó a ${capitalizeFirstLetter(atacante.getNombre())} pero falló.`, 1000, () => {
                        actualizarContenedores();
                        setTimeout(() => {
                            if (atacante.getVidaActual() > 0) {
                                if (vivosEquipo1.length > 0 && vivosEquipo2.length > 0) {
                                    typeWriter(textoCombate, '¿Qué quieres hacer ahora?', 1000);
                                }
                            }
                            puedeAtacar = true;
                            if (atacante.getVidaActual() <= 0) {
                                if (atacante === pokemonActual1) {
                                    vivosEquipo1 = vivosEquipo1.filter(p => p !== pokemonActual1);
                                    if (vivosEquipo1.length === 0) {
                                        typeWriter(textoCombate, `${capitalizeFirstLetter(atacante.getNombre())} ha sido derrotado. ¡Has perdido!`, 1000);
                                        return;
                                    }
                                    pokemonActual1 = vivosEquipo1[0];
                                } else {
                                    vivosEquipo2 = vivosEquipo2.filter(p => p !== pokemonActual2);
                                    if (vivosEquipo2.length === 0) {
                                        typeWriter(textoCombate, `${capitalizeFirstLetter(atacante.getNombre())} ha sido derrotado. ¡Has ganado!`, 1000);
                                        return;
                                    }
                                    pokemonActual2 = vivosEquipo2[0];
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
                        vivosEquipo2 = vivosEquipo2.filter(p => p !== pokemonActual2);
                        if (vivosEquipo2.length === 0) {
                            typeWriter(textoCombate, `${capitalizeFirstLetter(defensor.getNombre())} ha sido derrotado. ¡Has ganado!`, 1000);
                            return;
                        }
                        pokemonActual2 = vivosEquipo2[0];
                    } else {
                        vivosEquipo1 = vivosEquipo1.filter(p => p !== pokemonActual1);
                        if (vivosEquipo1.length === 0) {
                            typeWriter(textoCombate, `${capitalizeFirstLetter(defensor.getNombre())} ha sido derrotado. ¡Has perdido!`, 1000);
                            return;
                        }
                        pokemonActual1 = vivosEquipo1[0];
                    }
                    actualizarContenedores();
                }

                let damage = defensor.atacar();
                let ataque = atacante.quitarVida(damage);
                if (ataque > 0) {
                    typeWriter(textoCombate, `${capitalizeFirstLetter(defensor.getNombre())} atacó a ${capitalizeFirstLetter(atacante.getNombre())} y le quitó ${ataque} de vida.`, 1000, () => {
                        actualizarContenedores();
                        setTimeout(() => {
                            if (atacante.getVidaActual() > 0) {
                                if (vivosEquipo1.length > 0 && vivosEquipo2.length > 0) {
                                    typeWriter(textoCombate, '¿Qué quieres hacer ahora?', 1000);
                                }
                            }
                            puedeAtacar = true;
                            if (atacante.getVidaActual() <= 0) {
                                if (atacante === pokemonActual1) {
                                    vivosEquipo1 = vivosEquipo1.filter(p => p !== pokemonActual1);
                                    if (vivosEquipo1.length === 0) {
                                        typeWriter(textoCombate, `${capitalizeFirstLetter(atacante.getNombre())} ha sido derrotado. ¡Has perdido!`, 1000);
                                        return;
                                    }
                                    pokemonActual1 = vivosEquipo1[0];
                                } else {
                                    vivosEquipo2 = vivosEquipo2.filter(p => p !== pokemonActual2);
                                    if (vivosEquipo2.length === 0) {
                                        typeWriter(textoCombate, `${capitalizeFirstLetter(atacante.getNombre())} ha sido derrotado. ¡Has ganado!`, 1000);
                                        return;
                                    }
                                    pokemonActual2 = vivosEquipo2[0];
                                }
                                actualizarContenedores();
                            }
                        }, 3000);
                    });
                } else {
                    typeWriter(textoCombate, `${capitalizeFirstLetter(defensor.getNombre())} atacó a ${capitalizeFirstLetter(atacante.getNombre())} pero falló.`, 1000, () => {
                        actualizarContenedores();
                        setTimeout(() => {
                            if (atacante.getVidaActual() > 0) {
                                if (vivosEquipo1.length > 0 && vivosEquipo2.length > 0) {
                                    typeWriter(textoCombate, '¿Qué quieres hacer ahora?', 1000);
                                }
                            }
                            puedeAtacar = true;
                            if (atacante.getVidaActual() <= 0) {
                                if (atacante === pokemonActual1) {
                                    vivosEquipo1 = vivosEquipo1.filter(p => p !== pokemonActual1);
                                    if (vivosEquipo1.length === 0) {
                                        typeWriter(textoCombate, `${capitalizeFirstLetter(atacante.getNombre())} ha sido derrotado. ¡Has perdido!`, 1000);
                                        return;
                                    }
                                    pokemonActual1 = vivosEquipo1[0];
                                } else {
                                    vivosEquipo2 = vivosEquipo2.filter(p => p !== pokemonActual2);
                                    if (vivosEquipo2.length === 0) {
                                        typeWriter(textoCombate, `${capitalizeFirstLetter(atacante.getNombre())} ha sido derrotado. ¡Has ganado!`, 1000);
                                        return;
                                    }
                                    pokemonActual2 = vivosEquipo2[0];
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

// ...existing code...

function mostrarMenuPokemon() {
    if (!puedeAtacar) {
        return;
    }

    equipoPokemonDiv.innerHTML = '';

    vivosEquipo2.forEach((pokemon, index) => {
        const div = document.createElement('div');
        div.classList.add('pokemon');
        console.log(`${sprite}${pokemon.id}.png`);
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
        pokemonActual2 = vivosEquipo2[integranteEquipo2];
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