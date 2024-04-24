<?php
require("globals.php");
header('Content-type: application/json'); // Return as JSON
/*
Return codes:
0 - Error connecting to database
1 - Incorrect parameters
2 - Not logged in
*/

$mysqli = new mysqli($hostname, $username, $password, $database);
if ($mysqli -> connect_errno) die("0");

function getRatings($userID, $list_id) {
    global $mysqli;
    // todo: may be optimized by doing just one request, counting client-side
    $likeQuery = doRequest($mysqli,"SELECT count(*) FROM ratings WHERE rate=1 AND list_id=?", [$list_id], "s");
    $dislikeQuery = doRequest($mysqli,"SELECT count(*) FROM ratings WHERE rate=0 AND list_id=?", [$list_id], "s");
    $hasRatedQuery;
    if ($userID) {
        $hasRatedQuery = doRequest($mysqli,"SELECT `rate` FROM ratings WHERE `uid`=? AND list_id=?", [$userID, $list_id], "ii");
        $hasRatedQuery = $hasRatedQuery === null ? -1 : $hasRatedQuery["rate"];
    }
    else $hasRatedQuery = -2;
    return array($likeQuery["count(*)"], $dislikeQuery["count(*)"], $hasRatedQuery);
}

$method = $_SERVER["REQUEST_METHOD"];
switch ($method) {
    case 'GET': // Fetches ratings
        $user = checkAccount();
        if ($user) $user = $user["id"]; // Use user's id if no error occured, else is false

        echo json_encode(getRatings($user, $_GET["id"]));
        break;
        
    case 'POST': // No rate => rate
        $accountCheck = checkAccount()["id"];
        if (!$accountCheck) die("3");

        $DATA = json_decode(file_get_contents("php://input"), true);
        $fuckupData = intval($DATA["id"]);
        $rating = $DATA["action"] == 1 ? 1 : 0;

        $checkRate = doRequest($mysqli, "SELECT rate FROM ratings WHERE `uid`=? AND `list_id`=?", [$accountCheck, $fuckupData], "ii");
        $result = ["result" => null, "ratings" => null];
        if (is_null($checkRate)) { // No rating
            $rowQuery = doRequest($mysqli,"INSERT INTO `ratings`(`rate`,`uid`,`list_id`) VALUES (?,?,?)", [$rating, $accountCheck, $fuckupData], "iss");
            if (is_array($rowQuery) && array_key_exists("error", $rowQuery)) $result["result"] = "error";
            else $result["result"] = "added";
        }
        elseif ($checkRate["rate"] != $rating) { // Change rating
            doRequest($mysqli, "UPDATE `ratings` SET `rate`=? WHERE `uid`=? AND `list_id`=?", [$rating, $accountCheck, $fuckupData], "iii");
            $result["result"] = "changed";
        }
        elseif ($checkRate["rate"] == $rating) { // Remove rating
            doRequest($mysqli, "DELETE FROM ratings WHERE `uid`=? AND `list_id`=?", [$accountCheck, $fuckupData], "ii");
            $result["result"] = "deleted";
        }
        $result["ratings"] = getRatings($accountCheck, $fuckupData);
        echo json_encode($result);
        break;
    default:
        die(1);
}

?>
