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

// scripts/ts/pokedex.ts
var pokemons = [];
var favoritos = new Set(JSON.parse(localStorage.getItem("favoritos") ?? "[]"));
var loadSizePokemon = 1118;
var filtroActivo = "all";
var busquedaActiva = "";
var panelVisible = false;
var cardHolder = document.getElementById("card_holder");
var buscador = document.getElementById("buscador");
var form = document.getElementById("form-busqueda");
var panelFiltros = document.getElementById("panelFiltros");
var filtroBtn = document.getElementById("filtroBtn");
var scrollPos = document.scrollingElement;
async function fetchPokemons() {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/?limit=${loadSizePokemon}`);
    const data = await response.json();
    const chunkSize = 50;
    for (let i = 0;i < data.results.length; i += chunkSize) {
      const chunk = data.results.slice(i, i + chunkSize);
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
    const savedScroll = sessionStorage.getItem("scrollPos");
    if (savedScroll) {
      scrollPos.scrollTop = parseInt(savedScroll);
    }
  } catch (error) {
    createErrorCard(error);
  }
}
function aplicarFiltros() {
  const resultado = filtrarPokemons(pokemons, filtroActivo, busquedaActiva, favoritos);
  loadPokemons(resultado, busquedaActiva || filtroActivo);
}
function renderPanelFiltros() {
  panelFiltros.innerHTML = TIPOS.map((tipo) => `
        <button class="filtro ${tipo} ${tipo === filtroActivo ? "filtro_activo" : ""}">${tipo}</button>
    `).join("");
}
function abrirPanel() {
  renderPanelFiltros();
  panelFiltros.classList.add("visible");
  panelVisible = true;
}
function cerrarPanel() {
  panelFiltros.classList.remove("visible");
  panelVisible = false;
}
filtroBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  panelVisible ? cerrarPanel() : abrirPanel();
});
panelFiltros.addEventListener("click", (e) => {
  const target = e.target;
  if (target.classList.contains("filtro")) {
    filtroActivo = target.textContent ?? "all";
    aplicarFiltros();
    cerrarPanel();
  }
});
document.addEventListener("click", (e) => {
  if (!filtroBtn.contains(e.target) && !panelFiltros.contains(e.target)) {
    cerrarPanel();
  }
});
form.addEventListener("submit", (event) => {
  event.preventDefault();
  busquedaActiva = buscador.value.toLowerCase();
  aplicarFiltros();
});
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
                <button class="fav_btn ${favoritos.has(pokemon.id) ? "fav_activo" : ""}" data-id="${pokemon.id}"></button>

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
                        <div class="progress"><div class="progress_bar" style="width: ${pokemon.stats.hp / maxStatLimit * 100}%"></div></div>
                    </div>
                    <div class="ATK">
                        <p class="stat_title">ATK</p>
                        <p class="stat_num">${pokemon.stats.attack}</p>
                        <div class="progress"><div class="progress_bar" style="width: ${pokemon.stats.attack / maxStatLimit * 100}%"></div></div>
                    </div>
                    <div class="DEF">
                        <p class="stat_title">DEF</p>
                        <p class="stat_num">${pokemon.stats.defense}</p>
                        <div class="progress"><div class="progress_bar" style="width: ${pokemon.stats.defense / maxStatLimit * 100}%"></div></div>
                    </div>
                    <div class="SAT">
                        <p class="stat_title">SAT</p>
                        <p class="stat_num">${pokemon.stats.specialAttack}</p>
                        <div class="progress"><div class="progress_bar" style="width: ${pokemon.stats.specialAttack / maxStatLimit * 100}%"></div></div>
                    </div>
                    <div class="SDF">
                        <p class="stat_title">SDF</p>
                        <p class="stat_num">${pokemon.stats.specialDefense}</p>
                        <div class="progress"><div class="progress_bar" style="width: ${pokemon.stats.specialDefense / maxStatLimit * 100}%"></div></div>
                    </div>
                    <div class="SPD">
                        <p class="stat_title">SPD</p>
                        <p class="stat_num">${pokemon.stats.speed}</p>
                        <div class="progress"><div class="progress_bar" style="width: ${pokemon.stats.speed / maxStatLimit * 100}%"></div></div>
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
    if (favoritos.has(id)) {
      favoritos.delete(id);
      favBtn.classList.remove("fav_activo");
    } else {
      favoritos.add(id);
      favBtn.classList.add("fav_activo");
    }
    localStorage.setItem("favoritos", JSON.stringify([...favoritos]));
    if (filtroActivo === "favoritos")
      aplicarFiltros();
  });
  return card;
}
window.addEventListener("scroll", () => {
  sessionStorage.setItem("scrollPos", String(scrollPos.scrollTop));
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
fetchPokemons();
