<?php
/*
Return codes:
0 - Connection error
1 - Empty request
2 - Invalid comment or user length
3 - Invalid list ID
4 - Invalid comment color
5 - Invalid comment type
6 - Comment sent!!
7 - Not logged in!!
8 - Comments disabled
*/

require("globals.php");
header('Content-type: application/json'); // Return as JSON

$DATA = json_decode(file_get_contents("php://input"), true);
$column = isset($DATA["listID"]) ? "lists" : "reviews";
$type = isset($DATA["listID"]) ? "listID" : "reviewID";

$fuckupData = sanitizeInput(array($DATA["comment"], $DATA["comType"], $DATA[$type], $DATA["comColor"], isset($DATA["hidden"]) ? $DATA["hidden"] : "0"));

// Checking comment and user string length
if (strlen($DATA["comment"]) > 300 || strlen($DATA["comment"]) < 10) die("2");

// Is ID valid?
if ($DATA["listID"] == "-1") die("3");

// Is color valid?
if (preg_match("/^#[a-f0-9]{6}$/i", $DATA["comColor"]) == 0) die("4");

// Check if comment type is valid - 0: comment 1: reply
// REPLIES WILL BE ADDED LATER
if (!in_array($DATA["comType"], ["0", "1"])) die("5");

$mysqli = new mysqli($hostname, $username, $password, $database);

if ($mysqli->connect_errno) die("0");

// TODO: check for cookie
$discord_id = checkAccount()["id"];
if (!$discord_id) die("7");

$uid_query = $mysqli -> query(sprintf("SELECT `id` FROM `users` WHERE `discord_id` = '%s'", $discord_id));
$user_id = $uid_query -> fetch_all(MYSQLI_ASSOC)[0]["id"];

$time = new DateTime();

// Disabled comments
$list = doRequest($mysqli, sprintf("SELECT `commDisabled` FROM `%s` WHERE `id` = ?", $column), [$fuckupData[2]], "i");
if ($list["commDisabled"] == 1) die("8");


if ($type == "listID") {
    $hidCheck = doRequest($mysqli, "SELECT `id` FROM lists WHERE `hidden`=? AND `id`=?", [$fuckupData[4], $fuckupData[2]], "si");
    if (is_null($hidCheck)) die("2");
}

$template = sprintf("INSERT INTO `comments` (`username`,`comment`,`comType`,`bgcolor`,`%s`,`verified`,`timestamp`,`uid`) VALUES ('',?, ?, ?, ?, ?, ?, ?)", $type);
$values = array($fuckupData[0], $fuckupData[1], $fuckupData[3], $fuckupData[2], "1", $time->getTimestamp(), $user_id);
$result = doRequest($mysqli, $template, $values, "sssssss");
if (is_array($result) && array_key_exists("error", $result)) die("2");

echo "6";
$mysqli->close();

?>
