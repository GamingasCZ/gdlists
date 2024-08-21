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
8 - Upload error
*/

/* POST params
  postData: JSON.stringify(levelList,
  postName: string
  hidden: 0 | 1
  postType: 'list' | 'review'
*/

require("globals.php");
require("contentValidator.php");
header('Content-type: application/json'); // Return as JSON

// Check User


// Connect to database
$mysqli = new mysqli($hostname, $username, $password, $database);
$mysqli->set_charset("utf8mb4");
if ($mysqli -> connect_errno) {
  die(json_encode([-1, 0]));
}

$user = checkAccount($mysqli);
if (!$user) die(json_encode([-1, 7]));
$user_id = $user["id"];

$post = json_decode(file_get_contents("php://input"), true);
$DATA = $post["postData"];

// Check list
$postExtras;
switch ($post["postType"]) {
  case 'list':
    $postExtras = checkList($post["postName"], $DATA);
    break;
  case 'review':
    $postExtras = checkReview($post["postName"], $DATA);
    break;
}

if (is_string($postExtras)) die(json_encode([-1, $postExtras]));


// Post settings
$diffGuess = $DATA["diffGuesser"] == 1 ? 1 : 0;
$disableComments = $DATA["disComments"] == 1 ? 1 : 0;

// Checking request
$timestamp = time();

// Generate id if list private
$hidden = $post["hidden"] ? privateIDGenerator($post["postName"], $user_id, $timestamp) : "0";
$compressedData = base64_encode(gzcompress(json_encode($DATA)));

// Send to database

$template; $values; $types;
switch ($post["postType"]) {
  case 'list':
    $template = "INSERT INTO `lists`(`name`,`creator`, `data`,`timestamp`,`hidden`,`uid`,`diffGuesser`,`commDisabled`) VALUES (?,'',?,?,?,?,?,?)";
    $values = array($post["postName"], $compressedData, $timestamp, $hidden, $user_id, $diffGuess, $disableComments);
    $types = "ssssssi";
    break;
  case 'review':
    $template = "INSERT INTO `reviews`(`name`,`uid`,`data`,`tagline`,`hidden`,`commDisabled`,`thumbnail`, `thumbProps`, `lang`) VALUES (?,?,?,?,?,?,?,?,?)";
    $values = array($postExtras["name"], $user_id, $compressedData, $DATA["tagline"], $hidden, $disableComments, $postExtras["thumb"], $postExtras["thumbProps"], $DATA["language"]);
    $types = "sisssisss";
    break;
  
  default:
    die(json_encode([-1, 6]));
    break;
}
$res = doRequest($mysqli, $template, $values, $types);
if (array_key_exists("error", $res))
  die(json_encode([-1, 8]));

$listID = $post["hidden"] ? ["id" => $hidden] : doRequest($mysqli, "SELECT LAST_INSERT_ID() as id", [], "");

// Adds levels to database
if (!$post["hidden"]) {
  addLevelsToDatabase($mysqli, $DATA["levels"], $listID["id"], $user_id, $post["postType"] == 'review');
}

// Send back post ID
switch ($post["postType"]) {
  case 'list':
    echo json_encode([$listID["id"]]);
    break;
  case 'review':
    echo json_encode([$listID["id"]]);
    break;
}

$mysqli -> close();
?>
