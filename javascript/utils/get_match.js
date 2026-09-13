
async function getJson(url) {
  try {
    const response = await fetch(url);
    return await response.json();
  } catch (e) {
    console.error("Erreur fetch :", e);
    return null;
  }
}

export async function getMatchsCanadiens() {
  const team = "MTL";

  // Déterminer la saison NHL
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const seasonStart = month >= 9 ? year : year - 1;
  const seasonEnd = seasonStart + 1;
  const seasonId = `${seasonStart}${seasonEnd}`;

  const proxy = "https://proxy12.ethanqc-chea.workers.dev/?url=";
  const url = `${proxy}https://api-web.nhle.com/v1/club-schedule-season/${team}/${seasonId}`;
  const data = await getJson(url);

  if (!data?.games) {
    return { error: "Données introuvables pour les Canadiens" };
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
    "06": "Juin",
  };

  const result = { matchs_par_mois: {} };
  let totalMatches = 0;

  for (const match of data.games) {
    const date = match.gameDate;
    if (!date) continue;

    const monthNum = date.substring(5, 7);
    if (["07", "08", "09"].includes(monthNum)) continue; // ignorer les mois de juillet, août et septembre

    const yearMonth = date.substring(0, 7);
    const monthName = frenchMonths[monthNum] || `Mois ${monthNum}`;

    const home = match.homeTeam?.abbrev;
    const away = match.awayTeam?.abbrev;
    const scoreHome = match.homeTeam?.score;
    const scoreAway = match.awayTeam?.score;
    const state = match.gameState;

    const isFinished =
      state === "FINAL" ||
      (state === "OFF" && scoreHome != null && scoreAway != null);

    if (!isFinished) continue;

    const isHome = home === team;
    const resultat = isHome
      ? scoreHome > scoreAway ? "Victoire" : "Défaite"
      : scoreAway > scoreHome ? "Victoire" : "Défaite";

    const formatted = {
      Date: date,
      Adversaire: isHome ? away : home,
      Score: `${scoreHome}-${scoreAway}`,
      Résultat: resultat,
      Domicile: isHome,
      Etat: state === "OFF" ? "TERMINE" : state,
    };

    if (!result.matchs_par_mois[monthName]) {
      result.matchs_par_mois[monthName] = [];
    }

    result.matchs_par_mois[monthName].push(formatted);
    totalMatches++;
  }

  result.equipe = "Canadiens de Montréal";
  result.saison = seasonId;
  result.total_mois = Object.keys(result.matchs_par_mois).length;
  result.total_matchs = totalMatches;

  return result;
}
