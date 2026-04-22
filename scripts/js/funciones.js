// scripts/ts/funciones.ts
var TIPOS = [
  "all",
  "favoritos",
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
  "fairy"
];
var GENERACIONES = ["all", "gen1", "gen2", "gen3", "gen4", "gen5", "gen6", "gen7", "gen8", "gen9"];
var GEN_RANGOS = {
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
var maxStatLimit = 255;
function filtrarPokemons(pokemons, filtroActivo, busquedaActiva, favoritos, generacionActiva = "all") {
  let resultado = pokemons;
  if (filtroActivo === "favoritos") {
    resultado = resultado.filter((p) => favoritos.has(p.id));
  } else if (filtroActivo !== "all") {
    resultado = resultado.filter((p) => p.types.includes(filtroActivo));
  }
  const rango = GEN_RANGOS[generacionActiva];
  if (rango !== null) {
    resultado = resultado.filter((p) => p.id >= rango[0] && p.id <= rango[1]);
  }
  if (busquedaActiva !== "") {
    resultado = resultado.filter((p) => p.name.includes(busquedaActiva));
  }
  return resultado;
}
function toggleFavorito(favoritos, id) {
  if (favoritos.has(id)) {
    favoritos.delete(id);
    return { favoritos, esFavorito: false };
  } else {
    favoritos.add(id);
    return { favoritos, esFavorito: true };
  }
}
export {
  toggleFavorito,
  maxStatLimit,
  filtrarPokemons,
  TIPOS,
  GEN_RANGOS,
  GENERACIONES
};
