interface Pokemon {
    id: number;
    name: string;
    weight: number;
    height: number;
    image: string;
    types: string[];
    stats: {
        hp: number;
        attack: number;
        defense: number;
        specialAttack: number;
        specialDefense: number;
        speed: number;
    };
};

const TIPOS = ["all","favoritos","normal","fire","water","electric","grass","ice",
               "fighting","poison","ground","flying","psychic","bug",
               "rock","ghost","dragon","dark","steel","fairy"] as const;

type Tipo = typeof TIPOS[number];

const pokemons: Pokemon[] = [];
const favoritos: Set<number> = new Set(JSON.parse(localStorage.getItem("favoritos") ?? "[]"));
const loadSizePokemon = 1118;

let filtroActivo: Tipo = "all";
let busquedaActiva: string = "";
let panelVisible: boolean = false;

const cardHolder = document.getElementById("card_holder") as HTMLElement;
const buscador = document.getElementById("buscador") as HTMLInputElement;
const form = document.getElementById("form-busqueda") as HTMLFormElement;
const panelFiltros = document.getElementById("panelFiltros") as HTMLElement;
const filtroBtn = document.getElementById("filtroBtn") as HTMLElement;

const maxStatLimit = 255; //maximo valor de los stats base de los pokemons

async function fetchPokemons(): Promise<void> {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/?limit=${loadSizePokemon}`);
        const data = await response.json() as { results: { name: string; url: string }[] };

        const chunkSize = 50;

        for (let i = 0; i < data.results.length; i += chunkSize) {
            const chunk = data.results.slice(i, i + chunkSize);

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
    } catch (error) {
        createErrorCard(error);
    }
}

function aplicarFiltros(): void {
    let resultado = pokemons;

    if (filtroActivo === "favoritos") {
        resultado = resultado.filter(p => favoritos.has(p.id));
    } else if (filtroActivo !== "all") {
        resultado = resultado.filter(p => p.types.includes(filtroActivo));
    }

    if (busquedaActiva !== "") {
        resultado = resultado.filter(p => p.name.includes(busquedaActiva));
    }

    loadPokemons(resultado, busquedaActiva || filtroActivo);
}

//Crear botones de filtros y cambiar estado de activo / inactivo
function renderPanelFiltros(): void {
    panelFiltros.innerHTML = TIPOS.map(tipo => `
        <button class="filtro ${tipo} ${tipo === filtroActivo ? 'filtro_activo' : ''}">${tipo}</button>
    `).join("");
}

function abrirPanel(): void {
    renderPanelFiltros();
    panelFiltros.classList.add("visible");
    panelVisible = true;
}

function cerrarPanel(): void {
    panelFiltros.classList.remove("visible");
    panelVisible = false;
}

//Abrir panel de filtros
filtroBtn.addEventListener("click", (e: MouseEvent) => {
    e.stopPropagation();
    panelVisible ? cerrarPanel() : abrirPanel();
});

//click al boton de un filtro 
panelFiltros.addEventListener("click", (e: MouseEvent) => {
    const target = e.target as HTMLElement;

    if (target.classList.contains("filtro")) {
        filtroActivo = (target.textContent ?? "all") as Tipo;
        aplicarFiltros();
        cerrarPanel();
    }
});

//cerrar panel de filtros al clickar fuera
document.addEventListener("click", (e: MouseEvent) => {
    if (!filtroBtn.contains(e.target as Node) &&
        !panelFiltros.contains(e.target as Node)) {
        cerrarPanel();
    }
});

//Buscador
form.addEventListener("submit", (event: Event) => { 
    event.preventDefault();
    busquedaActiva = buscador.value.toLowerCase();
    aplicarFiltros();
});

//Crear Card
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
                <button class="fav_btn ${favoritos.has(pokemon.id) ? 'fav_activo' : ''}" data-id="${pokemon.id}"></button>

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
                        <div class="progress"><div class="progress_bar" style="width: ${(pokemon.stats.hp / maxStatLimit) * 100}%"></div></div>
                    </div>
                    <div class="ATK">
                        <p class="stat_title">ATK</p>
                        <p class="stat_num">${pokemon.stats.attack}</p>
                        <div class="progress"><div class="progress_bar" style="width: ${(pokemon.stats.attack / maxStatLimit) * 100}%"></div></div>
                    </div>
                    <div class="DEF">
                        <p class="stat_title">DEF</p>
                        <p class="stat_num">${pokemon.stats.defense}</p>
                        <div class="progress"><div class="progress_bar" style="width: ${(pokemon.stats.defense / maxStatLimit) * 100}%"></div></div>
                    </div>
                    <div class="SAT">
                        <p class="stat_title">SAT</p>
                        <p class="stat_num">${pokemon.stats.specialAttack}</p>
                        <div class="progress"><div class="progress_bar" style="width: ${(pokemon.stats.specialAttack / maxStatLimit) * 100}%"></div></div>
                    </div>
                    <div class="SDF">
                        <p class="stat_title">SDF</p>
                        <p class="stat_num">${pokemon.stats.specialDefense}</p>
                        <div class="progress"><div class="progress_bar" style="width: ${(pokemon.stats.specialDefense / maxStatLimit) * 100}%"></div></div>
                    </div>
                    <div class="SPD">
                        <p class="stat_title">SPD</p>
                        <p class="stat_num">${pokemon.stats.speed}</p>
                        <div class="progress"><div class="progress_bar" style="width: ${(pokemon.stats.speed / maxStatLimit) * 100}%"></div></div>
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
        if (favoritos.has(id)) {
            favoritos.delete(id);
            favBtn.classList.remove("fav_activo");
        } else {
            favoritos.add(id);
            favBtn.classList.add("fav_activo");
        }
        localStorage.setItem("favoritos", JSON.stringify([...favoritos]));
        if (filtroActivo === "favoritos") aplicarFiltros();
    });

    return card;
}

//Llamada para crear ciertos pokemons
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

//Fallo del buscador
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

fetchPokemons();