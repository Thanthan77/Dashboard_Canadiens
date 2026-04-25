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
  const month = today.getMonth() + 1; // 1 = janvier, 12 = décembre

  // La saison NHL commence en octobre (mois 10)
  if (month >= 10) {
    // Exemple : octobre 2025 → saison 2025‑2026
    return `${year}-${year + 1}`;
  } else {
    // Exemple : avril 2026 → saison 2025‑2026
    return `${year - 1}-${year}`;
  }
}

/* ---------------------------------------------------------
   Charger le classement NHL (API stable toute l'année)
--------------------------------------------------------- */
async function getClassementNHL() {
  const url = "https://api.nhle.com/stats/rest/en/standings";
  const data = await getJson(url);

  if (!data || !data.data) {
    console.error("Impossible de charger le classement NHL");
    return [];
  }

  return data.data.map((team, index) => ({
    rang: index + 1,
    equipe: team.teamCommonName,
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

  // Déterminer automatiquement la saison
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
