import { type Pokemon, type PokemonBasic, POKEMON_TYPES, type PokemonType, GENERATIONS, type Generation, GEN_RANGES, filterPokemons, toggleFavorite, type PokeAPIResponse, toPokemonBasic} from "./funciones";

const pokemons: PokemonBasic[] = [];
const favourites: Set<number> = new Set(JSON.parse(localStorage.getItem("favourites") ?? "[]"));
const pokemonDetailsCache: Map<number, Pokemon> = new Map();
const pokemonCards = new Map<number, HTMLAnchorElement>();
const TOTAL_POKEMONS = 1118;
const SCROLL_SAVE_THRESHOLD = 5;
const ID_PAD_LENGTH = 3;
const WEIGHT_DIVISOR = 10;  // hectogramos -> kg
const HEIGHT_DIVISOR = 10;  // decimetros -> m
const MAX_STAT_LIMIT = 255;
const INITIAL_FAKE_CARDS = 0; // esto esta a 0 porque no hace falta y no funciona bien con appendPokemonCards
const SPACER_ID = "scroll_spacer";

const cardHolder = document.getElementById("card_holder") as HTMLElement;
const searchInput = document.getElementById("searchInput") as HTMLInputElement;
const filterPanel = document.getElementById("filter_panel") as HTMLElement;
const filterButton = document.getElementById("filter_button") as HTMLElement;
const progressBar = document.getElementById("progress_bar_carga") as HTMLElement;

let activeFilter: PokemonType = (sessionStorage.getItem("activeFilter") ?? "all") as PokemonType;
let activeGeneration: Generation = (sessionStorage.getItem("activeGeneration") ?? "all") as Generation;
let activeSearch: string = sessionStorage.getItem("activeSearch") ?? "";
let isPanelOpen: boolean = false;
let activeTab: "types" | "generations" = "types";
let lastSavedScroll = 0;
let isInitialLoading = true;
let loadedPokemons = 0;
searchInput.value = activeSearch;


async function fetchPokemonList(): Promise<{ name: string; url: string }[]> {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/?limit=${TOTAL_POKEMONS}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json() as { results: { name: string; url: string }[] };
    return data.results;
}

async function fetchChunk(entries: { name: string; url: string }[]): Promise<PokemonBasic[]> {
    const responses: PokeAPIResponse[] = await Promise.all(
        entries.map(e => fetch(e.url).then(r => r.json()))
    );
    return responses.map(toPokemonBasic);
}

async function fetchAllPokemons(onChunkLoaded: (chunk: PokemonBasic[]) => void): Promise<void> {
    const CHUNK_SIZE = 100;
    const list = await fetchPokemonList();

    for (let i = 0; i < list.length; i += CHUNK_SIZE) {
        const chunk = await fetchChunk(list.slice(i, i + CHUNK_SIZE));
        onChunkLoaded(chunk);
    }
}

async function initPokemons(): Promise<void> {
    addScrollSpacer();
    restoreScroll();
    try {
        await fetchAllPokemons((chunk) => {
            pokemons.push(...chunk); 
            appendPokemonCards(chunk);
            updateProgressBar(chunk.length);
        });
        isInitialLoading = false;
        removeScrollSpacer();

    } catch (error) {
        createErrorCard(error);
    }
}

function appendPokemonCards(newPokemons: PokemonBasic[]): void {
    const fragment = document.createDocumentFragment();

    newPokemons.forEach(pokemon => {
        const card = createPokemonCard(pokemon);
        pokemonCards.set(pokemon.id, card);

        const visible = filterPokemons(
            [pokemon],
            activeFilter,
            activeSearch,
            favourites,
            activeGeneration
        ).length > 0;

        card.style.display = visible ? "" : "none";
        fragment.appendChild(card);
    });

    cardHolder.appendChild(fragment);
}

function updateProgressBar(chunkSize: number): void {
    loadedPokemons += chunkSize;
    const percent = Math.min((loadedPokemons / TOTAL_POKEMONS) * 100, 100); //math min para evitar que pase de 100% 
    progressBar.style.width = `${percent}%`;

    if (percent >= 100) {
        setTimeout(() => {
            progressBar.style.opacity = "0";
            progressBar.style.transition = "width 0.3s ease, opacity 0.5s ease";
        }, 300);
    }
}

