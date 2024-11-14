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

function mtch($val) {
    return preg_match("/\d+/", $val);
}

function parseResult($rows, $isReview, $mysqli) {
  // Single list
  $rows["data"] = json_decode(htmlspecialchars_decode($rows["data"]));
  setcookie("lastViewed", $rows["id"], time()+300, "/");

  $listMaker;
  if ($rows["creator"] == "") {
    // Fetch comment amount
    $res = doRequest($mysqli, "SELECT username,discord_id FROM users WHERE discord_id=?", [$rows["uid"]], "s");
    if (array_key_exists("error", $res)) die();

    $listMaker = $users[0]["username"];
  }
  else $listMaker = $rows["creator"];

  echo "<head>";

  if ($isReview) {
    $desc = "Check this review out on GD Lists!";

    if ($rows["thumbnail"]) {
      echo '<meta name="twitter:card" content="summary_large_image">';
      echo '<meta name="twitter:image" content="https://gamingas.cz/userContent/' . $rows["uid"] . '/' . $rows["thumbnail"] . '.webp">';
    }
    else {
      echo '<meta name="twitter:card" content="summary">';
      echo '<meta name="twitter:image" content="https://gamingas.cz/twitImg.webp">';
    }
    echo '<meta name="twitter:title" property="og:title" itemprop="name" content="Review: '. urldecode(htmlspecialchars($rows["name"])) . ' by '.$listMaker.' | GD Lists">';
    echo '<meta name="twitter:description" property="og:description" itemprop="description" content="'.$desc.'">';
    
    echo '<script>window.location.replace("https://gamingas.cz/gdlists/review/' . $_GET["id"] . '")</script>';
  }
  else {
    $desc = "Check these levels out on GD Lists!";

    echo '<meta name="twitter:card" content="summary">';
    echo '<meta name="twitter:image" content="https://gamingas.cz/twitImg.webp">';
    echo '<meta name="twitter:title" property="og:title" itemprop="name" content="'.$rows["name"].' by '.$listMaker.' | GD Lists">';
    echo '<meta name="twitter:description" property="og:description" itemprop="description" content="'.$desc.'">';
    
    echo '<script>window.location.replace("https://gamingas.cz/gdlists/' . $rows["id"] . '")</script>';
  }
  
  echo "</head>";
  
  echo "</head><body></body></html>";
}

function printDefault() {
  echo "<head>";

  echo '<meta name="twitter:card" content="summary">';
  echo '<meta name="twitter:image" content="https://gamingas.cz/twitImg.webp">';
  echo '<meta name="twitter:title" property="og:title" itemprop="name" content="Geometry Dash Level Lists">';
  echo '<meta name="twitter:description" property="og:description" itemprop="description" content="Create and browse lists of GD levels!">';
    
  echo '<script>window.location.replace("https://gamingas.cz/gdlists")</script>';
  
  echo "</head>";
  
  echo "</head><body></body></html>";
}


if (count($_GET) == 2) {
  
  $isReview = false;
  if (isset($_GET["r"]))
    $isReview = boolval(intval($_GET["r"]));
  else printDefault();


  if (isset($_GET["id"])) {

    $mysqli = new mysqli($hostname, $username, $password, $database);
    if ($mysqli->connect_errno) {
      echo "0";
      exit();
    }

    // Public posts
    if (is_numeric($_GET["id"])) {
      if ($isReview)
        $result = doRequest($mysqli, "SELECT * FROM `reviews` WHERE `id` = ?", [intval($_GET["id"])], "i");
      else
        $result = doRequest($mysqli, "SELECT * FROM `lists` WHERE `hidden` = '0' AND `id` = ?", [intval($_GET["id"])], "i");
    }
  
    // Private posts
    if (!is_numeric($_GET["id"])) {
      if ($isReview)
        $result = doRequest($mysqli, "SELECT * FROM `reviews` WHERE `hidden` = ?", [substr($_GET["id"], 0, 10)], "s");
      else
        $result = doRequest($mysqli, "SELECT * FROM `lists` WHERE `hidden` = ?", [substr($_GET["id"], 0, 10)], "s");
      }

    parseResult($result, $isReview, $mysqli);
  }
}
else printDefault();

$mysqli->close();
?>
