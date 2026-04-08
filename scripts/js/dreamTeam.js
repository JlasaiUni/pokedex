// scripts/ts/dreamTeam.ts
var pokemons = [];
var favoritos = new Set(JSON.parse(localStorage.getItem("favoritos") ?? "[]"));
var dreamTeamHolder = document.getElementById("dreamTeam_holder");
var dreamTeamMain = document.getElementById("dreamTeam_main");
var dreamTeamHolderSmall = document.getElementById("dreamTeam_holder_small");
async function fetchDreamTeam() {
  const ids = [...favoritos].slice(0, 6);
  if (ids.length === 0) {
    dreamTeamMain.innerHTML = "<p>No tienes favoritos aún.</p>";
    return;
  }
  const promises = ids.map((id) => fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((res) => res.json()));
  const results = await Promise.all(promises);
  const pokemonsResults = results.map((p) => ({
    id: p.id,
    name: p.name,
    image: p.sprites.other["official-artwork"].front_default,
    imageSmall: p.sprites.front_default,
    types: p.types.map((t) => t.type.name)
  }));
  pokemons.push(...pokemonsResults);
  loadPokemons(pokemons);
}
function loadPokemons(pokemons2) {
  dreamTeamMain.innerHTML = "";
  dreamTeamHolderSmall.innerHTML = "";
  if (pokemons2.length > 0) {
    const main = document.createDocumentFragment();
    const small = document.createDocumentFragment();
    pokemons2.forEach((pokemon) => {
      const card = createdreamTeamImg(pokemon);
      const cardSmall = createdreamTeamSmallImg(pokemon);
      main.appendChild(card);
      small.appendChild(cardSmall);
    });
    dreamTeamHolder.style.background = getBackground(pokemons2[0].types[0], pokemons2[2].types[0], pokemons2[5].types[0]);
    dreamTeamMain.appendChild(main);
    dreamTeamHolderSmall.appendChild(small);
  }
}
var coloresTipo = {
  fire: "rgba(255, 80, 0, 0.6)",
  water: "rgba(0, 100, 255, 0.6)",
  grass: "rgba(0, 200, 0, 0.6)",
  electric: "rgba(255, 255, 0, 0.6)",
  psychic: "rgba(255, 0, 150, 0.6)",
  ice: "rgba(0, 255, 255, 0.6)",
  dragon: "rgba(100, 0, 255, 0.6)",
  dark: "rgba(50, 50, 50, 0.6)",
  fairy: "rgba(255, 150, 255, 0.6)",
  normal: "rgba(200, 200, 200, 0.6)"
};
function getBackground(tipo1, tipo2, tipo3) {
  const color1 = coloresTipo[tipo1];
  const color2 = coloresTipo[tipo2];
  const color3 = coloresTipo[tipo3];
  return `linear-gradient(45deg, ${color1}, ${color2}, ${color3})`;
}
function createdreamTeamImg(pokemon) {
  const card = document.createElement("div");
  card.innerHTML = `
        <img src="${pokemon.image}"
            alt="foto de ${pokemon.name}">
    `;
  return card;
}
function createdreamTeamSmallImg(pokemon) {
  const card = document.createElement("div");
  card.innerHTML = `
        <img src="${pokemon.imageSmall}"
            alt="foto de ${pokemon.name}">
    `;
  return card;
}
fetchDreamTeam();
