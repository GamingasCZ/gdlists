<?php
header('Content-type: application/json'); // Return as JSON
require_once("globals.php");

/* Return codes:
-5 = image is IN USE
-4 = invalid image
-3 = invalid hash
-2 = not logged in
-1 = empty request
0 = database error
*/
$MAX_STORAGE = 10000000;
$MAX_FILECOUNT = 50;
$MAX_UPLOADSIZE = 5000000;

// Path for user content
function getUserPath($uid) {
    $LOCAL = $_SERVER["SERVER_NAME"] == "localhost";
    if ($LOCAL)
        return "userContent/" . $uid;
    else
        return "../../userContent/" . $uid;
}

function getStorage($mysqli, $uid, $addNewImage = null) {
    global $MAX_STORAGE, $MAX_UPLOADSIZE, $MAX_FILECOUNT;
    $req = doRequest($mysqli, "SELECT SUM(`filesize`), COUNT(`id`) FROM `images` WHERE `uploaderID`=?", [$uid], "s");
    return json_encode([
        "uid" => $uid,
        "left" => $MAX_STORAGE - floatval($req['SUM(`filesize`)']),
        "storageMax" => $MAX_STORAGE,
        "filecount" => intval($req['COUNT(`id`)']),
        "maxFilecount" => $MAX_FILECOUNT,
        "maxUploadSize" => $MAX_UPLOADSIZE,
        "newImage" => $addNewImage
    ]);
}

function getAll($uid, $mysqli) {
    $allImages = $mysqli -> query(sprintf("SELECT `hash` FROM images WHERE `uploaderID`=%s", $uid));

    return json_encode([json_decode(getStorage($mysqli, $uid)), array_reverse(array_merge(...$allImages -> fetch_all()))]);
}

function saveImage($binaryData, $uid, $mysqli, $filename = null, $makeThumb = true, $saveToDatabase = true, $overwrite = false, $noSave = false) {
    global $MAX_UPLOADSIZE;
    $userPath = getUserPath($uid);
    
    $filesize = strlen($binaryData);
    if ($filesize > $MAX_UPLOADSIZE) die("-4");
    if ($filesize < 50) die("-4");
    
    // Create directory for user
    if (!is_dir($userPath)) {
        mkdir($userPath);
    }

    // Image data
    $imageHash;
    if ($filename !== null) $imageHash = $filename;
    else $imageHash = sha1($binaryData);

    if (!$overwrite) {
        if (is_file($userPath . "/" . $imageHash . ".webp")) die("-3"); // No duplicate files
    }

    // Create image
    $img = imagecreatefromstring($binaryData);
    if (!$img) die("-5");

    $maxsize;
    if (imagesx($img) > 1920)
        $maxsize = imagescale($img, 1920);
    else
        $maxsize = &$img; // reference

    imagesavealpha($maxsize, true);
    
    // Save image
    $compressedFilesize;
    imagewebp($maxsize, $userPath . "/" . $imageHash . ".webp", 60);
    $compressedFilesize = filesize($userPath . "/" . $imageHash . ".webp");
    
    // Create thumbnail
    if ($makeThumb) {
        $thumbnail = imagescale($img, 128);
        imagesavealpha($thumbnail, true);
        imagewebp($thumbnail, $userPath . "/" . $imageHash . "-thumb.webp", 40);

        imagedestroy($thumbnail);
    }

    imagedestroy($img);
    imagedestroy($maxsize);

    if ($saveToDatabase)
        doRequest($mysqli, "INSERT INTO `images` (`uploaderID`, `hash`, `filesize`) VALUES (?,?,?)", [$uid, $imageHash, $compressedFilesize], "ssi");

    return $imageHash;
}

if (basename(__FILE__) == basename($_SERVER["SCRIPT_FILENAME"])) {
    $mysqli = new mysqli($hostname, $username, $password, $database);
    if ($mysqli -> connect_errno) die("0");
    
    $user = checkAccount($mysqli);
    if (!$user) die(-2);
    
    $method = $_SERVER["REQUEST_METHOD"];
    switch ($method) {
        case 'GET':
            if (isset($_GET["storage"])) {
                die(getStorage($mysqli, $user["id"]));
            }
    
            die(getAll($user["id"], $mysqli));
            break;
    
        case 'POST':
            $DATA = file_get_contents("php://input");
            
            $newImage = saveImage($DATA, $user["id"], $mysqli);
            
            die(getStorage($mysqli, $user["id"], $newImage));
            break;
    
        case 'DELETE':
            $hash = substr($_GET["hash"], 0, 40);
            $userPath = getUserPath($user["id"]);
            if (!ctype_alnum($hash)) die("-3"); // check if the user is a hackerman
    
            if (is_file($userPath . "/" . $hash . ".webp")) {
                // Remove from database
                $res = doRequest($mysqli, "DELETE FROM `images` WHERE `uploaderID`=? AND `hash`=?", [$user["id"], $hash], "ss");
                if (array_key_exists("error", $res)) die('-5'); // Image is in use
    
                // Remove files
                unlink($userPath . "/" . $hash . ".webp");
                unlink($userPath . "/" . $hash . "-thumb.webp");
    
                
                die(getStorage($mysqli, $user["id"]));
            }
            else die("-3");
            break;
        
        default:
            die("-1");
            break;
    }
}

?>