async function getJson(url) {
  try {
    const response = await fetch(url);
    return await response.json();
  } catch (e) {
    console.error("Erreur fetch :", e);
    return null;
  }
}

async function getClassementNHL() {
  const proxy = "https://corsproxy.io/?";
  const api = "https://api-web.nhle.com/v1/standings/now";

  const data = await getJson(proxy + api);

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

document.addEventListener("DOMContentLoaded", async () => {
  const classement = await getClassementNHL();
  const tbody = document.getElementById("classement-body");
  const titre = document.getElementById("titre-saison");

  // Fonction dans Fichier SaisonActuelle.js
  const saison = getCurrentSeasonText();
  titre.textContent = `Classement LNH – Saison ${saison}`;

  classement.forEach((team) => {
    const row = document.createElement("tr");

    if (
      team.equipe.toLowerCase().includes("montreal") ||
      team.equipe.toLowerCase().includes("canadiens")
    ) {
      row.classList.add("montreal");
    }

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
