document.addEventListener('DOMContentLoaded', function() {
    const resultsContainer = document.getElementById('matchs');
    
    // Charger et afficher les matchs
    loadAndDisplayMatchs();
    
    async function loadAndDisplayMatchs() {
        showLoading();
        
        try {
            // Récupérer les données depuis votre API
            const baseURL = window.location.hostname.includes('localhost') ? 'http://localhost/api' : 'https://dashboard-canadiens.onrender.com/api';
            const response = await fetch(`${baseURL}/matchs`);
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP ${response.status}`);
            }
            
            const data = await response.json();
            
            // Vérifier si c'est un message d'erreur ou de vide
            if (data.message) {
                showMessage(data.message, 'info');
                return;
            }
            
            // Vérifier la structure des données
            if (!data.matchs_par_mois || typeof data.matchs_par_mois !== 'object') {
                throw new Error('Structure de données invalide');
            }
            
            // Afficher les matchs
            displayMatchsByMonth(data);
            
        } catch (error) {
            console.error('Erreur:', error);
            showMessage(`Erreur: ${error.message}`, 'error');
        }
    }
    
    function displayMatchsByMonth(data) {
        resultsContainer.innerHTML = '';
        
        const months = Object.keys(data.matchs_par_mois);
        
        if (months.length === 0) {
            showMessage('Aucun match terminé disponible', 'info');
            return;
        }
        
        // Pour chaque mois
        months.forEach(monthName => {
            const matches = data.matchs_par_mois[monthName];
            
            // Vérifier que c'est bien un tableau
            if (!Array.isArray(matches)) {
                console.warn(`Les matchs de ${monthName} ne sont pas dans un tableau`);
                return;
            }
            
            // Créer la section du mois
            createMonthSection(monthName, matches);
        });
    }
    
    function createMonthSection(monthName, matches) {
        const section = document.createElement('div');
        section.className = 'month-section';
        
        // Compter victoires/défaites pour ce mois
        const victories = matches.filter(m => m.Résultat === 'Victoire').length;
        const defeats = matches.filter(m => m.Résultat === 'Defaite').length;
        
        // En-tête du mois avec statistiques
        const header = document.createElement('div');
        header.className = 'month-header';
        header.innerHTML = `
            <h2>${monthName}</h2>
            <div class="month-stats">
                <span class="match-count">${matches.length} match${matches.length > 1 ? 's' : ''}</span>
                <span class="record">${victories}V-${defeats}D</span>
            </div>
        `;
        
        // Tableau des matchs
        const table = document.createElement('table');
        table.className = 'matches-table';
        
        // En-tête du tableau
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Adversaire</th>
                    <th>Score</th>
                    <th>Résultat</th>
                </tr>
            </thead>
            <tbody>
                ${matches.map(match => createMatchRow(match)).join('')}
            </tbody>
        `;
        
        section.appendChild(header);
        section.appendChild(table);
        resultsContainer.appendChild(section);
    }
    
    function createMatchRow(match) {
        // Formater la date (JJ-MM-AAAA)
        const dateParts = match.Date.split('-');
        const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
        
        // Icône et texte pour domicile/extérieur
        const isHome = match.Domicile;
        const locationIcon = isHome ? 'Domicile' : 'Extérieur';
        const locationText = isHome ? 'Domicile' : 'Extérieur';
        
        // Résultat
        const isVictory = match.Résultat === 'Victoire';
        const resultClass = isVictory ? 'victoire' : 'defaite';
        const resultText = match.Résultat || 'N/A';
        
        // Score (si MTL est à domicile, afficher MTL-ADV, sinon ADV-MTL)
        let scoreDisplay = match.Score;
        if (scoreDisplay.includes('-')) {
            const [scoreHome, scoreAway] = scoreDisplay.split('-');
            scoreDisplay = isHome ? `${scoreHome}-${scoreAway}` : `${scoreAway}-${scoreHome}`;
        }
        
        return `
            <tr>
                <td class="match-date">${formattedDate}</td>
                <td class="opponent" title="${locationText}">
                    ${locationText} - ${match.Adversaire}
                </td>
                <td class="score">${scoreDisplay}</td>
                <td class="result-cell">
                    <span class="result-badge ${resultClass}">
                        ${resultText}
                    </span>
                </td>
            </tr>
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
        const icon = type === 'error' ? '❌' : type === 'info' ? 'ℹ️' : '✅';
        
        resultsContainer.innerHTML = `
            <div class="message ${type}">
                <div class="message-icon">${icon}</div>
                <div class="message-content">
                    <h3>${type === 'error' ? 'Erreur' : 'Information'}</h3>
                    <p>${message}</p>
                    ${type === 'error' ? 
                        '<button onclick="location.reload()" class="retry-btn">Réessayer</button>' : 
                        ''
                    }
                </div>
            </div>
        `;
    }
    
    // Ajouter les styles CSS
    addStyles();
    
    function addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* États de chargement et messages */
            .loading-state {
                text-align: center;
                padding: 60px 20px;
                color: #192168;
            }
            
            .spinner {
                border: 4px solid #f3f3f3;
                border-top: 4px solid #AE1F24;
                border-radius: 50%;
                width: 50px;
                height: 50px;
                animation: spin 1s linear infinite;
                margin: 0 auto 20px;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .message {
                display: flex;
                align-items: center;
                gap: 20px;
                padding: 30px;
                background: white;
                border-radius: 10px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                margin: 20px;
                max-width: 600px;
                margin-left: auto;
                margin-right: auto;
            }
            
            .message.error {
                border-left: 5px solid #dc3545;
            }
            
            .message.info {
                border-left: 5px solid #17a2b8;
            }
            
            .message-icon {
                font-size: 40px;
                flex-shrink: 0;
            }
            
            .error .message-icon {
                color: #dc3545;
            }
            
            .info .message-icon {
                color: #17a2b8;
            }
            
            .message-content h3 {
                margin: 0 0 10px 0;
                color: #333;
            }
            
            .message-content p {
                margin: 0 0 15px 0;
                color: #666;
            }
            
            .retry-btn {
                background: #AE1F24;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                font-weight: 600;
                font-size: 16px;
            }
            
            .retry-btn:hover {
                background: #8a181c;
            }
            
            /* Section mois */
            .month-section {
                background: white;
                border-radius: 10px;
                overflow: hidden;
                margin-bottom: 30px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            
            .month-header {
                background: linear-gradient(90deg, #192168 0%, #AE1F24 100%);
                color: white;
                padding: 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .month-header h2 {
                margin: 0;
                font-size: 24px;
                font-weight: 700;
            }
            
            .month-stats {
                display: flex;
                gap: 15px;
                align-items: center;
            }
            
            .match-count {
                background: rgba(255,255,255,0.2);
                padding: 5px 15px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: 500;
            }
            
            .record {
                background: rgba(255,255,255,0.2);
                padding: 5px 15px;
                border-radius: 20px;
                font-size: 16px;
                font-weight: 600;
            }
            
            /* Tableau des matchs */
            .matches-table {
                width: 100%;
                border-collapse: collapse;
            }
            
            .matches-table thead {
                background: #f8f9fa;
            }
            
            .matches-table th {
                padding: 18px 20px;
                text-align: left;
                font-weight: 600;
                color: #192168;
                border-bottom: 3px solid #e9ecef;
                font-size: 15px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            
            .matches-table tbody tr {
                border-bottom: 1px solid #f0f0f0;
                transition: background 0.3s ease;
            }
            
            .matches-table tbody tr:hover {
                background: #f8f9fa;
            }
            
            .matches-table td {
                padding: 18px 20px;
                vertical-align: middle;
            }
            
            .match-date {
                font-weight: 600;
                color: #495057;
                font-size: 16px;
                white-space: nowrap;
            }
            
            .opponent {
                display: flex;
                align-items: center;
                gap: 12px;
                font-weight: 500;
                font-size: 17px;
            }
            
            .location-icon {
                font-size: 18px;
            }
            
            .location-icon.home {
                color: #192168;
            }
            
            .location-icon.away {
                color: #AE1F24;
            }
            
            .score {
                font-weight: 700;
                font-size: 20px;
                text-align: center;
                font-family: 'Courier New', monospace;
            }
            
            .result-cell {
                text-align: center;
            }
            
            .result-badge {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 8px 16px;
                border-radius: 25px;
                font-weight: 600;
                font-size: 15px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                min-width: 120px;
                justify-content: center;
            }
            
            .result-badge.victoire {
                background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
                color: #155724;
                border: 1px solid #c3e6cb;
            }
            
            .result-badge.defaite {
                background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
                color: #721c24;
                border: 1px solid #f5c6cb;
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                .month-header {
                    flex-direction: column;
                    text-align: center;
                    gap: 10px;
                }
                
                .month-stats {
                    justify-content: center;
                }
                
                .matches-table {
                    display: block;
                    overflow-x: auto;
                }
                
                .matches-table th,
                .matches-table td {
                    padding: 12px 15px;
                    font-size: 14px;
                }
                
                .result-badge {
                    min-width: 100px;
                    font-size: 13px;
                    padding: 6px 12px;
                }
                
                .message {
                    flex-direction: column;
                    text-align: center;
                }
            }
        `;
        document.head.appendChild(style);
    }
});