<?php
/*
Return codes: 
0 - Connection error
1 - Empty request
2 - Invalid password
[LIST_ID] - Success!!
4 - No changes made to list
5 - Invalid list data
6 - Invalid list parameters
*/

require("globals.php");
require("checkList.php");
header('Content-type: application/json'); // Return as JSON

$mysqli = new mysqli($hostname, $username, $password, $database);

if ($mysqli -> connect_errno) {
    die(json_encode([-1, 0]));
}
$mysqli->set_charset("utf8mb4");

// Checking request
$DATA = json_decode(file_get_contents("php://input"), true);
$decoded = json_decode($DATA["listData"], true);

// Check list
// $listCheck = checkList($DATA["listData"]);
// if (is_string($listCheck)) die(json_encode([-1, $listCheck]));

$fuckupData = sanitizeInput(array($DATA["id"],$DATA["listData"],$DATA["isNowHidden"], $DATA["hidden"]));

// Password check
if ($DATA["type"] == "list") {
    $listData = doRequest($mysqli, "SELECT * FROM `lists` WHERE `id` = ?", [$fuckupData[0]], "i");
}
else {
    // Valid thumbnail
    
    if (strlen($decoded["thumbnail"]) != 40) die("7");
    $listData = doRequest($mysqli, "SELECT * FROM `reviews` WHERE id = ?", [$fuckupData[0]], "s");
}

// When no changes are made in the list
$isBeingHidden = ($fuckupData[3] == 1 && $fuckupData[2] == "false") || ($fuckupData[3] == 0 && $fuckupData[2] == "true");
if ($listData["data"] == $fuckupData[1] && !$isBeingHidden) {
    die(json_encode([-1, 4]));
}

// Check ownership (did i just say SHIP?? THAT'S A GD REFERENCE!!)
$checkUser = checkListOwnership($mysqli, $listData["uid"]);
if (!$checkUser) {
  $mysqli -> close();
  die(json_encode([-1, 2]));
}

$disableComments = intval($DATA["disComments"]);
$doHide = intval($DATA["hidden"]) == 1;
$diffGuess = $DATA["diffGuesser"] == 1 ? 1 : 0;

$retListID = [$DATA["id"]];

// Private list settings
if ($DATA["type"] == "list") {

    $hiddenID =  privateIDGenerator($listData["name"], $listData["uid"], $listData["timestamp"]);
    $hidden = $doHide ? $hiddenID : '0';
    
    $res = doRequest($mysqli, "UPDATE `lists` SET `data` = ?, `hidden` = ?, `diffGuesser` = ?, `commDisabled` = ? WHERE `id` = ?", [$fuckupData[1], $hidden, $diffGuess, $disableComments, $DATA["id"]], "ssssi");
    if (array_key_exists("error", $res)) die("5");
    
    // Return either ID or privateID
    $retListID[0] = $doHide ? $hiddenID : $listData["id"];
    
    // Adding levels to database
    if ($fuckupData[3] == 0) {
        doRequest($mysqli, "DELETE FROM `levels` WHERE `listID`=?", [$DATA["id"]], "i");
        $levels = json_decode($DATA["listData"], true);
        
        // hope it's not an old list :D
        addLevelsToDatabase($mysqli, $levels["levels"], $DATA["id"], $listData["uid"]);
    }
}
else {
    doRequest($mysqli, "UPDATE `reviews` SET `data` = ?, `hidden`= ?, `tagline` = ?, `commDisabled` = ?, `thumbnail` = ? WHERE id = ?", [$fuckupData[1], intval($fuckupData[3] == "true"), $decoded["tagline"], $disableComments, $decoded["thumbnail"], $DATA["id"]], "sisiss");
    $retListID = str_replace(' ', '-', $listData["name"]) . '-' . $listData["id"];
}

echo json_encode($retListID);

$mysqli -> close();

?>
