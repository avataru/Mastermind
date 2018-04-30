CREATE TABLE IF NOT EXISTS `white_star_weights` (
  `userId` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `weight` varchar(255) NULL DEFAULT NULL,
  PRIMARY KEY (`userId`),
  UNIQUE INDEX `unique_userId` (`userId`)
);
