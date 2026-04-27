// URL de l’API NHL
const API_URL = "https://api-web.nhle.com/v1/playoff-bracket/2026";

async function chargerBracket() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        const rounds = data.rounds;

        // --- TRI PAR CONFÉRENCE ---
        const westR1 = rounds[0].series.filter(s => s.conferenceName === "Western");
        const westR2 = rounds[1].series.filter(s => s.conferenceName === "Western");
        const westFinal = rounds[2].series.filter(s => s.conferenceName === "Western")[0];

        const eastR1 = rounds[0].series.filter(s => s.conferenceName === "Eastern");
        const eastR2 = rounds[1].series.filter(s => s.conferenceName === "Eastern");
        const eastFinal = rounds[2].series.filter(s => s.conferenceName === "Eastern")[0];

        // --- FONCTION POUR AFFICHER UNE SÉRIE ---
        function formatSerie(serie) {
            const t1 = serie.matchupTeams[0];
            const t2 = serie.matchupTeams[1];

            if (!t1 || !t2) return "TBD";

            return `${t1.teamAbbrev} (${t1.wins}) vs ${t2.teamAbbrev} (${t2.wins})`;
        }

        // --- OUEST R1 ---
        const westR1Boxes = document.querySelectorAll(".west .round-col:nth-child(1) .match-box");
        westR1.forEach((serie, i) => {
            if (westR1Boxes[i]) westR1Boxes[i].textContent = formatSerie(serie);
        });

        // --- OUEST R2 ---
        const westR2Boxes = document.querySelectorAll(".west .round-col:nth-child(2) .match-box");
        westR2.forEach((serie, i) => {
            if (westR2Boxes[i]) westR2Boxes[i].textContent = formatSerie(serie);
        });

        // --- FINALE OUEST ---
        const westFinalBox = document.querySelector(".west .round-col:nth-child(3) .match-box");
        if (westFinalBox) westFinalBox.textContent = formatSerie(westFinal);

        // --- EST (ordre inversé dans ton HTML) ---

        // Finale Est
        const eastFinalBox = document.querySelector(".east .round-col:nth-child(1) .match-box");
        eastFinalBox.textContent = formatSerie(eastFinal);

        // R2 Est
        const eastR2Boxes = document.querySelectorAll(".east .round-col:nth-child(2) .match-box");
        eastR2.forEach((serie, i) => {
            if (eastR2Boxes[i]) eastR2Boxes[i].textContent = formatSerie(serie);
        });

        // R1 Est
        const eastR1Boxes = document.querySelectorAll(".east .round-col:nth-child(3) .match-box");
        eastR1.forEach((serie, i) => {
            if (eastR1Boxes[i]) eastR1Boxes[i].textContent = formatSerie(serie);
        });

        console.log("Bracket chargé !");
    } catch (error) {
        console.error("Erreur lors du chargement du bracket :", error);
    }
}

chargerBracket();
