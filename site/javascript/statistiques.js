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

    joueurs.forEach(joueur => {
      const card = document.createElement('div');
      card.className = 'stats-card';

      const prenom = joueur.prenom || '';
      const nom = joueur.nom || '';
      const numero = joueur.numero !== undefined ? `#${joueur.numero}` : '';
      const position = joueur.position || '';

      if (position === 'G') {
        // Gardien
        card.innerHTML = `
          <h3>${numero} ${prenom} ${nom}</h3>
          <p>Position : Gardien</p>
          <p>Arrêts : ${joueur.arrets ?? '??'}</p>
          <p>Tirs reçus : ${joueur.tirs_reçus ?? '??'}</p>
          <p>% Arrêts : ${joueur.pourcentage_arrets ?? '??'}</p>
          <p>Buts encaissés : ${joueur.buts_encaissés ?? '??'}</p>
          <p>Blanchissages : ${joueur.blanchissages ?? '??'}</p>
          <p>Temps de jeu : ${joueur.temps_de_jeu ?? '??'} min</p>
        `;
        gardiens.appendChild(card);
      } else {
        // Attaquant ou Défenseur
        const role = (position === 'D') ? 'Défenseur' : 'Attaquant';
        card.innerHTML = `
          <h3>${numero} ${prenom} ${nom}</h3>
          <p>Position : ${role}</p>
          <p>Buts : ${joueur.buts ?? '0'}</p>
          <p>Passes : ${joueur.passes ?? '0'}</p>
          <p>Points : ${joueur.points ?? '0'}</p>
        `;
        if (position === 'D') {
          defenseurs.appendChild(card);
        } else {
          attaquants.appendChild(card);
        }
      }
    });
  })
  .catch(err => {
    console.error("Erreur chargement joueurs :", err);
    document.getElementById('attaquants').innerHTML = "<p>Impossible de charger les joueurs.</p>";
    document.getElementById('defenseurs').innerHTML = "<p>Impossible de charger les joueurs.</p>";
    document.getElementById('gardiens').innerHTML = "<p>Impossible de charger les joueurs.</p>";
  });
