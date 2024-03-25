<?php

$hostname = getenv("DB_HOSTNAME");
$username = getenv("DB_USERNAME");
$password = getenv("DB_PASSWORD");
$database = getenv("DB_NAME");
$debugMode = true;

$DISCORD_CLIENT_ID = getenv("DC_CLIENT_ID");
$DISCORD_CLIENT_SECRET = getenv("DC_CLIENT_SECRET");
$SECRET = getenv("SECRET"); // Use a random string :)

function privateIDGenerator($listName, $creator, $timestamp) {
    $str = $listName . $creator . $timestamp;
    return substr(sha1($str),0,10);
}

// Not secret :)
function sanitizeInput($inputArray)
{
    global $debugMode;
    error_reporting($debugMode ? -1 : 0);

    $i = 0;
    foreach ($inputArray as $post) {
        if ($inputArray[$i] == "") {
            echo "1";
            exit();
        }
        $inputArray[$i] = htmlspecialchars(strip_tags(htmlspecialchars_decode($post)));
        $i += 1;
    }

    error_reporting($debugMode ? -1 : 1);

    return $inputArray;
}

function doRequest($mysqli, $queryTemplate, $values, $valueTypes)
{
    $query = $mysqli->prepare($queryTemplate);

    // Fill in template
    $query->bind_param($valueTypes, ...$values);

    $query->execute();
    $result = $query->get_result();

    $query->close();

    if (!$result) {
        return -1;
    }

    return $result -> fetch_assoc();
}

// thanks, random stackoverflow person (https://stackoverflow.com/a/46872528/11000740) :)
function encrypt($plaintext) {
    global $SECRET;
    $method = "AES-256-CBC";
    $key = hash('sha256', $SECRET, true);
    $iv = openssl_random_pseudo_bytes(16);

    $ciphertext = openssl_encrypt($plaintext, $method, $key, OPENSSL_RAW_DATA, $iv);
    $hash = hash_hmac('sha256', $ciphertext . $iv, $key, true);

    return $iv . $hash . $ciphertext;
}

function decrypt($ivHashCiphertext) {
    global $SECRET;
    $method = "AES-256-CBC";
    $iv = substr($ivHashCiphertext, 0, 16);
    $hash = substr($ivHashCiphertext, 16, 32);
    $ciphertext = substr($ivHashCiphertext, 48);
    $key = hash('sha256', $SECRET, true);

    if (!hash_equals(hash_hmac('sha256', $ciphertext . $iv, $key, true), $hash)) return null;

    return openssl_decrypt($ciphertext, $method, $key, OPENSSL_RAW_DATA, $iv);
}

function post($url, $data, $headers, $needsRURL = false, $noEncodeKeys = []) {
    global $GDL_ENDPOINT;

    $curl = curl_init($url);
    foreach ($data as $key => $value) {
        $data[$key] = curl_unescape($curl, $value);
    }

    // This may cause problems. 
    $https = isset($_SERVER["HTTPS"]) ? 'https://' : 'http://';

    if ($needsRURL) { $data["redirect_uri"] = $https . $_SERVER["HTTP_HOST"] . $_SERVER["PHP_SELF"]; }

    curl_setopt($curl, CURLINFO_HEADER_OUT, true);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    if (sizeof($data) > 0 and !is_string($data)) {
        $data = http_build_query($data);
        curl_setopt($curl, CURLOPT_POST, true);
        curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
    }
    else {
        curl_setopt($curl, CURLOPT_CUSTOMREQUEST, 'GET');
    }

    // Set HTTP Header for POST request
    curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);

    // Submit the POST request
    $result = curl_exec($curl);

    curl_close($curl);
    return $result;
}

function refreshToken($currToken) {
    global $hostname, $username, $password, $database, $DISCORD_CLIENT_ID, $DISCORD_CLIENT_SECRET;
    $mysqli = new mysqli($hostname, $username, $password, $database);
    if ($mysqli -> connect_errno) die("0");
    error_log("refreshing token...");

    $refresh_token = doRequest($mysqli, "SELECT refresh_token FROM users WHERE discord_id=?", [$currToken[2]], "i")["refresh_token"];

    // Get the new token details
    $tokenUrl = array(
        "client_id" => $DISCORD_CLIENT_ID,
        "client_secret" => $DISCORD_CLIENT_SECRET,
        "grant_type" => "refresh_token",
        "refresh_token" => $refresh_token,
    );
    $tokenHeaders = array('Content-Type: application/x-www-form-urlencoded');
    $baseURL = "https://discord.com/api/v10/oauth2/token";
    $accessInfo = json_decode(post($baseURL, $tokenUrl, $tokenHeaders, 0), true);
    if (array_key_exists("error", $accessInfo)) {
        removeCookie("access_token");
        return false;
    }

    // Get user data
    $tokenHeaders = array('Authorization: Bearer ' . $accessInfo["access_token"]);
    $baseURL = "https://discord.com/api/v10/users/@me";
    $ok = json_decode(post($baseURL, array(), $tokenHeaders), true);

    // Encrypt and save access token into a cookie
    removeCookie("access_token");

    setcookie("access_token", base64_encode(encrypt(($accessInfo["access_token"])."|".(time()+$accessInfo["expires_in"])."|".($ok["id"]))), time()+2678400, "/");

    $mysqli -> query(sprintf('UPDATE `users` SET `username`="%s", `avatar_hash`="%s", `refresh_token`="%s" WHERE `discord_id`="%s"', $ok["username"], $ok["avatar"], $accessInfo["refresh_token"], $ok["id"]));
    $mysqli -> close();

    return [$accessInfo["access_token"], time()+$accessInfo["expires_in"], $ok["id"]];
}

