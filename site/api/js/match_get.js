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

  // URL API NHL
  const url = `https://api-web.nhle.com/v1/club-schedule-season/${team}/${seasonId}`;
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
