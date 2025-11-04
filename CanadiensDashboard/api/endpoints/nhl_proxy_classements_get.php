<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

function getJson($url) {
    $options = ["http" => ["method" => "GET", "header" => "User-Agent: PHP"]];
    $context = stream_context_create($options);
    $json = @file_get_contents($url, false, $context);
    return $json ? json_decode($json, true) : null;
}

// 🔁 Utilise l’API Web officielle (toujours à jour)
$url = "https://api-web.nhle.com/v1/standings/now";
$data = getJson($url);

if (!$data || !isset($data['standings'])) {
    echo json_encode(["error" => "Classement introuvable"]);
    exit;
}

// 🧾 Extraction simplifiée
$classement = [];
$rang = 1;

foreach ($data['standings'] as $team) {
    $classement[] = [
        "rang" => $rang++,
        "equipe" => $team['teamName']['default'] ?? '',
        "division" => $team['divisionName'] ?? '',
        "mj" => $team['gamesPlayed'] ?? 0,
        "v" => $team['wins'] ?? 0,
        "d" => $team['losses'] ?? 0,
        "dp" => $team['otLosses'] ?? 0,
        "pts" => $team['points'] ?? 0,
        "rw" => $team['regulationWins'] ?? 0,
        "row" => $team['regulationPlusOtWins'] ?? 0,
        "diff" => $team['goalDifferential'] ?? 0,
        "pct_victoire" => ($team['gamesPlayed'] > 0)
            ? round($team['points'] / ($team['gamesPlayed'] * 2), 3)
            : null
    ];
}

echo json_encode($classement, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
