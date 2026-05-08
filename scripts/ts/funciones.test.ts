import { describe, it, expect, beforeEach } from "vitest";
import { filterPokemons, toggleFavorite, POKEMON_TYPES, toPokemonBasic} from "./funciones";
import { GEN_RANGES, type PokemonBasic, type PokeAPIResponse} from "./funciones";

// ─── Datos de prueba ───────────────────────────────────────────────────────────

const PIKACHU: PokemonBasic = {
    id: 25,
    name: "pikachu",
    types: ["electric"],
};

const CHARMANDER: PokemonBasic = {
    id: 4,
    name: "charmander",
    types: ["fire"],
};

const BULBASAUR: PokemonBasic = {
    id: 1,
    name: "bulbasaur",
    types: ["grass", "poison"],
};

const MEW: PokemonBasic = {
    id: 151,
    name: "mew",
    types: ["psychic"],
};

const TREECKO: PokemonBasic = {
    id: 252,
    name: "treecko",
    types: ["grass"],
};

const LUCARIO: PokemonBasic = {
    id: 448,
    name: "lucario",
    types: ["fighting", "steel"],
};

const SPRIGATITO: PokemonBasic = {
    id: 906,
    name: "sprigatito",
    types: ["grass"],
};

const MEGA_RAYQUAZA: PokemonBasic = {
    id: 10001,
    name: "mega-rayquaza",
    types: ["dragon", "flying"],
};

const TODOS = [PIKACHU, CHARMANDER, BULBASAUR, TREECKO, LUCARIO, SPRIGATITO, MEGA_RAYQUAZA, MEW];

// ─── filterPokemons ──────────────────────────────────────────────────────────

describe("filterPokemons", () => {
    it('devuelve todos los pokémons con filtro "all" y sin búsqueda', () => {
        const resultado = filterPokemons(TODOS, "all", "", new Set());
        expect(resultado).toHaveLength(8);
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

    it("filtra correctamente por generación 1", () => {
        const resultado = filterPokemons(
            TODOS,
            "all",
            "",
            new Set(),
            "gen1"
        );

        expect(resultado.map(p => p.name)).toEqual([
            "pikachu",
            "charmander",
            "bulbasaur",
            "mew"
        ]);
    });

    it("filtra correctamente por generación 3", () => {
        const resultado = filterPokemons(
            TODOS,
            "all",
            "",
            new Set(),
            "gen3"
        );

        expect(resultado).toHaveLength(1);
        expect(resultado[0]!.name).toBe("treecko");
    });

    it("combina generación y tipo", () => {
        const resultado = filterPokemons(
            TODOS,
            "grass",
            "",
            new Set(),
            "gen9"
        );

        expect(resultado).toHaveLength(1);
        expect(resultado[0]!.name).toBe("sprigatito");
    });

    it('filtra pokémons especiales con filtro "special"', () => {
        const resultado = filterPokemons(
            TODOS,
            "special",
            "",
            new Set()
        );

        expect(resultado).toHaveLength(1);
        expect(resultado[0]!.name).toBe("mega-rayquaza");
    });

    it('filtra pokémons especiales con filtro "special"', () => {
        const resultado = filterPokemons(
            TODOS,
            "special",
            "",
            new Set()
        );

        expect(resultado).toHaveLength(1);
        expect(resultado[0]!.name).toBe("mega-rayquaza");
    });

    it("special ignora filtros de generación", () => {
        const resultado = filterPokemons(
            TODOS,
            "special",
            "",
            new Set(),
            "gen1"
        );

        expect(resultado).toHaveLength(1);
    });

    it("combina favourites + búsqueda", () => {

        const favourites = new Set([25]);

        const resultado = filterPokemons(
            TODOS,
            "favourites",
            "pika",
            favourites
        );

        expect(resultado).toHaveLength(1);
    });

    it("favourites + búsqueda sin coincidencias devuelve vacío", () => {

        const favourites = new Set([25]);

        const resultado = filterPokemons(
            TODOS,
            "favourites",
            "char",
            favourites
        );

        expect(resultado).toHaveLength(0);
    });

    it('devuelve array vacío si no hay favourites con filtro "favourites"', () => {
        const resultado = filterPokemons(TODOS, "favourites", "", new Set());
        expect(resultado).toHaveLength(0);
    });

    it("no muta los pokémons originales", () => {

        const original = structuredClone(TODOS);

        filterPokemons(
            TODOS,
            "fire",
            "",
            new Set()
        );

        expect(TODOS).toEqual(original);
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

    it("toggle dos veces devuelve al estado original", () => {

        toggleFavorite(favourites, 25);
        toggleFavorite(favourites, 25);

        expect(favourites.has(25)).toBe(false);
    });

    it("permite ids distintos sin conflicto", () => {

        toggleFavorite(favourites, 25);
        toggleFavorite(favourites, 2500);

        expect(favourites.size).toBe(2);
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

// ─── GENERACIONES ────────────────────────────────────────────────────────────────────

describe("GEN_RANGES", () => {

    it("gen1 tiene rango correcto", () => {
        expect(GEN_RANGES.gen1).toEqual([1, 151]);
    });

    it("gen9 tiene rango correcto", () => {
        expect(GEN_RANGES.gen9).toEqual([906, 1025]);
    });

    it('"all" no tiene rango', () => {
        expect(GEN_RANGES.all).toBeNull();
    });

    it("incluye pokémons en el límite exacto de generación", () => {

        const resultado = filterPokemons(
            TODOS,
            "all",
            "",
            new Set(),
            "gen1"
        );

        expect(resultado.some(p => p.id === 1)).toBe(true);
    });

    it("incluye pokémons en el límite exacto de generación", () => {

        const resultado = filterPokemons(
            TODOS,
            "all",
            "",
            new Set(),
            "gen1"
        );

        expect(resultado.some(p => p.id === 151)).toBe(true);
    });

});

// ─── toPokemonBasic ────────────────────────────────────────────────────────────────────

describe("toPokemonBasic", () => {
  it("mapea correctamente un PokeAPIResponse", () => {
    const input = {
      id: 1,
      name: "bulbasaur",
      weight: 69,
      height: 7,
      sprites: { other: { "official-artwork": { front_default: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png" } } },
      types: [{ type: { name: "grass" } }, { type: { name: "poison" } }],
      stats: [{ base_stat: 45 }, { base_stat: 65 }, { base_stat: 49 }, { base_stat: 49 }, { base_stat: 65 }, { base_stat: 45 }],
    };

    expect(toPokemonBasic(input)).toEqual({
      id: 1,
      name: "bulbasaur",
      types: ["grass", "poison"],
    });
  });
});
