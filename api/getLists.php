<?php
/*
Return codes:
0 - Connection error
1 - Empty request
2 - Invalid parameters
3 - No results when searching
4 - Invalid listID
*/

header("Content-Type: application/json"); // Return as JSON
require("globals.php");

$mysqli = new mysqli($hostname, $username, $password, $database);
if ($mysqli->connect_errno) {
  echo "0";
  exit();
}
$mysqli->set_charset("utf8mb4");

$selRange = "creator, name, lists.id, timestamp, hidden, lists.uid, views, diffGuesser";
$selReviewRange = "name, reviews.uid, timestamp, reviews.id, views, hidden, thumbnail, tagline, thumbProps";

$selLevelRange = "
      levelName,
      creator,
      collabMemberCount,
      levels.levelID,
      levels.difficulty,
      rating,
      platformer,
      CONCAT('#',color) as color,
      background,
      uploaderID,
      ifnull(listID, concat('review/', (SELECT reviews.id FROM reviews WHERE id=levels_uploaders.reviewID))) as listID,
      avg(gameplay) as A_gameplay,
      avg(decoration) as A_decoration,
      avg(levels_ratings.difficulty) as A_difficulty,
      avg(overall) as A_overall";

$listRatings = "ifnull(sum(rate*2-1), 0) AS rate_ratio";
$reviewRatings = "ifnull(ifnull(sum(rate), 0) / ifnull(count(rate), 1), -1) AS rate_ratio";

function makeIN($arr) {
  return [
    "(" . substr(str_repeat("?,", sizeof($arr)), 0, sizeof($arr)*2-1) . ")",
    str_repeat("s", sizeof($arr))
  ];
}

