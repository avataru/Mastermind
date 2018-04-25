CREATE TABLE IF NOT EXISTS `white_star` (
  `userId` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `team` varchar(255) DEFAULT NULL,
  `confirmed` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`userId`),
  UNIQUE KEY `unique_userId` (`userId`)
);

CREATE TABLE IF NOT EXISTS `timezones` (
  `userId` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `timezone` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`userId`),
  UNIQUE KEY `unique_userId` (`userId`)
);

CREATE TABLE IF NOT EXISTS `achievements` (
  `userId` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `achievementId` varchar(255) NOT NULL,
  `num` int(11) NOT NULL,
  PRIMARY KEY (`userId`,`achievementId`),
  UNIQUE KEY `userId` (`userId`,`achievementId`)
);

CREATE TABLE IF NOT EXISTS `nominations` (
  `nominatorUserId` varchar(255) NOT NULL,
  `userId` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `achievementId` varchar(255) NOT NULL,
  `timestamp` varchar(255) NOT NULL,
  PRIMARY KEY (`nominatorUserId`,`userId`,`achievementId`),
  UNIQUE KEY `nominatorUserId` (`nominatorUserId`,`userId`,`achievementId`)
);

CREATE TABLE IF NOT EXISTS `disabled_commands` (
  `command` varchar(255) NOT NULL,
  `channel` varchar(255) NOT NULL,
  PRIMARY KEY (`command`,`channel`),
  UNIQUE KEY `command` (`command`,`channel`)
);

CREATE TABLE IF NOT EXISTS `last_seen` (
  `userId` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `timestamp` varchar(255) NOT NULL,
  `messaged` varchar(255) NOT NULL,
  PRIMARY KEY (`userId`),
  UNIQUE KEY `unique_userId` (`userId`)
);

CREATE TABLE IF NOT EXISTS `bs_tech` (
  `userId` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `weapon` varchar(255) DEFAULT NULL,
  `shield` varchar(255) DEFAULT NULL,
  `mod1` varchar(255) DEFAULT NULL,
  `mod2` varchar(255) DEFAULT NULL,
  `mod3` varchar(255) DEFAULT NULL,
  `mod4` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`userId`),
  UNIQUE KEY `unique_userId` (`userId`)
);

CREATE TABLE IF NOT EXISTS `mn_tech` (
  `userId` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `module` varchar(255) DEFAULT NULL,
  `mining1` varchar(255) DEFAULT NULL,
  `mining2` varchar(255) DEFAULT NULL,
  `mining3` varchar(255) DEFAULT NULL,
  `mining4` varchar(255) DEFAULT NULL,
  `mining5` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`userId`),
  UNIQUE KEY `unique_userId` (`userId`)
);

CREATE TABLE IF NOT EXISTS `tr_tech` (
  `userId` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `hold` varchar(255) DEFAULT NULL,
  `module` varchar(255) DEFAULT NULL,
  `trade1` varchar(255) DEFAULT NULL,
  `trade2` varchar(255) DEFAULT NULL,
  `trade3` varchar(255) DEFAULT NULL,
  `trade4` varchar(255) DEFAULT NULL,
  `trade5` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`userId`),
  UNIQUE KEY `unique_userId` (`userId`)
);

CREATE TABLE IF NOT EXISTS `white_star_weights` (
  `userId` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `weight` int NOT NULL DEFAULT "1",
  PRIMARY KEY (`userId`),
  UNIQUE INDEX `unique_userId` (`userId`)
);
