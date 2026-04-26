// Saison en format "2025-2026"

function getCurrentSeasonText() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  if (month >= 10) {
    return `${year}-${year + 1}`;
  } else {
    return `${year - 1}-${year}`;
  }
}

// Saison Actuelle

function getCurrentSeasonId() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  // Saison NHL commence en octobre
  if (month >= 10) {
    return Number(`${year}${year + 1}`);
  } else {
    return Number(`${year - 1}${year}`);
  }
}
