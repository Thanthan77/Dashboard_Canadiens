const params = new URLSearchParams(window.location.search);
const id = params.get('id');

if (!id) {
  document.getElementById('statistiques').innerHTML = "<p>ID joueur manquant.</p>";
  throw new Error("ID joueur manquant dans l'URL");
}

const baseURL = window.location.hostname.includes('localhost') ? 'http://localhost/api' : 'https://dashboard-canadiens.onrender.com/api';
fetch(`${baseURL}/stats/${id}`)
  .then(res => {
    if (!res.ok) {
      throw new Error(`Erreur HTTP : ${res.status}`);
    }
    return res.json();
  })
  .then(data => {
    const container = document.getElementById('statistiques');

    if (data.error) {
      container.innerHTML = `<p>${data.error}</p>`;
      return;
    }

    const positionsMap = {
    C: "Centre",
    L: "Ailier gauche",
    R: "Ailier droit",
    D: "Défenseur",
    G: "Gardien"
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
  })
  .catch(error => {
    console.error("Erreur lors du chargement des statistiques :", error);
    document.getElementById('statistiques').innerHTML = "<p>Impossible de charger les statistiques du joueur.</p>";
  });
