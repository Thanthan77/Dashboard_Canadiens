<?php
// config.php
interface Config
    {
        const DB_HOST = "database:3306";//adresse/nom de domaine du serveur MySQL
        const DB_USER = "root";        //nom d'utilisateur pour se connecter à MySQL
        const DB_PWD = "tiger";        //mot de passe pour se connecter à MySQL
        const DB_NAME = "docker"; //nom de la base de donnees
    }