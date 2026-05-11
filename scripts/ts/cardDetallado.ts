type PokemonDetail = {
    id: number;
    name: string;
    weight: number;
    height: number;
    sprites: {
        other: { "official-artwork": { front_default: string } };
    };
    types: { type: { name: string } }[];
    abilities: { ability: { name: string } }[];
    stats: { base_stat: number }[];
};

type SpeciesResponse = {
    evolution_chain: { url: string };
    varieties: { is_default: boolean; pokemon: { name: string; url: string } }[];
};

type EvolutionLink = {
    species: { name: string; url: string };
    evolves_to: EvolutionLink[];
};

type FormPokemon = {
    id: number;
    name: string;
    types: { type: { name: string } }[];
};


const MAX_STAT_LIMIT = 255;
const WEIGHT_DIVISOR = 10;
const HEIGHT_DIVISOR = 10;
const ID_PAD_LENGTH  = 3;

const ARTWORK_BASE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork";


function urlToId(url: string): number {
    return parseInt(url.split("/").filter(Boolean).at(-1)!);
}

// Aplana la cadena en etapas. Lineal: [[1],[2],[3]]. Ramificada: [[133],[134,135,...]]
function extractStages(link: EvolutionLink): number[][] {
    const stages: number[][] = [];
    function walk(node: EvolutionLink, depth: number): void {
        (stages[depth] ??= []).push(urlToId(node.species.url));
        for (const next of node.evolves_to) walk(next, depth + 1);
    }
    walk(link, 0);
    return stages;
}


