<?php
/* Return codes:
0 - Connection failure
1 - Empty/bad request
3 - Bad list ID
*/

require("globals.php");
header('Content-type: application/json'); // Return as JSON

$type = isset($_GET["listID"]) ? "listID" : "reviewID";

$fuckupID;
if (!preg_match('/[A-z]/', $_GET[$type])) { // get post ID based on type
    $fuckupID = preg_match("/-?\d+/", $_GET[$type], $match);
    $fuckupID = $match[0];
}
else {
    if (is_int($_GET[$type])) $fuckupID = $_GET[$type];
}

// Fetching comments
$mysqli = new mysqli($hostname, $username, $password, $database);

if ($mysqli -> connect_errno) die("0");
$mysqli->set_charset("utf8mb4");

// Are values numbers?
if (!is_numeric($_GET["page"]) &&
    !is_numeric($_GET["startID"]) &&
    !is_numeric($_GET["fetchAmount"])) {
    die("1");
}

// How many comments should be fetched and the offset (page)
$dbSlice = clamp(intval($_GET["fetchAmount"]), 2, 15) * intval($_GET["page"]);

$query = sprintf("SELECT * FROM `comments`
            WHERE `comID`<=%d AND %s=%d
            ORDER BY `comID` DESC
            LIMIT %d 
            OFFSET %s", $_GET["startID"], $type, $fuckupID, clamp(intval($_GET["fetchAmount"]), 2, 15), $dbSlice);

$commAmount = intval(doRequest($mysqli, sprintf("SELECT COUNT(*) as commAmount from `comments` WHERE %s=?", $type), [$fuckupID], "i")["commAmount"]);
$maxpage = ceil($commAmount / clamp(intval($_GET["fetchAmount"]), 2, 15));

$result = $mysqli->query($query) or die($mysqli -> error);
$comments = $result -> fetch_all(MYSQLI_ASSOC);

$dbInfo["maxPage"] = $maxpage;
$dbInfo["startID"] = sizeof($comments) ? $comments[0]["comID"] : null;
$dbInfo["page"] = $_GET["page"];
$dbInfo["path"] = $_SERVER["SCRIPT_NAME"];
$dbInfo["commAmount"] = $commAmount;

// No comments
if (count($comments) == 0) {
    exit(json_encode(array([],[],$dbInfo)));
}

$uid_array = array();
$ind = 0;
foreach ($comments as $row) {
    array_push($uid_array, $comments[$ind]["uid"]);
    
    $comments[$ind]["comment"] = htmlspecialchars_decode($row["comment"]);
    $ind += 1;
}

$query = sprintf("SELECT DISTINCT username,discord_id
                  FROM users
                  WHERE discord_id IN (%s)", join(",", array_unique($uid_array)), $_GET[$type]);
$result = $mysqli -> query($query) or die($mysqli -> error);

$users = $result -> fetch_all(MYSQLI_ASSOC);

echo json_encode(array($comments, $users, $dbInfo));
$mysqli -> close();

?>
