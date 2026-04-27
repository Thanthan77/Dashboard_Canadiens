// URL du Worker Cloudflare
const WORKER_URL = "https://throbbing-base-9cf9.ethanqc-chea.workers.dev/";

// Détecte automatiquement l'année des playoffs
function getCurrentPlayoffYear() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  // Les playoffs commencent en avril
  return month >= 4 ? year : year - 1;
}

// fetch JSON
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
  // année automatique
  const year = getCurrentPlayoffYear();

  // appel dynamique à ton Worker
  const data = await getJson(`${WORKER_URL}?year=${year}`);

  if (!data) return;

  const series = data.series;

  // --- TRI PAR ROUND ET CONFÉRENCE ---

  const eastR1 = series.filter((s) =>
    ["A", "B", "C", "D"].includes(s.seriesLetter),
  );
  const westR1 = series.filter((s) =>
    ["E", "F", "G", "H"].includes(s.seriesLetter),
  );

  const eastR2 = series.filter((s) => ["I", "J"].includes(s.seriesLetter));
  const westR2 = series.filter((s) => ["K", "L"].includes(s.seriesLetter));

  const eastFinal = series.find((s) => s.seriesLetter === "M");
  const westFinal = series.find((s) => s.seriesLetter === "N");

  const stanleyCup = series.find((s) => s.seriesLetter === "O");

  // --- REMPLISSAGE HTML ---

  // OUEST R1
  const westR1Boxes = document.querySelectorAll(
    ".west .round-col:nth-child(1) .match-box",
  );
  westR1.forEach((serie, i) => {
    if (westR1Boxes[i]) westR1Boxes[i].innerHTML = formatSerie(serie);
  });

  // OUEST R2
  const westR2Boxes = document.querySelectorAll(
    ".west .round-col:nth-child(2) .match-box",
  );
  westR2.forEach((serie, i) => {
    if (westR2Boxes[i]) westR2Boxes[i].innerHTML = formatSerie(serie);
  });

  // Finale Ouest
  const westFinalBox = document.querySelector(
    ".west .round-col:nth-child(3) .match-box",
  );
  if (westFinalBox) westFinalBox.innerHTML = formatSerie(westFinal);

  // EST — ordre spécial (Finale → R2 → R1)

  const eastFinalBox = document.querySelector(
    ".east .round-col:nth-child(1) .match-box",
  );
  if (eastFinalBox) eastFinalBox.innerHTML = formatSerie(eastFinal);

  const eastR2Boxes = document.querySelectorAll(
    ".east .round-col:nth-child(2) .match-box",
  );
  eastR2.forEach((serie, i) => {
    if (eastR2Boxes[i]) eastR2Boxes[i].innerHTML = formatSerie(serie);
  });

  const eastR1Boxes = document.querySelectorAll(
    ".east .round-col:nth-child(3) .match-box",
  );
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

// Pour Design responsive
document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector(".bracket-grid");
  if (!grid) return;
  grid.scrollLeft = (grid.scrollWidth - grid.clientWidth) / 2;
});
