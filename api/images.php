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
$MAX_STORAGE = 15000000;
$MAX_FILECOUNT = 200;
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

function getHashes($x) { return $x["hash"]; }

function getAll($uid, $mysqli, $folder = '/', $parentFolder = '/') {
    $allImages;
    $allFolders;
    if ($folder == '/') {
        $allImages = doRequest($mysqli, "SELECT `hash` FROM images WHERE `uploaderID`=? AND ISNULL(`folder`)", [$uid], "s", true);
        $allFolders = doRequest($mysqli, "SELECT `id`, `name`, `color` FROM `images_folders` WHERE `base_path` IS NULL AND `uid`=?", [$uid], "s", true);
    }
    else {
        $allImages = doRequest($mysqli, "SELECT `hash` FROM images
                                         RIGHT JOIN `images_folders` ON images.folder = images_folders.id
                                         WHERE `uploaderID`=? AND images_folders.id = ?", [$uid, $folder], "ss", true);
        $allFolders = doRequest($mysqli, "SELECT `id`, `name`, `color` FROM `images_folders` WHERE `uid`=? AND `base_path`=?", [$uid, $parentFolder], "ss", true);
    }

    // fuck off, dumbass bitch can't sort shit
    $thumbs = doRequest($mysqli, "SELECT * FROM (SELECT hash, name, images.id FROM images, images_folders WHERE images.folder = images_folders.id AND `uploaderID`=? AND base_path=? ORDER BY images.id DESC LIMIT 18446744073709551615) t GROUP BY t.name", [$uid, $folder], "ss", true);
    // $thumbs = doRequest($mysqli, "SELECT hash, name, floor(@row := @row + 0.5) as rank from images LEFT JOIN `images_folders` on images.folder = images_folders.id, (SELECT @row := -0.5) r WHERE `uploaderID`=? AND base_path=? GROUP BY rank", [$uid, $folder], "ss", true);
    
    return json_encode([json_decode(getStorage($mysqli, $uid)), array_reverse(array_map("getHashes", $allImages)), $allFolders, $thumbs]);
}

function saveImage($binaryData, $uid, $mysqli, $filename = null, $makeThumb = true, $saveToDatabase = true, $overwrite = false, $noSave = false, $folder = '/') {
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
    else $imageHash = sha1(substr($binaryData,0, 2048));

    if (!$overwrite) {
        if (is_file($userPath . "/" . $imageHash . ".webp")) return $imageHash; // No duplicate files
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
        $thumbnail = imagescale($img, 240);
        imagesavealpha($thumbnail, true);
        imagewebp($thumbnail, $userPath . "/" . $imageHash . "-thumb.webp", 50);

        imagedestroy($thumbnail);
    }

    imagedestroy($img);
    imagedestroy($maxsize);

    if ($saveToDatabase)
        doRequest($mysqli, "INSERT INTO `images` (`uploaderID`, `hash`, `filesize`, `folder`) VALUES (?,?,?,?)", [$uid, $imageHash, $compressedFilesize, $folder], "ssis");

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
    
            die(getAll($user["id"], $mysqli, urldecode($_GET["currentFolder"]), urldecode($_GET["parentFolder"])));
            break;
    
        case 'POST':
            $DATA = file_get_contents("php://input");
            
            $newImages = [];
            if (sizeof($_FILES) == 0 || sizeof($_FILES) > 10) die("-3");
            
            $folder = '/';
            if ($_SERVER["HTTP_IMAGE_FOLDER"])
                $folder = $_SERVER["HTTP_IMAGE_FOLDER"];

            foreach ($_FILES as $key => $image) {
                if (!$image["tmp_name"]) die("-4"); // $image["error"] = 1 : filesize
                array_push($newImages, saveImage(file_get_contents($image["tmp_name"]), $user["id"], $mysqli, folder: $folder));
            }
            
            die(getStorage($mysqli, $user["id"], $newImages));
            break;
    
        case 'DELETE':
            // Remove folder
            if (isset($_GET["removeFolder"])) {
                if ($_GET["keepImages"]) {
                    $res = doRequest($mysqli, "UPDATE `images` SET `folder` = IFNULL((SELECT id FROM `images_folders` WHERE `name`=?), NULL) WHERE `folder` = IFNULL((SELECT id FROM `images_folders` WHERE `name`=?), NULL) AND `uploaderID` = ?", [$_GET["folderAddTo"], $_GET["removeFolder"], $user["id"]], "sss");
                    if (is_array($res) && array_key_exists("error", $res))
                        die();
                }
                else
                    doRequest($mysqli, "DELETE FROM `images` WHERE `folder` = ? AND `uploaderID` = ?", [$_GET["removeFolder"], $user["id"]], "ss");
                doRequest($mysqli, "DELETE FROM `images_folders` WHERE `name` = ? AND `uid` = ?", [$_GET["removeFolder"], $user["id"]], "ss");
                die(getStorage($mysqli, $user["id"]));
            }

            // Remove files
            $userPath = getUserPath($user["id"]);
            if (!is_array($_GET["hash"]) || sizeof($_GET["hash"]) == 0 || sizeof($_GET["hash"]) > 25) die("-3");
            foreach ($_GET["hash"] as $singleHash) {
                if (!ctype_alnum($singleHash) || strlen($singleHash) != 40) die("-3"); // check if the user is a hackerman
            }
            
            // Remove from database
            $res = doRequest($mysqli, sprintf("DELETE FROM `images` WHERE `uploaderID`=? AND `hash` IN ('%s')", implode("','", $_GET["hash"])), [$user["id"]], "s");
            if (array_key_exists("error", $res)) die('-5'); // Image is in use
            
            foreach ($_GET["hash"] as $singleHash) {
                if (is_file($userPath . "/" . $singleHash . ".webp")) {
                    unlink($userPath . "/" . $singleHash . ".webp");
                    unlink($userPath . "/" . $singleHash . "-thumb.webp");
                }
            }
            
            die(getStorage($mysqli, $user["id"]));
            break;
        
        case 'PUT':
            $DATA = json_decode(file_get_contents("php://input"), true);
            
            if (!isset($DATA["action"])) die(http_response_code(403));

            switch ($DATA["action"]) {
                case 'createFolder':
                    $slashPos = strpos($DATA["name"], '/');
                    $folderName = $DATA["name"];
                    $nameLength = strlen($folderName);

                    // Check special characters in name
                    if (!ctype_alnum($folderName) && !ctype_space($folderName))
                        die(http_response_code(403));

                    // Check folder name length
                    if ($nameLength > 20 || $nameLength < 3) die(http_response_code(403));
        
                    // Make sure no slashes are in name
                    if ($slashPos === false) $folderName = '/' . $folderName;
                    else if ($slashPos > 0) die(http_response_code(403));
        
                    // Make sure no folder with the same name exists in the current directory
                    $currentFolder = $DATA["currentFolder"];
                    $checkExistence = doRequest($mysqli, "SELECT COUNT(id) as cnt FROM images_folders WHERE `base_path`=? AND `name`=?", [$currentFolder, $folderName], "ss");
                    if ($checkExistence["cnt"] >= 1)
                        die(http_response_code(403));

                    // Check that the color isn't bogus
                    $folderColor = substr($DATA["color"], 0, 7);
                    if ($folderColor[0] != "#") die(http_response_code(403));
        
                    
                    $res = doRequest($mysqli, "INSERT INTO `images_folders`(`name`, `color`, `base_path`, `uid`) VALUES (?,?,?,?)", [$folderName, $folderColor, $currentFolder, $user["id"]], "ssss");
                    if (!array_key_exists("error", $res)) die(http_response_code(201));
                    
                    break;
                case 'moveToFolder':
                    $imgs = makeIN($DATA["images"]);
                    $addToFolder = urldecode($DATA["folderName"]);
                    if ($addToFolder == '/') $addToFolder = NULL;

                    $res = doRequest($mysqli, sprintf("UPDATE `images` SET `folder` = IFNULL((SELECT id FROM `images_folders` WHERE `name`=? AND `base_path`=?), NULL) WHERE `hash` IN %s", $imgs[0]), [$addToFolder, urlencode($DATA["parentFolder"]), ...$DATA["images"]], "ss" . $imgs[1]);
                    if (!array_key_exists("error", $res)) {
                        http_response_code(201);
                        die(getAll($user["id"], $mysqli, $addToFolder, urldecode($DATA["parentFolder"])));
                    }
                    
                    break;
                
                default:
                    die(http_response_code(403));
            }

            break;

        case 'PATCH':
            $DATA = json_decode(file_get_contents("php://input"), true);
            doRequest($mysqli, "UPDATE `images_folders` SET `name` = ?, `color` = ? WHERE `name` = ? AND `uid` = ?", ['/' . $DATA["name"], $DATA["color"], $DATA["currentFolder"], $user["id"]], "ssss");

        default:
            die("-1");
            break;
    }
}

?>
