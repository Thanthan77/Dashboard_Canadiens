<?php
require_once __DIR__.'/routes.php';



// -----------------------------
// Méthodes HTTP
// -----------------------------
function get($route, $path_to_include) {
    if ($_SERVER['REQUEST_METHOD'] == 'GET') {
        route($route, $path_to_include);
    }
}
function post($route, $path_to_include) {
    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        route($route, $path_to_include);
    }
}
function put($route, $path_to_include) {
    if ($_SERVER['REQUEST_METHOD'] == 'PUT') {
        route($route, $path_to_include);
    }
}
function patch($route, $path_to_include) {
    if ($_SERVER['REQUEST_METHOD'] == 'PATCH') {
        route($route, $path_to_include);
    }
}
function delete($route, $path_to_include) {
    if ($_SERVER['REQUEST_METHOD'] == 'DELETE') {
        route($route, $path_to_include);
    }
}
function any($route, $path_to_include) {
    route($route, $path_to_include);
}

// -----------------------------
// Router principal
// -----------------------------
function route($route, $path_to_include) {

    // Si ce n'est pas une fonction, on ajoute .php si nécessaire
    $callback = $path_to_include;
    if (!is_callable($callback)) {
        if (!strpos($path_to_include, '.php')) {
            $path_to_include .= '.php';
        }
    }

    // Route 404
    if ($route == "/404") {
        include_once __DIR__ . "/$path_to_include";
        exit();
    }

    // -----------------------------
    // Nettoyage de l'URL reçue
    // -----------------------------
    $request_url = filter_var($_SERVER['REQUEST_URI'], FILTER_SANITIZE_URL);

    // IMPORTANT : enlever les préfixes ajoutés par Render
    $request_url = preg_replace('#^/site#', '', $request_url);
    $request_url = preg_replace('#^/Dashboard_Canadiens/site#', '', $request_url);

    // Nettoyage final
    $request_url = rtrim($request_url, '/');
    $request_url = strtok($request_url, '?');

    // -----------------------------
    // Découpage des segments
    // -----------------------------
    $route_parts = explode('/', $route);
    $request_url_parts = explode('/', $request_url);

    array_shift($route_parts);
    array_shift($request_url_parts);

    // Route racine
    if ($route_parts[0] == '' && count($request_url_parts) == 0) {
        if (is_callable($callback)) {
            call_user_func_array($callback, []);
            exit();
        }
        include_once __DIR__ . "/$path_to_include";
        exit();
    }

    // Nombre de segments différent → pas match
    if (count($route_parts) != count($request_url_parts)) {
        return;
    }

    // -----------------------------
    // Gestion des paramètres dynamiques
    // -----------------------------
    $parameters = [];

    for ($i = 0; $i < count($route_parts); $i++) {
        $route_part = $route_parts[$i];

        // Paramètre dynamique : $id, $slug, etc.
        if (preg_match('/^\$/', $route_part)) {
            $route_part = ltrim($route_part, '$');
            $parameters[] = $request_url_parts[$i];
            $$route_part = $request_url_parts[$i];
        }
        // Segment fixe qui ne correspond pas
        else if ($route_parts[$i] != $request_url_parts[$i]) {
            return;
        }
    }

    // -----------------------------
    // Exécution
    // -----------------------------
    if (is_callable($callback)) {
        call_user_func_array($callback, $parameters);
        exit();
    }

    include_once __DIR__ . "/$path_to_include";
    exit();
}

// -----------------------------
// Fonctions utilitaires
// -----------------------------
function out($text) {
    echo htmlspecialchars($text);
}

function set_csrf() {
    session_start();
    if (!isset($_SESSION["csrf"])) {
        $_SESSION["csrf"] = bin2hex(random_bytes(50));
    }
    echo '<input type="hidden" name="csrf" value="' . $_SESSION["csrf"] . '">';
}

function is_csrf_valid() {
    session_start();
    if (!isset($_SESSION['csrf']) || !isset($_POST['csrf'])) {
        return false;
    }
    return $_SESSION['csrf'] === $_POST['csrf'];
}
