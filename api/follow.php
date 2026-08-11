<?php
/*
Error codes
-4 = following error
-3 = invalid params
-2 = login error
0 = database error

5 = STOPPED following
6 = STARTED following

*/

header('Content-type: application/json'); // Return as JSON
require_once("globals.php");

function getID($x) {return array_key_first($x)[0]. strval(array_values($x)[0]); }

// postID can be an int, or an int array
function isFollowed($mysqli, $postID, $postType, $uid) {
    $res;

    $isPostList = is_array($postID);
    if ($isPostList) {
        $in = makeIN($postID);
        if ($postType == 0)
            $res = doRequest($mysqli, sprintf("SELECT `list_id` FROM `follows` WHERE `list_id` IN %s AND `user`=?", $in[0]), [...$postID, $uid], $in[1]."i", true);
        else
            $res = doRequest($mysqli, sprintf("SELECT `review_id` FROM `follows` WHERE `review_id` IN %s AND `user`=?", $in[0]), [...$postID, $uid], $in[1]."i", true);
    }
    else {
        if ($postType == 0)
            $res = doRequest($mysqli, "SELECT `id` FROM `follows` WHERE `list_id`=? AND `user`=?", [$postID, $uid], "ii");
        else
            $res = doRequest($mysqli, "SELECT `id` FROM `follows` WHERE `review_id`=? AND `user`=?", [$postID, $uid], "ii");
    }
    if (!is_null($res) && array_key_exists("error", $res))
        return false;

    if ($isPostList)
        return array_map("getID", $res);
    else
        return !is_null($res);
}

function hasFollowers($mysqli, $postID, $postType) {
    $res;
    if ($postType == 0)
        $res = doRequest($mysqli, "SELECT `id` FROM `follows` WHERE `list_id`=? LIMIT 1", [$postID], "i");
    else
        $res = doRequest($mysqli, "SELECT `id` FROM `follows` WHERE `review_id`=? LIMIT 1", [$postID], "i");
    
    return !is_null($res);
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

            // TODO: cannot follow own posts

            $res;
            $resp;
            if (isFollowed($mysqli, $postID, $postType, $user["id"])) {
                $resp = "5";
                if ($postType == 0)
                    $res = doRequest($mysqli, "DELETE FROM `follows` WHERE `list_id`=? AND `user`=?", [$postID, $user["id"]], "ii");
                else
                    $res = doRequest($mysqli, "DELETE FROM `follows` WHERE `review_id`=? AND `user`=?", [$postID, $user["id"]], "ii");
                }
            else {
                $resp = "6";
                if ($postType == 0)
                    $res = doRequest($mysqli, "INSERT INTO `follows`(list_id, user) VALUES (?,?)", [$postID, $user["id"]], "ii");
                else
                    $res = doRequest($mysqli, "INSERT INTO `follows`(review_id, user) VALUES (?,?)", [$postID, $user["id"]], "ii");
            }
            
            if (array_key_exists("error", $res))
                die("-4");

            die($resp);

            break;

        default:
            die("-1");
            break;
    }
}

?>