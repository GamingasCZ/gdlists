<?php
require("globals.php"); // checkAccount, getRatings, doRequest
header('Content-type: application/json'); // Return as JSON
/*
Return codes:
0 - Error connecting to database
1 - Incorrect parameters
2 - Not logged in
*/

$mysqli = new mysqli($hostname, $username, $password, $database);
if ($mysqli -> connect_errno) die("0");

$method = $_SERVER["REQUEST_METHOD"];
switch ($method) {
    case 'GET': // Fetches ratings
        // Use user's id if no error occured, else is false
        $user = getLocalUserID();

        $type = isset($_GET["list_id"]) ? "list_id" : "review_id";
        echo json_encode(getRatings($mysqli, $user, $type, $_GET[$type]));
        break;
        
    case 'POST': // No rate => rate
        $accountCheck = checkAccount()["id"];
        if (!$accountCheck) die("3");

        $DATA = json_decode(file_get_contents("php://input"), true);
        $type = isset($DATA["list_id"]) ? "list_id" : "review_id";
        $objectID = intval($DATA[$type]);
        $rating = $DATA["action"] == 1 ? 1 : 0;

        $result = ["result" => null, "ratings" => null];
        if ($type == "list_id") {
            $hidCheck = doRequest($mysqli, "SELECT `id` FROM lists WHERE `hidden`=?", [$DATA["hidden"]], "s");

            if (is_null($hidCheck)) {
                $result["result"] = "error";
                $result["ratings"] = [0,0,-1];
                die(json_encode($result));
            }
        }

        $checkRate = doRequest($mysqli, sprintf("SELECT rate FROM ratings WHERE `uid`=? AND %s=?", $type), [$accountCheck, $objectID], "ii");
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
        $result["ratings"] = getRatings($mysqli, $accountCheck, $type, $objectID);
        echo json_encode($result);
        break;
    default:
        die(1);
}

?>
