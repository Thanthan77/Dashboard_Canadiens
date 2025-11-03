fetch('http://localhost/api/resultmatchs')
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById('matchs');
    container.innerHTML = '';

    data.forEach(match => {
      const box = document.createElement('div');
      box.className = `match-box ${match.couleur_resultat}`;

      box.innerHTML = `
        <h3>${match.date_match}</h3>
        <p class="score">${match.equipe_domicile} ${match.score_domicile} vs ${match.equipe_exterieure} ${match.score_exterieure}</p>
        <p>${match.lieu}</p>
      `;

      container.appendChild(box);
    });
  })
  .catch(err => {
    console.error("Erreur chargement des résultats :", err);
    document.getElementById('matchs').innerHTML = "<p>Impossible de charger les résultats.</p>";
  });
