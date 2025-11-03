-- Création des tables 
CREATE TABLE joueurs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nom VARCHAR(120),
  prenom VARCHAR(100),
  numero INT CHECK (numero BETWEEN 1 AND 99),
  position ENUM('Gardien', 'Défenseur', 'Attaquant'),
  buts INT DEFAULT 0,
  passes INT DEFAULT 0,
  points INT GENERATED ALWAYS AS (buts + passes) STORED
);

CREATE TABLE stats_gardiens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  joueur_id INT,
  arrets INT DEFAULT 0,
  tirs_reçus INT DEFAULT 0,
  pourcentage_arrets DECIMAL(4,3), -- exemple : 0.914
  buts_encaissés INT DEFAULT 0,
  blanchissages INT DEFAULT 0,
  temps_de_jeu INT DEFAULT 0, -- en minutes

  FOREIGN KEY (joueur_id) REFERENCES joueurs(id) ON DELETE CASCADE
);


CREATE TABLE matchs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date_match DATE,
  equipe_domicile VARCHAR(50),
  equipe_exterieure VARCHAR(50),
  score_domicile INT,
  score_exterieure INT,
  lieu ENUM('Domicile', 'Extérieur'),
  couleur_resultat VARCHAR(20) -- optionnel : pour styliser (ex: 'vert', 'rouge', 'bleu')
);

CREATE TABLE classements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  position INT,
  equipe VARCHAR(50),
  matchs_joues INT,
  victoires INT,
  defaites INT,
  defaites_prolongation INT,
  points INT
);



-- Insertion de données
INSERT INTO joueurs (nom, prenom, numero, position, buts, passes)
VALUES
  ('Suzuki', 'Nick', 14, 'Centre', 8, 12),
  ('Caufield', 'Cole', 13, 'Ailier droit', 10, 12),
  ('Slafkovsky', 'Juraj', 20, 'Ailier gauche', 6, 9),
  ('Anderson', 'Josh', 17, 'Ailier droit', 5, 4),
  ('Gallagher', 'Brendan', 11, 'Ailier droit', 4, 6),
  ('Newhook', 'Alex', 15, 'Centre', 7, 8),
  ('Dach', 'Kirby', 77, 'Centre', 3, 5),
  ('Evans', 'Jake', 71, 'Centre', 2, 4),
  ('Veleno', 'Joe', 90, 'Centre', 4, 7),
  ('Demidov', 'Ivan', 93, 'Ailier droit', 9, 11),
  ('Bolduc', 'Zachary', 76, 'Ailier droit', 2, 3),
  ('Laine', 'Patrik', 92, 'Ailier droit', 6, 10),
  ('Guhle', 'Kaiden', 21, 'Défenseur', 1, 5),
  ('Carrier', 'Alexandre', 45, 'Défenseur', 0, 3),
  ('Dobson', 'Noah', 53, 'Défenseur', 2, 6),
  ('Hutson', 'Lane', 48, 'Défenseur', 3, 12),
  ('Matheson', 'Mike', 8, 'Défenseur', 1, 7),
  ('Montembeault', 'Samuel', 35, 'Gardien', 0, 0),
  ('Dobeš', 'Jakub', 75, 'Gardien', 0, 0);


-- Montembeault (utilise LAST_INSERT_ID si tu viens juste d'insérer)
INSERT INTO stats_gardiens (joueur_id, arrets, tirs_reçus, pourcentage_arrets, buts_encaissés, blanchissages, temps_de_jeu)
VALUES (
  (SELECT id FROM joueurs WHERE nom = 'Montembeault' AND prenom = 'Samuel'),
  32, 35, 0.914, 3, 2, 60
);

-- Dobeš
INSERT INTO stats_gardiens (joueur_id, arrets, tirs_reçus, pourcentage_arrets, buts_encaissés, blanchissages, temps_de_jeu)
VALUES (
  (SELECT id FROM joueurs WHERE nom = 'Dobeš' AND prenom = 'Jakub'),
  28, 30, 0.933, 2, 1, 58
);



INSERT INTO matchs (date_match, equipe_domicile, equipe_exterieure, score_domicile, score_exterieure, lieu, couleur_resultat)
VALUES 
('2025-11-02', 'Canadiens', 'Kraken', 2, 3, 'Domicile', 'rouge'),
('2025-11-02', 'Canadiens', 'Sabres', 4, 3, 'Domicile', 'vert'),
('2025-11-02', 'Canadiens', 'Senators', 2, 3, 'Domicile', 'rouge'),
('2025-11-02', 'Canadiens', 'Red wings', 4, 3, 'Domicile', 'vert'),
('2025-11-02', 'Canadiens', 'Flames', 2, 3, 'Domicile', 'rouge'),
('2025-11-02', 'Canadiens', 'Lightning', 2, 3, 'Domicile', 'rouge');

INSERT INTO classements (position, equipe, matchs_joues, victoires, defaites, defaites_prolongation, points)
VALUES
(1, 'Florida Panthers', 15, 11, 3, 1, 15),
(2, 'Toronto Maple Leafs', 15, 10, 3, 2, 15),
(3, 'Tampa Bay Lightning', 15, 9, 4, 2, 15),
(4, 'Canadiens de Montréal', 15, 8, 4, 3, 15),
(5, 'Ottawa Senators', 13, 8, 4, 1, 13),
(6, 'Boston Bruins', 14, 6, 6, 2, 10),
(7, 'Detroit Red Wings', 15, 5, 9, 1, 10),
(8, 'Buffalo Sabres', 15, 4, 9, 2, 10);