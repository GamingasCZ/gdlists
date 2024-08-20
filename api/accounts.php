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

if ($_SERVER["REQUEST_METHOD"] == "PUT") {
    $DATA = file_get_contents("php://input");
    $acc = checkAccount($mysqli);
    if (!$acc) die();

    if ($DATA == -1) {
        $pfp = file_get_contents(sprintf("https://cdn.discordapp.com/avatars/%s/%s.png?size=128", $acc["id"], $acc["avatar"]));
        if ($pfp !== false)
            saveImage($pfp, $acc["id"], $mysqli, "pfp", false, false, true);
    }
    else {
        saveImage($DATA, $acc["id"], $mysqli, "pfp", false, false, true);
    }
    die();
}

if ($_SERVER["REQUEST_METHOD"] == "PATCH") {
    $DATA = file_get_contents("php://input");
    $acc = checkAccount($mysqli);
    if (!$acc) die();

    $newCutout = max(0, min(intval($DATA), 10));
    doRequest($mysqli, "INSERT INTO `profiles`(`uid`, `pfp_cutout`) VALUES (?,?) ON DUPLICATE KEY UPDATE `pfp_cutout`=?", [$acc["id"], $newCutout, $newCutout], "sii");
    die();
}

if (sizeof($_GET) > 0) {
    $state = $_COOKIE["state"];
    removeCookie("state");
    if ($state != $_GET["state"])
        die(header("Location: " . $https . $local . '/gdlists/?loginerr'));

    if (array_keys($_GET)[0] == "check") { // Check login validity
        $auth = getAuthorization();
        if (!$auth) die(json_encode(["status" => "logged_out"])); // Not logged in

        $accCheck = checkAccount($mysqli);
        if (!$accCheck) die();

        $pfpCutout = doRequest($mysqli, "SELECT `pfp_cutout` FROM `profiles` WHERE `uid`=?", [$accCheck["id"]], "s");
        $profileData = ["status" => "logged_in",
                        "account_name" => $accCheck["username"],
                        "account_id" => $accCheck["id"],
                        "cutout" => is_null($pfpCutout) ? 0 : $pfpCutout["pfp_cutout"]];
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
    $res = doRequest($mysqli, "INSERT INTO `users`(`username`, `discord_id`, `refresh_token`, `access_token`) VALUES (?,?,?,?)", [$dcApiResponse["username"], $dcApiResponse["id"], $accessInfo["refresh_token"], $accessInfo["access_token"]], "ssss");
    if (!is_null($res) && array_key_exists("error", $res)) {
        $res = doRequest($mysqli, "UPDATE `users` SET `username`=?, `refresh_token`=?, `access_token`=? WHERE `discord_id`=?", [$dcApiResponse["username"], $accessInfo["refresh_token"], $accessInfo["access_token"], $dcApiResponse["id"]], "ssss");
        $fistTimeUser = false;
    }

    $userInfo = json_encode(array($dcApiResponse["username"], $dcApiResponse["id"], $fistTimeUser));
    setcookie("logindata", $userInfo, time()+30, "/");

    // Encrypt and save access token into a cookie
    saveAccessToken($accessInfo, $dcApiResponse["id"]);

    // Save profile pic
    $pfp = file_get_contents(sprintf("https://cdn.discordapp.com/avatars/%s/%s.png?size=128", $dcApiResponse["id"], $dcApiResponse["avatar"]));
    if ($pfp !== false)
        saveImage($pfp, $dcApiResponse["id"], $mysqli, "pfp", false, false, true);

    $mysqli -> close();

    header("Location: " . $https . $local . '/gdlists');
}
else {
    http_response_code(401);
    header("Location: " . $https . $local . '/gdlists');
    die("1");
}
?>
