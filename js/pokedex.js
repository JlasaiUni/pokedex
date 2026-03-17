import p1 from '../data/1.json' assert { type: 'json' };
import p2 from '../data/2.json' assert { type: 'json' };
import p3 from '../data/3.json' assert { type: 'json' };
import p4 from '../data/4.json' assert { type: 'json' };
import p5 from '../data/5.json' assert { type: 'json' };
import p6 from '../data/6.json' assert { type: 'json' };

const pokemons = [p1, p2, p3, p4, p5, p6];

function loadPokemons(pokemons) {

    pokemons.forEach(pokemon => {
        createPokemonCard(pokemon);
    });
}

function createPokemonCard(pokemon){
    const card = document.createElement("article");
    card.classList.add("card");

    card.innerHTML=`
        <a href="./cardDetallado.html" class="card_link">
            <header class="card_header">
            <p class="card_name"><strong>${pokemon.name}</strong></p> 
            <p class="card_number"><strong>#${pokemon.id}</strong></p>
            </header>
            <section class="card_main">
            <img class="img_pokemon" src="${pokemon.sprites.official-artwork.front_default}" alt="foto de Bulbasaur">
            <div class="type_holder">
                <p class="type type_${pokemon.types.type.name}">${pokemon.types.type.name}</p>
                <p class="type type_${pokemon.types.type.name}">${pokemon.types.type.name}</p>
            </div>
            <div class="characteristics_holder">
                <p class="weight">${pokemon.weight} kg</p>
                <div class="separation_line"></div>
                <p class="height">${pokemon.height} m</p>
            </div>
            <div class="stats_holder">
                <div class="HP"><p class="stat_title">HP</p><p class="stat_num">${pokemon.stats.base_stat}</p><div class="progress"><div class="progress_bar"></div></div></div>
                <div class="ATK"><p class="stat_title">ATK</p><p class="stat_num">045</p><div class="progress"><div class="progress_bar"></div></div></div>
                <div class="DEF"><p class="stat_title">DEF</p><p class="stat_num">045</p><div class="progress"><div class="progress_bar"></div></div></div>
                <div class="SAT"><p class="stat_title">SAT</p><p class="stat_num">045</p><div class="progress"><div class="progress_bar"></div></div></div>
                <div class="SDF"><p class="stat_title">SDF</p><p class="stat_num">045</p><div class="progress"><div class="progress_bar"></div></div></div>
                <div class="SPD"><p class="stat_title">SPD</p><p class="stat_num">045</p><div class="progress"><div class="progress_bar"></div></div></div>
            </div>
            </section>
        </a>
    `;
    
    document.getElementById("card_holder").appendChild(card);
}

