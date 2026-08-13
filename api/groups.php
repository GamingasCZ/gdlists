<?php
/*
Error codes


*/

header('Content-type: application/json'); // Return as JSON
require_once("globals.php");

// returns groupID
function create_group($mysqli, $groupName) {
    $alreadyExists = group_exists($groupName);
    if ($alreadyExists === -1) {
        $res = doRequest($mysqli, "INSERT INTO `groups`(`name`) VALUES (?)", [$groupName], "s");
        if (array_key_exists("error", $res))
            return false;
        $getID = doRequest($mysqli, "SELECT LAST_INSERT_ID() as 'id'", [], '');
        return $getID["id"];
    }
    else
        return $alreadyExists;
}

// returns -1, if group doesn't exist, else the actual ID
function group_exists($mysqli, $groupName = false, $groupID = false) {
    if ($groupName === false && $groupID === false)
        throw new Exception("Checking existence of an unset group :(", 1);
        
    if ($groupName === false) {
        $res = doRequest($mysqli, "SELECT `id` FROM `groups` WHERE `id`=?", [$groupID], "i");
        if (!is_null($res) && !array_key_exists("error", $res))
            return $res["id"];
        else
            return -1;
    }
    else {
        $res = doRequest($mysqli, "SELECT `id` FROM `groups` WHERE `name`=?", [$groupName], "s");
        if (is_null($res) || array_key_exists("error", $res))
            return -1;
        return $res["id"];
    }

}

function add_to_group($mysqli, $user, $groupName, $authority = 0) {
    $gid = create_group($mysqli, $groupName);
    if ($gid === false) { // fail group creation
        return false;
    }

    $hash = hash("xxh32", $user.$groupName);
    $res = doRequest($mysqli, "INSERT INTO `group_members`(`user`, `group_id`, `authority`, `hash`)
    VALUES (?,?,?,?)", [$user, $gid, $authority, $hash], "siis");

    // maybe unlike previous checks, it's possible to have an error here
    if (array_key_exists("error", $res)) {
        return false;
    }
    $getID = doRequest($mysqli, "SELECT LAST_INSERT_ID() as 'id'", [], "");
    return $getID;
}

// if (basename(__FILE__) == basename($_SERVER["SCRIPT_FILENAME"])) {
//     $mysqli = new mysqli($hostname, $username, $password, $database);
//     if ($mysqli -> connect_errno) die("0");
    
//     $mysqli->query("SET SESSION sql_mode = 'NO_ENGINE_SUBSTITUTION'");
//     $method = $_SERVER["REQUEST_METHOD"];
//     switch ($method) {
//         case 'GET':
//             break;
            
//         case 'POST':
//             $DATA = json_decode(file_get_contents("php://input"), true);
//             break;

//         default:
//             die("-1");
//             break;
//     }
// }

?>