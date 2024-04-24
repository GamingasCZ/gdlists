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

// Checking request
$DATA = json_decode(file_get_contents("php://input"), true);

// Check list
// $listCheck = checkList($DATA["listData"]);
// if (is_string($listCheck)) die(json_encode([-1, $listCheck]));

$fuckupData = sanitizeInput(array($DATA["id"],$DATA["listData"],$DATA["isNowHidden"]));

// Password check
if ($DATA["type"] == "list") {
    if (in_array($DATA["hidden"], Array(0,1)) and $DATA["isNowHidden"] == "true") {
        $listData = doRequest($mysqli, "SELECT * FROM `lists` WHERE `hidden` = ?", [$fuckupData[0]], "s");
    }
    elseif (in_array($DATA["hidden"], Array(0,1)) and $DATA["isNowHidden"] == "false") {
        $listData = doRequest($mysqli, "SELECT * FROM `lists` WHERE `id` = ?", [$fuckupData[0]], "i");
    }
    else {
        $listData = doRequest($mysqli, "SELECT * FROM `lists` WHERE `id` = ?", [$fuckupData[0]], "i");
    }
}
else {
    $listData = doRequest($mysqli, "SELECT * FROM `reviews` WHERE `url` = ?", [$fuckupData[0]], "s");
}

// When no changes are made in the list
$isBeingHidden = ($DATA["hidden"] == 1 && $DATA["isNowHidden"] == "false") || ($DATA["hidden"] == 0 && $DATA["isNowHidden"] == "true");
if ($listData["data"] == $fuckupData[1] && !$isBeingHidden) {
    die(json_encode([-1, 4]));
}

// Check ownership (did i just say SHIP?? THAT'S A GD REFERENCE!!)
$checkUser = checkListOwnership($mysqli, $listData["uid"]);
if (!$checkUser) {
  $mysqli -> close();
  die(json_encode([-1, 2]));
}

$disableComments = $DATA["disComments"] == 1 ? 1 : 0;
$retListID = [$DATA["id"]];

// Private list settings
if ($DATA["type"] == "list") {
    $diffGuess = $DATA["diffGuesser"] == 1 ? 1 : 0;
    if ($DATA["hidden"] == 1 and $DATA["isNowHidden"] == "true") {
        doRequest($mysqli, "UPDATE `lists` SET `data` = ?, `diffGuesser` = ?, `commDisabled` = ? WHERE `hidden` = ?", [$fuckupData[1], $diffGuess, $disableComments, $DATA["id"]], "sssi");
    }
    elseif ($DATA["hidden"] == 1 and $DATA["isNowHidden"] == "false") {
        $hidden = privateIDGenerator($listData["name"], $listData["creator"], $listData["timestamp"]);
        $retListID[0] = $hidden;
        doRequest($mysqli, "UPDATE `lists` SET `data` = ?, `hidden` = ?, `diffGuesser` = ?, `commDisabled` = ? WHERE `id` = ?", [$fuckupData[1], $hidden, $diffGuess, $disableComments, $DATA["id"]], "ssssi");
    }
    elseif ($DATA["hidden"] == 0 and $DATA["isNowHidden"] == "false") {
        doRequest($mysqli, "UPDATE `lists` SET `data` = ?, `diffGuesser` = ?, `commDisabled` = ? WHERE `id` = ?", [$fuckupData[1], $diffGuess, $disableComments, $DATA["id"]], "sssi");
    }
    else {
        doRequest($mysqli, "UPDATE `lists` SET `data` = ?, `hidden`='0', `diffGuesser` = ?, `commDisabled` = ? WHERE `hidden` = ?", [$fuckupData[1], $diffGuess, $disableComments, $DATA["id"]], "sssi");
        $retListID[0] = $listData["id"];
    }
    
    // Adding levels to database
    if ($DATA["hidden"] == 0) {
        doRequest($mysqli, "DELETE FROM `levels` WHERE `listID`=?", [$DATA["id"]], "i");
        $levels = json_decode($DATA["listData"], true);
        
        // hope it's not an old list :D
        addLevelsToDatabase($mysqli, $levels["levels"], $DATA["id"], $listData["uid"]);
    }
}
else {
    doRequest($mysqli, "UPDATE `reviews` SET `data` = ?, `hidden`= ?, `tagline` = ?, `commDisabled` = ? WHERE `url` = ?", [$fuckupData[1], 0, $DATA["tagline"], $disableComments, $DATA["id"]], "sisis");
}

echo json_encode($retListID);

$mysqli -> close();

?>
