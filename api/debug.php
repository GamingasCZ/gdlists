<?php

require_once("globals.php");
require_once("notifications.php");

header("Content-Type: application/json"); // Return as JSON

if (!$debugMode) die(http_response_code(401));

$mysqli = new mysqli($hostname, $username, $password, $database);
if ($mysqli->connect_errno) {
  echo "0";
  exit();
}
$mysqli->set_charset("utf8mb4");

$DATA = json_decode(file_get_contents("php://input"));
switch ($_SERVER["REQUEST_METHOD"]) {
    case 'GET':
        if (isset($_GET["users"])) {
            die(json_encode(doRequest($mysqli, "SELECT username,discord_id from users LIMIT 20", [], "", true)));
        }
        if (isset($_GET["posts"])) {
            die(json_encode(doRequest($mysqli, "SELECT name,id from lists UNION SELECT name,id from reviews LIMIT 20", [], "", true)));
        }
        break;
    case 'POST':
        createNotification($mysqli, $DATA[0], $DATA[1], $DATA[4]+1, $DATA[2]+1, $DATA[3]);
    
    default:
        # code...
        break;
}

?>