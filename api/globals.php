<?php

$hostname = getenv("DB_HOSTNAME");
$username = getenv("DB_USERNAME");
$password = getenv("DB_PASSWORD");
$database = getenv("DB_NAME");
$debugMode = false;

$DISCORD_CLIENT_ID = getenv("DC_CLIENT_ID");
$DISCORD_CLIENT_SECRET = getenv("DC_CLIENT_SECRET");
$SECRET = getenv("SECRET"); // Use a random string :)

error_reporting($debugMode ? -1 : 0);

function privateIDGenerator($listName, $creator, $timestamp) {
    $str = $listName . $creator . $timestamp;
    $pid = substr(sha1($str),0,10);
    if (is_numeric($pid)) $pid = "p" . substr($pid, 0, 9);
    return $pid;
}

// Not secret :)
function sanitizeInput($inputArray)
{
    global $debugMode;
    error_reporting($debugMode ? -1 : 0);

    $i = 0;
    foreach ($inputArray as $post) {
        if ($post === "") {
            echo "1";
            exit();
        }
        $inputArray[$i] = htmlspecialchars(strip_tags(htmlspecialchars_decode($post)));
        $i += 1;
    }

    error_reporting($debugMode ? -1 : 1);

    return $inputArray;
}

function doRequest($mysqli, $queryTemplate, $values, $valueTypes, $fetchAll = false)
{
    global $debugMode;
    if ($debugMode) {
        error_log(sprintf(str_ireplace("?", "%s", $queryTemplate), ...$values));
    }

    $query = $mysqli->prepare($queryTemplate);

    // Fill in template
    if (sizeof($values) > 0)
        $query->bind_param($valueTypes, ...$values);

    try {
        $query->execute();
    }
    catch (Exception $e) { return ["error" => $e]; }
    $result = $query->get_result();

    $query->close();

    if (!$result) {
        return ["success" => true];
    }

    if ($fetchAll)
        return $result -> fetch_all(MYSQLI_ASSOC);
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

function createMomentToken($uid) {
    $data = [
        time(),
        $uid
    ];

    $decodedToken = implode(";", $data);
    $token = $decodedToken . ";" . md5($decodedToken);
    return base64_encode(encrypt($token));
}

function verifyMomentToken($token) {
    $decoded = decrypt(base64_decode($token));
    if (!$decoded) // Decryption failed
        return false;
    
    $token = explode(";", $decoded);
    if (sizeof($token) != 3) // time+uid+hash
        return false;
    
    // Moment tokens are valid for 30 minutes
    if (time() - $token[0] > 1800)
        return false;
    
    // validate hash
    if (md5(implode(";", array_slice($token, 0, 2))) != $token[2])
        return false;

    $localUID = getLocalUserID();
    if (!$localUID) return false;

    // validate that access token and moment token uids are the same
    return $localUID == $token[1];
}

function refreshToken() {
    global $hostname, $username, $password, $database, $DISCORD_CLIENT_ID, $DISCORD_CLIENT_SECRET;
    $mysqli = new mysqli($hostname, $username, $password, $database);
    if ($mysqli -> connect_errno) die("0");
    error_log("refreshing token...");

    $loginData = getAuthorization();
    if (!$loginData) return false;
    $refresh_token = doRequest($mysqli, "SELECT refresh_token FROM `users` WHERE discord_id=?", [$loginData[2]], "s");
    if (!is_array($refresh_token) || array_key_exists("error", $refresh_token)) return false;

    // Get the new token details
    $tokenUrl = array(
        "client_id" => $DISCORD_CLIENT_ID,
        "client_secret" => $DISCORD_CLIENT_SECRET,
        "grant_type" => "refresh_token",
        "refresh_token" => $refresh_token["refresh_token"],
    );
    $tokenHeaders = array('Content-Type: application/x-www-form-urlencoded');
    $baseURL = "https://discord.com/api/v10/oauth2/token";
    $accessInfo = json_decode(post($baseURL, $tokenUrl, $tokenHeaders, 0), true);
    if (array_key_exists("error", $accessInfo)) {
        removeCookie("access_token");
        doRequest($mysqli, 'UPDATE `users` SET `access_token`=null, `refresh_token`=null WHERE `discord_id`=?', [$ok["id"]], "s");
        return false;
    }

    // Get user data
    $tokenHeaders = array('Authorization: Bearer ' . $accessInfo["access_token"]);
    $baseURL = "https://discord.com/api/v10/users/@me";
    $ok = json_decode(post($baseURL, array(), $tokenHeaders), true);

    // Encrypt and save access token into a cookie
    
    removeCookie("access_token");
    saveAccessToken($accessInfo, $ok["id"]);

    doRequest($mysqli, 'UPDATE `users` SET `access_token`=?, `refresh_token`=? WHERE `discord_id`=?', [$accessInfo["access_token"], $accessInfo["refresh_token"], $ok["id"]], "sss");
    $mysqli -> close();

    return [$accessInfo["access_token"], time()+$accessInfo["expires_in"], $ok["id"]];
}

function revokeToken($token, $mysqli, $uid) {
    global $DISCORD_CLIENT_ID, $DISCORD_CLIENT_SECRET;
    // Revoke token
    $tokenUrl = array(
        "client_id" => $DISCORD_CLIENT_ID,
        "client_secret" => $DISCORD_CLIENT_SECRET,
        "token" => $token,
        "token_type_hint" => 'access_token'
    );
    $tokenHeaders = array('Content-Type: application/x-www-form-urlencoded');
    $baseURL = "https://discord.com/api/v10/oauth2/token/revoke";
    $accessInfo = json_decode(post($baseURL, $tokenUrl, $tokenHeaders, 0), true);

    // doRequest($mysqli, "DELETE FROM `sessions` WHERE `user_id`=?", [$uid], "s");
    doRequest($mysqli, 'UPDATE `users` SET `access_token`=null, `refresh_token`=null WHERE `discord_id`=?', [$ok["id"]], "s");
    
    return !array_key_exists("error", $accessInfo);
}

function saveAccessToken($oauthResponse, $discord_id) {
    setcookie("access_token", base64_encode(encrypt(json_encode([
        "token",
        time()+$oauthResponse["expires_in"],
        $discord_id
    ]))), time()+2678400, "/");
}

function removeCookie($cookie) {
    setcookie($cookie, '', time()-3600, "/");
    unset($_COOKIE[$cookie]);
}

function getAuthorization() {
    // bro (oh, it's ok now :D)
    if (isset($_COOKIE["access_token"])) return json_decode(decrypt(base64_decode($_COOKIE["access_token"])));
    else return false;
}

function getLocalUserID() {
    // Use when security is not number one priority :D
    $auth = getAuthorization();
    if (!$auth) return false;
    
    $token = getAuthorization();
    return $token[2]; // User ID
}

function checkAccount($mysqli, $forceToken = false) {
    global $DO_REFRESH;
    $auth = getAuthorization();
    if (!$auth) return false;

    $token;
    if (!$forceToken) $token = $auth;
    else $token = $forceToken;
    
    $getToken = $_COOKIE["momentToken"];
    if ($getToken) {
        $momentToken = verifyMomentToken($getToken);
        if ($momentToken) return ["id" => $token[2]];
    }

    if ($token[1]-time() < 86400) {
        $refresh_token = refreshToken($token);
        if ($refresh_token === false) return false;

        $token[0] = $refresh_token[0];
    }

    $res = doRequest($mysqli, "SELECT `access_token` FROM `users` WHERE `discord_id`=?", [$token[2]], "s");
    $tokenHeaders = array('Authorization: Bearer ' . $res["access_token"]);
    $baseURL = "https://discord.com/api/v10/users/@me";
    $ok = post($baseURL, array(), $tokenHeaders);
    $json = json_decode($ok, true);

    if ((isset($json["message"]) && strstr($json["message"], "401"))) { // Invalid token, logout
        $res = refreshToken($token);
        if ($res === false) return false;

        return checkAccount($mysqli, $res);
    }

    $mt = createMomentToken($token[2]);
    setcookie("momentToken", $mt, time() + 1800, "/");

    return $json;
}

function checkListOwnership($mysqli, $user_id) {
    $client_id = checkAccount($mysqli)["id"];
    return $user_id == $client_id;
}

function list_id($row) {
    return $row["hidden"] == 0 ? $row["id"] : $row["hidden"];
}

function clamp($current, $min, $max) {
    return max($min, min($max, $current));
}

function getRatings($mysqli, $userID, $type, $object_id, $splitRatings = false) {
    $likeQuery;
    $ratingArray = [0, 0, false];
    if ($splitRatings) {
        $likeQuery = doRequest($mysqli, sprintf("SELECT sum(rate = 1) as likes, sum(rate = 0) as dislikes FROM ratings WHERE %s=?", $type), [$object_id], "s");
        $ratingArray[0] = intval($likeQuery["likes"]);
        $ratingArray[1] = $likeQuery["dislikes"];
    }
    else {
        $likeQuery = doRequest($mysqli, sprintf("SELECT count(id) as total, sum(rate) as likes FROM ratings WHERE %s=?", $type), [$object_id], "s");
        $ratingArray[0] = intval($likeQuery["likes"]);
        $ratingArray[1] = $likeQuery["total"]-$likeQuery["likes"];
    }

    $hasRatedQuery;
    if ($userID) {
        $hasRatedQuery = doRequest($mysqli, sprintf("SELECT `rate` FROM ratings WHERE `uid`=? AND %s=?", $type), [$userID, $object_id], "ii");
        $hasRatedQuery = $hasRatedQuery === null ? -1 : $hasRatedQuery["rate"];
    }
    else $hasRatedQuery = -2;

    $ratingArray[2] = $hasRatedQuery;
    return $ratingArray;
}

// i think i used this in the frontend too :D: https://stackoverflow.com/a/44134328
function f($n, $a, $h) {
    $k = fmod(($n + $h[0] / 30), 12.0);
    $color = $h[2] - $a * max(min($k - 3, 9 - $k, 1), -1);
    return str_pad(dechex(round(255 * $color)), 2, '0');   // convert to Hex and prefix "0" if needed
}

function hslToHex($hslArray) {
    // is probably hex
    if (is_string($hslArray)) {
        if (substr($hslArray,0,1) == '#' && strlen($hslArray) == 7) return $hslArray;
        else return "#000000";
    }
        
    $hslArray[1] *= 100;
    $a = $hslArray[1] * min($hslArray[2], 1 - $hslArray[2]) / 100;
    
    return sprintf("#%s%s%s", f(0,$a,$hslArray), f(8,$a,$hslArray), f(4,$a,$hslArray));
}

function addLevelsToDatabase($mysqli, $levels, $listID, $userID, $isReview) {
    foreach ($levels as $l) {
        $hash = $l["levelID"];
        if (!isnum($l["levelID"]) || $l["levelID"] < 128 || $l["levelID"] > 200000000) continue;

        $isCollab = is_array($l["creator"]);
        $creator;
        if (!$isCollab) $creator = $l["creator"];
        else {
            if (isset($l["creator"][0][0]["name"]))
                $creator = $l["creator"][0][0]["name"];
            else
                $creator = $l["creator"][0][0];
        }

        $collabCount = $isCollab ? sizeof($l["creator"][2]) : 0;
        $diff = isset($l["difficulty"]) ? $l["difficulty"][0] : 0;
        $rating = isset($l["difficulty"]) ? $l["difficulty"][1] : 0;
        $color = isset($l["color"]) ? substr(hslToHex($l["color"]), 1) : null;
        $bgHash = isset($l["background"]) ? $l["background"]["image"][0] : null;
        if (strlen($bgHash) == 0) $bgHash = null;

        $res = doRequest($mysqli, "INSERT INTO `levels` (levelName, creator, collabMemberCount, levelID, difficulty, rating, platformer, color, background, uploaderID, hash)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
        `creator` = ?, `collabMemberCount` = ?, `difficulty` = ?, `rating` = ?, `color` = ?, `background` = ?",[
            $l["levelName"],
            $creator,
            $collabCount,
            $l["levelID"],
            $diff,
            $rating,
            isset($l["platf"]) ? $l["platf"] : false,
            $color,
            $bgHash,
            $userID,
            $hash,
        
            $creator, $collabCount, $diff, $rating, $color, $bgHash], "ssiiiiisssssiiiss");

        // Add list/review connections
        doRequest($mysqli, sprintf("INSERT INTO `levels_uploaders` (levelID, %s) VALUES (?, ?)", $isReview ? "reviewID" : "listID"),
        [$l["levelID"], $listID], "ii");
            
        // Add review level ratings
        if ($isReview) {
            doRequest($mysqli, "INSERT INTO `levels_ratings`(levelID, reviewID, gameplay, decoration, difficulty, overall) VALUES (?,?,?,?,?,?)",
            [$l["levelID"], $listID, $l["ratings"][0][0], $l["ratings"][0][1], $l["ratings"][0][2], $l["ratings"][0][3]],
            "iiiiii");
        }
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

function makeIN($arr) {
    return [
      "(" . substr(str_repeat("?,", sizeof($arr)), 0, sizeof($arr)*2-1) . ")",
      str_repeat("s", sizeof($arr))
    ];
  }

?>