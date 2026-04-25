async function getJson(url) {
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (e) {
        console.error("Erreur fetch :", e);
        return null;
    }
}

/* ---------------------------------------------------------
   Fallback : trouver la dernière date avec un classement valide
--------------------------------------------------------- */
async function getLastValidStandingsDate() {
    const today = new Date();

    // Tester les 30 derniers jours
    for (let i = 0; i < 30; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);

        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");

        const dateStr = `${yyyy}-${mm}-${dd}`;
        const url = `https://api-web.nhle.com/v1/standings/${dateStr}`;

        const data = await getJson(url);

        if (data && Array.isArray(data.standings) && data.standings.length > 0) {
            return dateStr; // 🎉 Date valide trouvée
        }
    }

    return null;
}

/* ---------------------------------------------------------
   Charger le classement NHL (fallback complet)
--------------------------------------------------------- */
async function getClassementNHL() {
    // 1. Essayer standings/now
    try {
        const nowUrl = "https://api-web.nhle.com/v1/standings/now";
        const nowData = await getJson(nowUrl);

        if (nowData && nowData.standings && nowData.standings.length > 0) {
            return formatClassement(nowData.standings);
        }
    } catch (e) {
        console.warn("standings/now indisponible");
    }

    // 2. Essayer la dernière date valide
    const lastDate = await getLastValidStandingsDate();

    if (!lastDate) {
        console.error("Aucune date valide trouvée");
        return [];
    }

    const url = `https://api-web.nhle.com/v1/standings/${lastDate}`;
    const data = await getJson(url);

    if (!data || !data.standings) {
        console.error("Impossible de charger le fallback par date");
        return [];
    }

    return formatClassement(data.standings);
}

/* ---------------------------------------------------------
   Formater le classement
--------------------------------------------------------- */
function formatClassement(standings) {
    let classement = [];
    let rang = 1;

    standings.forEach(team => {
        classement.push({
            rang: rang++,
            equipe: team.teamName?.default ?? "",
            mj: team.gamesPlayed ?? 0,
            v: team.wins ?? 0,
            d: team.losses ?? 0,
            dp: team.otLosses ?? 0,
            pts: team.points ?? 0,
            diff: team.goalDifferential ?? 0
        });
    });

    return classement;
}
