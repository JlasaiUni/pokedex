// scripts/ts/funciones.ts
var SPECIAL_POKEMON_THRESHOLD = 1e4;
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
function filterPokemons(pokemons, activeFilter, activeSearch, favourites, activeGeneration = "all") {
  let result = pokemons;
  if (activeFilter === "favourites") {
    result = result.filter((p) => favourites.has(p.id));
  } else if (activeFilter === "special") {
    result = result.filter((p) => p.id >= SPECIAL_POKEMON_THRESHOLD);
  } else if (activeFilter !== "all") {
    result = result.filter((p) => p.types.includes(activeFilter));
  }
  const range = GEN_RANGES[activeGeneration];
  if (range !== null && activeFilter !== "special") {
    result = result.filter((p) => p.id >= range[0] && p.id <= range[1]);
  }
  if (activeSearch) {
    result = result.filter((p) => p.name.includes(activeSearch));
  }
  return result;
}
function toggleFavorite(favourites, id) {
  if (favourites.has(id)) {
    favourites.delete(id);
    return false;
  } else {
    favourites.add(id);
    return true;
  }
}

// scripts/ts/pokedex.ts
var pokemons = [];
var favourites = new Set(JSON.parse(localStorage.getItem("favourites") ?? "[]"));
var LOAD_SIZE_POKEMONS = 1118;
var SCROLL_SAVE_THRESHOLD = 10;
var ID_PAD_LENGTH = 3;
var WEIGHT_DIVISOR = 10;
var HEIGHT_DIVISOR = 10;
var MAX_STAT_LIMIT = 255;
var INITIAL_FAKE_CARDS = 20;
var cardHolder = document.getElementById("card_holder");
var searchInput = document.getElementById("searchInput");
var filterPanel = document.getElementById("filter_panel");
var filterButton = document.getElementById("filter_button");
var activeFilter = sessionStorage.getItem("activeFilter") ?? "all";
var activeGeneration = sessionStorage.getItem("activeGeneration") ?? "all";
var activeSearch = sessionStorage.getItem("activeSearch") ?? "";
var isPanelOpen = false;
var activeTab = "types";
var lastSavedScroll = 0;
searchInput.value = activeSearch;
async function fetchPokemons() {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/?limit=${LOAD_SIZE_POKEMONS}`);
    const data = await response.json();
    const LOAD_CHUNK_SIZE = 50;
    for (let i = 0;i < data.results.length; i += LOAD_CHUNK_SIZE) {
      const chunk = data.results.slice(i, i + LOAD_CHUNK_SIZE);
      const promises = chunk.map((p) => fetch(p.url).then((res) => res.json()));
      const results = await Promise.all(promises);
      const basicPokemons = results.map((p) => ({
        id: p.id,
        name: p.name,
        types: p.types.map((t) => t.type.name)
      }));
      pokemons.push(...basicPokemons);
    }
    applyFilters();
    restoreScroll();
  } catch (error) {
    createErrorCard(error);
  }
}
async function fetchPokemonDetails(id, card) {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const p = await response.json();
    const details = {
      id: p.id,
      name: p.name,
      weight: p.weight,
      height: p.height,
      image: p.sprites.other["official-artwork"].front_default,
      types: p.types.map((t) => t.type.name),
      stats: {
        hp: p.stats[0]?.base_stat || 0,
        attack: p.stats[1]?.base_stat || 0,
        defense: p.stats[2]?.base_stat || 0,
        specialAttack: p.stats[3]?.base_stat || 0,
        specialDefense: p.stats[4]?.base_stat || 0,
        speed: p.stats[5]?.base_stat || 0
      }
    };
    fillCard(card, details);
  } catch (error) {
    console.error(`Error loading details for pokemon ${id}`, error);
  }
}
function fillCard(card, pokemon) {
  const img = card.querySelector(".img_pokemon");
  const weight = card.querySelector(".weight");
  const height = card.querySelector(".height");
  const statBars = card.querySelectorAll(".progress_bar");
  const statNums = card.querySelectorAll(".stat_num");
  const stats = [
    pokemon.stats.hp,
    pokemon.stats.attack,
    pokemon.stats.defense,
    pokemon.stats.specialAttack,
    pokemon.stats.specialDefense,
    pokemon.stats.speed
  ];
  img.src = pokemon.image;
  weight.textContent = `${pokemon.weight / WEIGHT_DIVISOR} kg`;
  height.textContent = `${pokemon.height / HEIGHT_DIVISOR} m`;
  stats.forEach((val, i) => {
    statNums[i].textContent = String(val);
    statBars[i].style.width = `${val / MAX_STAT_LIMIT * 100}%`;
  });
}
var detailsObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const card = entry.target;
      const id = parseInt(card.dataset["id"]);
      fetchPokemonDetails(id, card);
      detailsObserver.unobserve(card);
    }
  });
}, { rootMargin: "300px" });
window.addEventListener("scroll", () => {
  const scrollTop = window.scrollY;
  if (scrollTop - lastSavedScroll >= SCROLL_SAVE_THRESHOLD || lastSavedScroll - scrollTop >= SCROLL_SAVE_THRESHOLD) {
    lastSavedScroll = scrollTop;
    sessionStorage.setItem("scrollPos", String(Math.floor(scrollTop)));
  }
});
function restoreScroll() {
  const savedScroll = sessionStorage.getItem("scrollPos");
  if (savedScroll !== null) {
    window.scrollTo({ top: parseInt(savedScroll), behavior: "instant" });
  }
}
function renderPanelFiltros() {
  filterPanel.innerHTML = `
        <div id="panel_tabs">
            <button class="panel_tab ${activeTab === "types" ? "panel_tab_activo" : ""}" data-tab="types">Types</button>
            <button class="panel_tab ${activeTab === "generations" ? "panel_tab_activo" : ""}" data-tab="generations">Gen</button>
        </div>
        <div id="panel_content">
            ${activeTab === "types" ? POKEMON_TYPES.map((type) => `
                    <button class="filter_type ${type} ${type === activeFilter ? "filter_activo" : ""}" data-type="${type}">${type}</button>
                  `).join("") : GENERATIONS.map((gen) => `
                    <button class="filter_gen ${gen === activeGeneration ? "filter_activo" : ""}" data-gen="${gen}">${gen.toUpperCase()}</button>
                  `).join("")}
        </div>
    `;
}
function openPanel() {
  renderPanelFiltros();
  filterPanel.classList.add("visible");
  isPanelOpen = true;
}
function closePanel() {
  filterPanel.classList.remove("visible");
  isPanelOpen = false;
}
filterButton.addEventListener("click", (e) => {
  e.stopPropagation();
  isPanelOpen ? closePanel() : openPanel();
});
filterPanel.addEventListener("click", (e) => {
  const target = e.target;
  if (target.classList.contains("panel_tab")) {
    activeTab = target.dataset["tab"];
    renderPanelFiltros();
    return;
  }
  if (target.classList.contains("filter_type")) {
    activeFilter = target.dataset["type"] ?? "all";
    applyFilters();
    closePanel();
  }
  if (target.classList.contains("filter_gen")) {
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
  sessionStorage.setItem("activeFilter", activeFilter);
  sessionStorage.setItem("activeGeneration", activeGeneration);
  sessionStorage.setItem("activeSearch", activeSearch);
  const result = filterPokemons(pokemons, activeFilter, activeSearch, favourites, activeGeneration);
  loadPokemons(result, activeSearch || activeFilter);
}
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
function createPokemonCard(pokemon) {
  const card = document.createElement("a");
  card.classList.add("card_link");
  card.href = "cardDetallado.html?id=" + pokemon.id;
  card.innerHTML = `
        <article class="card" data-id="${pokemon.id}">
            <header class="card_header">
                <p class="card_name"><strong>${pokemon.name}</strong></p>
                <p class="card_number"><strong>#${String(pokemon.id).padStart(ID_PAD_LENGTH, "0")}</strong></p>
            </header>

            <section class="card_main">
                <button class="fav_btn ${favourites.has(pokemon.id) ? "fav_activo" : ""}" data-id="${pokemon.id}"></button>

                <img class="img_pokemon" src="" alt="foto de ${pokemon.name}">

                <div class="type_holder">
                    ${pokemon.types.map((t) => `<p class="type type_${t}">${t}</p>`).join("")}
                </div>

                <div class="characteristics_holder">
                    <p class="weight">...</p>
                    <div class="separation_line"></div>
                    <p class="height">...</p>
                </div>

                <div class="stats_holder">
                    ${["HP", "ATK", "DEF", "SAT", "SDF", "SPD"].map((stat) => `
                        <div class="${stat}">
                            <p class="stat_title">${stat}</p>
                            <p class="stat_num">-</p>
                            <div class="progress"><div class="progress_bar" style="width:0%"></div></div>
                        </div>
                    `).join("")}
                </div>
            </section>
        </article>
    `;
  const article = card.querySelector("article");
  detailsObserver.observe(article);
  const favBtn = card.querySelector(".fav_btn");
  favBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const id = parseInt(favBtn.dataset["id"] ?? "0");
    const isFavourite = toggleFavorite(favourites, id);
    favBtn.classList.toggle("fav_activo", isFavourite);
    localStorage.setItem("favourites", JSON.stringify([...favourites]));
    if (activeFilter === "favourites")
      applyFilters();
  });
  return card;
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
createFakeCard(INITIAL_FAKE_CARDS);
fetchPokemons();
