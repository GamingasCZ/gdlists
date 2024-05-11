<?php
/*
Return codes:
0 - Error connecting to database
1 - Empty/incomplete request
2 - Not your list
3 - List doesn't exist
[LIST_DATA] - Success!!
*/

require("globals.php");
header('Content-type: application/json'); // Return as JSON

$mysqli = new mysqli($hostname, $username, $password, $database);
if ($mysqli -> connect_errno) {
    echo "0";
    //http_response_code(500);
    exit();
}
$mysqli->set_charset("utf8mb4");

error_reporting(0);

$DATA = json_decode(file_get_contents("php://input"), true);

$listData;
switch ($DATA["type"]) {
    case 'list':
        if (isset($DATA["id"])) {
            $listType = Array($DATA["id"], is_numeric($DATA["id"]) ? "id" : "hidden");
        }
        else {
            echo "1";
            http_response_code(204);
            exit();
        }
        
        $datacheck = sanitizeInput([$listType[0]]);
        $listData = doRequest($mysqli, sprintf("SELECT * FROM `lists` WHERE `%s`= ?", $listType[1]), [$datacheck[0]], "s");
        break;
    case 'review':
        $datacheck = sanitizeInput([$DATA["id"]]);
        $listData = doRequest($mysqli, "SELECT * FROM `reviews` WHERE id = ?", [$datacheck[0]], "s");
        break;
}
if ($listData === null) {
    die("3");
}

$owner = checkListOwnership($mysqli, $listData["uid"]);
if ($owner) {
    $decoded = base64_decode($listData["data"], true);
    if ($decoded) {
      $listData["data"] = json_decode(htmlspecialchars_decode(gzuncompress($decoded)));
    } else {
      $listData["data"] = json_decode(htmlspecialchars_decode($listData["data"]));
    }
    echo json_encode($listData);
}
else die("2");
?>
