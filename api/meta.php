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

define('DEFAULT_POST_DESC', 'Check out this post on GD Lists!');

const ENDPOINTS = [
  "/make/list" => [
    'title' => 'List Editor | GD Lists',
    'desc' => 'Create lists of Geometry Dash Levels!'  
  ],
  "/make/review" => [
    'title' => 'Review Editor | GD Lists',
    'desc' => 'Write reviews for Geometry Dash Levels!'  
  ],
  "/browse" => [
    'title' => 'Community Posts | GD Lists',
    'desc' => 'Browse through lists, reviews and levels from Geometry Dash!'  
  ],
  "/saved" => [
    'title' => 'Saved | GD Lists',
    'desc' => 'Browse through your saved levels and collabs!'  
  ],
  "/review" => [
    'title' => 'Geometry Dash Lists',
    'desc' => 'Create and browse lists and reviews of Geometry Dash Levels!'
  ],
  "/" => [
    'title' => 'Geometry Dash Lists',
    'desc' => 'Create and browse lists and reviews of Geometry Dash Levels!'
  ]
];

function getEndpoint() {
  global $debugMode;
  $reqURI = $_SERVER["REQUEST_URI"];
  if ($debugMode && isset($_GET["debug"]))
    $reqURI = $_GET["debug"];

  foreach (ENDPOINTS as $key => $value) {
    if (strstr($reqURI, $key)) {
      $postID = preg_match("/\d+$/", $reqURI, $IDmatches);

      $privpostID = explode("/", $reqURI);
      $privpostID = array_pop($privpostID);
      // WILL NOT WORK FOR CUSTOM URIs
      $isPrivatePost = strlen($privpostID) == 10;
      
      if ($IDmatches || $isPrivatePost) {
        $isReview = $key == '/review';

        $post = getPost($isPrivatePost ? $privpostID : intval($IDmatches[0]), $isReview);
        if (!$post) break;

        $desc;
        if (isset($post["tagline"]) && $post["tagline"])
          $desc = $post["tagline"];
        else
          $desc = DEFAULT_POST_DESC;

        // will not work for old posts
        $decodedData = base64_decode($post["data"], true);
        if (!$decodedData)
          break;

        $lang = isset($post["lang"]) ? $post["lang"] : 'en';

        if ($post["thumbnail"]) {
          $thumb = 'https://gamingas.cz/userContent/' . $post["uid"] . '/' . $post["thumbnail"] . '.webp';
          return makeTags(urldecode(htmlspecialchars_decode($post["name"])) . ' by ' . $post["creator"] . ' | GD Lists', $desc, $thumb, true, $lang);
        }
        else
          return makeTags(urldecode(htmlspecialchars_decode($post["name"])) . ' by ' . $post["creator"] . ' | GD Lists', $desc, lang: $lang);
      }
      else
        return makeTags($value['title'], $value['desc']);

    }
  }
  return makeTags(ENDPOINTS['/']["title"], ENDPOINTS['/']["desc"]);
}

function makeTags($title, $desc, $image = "https://gamingas.cz/gdlists/twitImg.webp", $large_image = false, $content = false, $lang = 'en') {
  $tags = [];

  array_push($tags, $lang);

  if ($large_image)
    array_push($tags, '<meta name="twitter:card" content="summary_large_image">');
  else
    array_push($tags, '<meta name="twitter:card" content="summary">');

  array_push($tags, '<meta name="twitter:title" content="' . $title . '">');
  array_push($tags, '<meta name="twitter:description" content="' . $desc . '">');
  array_push($tags, '<meta name="twitter:image" content="' . $image . '">');

  array_push($tags, '<meta name="og:title" content="' . $title . '">');
  array_push($tags, '<meta name="og:description" content="' . $desc . '">');
  array_push($tags, '<meta name="og:image" content="' . $image . '">');
  array_push($tags, '<meta name="og:url" content="' . $_SERVER["REQUEST_URI"] . '">');
  
  array_push($tags, '<title>' . $title . '</title>');
  array_push($tags, '<meta name="description" content="' . $desc . '">');
  
  // if ($content)
  //   array_push($tags, '<meta name="post" content="' . $content . '">');
  
  return $tags;
}

function getPost($id, $isReview) {
  global $hostname, $username, $password, $database;
  $mysqli = new mysqli($hostname, $username, $password, $database);
  if ($mysqli->connect_errno) {
    echo "0";
    exit();
  }

  // Public posts
  if (is_numeric($id)) {
    if ($isReview)
      $result = doRequest($mysqli, "SELECT * FROM `reviews` WHERE `id` = ?", [$id], "i");
    else
      $result = doRequest($mysqli, "SELECT * FROM `lists` WHERE `hidden` = '0' AND `id` = ?", [$id], "i");
  }

  // Private posts
  if (!is_numeric($id)) {
    if ($isReview)
      $result = doRequest($mysqli, "SELECT * FROM `reviews` WHERE `hidden` = ?", [substr($id, 0, 10)], "s");
    else
      $result = doRequest($mysqli, "SELECT * FROM `lists` WHERE `hidden` = ?", [substr($id, 0, 10)], "s");
    }

  if (!$result) {
    return false;
  }

  if ($result["creator"] == "") {
    // Fetch comment amount
    $res = doRequest($mysqli, "SELECT username FROM users WHERE discord_id=?", [$result["uid"]], "s");
    if (array_key_exists("error", $res)) die();

    $result["creator"] = $res["username"];
  }
  else $result["creator"] = $result["creator"];

  $mysqli->close();
  return $result;
}

getEndpoint();

?>
