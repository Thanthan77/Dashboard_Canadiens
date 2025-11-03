fetch('https://api-web.nhle.com/v1/roster/MTL/current')
  .then(res => res.json())
  .then(data => {
    const attaquants = document.getElementById('attaquants');
    const defenseurs = document.getElementById('defenseurs');
    const gardiens = document.getElementById('gardiens');

    const joueurs = [
      ...data.forwards,
      ...data.defensemen,
      ...data.goalies
    ];

    joueurs.forEach(joueur => {
      const card = document.createElement('div');
      card.className = 'stats-card';

      const id = joueur.id;
      const numero = joueur.sweaterNumber ?? '??';
      const prenom = joueur.firstName.default;
      const nom = joueur.lastName.default;
      const position = joueur.position;

      card.innerHTML = `
        <h3>#${numero} ${prenom} ${nom}</h3>
        <p>Position : ${position}</p>
      `;

      if (position.includes('Goalie')) {
        gardiens.appendChild(card);
      } else if (position.includes('Defenseman')) {
        defenseurs.appendChild(card);
      } else {
        attaquants.appendChild(card);
      }
    });
  })
  .catch(err => {
    console.error("Erreur chargement joueurs :", err);
    document.getElementById('attaquants').innerHTML += "<p>Erreur de chargement des données.</p>";
    document.getElementById('defenseurs').innerHTML += "<p>Erreur de chargement des données.</p>";
    document.getElementById('gardiens').innerHTML += "<p>Erreur de chargement des données.</p>";
  });
