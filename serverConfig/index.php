<?php
if ($_SERVER["SERVER_NAME"] == "localhost")
  require('../api/meta.php');
else
  require('api/meta.php');

$endpoint = getEndpoint();

?>

<!DOCTYPE html>
<html lang="<?php echo $endpoint[0] ?>">
  <head>
    <meta charset="utf-8">
    <link rel="icon" href="favicon.svg">
    <meta name="theme-color" content="#142019" id="siteTheme" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <?php
        foreach (array_slice($endpoint, 1) as $tag) {
          echo $tag;
        }
    ?>

    <!-- SCRIPT -->
    <!-- STYLE -->

  </head>
  <body>
    <div id="app"></div>
  </body>
</html>
