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
7 - Bad request
8 - Component successful update
*/

require("globals.php");
require("contentValidator.php");
header('Content-type: application/json'); // Return as JSON

$mysqli = new mysqli($hostname, $username, $password, $database);

if ($mysqli -> connect_errno) {
    die(json_encode([-1, 0]));
}
$mysqli->set_charset("utf8mb4");

// Checking request
$DATA = json_decode(file_get_contents("php://input"), true);
$IS_LIST = $DATA["type"] == "list";

// Component update, used so far in checklists
$changingComponents = false;
if (isset($DATA["components"])) {
    $changingComponents = true;
    if ($DATA["isNowHidden"])
        $listData = doRequest($mysqli, "SELECT * FROM `reviews` WHERE `hidden` = ?", [($DATA["id"])], "s");
    else
        $listData = doRequest($mysqli, "SELECT * FROM `reviews` WHERE id = ?", [intval($DATA["id"])], "i");
    goto ownershipCheck; // sorry
}

$decoded = json_decode($DATA["listData"], true);

// Check list
// $listCheck = checkList($DATA["listData"]);
// if (is_string($listCheck)) die(json_encode([-1, $listCheck]));

$fuckupData = sanitizeInput(array($DATA["id"],$DATA["listData"],$DATA["isNowHidden"], $DATA["hidden"]));

// Password check
if ($IS_LIST) {
    $listData = doRequest($mysqli, "SELECT * FROM `lists` WHERE `id` = ?", [$fuckupData[0]], "i");
}
else {
    // Valid thumbnail
    
    if (!$decoded["thumbnail"][0] == '' && strlen($decoded["thumbnail"][0]) != 40) die("7");
    $listData = doRequest($mysqli, "SELECT * FROM `reviews` WHERE id = ?", [$fuckupData[0]], "s");
}

// When no changes are made in the list
$isBeingHidden = ($fuckupData[3] == 1 && $fuckupData[2] == "false") || ($fuckupData[3] == 0 && $fuckupData[2] == "true");
if ($listData["data"] == $fuckupData[1] && !$isBeingHidden) {
    die(json_encode([-1, 4]));
}

// Check ownership (did i just say SHIP?? THAT'S A GD REFERENCE!!)
ownershipCheck:
$checkUser = checkListOwnership($mysqli, $listData["uid"]);
if (!$checkUser) {
  $mysqli -> close();
  die(json_encode([-1, 2]));
}

if ($changingComponents) {
    $list = json_decode(htmlspecialchars_decode(gzuncompress(base64_decode($listData["data"]))), true);
    $componentsToUpdate = $DATA["components"];
    $compKeys = array_keys($componentsToUpdate);
    // print_r($list);
    // echo "---";
    $compCount = sizeof($list["containers"]);
    for ($i = 0; $i < $compCount; $i++) {
        if (in_array($list["containers"][$i]["id"], $compKeys))
            $list["containers"][$i]["data"] = $componentsToUpdate[$list["containers"][$i]["id"]]["data"];
    }
    // print_r($list);
    $compressedData = base64_encode(gzcompress(json_encode($list)));
    if ($IS_LIST)
        $res = doRequest($mysqli, "UPDATE `lists` SET `data` = ? WHERE `id` = ?", [$compressedData, $DATA["id"]], "si");
    else {
    if ($DATA["isNowHidden"])
        $res = doRequest($mysqli, "UPDATE `reviews` SET `data` = ? WHERE `hidden` = ?", [$compressedData, $DATA["id"]], "ss");
    else
        $res = doRequest($mysqli, "UPDATE `reviews` SET `data` = ? WHERE id = ?", [$compressedData, $DATA["id"]], "si");
    }

    $mysqli->close();
    if (array_key_exists("error", $res)) die(json_encode([-1, 7]));
    else die("8");
}

$disableComments = intval($DATA["disComments"]);
$doHide = intval($DATA["hidden"]) == 1;
$thumbdata = json_encode(array_slice($decoded["thumbnail"], 1));
$diffGuess = $DATA["diffGuesser"] == 1 ? 1 : 0;
$retListID = $DATA["id"];

// Private list settings
$compressedData = base64_encode(gzcompress($fuckupData[1]));
$hiddenID = privateIDGenerator($listData["name"], $listData["uid"], $listData["timestamp"]);
$hidden = $doHide ? $hiddenID : '0';
if ($IS_LIST) {
    $res = doRequest($mysqli, "UPDATE `lists` SET `data` = ?, `hidden` = ?, `diffGuesser` = ?, `commDisabled` = ?, `tagline` = ?, `thumbnail` = ?, `thumbProps` = ? WHERE `id` = ?", [$compressedData, $hidden, $diffGuess, $disableComments, $decoded["tagline"], $decoded["thumbnail"][0] ? $decoded["thumbnail"][0] : null, $thumbdata, $DATA["id"]], "sssssssi");
    if (array_key_exists("error", $res)) die(json_encode([-1, 7]));
}
else {
    $res = doRequest($mysqli, "UPDATE `reviews` SET `data` = ?, `hidden`= ?, `tagline` = ?, `commDisabled` = ?, `thumbnail` = ?, `thumbProps` = ?, `lang` = ? WHERE id = ?", [$compressedData, $hidden, $decoded["tagline"], $disableComments, $decoded["thumbnail"][0] ? $decoded["thumbnail"][0] : null, $thumbdata, $decoded["language"], $DATA["id"]], "sssissss");
    if (array_key_exists("error", $res)) die(json_encode([-1, 7]));
}

// Return either ID or privateID
$retListID = $doHide ? $hiddenID : $listData["id"];;

// Adding levels to database
if ($fuckupData[3] == 0) {
    // // hope it's not an old list :D
    addLevelsToDatabase($mysqli, $decoded["levels"], $DATA["id"], $listData["uid"], !$IS_LIST);
}

echo json_encode([$retListID]);

$mysqli -> close();

?>
