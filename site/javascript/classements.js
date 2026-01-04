document.addEventListener('DOMContentLoaded', () => {
    const titreElement = document.getElementById('titre-saison');
    const tbody = document.getElementById('classement-body');

    setSeasonTitle();
    loadAndDisplayClassements();

    function setSeasonTitle() {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        let saisonDebut;
        let saisonFin;
        if (currentMonth >= 9) {
            saisonDebut = currentYear;
            saisonFin = currentYear + 1;
        } else {
            saisonDebut = currentYear - 1;
            saisonFin = currentYear;
        }

        titreElement.textContent = `Classements LNH - Saison ${saisonDebut}-${saisonFin}`;
    }

    async function loadAndDisplayClassements() {
        showLoading();

        try {
            const baseURL = window.location.hostname.includes('localhost') ? 'http://localhost/api' : 'https://dashboard-canadiens.onrender.com/api';
            const response = await fetch(`${baseURL}/classements`);

            if (!response.ok) {
                throw new Error(`Erreur HTTP ${response.status}`);
            }

            const data = await response.json();

            if (!Array.isArray(data)) {
                throw new Error('Structure de données invalide');
            }

            displayClassements(data);
        } catch (error) {
            console.error('Erreur chargement du classement :', error);
            showMessage('Impossible de charger les données.', 'error');
        }
    }

    function displayClassements(data) {
        tbody.innerHTML = '';

        if (data.length === 0) {
            showMessage('Aucune donnée disponible.', 'info');
            return;
        }

        data.forEach((team, index) => {
            const row = document.createElement('tr');

            if (index < 3) {
                row.classList.add('highlight');
            }

            if (team.equipe.trim().toLowerCase().includes('montréal')) {
                row.classList.add('montreal');
            }

            row.innerHTML = `
                <td>${team.rang}</td>
                <td>${team.equipe}</td>
                <td>${team.mj}</td>
                <td>${team.v}</td>
                <td>${team.d}</td>
                <td>${team.dp}</td>
                <td>${team.pts}</td>
            `;
            tbody.appendChild(row);
        });
    }

    function showLoading() {
        tbody.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="loading-state">
                        <div class="spinner"></div>
                        <p>Chargement des classements...</p>
                    </div>
                </td>
            </tr>
        `;
    }

    function showMessage(message, type = 'info') {
        const icon = type === 'error' ? '❌' : type === 'info' ? 'ℹ️' : '✅';

        tbody.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="message ${type}">
                        <div class="message-icon">${icon}</div>
                        <div class="message-content">
                            <h3>${type === 'error' ? 'Erreur' : 'Information'}</h3>
                            <p>${message}</p>
                            ${type === 'error' ? '<button onclick="location.reload()" class="retry-btn">Réessayer</button>' : ''}
                        </div>
                    </div>
                </td>
            </tr>
        `;
    }
});
