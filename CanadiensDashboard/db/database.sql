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



