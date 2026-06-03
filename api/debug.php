<?php

require_once("notifications.php");
require_once("comments.php");

header("Content-Type: application/json"); // Return as JSON

if (!$debugMode) die(http_response_code(401));

$mysqli = new mysqli($hostname, $username, $password, $database);
if ($mysqli->connect_errno) {
  echo "0";
  exit();
}
$mysqli->set_charset("utf8mb4");

$DATA = json_decode(file_get_contents("php://input"));
enum D: int {
    case From = 0;
    case To = 1;
    case PostType = 2;
    case PostID = 3;
    case NotifType = 4;
}
switch ($_SERVER["REQUEST_METHOD"]) {
    case 'GET':
        if (isset($_GET["users"])) {
            die(json_encode(doRequest($mysqli, "SELECT username,discord_id from users WHERE username LIKE 'test%' LIMIT 20", [], "", true)));
        }
        if (isset($_GET["posts"])) {
            die(json_encode(doRequest($mysqli, "SELECT name,id from lists UNION SELECT name,id from reviews LIMIT 20", [], "", true)));
        }
        break;
    case 'POST':
        if ($DATA[D::NotifType->value] == 0)
            sendComment($mysqli, "Dobrá ==/*:'@ &09", $DATA[D::From->value], $DATA[D::PostID->value], $DATA[D::PostType->value], "#FF0000", false);
        else {
            createNotification(
                $mysqli,
                $DATA[D::From->value],
                $DATA[D::To->value],
                $DATA[D::NotifType->value]+1,
                $DATA[D::PostType->value]+1,
                $DATA[D::PostID->value]);
        }
    
    default:
        # code...
        break;
}

?>