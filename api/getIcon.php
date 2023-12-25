
<?php
require("gd");

header("Content-type: image/png");
$string = $_GET['text'];
$im     = imagecreatefrompng("./icons/player_00_001.webp");
$orange = imagecolorallocate($im, 220, 210, 60);
$px     = (imagesx($im) - 7.5 * strlen($string)) / 2;
imagestring($im, 3, $px, 9, $string, $orange);
imagepng($im);
imagedestroy($im);

?>
