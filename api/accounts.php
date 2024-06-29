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

if (sizeof($_GET) == 1) {
    if (array_keys($_GET)[0] == "check") { // Check login validity
        if (!getAuthorization()) {echo json_encode(["status" => "logged_out"]); return false;} // Not logged in

        $accCheck = checkAccount();
        $profileData = ["status" => "logged_in", "account_name" => $accCheck["username"], "account_id" => $accCheck["id"] ,"pfp_hash" => $accCheck["avatar"]];
        echo $accCheck ? json_encode($profileData) : 0;
        return true;
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
    if (array_key_exists("error", $accessInfo)) die(0);

    // Get user data
    $tokenHeaders = array('Authorization: Bearer ' . $accessInfo["access_token"]);
    $baseURL = "https://discord.com/api/v10/users/@me";
    $ok = json_decode(post($baseURL, array(), $tokenHeaders), true);

    // Encrypt and save access token into a cookie
    setcookie("access_token", base64_encode(encrypt(($accessInfo["access_token"])."|".(time()+$accessInfo["expires_in"])."|".($ok["id"]))), time()+2678400, "/");

    // Save data to database
    $mysqli = new mysqli($hostname, $username, $password, $database);
    if ($mysqli -> connect_errno) die("0");

    $fistTimeUser = true;
    try {
        $mysqli -> query(sprintf("INSERT INTO `users`(`username`, `avatar_hash`, `discord_id`, `refresh_token`) VALUES ('%s','%s','%s','%s')", $ok["username"], $ok["avatar"], $ok["id"], $accessInfo["refresh_token"]));
        // Database does not allow duplicate values (already registered), do not die in that case, else ye, commit die :D
        if (strpos(mysqli_error($mysqli), "Duplicate") !== false) {
            $mysqli -> query(sprintf("UPDATE `users` SET `username`='%s', `avatar_hash`='%s', `refresh_token`='%s' WHERE `discord_id`='%s'", $ok["username"], $ok["avatar"], $accessInfo["refresh_token"], $ok["id"]));
            $fistTimeUser = false;
        }
    } catch (mysqli_sql_exception $err) {
        if (str_contains($err, "Duplicate")) {
            $mysqli -> query(sprintf("UPDATE `users` SET `username`='%s', `avatar_hash`='%s', `refresh_token`='%s' WHERE `discord_id`='%s'", $ok["username"], $ok["avatar"], $accessInfo["refresh_token"], $ok["id"]));
            $fistTimeUser = false;
        }
    }

    $userInfo = json_encode(array($ok["username"], $ok["id"], $ok["avatar"], $fistTimeUser));
    setcookie("logindata", $userInfo, time()+30, "/");

    $mysqli -> close();

    header("Location: " . $https . $local . '/gdlists');
}
else {
    http_response_code(401);
    die("1");
}
?>
