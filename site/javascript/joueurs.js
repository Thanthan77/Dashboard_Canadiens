document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('joueurs');

  loadAndDisplayPlayers();

  async function loadAndDisplayPlayers() {
    showLoading();

    try {
      const baseURL = window.location.hostname.includes('localhost') ? 'http://localhost/api' : 'https://dashboard-canadiens.onrender.com/api';
      const response = await fetch(`${baseURL}/joueurs`);

      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
      }

      const joueurs = await response.json();

      if (!Array.isArray(joueurs)) {
        throw new Error('Structure de données invalide');
      }

      displayPlayers(joueurs);
    } catch (error) {
      console.error('Erreur lors du chargement des joueurs :', error);
      showMessage(`Erreur : ${error.message}`, 'error');
    }
  }

  function displayPlayers(joueurs) {
    container.innerHTML = '';

    if (joueurs.length === 0) {
      showMessage('Aucun joueur trouvé.', 'info');
      return;
    }

    joueurs.forEach(joueur => {
      const card = document.createElement('div');
      card.className = 'joueur-card';

      const prenom = joueur.prenom || '';
      const nom = joueur.nom || '';
      const numero = joueur.numero !== undefined ? joueur.numero : '';
      const id = joueur.id;

      card.innerHTML = `
        <div class="nom">${prenom} ${nom}</div>
        <div class="numero">#${numero}</div>
      `;

      card.addEventListener('click', () => {
        window.location.href = `statistiqueJoueur.html?id=${id}`;
      });

      container.appendChild(card);
    });
  }

  function showLoading() {
    container.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Chargement des joueurs...</p>
      </div>
    `;
  }

  function showMessage(message, type = 'info') {
    const icon = type === 'error' ? '❌' : type === 'info' ? 'ℹ️' : '✅';

    container.innerHTML = `
      <div class="message ${type}">
        <div class="message-icon">${icon}</div>
        <div class="message-content">
          <h3>${type === 'error' ? 'Erreur' : 'Information'}</h3>
          <p>${message}</p>
          ${type === 'error' ? '<button onclick="location.reload()" class="retry-btn">Réessayer</button>' : ''}
        </div>
      </div>
    `;
  }
});
