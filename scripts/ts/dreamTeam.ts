interface Pokemon {
    id: number;
    name: string;
    height: number;
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
        height: p.height,
        image: p.sprites.other['official-artwork'].front_default,
        imageSmall: p.sprites.front_default,
        types: p.types.map((t: any) => t.type.name)
    }));

    pokemonsResults.sort((a, b) => b.height - a.height);

    const layoutOrder = [0, 2, 4, 5, 3, 1];
    const orderedTeam = layoutOrder.map(i => pokemonsResults[i]!);

    pokemons.push(...orderedTeam);

    loadPokemons(pokemons);
}


function loadPokemons(pokemons: Pokemon[]): void {
    dreamTeamMain.innerHTML = "";
    dreamTeamHolderSmall.innerHTML = "";

    if (pokemons.length > 0) {
        const main = document.createDocumentFragment();
        const small = document.createDocumentFragment();

        pokemons.forEach(pokemon => {
            const card = createDreamTeamImg(pokemon);
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

  return `linear-gradient(45deg, ${colors.join(", ")})`;
}

function createDreamTeamImg(pokemon: Pokemon): HTMLDivElement {
    const card = document.createElement("div");
    const img = document.createElement("img");

    const sizeMultiplier = Math.min(pokemon.height / 10, 3); // maximo 3x

    img.src = pokemon.image;
    img.alt = `foto de ${pokemon.name}`;
    img.style.width = `calc(8em * ${sizeMultiplier})`;
    img.style.height = `calc(8em * ${sizeMultiplier})`;
    img.style.zIndex = String(Math.floor(100 - sizeMultiplier));

    card.style.width = `calc(1em * ${sizeMultiplier*2})`;
    card.style.marginLeft = `${3-sizeMultiplier}em`;

    card.appendChild(img);
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