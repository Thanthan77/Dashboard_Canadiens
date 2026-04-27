// URL de ton Worker Cloudflare
const WORKER_URL = "https://throbbing-base-9cf9.ethanqc-chea.workers.dev/";

// Fonction générique pour fetch JSON
async function getJson(url) {
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (e) {
        console.error("Erreur fetch :", e);
        return null;
    }
}

// Fonction pour formater une série
function formatSerie(serie) {
    if (!serie.topSeedTeam || !serie.bottomSeedTeam) return "TBD";

    const t1 = serie.topSeedTeam;
    const t2 = serie.bottomSeedTeam;

    return `
        <div class="match-team">
            <img src="${t1.logo}" class="team-logo">
            <span>${t1.abbrev} (${serie.topSeedWins})</span>
        </div>
        <div class="match-team">
            <img src="${t2.logo}" class="team-logo">
            <span>${t2.abbrev} (${serie.bottomSeedWins})</span>
        </div>
    `;
}

// Fonction principale
async function chargerBracket() {
    const data = await getJson(WORKER_URL);
    if (!data) return;

    const series = data.series;

    // --- TRI PAR ROUND ET CONFÉRENCE ---

    // Round 1 Est = séries A, B, C, D
    const eastR1 = series.filter(s => ["A","B","C","D"].includes(s.seriesLetter));

    // Round 1 Ouest = séries E, F, G, H
    const westR1 = series.filter(s => ["E","F","G","H"].includes(s.seriesLetter));

    // Round 2 Est = séries I, J
    const eastR2 = series.filter(s => ["I","J"].includes(s.seriesLetter));

    // Round 2 Ouest = séries K, L
    const westR2 = series.filter(s => ["K","L"].includes(s.seriesLetter));

    // Finales
    const eastFinal = series.find(s => s.seriesLetter === "M");
    const westFinal = series.find(s => s.seriesLetter === "N");

    // Finale Stanley Cup
    const stanleyCup = series.find(s => s.seriesLetter === "O");

    // --- REMPLISSAGE HTML ---

    // OUEST R1
    const westR1Boxes = document.querySelectorAll(".west .round-col:nth-child(1) .match-box");
    westR1.forEach((serie, i) => {
        if (westR1Boxes[i]) westR1Boxes[i].innerHTML = formatSerie(serie);
    });

    // OUEST R2
    const westR2Boxes = document.querySelectorAll(".west .round-col:nth-child(2) .match-box");
    westR2.forEach((serie, i) => {
        if (westR2Boxes[i]) westR2Boxes[i].innerHTML = formatSerie(serie);
    });

    // Finale Ouest
    const westFinalBox = document.querySelector(".west .round-col:nth-child(3) .match-box");
    if (westFinalBox) westFinalBox.innerHTML = formatSerie(westFinal);

    // EST — ton ordre spécial (Finale → R2 → R1)

    // Finale Est
    const eastFinalBox = document.querySelector(".east .round-col:nth-child(1) .match-box");
    if (eastFinalBox) eastFinalBox.innerHTML = formatSerie(eastFinal);

    // R2 Est
    const eastR2Boxes = document.querySelectorAll(".east .round-col:nth-child(2) .match-box");
    eastR2.forEach((serie, i) => {
        if (eastR2Boxes[i]) eastR2Boxes[i].innerHTML = formatSerie(serie);
    });

    // R1 Est
    const eastR1Boxes = document.querySelectorAll(".east .round-col:nth-child(3) .match-box");
    eastR1.forEach((serie, i) => {
        if (eastR1Boxes[i]) eastR1Boxes[i].innerHTML = formatSerie(serie);
    });

    // Finale Stanley Cup
    const scBox = document.querySelector(".stanley-final");
    if (scBox && stanleyCup) {
        scBox.innerHTML = `
             <div class="stanley-text">Finale Coupe Stanley</div>
            <div>${formatSerie(stanleyCup)}</div>
        `;
    }
}

chargerBracket();
