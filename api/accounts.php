<?php
/*
Return codes:
0 - Every error
1 - Account already created
*/
header('Content-type: application/json'); // Return as JSON
require("globals.php");

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

if ($_SERVER["REQUEST_METHOD"] == "DELETE") {
    $acc = checkAccount();
    if (!$acc) die("0");

    $res = doRequest($mysqli, "DELETE FROM `sessions` WHERE session_index = ? AND user_id = ?", [intval($_GET["index"]), $acc["id"]], "is");
    if (array_key_exists("error", $res)) die("0");
    else die("1");

}

if (sizeof($_GET) == 1) {
    if (array_keys($_GET)[0] == "sessions") { // Check login validity
        $acc = checkAccount();
        $token = getAuthorization();
        if (!$acc) die();

        $req = doRequest($mysqli, "SELECT session_data, session_index, last_login FROM `sessions` WHERE user_id=?", [$acc["id"]], "s", true);
        for ($s=0; $s < sizeof($req); $s++) { 
            $req[$s]["session_data"] = json_decode($req[$s]["session_data"]);
        }
        $mysqli -> close();
        die(json_encode(["sessions" => $req, "currentSession" => $token[3]]));
    }
    if (array_keys($_GET)[0] == "check") { // Check login validity
        $auth = getAuthorization();
        if (!$auth) {echo json_encode(["status" => "logged_out"]); return false;} // Not logged in

        $accCheck = checkAccount();
        doRequest($mysqli, "UPDATE `sessions` SET `last_login`=? WHERE `user_id`=? AND `session_index`=?", [time(), $accCheck["id"], $auth[3]], "isi");
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

    // Save data to database
    $fistTimeUser = true;
    try {
        doRequest($mysqli, "INSERT INTO `users`(`username`, `avatar_hash`, `discord_id`) VALUES (?,?,?,?)", [$dcApiResponse["username"], $dcApiResponse["avatar"], $dcApiResponse["id"]], "ssss");
        // Database does not allow duplicate values (already registered), do not die in that case, else ye, commit die :D
        if (strpos(mysqli_error($mysqli), "Duplicate") !== false) {
            doRequest($mysqli, "UPDATE `users` SET `username`=?, `avatar_hash`=? WHERE `discord_id`=?", [$dcApiResponse["username"], $dcApiResponse["avatar"], $dcApiResponse["id"]], "ssss");
            $fistTimeUser = false;
        }
    } catch (mysqli_sql_exception $err) {
        if (str_contains($err, "Duplicate")) {
            doRequest($mysqli, "UPDATE `users` SET `username`=?, `avatar_hash`=? WHERE `discord_id`=?", [$dcApiResponse["username"], $dcApiResponse["avatar"], $dcApiResponse["id"]], "ssss");
            $fistTimeUser = false;
        }
    }

    $sessionData = [
        "dev" => -1,
        "browser" => -1,
        "mobile" => "Unknown"
    ];
    
    if (isset($_SERVER['HTTP_USER_AGENT'])) {
        $matches = [];
        preg_match("/(Linux|Windows|Mac OS|Android|iPhone)/", $_SERVER['HTTP_USER_AGENT'], $matches);
        if (sizeof($matches) > 0) $sessionData["dev"] = $matches[0];
        preg_match("/(Chrome|Firefox|Brave|Vivaldi)/", $_SERVER['HTTP_USER_AGENT'], $matches);
        if (sizeof($matches) > 0) $sessionData["browser"] = $matches[0];
        $sessionData["mobile"] = in_array($sessionData["dev"], ["Android", "iPhone"]);
    }

    $sesionIndex = doRequest($mysqli, "SELECT COUNT(user_id) as sessionCount FROM sessions", [], "");
    doRequest($mysqli, "INSERT INTO `sessions`(`user_id`, `refresh_token`, `session_data`, `session_index`, `last_login`) VALUES (?,?,?,?,?)", [$dcApiResponse["id"], $accessInfo["refresh_token"], json_encode($sessionData),$sesionIndex["sessionCount"], time()], "sssii");

    $userInfo = json_encode(array($dcApiResponse["username"], $dcApiResponse["id"], $dcApiResponse["avatar"], $fistTimeUser));
    setcookie("logindata", $userInfo, time()+30, "/");

    // Encrypt and save access token into a cookie
    saveAccessToken($accessInfo, $dcApiResponse["id"], $sesionIndex["sessionCount"]);

    $mysqli -> close();

    header("Location: " . $https . $local . '/gdlists');
}
else {
    http_response_code(401);
    header("Location: " . $https . $local . '/gdlists');
    die("1");
}
?>
