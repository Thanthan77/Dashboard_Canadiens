async function getJson(url) {
  try {
    const response = await fetch(url);
    return await response.json();
  } catch (e) {
    console.error("Erreur fetch :", e);
    return null;
  }
}

async function getMatchsCanadiens() {
  const team = "MTL";

  // Déterminer la saison NHL
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  let seasonStart, seasonEnd;

  if (month >= 9) {
    seasonStart = year;
    seasonEnd = year + 1;
  } else {
    seasonStart = year - 1;
    seasonEnd = year;
  }

  const seasonId = `${seasonStart}${seasonEnd}`;

  // PROXY CORS
  const proxy = "https://corsproxy.io/?";

  // URL API NHL (avec proxy)
  const url =
    proxy +
    `https://api-web.nhle.com/v1/club-schedule-season/${team}/${seasonId}`;
  const data = await getJson(url);

  if (!data || !data.games) {
    return {
      error: "Données introuvables pour les Canadiens",
    };
  }

  // Mois en français
  const frenchMonths = {
    10: "Octobre",
    11: "Novembre",
    12: "Décembre",
    "01": "Janvier",
    "02": "Février",
    "03": "Mars",
    "04": "Avril",
    "05": "Mai",
    "06": "Juin",
  };

  const matchesByMonth = {};

  // Grouper les matchs par mois
  for (const match of data.games) {
    const date = match.gameDate;
    if (!date) continue;

    const monthNum = date.substring(5, 7);
    const yearMonth = date.substring(0, 7);

    // Ignorer juillet, août, septembre
    if (["07", "08", "09"].includes(monthNum)) continue;

    if (!matchesByMonth[yearMonth]) {
      matchesByMonth[yearMonth] = [];
    }

    matchesByMonth[yearMonth].push(match);
  }

  // Trier par mois
  const sortedMonths = Object.keys(matchesByMonth).sort();

  const result = { matchs_par_mois: {} };
  let monthsWithMatches = 0;
  let totalMatches = 0;

  for (const yearMonth of sortedMonths) {
    const monthNum = yearMonth.substring(5, 7);
    const monthName = frenchMonths[monthNum] || `Mois ${monthNum}`;

    const monthMatches = matchesByMonth[yearMonth];
    const formattedMatches = [];

    for (const match of monthMatches) {
      const home = match.homeTeam?.abbrev ?? "";
      const away = match.awayTeam?.abbrev ?? "";
      const scoreHome = match.homeTeam?.score ?? null;
      const scoreAway = match.awayTeam?.score ?? null;
      const etat = match.gameState ?? "FUTURE";

      // Match terminé ?
      const isTermine =
        etat === "FINAL" ||
        (etat === "OFF" && scoreHome !== null && scoreAway !== null);

      if (!isTermine) continue;

      const score = `${scoreHome}-${scoreAway}`;

      // Déterminer victoire/défaite
      let resultat;
      if (home === team) {
        resultat = scoreHome > scoreAway ? "Victoire" : "Défaite";
      } else {
        resultat = scoreAway > scoreHome ? "Victoire" : "Défaite";
      }

      formattedMatches.push({
        Date: match.gameDate,
        Adversaire: home === team ? away : home,
        Score: score,
        Résultat: resultat,
        Domicile: home === team,
        Etat: etat === "OFF" ? "TERMINE" : etat,
      });
    }

    if (formattedMatches.length > 0) {
      result.matchs_par_mois[monthName] = formattedMatches;
      monthsWithMatches++;
      totalMatches += formattedMatches.length;
    }
  }

  // Aucun match terminé
  if (monthsWithMatches === 0) {
    return {
      equipe: "Canadiens de Montréal",
      saison: seasonId,
      message: "Aucun match terminé disponible pour le moment",
      matchs_par_mois: {},
      total_mois: 0,
      total_matchs: 0,
    };
  }

  // Métadonnées
  result.equipe = "Canadiens de Montréal";
  result.saison = seasonId;
  result.total_mois = monthsWithMatches;
  result.total_matchs = totalMatches;

  return result;
}

