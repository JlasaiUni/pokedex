type Pokemon = {
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

const pokemons: Pokemon[] = [];
const favoritos: Set<number> = new Set(JSON.parse(localStorage.getItem("favoritos") ?? "[]"));
const dreamTeam_holder = document.getElementById("dreamTeam_holder") as HTMLElement;

function loadPokemons(pokemons: Pokemon[]): void {
    dreamTeam_holder.innerHTML = "";

    if (pokemons.length > 0) {
        const cards = document.createDocumentFragment();

        pokemons.forEach(pokemon => {
            const card = createPokemonCard(pokemon);
            cards.appendChild(card);
        });

        dreamTeam_holder.appendChild(cards);
    } 
}

function createPokemonCard(pokemon: Pokemon): HTMLDivElement {
    const card = document.createElement("div");

    card.innerHTML = `
        <img class="img_pokemon"
            src="${pokemon.image}"
            alt="foto de ${pokemon.name}">
    `;

    return card;
}