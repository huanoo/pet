-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: gentlepet_db
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `community_civilization_score`
--

DROP TABLE IF EXISTS `community_civilization_score`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `community_civilization_score` (
  `community_id` int NOT NULL COMMENT '关联社区ID（主键，保证每个社区只出现一次）',
  `initial_score` decimal(5,2) NOT NULL DEFAULT '100.00' COMMENT '初始评分（满分100）',
  `month_01` decimal(5,2) DEFAULT NULL COMMENT '1月月度评分',
  `month_02` decimal(5,2) DEFAULT NULL COMMENT '2月月度评分',
  `month_03` decimal(5,2) DEFAULT NULL COMMENT '3月月度评分',
  `month_04` decimal(5,2) DEFAULT NULL COMMENT '4月月度评分',
  `month_05` decimal(5,2) DEFAULT NULL COMMENT '5月月度评分',
  `month_06` decimal(5,2) DEFAULT NULL COMMENT '6月月度评分',
  `month_07` decimal(5,2) DEFAULT NULL COMMENT '7月月度评分',
  `month_08` decimal(5,2) DEFAULT NULL COMMENT '8月月度评分',
  `month_09` decimal(5,2) DEFAULT NULL COMMENT '9月月度评分',
  `month_10` decimal(5,2) DEFAULT NULL COMMENT '10月月度评分',
  `month_11` decimal(5,2) DEFAULT NULL COMMENT '11月月度评分',
  `month_12` decimal(5,2) DEFAULT NULL COMMENT '12月月度评分',
  `half_year_score` decimal(5,2) DEFAULT NULL COMMENT '上半年总评（1-6月平均分）',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间',
  PRIMARY KEY (`community_id`),
  CONSTRAINT `community_civilization_score_ibfk_1` FOREIGN KEY (`community_id`) REFERENCES `community` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='社区文明指数评分宽表（每个社区一行，直观展示月度/总评分数）';
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-01 17:26:53
