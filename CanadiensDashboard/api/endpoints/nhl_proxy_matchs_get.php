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

// Récupérer le calendrier des Canadiens pour la saison en cours
$team = "MTL";
$url = "https://api-web.nhle.com/v1/club-schedule-season/$team/now";
$data = getJson($url);

if (!$data || !isset($data['games'])) {
    echo json_encode(["error" => "Matchs introuvables"]);
    exit;
}

$matchs = [];

foreach ($data['games'] as $match) {
    $home = $match['homeTeam']['abbrev'] ?? '';
    $away = $match['awayTeam']['abbrev'] ?? '';
    $scoreHome = $match['homeTeam']['score'] ?? null;
    $scoreAway = $match['awayTeam']['score'] ?? null;
    $date = $match['gameDate'] ?? '';
    $etat = $match['gameState'] ?? 'FUTURE';

    // 🔍 Correction du statut si score présent
    if ($etat === 'OFF' && $scoreHome !== null && $scoreAway !== null) {
        $etat = 'FINAL';
    }

    $score = ($etat === 'FINAL' && $scoreHome !== null && $scoreAway !== null)
        ? "$scoreHome - $scoreAway"
        : null;

    $matchs[] = [
        "date" => $date,
        "domicile" => $home,
        "extérieur" => $away,
        "score" => $score,
        "statut" => $etat
    ];
}

echo json_encode($matchs, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
