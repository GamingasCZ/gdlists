<?php
header('Content-type: application/json'); // Return as JSON
require("globals.php");

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

$user = checkAccount();
if (!$user) die(-2);

$mysqli = new mysqli($hostname, $username, $password, $database);
if ($mysqli -> connect_errno) die("0");

// Path for user content
$userPath;
$LOCAL = $_SERVER["SERVER_NAME"] == "localhost";
if ($LOCAL)
    $userPath = "userContent/" . $user["id"];
else
    $userPath = "../../userContent/" . $user["id"];

function getStorage($uid) {
    global $mysqli, $MAX_STORAGE, $MAX_UPLOADSIZE, $MAX_FILECOUNT;
    $req = doRequest($mysqli, "SELECT SUM(`filesize`), COUNT(`id`) FROM `images` WHERE `uploaderID`=?", [$uid], "s");
    return json_encode([
        "uid" => $uid,
        "left" => $MAX_STORAGE - floatval($req['SUM(`filesize`)']),
        "storageMax" => $MAX_STORAGE,
        "filecount" => intval($req['COUNT(`id`)']),
        "maxFilecount" => $MAX_FILECOUNT,
        "maxUploadSize" => $MAX_UPLOADSIZE,
    ]);
}

$method = $_SERVER["REQUEST_METHOD"];
switch ($method) {
    case 'GET':
        if (isset($_GET["storage"])) {
            die(getStorage($user["id"]));
        }

        $allImages = $mysqli -> query(sprintf("SELECT `hash` FROM images WHERE `uploaderID`=%s", $user["id"]));

        die(json_encode([json_decode(getStorage($user["id"])), array_reverse(array_merge(...$allImages -> fetch_all()))]));
        break;

    case 'POST':
        $DATA = file_get_contents("php://input");
        $filesize = strlen($DATA);
        if ($filesize > $MAX_UPLOADSIZE) die("-4");
        if ($filesize < 50) die("-4");
        
        // Create directory for user
        if (!is_dir($userPath)) {
            mkdir($userPath);
        }
        
        // Image data
        $imageHash = sha1($DATA);
        if (is_file($userPath . "/" . $imageHash . ".webp")) die("-3"); // No duplicate files

        // Create image
        $img = imagecreatefromstring($DATA);
        if (!$img) die("-5");

        $maxsize = imagescale($img, 1920);
        imagesavealpha($maxsize, true);
        
        // Save image
        imagewebp($maxsize, $userPath . "/" . $imageHash . ".webp", 60);
        $compressedFilesize = filesize($userPath . "/" . $imageHash . ".webp");
        
        // Create thumbnail
        $thumbnail = imagescale($img, 128);
        imagesavealpha($thumbnail, true);
        imagewebp($thumbnail, $userPath . "/" . $imageHash . "-thumb.webp", 40);
        

        // Free images
        imagedestroy($img);
        imagedestroy($maxsize);
        imagedestroy($thumbnail);

        doRequest($mysqli, "INSERT INTO `images` (`uploaderID`, `hash`, `filesize`) VALUES (?,?,?)", [$user["id"], $imageHash, $compressedFilesize], "ssi");

        break;

    case 'DELETE':
        $hash = substr($_GET["hash"], 0, 40);
        if (!ctype_alnum($hash)) die("-3"); // check if the user is a hackerman

        if (is_file($userPath . "/" . $hash . ".webp")) {
            // Remove from database
            $res = doRequest($mysqli, "DELETE FROM `images` WHERE `uploaderID`=? AND `hash`=?", [$user["id"], $hash], "ss");
            if (array_key_exists("error", $res)) die('-5'); // Image is in use

            // Remove files
            unlink($userPath . "/" . $hash . ".webp");
            unlink($userPath . "/" . $hash . "-thumb.webp");

            
            die(getStorage($user["id"]));
        }
        else die("-3");
        break;
    
    default:
        die("-1");
        break;
}

?>