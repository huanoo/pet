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
-- Table structure for table `pet_violation_records`
--

DROP TABLE IF EXISTS `pet_violation_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pet_violation_records` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '违规记录ID（主键）',
  `pet_id` int NOT NULL COMMENT '关联宠物ID',
  `user_id` int NOT NULL COMMENT '关联主人（用户）ID（适配你的users表）',
  `community_id` int DEFAULT NULL COMMENT '违规发生的社区ID',
  `violation_type_id` int NOT NULL COMMENT '关联违规类型ID（关联violation_types表）',
  `violation_time` datetime NOT NULL COMMENT '违规发生时间',
  `violation_desc` varchar(500) DEFAULT '' COMMENT '违规行为详情',
  `handler` varchar(50) DEFAULT '' COMMENT '处理人（管理员/物业）',
  `handle_status` enum('pending','processing','completed','rejected') NOT NULL DEFAULT 'pending' COMMENT '处理状态：待处理/处理中/已完成/已驳回',
  `handle_result` varchar(500) DEFAULT '' COMMENT '处理结果',
  `handle_time` datetime DEFAULT NULL COMMENT '处理完成时间',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '记录创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '记录更新时间',
  PRIMARY KEY (`id`),
  KEY `pet_id` (`pet_id`),
  KEY `violation_type_id` (`violation_type_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_community_id` (`community_id`),
  KEY `idx_handle_status` (`handle_status`),
  KEY `idx_violation_time` (`violation_time`),
  CONSTRAINT `pet_violation_records_ibfk_1` FOREIGN KEY (`pet_id`) REFERENCES `pets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `pet_violation_records_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `pet_violation_records_ibfk_3` FOREIGN KEY (`community_id`) REFERENCES `community` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `pet_violation_records_ibfk_4` FOREIGN KEY (`violation_type_id`) REFERENCES `violation_types` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='宠物违规行为记录表（适配现有users/pets表）';
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-01 17:26:54
