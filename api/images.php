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
const MAX_STORAGE = 15000000;
const MAX_FILECOUNT = 200;
const MAX_UPLOADSIZE = 5000000;

enum Folder_Attribute: string {
    case THUMBNAILS = 'Thumbnails';
}

// Path for user content
function getUserPath($uid) {
    $LOCAL = $_SERVER["SERVER_NAME"] == "localhost";
    if ($LOCAL)
        return "userContent/" . $uid;
    else
        return "../../userContent/" . $uid;
}

function getStorage($mysqli, $uid, $addNewImage = null) {
    $req = getSpaceRemaining($mysqli, $uid);
    return json_encode([
        "uid" => $uid,
        "left" => MAX_STORAGE - floatval($req['used']),
        "storageMax" => MAX_STORAGE,
        "filecount" => intval($req['filecount']),
        "maxFilecount" => MAX_FILECOUNT,
        "maxUploadSize" => MAX_UPLOADSIZE,
        "newImage" => $addNewImage
    ]);
}

function getHashes($x) { return $x["hash"]; }

function getAll($uid, $mysqli, $folderID = -1) {
    $allImages;
    $allFolders;
    if ($folderID == -1 || $folderID == NULL) {
        $allImages = doRequest($mysqli, "SELECT `hash` FROM images WHERE `uploaderID`=? AND ISNULL(`folder`)", [$uid], "s", true);
        $allFolders = doRequest($mysqli, "SELECT `id`, `name`, `color` FROM `images_folders` WHERE `base_path` IS NULL AND `uid`=?", [$uid], "s", true);
    }
    else {
        $allImages = doRequest($mysqli, "SELECT `hash` FROM images WHERE `uploaderID`=? AND `folder` = ?", [$uid, $folderID], "si", true);
        $allFolders = doRequest($mysqli, "SELECT `id`, `name`, `color` FROM `images_folders` WHERE `uid`=? AND `base_path`=?", [$uid, $folderID], "si", true);
    }

    $folderIDs = [];
    foreach ($allFolders as $folder)
        array_push($folderIDs, $folder["id"]);
    
    $thumbs = [];
    if (sizeof($folderIDs)) {
        $fIDQuery = makeIN($folderIDs);
        // $thumbs = doRequest($mysqli, sprintf("SELECT `hash`,`folder` FROM `images` WHERE `uploaderID`=? AND `folder` IN %s ORDER BY `folder` DESC, `id` DESC LIMIT ?", $fIDQuery[0]), [$uid, ...$folderIDs, sizeof($folderIDs)], "s" . $fIDQuery[1] . "i", true);
        // $thumbs = doRequest($mysqli, sprintf("SELECT `hash`,`folder` FROM `images` WHERE `uploaderID`=? AND `folder` IN %s ORDER BY `folder` ASC, `id` DESC LIMIT ?", $fIDQuery[0]), [$uid, ...$folderIDs, sizeof($folderIDs)], "s" . $fIDQuery[1] . "i", true);
        $thumbs = doRequest($mysqli, sprintf("SELECT * FROM (SELECT hash, folder FROM `images` WHERE `uploaderID`=? AND `folder` IN %s ORDER BY `folder` ASC, `id` DESC LIMIT 999) t GROUP BY folder", $fIDQuery[0]), [$uid, ...$folderIDs], "s" . $fIDQuery[1], true);
    }
    
    return json_encode([json_decode(getStorage($mysqli, $uid)), array_reverse(array_map("getHashes", $allImages)), $allFolders, $thumbs]);
}

function getSpaceRemaining($mysqli, $uid) {
    $req = doRequest($mysqli, "SELECT ifnull(SUM(`filesize`), 0) as used, ifnull(COUNT(`id`), 0) as filecount FROM `images` WHERE `uploaderID`=?", [$uid], "s");
    return $req;
}

