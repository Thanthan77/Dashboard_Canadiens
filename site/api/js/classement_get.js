async function getClassementNHL() {
    const url = "https://api-web.nhle.com/v1/standings/now";

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "User-Agent": "Mozilla/5.0"
            }
        });

        const data = await response.json();

        if (!data || !data.standings) {
            console.error("Classement introuvable");
            return [];
        }

        let classement = [];
        let rang = 1;

        data.standings.forEach(team => {
            classement.push({
                rang: rang++,
                equipe: team.teamName?.default ?? "",
                division: team.divisionName ?? "",
                mj: team.gamesPlayed ?? 0,
                v: team.wins ?? 0,
                d: team.losses ?? 0,
                dp: team.otLosses ?? 0,
                pts: team.points ?? 0,
                rw: team.regulationWins ?? 0,
                row: team.regulationPlusOtWins ?? 0,
                diff: team.goalDifferential ?? 0,
                pct_victoire: team.gamesPlayed > 0
                    ? (team.points / (team.gamesPlayed * 2)).toFixed(3)
                    : null
            });
        });

        return classement;

    } catch (error) {
        console.error("Erreur API NHL :", error);
        return [];
    }
}

// Exemple d'utilisation
getClassementNHL().then(classement => {
    console.log(classement);
});
