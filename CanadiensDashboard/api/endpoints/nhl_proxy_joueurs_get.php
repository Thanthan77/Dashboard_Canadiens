<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Fonction utilitaire pour récupérer du JSON depuis une URL
function getJson($url) {
    $options = [
        "http" => [
            "method" => "GET",
            "header" => "User-Agent: PHP"
        ]
    ];
    $context = stream_context_create($options);
    $json = @file_get_contents($url, false, $context);
    return $json ? json_decode($json, true) : null;
}

$annee = (int)date('Y');
$mois = (int)date('n');
$saisonDebut = ($mois < 7) ? $annee - 1 : $annee;
$saisonFin = $saisonDebut + 1;
$saisonId = (int)($saisonDebut . $saisonFin);


// Étape 1 : Récupérer le roster des Canadiens
$rosterUrl = "https://api-web.nhle.com/v1/roster/MTL/current";
$rosterData = getJson($rosterUrl);

if (!$rosterData) {
    echo json_encode(["error" => "Roster introuvable"]);
    exit;
}

// Fusionner tous les joueurs
$groupes = ['forwards', 'defensemen', 'goalies'];
$joueurs = [];

foreach ($groupes as $groupe) {
    foreach ($rosterData[$groupe] ?? [] as $joueur) {
        $id = $joueur['id'];
        $prenom = $joueur['firstName']['default'] ?? '';
        $nom = $joueur['lastName']['default'] ?? '';
        $numero = $joueur['sweaterNumber'] ?? '';
        $position = $joueur['positionCode'] ?? '';
        $headshot = $joueur['headshot'] ?? '';
        $pays = $joueur['birthCountry'] ?? '';

        // Étape 2 : Récupérer les stats individuelles pour la saison actuelle
        $type = ($position === 'G') ? 'goalie' : 'skater';
        $statsUrl = "https://api.nhle.com/stats/rest/en/$type/summary?cayenneExp=playerId=$id";
        $statsData = getJson($statsUrl);

        // Chercher dynamiquement la ligne correspondant à la saison actuelle
        $ligne = null;
        foreach ($statsData['data'] ?? [] as $item) {
            if (($item['seasonId'] ?? null) === $saisonId) {
                $ligne = $item;
                break;
            }
        }

        // Statistiques communes
        $buts = $ligne['goals'] ?? null;
        $passes = $ligne['assists'] ?? null;
        $points = $ligne['points'] ?? null;

        // Statistiques spécifiques aux gardiens
        $arrets = null;
        $tirsRecus = null;
        $pourcentage = null;
        $butsEncaisses = null;
        $blanchissages = null;
        $tempsDeJeu = null;

        if ($position === 'G' && $ligne) {
            $tirsRecus = $ligne['shotsAgainst'] ?? null;
            $butsEncaisses = $ligne['goalsAgainst'] ?? null;
            $arrets = ($tirsRecus !== null && $butsEncaisses !== null) ? $tirsRecus - $butsEncaisses : null;
            $pourcentage = ($tirsRecus > 0 && $butsEncaisses !== null)
                ? round((1 - $butsEncaisses / $tirsRecus) * 100, 2)
                : null;
            $blanchissages = $ligne['shutouts'] ?? null;
            $tempsDeJeu = isset($ligne['timeOnIce']) ? round($ligne['timeOnIce'] / 60) : null;
        }

        $joueurs[] = [
            "id" => $id,
            "prenom" => $prenom,
            "nom" => $nom,
            "numero" => $numero,
            "position" => $position,
            "headshot" => $headshot,
            "pays" => $pays,
            "buts" => $buts,
            "passes" => $passes,
            "points" => $points,
            "arrets" => $arrets,
            "tirs_reçus" => $tirsRecus,
            "pourcentage_arrets" => $pourcentage !== null ? $pourcentage . "%" : null,
            "buts_encaissés" => $butsEncaisses,
            "blanchissages" => $blanchissages,
            "temps_de_jeu" => $tempsDeJeu
        ];
    }
}

echo json_encode($joueurs, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
