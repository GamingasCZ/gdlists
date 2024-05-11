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
*/

require("globals.php");
require("checkList.php");
header('Content-type: application/json'); // Return as JSON

$time = new DateTime();

$DATA = json_decode(file_get_contents("php://input"), true);

// Invalid listName length
if (strlen($DATA["reviewName"]) < 3 || strlen($DATA["reviewName"]) > 30) {
  die(json_encode([-1, 2]));
}

// Check list size
$len = strlen(json_encode($DATA));
if ($len > 25000 || $len < 150) {
  die(json_encode([-1, 4]));
}

$user_id = checkAccount()["id"];
$diffGuess = $DATA["diffGuesser"] == 1 ? 1 : 0;
$disableComments = $DATA["disComments"] == 1 ? 1 : 0;

// Check list
/*
$listCheck = checkList($DATA["listData"]);
if (is_string($listCheck)) die(json_encode([-1, $listCheck]));
*/



// Checking request
error_reporting($debugMode ? -1 : 0);
$fuckupData = sanitizeInput(array(trim($DATA["reviewName"])));
$timestamp = $time -> getTimestamp();

// Generate id if list private
$hidden;
if ($DATA["private"]) { $hidden = privateIDGenerator($fuckupData[1], $fuckupData[0], $timestamp); }
else { $hidden = "0"; }

$mysqli = new mysqli($hostname, $username, $password, $database);
// Cannot connect to database
if ($mysqli -> connect_errno) {
  die(json_encode([-1, 0]));
}

// Send to database
$teplate = "INSERT INTO `reviews`(`name`,`uid`,`data`,`tagline`,`hidden`,`commDisabled`) VALUES (?,?,?,?,?,?)";
$values = array($fuckupData[0], $user_id, json_encode($DATA), $DATA["tagline"], $hidden, $disableComments);
$res = doRequest($mysqli, $teplate, $values, "sisssi");
if (is_array($res) && array_key_exists("error", $res)) die(5);


if ($DATA["private"]) {
    // Hidden lists
    $listID = $hidden;
}
else {
    $listIDquery = $mysqli -> query("SELECT LAST_INSERT_ID() as id");
    $rows = $listIDquery -> fetch_all(MYSQLI_ASSOC);
    foreach ($rows as $row) {
      $listID = join("",$row);
    }
}

// Adds levels to database
/*
if (!$DATA["private"]) {
  addLevelsToDatabase($mysqli, $listCheck["levels"], $listID, $user_id);
}
*/

$mysqli -> close();


echo json_encode([str_replace(' ', '-', $fuckupData[0]) . '-' . $listID]);

?>
