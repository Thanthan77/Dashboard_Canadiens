fetch('http://localhost/api/joueurs')
  .then(res => {
    if (!res.ok) {
      throw new Error(`Erreur HTTP : ${res.status}`);
    }
    return res.json();
  })
  .then(joueurs => {
    const container = document.getElementById('joueurs');
    container.innerHTML = '';

    if (!Array.isArray(joueurs) || joueurs.length === 0) {
      container.innerHTML = "<p>Aucun joueur trouvé.</p>";
      return;
    }

    joueurs.forEach(joueur => {
      const card = document.createElement('div');
      card.className = 'joueur-card';

      const prenom = joueur.prenom || '';
      const nom = joueur.nom || '';
      const numero = joueur.numero !== undefined ? joueur.numero : '';

      card.innerHTML = `
        <div class="nom">${prenom} ${nom}</div>
        <div class="numero">#${numero}</div>
      `;

      container.appendChild(card);
    });
  })
  .catch(error => {
    console.error("Erreur lors du chargement des joueurs :", error);
    document.getElementById('joueurs').innerHTML = "<p>Impossible de charger les joueurs.</p>";
  });
