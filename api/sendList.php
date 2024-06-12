<?php

/*
Return codes: 
0 - Connection error
1 - Empty request
2 - Invalid listName length
3 - Invalid listCreator length
4 - List too big
5 - Invalid list data
6 - Invalid list parameters
7 - No login / Login expired
*/

require("globals.php");
require("checkList.php");
header('Content-type: application/json'); // Return as JSON

$time = new DateTime();

$DATA = json_decode(file_get_contents("php://input"), true);

// Invalid listName length
if (strlen($DATA["lName"]) < 3 || strlen($DATA["lName"]) > 40) {
  die(json_encode([-1, 2]));
}

// Check list size
$len = strlen($DATA["listData"]);
if ($len > 25000 || $len < 150) {
  die(json_encode([-1, 4]));
}

// how did i forget about this lmao :D
$user = checkAccount();
if (!$user) die(json_encode([-1, 7]));

$user_id = $user["id"];
$diffGuess = $DATA["diffGuesser"] == 1 ? 1 : 0;
$disableComments = $DATA["disComments"] == 1 ? 1 : 0;

// Check list
$listCheck = checkList($DATA["listData"]);
if (is_string($listCheck)) die(json_encode([-1, $listCheck]));



// Checking request
error_reporting($debugMode ? -1 : 0);
$fuckupData = sanitizeInput(array($DATA["lName"],$DATA["listData"]));
$timestamp = $time -> getTimestamp();

// Generate id if list private
if ($DATA["hidden"]) { $hidden = privateIDGenerator($fuckupData[1], $user_id, $timestamp); }
else { $hidden = "0"; }

$mysqli = new mysqli($hostname, $username, $password, $database);
// Cannot connect to database
if ($mysqli -> connect_errno) {
  die(json_encode([-1, 0]));
}
$mysqli->set_charset("utf8mb4");

// Send to database
$teplate = "INSERT INTO `lists`(`creator`,`name`,`data`,`timestamp`,`hidden`,`uid`,`diffGuesser`,`commDisabled`) VALUES ('',?,?,?,?,?,?,?)";
$values = array($fuckupData[0], $fuckupData[1], $timestamp, $hidden, $user_id, $diffGuess, $disableComments);
doRequest($mysqli, $teplate, $values, "ssssssi");

if ($DATA["hidden"]) {
    // Hidden lists
    $listID = $hidden;
}
else {
    $listIDquery = $mysqli -> query("SELECT LAST_INSERT_ID()");
    $rows = $listIDquery -> fetch_all(MYSQLI_ASSOC);
    foreach ($rows as $row) {
      $listID = join("",$row);
    }
}

// Adds levels to database
if (!$DATA["hidden"]) {
  addLevelsToDatabase($mysqli, $listCheck["levels"], $listID, $user_id, false);
}

$mysqli -> close();


echo json_encode([$listID]);

?>
