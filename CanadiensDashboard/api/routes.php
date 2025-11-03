<?php

require_once __DIR__.'/router.php';

$URL = '/api';

header("Access-Control-Allow-Origin: *");

// Page d'accueil de l'API
get($URL, 'views/index.php');



// GET --


get($URL.'/joueurs','endpoints/joueurs_get.php');

//POST--



//PUT--














// Route de secours pour les pages non trouvées
any($URL.'/404', 'views/404.php');

