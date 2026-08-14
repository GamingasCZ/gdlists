<?php
/*
Return codes:
0 - Account/Database error
1 - No new notifications
2 - End of notifications
*/
header('Content-type: application/json'); // Return as JSON
require_once("globals.php");
require_once("groups.php");

$SORT_METHODS = ["`time` DESC", "`time` ASC"];
$NOTIFS_PER_REQ = 10;

function createNotification($mysqli, $from, $to, $type, $postType, $objectID, $otherID = null) {
    // type: 1 - comment, 2 - rating, 3 - other, 4 - watch
    // postType: 1 - list, 2 - review, 3 - other
    if ($from == $to) return; // Do not send notifications to yourself

    $res = doRequest($mysqli,
              "INSERT INTO `notifications`(`to_group`, `from_user`, `type`, `postType`, `objectID`, `otherID`) VALUES (?,?,?,?,?,?)",
              [group_exists($mysqli, $to), $from, $type, $postType, $objectID, $otherID],
              "ssiiii");
}

function deleteNotification($mysqli, $toUID, $postType, $objectID) {
    $res = doRequest($mysqli,
              "DELETE FROM `notifications` WHERE `to_user`=? AND `type`=? AND `objectID`=?",
              [$toUID, $postType, $objectID], "sii");
}

