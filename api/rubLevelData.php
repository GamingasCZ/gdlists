<?php
header('Content-type: application/json'); // Return as JSON
header('Access-Control-Allow-Origin: *');
require("globals.php");
$returnData = [];

function parseLevelList($response) {
    if ($levelDataReq == -1) { // No levels found
        http_response_code(404);
        die(-1);
    }
    $allLevels = [];
    $fetchData = explode("#",$response);
    $levelData = explode("|", $fetchData[0]);
    $userData = explode("|", $fetchData[1]);
    foreach ($levelData as $level) {
        $singleLevel = explode(":", $level);
        $author;
        foreach ($userData as $name) { // Player ID from levelData search in names
            if (preg_match(sprintf("/^%s/", $singleLevel[7]), $name) == 1) $author = explode(":", $name)[1];
        }

        array_push($allLevels, [
            "id" => $singleLevel[1],
            "name" => $singleLevel[3],
            "author" => $author,
            "difficulty" => ((int) $singleLevel[21])*10 + $singleLevel[11]/10, // isDemon*10 + weird ass rubrub difficulty thingy/10
            "cp" => ((int) $singleLevel[27] > 0) + ((int) $singleLevel[29] > 0) + ((int) $singleLevel[31] > 0)
        ]);
    }
    return array_slice($allLevels, 0, 50);
}

