import { type Pokemon, POKEMON_TYPES, type PokemonType, GENERATIONS, type Generation, GEN_RANGES, MAX_STAT_LIMIT, filterPokemons, toggleFavorite } from "./funciones";

const pokemons: Pokemon[] = [];
const favourites: Set<number> = new Set(JSON.parse(localStorage.getItem("favourites") ?? "[]"));
const LOAD_SIZE_POKEMONS = 1118;
const SCROLL_SAVE_THRESHOLD = 10;

let activeFilter: PokemonType = "all";
let activeGeneration: Generation = "all";
let activeSearch: string = "";
let isPanelOpen: boolean = false;
let activeTab: "types" | "generations" = "types";

const cardHolder = document.getElementById("card_holder") as HTMLElement;
const searchInput = document.getElementById("searchInput") as HTMLInputElement;
const filter_panel = document.getElementById("filter_panel") as HTMLElement;
const filter_button = document.getElementById("filter_button") as HTMLElement;


async function fetchPokemons(): Promise<void> {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/?limit=${LOAD_SIZE_POKEMONS}`);
        const data = await response.json() as { results: { name: string; url: string }[] };

        const LOAD_CHUNK_SIZE = 50;

        for (let i = 0; i < data.results.length; i += LOAD_CHUNK_SIZE) {
            const chunk = data.results.slice(i, i + LOAD_CHUNK_SIZE);

            const promises = chunk.map(p =>
                fetch(p.url).then(res => res.json())
            );

            const results: any[] = await Promise.all(promises);

            const pokemonsResults: Pokemon[] = results.map(p => ({
                id: p.id,
                name: p.name,
                weight: p.weight,
                height: p.height,
                image: p.sprites.other['official-artwork'].front_default,
                types: p.types.map((t: any) => t.type.name),
                stats: {
                    hp:             p.stats[0].base_stat,
                    attack:         p.stats[1].base_stat,
                    defense:        p.stats[2].base_stat,
                    specialAttack:  p.stats[3].base_stat,
                    specialDefense: p.stats[4].base_stat,
                    speed:          p.stats[5].base_stat,
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

function restoreScroll(): void {
    const savedScroll = sessionStorage.getItem("scrollPos");
    if (savedScroll !== null) {
        window.scrollTo({ top: parseInt(savedScroll), behavior: "instant" });
    }
}

function renderPanelFiltros(): void {
    filter_panel.innerHTML = `
        <div id="panel_tabs">
            <button class="panel_tab ${activeTab === 'types' ? 'panel_tab_activo' : ''}" data-tab="types">Types</button>
            <button class="panel_tab ${activeTab === 'generations' ? 'panel_tab_activo' : ''}" data-tab="generations">Gen</button>
        </div>
        <div id="panel_content">
            ${activeTab === 'types'
                ? POKEMON_TYPES.map(tipo => `
                    <button class="filtro_tipo ${tipo} ${tipo === activeFilter ? 'filtro_activo' : ''}" data-tipo="${tipo}">${tipo}</button>
                  `).join("")
                : GENERATIONS.map(gen => `
                    <button class="filtro_gen ${gen === activeGeneration ? 'filtro_activo' : ''}" data-gen="${gen}">${gen.toUpperCase()}</button>
                  `).join("")
            }
        </div>
    `;
}

function openPanel(): void {
    renderPanelFiltros();
    filter_panel.classList.add("visible");
    isPanelOpen = true;
}

function closePanel(): void {
    filter_panel.classList.remove("visible");
    isPanelOpen = false;
}

//Boton panel de filtros
filter_button.addEventListener("click", (e: MouseEvent) => {
    e.stopPropagation();
    isPanelOpen ? closePanel() : openPanel();
});

//click al boton de un filtro 
filter_panel.addEventListener("click", (e: MouseEvent) => {
    const target = e.target as HTMLElement;

    if (target.classList.contains("panel_tab")) {
        activeTab = target.dataset["tab"] as "types" | "generations";
        renderPanelFiltros();
        return;
    }

    if (target.classList.contains("filtro_tipo")) {
        activeFilter = (target.dataset["tipo"] ?? "all") as PokemonType;
        applyFilters();
        closePanel();
    }

    if (target.classList.contains("filtro_gen")) {
        activeGeneration = (target.dataset["gen"] ?? "all") as Generation;
        applyFilters();
        closePanel();
    }
});

//searchInput
searchInput.addEventListener("input", (event: Event) => { 
    event.preventDefault();
    activeSearch = searchInput.value.toLowerCase();
    applyFilters();
});

function applyFilters(): void {
    const resultado = filterPokemons(pokemons, activeFilter, activeSearch, favourites, activeGeneration);
    loadPokemons(resultado, activeSearch || activeFilter);
}

function createPokemonCard(pokemon: Pokemon): HTMLAnchorElement {
    const card = document.createElement("a");

    card.classList.add("card_link");
    card.href = "cardDetallado.html?id=" + pokemon.id;

    card.innerHTML = `
        <article class="card">
            <header class="card_header">
                <p class="card_name"><strong>${pokemon.name}</strong></p>
                <p class="card_number"><strong>#${String(pokemon.id).padStart(3, '0')}</strong></p>
            </header>

            <section class="card_main">
                <button class="fav_btn ${favourites.has(pokemon.id) ? 'fav_activo' : ''}" data-id="${pokemon.id}"></button>

                <img class="img_pokemon"
                     src="${pokemon.image}"
                     alt="foto de ${pokemon.name}">

                <div class="type_holder">
                    ${pokemon.types.map(t => `<p class="type type_${t}">${t}</p>`).join("")}
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
                        <div class="progress"><div class="progress_bar" style="width: ${(pokemon.stats.hp / MAX_STAT_LIMIT) * 100}%"></div></div>
                    </div>
                    <div class="ATK">
                        <p class="stat_title">ATK</p>
                        <p class="stat_num">${pokemon.stats.attack}</p>
                        <div class="progress"><div class="progress_bar" style="width: ${(pokemon.stats.attack / MAX_STAT_LIMIT) * 100}%"></div></div>
                    </div>
                    <div class="DEF">
                        <p class="stat_title">DEF</p>
                        <p class="stat_num">${pokemon.stats.defense}</p>
                        <div class="progress"><div class="progress_bar" style="width: ${(pokemon.stats.defense / MAX_STAT_LIMIT) * 100}%"></div></div>
                    </div>
                    <div class="SAT">
                        <p class="stat_title">SAT</p>
                        <p class="stat_num">${pokemon.stats.specialAttack}</p>
                        <div class="progress"><div class="progress_bar" style="width: ${(pokemon.stats.specialAttack / MAX_STAT_LIMIT) * 100}%"></div></div>
                    </div>
                    <div class="SDF">
                        <p class="stat_title">SDF</p>
                        <p class="stat_num">${pokemon.stats.specialDefense}</p>
                        <div class="progress"><div class="progress_bar" style="width: ${(pokemon.stats.specialDefense / MAX_STAT_LIMIT) * 100}%"></div></div>
                    </div>
                    <div class="SPD">
                        <p class="stat_title">SPD</p>
                        <p class="stat_num">${pokemon.stats.speed}</p>
                        <div class="progress"><div class="progress_bar" style="width: ${(pokemon.stats.speed / MAX_STAT_LIMIT) * 100}%"></div></div>
                    </div>
                </div>
            </section>
        </article>
    `;

    //Click estrella fav
    const favBtn = card.querySelector(".fav_btn") as HTMLButtonElement;
    favBtn.addEventListener("click", (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const id = parseInt(favBtn.dataset["id"] ?? "0");

        const {isFavourite} = toggleFavorite(favourites, id);
        favBtn.classList.toggle("fav_activo", isFavourite);

        localStorage.setItem("favourites", JSON.stringify([...favourites]));
        if (activeFilter === "favourites") applyFilters();
    });

    return card;
}

let lastSavedScroll = 0;

window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY;
    if (scrollTop - lastSavedScroll >= SCROLL_SAVE_THRESHOLD || lastSavedScroll - scrollTop >= SCROLL_SAVE_THRESHOLD) {
        lastSavedScroll = scrollTop;
        sessionStorage.setItem("scrollPos", String(Math.floor(scrollTop)));
    }
});


function loadPokemons(pokemons: Pokemon[], msg?: string): void {
    cardHolder.innerHTML = "";

    if (pokemons.length > 0) {
        const cards = document.createDocumentFragment();

        pokemons.forEach(pokemon => {
            const card = createPokemonCard(pokemon);
            cards.appendChild(card);
        });

        cardHolder.appendChild(cards);
    } else {
        createMissingCard(msg);
    }
}


function createFakeCard(amount: number): void {
    cardHolder.innerHTML = "";
    const cards = document.createDocumentFragment();

    for (let i = 0; i < amount; i++) {
        const card = document.createElement("div");

        card.classList.add("card_fake");
        card.innerHTML = `
            <section class="card_fake_main"><img src="../img/Pokeball.png" alt=""></section>
        `;

        cards.appendChild(card);
    }

    cardHolder.appendChild(cards);
}

//Fallo del searchInput
function createMissingCard(msg?: string): void {
    const errorCard = document.createElement("div");
    errorCard.classList.add("card_missing");

    errorCard.innerHTML = `
        <img src="../img/PokeNot.png" alt="">
        <p>There is no results for "${msg}".</p>
    `;

    cardHolder.appendChild(errorCard);
}

//Error de la API
function createErrorCard(error: unknown): void {
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