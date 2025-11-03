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

INSERT INTO joueurs (nom,prenom,numero,position,buts,passes)
VALUES  ('Suzuki','Nick',14,'Attaquant',8,12),
		('Hutson','Lane',14,'Attaquant',3,12),
		('Caufield','Cole',14,'Attaquant',10,12);



