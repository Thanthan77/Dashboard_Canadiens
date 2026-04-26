async function getJson(url) {
  try {
    const proxy = "https://corsproxy.io/?";
    const encoded = encodeURIComponent(url);
    const response = await fetch(proxy + encoded);
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
  const saisonId = Number(getCurrentSeasonId());

  //  Infos joueur
  const infoUrl = `https://api-web.nhle.com/v1/player/${id}/landing`;
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

  // Stats joueur
  const type = position === "G" ? "goalie" : "skater";
  const statsUrl = `https://api.nhle.com/stats/rest/en/${type}/summary?cayenneExp=playerId=${id}`;
  const statsData = await getJson(statsUrl);

  let ligne = null;
  for (const item of statsData?.data ?? []) {
    if (item.seasonId === saisonId) {
      ligne = item;
      break;
    }
  }

  const buts = ligne?.goals ?? 0;
  const passes = ligne?.assists ?? 0;
  const points = ligne?.points ?? 0;

  let arrets = null;
  let tirsRecus = null;
  let pourcentage = null;
  let butsEncaisses = null;
  let blanchissages = null;
  let tempsDeJeu = null;

  if (position === "G" && ligne) {
    tirsRecus = ligne.shotsAgainst ?? null;
    butsEncaisses = ligne.goalsAgainst ?? null;

    arrets = tirsRecus - butsEncaisses;
    pourcentage = ((1 - butsEncaisses / tirsRecus) * 100).toFixed(2);
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
    tirsRecus,
    pourcentage,
    butsEncaisses,
    blanchissages,
    tempsDeJeu,
  };
}

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const container = document.getElementById("statistiques");

  if (!id) {
    container.innerHTML = "<p>ID joueur manquant.</p>";
    return;
  }

  container.innerHTML = `
    <div class="carte-joueur">
      <p>Chargement...</p>
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
    <div class="carte-joueur">
      <img src="${joueur.headshot}" class="photo-joueur">
      <h2>${joueur.prenom} ${joueur.nom}</h2>
      <p class="numero">#${joueur.numero} — ${role}</p>
      <p>Pays : ${joueur.pays}</p>
      <hr>

      <ul>
        <li><strong>Buts :</strong> ${joueur.buts}</li>
        <li><strong>Passes :</strong> ${joueur.passes}</li>
        <li><strong>Points :</strong> ${joueur.points}</li>
      </ul>

      ${
        joueur.position === "G"
          ? `
            <hr>
            <ul>
              <li><strong>Arrêts :</strong> ${joueur.arrets}</li>
              <li><strong>Tirs reçus :</strong> ${joueur.tirsRecus}</li>
              <li><strong>% Arrêts :</strong> ${joueur.pourcentage}%</li>
              <li><strong>Buts encaissés :</strong> ${joueur.butsEncaisses}</li>
              <li><strong>Blanchissages :</strong> ${joueur.blanchissages}</li>
              <li><strong>Temps de jeu :</strong> ${joueur.tempsDeJeu} min</li>
            </ul>
          `
          : ""
      }
    </div>
  `;
});
