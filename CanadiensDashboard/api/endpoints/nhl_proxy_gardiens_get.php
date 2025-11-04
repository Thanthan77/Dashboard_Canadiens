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
    $json = file_get_contents($url, false, $context);
    return json_decode($json, true);
}

// Étape 1 : Récupérer le roster des Canadiens
$rosterUrl = "https://api-web.nhle.com/v1/roster/MTL/current";
$rosterData = getJson($rosterUrl);

if (!$rosterData || !isset($rosterData['goalies'])) {
    echo json_encode(["error" => "Roster introuvable ou vide"]);
    exit;
}

$gardiens = $rosterData['goalies'];
$statsFinales = [];

foreach ($gardiens as $gardien) {
    $id = $gardien['id'];
    $prenom = $gardien['firstName']['default'] ?? '';
    $nom = $gardien['lastName']['default'] ?? '';
    $numero = $gardien['sweaterNumber'] ?? '';
    $position = $gardien['positionCode'] ?? 'G';

    // Étape 2 : Récupérer les stats du gardien
    $statsUrl = "https://api.nhle.com/stats/rest/en/goalie/summary?cayenneExp=playerId=$id";
    $statsData = getJson($statsUrl);

    $ligne = $statsData['data'][0] ?? null;

    if ($ligne) {
        $arrets = $ligne['shotsAgainst'] - $ligne['goalsAgainst'];
        $pourcentage = $ligne['shotsAgainst'] > 0
            ? round(1 - ($ligne['goalsAgainst'] / $ligne['shotsAgainst']), 3) * 100 . '%'
            : 'N/A';

        $statsFinales[] = [
            "joueur_id" => $id,
            "prenom" => $prenom,
            "nom" => $nom,
            "numero" => $numero,
            "position" => $position,
            "arrets" => $arrets,
            "tirs_reçus" => $ligne['shotsAgainst'],
            "pourcentage_arrets" => $pourcentage,
            "buts_encaissés" => $ligne['goalsAgainst'],
            "blanchissages" => $ligne['shutouts'],
            "temps_de_jeu" => round($ligne['timeOnIce'] / 60)
        ];
    }
}

echo json_encode($statsFinales);
