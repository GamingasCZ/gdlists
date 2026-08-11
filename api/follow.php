<?php
/*
Error codes

*/

header('Content-type: application/json'); // Return as JSON
require_once("globals.php");

function isFollowed($mysqli, $postID, $postType) {
    return true;
}

if (basename(__FILE__) == basename($_SERVER["SCRIPT_FILENAME"])) {
    $mysqli = new mysqli($hostname, $username, $password, $database);
    if ($mysqli -> connect_errno) die("0");
    
    $mysqli->query("SET SESSION sql_mode = 'NO_ENGINE_SUBSTITUTION'");
    $method = $_SERVER["REQUEST_METHOD"];
    switch ($method) {
        case 'GET':
            break;
            
        case 'POST':
            $DATA = json_decode(file_get_contents("php://input"), true);

            $user = checkAccount($mysqli);
            if (!$user) die("-2");

            if (!isset($DATA["postType"]) || !isset($DATA["postID"]))
                die("-3");

            $postID = intval($DATA["postID"]);
            $postType = intval(max(0, min(1, $DATA["postType"])));

            $res;
            if ($postType == 0)
                $res = doRequest($mysqli, "INSERT INTO `follows`(list_id, user) VALUES (?,?)", [$postID, $user["id"]], "ii");
            else
                $res = doRequest($mysqli, "INSERT INTO `follows`(review_id, user) VALUES (?,?)", [$postID, $user["id"]], "ii");
            if (array_key_exists("error", $res))
                die("-4");

            die("6");

            break;

        default:
            die("-1");
            break;
    }
}

?>