$galleryDetails = null;
function saveImage($binaryData, $uid, $mysqli, $filename = null, $makeThumb = true, $saveToDatabase = true, $overwrite = false, $noSave = false, $folder = -1, $resize = false) {
    global $galleryDetails;
    $userPath = getUserPath($uid);
    
    $filesize = strlen($binaryData);
    if ($filesize > MAX_UPLOADSIZE) die("-4");
    if ($filesize < 2049) die("-4");

    // Create directory for user
    if (!is_dir($userPath)) {
        mkdir($userPath);
    }

    // Image data
    $imageHash;
    if ($filename !== null) $imageHash = $filename;
    else $imageHash = sha1(substr($binaryData, 2048, 16384));

    if (!$overwrite) {
        if (is_file($userPath . "/" . $imageHash . ".webp")) {
            http_response_code(200);
            return $imageHash; // No duplicate files
        }
    }

    if (is_null($galleryDetails))
        $galleryDetails = getSpaceRemaining($mysqli, $uid);

    // Check if user hasn't gone crazy with file uploads
    if (MAX_FILECOUNT - $galleryDetails["filecount"] <= 1)
        die("-10");

    // Create image
    $img = imagecreatefromstring($binaryData);
    if (!$img) die("-5");

    $maxsize;
    if ($resize)
        $maxsize = imagescale($img, min($resize, 1920));
    elseif (imagesx($img) > 1920)
        $maxsize = imagescale($img, 1920);
    else
        $maxsize = &$img; // reference

    imagesavealpha($maxsize, true);
    
    // Save image
    $compressedFilesize;
    imagewebp($maxsize, $userPath . "/" . $imageHash . ".webp", 60);
    $compressedFilesize = filesize($userPath . "/" . $imageHash . ".webp");
    if (MAX_STORAGE - $galleryDetails["used"] - $compressedFilesize <= 0) {
        imagedestroy($img);
        imagedestroy($maxsize);
        unlink($userPath . "/" . $imageHash . ".webp");
        die("-6");
    }

    
    // Create thumbnail
    if ($makeThumb) {
        $thumbnail = imagescale($img, 240);
        imagesavealpha($thumbnail, true);
        imagewebp($thumbnail, $userPath . "/" . $imageHash . "-thumb.webp", 50);

        imagedestroy($thumbnail);
    }

    imagedestroy($img);
    imagedestroy($maxsize);

    $toFolder = $folder;
    if ($toFolder == -1)
        $folder = NULL;

    if ($saveToDatabase) {
        $res = doRequest($mysqli, "INSERT INTO `images` (`uploaderID`, `hash`, `filesize`, `folder`) VALUES (?,?,?,?)", [$uid, $imageHash, $compressedFilesize, $folder], "ssis");

        if (!array_key_exists("error", $res)) {
            $galleryDetails["used"] += $compressedFilesize;
            $galleryDetails["filecount"] += 1;
        }
        else die("-5");
    }


    return $imageHash;
}

function getCreateAttributedFolderID($attribute, $uid, $mysqli) {
    $att = $attribute->value;
    $folderExists = doRequest($mysqli, "SELECT id FROM `images_folders` WHERE `attributes`=? AND `uid`=?", [$att, $uid], "ss");
    if (!$folderExists) {
        $folderCreate = doRequest($mysqli,
        "INSERT INTO `images_folders`(`name`, `color`, `base_path`, `uid`, `attributes`)
        VALUES (?,?,?,?,?)",
        ['/'.$att, "#1A1C3C", NULL, $uid, $att], "ssiss");
        if (array_key_exists("success", $folderCreate)) {
            $fID = doRequest($mysqli, "SELECT LAST_INSERT_ID() as id",[],"");
            return $fID["id"];
        }
    }
    else {
        return $folderExists["id"];
    }
}

function createFolder($mysqli, $uid, $name, $base = -1, $color = "#1A1C3C", $attribute = NULL) {
    $slashPos = strpos($name, '/');
    $folderName = trim($name);
    $nameLength = strlen($folderName);

    // Check special characters in name
    if (!ctype_alnum(str_replace(' ', '', $folderName)))
        die(http_response_code(403));

    // Check folder name length
    if ($nameLength > 20 || $nameLength < 3) return false;

    // Make sure no slashes are in name
    if ($slashPos === false) $folderName = '/' . $folderName;
    else if ($slashPos > 0) return false;

    // Make sure no folder with the same name exists in the current directory
    $currentFolder = intval($base);
    if ($currentFolder == -1) $currentFolder = NULL;
    
    $checkExistence = doRequest($mysqli, "SELECT COUNT(id) as cnt FROM images_folders WHERE `base_path`=? AND `name`=?", [$currentFolder, $folderName], "is");
    if ($checkExistence["cnt"] >= 1)
        return false;

    // Check that the color isn't bogus
    $folderColor = substr($color, 0, 7);
    if ($folderColor[0] != "#") return false;

    $res = doRequest($mysqli, "INSERT INTO `images_folders`(`name`, `color`, `base_path`, `uid`, `attributes`) VALUES (?,?,?,?,?)", [$folderName, $folderColor, $currentFolder, $uid, $attribute], "ssiss");
    if (array_key_exists("error", $res)) return false;
    return true;
}