switch (array_keys($_GET)[0]) {
    case "list": {
        $returnData = parseLevelList($levelDataReq = post("https://www.boomlings.com/database/getGJLevels21.php", ["secret"=>"Wmfd2893gb7","type"=>25,"str"=>$_GET["id"]], []));
        break;
    }
    case "idList": {
        $returnData = parseLevelList($levelDataReq = post("https://www.boomlings.com/database/getGJLevels21.php", ["secret"=>"Wmfd2893gb7","type"=>10, "str"=>$_GET["list"]], []));
        break;
    }
    case "id": {
        $levelDataReq = post("https://www.boomlings.com/database/getGJLevels21.php", ["secret"=>"Wmfd2893gb7","type"=>0,"str"=>$_GET["id"]], []);
        if ($levelDataReq == -1) { // No levels found
            http_response_code(404);
            die(-1);
        }

        $levelData = explode(":", $levelDataReq);
        
        $returnData["id"] = $levelData[1];
        $returnData["name"] = $levelData[3];
        $returnData["author"] = $levelData[54];
        $returnData["difficulty"] = ((int) $levelData[21])*10 + $levelData[11]/10; // isDemon*10 + weird ass rubrub difficulty thingy/10
        $returnData["cp"] = ((int) $levelData[27] > 0) + ((int) $levelData[29] > 0) + ((int) $levelData[31] > 0);
        break;
    }
    case "levelName": {
        $levelDataReq = post("https://www.boomlings.com/database/getGJLevels21.php", ["secret"=>"Wmfd2893gb7","type"=>0,"str"=>$_GET["levelName"]], []);
        if ($levelDataReq == -1) { // No levels found
            http_response_code(404);
            die(-1);
        }
        
        $allLevels = explode("|", $levelDataReq); 
        $levelData = explode(":", $allLevels[0]); // First result level
        $names = explode("|", explode("#", $levelDataReq)[1]); // rob's silly ass response (users)

        foreach ($names as $level) { // Player ID from levelData search in names
            if (preg_match(sprintf("/^%s/", $levelData[7]), $level) == 1) $returnData["author"] = explode(":", $level)[1];
        }

        $returnData["id"] = $levelData[1];
        $returnData["name"] = $levelData[3];
        $returnData["difficulty"] = ((int) $levelData[21])*5 + $levelData[11]/10; // isDemon*10 + weird ass rubrub difficulty thingy/10
        $returnData["cp"] = ((int) $levelData[27] > 0) + ((int) $levelData[29] > 0) + ((int) $levelData[31] > 0);
        break;
    }
    case "levelMaker": {
        $userReq = post("https://www.boomlings.com/database/getGJUsers20.php", ["secret"=>"Wmfd2893gb7","str"=>$_GET["levelMaker"]], []);
        $playerID = explode(":", $userReq)[3];

        $levelDataReq = post("https://www.boomlings.com/database/getGJLevels21.php", ["secret"=>"Wmfd2893gb7","type"=>5,"str"=>$playerID], []);
        if ($levelDataReq == -1) { // No levels found
            http_response_code(404);
            die(-1);
        }
        
        $allLevels = explode("|", $levelDataReq); 
        $levelData = explode(":", $allLevels[0]); // First result level
        $names = explode("|", explode("#", $levelDataReq)[1]); // rob's silly ass response (users)

        foreach ($names as $level) { // Player ID from levelData search in names
            if (preg_match(sprintf("/^%s/", $levelData[7]), $level) == 1) $returnData["author"] = explode(":", $level)[1];
        }

        $returnData["id"] = $levelData[1];
        $returnData["name"] = $levelData[3];
        $returnData["difficulty"] = ((int) $levelData[21])*5 + $levelData[11]/10; // isDemon*10 + weird ass rubrub difficulty thingy/10
        $returnData["cp"] = ((int) $levelData[27] > 0) + ((int) $levelData[29] > 0) + ((int) $levelData[31] > 0);
        break;
    }
    case "userSearch": {
        $userReq = post("https://www.boomlings.com/database/getGJUsers20.php", ["secret"=>"Wmfd2893gb7","str"=>$_GET["userSearch"]], []);
        $playerID = explode(":", $userReq)[3];

        $levelDataReq = post("https://www.boomlings.com/database/getGJLevels21.php", ["secret"=>"Wmfd2893gb7","type"=>5,"str"=>$playerID,"page"=>$_GET["page"]], []);
        if ($levelDataReq == -1) { // No levels found
            http_response_code(404);
            die(-1);
        }
        
        $pageLevels = explode("|", explode("#", $levelDataReq)[0]);
        foreach ($pageLevels as $level) {
            // echo $level;
            if (preg_match(sprintf("/%s/i", $_GET["name"]), $level)) {
                $returnData["author"] = $_GET["userSearch"];
                
                $levelData = explode(":", $level);
                $returnData["id"] = $levelData[1];
                $returnData["name"] = $levelData[3];
                $returnData["difficulty"] = ((int) $levelData[21])*5 + $levelData[11]/10; // isDemon*10 + weird ass rubrub difficulty thingy/10
                $returnData["cp"] = ((int) $levelData[27] > 0) + ((int) $levelData[29] > 0) + ((int) $levelData[31] > 0);
            }
        }
        break;
    }
    case "userDataFetch": {
        $accountIDReq = post("https://www.boomlings.com/database/getGJUsers20.php", ["secret"=>"Wmfd2893gb7","str"=>$_GET["username"]], []);
        if ($accountIDReq == "-1") die("-1");

        $accountIDData = explode(":", $accountIDReq);
        $userReq = post("https://www.boomlings.com/database/getGJUserInfo20.php", ["secret"=>"Wmfd2893gb7","targetAccountID"=>$accountIDData[21]], []);
        $userData = explode(":", $userReq);
        for ($i=0; $i < sizeof($userData); $i++) { 
            array_splice($userData, $i, 1);
        }

        $returnData["username"] = $userData[0];
        $returnData["iconID"] = intval($userData[16]);
        $returnData["color1"] = intval($userData[4]);
        $returnData["color2"] = intval($userData[5]);
        $returnData["glow"] = $userData[6];
        $returnData["socials"] = [];
        $socialIndexes = [0, 1, 2];

        $i = 0;
        foreach ([$userData[15], $userData[30], $userData[31]] as $site) {
            if ($site != "") array_push($returnData["socials"], [$socialIndexes[$i], "/" . $site]);
            $i += 1;
        }
        
        $returnData["stars"] = intval($userData[7]);
        $returnData["demons"] = intval($userData[10]);
        $returnData["cp"] = intval($userData[11]);
    }
}


echo json_encode($returnData);
?>
