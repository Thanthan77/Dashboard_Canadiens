<?php

require_once __DIR__.'/router.php';

$URL = '/api';

header("Access-Control-Allow-Origin: *");

// Page d'accueil de l'API
get($URL, 'views/index.php');



// GET --

/*
get($URL.'/joueurs','endpoints/joueurs_get.php');

get($URL.'/gardiens','endpoints/gardiens_get.php');

get($URL.'/resultmatchs','endpoints/matchs_get.php');

get($URL.'/classements','endpoints/classements_get.php');
*/

get($URL.'/classements', 'endpoints/nhl_proxy_classements_get.php');
get($URL.'/joueurs', 'endpoints/nhl_proxy_joueurs_get.php');
get($URL.'/stats/$id', 'endpoints/nhl_proxy_statistiques_get.php');
get($URL.'/matchs', 'endpoints/nhl_proxy_matchs_get.php');














// Route de secours pour les pages non trouvées
any($URL.'/404', 'views/404.php');

