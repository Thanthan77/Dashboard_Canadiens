<?php
header('Content-Type: application/json');
require_once(__DIR__.'/../db/Database.php');

try {
    $cnx = Database::getInstance();

    $query = "SELECT * FROM joueurs";
    $stmt = $cnx->prepare($query);
    $stmt->execute();

    $joueurs = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($joueurs, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Erreur base de données',
        'message' => $e->getMessage()
    ]);
} finally {
    $cnx = null;
}
