import p1 from '../data/1.json' with { type: 'json' };
import p2 from '../data/2.json' with { type: 'json' };
import p3 from '../data/3.json' with { type: 'json' };
import p4 from '../data/4.json' with { type: 'json' };
import p5 from '../data/5.json' with { type: 'json' };
import p6 from '../data/6.json' with { type: 'json' };
import p7 from '../data/7.json' with { type: 'json' };
import p8 from '../data/8.json' with { type: 'json' };
import p9 from '../data/9.json' with { type: 'json' };

const pokemons = [p1, p2, p3, p4, p5, p6, p7, p8, p9];

function loadPokemons(pokemons) {
    pokemons.forEach(pokemon => {
        createPokemonCard(pokemon);
    });
}

function createPokemonCard(pokemon) {

    const card = document.createElement("a");
    card.classList.add("card_link");
    card.href = `cardDetallado.html`;

    const cardHolder = document.getElementById("card_holder");

    const stats = {
        hp : pokemon.stats[0].base_stat,
        attack : pokemon.stats[1].base_stat,
        defense : pokemon.stats[2].base_stat,
        specialAttack : pokemon.stats[3].base_stat,
        specialDefense : pokemon.stats[4].base_stat,
        speed : pokemon.stats[5].base_stat,
    };

    const maxLimit = 255;

    card.innerHTML = `
        <article class="card">
            <header class="card_header">
                <p class="card_name"><strong>${pokemon.name}</strong></p> 
                <p class="card_number"><strong>#${pokemon.id}</strong></p>
            </header>

            <section class="card_main">
                <img class="img_pokemon" 
                     src="${pokemon.sprites.other['official-artwork'].front_default}" 
                     alt="foto de ${pokemon.name}">

                <div class="type_holder">
                    ${pokemon.types.map(t => `<p class="type type_${t.type.name}">${t.type.name}</p>`).join("")}
                </div>

                <div class="characteristics_holder">
                    <p class="weight">${pokemon.weight} kg</p>
                    <div class="separation_line"></div>
                    <p class="height">${pokemon.height} m</p>
                </div>

                <div class="stats_holder">
                    <div class="HP">
                        <p class="stat_title">HP</p>
                        <p class="stat_num">${stats.hp}</p>
                        <div class="progress"><div class="progress_bar" style="width: ${(stats.hp / maxLimit) * 100}%"></div></div>
                    </div>
                    <div class="ATK">
                        <p class="stat_title">ATK</p>
                        <p class="stat_num">${stats.attack}</p>
                        <div class="progress"><div class="progress_bar" style="width: ${(stats.attack / maxLimit) * 100}%"></div></div>
                    </div>
                    <div class="DEF">
                        <p class="stat_title">DEF</p>
                        <p class="stat_num">${stats.defense}</p>
                        <div class="progress"><div class="progress_bar" style="width: ${(stats.defense / maxLimit) * 100}%"></div></div>
                    </div>
                    <div class="SAT">
                        <p class="stat_title">SAT</p>
                        <p class="stat_num">${stats.specialAttack}</p>
                        <div class="progress"><div class="progress_bar" style="width: ${(stats.specialAttack / maxLimit) * 100}%"></div></div>
                    </div>
                    <div class="SDF">
                        <p class="stat_title">SDF</p>
                        <p class="stat_num">${stats.specialDefense}</p>
                        <div class="progress"><div class="progress_bar" style="width: ${(stats.specialDefense / maxLimit) * 100}%"></div></div>
                    </div>
                    <div class="SPD">
                        <p class="stat_title">SPD</p>
                        <p class="stat_num">${stats.speed}</p>
                        <div class="progress"><div class="progress_bar" style="width: ${(stats.speed / maxLimit) * 100}%"></div></div>
                    </div>
                </div>
            </section>
        </article>
    `;

    cardHolder.appendChild(card);
}

loadPokemons(pokemons);

function filtroBuscador(){
    document.getElementById();

}