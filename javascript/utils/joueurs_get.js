async function getJoueursCanadiens() {
  // Déterminer la saison actuelle (ex: 20242025)
  const saisonId = getCurrentSeasonId();

  // Proxy CORS
  const proxy = "https://corsproxy.io/?";

  // Récupérer le roster via API Stats (teamId = 8 pour Montréal)
  const rosterUrl =
    proxy +
    "https://api.nhle.com/stats/rest/en/team/roster?cayenneExp=teamId=8";
  const rosterData = await getJson(rosterUrl);

  if (!rosterData?.data) {
    console.error("Roster introuvable");
    return [];
  }

  // On recrée les mêmes groupes que ton code original
  const groupes = {
    forwards: [],
    defensemen: [],
    goalies: [],
  };

  // On répartit les joueurs dans les groupes
  for (const j of rosterData.data) {
    if (j.positionCode === "G") groupes.goalies.push(j);
    else if (j.positionCode === "D") groupes.defensemen.push(j);
    else groupes.forwards.push(j);
  }

  const joueurs = [];

  // Même structure que ton code original
  for (const groupe of ["forwards", "defensemen", "goalies"]) {
    for (const joueur of groupes[groupe]) {
      const id = joueur.playerId;
      const prenom = joueur.firstName ?? "";
      const nom = joueur.lastName ?? "";
      const numero = joueur.sweaterNumber ?? "";
      const position = joueur.positionCode ?? "";
      const pays = joueur.birthCountry ?? "";

      // Headshot reconstruit (format officiel NHL)
      const headshot = `https://assets.nhle.com/mugs/nhl/${id}.png`;

      // Récupérer les stats individuelles
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
      const buts = ligne?.goals ?? 0;
      const passes = ligne?.assists ?? 0;
      const points = ligne?.points ?? 0;

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
