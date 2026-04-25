document.addEventListener('DOMContentLoaded', function() {
    const resultsContainer = document.getElementById('matchs');
    
    loadAndDisplayMatchs();
    
    async function loadAndDisplayMatchs() {
        showLoading();
        
        try {
            
            const data = await getMatchsCanadiens();

            if (data.message) {
                showMessage(data.message, 'info');
                return;
            }

            if (!data.matchs_par_mois || typeof data.matchs_par_mois !== 'object') {
                throw new Error('Structure de données invalide');
            }
            
            displayMatchsByMonth(data);
            
        } catch (error) {
            console.error('Erreur:', error);
            showMessage(`Erreur: ${error.message}`, 'error');
        }
    }
    
    function displayMatchsByMonth(data) {
        resultsContainer.innerHTML = '';
        
        const months = Object.keys(data.matchs_par_mois).sort((a, b) => {
            const dateA = new Date(data.matchs_par_mois[a][0].Date);
            const dateB = new Date(data.matchs_par_mois[b][0].Date);
            return dateB - dateA;
        });

        if (months.length === 0) {
            showMessage('Aucun match terminé disponible', 'info');
            return;
        }
        
        months.forEach(monthName => {
            const matches = data.matchs_par_mois[monthName];
            if (!Array.isArray(matches)) return;
            createMonthSection(monthName, matches);
        });
    }
    
    function createMonthSection(monthName, matches) {
        const section = document.createElement('div');
        section.className = 'month-section';
        
        const victories = matches.filter(m => m.Résultat === 'Victoire').length;
        const defeats = matches.filter(m => m.Résultat === 'Défaite').length;
        
        const header = document.createElement('div');
        header.className = 'month-header';
        header.innerHTML = `
            <h2>${monthName}</h2>
            <div class="month-stats">
                <span class="match-count">${matches.length} match${matches.length > 1 ? 's' : ''}</span>
                <span class="record">${victories}V-${defeats}D</span>
            </div>
        `;
        
        const table = document.createElement('table');
        table.className = 'matches-table';
        
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
            <tr>
                <td class="match-date">${formattedDate}</td>
                <td class="opponent" title="${locationText}">
                    ${locationText} - ${match.Adversaire}
                </td>
                <td class="score">${scoreDisplay}</td>
                <td class="result-cell">
                    <span class="result-badge ${resultClass}">
                        ${match.Résultat}
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
        const icon =type === "error" ? "Erreur" : type === "info" ? "Information" : "Succès";
        
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

    addStyles();
    
    function addStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* === Chargement === */
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

        /* === Messages === */
        .message {
            display: flex;
            align-items: center;
            gap: 20px;
            padding: 30px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            margin: 20px auto;
            max-width: 600px;
        }

        .message.error { border-left: 5px solid #dc3545; }
        .message.info { border-left: 5px solid #17a2b8; }

        .message-icon {
            font-size: 40px;
            flex-shrink: 0;
        }

        .message-content h3 {
            margin: 0 0 10px 0;
            color: #333;
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

        /* === Bloc mensuel === */
        .month-block {
            margin-bottom: 40px;
        }

        .month-block h3 {
            font-size: 1.4em;
            color: #AF1E2D;
            margin-bottom: 15px;
            text-align: center;
        }

        /* === Grille des matchs === */
        .matchs-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
            gap: 20px;
        }

        /* === Carte de match === */
        .match-card {
            background-color: #f0f4ff;
            border-left: 6px solid #0626CD;
            border-radius: 10px;
            padding: 16px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.1);
            transition: transform 0.2s ease;
        }

        .match-card:hover {
            transform: translateY(-4px);
        }

        .match-date {
            font-weight: bold;
            color: #121C68;
            margin-bottom: 8px;
        }

        .match-opponent {
            font-size: 1em;
            color: #2E3551;
            margin-bottom: 6px;
        }

        .match-score {
            font-size: 1.2em;
            font-weight: bold;
            margin-bottom: 6px;
        }

        .match-result {
            font-size: 0.95em;
            font-weight: 600;
            color: white;
            padding: 4px 10px;
            border-radius: 6px;
            display: inline-block;
        }

        .match-result.victoire {
            background-color: #2ecc71;
        }

        .match-result.defaite {
            background-color: #e74c3c;
        }

        /* === Responsive === */
        @media (max-width: 768px) {
            .matchs-grid {
                grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                gap: 15px;
            }

            .match-card {
                padding: 14px;
            }

            .match-score {
                font-size: 1.1em;
            }

            .message {
                flex-direction: column;
                text-align: center;
            }
        }

        @media (max-width: 480px) {
            .matchs-grid {
                grid-template-columns: 1fr;
            }

            .match-card {
                padding: 12px;
            }

            .match-score {
                font-size: 1em;
            }

            .match-result {
                font-size: 0.9em;
                padding: 3px 8px;
            }
        }
    `;

        document.head.appendChild(style);
    }
});

    
    
    
