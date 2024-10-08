<?php
/*
Return codes: 
0 - Connection error
1 - Empty request
2 - Invalid password
3 - Success!
*/

require("globals.php");
header('Content-type: application/json'); // Return as JSON

$mysqli = new mysqli($hostname, $username, $password, $database);

if ($mysqli -> connect_errno) {
  http_response_code(500);
  echo "0";
  exit();
}

// Checking request

$DATA = json_decode(file_get_contents("php://input"), true);

$fuckupData = sanitizeInput(array($DATA["id"]));

// Password check
if ($DATA["type"] == "review")
  $listData = doRequest($mysqli, "SELECT * FROM `reviews` WHERE `id` = ?", [strval($fuckupData[0])], "s");
else {
  $listData = doRequest($mysqli, "SELECT * FROM `lists` WHERE `id` = ?", [strval($fuckupData[0])], "i");
}

// This causes passwords to not work, hopefully no one minds :)
$creatorCheck = checkListOwnership($mysqli, $listData["uid"]);
if (!$creatorCheck) {
  $mysqli -> close();
  http_response_code(401);
  die("2");
}

// Removing list
if ($DATA["type"] == "review")
  $res = doRequest($mysqli, "DELETE FROM `reviews` WHERE `id` = ?", [$listData["id"]], "s");
else {
  $res = doRequest($mysqli, "DELETE FROM `lists` WHERE `id` = ?", [$listData["id"]], "i");
}
if (array_key_exists("error", $res)) die("0");

echo "3";

$mysqli -> close();
?>
