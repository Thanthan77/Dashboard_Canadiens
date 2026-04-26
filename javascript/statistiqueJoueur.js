async function getJson(url) {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    return await response.json();
  } catch (e) {
    console.error("Erreur fetch :", e);
    return null;
  }
}

async function getInfosJoueur(id) {
  if (!id || isNaN(id)) {
    return { error: "ID joueur invalide" };
  }

  id = Number(id);

  // Saison actuelle via saisonActuelle.js
  const saisonId = getCurrentSeasonId();

  // Proxy CORS
  const proxy = "https://corsproxy.io/?";

  // Infos du joueur
  const infoUrl = proxy + `https://api-web.nhle.com/v1/player/${id}/landing`;
  const infoData = await getJson(infoUrl);

  if (!infoData) {
    return { error: "Joueur introuvable" };
  }

  const prenom = infoData.firstName?.default ?? "";
  const nom = infoData.lastName?.default ?? "";
  const numero = infoData.sweaterNumber ?? "";
  const position = infoData.position ?? "";
  const headshot = infoData.headshot ?? "";
  const pays = infoData.birthCountry ?? "";

  // Type de stats
  const type = position === "G" ? "goalie" : "skater";

  const statsUrl =
    proxy +
    `https://api.nhle.com/stats/rest/en/${type}/summary?cayenneExp=playerId=${id}`;

  const statsData = await getJson(statsUrl);

  // Trouver la ligne correspondant à la saison actuelle
  let ligne = null;
  for (const item of statsData?.data ?? []) {
    if (item.seasonId === saisonId) {
      ligne = item;
      break;
    }
  }

  // Statistiques communes
  const buts = ligne?.goals ?? null;
  const passes = ligne?.assists ?? null;
  const points = ligne?.points ?? null;

  // Statistiques gardien
  let arrets = null;
  let tirsRecus = null;
  let pourcentage = null;
  let butsEncaisses = null;
  let blanchissages = null;
  let tempsDeJeu = null;

  if (position === "G" && ligne) {
    tirsRecus = ligne.shotsAgainst ?? null;
    butsEncaisses = ligne.goalsAgainst ?? null;
    arrets =
      tirsRecus !== null && butsEncaisses !== null
        ? tirsRecus - butsEncaissés
        : null;

    pourcentage =
      tirsRecus > 0 && butsEncaissés !== null
        ? ((1 - butsEncaisses / tirsRecus) * 100).toFixed(2)
        : null;

    blanchissages = ligne.shutouts ?? null;
    tempsDeJeu = ligne.timeOnIce ? Math.round(ligne.timeOnIce / 60) : null;
  }

  return {
    id,
    prenom,
    nom,
    numero,
    position,
    headshot,
    pays,
    buts,
    passes,
    points,
    arrets,
    tirs_reçus: tirsRecus,
    pourcentage_arrets: pourcentage ? `${pourcentage}%` : null,
    buts_encaissés: butsEncaisses,
    blanchissages,
    temps_de_jeu: tempsDeJeu,
  };
}

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const container = document.getElementById("statistiques"); // ✔️ correspond au HTML

  if (!id) {
    container.innerHTML = "<p>ID joueur manquant.</p>";
    return;
  }

  container.innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Chargement des statistiques...</p>
    </div>
  `;

  const joueur = await getInfosJoueur(id);

  if (joueur.error) {
    container.innerHTML = `<p>${joueur.error}</p>`;
    return;
  }

  const roleMap = {
    R: "Ailier droit",
    L: "Ailier gauche",
    C: "Centre",
    D: "Défenseur",
    G: "Gardien",
  };

  const role = roleMap[joueur.position] || "Inconnu";

  container.innerHTML = `
    <div class="player-header">
      <img src="${joueur.headshot}" alt="${joueur.prenom} ${joueur.nom}" class="player-photo">
      <div>
        <h2>${joueur.prenom} ${joueur.nom}</h2>
        <p>#${joueur.numero} — ${role}</p>
        <p>Pays : ${joueur.pays}</p>
      </div>
    </div>

    <div class="stats-section">
      <h3>Statistiques</h3>

      ${
        joueur.position === "G"
          ? `
        <p>Arrêts : ${joueur.arrets ?? "??"}</p>
        <p>Tirs reçus : ${joueur.tirsRecus ?? "??"}</p>
        <p>% Arrêts : ${joueur.pourcentage ?? "??"}%</p>
        <p>Buts encaissés : ${joueur.butsEncaisses ?? "??"}</p>
        <p>Blanchissages : ${joueur.blanchissages ?? "??"}</p>
        <p>Temps de jeu : ${joueur.tempsDeJeu ?? "??"} min</p>
      `
          : `
        <p>Buts : ${joueur.buts}</p>
        <p>Passes : ${joueur.passes}</p>
        <p>Points : ${joueur.points}</p>
      `
      }
    </div>
  `;
});
