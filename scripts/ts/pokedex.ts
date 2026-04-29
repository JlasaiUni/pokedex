import { type Pokemon, type PokemonBasic, POKEMON_TYPES, type PokemonType, GENERATIONS, type Generation, GEN_RANGES, filterPokemons, toggleFavorite } from "./funciones";

const pokemons: PokemonBasic[] = [];
const favourites: Set<number> = new Set(JSON.parse(localStorage.getItem("favourites") ?? "[]"));
const LOAD_SIZE_POKEMONS = 1118;
const SCROLL_SAVE_THRESHOLD = 10;
const MAX_STAT_LIMIT:number = 255;

const cardHolder = document.getElementById("card_holder") as HTMLElement;
const searchInput = document.getElementById("searchInput") as HTMLInputElement;
const filter_panel = document.getElementById("filter_panel") as HTMLElement;
const filter_button = document.getElementById("filter_button") as HTMLElement;

let activeFilter: PokemonType = (sessionStorage.getItem("activeFilter") ?? "all") as PokemonType;
let activeGeneration: Generation = (sessionStorage.getItem("activeGeneration") ?? "all") as Generation;
let activeSearch: string = sessionStorage.getItem("activeSearch") ?? "";
let isPanelOpen: boolean = false;
let activeTab: "types" | "generations" = "types";
let lastSavedScroll = 0;
searchInput.value = activeSearch;


async function fetchPokemons(): Promise<void> {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/?limit=${LOAD_SIZE_POKEMONS}`);
        const data = await response.json() as { results: { name: string; url: string }[] };

        const LOAD_CHUNK_SIZE = 50;

        for (let i = 0; i < data.results.length; i += LOAD_CHUNK_SIZE) {
            const chunk = data.results.slice(i, i + LOAD_CHUNK_SIZE);

            const promises = chunk.map(p => fetch(p.url).then(res => res.json()));
            const results: any[] = await Promise.all(promises);

            const basicPokemons: PokemonBasic[] = results.map(p => ({
                id: p.id,
                name: p.name,
                types: p.types.map((t: any) => t.type.name),
            }));

            pokemons.push(...basicPokemons);
        }

        applyFilters();
        restoreScroll();

    } catch (error) {
        createErrorCard(error);
    }
}

async function fetchPokemonDetails(id: number, card: HTMLElement): Promise<void> {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const p = await response.json();

        const details: Pokemon = {
            id: p.id,
            name: p.name,
            weight: p.weight,
            height: p.height,
            image: p.sprites.other["official-artwork"].front_default,
            types: p.types.map((t: any) => t.type.name),
            stats: {
                hp:             p.stats[0].base_stat,
                attack:         p.stats[1].base_stat,
                defense:        p.stats[2].base_stat,
                specialAttack:  p.stats[3].base_stat,
                specialDefense: p.stats[4].base_stat,
                speed:          p.stats[5].base_stat,
            }
        };

        fillCard(card, details);

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
    weight.textContent = `${pokemon.weight / 10} kg`;
    height.textContent = `${pokemon.height / 10} m`;

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
    sessionStorage.setItem("activeFilter", activeFilter);
    sessionStorage.setItem("activeGeneration", activeGeneration);
    sessionStorage.setItem("activeSearch", activeSearch);
    const result = filterPokemons(pokemons, activeFilter, activeSearch, favourites, activeGeneration);
    loadPokemons(result, activeSearch || activeFilter);
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

function createPokemonCard(pokemon: PokemonBasic): HTMLAnchorElement {
    const card = document.createElement("a");
    card.classList.add("card_link");
    card.href = "cardDetallado.html?id=" + pokemon.id;

    card.innerHTML = `
        <article class="card" data-id="${pokemon.id}">
            <header class="card_header">
                <p class="card_name"><strong>${pokemon.name}</strong></p>
                <p class="card_number"><strong>#${String(pokemon.id).padStart(3, '0')}</strong></p>
            </header>

            <section class="card_main">
                <button class="fav_btn ${favourites.has(pokemon.id) ? 'fav_activo' : ''}" data-id="${pokemon.id}"></button>

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

    const article = card.querySelector("article") as HTMLElement;
    detailsObserver.observe(article);

    //Click estrella fav
    const favBtn = card.querySelector(".fav_btn") as HTMLButtonElement;
    favBtn.addEventListener("click", (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const id = parseInt(favBtn.dataset["id"] ?? "0");
        const { isFavourite } = toggleFavorite(favourites, id);
        favBtn.classList.toggle("fav_activo", isFavourite);
        localStorage.setItem("favourites", JSON.stringify([...favourites]));
        if (activeFilter === "favourites") applyFilters();
    });

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