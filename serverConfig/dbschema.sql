SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;


CREATE TABLE IF NOT EXISTS `comments` (
  `username` text NOT NULL,
  `comment` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `comType` tinyint(1) NOT NULL,
  `bgcolor` tinytext NOT NULL,
  `listID` int DEFAULT NULL,
  `reviewID` int UNSIGNED DEFAULT NULL,
  `comID` int NOT NULL AUTO_INCREMENT,
  `verified` tinyint(1) NOT NULL,
  `timestamp` tinytext NOT NULL,
  `uid` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`comID`),
  KEY `Review Comment ID` (`reviewID`),
  KEY `Comment User` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

CREATE TABLE IF NOT EXISTS `follows` (
  `list_id` int DEFAULT NULL,
  `review_id` int UNSIGNED DEFAULT NULL,
  `user` varchar(40) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  KEY `Follow ListID` (`list_id`),
  KEY `Follow ReviewID` (`review_id`),
  KEY `Follow UserID` (`user`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

CREATE TABLE IF NOT EXISTS `groups` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` tinytext CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

CREATE TABLE IF NOT EXISTS `group_members` (
  `user` varchar(40) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `group_id` int UNSIGNED NOT NULL,
  `authority` tinyint NOT NULL,
  `joined` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `hash` varchar(8) COLLATE utf8mb3_unicode_ci NOT NULL,
  UNIQUE KEY `unique hash` (`hash`),
  KEY `Member Group` (`group_id`),
  KEY `Member UID` (`user`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

CREATE TABLE IF NOT EXISTS `images` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `uploaderID` varchar(40) NOT NULL,
  `hash` varchar(40) DEFAULT NULL COMMENT 'link to the image',
  `filesize` int UNSIGNED NOT NULL,
  `folder` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Image uploader` (`uploaderID`),
  KEY `hash` (`hash`),
  KEY `Image Path` (`folder`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

CREATE TABLE IF NOT EXISTS `images_folders` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `base_path` int UNSIGNED DEFAULT NULL,
  `name` tinytext NOT NULL,
  `color` varchar(7) NOT NULL,
  `uid` varchar(40) NOT NULL,
  `attributes` enum('Thumbnails') DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Folder Creator` (`uid`),
  KEY `Subfolder` (`base_path`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

CREATE TABLE IF NOT EXISTS `levels` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `levelName` varchar(30) NOT NULL,
  `creator` varchar(20) NOT NULL,
  `collabMemberCount` tinyint UNSIGNED NOT NULL DEFAULT '0',
  `levelID` int UNSIGNED DEFAULT NULL,
  `difficulty` tinyint UNSIGNED NOT NULL,
  `rating` tinyint UNSIGNED NOT NULL,
  `platformer` tinyint(1) NOT NULL DEFAULT '0',
  `color` varchar(6) DEFAULT NULL,
  `background` int UNSIGNED DEFAULT NULL,
  `uploaderID` varchar(40) NOT NULL,
  `uploadTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `hash` varchar(32) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `hash` (`hash`),
  KEY `User ID` (`uploaderID`),
  KEY `levelID` (`levelID`),
  KEY `Background ID` (`background`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

CREATE TABLE IF NOT EXISTS `levels_ratings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `levelID` int UNSIGNED DEFAULT NULL,
  `reviewID` int UNSIGNED DEFAULT NULL,
  `listRatingID` int DEFAULT NULL,
  `gameplay` decimal(3,1) UNSIGNED DEFAULT NULL,
  `decoration` decimal(3,1) UNSIGNED DEFAULT NULL,
  `difficulty` decimal(3,1) UNSIGNED DEFAULT NULL,
  `overall` decimal(3,1) UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Rating ReviewID` (`reviewID`),
  KEY `Rating LevelID` (`levelID`),
  KEY `Rating ListID` (`listRatingID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

CREATE TABLE IF NOT EXISTS `levels_uploaders` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `levelID` int UNSIGNED DEFAULT NULL,
  `listID` int DEFAULT NULL,
  `reviewID` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Level Review ID` (`reviewID`),
  KEY `Level List ID` (`listID`),
  KEY `Level ID` (`levelID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

CREATE TABLE IF NOT EXISTS `lists` (
  `name` tinytext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `creator` tinytext NOT NULL,
  `data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `id` int NOT NULL AUTO_INCREMENT,
  `timestamp` text NOT NULL,
  `hidden` text NOT NULL,
  `uid` varchar(40) DEFAULT NULL,
  `views` int NOT NULL DEFAULT '0',
  `diffGuesser` tinyint(1) NOT NULL DEFAULT '0',
  `commDisabled` tinyint(1) NOT NULL DEFAULT '0',
  `tagline` tinytext NOT NULL,
  `thumbnail` varchar(40) DEFAULT NULL,
  `thumbProps` tinytext,
  PRIMARY KEY (`id`),
  KEY `uid` (`uid`),
  KEY `List Thumbnail` (`thumbnail`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `to_group` int UNSIGNED DEFAULT NULL,
  `from_user` varchar(40) NOT NULL,
  `type` enum('comment','rating','other','watch') CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `postType` enum('list','review','other') NOT NULL,
  `objectID` int NOT NULL,
  `otherID` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `From` (`from_user`),
  KEY `To GID` (`to_group`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

CREATE TABLE IF NOT EXISTS `other_notifications` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `content` text CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `time_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

CREATE TABLE IF NOT EXISTS `profiles` (
  `uid` varchar(40) NOT NULL,
  `pfp_cutout` tinyint NOT NULL,
  PRIMARY KEY (`uid`),
  UNIQUE KEY `uid` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

CREATE TABLE IF NOT EXISTS `ratings` (
  `rate` tinyint(1) NOT NULL,
  `uid` varchar(40) NOT NULL,
  `list_id` int DEFAULT NULL,
  `review_id` int UNSIGNED DEFAULT NULL,
  `id` int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uid` (`uid`,`list_id`),
  KEY `Rating List ID` (`list_id`),
  KEY `Ratnig Review ID` (`review_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

CREATE TABLE IF NOT EXISTS `read_notifications` (
  `notif_id` int UNSIGNED NOT NULL,
  `user` varchar(40) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  KEY `Read UID` (`user`),
  KEY `Read NID` (`notif_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

CREATE TABLE IF NOT EXISTS `reviews` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` tinytext NOT NULL,
  `uid` varchar(25) NOT NULL,
  `data` blob NOT NULL,
  `tagline` tinytext NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `views` int NOT NULL DEFAULT '0',
  `hidden` varchar(10) NOT NULL DEFAULT '0',
  `commDisabled` tinyint(1) NOT NULL,
  `thumbnail` varchar(40) DEFAULT NULL,
  `thumbProps` tinytext,
  `lang` enum('cs','en','de','es','ko','ru','ot') NOT NULL DEFAULT 'ot',
  PRIMARY KEY (`id`),
  KEY `Review uploader` (`uid`),
  KEY `Review Thumbnail` (`thumbnail`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

CREATE TABLE IF NOT EXISTS `sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(40) NOT NULL,
  `session_data` tinytext NOT NULL,
  `session_index` tinyint NOT NULL DEFAULT '0',
  `last_login` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Session User` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

CREATE TABLE IF NOT EXISTS `update_messages` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `list_id` int DEFAULT NULL,
  `review_id` int UNSIGNED DEFAULT NULL,
  `messsage` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `UM list_id` (`list_id`),
  KEY `UM review_id` (`review_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

CREATE TABLE IF NOT EXISTS `username_change` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` tinytext COLLATE utf8mb3_unicode_ci NOT NULL,
  `uid` varchar(40) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `UID changing` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

CREATE TABLE IF NOT EXISTS `users` (
  `username` tinytext NOT NULL,
  `discord_id` varchar(40) NOT NULL,
  `refresh_token` tinytext CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `access_token` tinytext CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci,
  `id` int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`),
  UNIQUE KEY `discord_id` (`discord_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;


ALTER TABLE `comments`
  ADD CONSTRAINT `Comment User` FOREIGN KEY (`uid`) REFERENCES `users` (`discord_id`),
  ADD CONSTRAINT `Review Comment ID` FOREIGN KEY (`reviewID`) REFERENCES `reviews` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `follows`
  ADD CONSTRAINT `Follow ListID` FOREIGN KEY (`list_id`) REFERENCES `lists` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `Follow ReviewID` FOREIGN KEY (`review_id`) REFERENCES `reviews` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `Follow UserID` FOREIGN KEY (`user`) REFERENCES `users` (`discord_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `group_members`
  ADD CONSTRAINT `Member Group` FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `Member UID` FOREIGN KEY (`user`) REFERENCES `users` (`discord_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `images`
  ADD CONSTRAINT `Image Path` FOREIGN KEY (`folder`) REFERENCES `images_folders` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Image uploader` FOREIGN KEY (`uploaderID`) REFERENCES `users` (`discord_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `images_folders`
  ADD CONSTRAINT `Folder Creator` FOREIGN KEY (`uid`) REFERENCES `users` (`discord_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `Subfolder` FOREIGN KEY (`base_path`) REFERENCES `images_folders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `levels`
  ADD CONSTRAINT `Background ID` FOREIGN KEY (`background`) REFERENCES `images` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `User ID` FOREIGN KEY (`uploaderID`) REFERENCES `users` (`discord_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `levels_ratings`
  ADD CONSTRAINT `Rating LevelID` FOREIGN KEY (`levelID`) REFERENCES `levels` (`levelID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `Rating ListID` FOREIGN KEY (`listRatingID`) REFERENCES `lists` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `Rating ReviewID` FOREIGN KEY (`reviewID`) REFERENCES `reviews` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `levels_uploaders`
  ADD CONSTRAINT `Level ID` FOREIGN KEY (`levelID`) REFERENCES `levels` (`levelID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `Level List ID` FOREIGN KEY (`listID`) REFERENCES `lists` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `Level Review ID` FOREIGN KEY (`reviewID`) REFERENCES `reviews` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `lists`
  ADD CONSTRAINT `List Thumbnail` FOREIGN KEY (`thumbnail`) REFERENCES `images` (`hash`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `notifications`
  ADD CONSTRAINT `From` FOREIGN KEY (`from_user`) REFERENCES `users` (`discord_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `To GID` FOREIGN KEY (`to_group`) REFERENCES `groups` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `profiles`
  ADD CONSTRAINT `Profile UID` FOREIGN KEY (`uid`) REFERENCES `users` (`discord_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `ratings`
  ADD CONSTRAINT `Rating List ID` FOREIGN KEY (`list_id`) REFERENCES `lists` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `Ratnig Review ID` FOREIGN KEY (`review_id`) REFERENCES `reviews` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `User Rated` FOREIGN KEY (`uid`) REFERENCES `users` (`discord_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `read_notifications`
  ADD CONSTRAINT `Read NID` FOREIGN KEY (`notif_id`) REFERENCES `notifications` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `Read UID` FOREIGN KEY (`user`) REFERENCES `users` (`discord_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `reviews`
  ADD CONSTRAINT `Review Thumbnail` FOREIGN KEY (`thumbnail`) REFERENCES `images` (`hash`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Review uploader` FOREIGN KEY (`uid`) REFERENCES `users` (`discord_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `sessions`
  ADD CONSTRAINT `Session User` FOREIGN KEY (`user_id`) REFERENCES `users` (`discord_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `update_messages`
  ADD CONSTRAINT `UM list_id` FOREIGN KEY (`list_id`) REFERENCES `lists` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `UM review_id` FOREIGN KEY (`review_id`) REFERENCES `reviews` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `username_change`
  ADD CONSTRAINT `UID changing` FOREIGN KEY (`uid`) REFERENCES `users` (`discord_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
