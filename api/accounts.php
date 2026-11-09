<?php
/*
Return codes:
0 - Every error
1 - Account already created
*/

enum Account: string {
    case Discord = 'discord';
    case Google = 'google';
}

$https = strstr($_SERVER["HTTP_HOST"], "localhost") ? 'http://' : 'https://';
$local = strstr($_SERVER["HTTP_HOST"], "localhost") ? "localhost:5173" : $_SERVER["HTTP_HOST"];

header('Content-type: application/json'); // Return as JSON
require("globals.php");
require("images.php");
require_once("username.php");
require_once("notifications.php");
require_once("groups.php");


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
    $acc = checkAccount($mysqli, false, true);
    if (!$acc) die();

    if ($DATA == -1) {
        if ($acc["origin"] == "discord")
            $pfp = file_get_contents(sprintf("https://cdn.discordapp.com/avatars/%s/%s.png?size=128", $acc["id"], $acc["avatar"]));
        else
            $pfp = file_get_contents($acc["picture"]);
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

    if (array_keys($_GET)[0] == "check") { // Check login validity
        $accCheck = checkAccount($mysqli);
        if (!$accCheck) die(json_encode(["status" => "logged_out"])); // Not logged in

        if (isset($_COOKIE["momentToken"]))
            removeCookie("momentToken");

        $accCheck = checkAccount($mysqli);
        if (!$accCheck) {
            removeCookie("access_token");
            die(json_encode(["status" => "logged_out"]));
        };

        $profile = doRequest($mysqli, "SELECT `username`, `origin`, `pfp_cutout`
                                       FROM `users` LEFT JOIN `profiles` ON `discord_id`=`uid`
                                       WHERE `discord_id`=?", [$accCheck["id"]], "s");
        $unread = getUnread($mysqli, $accCheck["id"]);
        $profileData = ["status" => "logged_in",
                        "account_name" => $profile["username"],
                        "account_id" => $accCheck["id"],
                        "cutout" => is_null($profile["pfp_cutout"]) ? 0 : $profile["pfp_cutout"],
                        "unread_notif" => $unread["amount_unread"],
                        "origin" => intval($profile["origin"] == "google")];
        
        if ($debugMode) $profileData["debug"] = true;

        $mysqli -> close();
        die($accCheck ? json_encode($profileData) : 0);
    }

    $state = $_COOKIE["state"];
    removeCookie("state");
    if ($state != $_GET["state"])
        die(header("Location: " . $https . $local . '/gdlists/?loginerr'));

    if (!isset($_GET["code"])) die("0");

    switch ($_GET["iss"]) {
        case 'https://accounts.google.com':
            $accountType  = Account::Google;
            $clientID     = $GOOGLE_CLIENT_ID;
            $clientSecret = $GOOGLE_CLIENT_SECRET;
            $baseURL      = "https://oauth2.googleapis.com/token";
            $userDataURL  = "https://www.googleapis.com/oauth2/v2/userinfo";
            break;
        default:
            $accountType  = Account::Discord;
            $clientID     = $DISCORD_CLIENT_ID;
            $clientSecret = $DISCORD_CLIENT_SECRET;
            $baseURL      = "https://discord.com/api/v10/oauth2/token";
            $userDataURL  = "https://discord.com/api/v10/users/@me";
            break;
    }

    // Get the access token from the authorization code
    $tokenUrl =  array(
        "client_id" => $clientID,
        "client_secret" => $clientSecret,
        "grant_type" => "authorization_code",
        "code" => $_GET["code"],
    );
    $tokenHeaders = array('Content-Type: application/x-www-form-urlencoded');
    $accessInfo = json_decode(post($baseURL, $tokenUrl, $tokenHeaders, 1), true);
    if (array_key_exists("error", $accessInfo)) {
        header("Location: " . $https . $local . '/gdlists/?loginerr');
    };

    // Get user data
    $tokenHeaders = array('Authorization: Bearer ' . $accessInfo["access_token"]);
    $dcApiResponse = json_decode(post($userDataURL, array(), $tokenHeaders), true);

    switch ($accountType) {
        case Account::Discord:
            $username = $dcApiResponse["username"];
            break;
        case Account::Google:
            $username = $dcApiResponse["name"];
            $dcApiResponse["id"] = "g" . $dcApiResponse["id"];
            break;
    }

    // Database does not allow duplicate values (already registered), do not die in that case, else ye, commit die :D
    $fistTimeUser = is_null(doRequest($mysqli, "SELECT `username` FROM `users` WHERE `discord_id`=?", [$dcApiResponse["id"]], "s"));

    // google doesn't return refresh token on subsequent auth, so ig we keep the old one??
    // first time users will HOPEFULLY always return a refresh token
    if (isset($accessInfo["refresh_token"])) {
        doRequest($mysqli, "INSERT INTO `users` (`username`,`origin`,`discord_id`,`refresh_token`,`access_token`)
                            VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY
                            UPDATE `refresh_token` = ?, `access_token` = ?",
                    [$username, $accountType->value, $dcApiResponse["id"], $accessInfo["refresh_token"], $accessInfo["access_token"],
                     $accessInfo["refresh_token"], $accessInfo["access_token"]], "sssssss");
    }
    else {
        // This insert is probably unnecessary, it shouldn't be possible
        // for an account to not be created at this point
        doRequest($mysqli, "INSERT INTO `users` (`username`,`origin`,`discord_id`,`access_token`,`refresh_token`)
                            VALUES (?, ?, ?, ?, '0') ON DUPLICATE KEY
                            UPDATE `access_token` = ?",
                    [$username, $accountType->value, $dcApiResponse["id"], $accessInfo["access_token"],
                     $accessInfo["access_token"]], "sssss");
    }

    $userInfo = json_encode(array($username, $dcApiResponse["id"], $fistTimeUser));
    setcookie("logindata", $userInfo, time()+30, "/");

    // Encrypt and save access token into a cookie
    saveAccessToken($accessInfo, $dcApiResponse["id"]);

    // Save profile pic
    if (!file_exists(getUserPath($dcApiResponse["id"]) . "/pfp.webp")) {
        if ($accountType == Account::Discord)
            $pfp = file_get_contents(sprintf("https://cdn.discordapp.com/avatars/%s/%s.png?size=128", $dcApiResponse["id"], $dcApiResponse["avatar"]));
        else
            $pfp = file_get_contents($dcApiResponse["picture"]);
        if ($pfp !== false)
            saveImage($pfp, $dcApiResponse["id"], $mysqli, "pfp", false, false, true);
    }

    // Save username add to notif group
    if ($fistTimeUser) {
        saveUsername($mysqli, $username, $dcApiResponse["id"], true);
        add_to_group($mysqli, $dcApiResponse["id"], group_single_user($dcApiResponse["id"])); // hopefully this doesn't return false :)
    }

    $mysqli -> close();
    header("Location: " . $https . $local . '/gdlists');
}
else {
    http_response_code(401);
    header("Location: " . $https . $local . '/gdlists');
    die("1");
}
?>
