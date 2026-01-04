document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('statistiques');
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    showMessage("ID joueur manquant dans l'URL.", 'error');
    return;
  }

  loadAndDisplayStats(id);

  async function loadAndDisplayStats(joueurId) {
    showLoading();

    try {
      const baseURL = window.location.hostname.includes('localhost') ? 'http://localhost/api' : 'https://dashboard-canadiens.onrender.com/api';
      const response = await fetch(`${baseURL}/stats/${joueurId}`);

      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        showMessage(data.error, 'error');
        return;
      }

      displayStats(data);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques :', error);
      showMessage("Impossible de charger les statistiques du joueur.", 'error');
    }
  }

  function displayStats(data) {
    const positionsMap = {
      C: 'Centre',
      L: 'Ailier gauche',
      R: 'Ailier droit',
      D: 'Défenseur',
      G: 'Gardien'
    };

    function alpha3ToAlpha2(code) {
      try {
        return new Map([
          ['CAN', 'CA'], ['USA', 'US'], ['SWE', 'SE'], ['FIN', 'FI'], ['RUS', 'RU'],
          ['CZE', 'CZ'], ['SVK', 'SK'], ['GER', 'DE'], ['SUI', 'CH'], ['FRA', 'FR'],
          ['NOR', 'NO'], ['DNK', 'DK'], ['LAT', 'LV'], ['GBR', 'GB'], ['AUT', 'AT']
        ]).get(code) || code;
      } catch {
        return code;
      }
    }

    const countryName = new Intl.DisplayNames(['fr'], { type: 'region' });
    const nomPays = countryName.of(alpha3ToAlpha2(data.pays));

    const html = `
      <div class="carte-joueur">
        <img src="${data.headshot}" alt="Photo de ${data.prenom} ${data.nom}" class="photo-joueur">
        <h2>${data.prenom} ${data.nom} <span class="numero">#${data.numero}</span></h2>
        <p><strong>Position :</strong> ${positionsMap[data.position] || data.position}</p>
        <p><strong>Pays :</strong> ${nomPays}</p>
        <hr>
        <h3>Statistiques ${new Date().getFullYear()}-${new Date().getFullYear() + 1}</h3>
        <ul>
          ${data.position === 'G' ? `
            <li><strong>Arrêts :</strong> ${data.arrets ?? 'N/A'}</li>
            <li><strong>Tirs reçus :</strong> ${data.tirs_reçus ?? 'N/A'}</li>
            <li><strong>Pourcentage d’arrêts :</strong> ${data.pourcentage_arrets ?? 'N/A'}</li>
            <li><strong>Buts encaissés :</strong> ${data.buts_encaissés ?? 'N/A'}</li>
            <li><strong>Blanchissages :</strong> ${data.blanchissages ?? 'N/A'}</li>
            <li><strong>Temps de jeu :</strong> ${data.temps_de_jeu ?? 'N/A'} min</li>
          ` : `
            <li><strong>Buts :</strong> ${data.buts ?? 'N/A'}</li>
            <li><strong>Passes :</strong> ${data.passes ?? 'N/A'}</li>
            <li><strong>Points :</strong> ${data.points ?? 'N/A'}</li>
          `}
        </ul>
      </div>
    `;

    container.innerHTML = html;
  }

  function showLoading() {
    container.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Chargement des statistiques du joueur...</p>
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
