fetch('/api/joueurs')
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById('joueurs');
    data.forEach(joueur => {
      const div = document.createElement('div');
      div.className = 'joueur-card';
      div.innerHTML = `
        <h3>#${joueur.numero} ${joueur.prenom} ${joueur.nom}</h3>
        <p>Poste : ${joueur.position}</p>
        <p>Buts : ${joueur.buts} | Passes : ${joueur.passes} | Points : ${joueur.points}</p>
      `;
      container.appendChild(div);
    });
  });