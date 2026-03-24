const cardHolder = document.getElementById("card_detallado_holder");
 
const maxStatLimit = 255;

const params = new URLSearchParams(window.location.search);
const id = parseInt(params.get("id"));
const pokemon = await (await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)).json();

if (pokemon) {
    createDetailCard(pokemon);
} else {
    cardHolder.innerHTML = "<p>Pokémon no encontrado.</p>";
}
 
function createDetailCard(pokemon) {
    const stats = {
        hp:             pokemon.stats[0].base_stat,
        attack:         pokemon.stats[1].base_stat,
        defense:        pokemon.stats[2].base_stat,
        specialAttack:  pokemon.stats[3].base_stat,
        specialDefense: pokemon.stats[4].base_stat,
        speed:          pokemon.stats[5].base_stat,
    };
 
    const abilitiesHTML = pokemon.abilities.map(a => `<span class="ability_tag">${a.ability.name}</span>`).join("");
    
    const typesHTML = pokemon.types.map(t => `<p class="type type_${t.type.name}">${t.type.name}</p>`).join("");

    cardHolder.innerHTML = `
        <article class="card_detallada">
 
            <header class="card_detallada_header">
                <p class="card_detallada_name"><strong>${pokemon.name}</strong></p>
                <p class="card_detallada_number"><strong>#${pokemon.id}</strong></p>
            </header>
 
            <img class="img_pokemon_grande"
                 src="${pokemon.sprites.other['official-artwork'].front_default}"
                 alt="foto de ${pokemon.name}">
 
            <section class="card_detallada_main">
 
                <div class="type_holder_detallado">
                    ${typesHTML}
                </div>
 
                <div class="characteristics_holder_detallado">
                    <p class="weight">${pokemon.weight / 10} kg</p>
                    <div class="separation_line"></div>
                    <p class="height">${pokemon.height / 10} m</p>
                </div>
 
                <div class="abilities_holder">
                    <p class="abilities_title">Abilities</p>
                    <div class="abilities_list">
                        ${abilitiesHTML}
                    </div>
                </div>
 
                <div class="stats_holder_detallado">
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
 
                <button id="btn_volver" onclick="history.back()">← Volver</button>
 
            </section>
        </article>
    `;
}