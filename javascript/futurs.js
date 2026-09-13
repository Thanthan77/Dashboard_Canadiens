const resultsContainer = document.getElementById("matchs");

async function loadFutureMatches() {
  showLoading();

  try {
    const data = await getMatchsCanadiens();

    // Vérifier que la structure FUT existe
    if (!data || !data.futurs_par_mois || typeof data.futurs_par_mois !== "object") {
      showMessage("Aucun match futur disponible.", "info");
      return;
    }

    // Récupérer tous les matchs FUT
    const allFutureMatches = Object.values(data.futurs_par_mois)
      .flat()
      .sort((a, b) => new Date(a.Date) - new Date(b.Date));

    // Garder seulement les 4 prochains
    const nextFour = allFutureMatches.slice(0, 4);

    if (nextFour.length === 0) {
      showMessage("Aucun match futur disponible.", "info");
      return;
    }

    displayFutureMatches(nextFour);

  } catch (error) {
    console.error(error);
    showMessage("Erreur lors du chargement des futurs matchs.", "error");
  }
}

function displayFutureMatches(matches) {
  resultsContainer.innerHTML = "";

  const section = document.createElement("div");
  section.className = "month-section";

  const header = document.createElement("div");
  header.className = "month-header";
  header.innerHTML = `
    <h2>Prochains Matchs</h2>
    <div class="month-stats">
      <span class="match-count">${matches.length} match${matches.length > 1 ? "s" : ""}</span>
    </div>
  `;

  const table = document.createElement("table");
  table.className = "matches-table";

  table.innerHTML = `
    <thead>
      <tr>
        <th>Date</th>
        <th>Adversaire</th>
        <th>Lieu</th>
      </tr>
    </thead>
    <tbody>
      ${matches.map((m) => createFutureRow(m)).join("")}
    </tbody>
  `;

  section.appendChild(header);
  section.appendChild(table);
  resultsContainer.appendChild(section);
}

function createFutureRow(match) {
  const dateParts = match.Date.split("-");
  const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

  const locationText = match.Domicile ? "Domicile" : "Extérieur";

  return `
    <tr>
      <td class="match-date">${formattedDate}</td>
      <td class="opponent">${match.Adversaire}</td>
      <td class="location">${locationText}</td>
    </tr>
  `;
}

function showLoading() {
  resultsContainer.innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Chargement des futurs matchs...</p>
    </div>
  `;
}

function showMessage(message, type = "info") {
  const icon = type === "error" ? "Erreur" : "Information";

  resultsContainer.innerHTML = `
    <div class="message ${type}">
      <div class="message-icon">${icon}</div>
      <div class="message-content">
        <h3>${icon}</h3>
        <p>${message}</p>
      </div>
    </div>
  `;
}

loadFutureMatches();