async function fetchPokemonDetails(id: number, card: HTMLElement): Promise<void> {
    const cachedPokemon = pokemonDetailsCache.get(id);

    if (cachedPokemon) {
        fillCard(card, cachedPokemon);
        return;
    }

    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const p = await response.json() as PokeAPIResponse;

        const details: Pokemon = {
            id: p.id,
            name: p.name,
            weight: p.weight,
            height: p.height,
            image: p.sprites.other["official-artwork"].front_default,
            types: p.types.map((t: PokeAPIResponse["types"][number]) => t.type.name),
            stats: {
                hp:             p.stats[0]?.base_stat || 0,
                attack:         p.stats[1]?.base_stat || 0,
                defense:        p.stats[2]?.base_stat || 0,
                specialAttack:  p.stats[3]?.base_stat || 0,
                specialDefense: p.stats[4]?.base_stat || 0,
                speed:          p.stats[5]?.base_stat || 0,
            }
        };

        fillCard(card, details);
        pokemonDetailsCache.set(id, details);
    } catch (error) {
        console.error(`Error loading details for pokemon ${id}`, error);
    }
}

function fillCard(card: HTMLElement, pokemon: Pokemon): void {
    const img = card.querySelector(".img_pokemon") as HTMLImageElement;
    const weight = card.querySelector(".weight") as HTMLElement;
    const height = card.querySelector(".height") as HTMLElement;

    const statBars = card.querySelectorAll(".progress_bar");
    const statNums = card.querySelectorAll(".stat_num");

    const stats = [
        pokemon.stats.hp,
        pokemon.stats.attack,
        pokemon.stats.defense,
        pokemon.stats.specialAttack,
        pokemon.stats.specialDefense,
        pokemon.stats.speed,
    ];

    img.src = pokemon.image;
    weight.textContent = `${pokemon.weight / WEIGHT_DIVISOR} kg`;
    height.textContent = `${pokemon.height / HEIGHT_DIVISOR} m`;

    stats.forEach((val, i) => {
        (statNums[i] as HTMLElement).textContent = String(val);
        (statBars[i] as HTMLElement).style.width = `${(val / MAX_STAT_LIMIT) * 100}%`;
    });
}

