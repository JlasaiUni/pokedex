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

export const TIPOS = ["all","favoritos","normal","fire","water","electric","grass","ice",
               "fighting","poison","ground","flying","psychic","bug",
               "rock","ghost","dragon","dark","steel","fairy"] as const;    

export type Tipo = typeof TIPOS[number];

export const maxStatLimit = 255; //maximo valor de los stats base de los pokemons

export function filtrarPokemons(pokemons: Pokemon[], filtroActivo: Tipo, busquedaActiva: string, favoritos: Set<number>) {
    let resultado = pokemons;

    if (filtroActivo === "favoritos") {
        resultado = resultado.filter(p => favoritos.has(p.id));
    } else if (filtroActivo !== "all") {
        resultado = resultado.filter(p => p.types.includes(filtroActivo));
    }

    if (busquedaActiva !== "") {
        resultado = resultado.filter(p => p.name.includes(busquedaActiva));
    }

    return resultado;
}

export function toggleFavorito(favoritos: Set<number>, id: number) {
    if (favoritos.has(id)) {
        favoritos.delete(id);
        return { favoritos, esFavorito: false };
    } else {
        favoritos.add(id);
        return { favoritos, esFavorito: true };
    }
}
