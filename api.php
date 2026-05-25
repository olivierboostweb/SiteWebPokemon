<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/config.php';

$action = $_GET['action'] ?? '';

function jsonResponse($data, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

function cleanText(?string $value): string
{
    return trim((string)$value);
}

try {
    switch ($action) {
        case 'generations':
            $stmt = $pdo->query("SELECT id_generation, nom_generation, description FROM generation ORDER BY id_generation ASC");
            jsonResponse(['success' => true, 'data' => $stmt->fetchAll()]);
            break;

        case 'series':
            $stmt = $pdo->query("SELECT id_serie, nom_serie, date_sortie, nb_cartes, id_generation FROM serie ORDER BY date_sortie ASC, nom_serie ASC");
            jsonResponse(['success' => true, 'data' => $stmt->fetchAll()]);
            break;

        case 'boosters':
            $stmt = $pdo->query("SELECT id_booster, nom_booster, image_booster, id_generation FROM booster ORDER BY nom_booster ASC");
            jsonResponse(['success' => true, 'data' => $stmt->fetchAll()]);
            break;

        case 'raretes':
            $stmt = $pdo->query("SELECT id_rarete, nom_rarete FROM rarete ORDER BY id_rarete ASC");
            jsonResponse(['success' => true, 'data' => $stmt->fetchAll()]);
            break;

        case 'cartes':
            $idGeneration = isset($_GET['generation']) ? (int)$_GET['generation'] : 0;
            $where = '';
            $params = [];

            if ($idGeneration > 0) {
                $where = 'WHERE s.id_generation = :id_generation';
                $params[':id_generation'] = $idGeneration;
            }

            $sql = "
                SELECT
                    c.id_carte,
                    c.id_pokemon,
                    c.numero_carte,
                    c.nom_carte,
                    c.valeur_carte,
                    c.pv,
                    c.generation,
                    c.type,
                    c.talent,
                    c.illustration,
                    c.id_serie,
                    c.id_booster,
                    c.id_rarete,
                    s.nom_serie,
                    g.id_generation,
                    g.nom_generation,
                    b.nom_booster,
                    r.nom_rarete
                FROM tbl_carte c
                LEFT JOIN serie s ON c.id_serie = s.id_serie
                LEFT JOIN generation g ON s.id_generation = g.id_generation
                LEFT JOIN booster b ON c.id_booster = b.id_booster
                LEFT JOIN rarete r ON c.id_rarete = r.id_rarete
                $where
                ORDER BY g.id_generation ASC, s.nom_serie ASC, c.nom_carte ASC
            ";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            jsonResponse(['success' => true, 'data' => $stmt->fetchAll()]);
            break;

        case 'carte':
            $idCarte = (int)($_GET['id'] ?? 0);
            if ($idCarte <= 0) {
                jsonResponse(['success' => false, 'message' => 'Carte introuvable.'], 400);
            }

            $stmt = $pdo->prepare("
                SELECT
                    c.*,
                    s.nom_serie,
                    g.id_generation,
                    g.nom_generation,
                    b.nom_booster,
                    r.nom_rarete
                FROM tbl_carte c
                LEFT JOIN serie s ON c.id_serie = s.id_serie
                LEFT JOIN generation g ON s.id_generation = g.id_generation
                LEFT JOIN booster b ON c.id_booster = b.id_booster
                LEFT JOIN rarete r ON c.id_rarete = r.id_rarete
                WHERE c.id_carte = :id_carte
            ");
            $stmt->execute([':id_carte' => $idCarte]);
            $carte = $stmt->fetch();

            if (!$carte) {
                jsonResponse(['success' => false, 'message' => 'Carte introuvable.'], 404);
            }

            jsonResponse(['success' => true, 'data' => $carte]);
            break;

        case 'ajouter_carte':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                jsonResponse(['success' => false, 'message' => 'Methode non autorisee.'], 405);
            }

            $nomCarte = cleanText($_POST['nom_carte'] ?? '');
            $idPokemon = cleanText($_POST['id_pokemon'] ?? '');
            $numeroCarte = cleanText($_POST['numero_carte'] ?? '');
            $valeurCarte = $_POST['valeur_carte'] !== '' ? (float)$_POST['valeur_carte'] : 0;
            $pv = $_POST['pv'] !== '' ? (int)$_POST['pv'] : null;
            $generation = cleanText($_POST['generation'] ?? '');
            $type = cleanText($_POST['type'] ?? '');
            $talent = cleanText($_POST['talent'] ?? '');
            $illustration = cleanText($_POST['illustration'] ?? '');
            $idSerie = (int)($_POST['id_serie'] ?? 0);
            $idBooster = (int)($_POST['id_booster'] ?? 0);
            $idRarete = (int)($_POST['id_rarete'] ?? 0);

            if ($nomCarte === '' || $idPokemon === '' || $numeroCarte === '' || $idSerie <= 0 || $idBooster <= 0 || $idRarete <= 0) {
                jsonResponse(['success' => false, 'message' => 'Remplis les champs obligatoires.'], 400);
            }

            if ($illustration === '') {
                $slug = strtolower(str_replace(' ', '-', $nomCarte));
                $illustration = "C:\wamp64\www\pokemon_90s_site\cartephoto\PhotoJunior.png";
            }

            $stmt = $pdo->prepare("
                INSERT INTO tbl_carte
                (id_pokemon, numero_carte, valeur_carte, pv, nom_carte, generation, type, talent, illustration, id_serie, id_booster, id_rarete)
                VALUES
                (:id_pokemon, :numero_carte, :valeur_carte, :pv, :nom_carte, :generation, :type, :talent, :illustration, :id_serie, :id_booster, :id_rarete)
            ");

            $stmt->execute([
                ':id_pokemon' => $idPokemon,
                ':numero_carte' => $numeroCarte,
                ':valeur_carte' => $valeurCarte,
                ':pv' => $pv,
                ':nom_carte' => $nomCarte,
                ':generation' => $generation,
                ':type' => $type,
                ':talent' => $talent,
                ':illustration' => $illustration,
                ':id_serie' => $idSerie,
                ':id_booster' => $idBooster,
                ':id_rarete' => $idRarete,
            ]);

            jsonResponse(['success' => true, 'message' => 'Carte ajoutee avec succes!', 'id_carte' => $pdo->lastInsertId()]);
            break;

        default:
            jsonResponse(['success' => false, 'message' => 'Action API inconnue.'], 400);
    }
} catch (Throwable $e) {
    jsonResponse(['success' => false, 'message' => 'Erreur serveur.', 'details' => $e->getMessage()], 500);
}
