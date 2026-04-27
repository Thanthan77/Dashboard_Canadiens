#  CanadiensDashboard  
CanadiensDashboard est un tableau de bord interactif regroupant l’ensemble des données essentielles du Canadien de Montréal : statistiques individuelles, classement de l’équipe dans la LNH, et résultats mensuels détaillés avec répartition des victoires et des défaites. Le projet combine un frontend dynamique et un backend PHP pour offrir une expérience fluide et structurée.

##  Aperçu du projet
CanadiensDashboard est une application web dynamique composée d’un **frontend HTML/CSS/JavaScript** qui appelle une API externe
Le projet inclut :
- un affichage dynamique des joueurs,
- une page dédiée pour chaque joueur via un paramètre d’URL,
- un déploiement complet sur GitHub Pages.


---
##  Fonctionnalités principales 

### 🔹 Fonctionnalités du MVP 

- **Statistiques des joueurs** : fiche détaillée pour chaque joueur du Canadien de Montréal.
-  **Classement de l’équipe dans la LNH** : position du CH dans le classement général de la ligue.
- **Résultats des matchs par mois** : affichage des scores mensuels avec distinction claire entre **victoires** et **défaites**.
- **Données des séries éliminatoires (Playoffs)** : Affichage dynamique du bracket complet des séries éliminatoires de la LNH, mis à jour automatiquement selon la saison en cours.
- **Navigation dynamique** : pages générées selon les paramètres d’URL (ex. `?id=` pour les joueurs).
- **Interface simple, rapide et responsive**.
- **Déploiement complet sur github pages**, accessible publiquement.

### 🔹 Fonctionnalités techniques 

- Gestion des erreurs (ID invalide, données manquantes).
- Code organisé pour faciliter l’évolution du projet. 

##  Technologies utilisées

| Catégorie        | Technologies |
|------------------|--------------|
| **Frontend**     | HTML, CSS, JavaScript |
| **Déploiement**  | GitHub Pages  |
| **Outils**       | Git, GitHub, Markdown |

---

##  Structure du projet

```plaintext
canadiens-dashboard/
│
| index.html
|   ├──html/ 
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
|       ├── utils/
|           ├── saisonActuelle.js
|           ├── joueurs_get.js
│       ├── classements.js
|       ├── playoffs.js
│       └── joueurs.js
│       └── resultat.js
│       └── statistiqueJoueurs.js
│       └── statistiques.js
│
├── README.md

```
## 🔗 Liens importants

| Type               | Lien                                                                 |
|--------------------|----------------------------------------------------------------------|
| **Site déployé**   | [https://thanthan77.github.io/Dashboard_Canadiens/](https://thanthan77.github.io/Dashboard_Canadiens/)           |
| **Repository GitHub** | [https://github.com/Thanthan77/Dashboard_Canadiens](https://github.com/Thanthan77/Dashboard_Canadiens) |



