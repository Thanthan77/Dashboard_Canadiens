async function getJoueursCanadiens() {
  // Déterminer la saison actuelle
  const saisonId = getCurrentSeasonText();

  // Récupérer le roster (API web)
  const rosterUrl = "https://api-web.nhle.com/v1/roster/MTL/${saisonId}";
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

      // Récupérer les stats individuelles (API stats)
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
        buts_encaissés: butsEncaisses,
        blanchissages,
        temps_de_jeu: tempsDeJeu,
      });
    }
  }

  return joueurs;
}