function parseResult($rows, $singleList = false, $maxpage = -1, $search = "", $page = 0, $review = false) {
  global $mysqli;
  $ind = 0;
  $ratings = [];
  $dbInfo = [];
  $uid_array = array();
  $reviewDetails = [];
  $users = [];
  if (!$singleList) {
    // No results when searching / No lists to load
    if (count($rows) == 0) {
      die("3");
    }

    $allIDs = [];
    if (isset($rows[0]["uid"])) {
      foreach ($rows as $row) {
        array_push($uid_array, $row["uid"]);
        array_push($allIDs, $row["id"]);

        $ind += 1;
      }

      if ($review) {
        $idqm = makeIN($allIDs);
        $reviewDetails = doRequest($mysqli, sprintf("SELECT
                                            reviewID,
                                            count(reviewID) AS level_count,
                                            ifnull(avg(gameplay), 1) AS gameplay,
                                            avg(decoration) AS decoration,
                                            avg(difficulty) AS difficulty,
                                            avg(overall) AS overall
                                            FROM levels_ratings
                                            WHERE reviewID IN %s
                                            GROUP BY reviewID", $idqm[0]), $allIDs, $idqm[1], true);
      }

      $qqm = makeIN($uid_array);
      $users = doRequest($mysqli, sprintf("SELECT DISTINCT username,discord_id,pfp_cutout
                        FROM users
                        LEFT JOIN profiles ON users.discord_id = profiles.uid
                        WHERE discord_id IN %s", $qqm[0]), $uid_array, $qqm[1], true);
    }

    $dbInfo["maxPage"] = $maxpage;
    $dbInfo["startID"] = isset($rows[0]["id"]) ? $rows[0]["id"] : $rows[0]["levelID"];
    $dbInfo["searchQuery"] = $search;
    $dbInfo["page"] = $page;
    $dbInfo["path"] = $_SERVER["SCRIPT_NAME"];

  } else {
    // Single list
    $decoded = base64_decode($rows["data"], true);
    if ($decoded) {
      $rows["data"] = json_decode(htmlspecialchars_decode(gzuncompress($decoded)));
    } else {
      $rows["data"] = json_decode(htmlspecialchars_decode($rows["data"]));
    }

    if (isset($_COOKIE["lastViewed"]) && $_COOKIE["lastViewed"] != $rows["id"]) {
      doRequest($mysqli, sprintf("UPDATE %s SET views = views+1 WHERE id=?", $review ? "reviews" : "lists"), [$rows["id"]], "i");
      $rows["views"] += 1;
    }
    setcookie("lastViewed", $rows["id"], time()+300, "/");

    // Fetch comment amount
    $commAmount = doRequest($mysqli, sprintf("SELECT COUNT(*) FROM comments WHERE %s = ?", $review ? "reviewID" : "listID"), [list_id($rows)], "s");
    $rows["commAmount"] = $commAmount["COUNT(*)"];
    $users = doRequest($mysqli, "SELECT username,discord_id,pfp_cutout FROM users LEFT JOIN profiles ON users.discord_id = profiles.uid WHERE discord_id=?", [$rows["uid"]], "s");

    // Fetch ratings
    $ratings = getRatings($mysqli, getLocalUserID(), $review ? "review_id" : "list_id", $rows["id"], $review);
  }

  return array($rows, $users, $dbInfo, $ratings, $reviewDetails);
}

if (count($_GET) <= 2 && !isset($_GET["batch"])) {
  // Loading a single list
  if (in_array("id", array_keys($_GET))) {
    // Private lists can't be accessed by their id!
    $result = doRequest($mysqli, "SELECT * FROM `lists` WHERE `hidden` = '0' AND `id` = ?", [$_GET["id"]], "s");
    if ($result == null) {
      echo "2";
    } else {
      echo json_encode(parseResult($result, true));
    }
  } elseif (in_array("review", array_keys($_GET))) {
    // Reviews
    $result;
    if ($_GET["hidden"])
      $result = doRequest($mysqli, "SELECT * FROM `reviews` WHERE `hidden` = ?", [$_GET["review"]], "s");
    else
      $result = doRequest($mysqli, "SELECT * FROM `reviews` WHERE `hidden` = 0 AND `id` = ?", [$_GET["review"]], "s");

    if ($result == null) echo "2";
    else echo json_encode(parseResult($result, true, -1, "", 0, true));
  }
   elseif (in_array("pid", array_keys($_GET))) {
    // Private lists
    $result = doRequest($mysqli, "SELECT * FROM `lists` WHERE `hidden`= ?", [$_GET["pid"]], "s");

    if ($result == null) {
      echo "2";
    } // When the pID is invalid
    else {
      echo json_encode(parseResult($result, true));
    }
  } elseif (in_array("random", array_keys($_GET))) {
    // Picking a random list or review
    $randType = $_GET["random"] == 0 ? "lists" : "reviews";
    $result = doRequest($mysqli, sprintf("SELECT * FROM `%s` WHERE `hidden` LIKE 0 ORDER BY RAND() LIMIT ?", $randType), [1], "i");
    echo json_encode(parseResult($result, true, -1, "", 0, $randType == "reviews"));

  } elseif (in_array("randomLevel", array_keys($_GET))) {
    // Picking a random list or review
    $result = doRequest($mysqli, sprintf("SELECT levelName,creator,levels.levelID,difficulty,rating FROM levels_uploaders INNER JOIN levels ON levels.levelID = levels_uploaders.levelID ORDER BY RAND() LIMIT ?", $selLevelRange), [1], "i");
    echo json_encode(parseResult($result));

  } elseif (in_array("homepage", array_keys($_GET))) {
    if ($_GET["homepage"] == 1) $result = $mysqli->query(sprintf("SELECT %s,ifnull(sum(rate*2-1), 0) AS rate_ratio FROM `lists` LEFT JOIN `ratings` ON lists.id = ratings.list_id WHERE `hidden` = '0' GROUP BY `name` ORDER BY lists.id DESC LIMIT 3", $selRange));
    else $result = $mysqli->query(sprintf("SELECT %s,ifnull(ifnull(sum(rate), 0) / ifnull(count(rate), 1), -1) AS rate_ratio FROM `reviews` LEFT JOIN `ratings` ON reviews.id = ratings.review_id WHERE `hidden` = '0' GROUP BY `name` ORDER BY reviews.id DESC LIMIT 3", $selReviewRange));
     
    echo json_encode(parseResult($result->fetch_all(MYSQLI_ASSOC), false, -1, "", 0, $_GET["homepage"] == 2));

  } elseif (!empty(array_intersect(["homeUser"], array_keys($_GET)))) {
    $account = checkAccount($mysqli);
    if (!$account) die("[]"); // Not logged in
    $result = $mysqli->query(sprintf("SELECT %s,ifnull(sum(rate*2-1), 0) AS rate_ratio FROM `lists` LEFT JOIN `ratings` ON lists.id = ratings.list_id WHERE lists.uid=%s AND `hidden` LIKE 0 GROUP BY `name` ORDER BY lists.id DESC LIMIT 3", $selRange, $account["id"]));
    echo json_encode(parseResult($result->fetch_all(MYSQLI_ASSOC)));

  } elseif (in_array("levelsIn", array_keys($_GET))) {
    if (!intval($_GET["levelsIn"])) die("2");
    $type = $_GET["fromReviews"] ? "reviewID" : "listID";
    $result = doRequest($mysqli, sprintf("SELECT levels_uploaders.id,levels.levelID,listID,reviewID,levelName,creator,difficulty,rating FROM levels_uploaders RIGHT JOIN levels ON levels_uploaders.levelID = levels.levelID  WHERE %s = ?", $type), [$_GET["levelsIn"]], "i", true);
    echo json_encode(parseResult($result));
  } elseif (in_array("postsInLevel", array_keys($_GET))) {
    $id = intval(substr($_GET["levelID"],0, 11));

    $result = doRequest($mysqli, "SELECT lists.name, users.username, lists.uid, timestamp, 0 as type, lists.id
    FROM levels_uploaders
    RIGHT JOIN lists ON lists.id = levels_uploaders.listID
    LEFT JOIN users ON lists.uid=users.discord_id
    WHERE levels_uploaders.levelID = ?
    UNION ALL SELECT reviews.name, users.username, reviews.uid, UNIX_TIMESTAMP(timestamp) as timestamp, 1 as type,reviews.id
    FROM levels_uploaders
    RIGHT JOIN reviews ON reviews.id = levels_uploaders.reviewID
    LEFT JOIN users ON reviews.uid=users.discord_id
    WHERE levels_uploaders.levelID = ?
    ORDER BY timestamp DESC LIMIT 10", [$id, $id], "ii", true);

    echo json_encode($result);
  }
}
elseif (isset($_GET["batch"])) {
  $types = ["lists", "reviews", "levels"];
  $postData = [[],[],[]];
  for ($type=0; $type < 3; $type++) {
    if (!isset($_GET[$types[$type]])) continue;
    if (!strlen($_GET[$types[$type]])) continue;

    $ratings = [$listRatings, $reviewRatings][$type];
    $range = [$selRange, $selReviewRange, $selLevelRange][$type];

    $fetchIDs = array_slice(explode(",", $_GET[$types[$type]]), 0, 20);
    $in = makeIN($fetchIDs);
    $res;

    if ($type == 2) {
      $res = doRequest($mysqli, sprintf("SELECT %s FROM levels_uploaders
      INNER JOIN levels ON levels.levelID = levels_uploaders.levelID
      LEFT JOIN levels_ratings ON levels_ratings.levelID = levels_uploaders.levelID
      WHERE levels.levelID IN %s
      GROUP BY levels_uploaders.levelID
      ", $range, $in[0]), $fetchIDs, $in[1], true);
    }
    else {
      $res = doRequest($mysqli, sprintf("SELECT %s, %s FROM ratings
      RIGHT JOIN %s ON %s.id = ratings.%s_id
      WHERE %s.id IN %s AND `hidden`=0
      GROUP BY `name`
      ", $range, $ratings, $types[$type], $types[$type], substr($types[$type], 0, -1), $types[$type], $in[0]), $fetchIDs, $in[1], true);
    }
    $postData[$type] = parseResult($res, false, -1, "", 0, $type == 1);
  }
  echo json_encode($postData);
}
else {
  // --- Loading all lists ---

  // Are values numbers?
  if (!is_numeric($_GET["page"]) &&
      !is_numeric($_GET["startID"]) &&
      !is_numeric($_GET["sort"]) &&
      !is_numeric($_GET["fetchAmount"])) {
    die("1");
  }

  $addReq = "";
  $showHidden = "`hidden` = '0' AND";

  // Request type
  $type;
  if (isset($_GET["type"])) {
    switch ($_GET["type"]) {
      case 'lists':
        $type = "lists"; break;
      case 'reviews':
        $type = "reviews"; break;
      case 'levels':
        $type = "levels"; break;

      default: die("-2");
    }
  }

  // Split ratings if neccessary
  $ratings = $type == 'lists' ? $listRatings : $reviewRatings;

  // User/Private objects
  if (isset($_GET["user"])) {
    if (!getAuthorization()) die();
    $user = checkAccount($mysqli)["id"];
    $addReq = "AND " . $type . ".uid=" . $user . " AND `hidden` LIKE 0";
  }
  if (isset($_GET["hidden"])) {
    if (!getAuthorization()) die();
    $user = checkAccount($mysqli)["id"];
    $addReq = "AND " . $type . ".uid=" . $user;
    $showHidden = "";
  }

  $range = [$selRange, $selReviewRange][$type != "reviews" ? 0 : 1];

  // How many list should be fetched and the offset (page)
  $dbSlice = clamp(intval($_GET["fetchAmount"]), 2, 15) * intval($_GET["page"]);

  // 0 = descending, 1 = ascending
  $sorting = intval($_GET["sort"]) == 0 ? "DESC" : "ASC";

  // Lists/Reviews
  $maxpageQuery;
  if ($type != "levels") {
    $query = sprintf("SELECT %s, %s FROM ratings
      RIGHT JOIN %s ON %s.id = ratings.%s_id
      WHERE %s %s.id<=? AND `name` LIKE ? %s
      GROUP BY `name`
      ORDER BY hidden DESC, id DESC
      LIMIT %s
      OFFSET %s", $range, $ratings, $type, $type, substr($type, 0, -1), $showHidden, $type, $addReq, clamp(intval($_GET["fetchAmount"]), 2, 50), $dbSlice);
    $maxpageQuery = doRequest($mysqli, sprintf("SELECT COUNT(*) as amount FROM %s WHERE %s `name` LIKE '%%%s%%' AND `id`<=? %s", $type, $showHidden, $_GET["searchQuery"], $addReq), [$_GET['startID']], "i");
  }
  else {
    $query = sprintf("SELECT %s, count(levels_uploaders.reviewID) as inReviews, count(levels_uploaders.listID) as inLists FROM levels_uploaders
      INNER JOIN levels ON levels.levelID = levels_uploaders.levelID
      LEFT JOIN levels_ratings ON levels_ratings.levelID = levels_uploaders.levelID
      WHERE levels_uploaders.id<=? AND `levelName` LIKE ?
      GROUP BY levels_uploaders.levelID
      ORDER BY levels.id DESC
      LIMIT %s
      OFFSET %s", $selLevelRange, clamp(intval($_GET["fetchAmount"]), 2, 15), $dbSlice);
    $maxpageQuery = doRequest($mysqli, sprintf("SELECT COUNT(*) as amount FROM levels WHERE `levelName` LIKE '%%%s%%' AND levels.id<=?", $_GET["searchQuery"]), [$_GET['startID']], "i");
  }

  $maxpage = ceil($maxpageQuery["amount"] / clamp(intval($_GET["fetchAmount"]), 2, 15));

  $result = doRequest($mysqli, $query, [$_GET["startID"], "%".$_GET["searchQuery"]."%"], "is", true);
  echo json_encode(parseResult($result, false, $maxpage, $_GET["searchQuery"], $_GET["page"], $type == "reviews"));
}

$mysqli->close();
