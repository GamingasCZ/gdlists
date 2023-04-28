<?php
/*
Return codes: 
0 - Connection error
1 - Empty request
2 - Invalid password
[LIST_ID] - Success!!
4 - No changes made to list
*/

require("globals.php");
header('Content-type: application/json'); // Return as JSON

$mysqli = new mysqli($hostname, $username, $password, $database);

if ($mysqli -> connect_errno) {
  echo "0";
  exit();
}

// Checking request
$DATA = json_decode(file_get_contents("php://input"), true);
$fuckupData = sanitizeInput(array($DATA["id"],$DATA["listData"],$DATA["isNowHidden"]));

// Password check
if (in_array($DATA["hidden"], Array(0,1)) and $DATA["isNowHidden"] == "true") {
    $listData = doRequest($mysqli, "SELECT * FROM `lists` WHERE `hidden` = ?", [$fuckupData[0]], "s");
}
elseif (in_array($DATA["hidden"], Array(0,1)) and $DATA["isNowHidden"] == "false") {
    $listData = doRequest($mysqli, "SELECT * FROM `lists` WHERE `id` = ?", [$fuckupData[0]], "i");
}
else {
    $listData = doRequest($mysqli, "SELECT * FROM `lists` WHERE `id` = ?", [$fuckupData[0]], "i");
}

// When no changes are made in the list
$isBeingHidden = $DATA["hidden"] == 1 and $DATA["isNowHidden"] == "false" && $DATA["hidden"] == 0 and $DATA["isNowHidden"] == "true";
if ($listData["data"] == $fuckupData[1] && !$isBeingHidden) {
    die("4");
}

// Check ownership (did i just say SHIP?? THAT'S A GD REFERENCE!!)
$checkUser = checkListOwnership($mysqli, $listData["uid"]);
if (!$checkUser) {
  $mysqli -> close();
  die("2");
}

$diffGuess = $DATA["diffGuesser"] == 1 ? 1 : 0;
$retListID = [$DATA["id"]];
// Private list settings
if ($DATA["hidden"] == 1 and $DATA["isNowHidden"] == "true") {
    doRequest($mysqli, "UPDATE `lists` SET `data` = ?, `diffGuesser` = ? WHERE `hidden` = ?", [$fuckupData[1], $diffGuess, $DATA["id"]], "sss");
}
elseif ($DATA["hidden"] == 1 and $DATA["isNowHidden"] == "false") {
    $hidden = privateIDGenerator($listData["name"], $listData["creator"], $listData["timestamp"]);
    $retListID[0] = $hidden;
    doRequest($mysqli, "UPDATE `lists` SET `data` = ?, `hidden` = ?, `diffGuesser` = ? WHERE `id` = ?", [$fuckupData[1], $hidden, $diffGuess, $DATA["id"]], "ssss");
}
elseif ($DATA["hidden"] == 0 and $DATA["isNowHidden"] == "false") {
    doRequest($mysqli, "UPDATE `lists` SET `data` = ?, `diffGuesser` = ? WHERE `id` = ?", [$fuckupData[1], $diffGuess, $DATA["id"]], "sss");
}
else {
    doRequest($mysqli, "UPDATE `lists` SET `data` = ?, `hidden`='0', `diffGuesser` = ? WHERE `hidden` = ?", [$fuckupData[1], $diffGuess, $DATA["id"]], "sss");
    $retListID[0] = $listData["id"];
}

echo json_encode($retListID);

$mysqli -> close();

?>
