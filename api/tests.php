<?php
require_once("globals.php");
header("Content-Type: application/json"); // Return as JSON

if (!$debugMode) die();

switch ($_GET["test"]) {
    case '1':
        die(json_encode([
            privateIDGenerator("aaaaa", "bbbbb", "ccccc"),
            privateIDGenerator("ccccc", "aaaaa", "bbbbb"),
            privateIDGenerator("bbbbb", "ccccc", "aaaaa"),
        ]));
        break;
    case '2':
        die(json_encode(sanitizeInput(["<div></div>", "test"])));
        break;
    case '3':
        $mysqli = new mysqli($hostname, $username, $password, $database);
        if ($mysqli->connect_errno) {
            echo "0";
            exit();
        }
        $mysqli->set_charset("utf8mb4");

        die(json_encode([
            doRequest($mysqli, "SELECT VERSION() as 'string'", [], "")["string"],
            doRequest($mysqli, "SELECT name FROM lists WHERE id > ?", [1], "i")["name"]
        ]));
        break;
    case '4':
        die(decrypt(encrypt("test")));
        break;
}

?>
