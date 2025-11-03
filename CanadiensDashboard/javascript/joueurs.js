fetch('http://localhost/api/joueurs') // Utilise l'URL absolue si tu es en local
  .then(res => {
    if (!res.ok) {
      throw new Error(`Erreur HTTP : ${res.status}`);
    }
    return res.json();
  })
  .then(data => {
    const container = document.getElementById('joueurs');
    container.innerHTML = ''; // Nettoie le conteneur

    if (!Array.isArray(data) || data.length === 0) {
      container.innerHTML = "<p>Aucun joueur trouvé.</p>";
      return;
    }

    data.forEach(joueur => {
      const card = document.createElement('div');
      card.className = 'joueur-card';

      // Sécurise les champs pour éviter les erreurs
      const prenom = joueur.prenom || '';
      const nom = joueur.nom || '';
      const numero = joueur.numero !== undefined ? `#${joueur.numero}` : '';

      card.innerHTML = `
        <div class="nom">${prenom} ${nom}</div>
        <div class="numero">${numero}</div>
      `;
      container.appendChild(card);
    });
  })
  .catch(error => {
    console.error("Erreur lors du chargement des joueurs :", error);
    const container = document.getElementById('joueurs');
    container.innerHTML = "<p>Impossible de charger les joueurs.</p>";
  });
