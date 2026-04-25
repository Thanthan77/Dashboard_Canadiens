
async function getJson(url) {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });
    return await response.json();
  } catch (e) {
    console.error("Erreur fetch :", e);
    return null;
  }
}

async function getInfosJoueur(id) {
  // Vérification ID
  if (!id || isNaN(id)) {
    return { error: "ID joueur invalide" };
  }

  id = Number(id);

  // Calcul de la saison actuelle
  const now = new Date();
  const annee = now.getFullYear();
  const mois = now.getMonth() + 1;

  const saisonDebut = mois < 7 ? annee - 1 : annee;
  const saisonFin = saisonDebut + 1;
  const saisonId = Number(`${saisonDebut}${saisonFin}`);

  // Récupération des infos du joueur
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

  // Type de stats
  const type = position === "G" ? "goalie" : "skater";
  const statsUrl = `https://api.nhle.com/stats/rest/en/${type}/summary?cayenneExp=playerId=${id}`;
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
        ? tirsRecus - butsEncaisses
        : null;

    pourcentage =
      tirsRecus > 0 && butsEncaisses !== null
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
    buts_encaissés: butsEncaissés,
    blanchissages,
    temps_de_jeu: tempsDeJeu,
  };
}



document.addEventListener("DOMContentLoaded", function () {
  const attaquants = document.getElementById("attaquants");
  const defenseurs = document.getElementById("defenseurs");
  const gardiens = document.getElementById("gardiens");

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
      console.error("Erreur:", error);
      showMessage(`Erreur: ${error.message}`, "error");
    }
  }

  function displayPlayers(joueurs) {
    attaquants.innerHTML = "";
    defenseurs.innerHTML = "";
    gardiens.innerHTML = "";

    const positionsMap = {
      R: "Ailier droit",
      L: "Ailier gauche",
      C: "Centre",
      D: "Défenseur",
      G: "Gardien",
    };

    joueurs.forEach((joueur) => {
      const card = document.createElement("div");
      card.className = "stats-card";

      const prenom = joueur.prenom || "";
      const nom = joueur.nom || "";
      const numero = joueur.numero !== undefined ? `#${joueur.numero}` : "";
      const position = joueur.position || "";
      const role = positionsMap[position] || "Inconnu";

      if (position === "G") {
        // 🧤 Gardien
        card.innerHTML = `
                    <h3>${numero} ${prenom} ${nom}</h3>
                    <p>Position : ${role}</p>
                    <p>Arrêts : ${joueur.arrets ?? "??"}</p>
                    <p>Tirs reçus : ${joueur.tirs_reçus ?? "??"}</p>
                    <p>% Arrêts : ${joueur.pourcentage_arrets ?? "??"}</p>
                    <p>Buts encaissés : ${joueur.buts_encaissés ?? "??"}</p>
                    <p>Blanchissages : ${joueur.blanchissages ?? "??"}</p>
                    <p>Temps de jeu : ${joueur.temps_de_jeu ?? "??"} min</p>
                `;
        gardiens.appendChild(card);
      } else {
        // 🏒 Attaquant ou Défenseur
        card.innerHTML = `
                    <h3>${numero} ${prenom} ${nom}</h3>
                    <p>Position : ${role}</p>
                    <p>Buts : ${joueur.buts ?? "0"}</p>
                    <p>Passes : ${joueur.passes ?? "0"}</p>
                    <p>Points : ${joueur.points ?? "0"}</p>
                `;

        if (position === "D") {
          defenseurs.appendChild(card);
        } else {
          attaquants.appendChild(card);
        }
      }
    });
  }

  function showLoading() {
    attaquants.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>Chargement des joueurs des Canadiens...</p>
            </div>
        `;
    defenseurs.innerHTML = "";
    gardiens.innerHTML = "";
  }

  function showMessage(message, type = "info") {
    const icon =
      type === "error" ? "Erreur" : type === "info" ? "Information" : "Succès";

    const html = `
            <div class="message ${type}">
                <div class="message-icon">${icon}</div>
                <div class="message-content">
                    <h3>${type === "error" ? "Erreur" : "Information"}</h3>
                    <p>${message}</p>
                    ${
                      type === "error"
                        ? '<button onclick="location.reload()" class="retry-btn">Réessayer</button>'
                        : ""
                    }
                </div>
            </div>
        `;

    attaquants.innerHTML = html;
    defenseurs.innerHTML = "";
    gardiens.innerHTML = "";
  }
});
