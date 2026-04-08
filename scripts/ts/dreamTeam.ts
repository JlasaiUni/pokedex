type Pokemon = {
    id: number;
    name: string;
    image: string;
    imageSmall: string;
    types: string[];
};

const pokemons: Pokemon[] = [];
const favoritos: Set<number> = new Set(JSON.parse(localStorage.getItem("favoritos") ?? "[]"));

const dreamTeamHolder = document.getElementById("dreamTeam_holder") as HTMLElement;
const dreamTeamMain = document.getElementById("dreamTeam_main") as HTMLElement;
const dreamTeamHolderSmall = document.getElementById("dreamTeam_holder_small") as HTMLElement;

async function fetchDreamTeam(): Promise<void> {
    const ids = [...favoritos].slice(0, 6);

    if (ids.length === 0) {
        dreamTeamMain.innerHTML = "<p>No tienes favoritos aún.</p>";
        return;
    }

    const promises = ids.map(id =>
        fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then(res => res.json())
    );

    const results: any[] = await Promise.all(promises);


    const pokemonsResults: Pokemon[] = results.map(p => ({
        id: p.id,
        name: p.name,
        image: p.sprites.other['official-artwork'].front_default,
        imageSmall: p.sprites.front_default,
        types: p.types.map((t: any) => t.type.name)
    }));

    pokemons.push(...pokemonsResults);

    loadPokemons(pokemons);
}


function loadPokemons(pokemons: Pokemon[]): void {
    dreamTeamMain.innerHTML = "";
    dreamTeamHolderSmall.innerHTML = "";

    if (pokemons.length > 0) {
        const main = document.createDocumentFragment();
        const small = document.createDocumentFragment();

        pokemons.forEach(pokemon => {
            const card = createdreamTeamImg(pokemon);
            const cardSmall = createdreamTeamSmallImg(pokemon);
            main.appendChild(card);
            small.appendChild(cardSmall);
        });

        dreamTeamHolder.style.background = getBackgroundFromTeam(pokemons);
        dreamTeamMain.appendChild(main);
        dreamTeamHolderSmall.appendChild(small);
    } 
}

function getColorFromType(type: string): string {
  const temp = document.createElement("div");
  temp.className = `type_${type}`;
  document.body.appendChild(temp);

  const color = getComputedStyle(temp).getPropertyValue("--type-color");

  document.body.removeChild(temp);

  return color.trim();
}

function getBackgroundFromTeam(pokemons: any[]): string {
  const colors: string[] = [];

  pokemons.forEach(pokemon => {
    const type = pokemon.types?.[0]; 
    if (type) {
      colors.push(getColorFromType(type));
    }
  });

  return `linear-gradient(135deg, ${colors.join(", ")})`;
}

function createdreamTeamImg(pokemon: Pokemon): HTMLDivElement {
    const card = document.createElement("div");

    card.innerHTML = `
        <img src="${pokemon.image}"
            alt="foto de ${pokemon.name}">
    `;
    return card;
}

function createdreamTeamSmallImg(pokemon: Pokemon): HTMLDivElement {
    const card = document.createElement("div");

    card.innerHTML = `
        <img src="${pokemon.imageSmall}"
            alt="foto de ${pokemon.name}">
    `;
    return card;
}

fetchDreamTeam();