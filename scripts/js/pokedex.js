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
var MAX_STAT_LIMIT = 255;
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

// scripts/ts/pokedex.ts
var pokemons = [];
var favourites = new Set(JSON.parse(localStorage.getItem("favourites") ?? "[]"));
var LOAD_SIZE_POKEMONS = 1118;
var SCROLL_SAVE_THRESHOLD = 10;
var activeFilter = "all";
var activeGeneration = "all";
var activeSearch = "";
var isPanelOpen = false;
var activeTab = "types";
var cardHolder = document.getElementById("card_holder");
var searchInput = document.getElementById("searchInput");
var filter_panel = document.getElementById("filter_panel");
var filter_button = document.getElementById("filter_button");
async function fetchPokemons() {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/?limit=${LOAD_SIZE_POKEMONS}`);
    const data = await response.json();
    const LOAD_CHUNK_SIZE = 50;
    for (let i = 0;i < data.results.length; i += LOAD_CHUNK_SIZE) {
      const chunk = data.results.slice(i, i + LOAD_CHUNK_SIZE);
      const promises = chunk.map((p) => fetch(p.url).then((res) => res.json()));
      const results = await Promise.all(promises);
      const pokemonsResults = results.map((p) => ({
        id: p.id,
        name: p.name,
        weight: p.weight,
        height: p.height,
        image: p.sprites.other["official-artwork"].front_default,
        types: p.types.map((t) => t.type.name),
        stats: {
          hp: p.stats[0].base_stat,
          attack: p.stats[1].base_stat,
          defense: p.stats[2].base_stat,
          specialAttack: p.stats[3].base_stat,
          specialDefense: p.stats[4].base_stat,
          speed: p.stats[5].base_stat
        }
      }));
      pokemons.push(...pokemonsResults);
    }
    loadPokemons(pokemons);
    restoreScroll();
  } catch (error) {
    createErrorCard(error);
  }
}
function restoreScroll() {
  const savedScroll = sessionStorage.getItem("scrollPos");
  if (savedScroll !== null) {
    window.scrollTo({ top: parseInt(savedScroll), behavior: "instant" });
  }
}
function renderPanelFiltros() {
  filter_panel.innerHTML = `
        <div id="panel_tabs">
            <button class="panel_tab ${activeTab === "types" ? "panel_tab_activo" : ""}" data-tab="types">Types</button>
            <button class="panel_tab ${activeTab === "generations" ? "panel_tab_activo" : ""}" data-tab="generations">Gen</button>
        </div>
        <div id="panel_content">
            ${activeTab === "types" ? POKEMON_TYPES.map((tipo) => `
                    <button class="filtro_tipo ${tipo} ${tipo === activeFilter ? "filtro_activo" : ""}" data-tipo="${tipo}">${tipo}</button>
                  `).join("") : GENERATIONS.map((gen) => `
                    <button class="filtro_gen ${gen === activeGeneration ? "filtro_activo" : ""}" data-gen="${gen}">${gen.toUpperCase()}</button>
                  `).join("")}
        </div>
    `;
}
function openPanel() {
  renderPanelFiltros();
  filter_panel.classList.add("visible");
  isPanelOpen = true;
}
function closePanel() {
  filter_panel.classList.remove("visible");
  isPanelOpen = false;
}
filter_button.addEventListener("click", (e) => {
  e.stopPropagation();
  isPanelOpen ? closePanel() : openPanel();
});
filter_panel.addEventListener("click", (e) => {
  const target = e.target;
  if (target.classList.contains("panel_tab")) {
    activeTab = target.dataset["tab"];
    renderPanelFiltros();
    return;
  }
  if (target.classList.contains("filtro_tipo")) {
    activeFilter = target.dataset["tipo"] ?? "all";
    applyFilters();
    closePanel();
  }
  if (target.classList.contains("filtro_gen")) {
    activeGeneration = target.dataset["gen"] ?? "all";
    applyFilters();
    closePanel();
  }
});
searchInput.addEventListener("input", (event) => {
  event.preventDefault();
  activeSearch = searchInput.value.toLowerCase();
  applyFilters();
});
function applyFilters() {
  const resultado = filterPokemons(pokemons, activeFilter, activeSearch, favourites, activeGeneration);
  loadPokemons(resultado, activeSearch || activeFilter);
}
function createPokemonCard(pokemon) {
  const card = document.createElement("a");
  card.classList.add("card_link");
  card.href = "cardDetallado.html?id=" + pokemon.id;
  card.innerHTML = `
        <article class="card">
            <header class="card_header">
                <p class="card_name"><strong>${pokemon.name}</strong></p>
                <p class="card_number"><strong>#${String(pokemon.id).padStart(3, "0")}</strong></p>
            </header>

            <section class="card_main">
                <button class="fav_btn ${favourites.has(pokemon.id) ? "fav_activo" : ""}" data-id="${pokemon.id}"></button>

                <img class="img_pokemon"
                     src="${pokemon.image}"
                     alt="foto de ${pokemon.name}">

                <div class="type_holder">
                    ${pokemon.types.map((t) => `<p class="type type_${t}">${t}</p>`).join("")}
                </div>

                <div class="characteristics_holder">
                    <p class="weight">${pokemon.weight / 10} kg</p>
                    <div class="separation_line"></div>
                    <p class="height">${pokemon.height / 10} m</p>
                </div>

                <div class="stats_holder">
                    <div class="HP">
                        <p class="stat_title">HP</p>
                        <p class="stat_num">${pokemon.stats.hp}</p>
                        <div class="progress"><div class="progress_bar" style="width: ${pokemon.stats.hp / MAX_STAT_LIMIT * 100}%"></div></div>
                    </div>
                    <div class="ATK">
                        <p class="stat_title">ATK</p>
                        <p class="stat_num">${pokemon.stats.attack}</p>
                        <div class="progress"><div class="progress_bar" style="width: ${pokemon.stats.attack / MAX_STAT_LIMIT * 100}%"></div></div>
                    </div>
                    <div class="DEF">
                        <p class="stat_title">DEF</p>
                        <p class="stat_num">${pokemon.stats.defense}</p>
                        <div class="progress"><div class="progress_bar" style="width: ${pokemon.stats.defense / MAX_STAT_LIMIT * 100}%"></div></div>
                    </div>
                    <div class="SAT">
                        <p class="stat_title">SAT</p>
                        <p class="stat_num">${pokemon.stats.specialAttack}</p>
                        <div class="progress"><div class="progress_bar" style="width: ${pokemon.stats.specialAttack / MAX_STAT_LIMIT * 100}%"></div></div>
                    </div>
                    <div class="SDF">
                        <p class="stat_title">SDF</p>
                        <p class="stat_num">${pokemon.stats.specialDefense}</p>
                        <div class="progress"><div class="progress_bar" style="width: ${pokemon.stats.specialDefense / MAX_STAT_LIMIT * 100}%"></div></div>
                    </div>
                    <div class="SPD">
                        <p class="stat_title">SPD</p>
                        <p class="stat_num">${pokemon.stats.speed}</p>
                        <div class="progress"><div class="progress_bar" style="width: ${pokemon.stats.speed / MAX_STAT_LIMIT * 100}%"></div></div>
                    </div>
                </div>
            </section>
        </article>
    `;
  const favBtn = card.querySelector(".fav_btn");
  favBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const id = parseInt(favBtn.dataset["id"] ?? "0");
    const { isFavourite } = toggleFavorite(favourites, id);
    favBtn.classList.toggle("fav_activo", isFavourite);
    localStorage.setItem("favourites", JSON.stringify([...favourites]));
    if (activeFilter === "favourites")
      applyFilters();
  });
  return card;
}
var lastSavedScroll = 0;
window.addEventListener("scroll", () => {
  const scrollTop = window.scrollY;
  if (scrollTop - lastSavedScroll >= SCROLL_SAVE_THRESHOLD || lastSavedScroll - scrollTop >= SCROLL_SAVE_THRESHOLD) {
    lastSavedScroll = scrollTop;
    sessionStorage.setItem("scrollPos", String(Math.floor(scrollTop)));
  }
});
function loadPokemons(pokemons2, msg) {
  cardHolder.innerHTML = "";
  if (pokemons2.length > 0) {
    const cards = document.createDocumentFragment();
    pokemons2.forEach((pokemon) => {
      const card = createPokemonCard(pokemon);
      cards.appendChild(card);
    });
    cardHolder.appendChild(cards);
  } else {
    createMissingCard(msg);
  }
}
function createFakeCard(amount) {
  cardHolder.innerHTML = "";
  const cards = document.createDocumentFragment();
  for (let i = 0;i < amount; i++) {
    const card = document.createElement("div");
    card.classList.add("card_fake");
    card.innerHTML = `
            <section class="card_fake_main"><img src="../img/Pokeball.png" alt=""></section>
        `;
    cards.appendChild(card);
  }
  cardHolder.appendChild(cards);
}
function createMissingCard(msg) {
  const errorCard = document.createElement("div");
  errorCard.classList.add("card_missing");
  errorCard.innerHTML = `
        <img src="../img/PokeNot.png" alt="">
        <p>There is no results for "${msg}".</p>
    `;
  cardHolder.appendChild(errorCard);
}
function createErrorCard(error) {
  const errorCard = document.createElement("div");
  errorCard.classList.add("card_missing");
  cardHolder.innerHTML = "";
  errorCard.innerHTML = `
        <img src="../img/Alert.png" alt="">
        <p>An error occurred getting Pokémons.</p>
        <p>Please, try it later (${error})</p>
    `;
  cardHolder.appendChild(errorCard);
}
createFakeCard(LOAD_SIZE_POKEMONS);
fetchPokemons();
