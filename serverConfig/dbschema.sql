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
  `background` varchar(40) DEFAULT NULL,
  `uploaderID` varchar(40) NOT NULL,
  `uploadTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `hash` varchar(32) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `hash` (`hash`),
  KEY `User ID` (`uploaderID`),
  KEY `levelID` (`levelID`),
  KEY `background` (`background`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

CREATE TABLE IF NOT EXISTS `levels_ratings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `levelID` int UNSIGNED DEFAULT NULL,
  `reviewID` int UNSIGNED NOT NULL,
  `gameplay` tinyint UNSIGNED NOT NULL DEFAULT '5',
  `decoration` tinyint UNSIGNED NOT NULL DEFAULT '5',
  `difficulty` tinyint UNSIGNED NOT NULL DEFAULT '5',
  `overall` tinyint UNSIGNED NOT NULL DEFAULT '5',
  PRIMARY KEY (`id`),
  KEY `Rating ReviewID` (`reviewID`),
  KEY `Rating LevelID` (`levelID`)
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
  PRIMARY KEY (`id`),
  KEY `uid` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `to_user` varchar(40) NOT NULL,
  `from_user` varchar(40) NOT NULL,
  `type` enum('comment','rating','other') NOT NULL,
  `unread` tinyint(1) NOT NULL DEFAULT '1',
  `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `postType` enum('list','review','other') NOT NULL,
  `objectID` int NOT NULL,
  `otherID` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `From` (`from_user`),
  KEY `To` (`to_user`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

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

CREATE TABLE IF NOT EXISTS `users` (
  `username` tinytext NOT NULL,
  `discord_id` varchar(40) NOT NULL,
  `refresh_token` tinytext NOT NULL,
  `access_token` tinytext DEFAULT NULL,
  `id` int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`),
  UNIQUE KEY `discord_id` (`discord_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;


ALTER TABLE `comments`
  ADD CONSTRAINT `Comment User` FOREIGN KEY (`uid`) REFERENCES `users` (`discord_id`),
  ADD CONSTRAINT `Review Comment ID` FOREIGN KEY (`reviewID`) REFERENCES `reviews` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `images`
  ADD CONSTRAINT `Image Path` FOREIGN KEY (`folder`) REFERENCES `images_folders` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Image uploader` FOREIGN KEY (`uploaderID`) REFERENCES `users` (`discord_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `images_folders`
  ADD CONSTRAINT `Folder Creator` FOREIGN KEY (`uid`) REFERENCES `users` (`discord_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `Subfolder` FOREIGN KEY (`base_path`) REFERENCES `images_folders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `levels`
  ADD CONSTRAINT `Level Background` FOREIGN KEY (`background`) REFERENCES `images` (`hash`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `User ID` FOREIGN KEY (`uploaderID`) REFERENCES `users` (`discord_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `levels_ratings`
  ADD CONSTRAINT `Rating LevelID` FOREIGN KEY (`levelID`) REFERENCES `levels` (`levelID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `Rating ReviewID` FOREIGN KEY (`reviewID`) REFERENCES `reviews` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `levels_uploaders`
  ADD CONSTRAINT `Level ID` FOREIGN KEY (`levelID`) REFERENCES `levels` (`levelID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `Level List ID` FOREIGN KEY (`listID`) REFERENCES `lists` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `Level Review ID` FOREIGN KEY (`reviewID`) REFERENCES `reviews` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `notifications`
  ADD CONSTRAINT `From` FOREIGN KEY (`from_user`) REFERENCES `users` (`discord_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `To` FOREIGN KEY (`to_user`) REFERENCES `users` (`discord_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `profiles`
  ADD CONSTRAINT `Profile UID` FOREIGN KEY (`uid`) REFERENCES `users` (`discord_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `ratings`
  ADD CONSTRAINT `Rating List ID` FOREIGN KEY (`list_id`) REFERENCES `lists` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `Ratnig Review ID` FOREIGN KEY (`review_id`) REFERENCES `reviews` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `User Rated` FOREIGN KEY (`uid`) REFERENCES `users` (`discord_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `reviews`
  ADD CONSTRAINT `Review Thumbnail` FOREIGN KEY (`thumbnail`) REFERENCES `images` (`hash`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Review uploader` FOREIGN KEY (`uid`) REFERENCES `users` (`discord_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `sessions`
  ADD CONSTRAINT `Session User` FOREIGN KEY (`user_id`) REFERENCES `users` (`discord_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
