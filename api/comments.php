<?php

require_once("globals.php");
require_once("notifications.php");
header('Content-type: application/json'); // Return as JSON

/* Return codes:
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
function sendComment($mysqli, $text, $userID, $postID, $postType, $color, $hidden) {
    $column = $postType ? "reviews" : "lists";
    $type = $postType ? "reviewID" : "listID";
    $time = new DateTime();

    // Checking comment and user string length
    if (strlen($text) > 300 || strlen($text) < 10) return ["error" => "2"];

    // Is color valid?
    if (preg_match("/^#[a-f0-9]{6}$/i", $color) == 0) return ["error" => "4"];

    $hiddenCheck = "`id`=? AND `hidden`=0";
    if ($hidden)
        $hiddenCheck = "`hidden`=?";

    // Disabled comments
    $list = doRequest($mysqli, sprintf(
        "SELECT `commDisabled`,`uid`,`id`
        FROM `%s`
        WHERE %s", $column, $hiddenCheck), [$postID], "s");
    if (is_null($list)) return ["error" => 3];
    if ($list["commDisabled"] == 1) return ["error" => "8"];

    $postID = $list["id"];

    $template = sprintf(
        "INSERT INTO `comments` (`username`,`comment`,`comType`,`bgcolor`,`%s`,`verified`,`timestamp`,`uid`)
        VALUES ('',?, '0', ?, ?, '1', ?, ?)", $type);

    $values = array($text, $color, $postID, $time->getTimestamp(), $userID);
    $result = doRequest($mysqli, $template, $values, "sssss");
    if (is_array($result) && array_key_exists("error", $result)) return ["error" => "2"];

    $id = doRequest($mysqli, "SELECT LAST_INSERT_ID() as 'id'", [], "");

    if ($list["uid"])
        createNotification($mysqli, $userID, $list["uid"], 1, $postType+1, $postID, $id["id"]);
    return ["id" => $id["id"]];
}

/* Return codes:
    0 - Connection failure
    1 - Empty/bad request
    3 - Bad list ID
*/
function getComments($mysqli, $postID, $postType, $isHidden, $page = 0, $startID = 999999, $highlightID = -1, $fetchAmount = 15) {
    $column = $postType ? "reviews" : "lists";
    $type = $postType ? "reviewID" : "listID";

    $hiddenCheck = "$column.`hidden`='0' AND `comID`<=? AND $type=?";
    if ($isHidden)
        $hiddenCheck = "`comID`<=? AND $column.`hidden`=?";

    $highlight = null;
    if ($highlightID != -1) {
        $h = doRequest($mysqli,
            "SELECT *,1 as 'isHighlight' FROM `comments`
             WHERE $type=? AND `comID`=?
            ", [$postID, $highlightID], "ii");
        if (!is_null($h) && !array_key_exists("error", $h))
            $highlight = $h;
    }

    // How many comments should be fetched and the offset (page)
    $limit = clamp(intval($fetchAmount), 2, 15);
    $dbSlice = $limit * intval($page);
    $template = 
        "SELECT username,comment,comType,bgcolor,listID,reviewID,comID,verified,comments.`timestamp`,comments.`uid` FROM `comments`
        LEFT JOIN $column on $column.`id`=comments.$type
        WHERE $hiddenCheck
        ORDER BY `comID` DESC
        LIMIT ?
        OFFSET ?";

    $hiddenCheck = "`id`=? AND `hidden`='0'";
    if ($isHidden)
        $hiddenCheck = "`hidden`=?";

    $commAmount = doRequest($mysqli,
        "SELECT isnull(`id`) as 'id', COUNT(`comment`) as commAmount
         FROM $column
         LEFT JOIN comments ON $column.`id`=comments.`$type`
         WHERE $hiddenCheck", [$postID], "s");

    // id is null, if post doesn't exist
    if (is_null($commAmount["id"]))
        die("3");

    $commAmount = intval($commAmount["commAmount"]);

    // No comments
    if ($commAmount == 0)
        return json_encode(array([],[],["page" => 0, "maxPage" => 0, "startID" => 999999, "commAmount" => 0]));

    $maxpage = ceil($commAmount / $limit);
    $comments = doRequest($mysqli, $template, [$startID, $postID, $limit, $dbSlice], "iiii", true);
    if (!is_null($highlight))
        $comments = array_merge([$highlight], $comments);

    $dbInfo["maxPage"] = $maxpage;
    $dbInfo["startID"] = sizeof($comments) ? $comments[0]["comID"] : null;
    $dbInfo["page"] = $page;
    $dbInfo["commAmount"] = $commAmount;

    $ind = 0;
    $uid_array = [];
    foreach ($comments as $row) {
        if ($row["uid"]) array_push($uid_array, $row["uid"]);
        
        $comments[$ind]["comment"] = htmlspecialchars_decode($row["comment"]);
        $ind += 1;
    }

    $users = [];
    if (sizeof($uid_array)) {
        $uniqueUsers = array_unique($uid_array);
        $in = makeIN($uniqueUsers);
        $template = sprintf("SELECT DISTINCT username,discord_id,pfp_cutout
                        FROM users
                        LEFT JOIN profiles ON users.discord_id = profiles.uid
                        WHERE discord_id IN %s
                        ", $in[0]);

        $users = doRequest($mysqli, $template, $uniqueUsers, $in[1], true);
    }

    return json_encode(array($comments, $users, $dbInfo));
}

if (basename(__FILE__) == basename($_SERVER["SCRIPT_FILENAME"])) {
    $mysqli = new mysqli($hostname, $username, $password, $database);
    if ($mysqli -> connect_errno) die("0");
    $mysqli->set_charset("utf8mb4");
    
    $mysqli->query("SET SESSION sql_mode = 'NO_ENGINE_SUBSTITUTION'");
    $method = $_SERVER["REQUEST_METHOD"];
    switch ($method) {
        case 'GET':

            $fupD = sanitizeInput([
                $_GET["postID"],
                $_GET["postType"],
                isset($_GET["isHidden"]),
                $_GET["page"],
                $_GET["startID"],
                isset($_GET["highlight"]) ? $_GET["highlight"] : -1,
                $_GET["fetchAmount"]
            ]);

            $comments = getComments($mysqli, $fupD[0], intval($fupD[1]), $fupD[2], $fupD[3], $fupD[4], $fupD[5], $fupD[6]);
            echo $comments;
            break;

            
        case 'POST':
            $DATA = json_decode(file_get_contents("php://input"), true);

            $fuckupData = sanitizeInput([
                $DATA["comment"],
                $DATA["comColor"],
            ]);

            // Check login
            $discord = checkAccount($mysqli);
            if (!$discord) die("7");

            $comment = sendComment($mysqli, $fuckupData[0], $discord["id"], $DATA["postID"], intval($DATA["postType"]), $fuckupData[1], isset($DATA["isHidden"]));
            if (!array_key_exists("error", $comment))
                echo getComments($mysqli, $DATA["postID"], $DATA["postType"], isset($DATA["isHidden"]));
            else
                echo $comment["error"];

            break;
    }

    $mysqli->close();
}

?>
