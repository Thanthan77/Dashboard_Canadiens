
async function getClassementNHL() {
    const url = "https://api-web.nhle.com/v1/standings/now";

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "User-Agent": "Mozilla/5.0"
            }
        });

        const data = await response.json();

        if (!data || !data.standings) {
            console.error("Classement introuvable");
            return [];
        }

        let classement = [];
        let rang = 1;

        data.standings.forEach(team => {
            classement.push({
                rang: rang++,
                equipe: team.teamName?.default ?? "",
                division: team.divisionName ?? "",
                mj: team.gamesPlayed ?? 0,
                v: team.wins ?? 0,
                d: team.losses ?? 0,
                dp: team.otLosses ?? 0,
                pts: team.points ?? 0,
                rw: team.regulationWins ?? 0,
                row: team.regulationPlusOtWins ?? 0,
                diff: team.goalDifferential ?? 0,
                pct_victoire: team.gamesPlayed > 0
                    ? (team.points / (team.gamesPlayed * 2)).toFixed(3)
                    : null
            });
        });

        return classement;

    } catch (error) {
        console.error("Erreur API NHL :", error);
        return [];
    }
}


document.addEventListener("DOMContentLoaded", () => {
  const titreElement = document.getElementById("titre-saison");
  const tbody = document.getElementById("classement-body");

  setSeasonTitle();
  loadAndDisplayClassements();

  function setSeasonTitle() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    let saisonDebut;
    let saisonFin;
    if (currentMonth >= 9) {
      saisonDebut = currentYear;
      saisonFin = currentYear + 1;
    } else {
      saisonDebut = currentYear - 1;
      saisonFin = currentYear;
    }

    titreElement.textContent = `Classements LNH - Saison ${saisonDebut}-${saisonFin}`;
  }

  async function loadAndDisplayClassements() {
    showLoading();

    try {
      const data = await getClassementNHL();

      if (!Array.isArray(data)) {
        throw new Error("Structure de données invalide");
      }

      displayClassements(data);
    } catch (error) {
      console.error("Erreur chargement du classement :", error);
      showMessage("Impossible de charger les données.", "error");
    }
  }

  function displayClassements(data) {
    tbody.innerHTML = "";

    if (data.length === 0) {
      showMessage("Aucune donnée disponible.", "info");
      return;
    }

    data.forEach((team, index) => {
      const row = document.createElement("tr");

      if (index < 3) {
        row.classList.add("highlight");
      }

      if (team.equipe.trim().toLowerCase().includes("montréal")) {
        row.classList.add("montreal");
      }

      row.innerHTML = `
                <td>${team.rang}</td>
                <td>${team.equipe}</td>
                <td>${team.mj}</td>
                <td>${team.v}</td>
                <td>${team.d}</td>
                <td>${team.dp}</td>
                <td>${team.pts}</td>
            `;
      tbody.appendChild(row);
    });
  }

  function showLoading() {
    tbody.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="loading-state">
                        <div class="spinner"></div>
                        <p>Chargement des classements...</p>
                    </div>
                </td>
            </tr>
        `;
  }

  function showMessage(message, type = "info") {
    const icon =type === "error" ? "Erreur" : type === "info" ? "Information" : "Succès";

    tbody.innerHTML = `
    <tr>
        <td colspan="7">
            <div class="message ${type}">
                <div class="message-icon">${icon}</div>
                <div class="message-content">
                    <h3>${type === "error" ? "Erreur" : "Information"}</h3>
                    <p>${message}</p>
                    ${type === "error" ? '<button onclick="location.reload()" class="retry-btn">Réessayer</button>' : ""}
                </div>
            </div>
        </td>
    </tr>
`;
  }
});
