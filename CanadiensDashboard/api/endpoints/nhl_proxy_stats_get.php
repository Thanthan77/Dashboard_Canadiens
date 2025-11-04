<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$url = "https://api-web.nhle.com/v1/club-stats/MTL/now";
echo file_get_contents($url);