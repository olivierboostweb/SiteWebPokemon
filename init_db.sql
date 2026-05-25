CREATE DATABASE IF NOT EXISTS cartePokemon CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cartePokemon;

DROP TABLE IF EXISTS tbl_carte;
DROP TABLE IF EXISTS booster;
DROP TABLE IF EXISTS serie;
DROP TABLE IF EXISTS rarete;
DROP TABLE IF EXISTS generation;

CREATE TABLE generation (
    id_generation INT(11) NOT NULL AUTO_INCREMENT,
    nom_generation VARCHAR(50) NOT NULL,
    description TEXT,
    PRIMARY KEY (id_generation)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE rarete (
    id_rarete INT(11) NOT NULL AUTO_INCREMENT,
    nom_rarete VARCHAR(50) NOT NULL,
    PRIMARY KEY (id_rarete)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE serie (
    id_serie INT(11) NOT NULL AUTO_INCREMENT,
    nom_serie VARCHAR(100) NOT NULL,
    date_sortie DATE,
    nb_cartes INT(11),
    id_generation INT(11) NOT NULL,
    PRIMARY KEY (id_serie),
    KEY fk_serie_generation (id_generation),
    CONSTRAINT fk_serie_generation FOREIGN KEY (id_generation) REFERENCES generation(id_generation)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE booster (
    id_booster INT(11) NOT NULL AUTO_INCREMENT,
    nom_booster VARCHAR(100) NOT NULL,
    image_booster VARCHAR(255),
    id_generation INT(11) NOT NULL,
    PRIMARY KEY (id_booster),
    KEY fk_booster_generation (id_generation),
    CONSTRAINT fk_booster_generation FOREIGN KEY (id_generation) REFERENCES generation(id_generation)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE tbl_carte (
    id_carte INT(11) NOT NULL AUTO_INCREMENT,
    id_pokemon VARCHAR(50) NOT NULL,
    numero_carte VARCHAR(20) NOT NULL,
    valeur_carte DECIMAL(10,2) DEFAULT 0.00,
    pv INT(11),
    nom_carte VARCHAR(100) NOT NULL,
    generation VARCHAR(50),
    type VARCHAR(30),
    talent TEXT,
    illustration VARCHAR(255),
    id_serie INT(11) NOT NULL,
    id_booster INT(11) NOT NULL,
    id_rarete INT(11) NOT NULL,
    PRIMARY KEY (id_carte),
    KEY fk_carte_serie (id_serie),
    KEY fk_carte_booster (id_booster),
    KEY fk_carte_rarete (id_rarete),
    CONSTRAINT fk_carte_serie FOREIGN KEY (id_serie) REFERENCES serie(id_serie),
    CONSTRAINT fk_carte_booster FOREIGN KEY (id_booster) REFERENCES booster(id_booster),
    CONSTRAINT fk_carte_rarete FOREIGN KEY (id_rarete) REFERENCES rarete(id_rarete)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO generation (nom_generation, description) VALUES
('Génération 1', 'Kanto - Bulbizarre, Salamèche, Carapuce et Pikachu.'),
('Génération 2', 'Johto - Germignon, Héricendre et Kaiminus.'),
('Génération 3', 'Hoenn - Arcko, Poussifeu et Gobou.'),
('Génération 4', 'Sinnoh - Tortipouss, Ouisticram et Tiplouf.'),
('Génération 5', 'Unys - Vipélierre, Gruikui et Moustillon.');

INSERT INTO rarete (nom_rarete) VALUES
('Commune'), ('Peu commune'), ('Rare'), ('Holographique'), ('Ultra rare');

INSERT INTO serie (nom_serie, date_sortie, nb_cartes, id_generation) VALUES
('Set de Base', '1999-01-09', 102, 1),
('Jungle', '1999-06-16', 64, 1),
('Neo Genesis', '2000-12-16', 111, 2),
('EX Rubis & Saphir', '2003-07-01', 109, 3),
('Diamant & Perle', '2007-05-23', 130, 4),
('Noir & Blanc', '2011-04-25', 115, 5);

INSERT INTO booster (nom_booster, image_booster, id_generation) VALUES
('Base Set Booster', 'https://archives.bulbagarden.net/media/upload/8/83/Base_Set_Booster_Charizard.jpg', 1),
('Jungle Booster', 'https://archives.bulbagarden.net/media/upload/2/25/Jungle_Booster_Scyther.jpg', 1),
('Neo Genesis Booster', 'https://archives.bulbagarden.net/media/upload/0/05/Neo_Genesis_Booster_Lugia.jpg', 2),
('Rubis & Saphir Booster', '', 3),
('Diamant & Perle Booster', '', 4),
('Noir & Blanc Booster', '', 5);

INSERT INTO tbl_carte (id_pokemon, numero_carte, valeur_carte, pv, nom_carte, generation, type, talent, illustration, id_serie, id_booster, id_rarete) VALUES
('pikachu', '58/102', 14.95, 40, 'Pikachu', 'Génération 1', 'Électrique', 'Petite souris électrique très populaire.', 'https://img.pokemondb.net/artwork/large/pikachu.jpg', 1, 1, 1),
('charizard', '4/102', 299.99, 120, 'Dracaufeu', 'Génération 1', 'Feu', 'Crache un feu assez chaud pour faire fondre des rochers.', 'https://img.pokemondb.net/artwork/large/charizard.jpg', 1, 1, 4),
('blastoise', '2/102', 189.99, 100, 'Tortank', 'Génération 1', 'Eau', 'Canons puissants sur sa carapace.', 'https://img.pokemondb.net/artwork/large/blastoise.jpg', 1, 1, 4),
('venusaur', '15/102', 159.99, 100, 'Florizarre', 'Génération 1', 'Plante', 'La fleur sur son dos absorbe l’énergie du soleil.', 'https://img.pokemondb.net/artwork/large/venusaur.jpg', 1, 1, 4),
('mewtwo', '10/102', 120.00, 60, 'Mewtwo', 'Génération 1', 'Psy', 'Pokémon créé par manipulation génétique.', 'https://img.pokemondb.net/artwork/large/mewtwo.jpg', 1, 1, 3),
('eevee', '51/64', 20.00, 50, 'Évoli', 'Génération 1', 'Normal', 'Son ADN instable permet plusieurs évolutions.', 'https://img.pokemondb.net/artwork/large/eevee.jpg', 2, 2, 1),
('lugia', '9/111', 250.00, 90, 'Lugia', 'Génération 2', 'Psy', 'Gardien des mers.', 'https://img.pokemondb.net/artwork/large/lugia.jpg', 3, 3, 4),
('typhlosion', '17/111', 80.00, 100, 'Typhlosion', 'Génération 2', 'Feu', 'Crée des explosions avec la chaleur de son corps.', 'https://img.pokemondb.net/artwork/large/typhlosion.jpg', 3, 3, 3),
('sceptile', '10/109', 55.00, 100, 'Jungko', 'Génération 3', 'Plante', 'Ses feuilles sont tranchantes.', 'https://img.pokemondb.net/artwork/large/sceptile.jpg', 4, 4, 3),
('lucario', '6/130', 75.00, 90, 'Lucario', 'Génération 4', 'Combat', 'Ressent et manipule les auras.', 'https://img.pokemondb.net/artwork/large/lucario.jpg', 5, 5, 3),
('zekrom', '47/115', 99.00, 130, 'Zekrom', 'Génération 5', 'Dragon', 'Légendaire noir chargé d’électricité.', 'https://img.pokemondb.net/artwork/large/zekrom.jpg', 6, 6, 4);