function formatName(name: string): string {
    return name.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function artworkUrl(pokemonId: number): string {
    return ARTWORK_BASE + "/" + String(pokemonId) + ".png";
}

function buildTypesHTML(types: { type: { name: string } }[]): string {
    return types.map(t => "<p class=\"type type_" + t.type.name + "\">" + t.type.name + "</p>").join("");
}

function buildStatsHTML(stats: PokemonDetail["stats"]): string {
    const names = ["HP", "ATK", "DEF", "SAT", "SDF", "SPD"];
    return stats.slice(0, 6).map((s, i) => {
        const pct = (s.base_stat / MAX_STAT_LIMIT) * 100;
        return "<div class=\"" + names[i] + "\"><p class=\"stat_title\">" + names[i] + "</p><p class=\"stat_num\">" + s.base_stat + "</p><div class=\"progress\"><div class=\"progress_bar\" style=\"width:" + pct + "%\"></div></div></div>";
    }).join("");
}

function buildEvoLinkHTML(evoId: number, currentId: number): string {
    const cls = evoId === currentId ? "evo_pokemon evo_current" : "evo_pokemon";
    const num = "#" + String(evoId).padStart(ID_PAD_LENGTH, "0");
    const href = "cardDetallado.html?id=" + String(evoId);
    const img = "<img src=\"" + artworkUrl(evoId) + "\" alt=\"Pokemon " + num + "\" onerror=\"this.style.opacity=&apos;0.15&apos;\">";
    return "<a href=\"" + href + "\" class=\"" + cls + "\">" + img + "<p>" + num + "</p></a>";
}

function buildStageHTML(stage: number[], currentId: number): string {
    return "<div class=\"evo_stage\">" + stage.map(evoId => buildEvoLinkHTML(evoId, currentId)).join("") + "</div>";
}

function buildEvolutionHTML(chain: EvolutionLink | null, currentId: number): string {
    if (!chain) return "";
    const stages = extractStages(chain);
    if (stages.length <= 1) return "";
    const arrow = "<div class=\"evo_arrow\"></div>";
    const html = stages.map(stage => buildStageHTML(stage, currentId)).join(arrow);
    return "<div class=\"section_label\">Evoluciones</div><div class=\"evo_chain\">" + html + "</div>";
}

function buildFormCardHTML(form: FormPokemon): string {
    const href = "cardDetallado.html?id=" + String(form.id);
    const img = "<img src=\"" + artworkUrl(form.id) + "\" alt=\"" + form.name + "\" onerror=\"this.style.opacity=&apos;0.15&apos;\">";
    return "<a href=\"" + href + "\" class=\"form_card\">" + img + "<p class=\"form_name\">" + formatName(form.name) + "</p><div class=\"form_types\">" + buildTypesHTML(form.types) + "</div></a>";
}

function buildFormsHTML(forms: FormPokemon[]): string {
    if (forms.length === 0) return "";
    return "<div class=\"section_label\">Formas especiales</div><div class=\"forms_holder\">" + forms.map(buildFormCardHTML).join("") + "</div>";
}

function createDetailCard(pokemon: PokemonDetail, chain: EvolutionLink | null, forms: FormPokemon[]): void {
    const holder = document.getElementById("card_detallado_holder") as HTMLElement;
    const abilitiesHTML = pokemon.abilities.map(a => "<span class=\"ability_tag\">" + a.ability.name + "</span>").join("");
    const artworkSrc = pokemon.sprites.other["official-artwork"].front_default;
    const paddedId = "#" + String(pokemon.id).padStart(ID_PAD_LENGTH, "0");

    holder.innerHTML = (
        "<article class=\"card_detallada\">" +
        "<header class=\"card_detallada_header\">" +
        "<p class=\"card_detallada_name\"><strong>" + pokemon.name + "</strong></p>" +
        "<p class=\"card_detallada_number\"><strong>" + paddedId + "</strong></p>" +
        "</header>" +
        "<img class=\"img_pokemon_grande\" src=\"" + artworkSrc + "\" alt=\"foto de " + pokemon.name + "\">" +
        "<section class=\"card_detallada_main\">" +
        "<div class=\"type_holder_detallado\">" + buildTypesHTML(pokemon.types) + "</div>" +
        "<div class=\"characteristics_holder_detallado\">" +
        "<p class=\"weight\">" + (pokemon.weight / WEIGHT_DIVISOR) + " kg</p>" +
        "<div class=\"separation_line\"></div>" +
        "<p class=\"height\">" + (pokemon.height / HEIGHT_DIVISOR) + " m</p>" +
        "</div>" +
        "<div class=\"abilities_holder\">" +
        "<p class=\"abilities_title\">Abilities</p>" +
        "<div class=\"abilities_list\">" + abilitiesHTML + "</div>" +
        "</div>" +
        "<div class=\"stats_holder_detallado\">" + buildStatsHTML(pokemon.stats) + "</div>" +
        buildEvolutionHTML(chain, pokemon.id) +
        buildFormsHTML(forms) +
        "<a id=\"btn_volver\" href=\"pokedex.html\" class=\"btn_volver\">Volver</a>" +
        "</section></article>"
    );
}

const cardHolder = document.getElementById("card_detallado_holder") as HTMLElement;
const params = new URLSearchParams(window.location.search);
const id = parseInt(params.get("id") ?? "0");

if (!id) {
    cardHolder.innerHTML = "<p>ID de Pokemon invalido.</p>";
    throw new Error("Invalid pokemon ID");
}

try {
    const [pokemon, species] = await Promise.all([
        fetch("https://pokeapi.co/api/v2/pokemon/" + String(id)).then(r => {
            if (!r.ok) throw new Error("HTTP " + r.status);
            return r.json() as Promise<PokemonDetail>;
        }),
        fetch("https://pokeapi.co/api/v2/pokemon-species/" + String(id))
            .then(r => r.ok ? (r.json() as Promise<SpeciesResponse>) : null)
            .catch(() => null),
    ]);

    let chain: EvolutionLink | null = null;
    let forms: FormPokemon[] = [];

    if (species) {
        const evoData = await fetch(species.evolution_chain.url)
            .then(r => r.json() as Promise<{ chain: EvolutionLink }>)
            .catch(() => null);
        if (evoData) chain = evoData.chain;

        const nonDefault = species.varieties.filter(v => !v.is_default);
        const formResults = await Promise.allSettled(
            nonDefault.map(v => fetch(v.pokemon.url).then(r => r.json() as Promise<FormPokemon>))
        );
        forms = formResults
            .filter((r): r is PromiseFulfilledResult<FormPokemon> => r.status === "fulfilled")
            .map(r => r.value);
    }

    createDetailCard(pokemon, chain, forms);

} catch (error) {
    cardHolder.innerHTML = "<p>Error cargando el Pokemon: " + String(error) + "</p>";
}
