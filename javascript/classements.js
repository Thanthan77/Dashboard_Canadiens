async function getJson(url) {
  try {
    const response = await fetch(url);
    return await response.json();
  } catch (e) {
    console.error("Erreur fetch :", e);
    return null;
  }
}

/* ---------------------------------------------------------
   Déterminer automatiquement la saison actuelle
--------------------------------------------------------- */
function getCurrentSeason() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  // Saison NHL commence en octobre
  if (month >= 10) {
    return `${year}-${year + 1}`;
  } else {
    return `${year - 1}-${year}`;
  }
}

/* ---------------------------------------------------------
   Charger le classement NHL (API qui MARCHE en frontend)
--------------------------------------------------------- */
async function getClassementNHL() {
  // API qui fonctionne côté navigateur
  const url = "https://api-web.nhle.com/v1/standings/now";
  const data = await getJson(url);

  if (!data || !data.standings) {
    console.error("Impossible de charger le classement NHL");
    return [];
  }

  return data.standings.map((team, index) => ({
    rang: index + 1,
    equipe: team.teamName.default,
    mj: team.gamesPlayed,
    v: team.wins,
    d: team.losses,
    dp: team.otLosses,
    pts: team.points,
  }));
}

/* ---------------------------------------------------------
   Injection dans le tableau HTML
--------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", async () => {
  const classement = await getClassementNHL();
  const tbody = document.getElementById("classement-body");
  const titre = document.getElementById("titre-saison");

  // Titre dynamique
  const saison = getCurrentSeason();
  titre.textContent = `Classement LNH – Saison ${saison}`;

  // Remplir le tableau
  classement.forEach((team) => {
    const row = document.createElement("tr");
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
});
