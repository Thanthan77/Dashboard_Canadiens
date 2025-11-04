fetch('http://localhost/api/matchs')
.then(res => {
    if (!res.ok) {
        throw new Error(`Erreur HTTP : ${res.status}`);
    }
    return res.text();
})
.then(text => {
    if (!text || text.trim() === '') {
        throw new Error("Réponse vide de l'API");
    }

    let data;
    try {
        data = JSON.parse(text);
    } catch (e) {
        throw new Error("JSON invalide : " + e.message);
    }

    const container = document.getElementById('matchs');
    container.innerHTML = '';

    // Filtrer uniquement les matchs terminés
    const matchsFinaux = data.filter(match => match.statut === 'FINAL');

    if (matchsFinaux.length === 0) {
        container.innerHTML = "<p>Aucun match terminé trouvé.</p>";
        return;
    }

    matchsFinaux.forEach(match => {
    const {
        date,
        domicile,
        extérieur,
        score,
        statut
    } = match;

    let couleur_resultat = '';
    if (score) {
        const [scoreHome, scoreAway] = score.split(' - ').map(Number);
        const estMTLDomicile = domicile === 'MTL';

        const victoire = estMTLDomicile
        ? scoreHome > scoreAway
        : scoreAway > scoreHome;

        couleur_resultat = victoire ? 'vert' : 'rouge';
    }

    const box = document.createElement('div');
    box.className = `match-box ${couleur_resultat}`;

    box.innerHTML = `
        <h3>${date}</h3>
        <p class="score">${domicile} ${score ? score.split(' - ')[0] : ''} vs ${extérieur} ${score ? score.split(' - ')[1] : ''}</p>
        <p>Statut : ${statut}</p>
    `;

    container.appendChild(box);
    });
})
.catch(err => {
    console.error("Erreur chargement des résultats :", err);
    document.getElementById('matchs').innerHTML = `<p>Erreur : ${err.message}</p>`;
});
