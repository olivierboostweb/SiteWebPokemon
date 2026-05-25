<?php
// Configuration MySQL
// Base de donnees: cartePokemon
// Utilisateur: admin
// Mot de passe: Admin123

$host = 'localhost';
$dbname = 'cartepokemon';
$user = 'root';
$password = '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$dbname;charset=$charset";

$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
];

try {
    $pdo = new PDO($dsn, $user, $password, $options);
} catch (PDOException $e) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => false,
        'message' => 'Erreur de connexion a la base de donnees.',
        'details' => $e->getMessage()
    ]);
    exit;
}
