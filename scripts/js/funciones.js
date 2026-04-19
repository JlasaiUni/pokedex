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
var maxStatLimit = 255;
function filtrarPokemons(pokemons, filtroActivo, busquedaActiva, favoritos) {
  let resultado = pokemons;
  if (filtroActivo === "favoritos") {
    resultado = resultado.filter((p) => favoritos.has(p.id));
  } else if (filtroActivo !== "all") {
    resultado = resultado.filter((p) => p.types.includes(filtroActivo));
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
  TIPOS
};
