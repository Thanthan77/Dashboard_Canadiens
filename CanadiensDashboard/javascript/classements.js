fetch('http://localhost/api/classements')
    .then(res => res.json())
    .then(data => {
        const tbody = document.getElementById('classement-body');
        tbody.innerHTML = '';

        data.forEach((team, index) => {
            const row = document.createElement('tr');

            // Ajoute la classe highlight aux 3 premiers
            if (index < 3) {
                row.classList.add('highlight');
            }

            // Surligne Montréal
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
    })
    .catch(err => {
        console.error("Erreur chargement du classement :", err);
        document.getElementById('classement-body').innerHTML = "<tr><td colspan='7'>Impossible de charger les données.</td></tr>";
    });
