<?php
/*
Return codes: 
0 - Connection error
1 - Empty request
2 - Invalid parameters
3 - No results when searching
4 - Invalid listID
*/

require("globals.php");

$isReview = 
$mysqli = new mysqli($hostname, $username, $password, $database);
if ($mysqli->connect_errno) {
  echo "0";
  exit();
}

function mtch($val) {
    return preg_match("/\d+/", $val);
}

function parseResult($rows) {
  global $mysqli;

  // Single list
  $rows["data"] = json_decode(htmlspecialchars_decode($rows["data"]));
  setcookie("lastViewed", $rows["id"], time()+300, "/");

  $listMaker;
  if ($rows["creator"] == "") {
    // Fetch comment amount
    $res = doRequest($mysqli, "SELECT username,discord_id,avatar_hash FROM users WHERE discord_id=?", [$rows["uid"]], "s");
    if (array_key_exists($res, "error")) die();

    $listMaker = $users[0]["username"];
  }
  else $listMaker = $rows["creator"];
  $desc = "Check these levels out on GD Lists!";

  echo "<head>";
  echo '<meta name="twitter:card" content="summary">';
  echo '<meta name="twitter:image" content="http://gamingas.cz/gdlists/images/twitImg.webp">';
  echo '<meta name="twitter:title" property="og:title" itemprop="name" content="'.$rows["name"].' by '.$listMaker.' | GD Lists">';
  echo '<meta name="twitter:description" property="og:description" itemprop="description" content="'.$desc.'">';
  
  echo '<meta name="twitter:card" content="summary_large_image">';
  echo '<meta name="twitter:image" content="http://gamingas.cz/gdlists/images/twitImg.webp">';
  echo '<meta name="twitter:title" property="og:title" itemprop="name" content=Review: "'. $rows["name"].' by '.$listMaker.' | GD Lists">';
  echo '<meta name="twitter:description" property="og:description" itemprop="description" content="'.$desc.'">';
  
  echo '<script>window.location.replace("https://gamingas.cz/gdlists/' . $rows["id"] . '")</script>';
  echo "</head><body></body></html>";
}


if (count($_GET) == 1) {
  

  // Loading a single list
  if (in_array("id", array_keys($_GET))) {
    // Private lists can't be accessed by their id!
    $result = doRequest($mysqli, "SELECT * FROM `lists` WHERE `hidden` = '0' AND `id` = ?", [$_GET["id"]], "s");
    parseResult($result, true);
  } elseif (in_array("pid", array_keys($_GET))) {
    // Private lists
    $result = doRequest($mysqli, "SELECT * FROM `lists` WHERE `hidden`= ?", [$_GET["pid"]], "s");
    parseResult($result);
  }
}
$mysqli->close();
?>
