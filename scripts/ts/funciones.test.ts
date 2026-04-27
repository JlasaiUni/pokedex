import { describe, it, expect, beforeEach } from "vitest";
import { filtrarPokemons, toggleFavorito, TIPOS } from "./funciones";

// ─── Datos de prueba ───────────────────────────────────────────────────────────

const PIKACHU = {
    id: 25,
    name: "pikachu",
    types: ["electric"],
    weight: 60, height: 4, image: "",
    stats: { hp: 35, attack: 55, defense: 40, specialAttack: 50, specialDefense: 50, speed: 90 },
};

const CHARMANDER = {
    id: 4,
    name: "charmander",
    types: ["fire"],
    weight: 85, height: 6, image: "",
    stats: { hp: 39, attack: 52, defense: 43, specialAttack: 60, specialDefense: 50, speed: 65 },
};

const BULBASAUR = {
    id: 1,
    name: "bulbasaur",
    types: ["grass", "poison"],
    weight: 69, height: 7, image: "",
    stats: { hp: 45, attack: 49, defense: 49, specialAttack: 65, specialDefense: 65, speed: 45 },
};

const TODOS = [PIKACHU, CHARMANDER, BULBASAUR];

// ─── filtrarPokemons ──────────────────────────────────────────────────────────

describe("filtrarPokemons", () => {
    it('devuelve todos los pokémons con filtro "all" y sin búsqueda', () => {
        const resultado = filtrarPokemons(TODOS, "all", "", new Set());
        expect(resultado).toHaveLength(3);
    });

    it("filtra correctamente por tipo", () => {
        const resultado = filtrarPokemons(TODOS, "fire", "", new Set());
        expect(resultado).toHaveLength(1);
        expect(resultado[0]!.name).toBe("charmander");
    });

    it("filtra pokémons con múltiples tipos (grass + poison)", () => {
        const resultado = filtrarPokemons(TODOS, "poison", "", new Set());
        expect(resultado).toHaveLength(1);
        expect(resultado[0]!.name).toBe("bulbasaur");
    });

    it("devuelve array vacío cuando ningún pokémon coincide con el tipo", () => {
        const resultado = filtrarPokemons(TODOS, "ghost", "", new Set());
        expect(resultado).toHaveLength(0);
    });

    it("filtra por búsqueda de texto (parcial)", () => {
        const resultado = filtrarPokemons(TODOS, "all", "pika", new Set());
        expect(resultado).toHaveLength(1);
        expect(resultado[0]!.name).toBe("pikachu");
    });

    it("la búsqueda es sensible a mayúsculas (el nombre viene en minúsculas de la API)", () => {
        const resultado = filtrarPokemons(TODOS, "all", "Pikachu", new Set());
        expect(resultado).toHaveLength(0);
    });

    it("combina filtro de tipo y búsqueda de texto", () => {
        const resultado = filtrarPokemons(TODOS, "fire", "char", new Set());
        expect(resultado).toHaveLength(1);
        expect(resultado[0]!.name).toBe("charmander");
    });

    it("combina filtro de tipo y búsqueda sin coincidencias", () => {
        const resultado = filtrarPokemons(TODOS, "fire", "pika", new Set());
        expect(resultado).toHaveLength(0);
    });

    it('muestra solo favoritos con filtro "favoritos"', () => {
        const resultado = filtrarPokemons(TODOS, "favoritos", "", new Set([25]));
        expect(resultado).toHaveLength(1);
        expect(resultado[0]!.name).toBe("pikachu");
    });

    it('devuelve array vacío si no hay favoritos con filtro "favoritos"', () => {
        const resultado = filtrarPokemons(TODOS, "favoritos", "", new Set());
        expect(resultado).toHaveLength(0);
    });

    it("no muta el array original", () => {
        const copia = [...TODOS];
        filtrarPokemons(TODOS, "fire", "", new Set());
        expect(TODOS).toEqual(copia);
    });
});

// ─── toggleFavorito ───────────────────────────────────────────────────────────

describe("toggleFavorito", () => {
    let favoritos: Set<number>;

    beforeEach(() => {
        favoritos = new Set();
    });

    it("añade un pokémon que no era favorito", () => {
        const { favoritos: fav, esFavorito } = toggleFavorito(favoritos, 25);
        expect(fav.has(25)).toBe(true);
        expect(esFavorito).toBe(true);
    });

    it("elimina un pokémon que ya era favorito", () => {
        favoritos.add(25);
        const { favoritos: fav, esFavorito } = toggleFavorito(favoritos, 25);
        expect(fav.has(25)).toBe(false);
        expect(esFavorito).toBe(false);
    });

    it("no afecta a otros favoritos al eliminar uno", () => {
        favoritos.add(25);
        favoritos.add(4);
        toggleFavorito(favoritos, 25);
        expect(favoritos.has(4)).toBe(true);
    });

    it("el Set puede tener varios favoritos a la vez", () => {
        toggleFavorito(favoritos, 1);
        toggleFavorito(favoritos, 4);
        toggleFavorito(favoritos, 25);
        expect(favoritos.size).toBe(3);
    });
});

// ─── TIPOS ────────────────────────────────────────────────────────────────────

describe("TIPOS", () => {
    it('incluye "all" y "favoritos" como opciones especiales', () => {
        expect(TIPOS).toContain("all");
        expect(TIPOS).toContain("favoritos");
    });

    it("contiene los 18 tipos estándar de Pokémon más all, favoritos y especiales", () => {
        expect(TIPOS).toHaveLength(21);
    });
});