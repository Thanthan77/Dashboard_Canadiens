async function getJson(url) {
  try {
    const response = await fetch(url);
    return await response.json();
  } catch (e) {
    console.error("Erreur fetch :", e);
    return null;
  }
}

async function getJoueursCanadiens() {
  // Déterminer la saison actuelle
  const now = new Date();
  const annee = now.getFullYear();
  const mois = now.getMonth() + 1;

  const saisonDebut = mois < 7 ? annee - 1 : annee;
  const saisonFin = saisonDebut + 1;
  const saisonId = Number(`${saisonDebut}${saisonFin}`);

  // PROXY CORS
  const proxy = "https://corsproxy.io/?";

  // Étape 1 : Récupérer le roster
  const rosterUrl = proxy + "https://api-web.nhle.com/v1/roster/MTL/current";
  const rosterData = await getJson(rosterUrl);

  if (!rosterData) {
    console.error("Roster introuvable");
    return [];
  }

  const groupes = ["forwards", "defensemen", "goalies"];
  const joueurs = [];

  for (const groupe of groupes) {
    for (const joueur of rosterData[groupe] ?? []) {
      const id = joueur.id;
      const prenom = joueur.firstName?.default ?? "";
      const nom = joueur.lastName?.default ?? "";
      const numero = joueur.sweaterNumber ?? "";
      const position = joueur.positionCode ?? "";
      const headshot = joueur.headshot ?? "";
      const pays = joueur.birthCountry ?? "";

      // Étape 2 : Récupérer les stats individuelles
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

      // Statistiques gardiens
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
            ? tirsRecus - butsEncaisses
            : null;

        pourcentage =
          tirsRecus > 0 && butsEncaisses !== null
            ? ((1 - butsEncaisses / tirsRecus) * 100).toFixed(2)
            : null;

        blanchissages = ligne.shutouts ?? null;
        tempsDeJeu = ligne.timeOnIce ? Math.round(ligne.timeOnIce / 60) : null;
      }

      joueurs.push({
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
        buts_encaissés: butsEncaissés,
        blanchissages,
        temps_de_jeu: tempsDeJeu,
      });
    }
  }

  return joueurs;
}

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("joueurs");

  loadAndDisplayPlayers();

  async function loadAndDisplayPlayers() {
    showLoading();

    try {
      const joueurs = await getJoueursCanadiens();

      if (!Array.isArray(joueurs)) {
        throw new Error("Structure de données invalide");
      }

      displayPlayers(joueurs);
    } catch (error) {
      console.error("Erreur lors du chargement des joueurs :", error);
      showMessage(`Erreur : ${error.message}`, "error");
    }
  }

  function displayPlayers(joueurs) {
    container.innerHTML = "";

    if (joueurs.length === 0) {
      showMessage("Aucun joueur trouvé.", "info");
      return;
    }

    joueurs.forEach((joueur) => {
      const card = document.createElement("div");
      card.className = "joueur-card";

      const prenom = joueur.prenom || "";
      const nom = joueur.nom || "";
      const numero = joueur.numero !== undefined ? joueur.numero : "";
      const id = joueur.id;

      card.innerHTML = `
        <div class="nom">${prenom} ${nom}</div>
        <div class="numero">#${numero}</div>
      `;

      card.addEventListener("click", () => {
        window.location.href = `statistiqueJoueur.html?id=${id}`;
      });

      container.appendChild(card);
    });
  }

  function showLoading() {
    container.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Chargement des joueurs...</p>
      </div>
    `;
  }

  function showMessage(message, type = "info") {
    const icon =
      type === "error" ? "Erreur" : type === "info" ? "Information" : "Succès";

    container.innerHTML = `
      <div class="message ${type}">
        <div class="message-icon">${icon}</div>
        <div class="message-content">
          <h3>${type === "error" ? "Erreur" : "Information"}</h3>
          <p>${message}</p>
          ${type === "error" ? '<button onclick="location.reload()" class="retry-btn">Réessayer</button>' : ""}
        </div>
      </div>
    `;
  }
});
