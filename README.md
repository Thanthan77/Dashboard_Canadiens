#  CanadiensDashboard  
CanadiensDashboard est un tableau de bord interactif regroupant l’ensemble des données essentielles du Canadien de Montréal : statistiques individuelles, classement de l’équipe dans la LNH, et résultats mensuels détaillés avec répartition des victoires et des défaites. Le projet combine un frontend dynamique et un backend PHP pour offrir une expérience fluide et structurée.

##  Aperçu du projet
CanadiensDashboard est une application web dynamique composée d’un **frontend HTML/CSS/JavaScript** et d’un **backend en PHP** servant les données des joueurs.  
Le projet inclut :
- un affichage dynamique des joueurs,
- une page dédiée pour chaque joueur via un paramètre d’URL,
- une API PHP simple pour fournir les statistiques,
- un déploiement complet sur Render.

Ce projet représente un MVP démontrant la capacité à livrer une application web complète, documentée et déployée.

---
## 🚀 Fonctionnalités principales 

### 🔹 Fonctionnalités du MVP 

- **Statistiques des joueurs** : fiche détaillée pour chaque joueur du Canadien de Montréal.
-  **Classement de l’équipe dans la LNH** : position du CH dans le classement général de la ligue.
- **Résultats des matchs par mois** : affichage des scores mensuels avec distinction claire entre **victoires** et **défaites**.
- **Navigation dynamique** : pages générées selon les paramètres d’URL (ex. `?id=` pour les joueurs).
- **Backend PHP** servant les données (joueurs, classement, résultats).
- **Interface simple, rapide et responsive**.
- **Déploiement complet sur Render**, accessible publiquement.

### 🔹 Fonctionnalités techniques 

- API PHP légère retournant des données en JSON. 
- Séparation claire frontend / backend.
- Gestion des erreurs (ID invalide, données manquantes).
- Code organisé pour faciliter l’évolution du projet. 

##  Technologies utilisées

| Catégorie        | Technologies |
|------------------|--------------|
| **Frontend**     | HTML, CSS, JavaScript |
| **Backend**      | PHP |
| **Déploiement**  | Render (Web Service + Static Site) |
| **Outils**       | Git, GitHub, Markdown |

---

##  Structure du projet

```plaintext
canadiens-dashboard/
│
├── backend/
│   ├── api.php
│   ├── players.json
│   └── utils.php
│
├── site/
│   ├── index.html
│   ├── classements.html
│   ├── joueurs.html
│   ├── resultat_match.html
│   ├── statistiqueJoueur.html
│   ├── statistiques.html
│   ├── css/
│   │   └── accueil.css
│   │   └── classements.css
│   │   └── general.css
│   │   └── joueurs.css
│   │   └── resultats.css
│   │   └── statistiqueJoueur.css
│   │   └── statistiques.css
│   └── javascripts/
│       ├── classements.js
│       └── joueurs.js
│       └── resultat.js
│       └── statistiqueJoueurs.js
│       └── statistiques.js
│
├── README.md
└── Dockerfile
```
## 🔗 Liens importants

| Type               | Lien                                                                 |
|--------------------|----------------------------------------------------------------------|
| **Site déployé**   | [https://dashboard-canadiens.onrender.com](https://dashboard-canadiens.onrender.com)           |
| **Repository GitHub** | [https://github.com/Thanthan77/Dashboard_Canadiens](https://github.com/Thanthan77/Dashboard_Canadiens) |



