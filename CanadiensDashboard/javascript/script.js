fetch('../api/joueurs') // Chemin relatif depuis joueurs.html
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById('joueurs');
    container.innerHTML = ''; // Nettoie le conteneur avant d'ajouter

    data.forEach(joueur => {
      const card = document.createElement('div');
      card.className = 'joueur-card';
      card.innerHTML = `
        <div class="nom">${joueur.prenom} ${joueur.nom}</div>
        <div class="numero">#${joueur.numero}</div>
      `;
      container.appendChild(card);
    });
  })
  .catch(error => {
    console.error("Erreur lors du chargement des joueurs :", error);
    document.getElementById('joueurs').innerHTML = "<p>Impossible de charger les joueurs.</p>";
  });
