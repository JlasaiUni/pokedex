const pokemons = [];

async function fetchPokemons() {
    for (let i = 1; i <= 151; i++) {
        const p = await (await fetch(`https://pokeapi.co/api/v2/pokemon/${i}`)).json();
        pokemons.push(p);
    }

    loadPokemons(pokemons);
}

const cardHolder = document.getElementById("card_holder");
const buscador = document.getElementById("buscador");
const form = document.getElementById("form-busqueda");

const maxStatLimit = 255;

function createPokemonCard(pokemon) {

    const card = document.createElement("a");

    card.classList.add("card_link");
    card.href = "cardDetallado.html?id=" + pokemon.id;

    const stats = {
        hp : pokemon.stats[0].base_stat,
        attack : pokemon.stats[1].base_stat,
        defense : pokemon.stats[2].base_stat,
        specialAttack : pokemon.stats[3].base_stat,
        specialDefense : pokemon.stats[4].base_stat,
        speed : pokemon.stats[5].base_stat,
    };

    card.innerHTML = `
        <article class="card">
            <header class="card_header">
                <p class="card_name"><strong>${pokemon.name}</strong></p> 
                <p class="card_number"><strong>#${String(pokemon.id).padStart(3, '0')}</strong></p>
            </header>

            <section class="card_main">
                <img class="img_pokemon" 
                     src="${pokemon.sprites.other['official-artwork'].front_default}" 
                     alt="foto de ${pokemon.name}">

                <div class="type_holder">
                    ${pokemon.types.map(t => `<p class="type type_${t.type.name}">${t.type.name}</p>`).join("")}
                </div>

                <div class="characteristics_holder">
                    <p class="weight">${pokemon.weight / 10} kg</p>
                    <div class="separation_line"></div>
                    <p class="height">${pokemon.height / 10} m</p>
                </div>

                <div class="stats_holder">
                    <div class="HP">
                        <p class="stat_title">HP</p>
                        <p class="stat_num">${stats.hp}</p>
                        <div class="progress"><div class="progress_bar" style="width: ${(stats.hp / maxStatLimit) * 100}%"></div></div>
                    </div>
                    <div class="ATK">
                        <p class="stat_title">ATK</p>
                        <p class="stat_num">${stats.attack}</p>
                        <div class="progress"><div class="progress_bar" style="width: ${(stats.attack / maxStatLimit) * 100}%"></div></div>
                    </div>
                    <div class="DEF">
                        <p class="stat_title">DEF</p>
                        <p class="stat_num">${stats.defense}</p>
                        <div class="progress"><div class="progress_bar" style="width: ${(stats.defense / maxStatLimit) * 100}%"></div></div>
                    </div>
                    <div class="SAT">
                        <p class="stat_title">SAT</p>
                        <p class="stat_num">${stats.specialAttack}</p>
                        <div class="progress"><div class="progress_bar" style="width: ${(stats.specialAttack / maxStatLimit) * 100}%"></div></div>
                    </div>
                    <div class="SDF">
                        <p class="stat_title">SDF</p>
                        <p class="stat_num">${stats.specialDefense}</p>
                        <div class="progress"><div class="progress_bar" style="width: ${(stats.specialDefense / maxStatLimit) * 100}%"></div></div>
                    </div>
                    <div class="SPD">
                        <p class="stat_title">SPD</p>
                        <p class="stat_num">${stats.speed}</p>
                        <div class="progress"><div class="progress_bar" style="width: ${(stats.speed / maxStatLimit) * 100}%"></div></div>
                    </div>
                </div>
            </section>
        </article>
    `;

    cardHolder.appendChild(card);
}

function loadPokemons(pokemons, msg) {
    
    cardHolder.innerHTML = "";

    if (pokemons.length > 0) {
        pokemons.forEach(pokemon => {createPokemonCard(pokemon);});
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


fetchPokemons();