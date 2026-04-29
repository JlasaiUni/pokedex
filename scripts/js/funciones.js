// scripts/ts/funciones.ts
var POKEMON_TYPES = [
  "all",
  "favourites",
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
  "special"
];
var GENERATIONS = ["all", "gen1", "gen2", "gen3", "gen4", "gen5", "gen6", "gen7", "gen8", "gen9"];
var GEN_RANGES = {
  all: null,
  gen1: [1, 151],
  gen2: [152, 251],
  gen3: [252, 386],
  gen4: [387, 493],
  gen5: [494, 649],
  gen6: [650, 721],
  gen7: [722, 809],
  gen8: [810, 905],
  gen9: [906, 1025]
};
var SPECIAL_POKEMON_THRESHOLD = 1e4;
function filterPokemons(pokemons, activeFilter, activeSearch, favourites, activeGeneration = "all") {
  let result = pokemons;
  if (activeFilter === "favourites") {
    result = result.filter((p) => favourites.has(p.id));
  } else if (activeFilter === "special") {
    result = result.filter((p) => p.id >= SPECIAL_POKEMON_THRESHOLD);
  } else if (activeFilter !== "all") {
    result = result.filter((p) => p.types.includes(activeFilter));
  }
  const rango = GEN_RANGES[activeGeneration];
  if (rango !== null && activeFilter !== "special") {
    result = result.filter((p) => p.id >= rango[0] && p.id <= rango[1]);
  }
  if (activeSearch) {
    result = result.filter((p) => p.name.includes(activeSearch));
  }
  return result;
}
function toggleFavorite(favourites, id) {
  if (favourites.has(id)) {
    favourites.delete(id);
    return { favourites, isFavourite: false };
  } else {
    favourites.add(id);
    return { favourites, isFavourite: true };
  }
}
export {
  toggleFavorite,
  filterPokemons,
  POKEMON_TYPES,
  GEN_RANGES,
  GENERATIONS
};
