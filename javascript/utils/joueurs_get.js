async function getJoueursCanadiens() {
  const saisonId = getCurrentSeasonId(); // ex: 20242025
  const teamId = 8; // Montréal

  const proxy = "https://corsproxy.io/?";
  const base = "https://api.nhle.com/stats/rest/en";

  // Skaters (attaquants + défenseurs)
  const skatersUrl =
    proxy +
    `${base}/skater/summary?cayenneExp=teamId=${teamId}%20and%20seasonId=${saisonId}`;
  const skatersData = await getJson(skatersUrl);

  // Goalies
  const goaliesUrl =
    proxy +
    `${base}/goalie/summary?cayenneExp=teamId=${teamId}%20and%20seasonId=${saisonId}`;
  const goaliesData = await getJson(goaliesUrl);

  if (!skatersData?.data && !goaliesData?.data) {
    console.error("Roster introuvable");
    return [];
  }

  const groupes = {
    forwards: [],
    defensemen: [],
    goalies: [],
  };

  // Skaters
  for (const j of skatersData?.data ?? []) {
    if (j.positionCode === "D") groupes.defensemen.push(j);
    else groupes.forwards.push(j);
  }

  // Goalies
  for (const j of goaliesData?.data ?? []) {
    groupes.goalies.push(j);
  }

  const joueurs = [];

  for (const groupe of ["forwards", "defensemen", "goalies"]) {
    for (const joueur of groupes[groupe]) {
      const id = joueur.playerId;
      const prenom = joueur.firstName ?? "";
      const nom = joueur.lastName ?? "";
      const numero = joueur.sweaterNumber ?? "";
      const position = joueur.positionCode ?? "";
      const pays = joueur.birthCountry ?? "";

      const headshot = `https://assets.nhle.com/mugs/nhl/${id}.png`;

      const type = position === "G" ? "goalie" : "skater";

      const statsUrl =
        proxy +
        `${base}/${type}/summary?cayenneExp=playerId=${id}%20and%20seasonId=${saisonId}`;

      const statsData = await getJson(statsUrl);
      const ligne = statsData?.data?.[0] ?? null;

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
        buts_encaissés: butsEncaisses,
        blanchissages,
        temps_de_jeu: tempsDeJeu,
      });
    }
  }

  return joueurs;
}
