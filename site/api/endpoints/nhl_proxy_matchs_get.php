<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

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

// Configuration
$team = 'MTL';
$seasonYear = date('Y');

// Saison NHL
$seasonId = $seasonYear . ((int)$seasonYear + 1);
$url = "https://api-web.nhle.com/v1/club-schedule-season/$team/$seasonId";
$data = getJson($url);

if (!$data || !isset($data['games'])) {
    http_response_code(404);
    echo json_encode(["error" => "Données introuvables pour les Canadiens"]);
    exit;
}

// Mois en français
$frenchMonths = [
    '10' => 'Octobre', '11' => 'Novembre', '12' => 'Décembre',
    '01' => 'Janvier', '02' => 'Février', '03' => 'Mars',
    '04' => 'Avril', '05' => 'Mai', '06' => 'Juin'
];

// Grouper par mois
$matchesByMonth = [];

foreach ($data['games'] as $match) {
    $date = $match['gameDate'] ?? '';
    if (!$date) continue;
    
    $monthNum = substr($date, 5, 2);
    $yearMonth = substr($date, 0, 7);
    
    if ($monthNum === '07' || $monthNum === '08' || $monthNum === '09') {
        continue;
    }
    
    if (!isset($matchesByMonth[$yearMonth])) {
        $matchesByMonth[$yearMonth] = [];
    }
    
    $matchesByMonth[$yearMonth][] = $match;
}

ksort($matchesByMonth);

// Formater les résultats - MATCHS TERMINÉS (FINAL ou OFF avec scores)
$result = ['matchs_par_mois' => []];
$monthsWithMatches = 0;
$totalMatches = 0;

foreach ($matchesByMonth as $yearMonth => $monthMatches) {
    $monthNum = substr($yearMonth, 5, 2);
    $monthName = $frenchMonths[$monthNum] ?? 'Mois ' . $monthNum;
    
    $formattedMatches = [];
    
    foreach ($monthMatches as $match) {
        $home = $match['homeTeam']['abbrev'] ?? '';
        $away = $match['awayTeam']['abbrev'] ?? '';
        $scoreHome = $match['homeTeam']['score'] ?? null;
        $scoreAway = $match['awayTeam']['score'] ?? null;
        $date = $match['gameDate'];
        $etat = $match['gameState'] ?? 'FUTURE';
        
        // DÉTERMINER SI LE MATCH EST TERMINÉ
        // Soit il est "FINAL", soit "OFF" avec des scores disponibles
        $isTermine = false;
        
        if ($etat === 'FINAL') {
            $isTermine = true;
        } elseif ($etat === 'OFF' && $scoreHome !== null && $scoreAway !== null) {
            $isTermine = true;
        }
        
        // Si le match n'est pas terminé, on passe au suivant
        if (!$isTermine) {
            continue;
        }
        
        // Le match est terminé, on le traite
        $score = "$scoreHome-$scoreAway";
        
        // Déterminer le résultat
        $resultat = null;
        if ($home === $team) {
            $resultat = ($scoreHome > $scoreAway) ? 'Victoire' : 'Defaite';
        } elseif ($away === $team) {
            $resultat = ($scoreAway > $scoreHome) ? 'Victoire' : 'Defaite';
        }
        
        $formattedMatches[] = [
            'Date' => $date,
            'Adversaire' => $home === $team ? $away : $home,
            'Score' => $score,
            'Résultat' => $resultat,
            'Domicile' => $home === $team,
            'Etat' => $etat === 'OFF' ? 'TERMINE' : $etat
        ];
    }
    
    if (!empty($formattedMatches)) {
        $result['matchs_par_mois'][$monthName] = $formattedMatches;
        $monthsWithMatches++;
        $totalMatches += count($formattedMatches);
    }
}

// Si aucun match terminé
if (empty($result['matchs_par_mois'])) {
    echo json_encode([
        'equipe' => 'Canadiens de Montréal',
        'saison' => $seasonId,
        'message' => 'Aucun match terminé disponible pour le moment',
        'matchs_par_mois' => [],
        'total_mois' => 0,
        'total_matchs' => 0
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Métadonnées
$result['equipe'] = 'Canadiens de Montréal';
$result['saison'] = $seasonId;
$result['total_mois'] = $monthsWithMatches;
$result['total_matchs'] = $totalMatches;

echo json_encode($result, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);