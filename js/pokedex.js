const pokemons = [];
const loadSizePokemon = 1118; //1118 como mucho

/* async function fetchPokemons() {
    
    try {
        const promises = [];

        for (let i = 1; i <= loadSizePokemon; i++) {
            promises.push(
                fetch(`https://pokeapi.co/api/v2/pokemon/${i}`).then(res => res.json())
            );
        }

        const results = await Promise.all(promises);

        const pokemonsResults = results.map(p => ({
            id: p.id,
            name: p.name,
            weight: p.weight,
            height: p.height,
            image: p.sprites.other['official-artwork'].front_default,
            types: p.types.map(t => t.type.name),
            stats: {
                hp: p.stats[0].base_stat,
                attack: p.stats[1].base_stat,
                defense: p.stats[2].base_stat,
                specialAttack: p.stats[3].base_stat,
                specialDefense: p.stats[4].base_stat,
                speed: p.stats[5].base_stat,
            }
        }));

        pokemons.push(...pokemonsResults);

        loadPokemons(pokemons);

    } catch (error) {
        createErrorCard(error);
    }

}*/

async function fetchPokemons() {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/?limit=${loadSizePokemon}`);
        const data = await response.json();

        const chunkSize = 50;

        for (let i = 0; i < data.results.length; i += chunkSize) {
            const chunk = data.results.slice(i, i + chunkSize);

            const promises = chunk.map(p =>
                fetch(p.url).then(res => res.json())
            );

            const results = await Promise.all(promises);

            const pokemonsResults = results.map(p => ({
                id: p.id,
                name: p.name,
                weight: p.weight,
                height: p.height,
                image: p.sprites.other['official-artwork'].front_default,
                types: p.types.map(t => t.type.name),
                stats: {
                    hp: p.stats[0].base_stat,
                    attack: p.stats[1].base_stat,
                    defense: p.stats[2].base_stat,
                    specialAttack: p.stats[3].base_stat,
                    specialDefense: p.stats[4].base_stat,
                    speed: p.stats[5].base_stat,
                }
            }));

            pokemons.push(...pokemonsResults);
        }
        loadPokemons(pokemons);
    } catch (error) {
        createErrorCard(error);
    }
}

const cardHolder = document.getElementById("card_holder");
const buscador = document.getElementById("buscador");
const form = document.getElementById("form-busqueda");
const panelFiltros = document.getElementById("panelFiltros");
const filtroBtn = document.getElementById("filtroBtn");

const maxStatLimit = 255;

function createPokemonCard(pokemon) {

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
    return card; 
}

function loadPokemons(pokemons, msg) {
    
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

form.addEventListener("submit", event => {
    event.preventDefault();

    const busqueda = buscador.value.toLowerCase();
    const filtrados = pokemons.filter(pokemon => pokemon.name.includes(busqueda));

    loadPokemons(filtrados, busqueda);
    
});

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

let onScreen = false;

filtroBtn.addEventListener("click", () => {
    if(onScreen){
        panelFiltros.innerHTML = "";
        onScreen = false;
    }else{
        panelFiltros.innerHTML = `
            <button class="filtro all">all</button>
            <button class="filtro normal">normal</button>
            <button class="filtro fire">fire</button>
            <button class="filtro water">water</button>
            <button class="filtro electric">electric</button>
            <button class="filtro grass">grass</button>
            <button class="filtro ice">ice</button>
            <button class="filtro fighting">fighting</button>
            <button class="filtro poison">poison</button>
            <button class="filtro ground">ground</button>
            <button class="filtro flying">flying</button>
            <button class="filtro psychic">psychic</button>
            <button class="filtro bug">bug</button>
            <button class="filtro rock">rock</button>
            <button class="filtro ghost">ghost</button>
            <button class="filtro dragon">dragon</button>
            <button class="filtro dark">dark</button>
            <button class="filtro steel">steel</button>
            <button class="filtro fairy">fairy</button>
        `;
        onScreen = true;
    } 
    });

panelFiltros.addEventListener("click", (e) => {
    if (e.target.classList.contains("filtro")) {
        const tipo = e.target.textContent;

        if (tipo === "all") {
            loadPokemons(pokemons, tipo);
        } else {
            const filtrados = pokemons.filter(p => p.types.includes(tipo));

            loadPokemons(filtrados, tipo);
        }
    }
});

fetchPokemons();