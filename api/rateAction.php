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

function getRatings($userID, $type, $object_id) {
    global $mysqli;

    // todo: may be optimized by doing just one request, counting client-side
    $likeQuery = doRequest($mysqli, sprintf("SELECT count(id) as total, sum(rate) as likes FROM ratings WHERE %s=?", $type), [$object_id], "s");
    $hasRatedQuery;
    if ($userID) {
        $hasRatedQuery = doRequest($mysqli, sprintf("SELECT `rate` FROM ratings WHERE `uid`=? AND %s=?", $type), [$userID, $object_id], "ii");
        $hasRatedQuery = $hasRatedQuery === null ? -1 : $hasRatedQuery["rate"];
    }
    else $hasRatedQuery = -2;
    return array(intval($likeQuery["likes"]), $likeQuery["total"]-$likeQuery["likes"], $hasRatedQuery);
}

$method = $_SERVER["REQUEST_METHOD"];
switch ($method) {
    case 'GET': // Fetches ratings
        $user = checkAccount();
        if ($user) $user = $user["id"]; // Use user's id if no error occured, else is false

        $type = isset($_GET["list_id"]) ? "list_id" : "review_id";
        echo json_encode(getRatings($user, $type, $_GET[$type]));
        break;
        
    case 'POST': // No rate => rate
        $accountCheck = checkAccount()["id"];
        if (!$accountCheck) die("3");

        $DATA = json_decode(file_get_contents("php://input"), true);
        $type = isset($DATA["list_id"]) ? "list_id" : "review_id";
        $objectID = intval($DATA[$type]);
        $rating = $DATA["action"] == 1 ? 1 : 0;

        $checkRate = doRequest($mysqli, sprintf("SELECT rate FROM ratings WHERE `uid`=? AND %s=?", $type), [$accountCheck, $objectID], "ii");
        $result = ["result" => null, "ratings" => null];
        if (is_null($checkRate)) { // No rating
            $rowQuery = doRequest($mysqli,sprintf("INSERT INTO `ratings`(`rate`,`uid`,`%s`) VALUES (?,?,?)", $type), [$rating, $accountCheck, $objectID], "isi");
            if (is_array($rowQuery) && array_key_exists("error", $rowQuery)) $result["result"] = "error";
            else $result["result"] = "added";
        }
        elseif ($checkRate["rate"] != $rating) { // Change rating
            doRequest($mysqli, sprintf("UPDATE `ratings` SET `rate`=? WHERE `uid`=? AND %s=?", $type), [$rating, $accountCheck, $objectID], "iii");
            $result["result"] = "changed";
        }
        elseif ($checkRate["rate"] == $rating) { // Remove rating
            doRequest($mysqli, sprintf("DELETE FROM ratings WHERE `uid`=? AND %s=?", $type), [$accountCheck, $objectID], "ii");
            $result["result"] = "deleted";
        }
        $result["ratings"] = getRatings($accountCheck, $type, $objectID);
        echo json_encode($result);
        break;
    default:
        die(1);
}

?>
