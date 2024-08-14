<?php
/*
Return codes:
0 - Every error
1 - Account already created
*/
header('Content-type: application/json'); // Return as JSON
require("globals.php");
require("images.php");

$https = isset($_SERVER["HTTPS"]) ? 'https://' : 'http://';
$local = strstr($_SERVER["HTTP_HOST"], "localhost") ? "localhost:5173" : $_SERVER["HTTP_HOST"];

// Error can happen when cancelling
if (isset($_GET["error"])) {
    header("Authentication: false");
    header("Location: " . $https . $local . '/gdlists/?loginerr');
    die(0);
}

$mysqli = new mysqli($hostname, $username, $password, $database);
if ($mysqli -> connect_errno) {
    header("Location: " . $https . $local . '/gdlists/?loginerr');
};

function allTokens($res) {
    return $res["access_token"];
}

// if ($_SERVER["REQUEST_METHOD"] == "DELETE") {
//     $user = checkAccount($mysqli);
//     if (!$user) die("0");

//     if ($_GET["all"]) {
//         $token = doRequest($mysqli, "SELECT `access_token` FROM `users` WHERE discord_id = ?", [$user["id"]], "s");
//         revokeToken($token["access_token"], $mysqli, $user["id"]);
//         die();
//     }

//     $acc = doRequest($mysqli, "DELETE FROM `sessions` WHERE session_index = ? AND user_id = ?", [intval($_GET["index"]), $user["id"]], "is");

//     if (!is_null($res) && array_key_exists("error", $res)) die("0");
//     else die("1");

// }

if (sizeof($_GET) > 0) {
    $state = $_COOKIE["state"];
    removeCookie("state");
    if ($state != $_GET["state"])
        die(header("Location: " . $https . $local . '/gdlists/?loginerr'));

    // if (array_keys($_GET)[0] == "sessions") { // Check login validity
    //     $acc = checkAccount($mysqli);
    //     $token = getAuthorization();
    //     if (!$acc) die();

    //     $req = doRequest($mysqli, "SELECT session_data, session_index, last_login FROM `sessions` WHERE user_id=?", [$acc["id"]], "s", true);
    //     for ($s=0; $s < sizeof($req); $s++) { 
    //         $req[$s]["session_data"] = json_decode($req[$s]["session_data"]);
    //     }
    //     $mysqli -> close();
    //     die(json_encode(["sessions" => $req, "currentSession" => $token[3]]));
    // }
    if (array_keys($_GET)[0] == "check") { // Check login validity
        $auth = getAuthorization();
        if (!$auth) die(json_encode(["status" => "logged_out"])); // Not logged in

        $accCheck = checkAccount($mysqli);
        if (!$accCheck) die();

        // doRequest($mysqli, "UPDATE `sessions` SET `last_login`=? WHERE `user_id`=? AND `session_index`=?", [time(), $accCheck["id"], $auth[3]], "isi");
        $profileData = ["status" => "logged_in", "account_name" => $accCheck["username"], "account_id" => $accCheck["id"] ,"pfp_hash" => $accCheck["avatar"]];
        $mysqli -> close();
        die($accCheck ? json_encode($profileData) : 0);
    }

    if (!isset($_GET["code"])) die("0");

    // Get the access token from the authorization code
    $tokenUrl =  array(
        "client_id" => $DISCORD_CLIENT_ID,
        "client_secret" => $DISCORD_CLIENT_SECRET,
        "grant_type" => "authorization_code",
        "code" => $_GET["code"],
    );
    $tokenHeaders = array('Content-Type: application/x-www-form-urlencoded');
    $baseURL = "https://discord.com/api/v10/oauth2/token";
    $accessInfo = json_decode(post($baseURL, $tokenUrl, $tokenHeaders, 1), true);
    if (array_key_exists("error", $accessInfo)) {
        header("Location: " . $https . $local . '/gdlists/?loginerr');
    };

    // Get user data
    $tokenHeaders = array('Authorization: Bearer ' . $accessInfo["access_token"]);
    $baseURL = "https://discord.com/api/v10/users/@me";
    $dcApiResponse = json_decode(post($baseURL, array(), $tokenHeaders), true);

    // Database does not allow duplicate values (already registered), do not die in that case, else ye, commit die :D
    $fistTimeUser = true;
    $res = doRequest($mysqli, "INSERT INTO `users`(`username`, `avatar_hash`, `discord_id`, `refresh_token`, `access_token`) VALUES (?,?,?,?,?)", [$dcApiResponse["username"], $dcApiResponse["avatar"], $dcApiResponse["id"], $accessInfo["refresh_token"], $accessInfo["access_token"]], "sssss");
    if (!is_null($res) && array_key_exists("error", $res)) {
        doRequest($mysqli, "UPDATE `users` SET `username`=?, `avatar_hash`=?, `refresh_token`=?, `access_token`=? WHERE `discord_id`=?", [$dcApiResponse["username"], $dcApiResponse["avatar"], $accessInfo["refresh_token"], $accessInfo["access_token"], $dcApiResponse["id"]], "sssss");
        $fistTimeUser = false;
    }
    
    // $sessionData = [
    //     "dev" => -1,
    //     "browser" => -1,
    //     "mobile" => "Unknown"
    // ];
    
    // $userAgent = $_SERVER['HTTP_USER_AGENT'];
    // if (isset($userAgent)) {
    //     $sessionData["mobile"] = (bool)strstr($userAgent, "Android") || strstr($userAgent, "iPhone");
    //     $matches = [];
    //     if ($sessionData["mobile"])
    //         $sessionData["dev"] = strstr($userAgent, "Android") ? "Android" : "iPhone";
    //     else {
    //         preg_match("/(Linux|Windows|Mac OS)/", $userAgent, $matches);
    //         if (sizeof($matches) > 0) $sessionData["dev"] = $matches[0];
    //     }
    //     preg_match("/(Chrome|Firefox|Brave|Vivaldi)/", $userAgent, $matches);
    //     if (sizeof($matches) > 0) $sessionData["browser"] = $matches[0];
    // }

    // $sesionIndex = doRequest($mysqli, "SELECT COUNT(user_id) as sessionCount FROM `sessions`", [], "");
    // doRequest($mysqli, "INSERT INTO `sessions`(`user_id`, `session_data`, `session_index`, `last_login`) VALUES (?,?,?,?)", [$dcApiResponse["id"], json_encode($sessionData),$sesionIndex["sessionCount"], time()], "ssii");

    $userInfo = json_encode(array($dcApiResponse["username"], $dcApiResponse["id"], $dcApiResponse["avatar"], $fistTimeUser));
    setcookie("logindata", $userInfo, time()+30, "/");

    // Encrypt and save access token into a cookie
    saveAccessToken($accessInfo, $dcApiResponse["id"]);

    // Save profile pic
    $pfp = file_get_contents(sprintf("https://cdn.discordapp.com/avatars/%s/%s.webp?size=128", $dcApiResponse["id"], $dcApiResponse["avatar"]));
    if ($pfp !== false)
        saveImage($pfp, $dcApiResponse["id"], $mysqli, "pfp", false, false, true, true);

    $mysqli -> close();

    header("Location: " . $https . $local . '/gdlists');
}
else {
    http_response_code(401);
    header("Location: " . $https . $local . '/gdlists');
    die("1");
}
?>
