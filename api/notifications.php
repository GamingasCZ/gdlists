<?php
/*
Return codes:
*/
header('Content-type: application/json'); // Return as JSON
require_once("globals.php");

const SORT_METHODS = ["`time` DESC", "`time` ASC"];

function createNotification($mysqli, $from, $to, $type, $postType, $objectID, $otherID = null) {
    // type: 0 - comment, 1 - rating, 2 - other
    // postType: 1 - list, 2 - review, 3 - other
    if ($from == $to) return; // Do not send notifications to yourself

    $res = doRequest($mysqli,
              "INSERT INTO `notifications`(`to_user`, `from_user`, `type`, `postType`, `objectID`, `otherID`) VALUES (?,?,?,?,?,?)",
              [$to, $from, $type, $postType, $objectID, $otherID],
              "ssiiii");
}

function deleteNotification($mysqli, $toUID, $postType, $objectID) {
    $res = doRequest($mysqli,
              "DELETE FROM `notifications` WHERE `unread`=1 AND `to_user`=? AND `type`=? AND `objectID`=?",
              [$toUID, $postType, $objectID], "sii");
}

if (basename(__FILE__) == basename($_SERVER["SCRIPT_FILENAME"])) {
    $mysqli = new mysqli($hostname, $username, $password, $database);
    if ($mysqli -> connect_errno) {
        die("0");
    };
    $mysqli->set_charset("utf8mb4");

    $acc = checkAccount($mysqli);
    if (!$acc) die("0");

    $method = $_SERVER["REQUEST_METHOD"];
    switch ($method) {
        case 'GET':
            if (isset($_GET["ratings"])) {
                $notifs = doRequest($mysqli, "SELECT `username`, `discord_id`, max(`time`) as `time`, `type`
                    FROM `notifications`
                    LEFT JOIN `users` ON notifications.from_user = users.discord_id
                    WHERE `to_user`=? AND `objectID`=? AND `postType`=? AND `type`='rating'
                    GROUP BY discord_id
                    ORDER BY `time` DESC", [$acc["id"], intval($_GET["id"]), intval($_GET["postType"]), 1+intval($_GET["page"])*5], "siii", true);

                die(json_encode([$notifs, sizeof($notifs) < 5]));
            }

            $unreadCount = doRequest($mysqli, "SELECT count(unread) as 'c' FROM `notifications` WHERE `to_user`=? AND `unread`=1", [$acc["id"]], "s")["c"];
            $sorting = isset($_GET["sort"]) ? min(max(0, intval($_GET["sort"])), 2) : 0;
            $type = isset($_GET["type"]) ? min(max(-1, intval($_GET["type"])), 2) : -1;

            $ratings = function($sort) {return sprintf("SELECT tFrom.username as 'from', tTo.username as 'to', `from_user`, `id`, `type`, max(`unread`) as `unread`, max(`time`) as `time`, `postType`, `objectID`, `otherID`, `comment`,count(objectID) as `count`
                FROM `notifications` n
                LEFT JOIN `users` tTo on n.to_user = tTo.discord_id
                LEFT JOIN `users` tFrom on n.from_user = tFrom.discord_id
                LEFT JOIN `comments` on otherID = comments.comID
                WHERE `to_user`=? AND `type`='rating'
                GROUP BY objectID
                ORDER BY %s", $sort);};

            $comments = function($sort) {return sprintf("SELECT tFrom.username as 'from', tTo.username as 'to', `from_user`, `id`, `type`, `unread`, `time`, `postType`, `objectID`, `otherID`, `comment`,1 as `count`
                FROM `notifications` n
                LEFT JOIN `users` tTo on n.to_user = tTo.discord_id
                LEFT JOIN `users` tFrom on n.from_user = tFrom.discord_id
                LEFT JOIN `comments` on otherID = comments.comID
                WHERE `to_user`=? AND `type`='comment'
                ORDER BY %s", $sort);};

            $other = function($sort) {return sprintf("SELECT tFrom.username as 'from', tTo.username as 'to', `from_user`, `id`, `type`, `unread`, `time`, `postType`, `objectID`, `otherID`, `comment`,1 as `count`
                FROM `notifications` n
                LEFT JOIN `users` tTo on n.to_user = tTo.discord_id
                LEFT JOIN `users` tFrom on n.from_user = tFrom.discord_id
                LEFT JOIN `comments` on otherID = comments.comID
                WHERE `to_user`=? AND `type`='other'
                ORDER BY %s", $sort);};

            switch ($type) {
                case 0: //ratings
                    $notifs = doRequest($mysqli, $ratings(SORT_METHODS[$sorting]), [$acc["id"]], "s", true);
                    break;
                case 1: //comments
                    $notifs = doRequest($mysqli, $comments(SORT_METHODS[$sorting]), [$acc["id"]], "s", true);
                    break;
                case 2: // other
                    $notifs = doRequest($mysqli, $other(SORT_METHODS[$sorting]), [$acc["id"]], "s", true);
                    break;
                default: // none
                    $notifs = doRequest($mysqli, sprintf("SELECT * FROM (%s) t UNION ALL SELECT * FROM (%s) t1 ORDER BY %s", $ratings(SORT_METHODS[0]), $comments(SORT_METHODS[0]), SORT_METHODS[$sorting]), [$acc["id"], $acc["id"]], "ss", true);
            }

            $postIDs = [[0], [0]];
            foreach ($notifs as $n) {
                array_push($postIDs[intval($n["postType"] == 'review')], $n["objectID"]);
            }
            
            $postNames = doRequest($mysqli,
            sprintf("SELECT `name`,`id`, '0' as type
            FROM lists where id in (%s)
            UNION SELECT name,id,1
            FROM reviews WHERE id in (%s)", implode(",", $postIDs[0]), implode(",", $postIDs[1])), [], "", true);

            // doRequest($mysqli, "UPDATE `notifications` SET `unread`=0
            // WHERE `unread`=1 AND `to_user`=?", [$acc["id"]], "s");

            echo json_encode([$notifs, $postNames, $unreadCount]);
            break;
        case 'DELETE':
            doRequest($mysqli, "DELETE FROM `notifications` WHERE `to_user`=?", [$acc["id"]], "s");
            break;
        default:
            die("-1");
            break;
    }

}

?>
