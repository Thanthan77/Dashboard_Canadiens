<?php 

header("Access-Control-Allow-Origin: *"); ?> 

<!DOCTYPE html>
<html lang="fr">

<head>
  <meta charset="utf-8">
  <meta content="width=device-width, initial-scale=1.0" name="viewport">

  <title>Programmation web - PHP</title>

  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-4Q6Gf2aSP4eDXB8Miphtr37CMZZQ5oXLH2yaXMJ2w8e2ZtHTl7GptT4jmndRuHDT" crossorigin="anonymous">
  <!-- Template Main CSS File -->
  <link href="css/style.css" rel="stylesheet">

  <!-- =======================================================
  * Updated: Apr 20 2025
  * Author: Abdelmoumene Toudeft (Abdelmoumene.Toudeft@etsmtl.ca)
  ======================================================== -->
</head>

<body>
  <div class="container">
    <main id="main" class="main">
      <section class="section">
        <h1>
            TCH056 - Programmation web en PHP
        </h1>
        <h2>
            API Rest
        </h2>
        <div class="row">
          <div class="col-lg-8 offset-2">
            <div class="cadre">
                <h3>Comment utiliser l'API: </h3>
                <ol>
                  <li>Liste de toutes les activités : <a href='activites'>http://localhost/apiLabNote/v1/activites</a></li>
                  <li>Obtenir un produit par son identifiant : <a href='produits/d612faca-ca8f-4809-b260-2a74af4c8c47'>http://localhost/monapi/produits/{id}</a></li>
                  <li>Pour insérer un nouveau un produit envoyer une requête POST à l'URL <strong>http://localhost/monapi/produits</strong> en fournissant les données du produit dans le corps
                    de la requête dans le format JSON suivant :<br>
                    <pre>    {
      "nom":"Macbook Air",
      "categorie":"électronique",
      "prix":2399.49,
      "image":"images/im10.jpg"
    }</pre>
  </li>
                </ol>
            </div>
          </div>                
        </div>


      </section>
    </main><!-- End #main -->
  </div>

  <!-- ======= Footer ======= -->
  <footer id="footer" class="footer">
    <div class="copyright">
      &copy; Copyright <strong><span>A. Toudeft - ETS</span></strong>.
    </div>
  </footer><!-- End Footer -->

</body>
</html>