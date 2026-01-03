<?php
header('Content-Type: application/json');

echo json_encode([
    "status" => "online",
    "message" => "Backend Canadiens API is running on Render 🚀",
    "time" => date("Y-m-d H:i:s")
]);
