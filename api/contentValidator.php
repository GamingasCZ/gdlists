<?php
$COMMON_KEYS = ["description", "pageBGcolor", "titleImg", "levels"];

$LIST_KEYS = ["diffGuesser", "translucent", "platf"];
$REVIEW_KEYS = ["reviewName", "thumbnail", "tagline", "containers", "ratings", "settings", "private", "transparentPage", "language", "whitePage", "readerMode", "font"];
$LEVEL_KEYS = ["levelName", "creator", "color", "levelID", "video", "difficulty", "tags"];

$LEVEL_PROP_LEN = [
    "ID" => [0, 10],
    "NAME" => [1, 21],
    "CREATOR" => [1, 16],
    "VIDEO" => [0, 51],
    "TAG_COUNT" => [0, 27],
    "TAGNAME" => [0, 21],
    "TAGLINK" => [0, 101]
];

function commonChecks($name, $data) {
    if (strlen($name) < 3 || strlen($name) > 40)
        return doError(-1, -1, 1);
    
    if (!is_array($data))
        return doError(-1, -1, 2);
    
    $size = strlen(json_encode($data));
    if ($size > 25000 || $size < 100)
        return doError(-1, -1, 3);
}

function checkLevels($levels) {
    // Checking level key lengths
    // $lens = [$NAME_LEN, 0, count($LEVELCOLOR_TYPE), $ID_LEN, $VIDEO_LEN, 0, 0]; // corresponds to LEVEL_KEYS
    // $types = [0, 0, $LEVELCOLOR_TYPE, 0, 0, $DIFF_TYPE, $TAG_TYPE];
    // foreach ($levels as $level) {
    //     $i = 0;
    //     foreach ($LEVEL_KEYS as $key) {
    //         if (is_array($lens[$i])) { // Range
    //             if (!validLenght($level[$key], $lens[$i][0], $lens[$i][1])) return doError(31, $key, true);
    //         }
    //         elseif ($lens[$i] === 0) {$i += 1; continue;} // Do not check
    //         else { // Exact lenght
    //             if (!validLenght($level[$key], $lens[$i], $lens[$i]+1)) return doError(32, $key, true);
    //         }
    //         if (!validType($level[$key], $LEVELKEY_TYPE[$i], $types[$i])) return doError(33, $key, false);
    //         $i += 1;
    //     }

    //     // Creator
    //     if (is_string($level[$LEVEL_KEYS[1]])) {
    //         if (!validLenght($level[$LEVEL_KEYS[1]], $CREATOR_LEN[0], $CREATOR_LEN[1])) return doError(4, 0, true);
    //     }
    //     // else TODO collabs

    //     // Difficulties
    //     if (!validLenght($level[$LEVEL_KEYS[5]][0], $DIFF_RANGE[0], $DIFF_RANGE[1])) return doError(51, 0, true);
    //     if (!validLenght($level[$LEVEL_KEYS[5]][1], $RATE_RANGE[0], $RATE_RANGE[1])) return doError(52, 1, true);

    //     // Tags
    //     foreach ($level["tags"] as $tag) {
    //         if (!validLenght($tag[0], $TAG_COUNT[0], $TAG_COUNT[1])) return doError(61, 0, true);
    //         if (!validLenght((string) $tag[1], $TAGNAME_LEN[0], $TAGNAME_LEN[1])) doError(62, 1, true);
    //         if (!validLenght($tag[2], $TAGLINK_LEN[0], $TAGLINK_LEN[1])) doError(63, 2, true);
    //     }
    // }
}

function checkList($name, $list) {
    commonChecks($name, $list);
    
    // $DIFF_RANGE = [0, 12];
    // $RATE_RANGE = [0, 4];

    // $LEVEL_RANGE = [1, 50];
    // $DESCRIPTION_RANGE = [0, 3000];
    
    // // Data types
    // /*
    // n = number    s = string    b = boolean    l = array    a = any
    // */
    // $LISTKEY_TYPE = ["s","l","l","l","b","l"];
    // $LEVELKEY_TYPE = ["s", "a", "l", "s","s","l","l"];

    // $TAG_TYPE = ["n","a","s"];
    // $LISTBG_TYPE = ["s", "n", "a", "n", "b"];
    // $DIFFGUESSER_TYPE = ["b", "b", "b"];
    // $PAGEBGCOLOR_TYPE = ["n", "n", "n"];
    // $TRANSLUCENT_TYPE = ["b"];
    // $DESCRIPTION_TYPE = ["s"];
    
    // $LEVELCOLOR_TYPE = ["n", "n", "n"];
    // $DIFF_TYPE = ["n", "n"];

    // // Checking list key lengths
    // $lens = [$DESCRIPTION_RANGE, count($PAGEBGCOLOR_TYPE), count($DIFFGUESSER_TYPE), count($LISTBG_TYPE), 0, $LEVEL_RANGE]; // corresponds to LIST_KEYS
    // $types = [$DESCRIPTION_TYPE, $PAGEBGCOLOR_TYPE, $DIFFGUESSER_TYPE, $LISTBG_TYPE, $TRANSLUCENT_TYPE, 0];
    // $i = 0;
    // foreach ($LIST_KEYS as $key) {
    //     if (is_array($lens[$i])) { // Range
    //         if (!validLenght($data[$LIST_KEYS[$i]], $lens[$i][0], $lens[$i][1])) return doError(21, $i, true);
    //     }
    //     elseif ($lens[$i] === 0) continue; // Do not check
    //     else { // Exact lenght
    //         if (!validLenght($data[$LIST_KEYS[$i]], $lens[$i], $lens[$i]+1)) return doError(22, $i, true);
    //     }
    //     if (!validType($data[$LIST_KEYS[$i]], $LISTKEY_TYPE[$i], $types[$i])) return doError("203".json_encode($data[$LIST_KEYS[$i]]), $i, false);
    //     $i += 1;
    // }

    // checkLevels();

    return checkReview($name, $list);
}

function checkReview($name, $review) {
    commonChecks($name, $review);

    // Valid thumbnail
    if ($review["thumbnail"][0] != "" && strlen($review["thumbnail"][0]) != 40) return doError(-1, -1, 4);

    $thumbProps = json_encode(array_slice($review["thumbnail"], 1));

    $thumb = $review["thumbnail"][0];
    if (!strlen($thumb)) $thumb = null;

    return ["thumb" => $thumb, "thumbProps" => $thumbProps]; 
}

function doError($section, $index, $lengthCheck) {
    return sprintf("sec: %s, lev: %s %s", $section, $index, is_null($lengthCheck) ? "null" : ["typ","del"][intval($lengthCheck)]);
}

function validType($value, $type, $subCheck = []) {
    if ($type == 0) return true;
    
    $valid = true;
    switch ($type) {
        case 'n': $valid = is_float($value) || is_integer($value); break;
        case 's': $valid = is_string($value); break;
        case 'b': $valid = is_bool($value); break;
        case 'l': if (is_array($value)) {
            if (count($value) != count($subCheck)) throw new Exception("not enough types to check bro", 1);

            $j = 0;
            foreach ($value as $key) {
                if (!$valid) break;
                $valid = validType($key, $subCheck[$j]);
                $j += 1;
            }}
            break;

        case 'a': $valid = true; break;
        default: $valid = false; break;
    }
    return $valid;
}

function validLenght($value, $min, $max) {
    if (is_string($value)) {
        return strlen($value) >= $min && strlen($value) < $max;
    }
    elseif (is_array($value)) {
        return count($value) >= $min && count($value) < $max;
    }
    elseif (is_int($value)) {
        return (string) $value >= $min && (string) $value < $max;
    }
}

?>
