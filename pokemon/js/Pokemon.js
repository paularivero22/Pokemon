class Pokemon {
    constructor(id, velocidad, vida, defensa, ataque, nombre, types) {
        this.id = id;
        this.velocidad = velocidad;
        this.vida = vida;
        this.vidaActual = vida; // Asegúrate de tener una propiedad para la vida actual
        this.defensa = defensa;
        this.ataque = ataque;
        this.nombre = nombre;
        this.types = types;
    }

    static async fromAPI(pokemonData) {
        const stats = {
            hp: pokemonData.stats.find(stat => stat.stat.name === "hp")?.base_stat || 0,
            attack: pokemonData.stats.find(stat => stat.stat.name === "attack")?.base_stat || 0,
            defense: pokemonData.stats.find(stat => stat.stat.name === "defense")?.base_stat || 0,
            speed: pokemonData.stats.find(stat => stat.stat.name === "speed")?.base_stat || 0,
        };
    
        return new Pokemon(
            pokemonData.id,
            stats.speed,
            stats.hp,
            stats.defense,
            stats.attack,
            pokemonData.name,
            pokemonData.types
        );
    }
    

    getId() {
        return this.id;
    }

    getVelocidad() {
        return this.velocidad;
    }

    getVida() {
        return this.vida;
    }

    getVidaActual() {
        return this.vidaActual;
    }

    getDefensa() {
        return this.defensa;
    }

    getAtaque() {
        return this.ataque;
    }

    getAtaqueActual() {
        return Math.floor(Math.random() * this.ataque);
    }

    getNombre() {
        return this.nombre;
    }

    getTypes() {
        return this.types;
    }

    atacar() {
        // Implementación del método atacar
        return this.getAtaqueActual();
    }

    quitarVida(damage) {
        let damageActual = damage - Math.floor(Math.random() * (this.defensa/2));

        if (damageActual < 0) {
            damageActual = 0;
        }

        this.vidaActual = this.vidaActual - damageActual;
        if (this.vidaActual < 0) {
            this.vidaActual = 0;
        }

        return damageActual;
    }
}

export default Pokemon;