document.addEventListener("DOMContentLoaded", function () {
  const resultsContainer = document.getElementById("matchs");

  loadAndDisplayMatchs();

  async function loadAndDisplayMatchs() {
    showLoading();

    try {
      const data = await getMatchsCanadiens();

      if (data.message) {
        showMessage(data.message, "info");
        return;
      }

      if (!data.matchs_par_mois || typeof data.matchs_par_mois !== "object") {
        throw new Error("Structure de données invalide");
      }

      displayMatchsByMonth(data);
    } catch (error) {
      console.error("Erreur:", error);
      showMessage(`Erreur: ${error.message}`, "error");
    }
  }

  function displayMatchsByMonth(data) {
    resultsContainer.innerHTML = "";

    const months = Object.keys(data.matchs_par_mois).sort((a, b) => {
      const dateA = new Date(data.matchs_par_mois[a][0].Date);
      const dateB = new Date(data.matchs_par_mois[b][0].Date);
      return dateB - dateA;
    });

    if (months.length === 0) {
      showMessage("Aucun match terminé disponible", "info");
      return;
    }

    months.forEach((monthName) => {
      const matches = data.matchs_par_mois[monthName];
      if (!Array.isArray(matches)) return;
      createMonthSection(monthName, matches);
    });
  }

  function createMonthSection(monthName, matches) {
    const section = document.createElement("div");
    section.className = "month-section";

    const victories = matches.filter((m) => m.Résultat === "Victoire").length;
    const defeats = matches.filter((m) => m.Résultat === "Défaite").length;

    const header = document.createElement("div");
    header.className = "month-header";
    header.innerHTML = `
            <h2>${monthName}</h2>
            <div class="month-stats">
                <span class="match-count">${matches.length} match${matches.length > 1 ? "s" : ""}</span>
                <span class="record">${victories}V-${defeats}D</span>
            </div>
        `;

    const table = document.createElement("table");
    table.className = "matches-table";

    table.innerHTML = `
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Adversaire</th>
                    <th>Score</th>
                    <th>Résultat</th>
                </tr>
            </thead>
            <tbody>
                ${matches.map((match) => createMatchRow(match)).join("")}
            </tbody>
        `;

    section.appendChild(header);
    section.appendChild(table);
    resultsContainer.appendChild(section);
  }

  function createMatchRow(match) {
    const dateParts = match.Date.split("-");
    const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

    const isHome = match.Domicile;
    const locationText = isHome ? "Domicile" : "Extérieur";

    const isVictory = match.Résultat === "Victoire";
    const resultClass = isVictory ? "victoire" : "defaite";

    let scoreDisplay = match.Score;
    if (scoreDisplay.includes("-")) {
      const [scoreHome, scoreAway] = scoreDisplay.split("-");
      scoreDisplay = isHome
        ? `${scoreHome}-${scoreAway}`
        : `${scoreAway}-${scoreHome}`;
    }

    return `
            <tr>
                <td class="match-date">${formattedDate}</td>
                <td class="opponent" title="${locationText}">
                    ${locationText} - ${match.Adversaire}
                </td>
                <td class="score">${scoreDisplay}</td>
                <td class="result-cell">
                    <span class="result-badge ${resultClass}">
                        ${match.Résultat}
                    </span>
                </td>
            </tr>
        `;
  }

  function showLoading() {
    resultsContainer.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>Chargement des matchs des Canadiens...</p>
            </div>
        `;
  }

  function showMessage(message, type = "info") {
    const icon =
      type === "error" ? "Erreur" : type === "info" ? "Information" : "Succès";

    resultsContainer.innerHTML = `
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
  }
  addStyles();
});

function addStyles() {
  const style = document.createElement("style");
  style.textContent = `
        /* === Chargement === */
        .loading-state {
            text-align: center;
            padding: 60px 20px;
            color: #192168;
        }

        .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #AE1F24;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        /* === Messages === */
        .message {
            display: flex;
            align-items: center;
            gap: 20px;
            padding: 30px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            margin: 20px auto;
            max-width: 600px;
        }

        .message.error { border-left: 5px solid #dc3545; }
        .message.info { border-left: 5px solid #17a2b8; }

        .message-icon {
            font-size: 40px;
            flex-shrink: 0;
        }

        .message-content h3 {
            margin: 0 0 10px 0;
            color: #333;
        }

        .retry-btn {
            background: #AE1F24;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: 600;
            font-size: 16px;
        }

        /* === Bloc mensuel === */
        .month-block {
            margin-bottom: 40px;
        }

        .month-block h3 {
            font-size: 1.4em;
            color: #AF1E2D;
            margin-bottom: 15px;
            text-align: center;
        }

        /* === Grille des matchs === */
        .matchs-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
            gap: 20px;
        }

        /* === Carte de match === */
        .match-card {
            background-color: #f0f4ff;
            border-left: 6px solid #0626CD;
            border-radius: 10px;
            padding: 16px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.1);
            transition: transform 0.2s ease;
        }

        .match-card:hover {
            transform: translateY(-4px);
        }

        .match-date {
            font-weight: bold;
            color: #121C68;
            margin-bottom: 8px;
        }

        .match-opponent {
            font-size: 1em;
            color: #2E3551;
            margin-bottom: 6px;
        }

        .match-score {
            font-size: 1.2em;
            font-weight: bold;
            margin-bottom: 6px;
        }

        .match-result {
            font-size: 0.95em;
            font-weight: 600;
            color: white;
            padding: 4px 10px;
            border-radius: 6px;
            display: inline-block;
        }

        .match-result.victoire {
            background-color: #2ecc71;
        }

        .match-result.defaite {
            background-color: #e74c3c;
        }

        /* === Responsive === */
        @media (max-width: 768px) {
            .matchs-grid {
                grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                gap: 15px;
            }

            .match-card {
                padding: 14px;
            }

            .match-score {
                font-size: 1.1em;
            }

            .message {
                flex-direction: column;
                text-align: center;
            }
        }

        @media (max-width: 480px) {
            .matchs-grid {
                grid-template-columns: 1fr;
            }

            .match-card {
                padding: 12px;
            }

            .match-score {
                font-size: 1em;
            }

            .match-result {
                font-size: 0.9em;
                padding: 3px 8px;
            }
        }
    `;

  document.head.appendChild(style);
}
