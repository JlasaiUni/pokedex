import { type PokeAPIResponse } from "./funciones";

interface DreamTeamAPIResponse extends Omit<PokeAPIResponse, "sprites"> {
    sprites: {
        front_default: string;
        other: { "official-artwork": { front_default: string } };
    };
}

interface DreamTeamPokemon {
    id:         number;
    name:       string;
    height:     number;
    image:      string;
    imageSmall: string;
    types:      string[];
}

const MAX_TEAM_SIZE         = 6;
const MAX_HEIGHT_MULTIPLIER = 3;
const BASE_IMG_SIZE_EM      = 8;

const LAYOUT_ORDER = [0, 2, 4, 5, 3, 1] as const;

const favourites: Set<number> = new Set(JSON.parse(localStorage.getItem("favourites") ?? "[]"));

const dreamTeamHolder      = document.getElementById("dreamTeam_holder")       as HTMLElement;
const dreamTeamMain        = document.getElementById("dreamTeam_main")         as HTMLElement;
const dreamTeamHolderSmall = document.getElementById("dreamTeam_holder_small") as HTMLElement;


async function fetchDreamTeam(): Promise<void> {
    const ids = [...favourites].slice(0, MAX_TEAM_SIZE);

    if (ids.length === 0) {
        dreamTeamMain.innerHTML = "<p>No tienes favoritos aún. ¡Añade algunos desde la Pokédex!</p>";
        return;
    }

    try {
        const responses = await Promise.all(
            ids.map(id =>
                fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then(res => {
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    return res.json() as Promise<DreamTeamAPIResponse>;
                })
            )
        );

        const team = responses.map(toDreamTeamPokemon);

        // Ordenamos de mayor a menor altura para el layout visual
        team.sort((a, b) => b.height - a.height);

        loadPokemons(reorderForLayout(team));

    } catch (error) {
        dreamTeamMain.innerHTML = `<p>Error cargando el equipo. Inténtalo más tarde. (${error})</p>`;
    }
}

function toDreamTeamPokemon(p: DreamTeamAPIResponse): DreamTeamPokemon {
    return {
        id:         p.id,
        name:       p.name,
        height:     p.height,
        image:      p.sprites.other["official-artwork"].front_default,
        imageSmall: p.sprites.front_default,
        types:      p.types.map(t => t.type.name),
    };
}

function reorderForLayout(team: DreamTeamPokemon[]): DreamTeamPokemon[] {
    return LAYOUT_ORDER
        .filter(i => i < team.length)
        .map(i => team[i]!);
}

function getColorFromType(type: string): string {
    const temp = document.createElement("div");
    temp.className = `type_${type}`;
    document.body.appendChild(temp);
    const color = getComputedStyle(temp).getPropertyValue("--type-color");
    document.body.removeChild(temp);
    return color.trim();
}

function getBackgroundFromTeam(team: DreamTeamPokemon[]): string {
    const colors = team
        .map(p => p.types[0])
        .filter((type): type is string => type !== undefined)
        .map(getColorFromType);

    return `linear-gradient(45deg, ${colors.join(", ")})`;
}

function loadPokemons(team: DreamTeamPokemon[]): void {
    dreamTeamMain.innerHTML = "";
    dreamTeamHolderSmall.innerHTML = "";

    const main  = document.createDocumentFragment();
    const small = document.createDocumentFragment();

    team.forEach(pokemon => {
        main.appendChild(createDreamTeamImg(pokemon));
        small.appendChild(createDreamTeamSmallImg(pokemon));
    });

    dreamTeamHolder.style.background = getBackgroundFromTeam(team);
    dreamTeamMain.appendChild(main);
    dreamTeamHolderSmall.appendChild(small);
}

function createDreamTeamImg(pokemon: DreamTeamPokemon): HTMLDivElement {
    const card = document.createElement("div");
    const img  = document.createElement("img");

    const sizeMultiplier = Math.min(pokemon.height / 10, MAX_HEIGHT_MULTIPLIER);

    img.src          = pokemon.image;
    img.alt          = `foto de ${pokemon.name}`;
    img.style.width  = `calc(${BASE_IMG_SIZE_EM}em * ${sizeMultiplier})`;
    img.style.height = `calc(${BASE_IMG_SIZE_EM}em * ${sizeMultiplier})`;
    img.style.zIndex = String(Math.floor(100 - sizeMultiplier));

    card.style.width      = `calc(1em * ${sizeMultiplier * 2})`;
    card.style.marginLeft = `${MAX_HEIGHT_MULTIPLIER - sizeMultiplier}em`;

    card.appendChild(img);
    return card;
}

function createDreamTeamSmallImg(pokemon: DreamTeamPokemon): HTMLDivElement {
    const card = document.createElement("div");
    card.innerHTML = `
        <img src="${pokemon.imageSmall}" alt="foto de ${pokemon.name}">
    `;
    return card;
}

fetchDreamTeam();