async function getJson(url) {
  try {
    const proxy = "https://corsproxy.io/?";
    const encoded = encodeURIComponent(url);
    const response = await fetch(proxy + encoded);
    return await response.json();
  } catch (e) {
    console.error("Erreur fetch :", e);
    return null;
  }
}

async function getInfosJoueur(id) {
  if (!id || isNaN(id)) {
    return { error: "ID joueur invalide" };
  }

  id = Number(id);

  // Calcul de la saison actuelle (comme ton PHP)
  const now = new Date();
  const annee = now.getFullYear();
  const mois = now.getMonth() + 1;
  const saisonDebut = mois < 7 ? annee - 1 : annee;
  const saisonFin = saisonDebut + 1;
  const saisonId = Number(`${saisonDebut}${saisonFin}`);

  // Infos joueur
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

  //Stats joueur
  const type = position === "G" ? "goalie" : "skater";
  const statsUrl = `https://api.nhle.com/stats/rest/en/${type}/summary?cayenneExp=playerId=${id}`;
  const statsData = await getJson(statsUrl);

  let ligne = null;
  for (const item of statsData?.data ?? []) {
    if (item.seasonId === saisonId) {
      ligne = item;
      break;
    }
  }

  //Stats communes
  const buts = ligne?.goals ?? null;
  const passes = ligne?.assists ?? null;
  const points = ligne?.points ?? null;

  // Stats gardien
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

// RÉCUPÉRATION DU ROSTER
async function getJoueursCanadiens() {
  const saisonId = getCurrentSeasonId();

  // Roster saisonnel (fonctionne vraiment)
  const rosterUrl = `https://api-web.nhle.com/v1/roster/MTL/${saisonId}`;
  const rosterData = await getJson(rosterUrl);

  if (!rosterData) {
    console.error("Roster introuvable");
    return [];
  }

  const groupes = ["forwards", "defensemen", "goalies"];
  const joueurs = [];

  for (const groupe of groupes) {
    for (const joueur of rosterData[groupe] ?? []) {
      const info = await getInfosJoueur(joueur.id);
      if (!info.error) joueurs.push(info);
    }
  }

  return joueurs;
}