const detailsObserver = new IntersectionObserver((entries) => {  //Para detectar que card esta en pantalla (y fetchear los detalles/foto)
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const card = entry.target as HTMLElement;
            const id = parseInt(card.dataset["id"]!);
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

function restoreScroll(): void {
    const savedScroll = sessionStorage.getItem("scrollPos");
    if (savedScroll !== null) {
        window.scrollTo({ top: parseInt(savedScroll), behavior: "instant" });
    }
}

function addScrollSpacer(): void {
    const savedScroll = sessionStorage.getItem("scrollPos");
    if (!savedScroll) return;

    const spacer = document.createElement("div");
    spacer.id = SPACER_ID;
    spacer.style.height = `${parseInt(savedScroll) + window.innerHeight}px`;
    spacer.style.pointerEvents = "none";
    cardHolder.appendChild(spacer);
}

function removeScrollSpacer(): void {
    document.getElementById(SPACER_ID)?.remove();
}

function renderPanelFiltros(): void {
    filterPanel.innerHTML = `
        <div id="panel_tabs">
            <button class="panel_tab ${activeTab === 'types' ? 'panel_tab_activo' : ''}" data-tab="types">Types</button>
            <button class="panel_tab ${activeTab === 'generations' ? 'panel_tab_activo' : ''}" data-tab="generations">Gen</button>
        </div>
        <div id="panel_content">
            ${activeTab === 'types'
                ? POKEMON_TYPES.map(type => `
                    <button class="filter_type ${type} ${type === activeFilter ? 'filter_activo' : ''}" data-type="${type}">${type}</button>
                  `).join("")
                : GENERATIONS.map(gen => `
                    <button class="filter_gen ${gen === activeGeneration ? 'filter_activo' : ''}" data-gen="${gen}">${gen.toUpperCase()}</button>
                  `).join("")
            }
        </div>
    `;
}

function openPanel(): void {
    renderPanelFiltros();
    filterPanel.classList.add("visible");
    isPanelOpen = true;
}

function closePanel(): void {
    filterPanel.classList.remove("visible");
    isPanelOpen = false;
}

//Boton panel de filters
filterButton.addEventListener("click", (e: MouseEvent) => {
    e.stopPropagation();
    isPanelOpen ? closePanel() : openPanel();
});

//click al boton de un filter 
filterPanel.addEventListener("click", (e: MouseEvent) => {
    const target = e.target as HTMLElement;

    if (target.classList.contains("panel_tab")) {
        activeTab = target.dataset["tab"] as "types" | "generations";
        renderPanelFiltros();
        return;
    }

    if (target.classList.contains("filter_type")) {
        activeFilter = (target.dataset["type"] ?? "all") as PokemonType;
        applyFilters();
        closePanel();
    }

    if (target.classList.contains("filter_gen")) {
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

    sessionStorage.setItem("activeFilter", activeFilter);
    sessionStorage.setItem("activeGeneration", activeGeneration);
    sessionStorage.setItem("activeSearch", activeSearch);

    const filtered = new Set(
        filterPokemons(
            pokemons,
            activeFilter,
            activeSearch,
            favourites,
            activeGeneration
        ).map(p => p.id)
    );

    pokemonCards.forEach((card, id) => {

        card.style.display = filtered.has(id)
            ? ""
            : "none";
    });

    if (filtered.size === 0 && !isInitialLoading) {
        createMissingCard(activeSearch || activeFilter);
    } else {
        removeMissingCard();
    }
}

function removeMissingCard(): void {

    const missing = cardHolder.querySelector(".card_missing");

    if (missing) {
        missing.remove();
    }
}

function loadPokemons(pokemons: PokemonBasic[], msg?: string): void {
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

function buildCardHTML(pokemon: PokemonBasic, isFavourite: boolean): string {
    return `
        <article class="card" data-id="${pokemon.id}">
            <header class="card_header">
                <p class="card_name"><strong>${pokemon.name}</strong></p>
                <p class="card_number"><strong>#${String(pokemon.id).padStart(ID_PAD_LENGTH, '0')}</strong></p>
            </header>

            <section class="card_main">
                <button class="fav_btn ${isFavourite ? 'fav_activo' : ''}" data-id="${pokemon.id}"></button>

                <img class="img_pokemon" src="" alt="foto de ${pokemon.name}">

                <div class="type_holder">
                    ${pokemon.types.map(t => `<p class="type type_${t}">${t}</p>`).join("")}
                </div>

                <div class="characteristics_holder">
                    <p class="weight">...</p>
                    <div class="separation_line"></div>
                    <p class="height">...</p>
                </div>

                <div class="stats_holder">
                    ${["HP","ATK","DEF","SAT","SDF","SPD"].map(stat => `
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
}

function setupFavButton(card: HTMLAnchorElement, pokemon: PokemonBasic): void {
    const favBtn = card.querySelector(".fav_btn") as HTMLButtonElement;

    favBtn.addEventListener("click", (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const isFavourite = toggleFavorite(favourites, pokemon.id);
        favBtn.classList.toggle("fav_activo", isFavourite);
        localStorage.setItem("favourites", JSON.stringify([...favourites]));

        if (activeFilter === "favourites") applyFilters();
    });
}

function setupLazyLoad(card: HTMLAnchorElement): void {
    const article = card.querySelector("article") as HTMLElement;
    detailsObserver.observe(article);
}

function createPokemonCard(pokemon: PokemonBasic): HTMLAnchorElement {
    const card = document.createElement("a");
    card.classList.add("card_link");
    card.href = `cardDetallado.html?id=${pokemon.id}`;
    card.innerHTML = buildCardHTML(pokemon, favourites.has(pokemon.id));

    setupFavButton(card, pokemon);
    setupLazyLoad(card);

    return card;
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

function createMissingCard(msg?: string): void {
    removeMissingCard();
    const errorCard = document.createElement("div");
    errorCard.classList.add("card_missing");

    errorCard.innerHTML = `
        <img src="../img/PokeNot.png" alt="">
        <p>There is no results for "${msg}".</p>
    `;

    cardHolder.appendChild(errorCard);
}

function createErrorCard(error: unknown): void {
    removeMissingCard();
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
initPokemons();