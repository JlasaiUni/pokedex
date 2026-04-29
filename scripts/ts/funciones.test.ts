import { describe, it, expect, beforeEach } from "vitest";
import { filterPokemons, toggleFavorite, POKEMON_TYPES } from "./funciones";

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

// ─── filterPokemons ──────────────────────────────────────────────────────────

describe("filterPokemons", () => {
    it('devuelve todos los pokémons con filtro "all" y sin búsqueda', () => {
        const resultado = filterPokemons(TODOS, "all", "", new Set());
        expect(resultado).toHaveLength(3);
    });

    it("filtra correctamente por tipo", () => {
        const resultado = filterPokemons(TODOS, "fire", "", new Set());
        expect(resultado).toHaveLength(1);
        expect(resultado[0]!.name).toBe("charmander");
    });

    it("filtra pokémons con múltiples tipos (grass + poison)", () => {
        const resultado = filterPokemons(TODOS, "poison", "", new Set());
        expect(resultado).toHaveLength(1);
        expect(resultado[0]!.name).toBe("bulbasaur");
    });

    it("devuelve array vacío cuando ningún pokémon coincide con el tipo", () => {
        const resultado = filterPokemons(TODOS, "ghost", "", new Set());
        expect(resultado).toHaveLength(0);
    });

    it("filtra por búsqueda de texto (parcial)", () => {
        const resultado = filterPokemons(TODOS, "all", "pika", new Set());
        expect(resultado).toHaveLength(1);
        expect(resultado[0]!.name).toBe("pikachu");
    });

    it("la búsqueda es sensible a mayúsculas (el nombre viene en minúsculas de la API)", () => {
        const resultado = filterPokemons(TODOS, "all", "Pikachu", new Set());
        expect(resultado).toHaveLength(0);
    });

    it("combina filtro de tipo y búsqueda de texto", () => {
        const resultado = filterPokemons(TODOS, "fire", "char", new Set());
        expect(resultado).toHaveLength(1);
        expect(resultado[0]!.name).toBe("charmander");
    });

    it("combina filtro de tipo y búsqueda sin coincidencias", () => {
        const resultado = filterPokemons(TODOS, "fire", "pika", new Set());
        expect(resultado).toHaveLength(0);
    });

    it('muestra solo favourites con filtro "favourites"', () => {
        const resultado = filterPokemons(TODOS, "favourites", "", new Set([25]));
        expect(resultado).toHaveLength(1);
        expect(resultado[0]!.name).toBe("pikachu");
    });

    it('devuelve array vacío si no hay favourites con filtro "favourites"', () => {
        const resultado = filterPokemons(TODOS, "favourites", "", new Set());
        expect(resultado).toHaveLength(0);
    });

    it("no muta el array original", () => {
        const copia = [...TODOS];
        filterPokemons(TODOS, "fire", "", new Set());
        expect(TODOS).toEqual(copia);
    });
});

// ─── toggleFavorite ───────────────────────────────────────────────────────────

describe("toggleFavorite", () => {
    let favourites: Set<number>;

    beforeEach(() => {
        favourites = new Set();
    });

    it("añade un pokémon que no era favorito", () => {
        const isFavourite = toggleFavorite(favourites, 25);
        expect(favourites.has(25)).toBe(true);
        expect(isFavourite).toBe(true);
    });

    it("elimina un pokémon que ya era favorito", () => {
        favourites.add(25);
        const isFavourite = toggleFavorite(favourites, 25);
        expect(favourites.has(25)).toBe(false);
        expect(isFavourite).toBe(false);
    });

    it("no afecta a otros favourites al eliminar uno", () => {
        favourites.add(25);
        favourites.add(4);
        toggleFavorite(favourites, 25);
        expect(favourites.has(4)).toBe(true);
    });

    it("el Set puede tener varios favourites a la vez", () => {
        toggleFavorite(favourites, 1);
        toggleFavorite(favourites, 4);
        toggleFavorite(favourites, 25);
        expect(favourites.size).toBe(3);
    });
});

// ─── TIPOS ────────────────────────────────────────────────────────────────────

describe("TIPOS", () => {
    it('incluye "all" y "favourites" como opciones especiales', () => {
        expect(POKEMON_TYPES).toContain("all");
        expect(POKEMON_TYPES).toContain("favourites");
    });

    it("contiene los 18 tipos estándar de Pokémon más all, favourites y especiales", () => {
        expect(POKEMON_TYPES).toHaveLength(21);
    });
});