function removeCookie($cookie) {
    setcookie($cookie, '', time()-3600, "/");
    unset($_COOKIE[$cookie]);
}

function getAuthorization() {
    // bro (oh, it's ok now :D)
    if (isset($_COOKIE["access_token"])) return $_COOKIE["access_token"];
    else return false;
}

function checkAccount($forceToken = false) {
    global $DO_REFRESH;
    if (!getAuthorization()) return false;

    $token;
    if (!$forceToken) $token = explode("|", decrypt(base64_decode(getAuthorization())));
    else $token = $forceToken;

    if ($token[1]-time() < 86400) {
        $refresh_token = refreshToken($token);
        if ($refresh_token === false) return false;

        $token[0] = $refresh_token[0];
    }

    $tokenHeaders = array('Authorization: Bearer ' . $token[0]);
    $baseURL = "https://discord.com/api/v10/users/@me";
    $ok = post($baseURL, array(), $tokenHeaders);
    $json = json_decode($ok, true);

    if ((isset($json["message"]) && strstr($json["message"], "401"))) { // Invalid token, logout
        $res = refreshToken($token);
        if ($res === false) return false;

        return checkAccount($res);
    }
    return $json;
}

function checkListOwnership($mysqli, $user_id) {
    $client_id = checkAccount()["id"];
    return $user_id == $client_id;
}

function list_id($row) {
    return $row["hidden"] == 0 ? $row["id"] : $row["hidden"];
}

function clamp($current, $min, $max) {
    return max($min, min($max, $current));
}

function addLevelsToDatabase($mysqli, $levels, $listID, $userID) {
    foreach ($levels as $l) {
        $hash = substr(md5(json_encode($l)), 0, 8);
        $isCollab = is_array($l["creator"]);
        $creator;
        if (!$isCollab) $creator = $l["creator"];
        else {
            if (isset($l["creator"][0][0]["name"]))
                $creator = $l["creator"][0][0]["name"];
            else
                $creator = $l["creator"][0][0];
        }

        try {
            doRequest($mysqli, "
    INSERT INTO `levels` (levelName, creator, collabMemberCount, levelID, difficulty, rating, color, video, platformer, uploaderID, listID, hash)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ",
        [
            $l["levelName"],
            $creator,
            $isCollab ? sizeof($l["creator"][2]) : 0,
            $l["levelID"],
            isset($l["difficulty"]) ? $l["difficulty"][0] : 0,
            isset($l["difficulty"]) ? $l["difficulty"][1] : 0,
            json_encode($l["color"]),
            $l["video"] ? $l["video"] : null,
            isset($l["platf"]) ? $l["platf"] : false,
            $userID,
            $listID,
            $hash
        ], "ssiiiissiiis");
        } catch (mysqli_sql_exception $err) {}
        }
    }

function isnum($x) {return is_numeric($x);}

function ass() {
    global $hostname, $username, $password, $database;
    $mysqli = new mysqli($hostname, $username, $password, $database);
    
    $result = $mysqli -> query("SELECT `data`,`id`,`uid` FROM lists");
    $res = $result -> fetch_all();
    for ($i=0; $i < sizeof($res); $i++) { 
        $lev = base64_decode($res[$i][0], true);
        if ($lev) {
          $lev = json_decode(htmlspecialchars_decode(gzuncompress($decoded)), true);
        } else {
          $lev = json_decode(htmlspecialchars_decode($res[$i][0]), true);
        }
        if ($lev == null) continue;
        $allLevels = [];
        if (isset($lev["levels"])) {
            $allLevels = $lev["levels"];
        } else {
            foreach (array_filter(array_keys($lev), "isnum") as $l) {
                array_push($allLevels, $lev[$l]);
            }
        }

        addLevelsToDatabase($mysqli, $allLevels, $res[$i][1], $res[$i][2]);
    }
}

?>
