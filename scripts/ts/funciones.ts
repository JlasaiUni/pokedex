export interface Pokemon {
    id: number;
    name: string;
    weight: number;
    height: number;
    image: string;
    types: string[];
    stats: {
        hp: number;
        attack: number;
        defense: number;
        specialAttack: number;
        specialDefense: number;
        speed: number;
    };
}

export const POKEMON_TYPES = ["all","favourites","normal","fire","water","electric","grass","ice",
               "fighting","poison","ground","flying","psychic","bug",
               "rock","ghost","dragon","dark","steel","fairy", "special"] as const;

export type PokemonType = typeof POKEMON_TYPES[number];

export const GENERATIONS = ["all","gen1","gen2","gen3","gen4","gen5","gen6","gen7","gen8","gen9"] as const;

export type Generation = typeof GENERATIONS[number];

export const GEN_RANGES: Record<Generation, [number, number] | null> = {
    all:  null,
    gen1: [1,   151],
    gen2: [152, 251],
    gen3: [252, 386],
    gen4: [387, 493],
    gen5: [494, 649],
    gen6: [650, 721],
    gen7: [722, 809],
    gen8: [810, 905],
    gen9: [906, 1025],
};

export const MAX_STAT_LIMIT:number = 255;
const SPECIAL_POKEMON_THRESHOLD:number = 10000;

export function filterPokemons(pokemons: Pokemon[], activeFilter: PokemonType, activeSearch: string, favourites: Set<number>, activeGeneration: Generation = "all"): Pokemon[] {
    let result = pokemons;

    if (activeFilter === "favourites") {
        result = result.filter(p => favourites.has(p.id));
    } else if (activeFilter === "special") {
        result = result.filter(p => (p.id >= SPECIAL_POKEMON_THRESHOLD));
    }else if (activeFilter !== "all") {
        result = result.filter(p => p.types.includes(activeFilter));
    }

    const rango = GEN_RANGES[activeGeneration];
    if (rango !== null && activeFilter !== "special") {
        result = result.filter(p => p.id >= rango[0] && p.id <= rango[1]);
    }

    if (activeSearch) {
        result = result.filter(p => p.name.includes(activeSearch));
    }

    return result;
}

export function toggleFavorite(favourites: Set<number>, id: number) {
    if (favourites.has(id)) {
        favourites.delete(id);
        return { favourites, isFavourite: false };
    } else {
        favourites.add(id);
        return { favourites, isFavourite: true };
    }
}