if (basename(__FILE__) == basename($_SERVER["SCRIPT_FILENAME"])) {
    $mysqli = new mysqli($hostname, $username, $password, $database);
    if ($mysqli -> connect_errno) die("0");
    
    $user = checkAccount($mysqli);
    if (!$user) die(-2);
    
    $mysqli->query("SET SESSION sql_mode = 'NO_ENGINE_SUBSTITUTION'");
    $method = $_SERVER["REQUEST_METHOD"];
    switch ($method) {
        case 'GET':
            if (isset($_GET["storage"])) {
                die(getStorage($mysqli, $user["id"]));
            }
    
            die(getAll($user["id"], $mysqli, intval($_GET["folderID"])));
            break;
    
        case 'POST':
            $DATA = file_get_contents("php://input");
            
            $newImages = [];
            if (sizeof($_FILES) == 0 || sizeof($_FILES) > 10) die("-3");
            
            $folder = -1;
            if ($_SERVER["HTTP_IMAGE_FOLDER"])
                $folder = $_SERVER["HTTP_IMAGE_FOLDER"];

            foreach ($_FILES as $key => $image) {
                if (!$image["tmp_name"]) die("-4"); // $image["error"] = 1 : filesize
                http_response_code(201);
                array_push($newImages, saveImage(file_get_contents($image["tmp_name"]), $user["id"], $mysqli, folder: intval($folder)));
            }
            
            die(getStorage($mysqli, $user["id"], $newImages));
            break;
    
        case 'DELETE':
            
            // Remove folder
            if (isset($_GET["removeFolder"])) {
                $folderAddTo = $_GET["folderAddTo"];
                if ($folderAddTo == -1) $folderAddTo = NULL;

                if ($_GET["keepImages"]) {
                    $res = doRequest($mysqli, "UPDATE `images` SET `folder` = ? WHERE `folder` = ? AND `uploaderID` = ?", [$folderAddTo, intval($_GET["removeFolder"]), $user["id"]], "sss");
                    if (is_array($res) && array_key_exists("error", $res))
                        die();
                }
                else
                    doRequest($mysqli, "DELETE FROM `images` WHERE `folder` = ? AND `uploaderID` = ?", [intval($_GET["removeFolder"]), $user["id"]], "ss");
                doRequest($mysqli, "DELETE FROM `images_folders` WHERE `id` = ? AND `uid` = ?", [intval($_GET["removeFolder"]), $user["id"]], "ss");
                die(getStorage($mysqli, $user["id"]));
            }

            // Remove files
            $userPath = getUserPath($user["id"]);
            if (!is_array($_GET["hash"]) || sizeof($_GET["hash"]) == 0 || sizeof($_GET["hash"]) > 25) die("-3");
            foreach ($_GET["hash"] as $singleHash) {
                if (!ctype_alnum($singleHash)) die("-3"); // check if the user is a hackerman
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
                    $res = createFolder($mysqli, $user["id"], $DATA["name"], $DATA["currentFolder"], $DATA["color"]);
                    if (!$res) {
                        die(http_response_code(403));
                    }
                    break;
                case 'moveToFolder':
                    $imgs = makeIN($DATA["images"]);
                    $addToFolder = intval($DATA["folderID"]);
                    if ($addToFolder == -1) $addToFolder = NULL;

                    $res = doRequest($mysqli, sprintf("UPDATE `images` SET `folder` = ? WHERE `uploaderID` = ? AND `hash` IN %s", $imgs[0]), [$addToFolder, $user["id"], ...$DATA["images"]], "is" . $imgs[1]);
                    if (!array_key_exists("error", $res)) {
                        http_response_code(201);
                        die(getAll($user["id"], $mysqli, $addToFolder));
                    }
                    
                    break;
                
                default:
                    die(http_response_code(403));
            }

            break;

        case 'PATCH':
            $DATA = json_decode(file_get_contents("php://input"), true);
            doRequest($mysqli, "UPDATE `images_folders` SET `name` = ?, `color` = ? WHERE `id` = ? AND `uid` = ?", ['/' . $DATA["name"], $DATA["color"], intval($DATA["currentFolder"]), $user["id"]], "ssis");

        default:
            die("-1");
            break;
    }
}

?>
