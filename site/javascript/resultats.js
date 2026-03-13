document.addEventListener('DOMContentLoaded', function () {
    const resultsContainer = document.getElementById('matchs');

    loadAndDisplayMatchs();

    async function loadAndDisplayMatchs() {
        showLoading();

        try {
            const baseURL = window.location.hostname.includes('localhost')
                ? 'http://localhost/api'
                : 'https://dashboard-canadiens.onrender.com/api';

            const response = await fetch(`${baseURL}/matchs`);

            if (!response.ok) {
                throw new Error(`Erreur HTTP ${response.status}`);
            }

            const data = await response.json();

            if (data.message) {
                showMessage(data.message, 'info');
                return;
            }

            if (!data.matchs_par_mois || typeof data.matchs_par_mois !== 'object') {
                throw new Error('Structure de données invalide');
            }

            displayMatchsByMonth(data.matchs_par_mois);

        } catch (error) {
            console.error('Erreur:', error);
            showMessage(`Erreur: ${error.message}`, 'error');
        }
    }

    function displayMatchsByMonth(matchsParMois) {
        resultsContainer.innerHTML = '';

        const months = Object.keys(matchsParMois);

        if (months.length === 0) {
            showMessage('Aucun match terminé disponible', 'info');
            return;
        }

        months.forEach(monthName => {
            const matches = matchsParMois[monthName];

            if (!Array.isArray(matches)) return;

            createMonthBlock(monthName, matches);
        });
    }

    function createMonthBlock(monthName, matches) {
        const block = document.createElement('div');
        block.className = 'month-block';

        const victories = matches.filter(m => m.Résultat === 'Victoire').length;
        const defeats = matches.filter(m => m.Résultat === 'Defaite').length;

        block.innerHTML = `
            <h3>${monthName} (${matches.length} matchs, ${victories}V-${defeats}D)</h3>
            <div class="matchs-grid">
                ${matches.map(match => createMatchCard(match)).join('')}
            </div>
        `;

        resultsContainer.appendChild(block);
    }

    function createMatchCard(match) {
        const dateParts = match.Date.split('-');
        const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

        const isHome = match.Domicile;
        const locationText = isHome ? 'Domicile' : 'Extérieur';

        const isVictory = match.Résultat === 'Victoire';
        const resultClass = isVictory ? 'victoire' : 'defaite';

        let scoreDisplay = match.Score;
        if (scoreDisplay.includes('-')) {
            const [scoreHome, scoreAway] = scoreDisplay.split('-');
            scoreDisplay = isHome ? `${scoreHome}-${scoreAway}` : `${scoreAway}-${scoreHome}`;
        }

        return `
            <div class="match-card">
                <div class="match-date">${formattedDate}</div>
                <div class="match-opponent">${locationText} - ${match.Adversaire}</div>
                <div class="match-score">${scoreDisplay}</div>
                <div class="match-result ${resultClass}">
                    ${match.Résultat}
                </div>
            </div>
        `;
    }

    function showLoading() {
        resultsContainer.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>Chargement des matchs des Canadiens...</p>
            </div>
        `;
    }

    function showMessage(message, type = 'info') {
        const icon = type === 'error' ? '❌' : 'ℹ️';

        resultsContainer.innerHTML = `
            <div class="message ${type}">
                <div class="message-icon">${icon}</div>
                <div class="message-content">
                    <h3>${type === 'error' ? 'Erreur' : 'Information'}</h3>
                    <p>${message}</p>
                    ${type === 'error'
                        ? '<button onclick="location.reload()" class="retry-btn">Réessayer</button>'
                        : ''
                    }
                </div>
            </div>
        `;
    }
});
