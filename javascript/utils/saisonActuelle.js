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
  const start = month >= 10 ? year : year - 1;
  const end = start + 1;

  return `${start}${end}`; // format "20252026"
}
