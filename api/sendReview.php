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
7 - Invalid thumbnail
*/

require("globals.php");
require("checkList.php");
header('Content-type: application/json'); // Return as JSON

$time = new DateTime();

$DATA = json_decode(file_get_contents("php://input"), true);

// Invalid listName length
if (strlen($DATA["reviewName"]) < 3 || strlen($DATA["reviewName"]) > 40) {
  die(json_encode([-1, 2]));
}

// Check list size
$len = strlen(json_encode($DATA));
if ($len > 50000 || $len < 150) {
  die(json_encode([-1, 4]));
}

// Valid thumbnail
if ($DATA["thumbnail"][0] != "" && strlen($DATA["thumbnail"][0]) != 40) die(json_encode([-1, 7]));
$thumbProps = json_encode(array_slice($DATA["thumbnail"], 1));
$thumb = $DATA["thumbnail"][0];
if (!strlen($thumb)) $thumb = null;

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
$fuckupData = sanitizeInput(array(trim(urlencode($DATA["reviewName"]))));
$timestamp = $time -> getTimestamp();

// Generate id if list private
$hidden = intval($DATA["private"]);

$mysqli = new mysqli($hostname, $username, $password, $database);
// Cannot connect to database
if ($mysqli -> connect_errno) {
  die(json_encode([-1, 0]));
}
$mysqli->set_charset("utf8mb4");
$compressedData = base64_encode(gzcompress(json_encode($DATA)));

// Send to database
$teplate = "INSERT INTO `reviews`(`name`,`uid`,`data`,`tagline`,`hidden`,`commDisabled`,`thumbnail`, `thumbProps`, `lang`) VALUES (?,?,?,?,?,?,?,?,?)";
$values = array($fuckupData[0], $user_id, $compressedData, $DATA["tagline"], $hidden, $disableComments, $thumb, $thumbProps, $DATA["language"]);
$res = doRequest($mysqli, $teplate, $values, "sisssisss");
if (is_array($res) && array_key_exists("error", $res)) die(print_r($res));

$listIDquery = $mysqli -> query("SELECT LAST_INSERT_ID() as id");
$rows = $listIDquery -> fetch_all(MYSQLI_ASSOC);
foreach ($rows as $row) {
  $listID = join("",$row);
}

// Adds levels to database
if (!$DATA["private"]) {
  addLevelsToDatabase($mysqli, $DATA["levels"], $listID, $user_id, true);
}

$mysqli -> close();


echo json_encode([str_replace(' ', '-', $fuckupData[0]) . '-' . $listID]);

?>
