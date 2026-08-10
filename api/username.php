<?php
/*
Error codes
-1 = bad request
-4 = name creation error
-2 = account error
-9 = username taken
0 = database error

6 = success
*/

header('Content-type: application/json'); // Return as JSON
require_once("globals.php");

const MAX_USERNAME_LENGTH = 20;
const MIN_USERNAME_LENGTH = 3;
const CHANGE_INTERVAL_DAYS = 30;

// no check is used on first login, the checks could interfere with discord's checks
function saveUsername($mysqli, $username, $currentUID, $noCheck = false) {
    if (!$noCheck) {
        if (strlen($username) > MAX_USERNAME_LENGTH || strlen($username) < MIN_USERNAME_LENGTH) return -1;
    
        $allowedExtraChars = ['-', '_'];
        if (!ctype_alnum(str_replace($allowedExtraChars, '', $username))) return false;
    }

    // check change availability
    $lastChange = getLastChangeStamp($mysqli, $currentUID);
    if ($lastChange !== false && $lastChange >= 0) {
        if (getDaysTillChangeAvailable($lastChange) > 0) return false;
    }
    
    // check name collisions
    if (!$noCheck) {
        $res = doRequest($mysqli, "SELECT `username` FROM `username_change`
        WHERE NOT `uid`=? AND `username`=?",
        [$currentUID, $username], "is");
        if ($res["username"])
            return -2;
    }

    // remove possible duplicates; looks dangerous, but we hopefully sanitized everything
    doRequest($mysqli, "DELETE FROM `username_change` WHERE `username`=? AND `uid`=?", [$username, $currentUID], "si");

    $req;
    if ($noCheck) {
        $req = doRequest($mysqli,
        "INSERT INTO `username_change`(`username`, `uid`, `timestamp`) VALUES (?, ?, 0)",
        [$username, $currentUID], "ss");
    }
    else {
        $req = doRequest($mysqli,
        "INSERT INTO `username_change`(`username`, `uid`) VALUES (?, ?)",
        [$username, $currentUID], "ss");
    }
    if (array_key_exists("error", $req)) return -3;
    
    // we just kinda registering the current username if noCheck is true
    if (!$noCheck) {
        $req = doRequest($mysqli, "UPDATE `users` SET `username`=? WHERE `discord_id`=?", [$username, $currentUID], "si");
        if (array_key_exists("error", $req)) return -4;
    }

    return $username;
}

/**
 * @returns false or unix timestamp
 */
function getLastChangeStamp($mysqli, $uid) {
    $lastChange = doRequest($mysqli, "SELECT max(`timestamp`) as 'time' FROM `username_change` WHERE `uid`=?", [$uid], "i");
    // 'time' should be null on first time changing name, or maybe no??, likely no; theoretically it can, we should handle the edgecase in which it is null
    return strtotime($lastChange["time"]);
}

function getDaysTillChangeAvailable($timestamp) {
    $currentTime = time();
    // FIXME?: time zones will likely offset this by a couple hours
    return max(0, CHANGE_INTERVAL_DAYS - ceil(max(0, $currentTime - $timestamp) / (60*60*24)));
}

function getChangeData($mysqli, $currentUID) {
    $data = [
        "available_in" => 0,
        "max_len" => MAX_USERNAME_LENGTH,
        "min_len" => MIN_USERNAME_LENGTH,
        "interval" => CHANGE_INTERVAL_DAYS,
        "last_names" => []
    ];

    $timeTimestamp = getLastChangeStamp($mysqli, $currentUID);
    
    if ($timeTimestamp === false || $timeTimestamp < 0) $data["available_in"] = 0;
    else {
        $data["available_in"] = getDaysTillChangeAvailable($timeTimestamp);

        $lastNames = doRequest($mysqli, "SELECT username FROM `username_change` WHERE `uid`=? LIMIT 5", [$currentUID], "i", true);
        $data["last_names"] = $lastNames;
    }
    return $data;
}

if (basename(__FILE__) == basename($_SERVER["SCRIPT_FILENAME"])) {
    $mysqli = new mysqli($hostname, $username, $password, $database);
    if ($mysqli -> connect_errno) die("0");
    
    
    $mysqli->query("SET SESSION sql_mode = 'NO_ENGINE_SUBSTITUTION'");
    $method = $_SERVER["REQUEST_METHOD"];
    switch ($method) {
        case 'GET':
            $user = checkAccount($mysqli);
            if (!$user) die("-2");
            echo json_encode(getChangeData($mysqli, $user["id"]));
            break;
            
        case 'POST':
            $DATA = json_decode(file_get_contents("php://input"), true);
            
            $res;
            if (isset($DATA["discord"])) {
                $user = checkAccount($mysqli, skipMomentToken: true);
                if (!$user) die("-2");

                $res = saveUsername($mysqli, $user["username"], $user["id"]);
            }
            else {
                $user = checkAccount($mysqli);
                if (!$user) die("-2");

                $res = saveUsername($mysqli, $DATA["newUsername"], $user["id"]);
            }
            if ($res === -2) echo "-9";
            else if ($res > 0) echo "6". $res;
            else echo $res;
            break;

        default:
            die("-1");
            break;
    }
}

?>