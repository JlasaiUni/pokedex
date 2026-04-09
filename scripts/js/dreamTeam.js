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
    height: p.height,
    image: p.sprites.other["official-artwork"].front_default,
    imageSmall: p.sprites.front_default,
    types: p.types.map((t) => t.type.name)
  }));
  pokemonsResults.sort((a, b) => b.height - a.height);
  const layoutOrder = [0, 2, 4, 5, 3, 1];
  const orderedTeam = layoutOrder.map((i) => pokemonsResults[i]);
  pokemons.push(...orderedTeam);
  loadPokemons(pokemons);
}
function loadPokemons(pokemons2) {
  dreamTeamMain.innerHTML = "";
  dreamTeamHolderSmall.innerHTML = "";
  if (pokemons2.length > 0) {
    const main = document.createDocumentFragment();
    const small = document.createDocumentFragment();
    pokemons2.forEach((pokemon) => {
      const card = createDreamTeamImg(pokemon);
      const cardSmall = createdreamTeamSmallImg(pokemon);
      main.appendChild(card);
      small.appendChild(cardSmall);
    });
    dreamTeamHolder.style.background = getBackgroundFromTeam(pokemons2);
    dreamTeamMain.appendChild(main);
    dreamTeamHolderSmall.appendChild(small);
  }
}
function getColorFromType(type) {
  const temp = document.createElement("div");
  temp.className = `type_${type}`;
  document.body.appendChild(temp);
  const color = getComputedStyle(temp).getPropertyValue("--type-color");
  document.body.removeChild(temp);
  return color.trim();
}
function getBackgroundFromTeam(pokemons2) {
  const colors = [];
  pokemons2.forEach((pokemon) => {
    const type = pokemon.types?.[0];
    if (type) {
      colors.push(getColorFromType(type));
    }
  });
  return `linear-gradient(45deg, ${colors.join(", ")})`;
}
function createDreamTeamImg(pokemon) {
  const card = document.createElement("div");
  const img = document.createElement("img");
  const sizeMultiplier = Math.min(pokemon.height / 10, 3);
  img.src = pokemon.image;
  img.alt = `foto de ${pokemon.name}`;
  img.style.width = `calc(8em * ${sizeMultiplier})`;
  img.style.height = `calc(8em * ${sizeMultiplier})`;
  img.style.zIndex = String(Math.floor(100 - sizeMultiplier));
  card.appendChild(img);
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
