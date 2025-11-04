fetch('../api/joueurs')
  .then(res => {
    if (!res.ok) {
      throw new Error(`Erreur HTTP : ${res.status}`);
    }
    return res.json();
  })
  .then(joueurs => {
    const attaquants = document.getElementById('attaquants');
    const defenseurs = document.getElementById('defenseurs');
    const gardiens = document.getElementById('gardiens');

    attaquants.innerHTML = '';
    defenseurs.innerHTML = '';
    gardiens.innerHTML = '';

    // Séparer les gardiens des autres joueurs
    const gardienIds = joueurs.filter(j => j.position === 'G').map(j => j.id);
    const autresJoueurs = joueurs.filter(j => j.position !== 'G');

    // Affichage des attaquants et défenseurs
    autresJoueurs.forEach(joueur => {
      const card = document.createElement('div');
      card.className = 'stats-card';

      const prenom = joueur.prenom || '';
      const nom = joueur.nom || '';
      const numero = joueur.numero !== undefined ? `#${joueur.numero}` : '';
      const position = joueur.position || '';

      const role = (position === 'D') ? 'Défenseur' : 'Attaquant';

      card.innerHTML = `
        <h3>${numero} ${prenom} ${nom}</h3>
        <p>Position : ${role}</p>
        <p>Buts : ${joueur.buts ?? '??'}</p>
        <p>Passes : ${joueur.passes ?? '??'}</p>
        <p>Points : ${joueur.points ?? '??'}</p>
      `;

      if (position === 'D') {
        defenseurs.appendChild(card);
      } else {
        attaquants.appendChild(card);
      }
    });

    // Appel séparé pour les stats des gardiens
    fetch('http://localhost/api/gardiens')
      .then(res => res.json())
      .then(statsGardiens => {
        statsGardiens.forEach(stats => {
          const joueur = joueurs.find(j => j.id === stats.joueur_id);
          if (!joueur) return;

          const card = document.createElement('div');
          card.className = 'stats-card';

          const prenom = joueur.prenom || '';
          const nom = joueur.nom || '';
          const numero = joueur.numero !== undefined ? `#${joueur.numero}` : '';

          card.innerHTML = `
            <h3>${numero} ${prenom} ${nom}</h3>
            <p>Position : Gardien</p>
            <p>Arrêts : ${stats.arrets ?? '??'}</p>
            <p>Tirs reçus : ${stats.tirs_reçus ?? '??'}</p>
            <p>% Arrêts : ${stats.pourcentage_arrets ?? '??'}</p>
            <p>Buts encaissés : ${stats.buts_encaissés ?? '??'}</p>
            <p>Blanchissages : ${stats.blanchissages ?? '??'}</p>
            <p>Temps de jeu : ${stats.temps_de_jeu ?? '??'} min</p>
          `;
          gardiens.appendChild(card);
        });
      })
      .catch(err => {
        console.error("Erreur chargement stats gardiens :", err);
        gardiens.innerHTML = "<p>Impossible de charger les stats des gardiens.</p>";
      });
  })
  .catch(err => {
    console.error("Erreur chargement joueurs :", err);
    document.getElementById('attaquants').innerHTML = "<p>Impossible de charger les joueurs.</p>";
    document.getElementById('defenseurs').innerHTML = "<p>Impossible de charger les joueurs.</p>";
    document.getElementById('gardiens').innerHTML = "<p>Impossible de charger les joueurs.</p>";
  });
