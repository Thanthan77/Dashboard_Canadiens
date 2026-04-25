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
