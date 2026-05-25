CREATE TABLE IF NOT EXISTS generation (
    id_generation SERIAL PRIMARY KEY,
    nom_generation VARCHAR(50) NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS rarete (
    id_rarete SERIAL PRIMARY KEY,
    nom_rarete VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS serie (
    id_serie SERIAL PRIMARY KEY,
    nom_serie VARCHAR(100) NOT NULL,
    date_sortie DATE,
    nb_cartes INTEGER,
    id_generation INTEGER NOT NULL REFERENCES generation(id_generation)
);

CREATE TABLE IF NOT EXISTS booster (
    id_booster SERIAL PRIMARY KEY,
    nom_booster VARCHAR(100) NOT NULL,
    image_booster VARCHAR(255),
    id_generation INTEGER NOT NULL REFERENCES generation(id_generation)
);

CREATE TABLE IF NOT EXISTS tbl_carte (
    id_carte SERIAL PRIMARY KEY,
    id_pokemon VARCHAR(50) NOT NULL,
    numero_carte VARCHAR(20) NOT NULL,
    valeur_carte NUMERIC(10, 2) DEFAULT 0.00,
    pv INTEGER,
    nom_carte VARCHAR(100) NOT NULL,
    generation VARCHAR(50),
    type VARCHAR(30),
    talent TEXT,
    illustration VARCHAR(255),
    id_serie INTEGER NOT NULL REFERENCES serie(id_serie),
    id_booster INTEGER NOT NULL REFERENCES booster(id_booster),
    id_rarete INTEGER NOT NULL REFERENCES rarete(id_rarete)
);

INSERT INTO generation (id_generation, nom_generation, description) VALUES
(1, 'Génération 1', 'Kanto - Bulbizarre, Salamèche, Carapuce et Pikachu.'),
(2, 'Génération 2', 'Johto - Germignon, Héricendre et Kaiminus.'),
(3, 'Génération 3', 'Hoenn - Arcko, Poussifeu et Gobou.'),
(4, 'Génération 4', 'Sinnoh - Tortipouss, Ouisticram et Tiplouf.'),
(5, 'Génération 5', 'Unys - Vipélierre, Gruikui et Moustillon.')
ON CONFLICT (id_generation) DO NOTHING;

INSERT INTO rarete (id_rarete, nom_rarete) VALUES
(1, 'Commune'),
(2, 'Peu commune'),
(3, 'Rare'),
(4, 'Holographique'),
(5, 'Ultra rare')
ON CONFLICT (id_rarete) DO NOTHING;

INSERT INTO serie (id_serie, nom_serie, date_sortie, nb_cartes, id_generation) VALUES
(1, 'Set de Base', '1999-01-09', 102, 1),
(2, 'Jungle', '1999-06-16', 64, 1),
(3, 'Neo Genesis', '2000-12-16', 111, 2),
(4, 'EX Rubis & Saphir', '2003-07-01', 109, 3),
(5, 'Diamant & Perle', '2007-05-23', 130, 4),
(6, 'Noir & Blanc', '2011-04-25', 115, 5)
ON CONFLICT (id_serie) DO NOTHING;

INSERT INTO booster (id_booster, nom_booster, image_booster, id_generation) VALUES
(1, 'Base Set Booster', 'https://archives.bulbagarden.net/media/upload/8/83/Base_Set_Booster_Charizard.jpg', 1),
(2, 'Jungle Booster', 'https://archives.bulbagarden.net/media/upload/2/25/Jungle_Booster_Scyther.jpg', 1),
(3, 'Neo Genesis Booster', 'https://archives.bulbagarden.net/media/upload/0/05/Neo_Genesis_Booster_Lugia.jpg', 2),
(4, 'Rubis & Saphir Booster', '', 3),
(5, 'Diamant & Perle Booster', '', 4),
(6, 'Noir & Blanc Booster', '', 5)
ON CONFLICT (id_booster) DO NOTHING;

INSERT INTO tbl_carte
(id_carte, id_pokemon, numero_carte, valeur_carte, pv, nom_carte, generation, type, talent, illustration, id_serie, id_booster, id_rarete)
VALUES
(1, 'pikachu', '58/102', 14.95, 40, 'Pikachu', 'Génération 1', 'Électrique', 'Petite souris électrique très populaire.', 'https://img.pokemondb.net/artwork/large/pikachu.jpg', 1, 1, 1),
(2, 'charizard', '4/102', 299.99, 120, 'Dracaufeu', 'Génération 1', 'Feu', 'Crache un feu assez chaud pour faire fondre des rochers.', 'https://img.pokemondb.net/artwork/large/charizard.jpg', 1, 1, 4),
(3, 'blastoise', '2/102', 189.99, 100, 'Tortank', 'Génération 1', 'Eau', 'Canons puissants sur sa carapace.', 'https://img.pokemondb.net/artwork/large/blastoise.jpg', 1, 1, 4),
(4, 'venusaur', '15/102', 159.99, 100, 'Florizarre', 'Génération 1', 'Plante', 'La fleur sur son dos absorbe l''énergie du soleil.', 'https://img.pokemondb.net/artwork/large/venusaur.jpg', 1, 1, 4),
(5, 'mewtwo', '10/102', 120.00, 60, 'Mewtwo', 'Génération 1', 'Psy', 'Pokémon créé par manipulation génétique.', 'https://img.pokemondb.net/artwork/large/mewtwo.jpg', 1, 1, 3),
(6, 'eevee', '51/64', 20.00, 50, 'Évoli', 'Génération 1', 'Normal', 'Son ADN instable permet plusieurs évolutions.', 'https://img.pokemondb.net/artwork/large/eevee.jpg', 2, 2, 1),
(7, 'lugia', '9/111', 250.00, 90, 'Lugia', 'Génération 2', 'Psy', 'Gardien des mers.', 'https://img.pokemondb.net/artwork/large/lugia.jpg', 3, 3, 4),
(8, 'typhlosion', '17/111', 80.00, 100, 'Typhlosion', 'Génération 2', 'Feu', 'Crée des explosions avec la chaleur de son corps.', 'https://img.pokemondb.net/artwork/large/typhlosion.jpg', 3, 3, 3),
(9, 'sceptile', '10/109', 55.00, 100, 'Jungko', 'Génération 3', 'Plante', 'Ses feuilles sont tranchantes.', 'https://img.pokemondb.net/artwork/large/sceptile.jpg', 4, 4, 3),
(10, 'lucario', '6/130', 75.00, 90, 'Lucario', 'Génération 4', 'Combat', 'Ressent et manipule les auras.', 'https://img.pokemondb.net/artwork/large/lucario.jpg', 5, 5, 3),
(11, 'zekrom', '47/115', 99.00, 130, 'Zekrom', 'Génération 5', 'Dragon', 'Légendaire noir chargé d''électricité.', 'https://img.pokemondb.net/artwork/large/zekrom.jpg', 6, 6, 4)
ON CONFLICT (id_carte) DO NOTHING;

SELECT setval('generation_id_generation_seq', (SELECT MAX(id_generation) FROM generation));
SELECT setval('rarete_id_rarete_seq', (SELECT MAX(id_rarete) FROM rarete));
SELECT setval('serie_id_serie_seq', (SELECT MAX(id_serie) FROM serie));
SELECT setval('booster_id_booster_seq', (SELECT MAX(id_booster) FROM booster));
SELECT setval('tbl_carte_id_carte_seq', (SELECT MAX(id_carte) FROM tbl_carte));
