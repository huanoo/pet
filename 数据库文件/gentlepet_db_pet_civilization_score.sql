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
-- Table structure for table `pet_civilization_score`
--

DROP TABLE IF EXISTS `pet_civilization_score`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pet_civilization_score` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '评分ID（主键）',
  `user_id` int NOT NULL COMMENT '关联用户ID（主人）',
  `community_id` int DEFAULT NULL COMMENT '所属社区ID',
  `base_score` decimal(5,2) NOT NULL DEFAULT '100.00' COMMENT '基础分（满分100）',
  `leash_deduction` decimal(5,2) DEFAULT '0.00' COMMENT '宠物未牵绳出行扣分（每次扣10分）',
  `vaccine_deduction` decimal(5,2) DEFAULT '0.00' COMMENT '宠物未按时接种疫苗扣分（每次扣10分）',
  `cert_deduction` decimal(5,2) DEFAULT '0.00' COMMENT '宠物未办理登记证扣分（每次扣10分）',
  `feces_deduction` decimal(5,2) DEFAULT '0.00' COMMENT '未及时清理宠物粪便扣分（每次扣5分）',
  `noise_deduction` decimal(5,2) DEFAULT '0.00' COMMENT '宠物噪音扰民扣分（每次扣5分）',
  `public_area_deduction` decimal(5,2) DEFAULT '0.00' COMMENT '宠物随意进入公共区域扣分（每次扣5分）',
  `vomit_deduction` decimal(5,2) DEFAULT '0.00' COMMENT '未及时清理宠物呕吐物扣分（每次扣5分）',
  `other_deduction` decimal(5,2) DEFAULT '0.00' COMMENT '其他养宠违规行为扣分（每次扣5分）',
  `fierce_dog_deduction` decimal(5,2) DEFAULT '0.00' COMMENT '饲养禁养烈性犬只扣分（每次扣20分）',
  `attack_deduction` decimal(5,2) DEFAULT '0.00' COMMENT '宠物攻击他人/其他宠物扣分（每次扣20分）',
  `bonus_score` decimal(5,2) DEFAULT '0.00' COMMENT '奖励分（如文明养宠加分）',
  `total_score` decimal(5,2) GENERATED ALWAYS AS (greatest(((`base_score` - (((((((((`leash_deduction` + `vaccine_deduction`) + `cert_deduction`) + `feces_deduction`) + `noise_deduction`) + `public_area_deduction`) + `vomit_deduction`) + `other_deduction`) + `fierce_dog_deduction`) + `attack_deduction`)) + `bonus_score`),0)) STORED COMMENT '最终得分（最低0分）',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '评分更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_user_id` (`user_id`),
  KEY `idx_community_id` (`community_id`),
  KEY `idx_total_score` (`total_score`),
  CONSTRAINT `pet_civilization_score_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `pet_civilization_score_ibfk_2` FOREIGN KEY (`community_id`) REFERENCES `community` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='个人养宠文明评分表（贴合违规类型扣分规则）';
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
