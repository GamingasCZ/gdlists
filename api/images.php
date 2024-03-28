<?php
header('Content-type: application/json'); // Return as JSON
require("globals.php");
/* Return codes:
-2 = not logged in
-1 = empty request
0 = database error
*/
$MAX_STORAGE = 10_000_000;
$MAX_FILECOUNT = 50;
$MAX_UPLOADSIZE = 2_000_000;

$user = checkAccount();
if (!$user) die(-2);

$mysqli = new mysqli($hostname, $username, $password, $database);
if ($mysqli -> connect_errno) die("0");

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

        die(json_encode([json_decode(getStorage($user["id"])), array_merge(...$allImages -> fetch_all())]));
        break;

    case 'POST':
        $DATA = file_get_contents("php://input");
        $LOCAL = $_SERVER["SERVER_NAME"] == "localhost";

        // Create directory for user
        $userPath;
        if ($LOCAL)
            $userPath = "userContent/" . $user["id"];
        else
            $userPath = "../../userContent/" . $user["id"];
        if (!is_dir($userPath)) {
            mkdir($userPath);
        }
        
        // Image data
        $imageHash = sha1($DATA);
        $filesize = strlen($DATA);

        
        // Save file, thumbnail
        $file = fopen($userPath . "/" . $imageHash . ".webp", "w");
        fwrite($file, $DATA);
        fclose($file);

        $file = fopen($userPath . "/" . $imageHash . "-thumb.webp", "w");
        fwrite($file, $DATA);
        fclose($file);

        doRequest($mysqli, "INSERT INTO `images` (`uploaderID`, `hash`, `filesize`) VALUES (?,?,?)", [$user["id"], $imageHash, $filesize], "ssi");

        break;

    case 'DELETE':
        break;
    
    default:
        die(-1);
        break;
}

?>