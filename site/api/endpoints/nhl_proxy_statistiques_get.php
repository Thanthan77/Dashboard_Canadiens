<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Fonction utilitaire
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

//  Extraire l'ID depuis l'URL 
$uri = $_SERVER['REQUEST_URI'];
$segments = explode('/', $uri);
$id = end($segments);

// Vérification
if (!is_numeric($id)) {
    echo json_encode(["error" => "ID joueur invalide"]);
    exit;
}

$id = (int)$id;

// Calcul de la saison actuelle
$annee = (int)date('Y');
$mois = (int)date('n');
$saisonDebut = ($mois < 7) ? $annee - 1 : $annee;
$saisonFin = $saisonDebut + 1;
$saisonId = (int)($saisonDebut . $saisonFin);

// Récupération des infos du joueur
$infoUrl = "https://api-web.nhle.com/v1/player/$id/landing";
$infoData = getJson($infoUrl);

if (!$infoData) {
    echo json_encode(["error" => "Joueur introuvable"]);
    exit;
}

$prenom = $infoData['firstName']['default'] ?? '';
$nom = $infoData['lastName']['default'] ?? '';
$numero = $infoData['sweaterNumber'] ?? '';
$position = $infoData['position'] ?? '';
$headshot = $infoData['headshot'] ?? '';
$pays = $infoData['birthCountry'] ?? '';

// Type de stats
$type = ($position === 'G') ? 'goalie' : 'skater';
$statsUrl = "https://api.nhle.com/stats/rest/en/$type/summary?cayenneExp=playerId=$id";
$statsData = getJson($statsUrl);

// Recherche de la ligne de saison
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

// Statistiques spécifiques gardien
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

// Réponse JSON
echo json_encode([
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
], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
