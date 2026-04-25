
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

const seasonId = getCurrentSeasonId();

  // PROXY CORS
  const proxy = "https://corsproxy.io/?";

  // URL API NHL (AVEC PROXY)
  const url = proxy + `https://api-web.nhle.com/v1/club-schedule-season/${team}/${seasonId}`;
  const data = await getJson(url);

  if (!data || !data.games) {
    return {
      error: "Données introuvables pour les Canadiens",
    };
  }

 const frenchMonths = {
  "10": "Octobre",
  "11": "Novembre",
  "12": "Décembre",
  "01": "Janvier",
  "02": "Février",
  "03": "Mars",
  "04": "Avril",
  "05": "Mai",
  "06": "Juin"
};


  const matchesByMonth = {};

  // Grouper les matchs par mois
  for (const match of data.games) {
    const date = match.gameDate;
    if (!date) continue;

    const monthNum = date.substring(5, 7);
    const yearMonth = date.substring(0, 7);

    // mois hors saison
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

    // Verifie si le match est fini
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


    addStyles();
    
    function addStyles() {
    const style = document.createElement('style');
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

    
    
    