function getUnread($mysqli, $user) {
    $res = doRequest($mysqli,
       "SELECT count(`id`) AS 'amount_unread' FROM
            (SELECT notifications.`id` FROM notifications
            RIGHT JOIN `groups` ON notifications.to_group=groups.id
            RIGHT JOIN (SELECT * FROM `group_members` WHERE `user`='$user') t ON groups.id=t.group_id) t2
        LEFT JOIN `read_notifications` ON t2.id=`read_notifications`.`notif_id`
        WHERE `notif_id` IS NULL AND NOT `id` IS NULL", [], "");
    return $res; // TODO
}

// -- group creators --

// sends to an individual only
function group_single_user($to) {
    return 'u' . strval($to);
}

// sends to absolutely everyone
function group_all() {
    return 'all';
}

// sends to people, following the same post
function group_post_follow($isList, $postID) {
    $type = $isList ? 'l' : 'r';
    return "fol$type$postID";
}

// -- the supercalifragilisticexpialidocious end of group functions

function mark_notifs_read($mysqli, $user, $notif_ids, $all = false) {
    if ($all) {
        doRequest($mysqli,
       "INSERT INTO `read_notifications`(`notif_id`, `user`)
        SELECT `id` AS 'notif_id','$user' as 'user' FROM
            (SELECT notifications.`id` FROM notifications
            RIGHT JOIN `groups` ON notifications.to_group=groups.id
            RIGHT JOIN (SELECT * FROM `group_members` WHERE `user`='$user') t ON (groups.id=t.group_id OR groups.id=0)) t2
        LEFT JOIN `read_notifications` ON t2.id=`read_notifications`.`notif_id` AND `user`='$user'
        WHERE `notif_id` IS NULL AND NOT `id` IS NULL", [], "");
    }
    else { // only selected notifs
        $in = makeIN($notif_ids);
        doRequest($mysqli,
       "INSERT INTO `read_notifications`(`notif_id`, `user`)
        SELECT `id` AS 'notif_id','$user' as 'user' FROM
            (SELECT notifications.`id` FROM notifications
            RIGHT JOIN `groups` ON notifications.to_group=groups.id
            RIGHT JOIN (SELECT * FROM `group_members` WHERE `user`='$user') t ON (groups.id=t.group_id OR groups.id=0)) t2
        LEFT JOIN `read_notifications` ON t2.id=`read_notifications`.`notif_id` AND `user`='$user'
        WHERE `notif_id` IS NULL AND `id` IN $in[0]", $notif_ids, $in[1]);
    }
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
            if (isset($_GET["ratings"])) { // TODO: fix
                $uid = $acc["id"];
                $notifs = doRequest($mysqli, 
                   "SELECT `username`,`discord_id`, `time`, `type` FROM `notifications`
                    LEFT JOIN `groups` ON groups.id=notifications.to_group
                    INNER JOIN `group_members` ON group_members.`group_id`=groups.id AND `group_members`.user='$uid'
                    LEFT JOIN `users` ON notifications.from_user = users.discord_id

                    WHERE `objectID`=? AND `postType`=? AND `type`='rating'
                    GROUP BY discord_id
                    ORDER BY `time` DESC
                    LIMIT 5 OFFSET ?;", [intval($_GET["id"]), intval($_GET["postType"]), 1+intval($_GET["page"])*5], "iii", true);

                die(json_encode([$notifs, sizeof($notifs) < 5]));
            }

            $unreadCount = getUnread($mysqli, $acc["id"]);
            if (isset($_GET["np"])) {
                echo $unreadCount["amount_unread"];
                die();
            }
            
            $sorting = isset($_GET["sort"]) ? min(max(0, intval($_GET["sort"])), 2) : 0;
            $type = isset($_GET["type"]) ? min(max(-1, intval($_GET["type"])), 3) : -1;
            $page = intval($_GET["page"]);
            $typeStr = $type == -1 ? '' : sprintf('AND `type`=%s', ["'rating'", "'comment'", "'other'", "'watch'"][$type]);

            $filters = ["rating", "comment", "other", "follows"];
            $filterQuery = $type == -1 ? '' : "WHERE `type`=$filters[$type]";

            $offset = $NOTIFS_PER_REQ*$page;
            
            // this might be even worse, than the old query D:
            $notifs = doRequest($mysqli,
           "SELECT * FROM (
            SELECT 
                *,
                ROW_NUMBER() OVER (PARTITION BY objectID ORDER BY time DESC) as rn,
	            COUNT(*) OVER (PARTITION BY objectID) as comment
            FROM (
                SELECT
                    tFrom.username as 'from', tTo.username as 'to', `to_group`,`from_user`, n.`id`, `type`, `time`, `postType`, `objectID`, `otherID`, rN.notif_id IS NULL as 'unread'
                FROM `notifications` n
                LEFT JOIN `groups` ON groups.id=n.to_group
                RIGHT JOIN (SELECT * FROM `group_members` WHERE `user`=?) t ON (groups.id=t.group_id OR (groups.id=0))

                LEFT JOIN `users` tFrom ON n.from_user=tFrom.discord_id
                LEFT JOIN `users` tTo ON t.user=tTo.discord_id
                LEFT JOIN `read_notifications` rN ON n.id=rN.notif_id
                WHERE `type`='rating' AND NOT n.id IS NULL $typeStr
                ) t3
            ) ranked
            WHERE rn = 1
            
            UNION
            
            SELECT
                tFrom.username as 'from',
                tTo.username as 'to', `to_group`,
                `from_user`, n.`id`, `type`, `time`, `postType`, `objectID`, `otherID`, rN.notif_id IS NULL as 'unread', 1 as rn,
                (CASE
                    WHEN `type`='comment' THEN (SELECT `comment` FROM `comments` WHERE `comID`=otherID)
                    WHEN `type`='watch' THEN (SELECT `messsage` FROM `update_messages` WHERE `id`=otherID)
                    ELSE NULL
                END) as 'comment'

            FROM `notifications` n
            LEFT JOIN `groups` ON groups.id=n.to_group
            RIGHT JOIN (SELECT * FROM `group_members` WHERE `user`=?) t ON (groups.id=t.group_id OR (groups.id=0))

            LEFT JOIN `users` tFrom ON n.from_user=tFrom.discord_id
            LEFT JOIN `users` tTo ON t.user=tTo.discord_id
            LEFT JOIN `read_notifications` rN ON n.id=rN.notif_id
            WHERE NOT n.id IS NULL
                AND NOT `type`='rating' $typeStr
            
            ORDER BY $SORT_METHODS[$sorting]
            LIMIT 10
            OFFSET $offset
            
            ", [$acc["id"], $acc["id"]], "ss", true);

            // Check if there are more notifs. Sadly not too effective.
            if (sizeof($notifs) < $NOTIFS_PER_REQ)
                $unreadCount["lastPage"] = true;

            $notifIDs = [];
            $postIDs = [[0], [0]];
            $i = 0;
            foreach ($notifs as $n) {
                array_push($notifIDs, $n["id"]);
                array_push($postIDs[intval($n["postType"] == 'review')], $n["objectID"]);
                $i += 1;
            }
            
            $postNames = doRequest($mysqli,
            sprintf("SELECT `name`,`id`, '0' as type
            FROM lists where id in (%s)
            UNION SELECT name,id,1
            FROM reviews WHERE id in (%s)", implode(",", $postIDs[0]), implode(",", $postIDs[1])), [], "", true);

            mark_notifs_read($mysqli, $acc["id"], $notifIDs);

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
