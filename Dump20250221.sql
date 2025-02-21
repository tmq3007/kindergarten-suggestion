-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: localhost    Database: KSS
-- ------------------------------------------------------
-- Server version	8.0.40

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
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '';

--
-- Table structure for table `Facilities_of_School`
--

DROP TABLE IF EXISTS `Facilities_of_School`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Facilities_of_School` (
  `UID` tinyint NOT NULL,
  `School_ID` int NOT NULL,
  PRIMARY KEY (`UID`,`School_ID`),
  KEY `FK_School_Facilities` (`School_ID`),
  CONSTRAINT `FK_School_Facilities` FOREIGN KEY (`School_ID`) REFERENCES `School` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Facilities_of_School`
--

LOCK TABLES `Facilities_of_School` WRITE;
/*!40000 ALTER TABLE `Facilities_of_School` DISABLE KEYS */;
/*!40000 ALTER TABLE `Facilities_of_School` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Parent`
--

DROP TABLE IF EXISTS `Parent`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Parent` (
  `User_ID` int NOT NULL,
  `Fullname` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `Gender` bit(1) NOT NULL,
  `Phone` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `DOB` date NOT NULL,
  `District` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `Ward` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `Province` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `Street` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  PRIMARY KEY (`User_ID`),
  CONSTRAINT `User_Parent` FOREIGN KEY (`User_ID`) REFERENCES `User` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Parent`
--

LOCK TABLES `Parent` WRITE;
/*!40000 ALTER TABLE `Parent` DISABLE KEYS */;
INSERT INTO `Parent` VALUES (1,'Nguyễn Văn A',_binary '\0','0123456780','1990-12-12','Quận 1','Phường Bến Nghé','Hồ Chí Minh','Nguyễn Trãi');
/*!40000 ALTER TABLE `Parent` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Parent_In_School`
--

DROP TABLE IF EXISTS `Parent_In_School`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Parent_In_School` (
  `id` int NOT NULL,
  `School_ID` int NOT NULL,
  `User_ID` int NOT NULL,
  `From` date NOT NULL,
  `To` date DEFAULT NULL,
  `status` bit(1) NOT NULL DEFAULT b'1',
  PRIMARY KEY (`id`),
  KEY `Parent_ID_idx` (`User_ID`),
  KEY `FK_School_ParentInSchool` (`School_ID`),
  CONSTRAINT `FK_Parent_ParentInSchool` FOREIGN KEY (`User_ID`) REFERENCES `Parent` (`User_ID`),
  CONSTRAINT `FK_School_ParentInSchool` FOREIGN KEY (`School_ID`) REFERENCES `School` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Parent_In_School`
--

LOCK TABLES `Parent_In_School` WRITE;
/*!40000 ALTER TABLE `Parent_In_School` DISABLE KEYS */;
/*!40000 ALTER TABLE `Parent_In_School` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Request_Counselling`
--

DROP TABLE IF EXISTS `Request_Counselling`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Request_Counselling` (
  `id` int NOT NULL,
  `Parent_ID` int NOT NULL,
  `School_ID` int NOT NULL,
  `Inquiry` text,
  `Status` tinyint NOT NULL DEFAULT '0',
  `Email` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `Phone` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `Name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_Parent_Request_idx` (`Parent_ID`),
  KEY `FK_School_Request` (`School_ID`),
  CONSTRAINT `FK_Parent_Request` FOREIGN KEY (`Parent_ID`) REFERENCES `Parent` (`User_ID`),
  CONSTRAINT `FK_School_Request` FOREIGN KEY (`School_ID`) REFERENCES `School` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Request_Counselling`
--

LOCK TABLES `Request_Counselling` WRITE;
/*!40000 ALTER TABLE `Request_Counselling` DISABLE KEYS */;
/*!40000 ALTER TABLE `Request_Counselling` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Review`
--

DROP TABLE IF EXISTS `Review`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Review` (
  `id` int NOT NULL AUTO_INCREMENT,
  `School_ID` int NOT NULL,
  `Parent_ID` int NOT NULL,
  `Learning_Program` tinyint NOT NULL,
  `Facilities_and_Utilities` tinyint NOT NULL,
  `Extracurricular_Activities` tinyint NOT NULL,
  `Teacher_and_Staff` tinyint NOT NULL,
  `Hygiene_and_Nutrition` tinyint NOT NULL,
  `Feedback` text,
  PRIMARY KEY (`id`),
  KEY `FK_School_Review_idx` (`School_ID`),
  KEY `FK_Parent_Review_idx` (`Parent_ID`),
  CONSTRAINT `FK_Parent_Review` FOREIGN KEY (`Parent_ID`) REFERENCES `Parent` (`User_ID`),
  CONSTRAINT `FK_School_Review` FOREIGN KEY (`School_ID`) REFERENCES `School` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Review`
--

LOCK TABLES `Review` WRITE;
/*!40000 ALTER TABLE `Review` DISABLE KEYS */;
/*!40000 ALTER TABLE `Review` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `School`
--

DROP TABLE IF EXISTS `School`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `School` (
  `id` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(255) NOT NULL,
  `Phone` varchar(30) NOT NULL,
  `Email` varchar(255) NOT NULL,
  `Receiving_Age` tinyint NOT NULL DEFAULT '0',
  `Education_Method` tinyint NOT NULL DEFAULT '0',
  `School_Type` tinyint NOT NULL DEFAULT '0',
  `Status` tinyint NOT NULL DEFAULT '0',
  `Website` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `Description` text,
  `Fee_From` int DEFAULT NULL,
  `Fee_To` int DEFAULT NULL,
  `Image` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `District` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `Ward` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `Province` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `Street` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Email_UNIQUE` (`Email`),
  UNIQUE KEY `Phone_UNIQUE` (`Phone`),
  KEY `Status` (`Status`) /*!80000 INVISIBLE */,
  KEY `Ward` (`Ward`) /*!80000 INVISIBLE */,
  KEY `Distict` (`District`) /*!80000 INVISIBLE */,
  KEY `Province` (`Province`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `School`
--

LOCK TABLES `School` WRITE;
/*!40000 ALTER TABLE `School` DISABLE KEYS */;
INSERT INTO `School` VALUES (1,'VinSchool Kindergarden','0123456789','vinschool@vinschool.vn',0,0,0,0,'vinschool.vn','This is Vinschool. If you have money, come here.',500,1000,'aa','Quận 1','Phường Bến Nghé','Hồ Chí Minh','Nguyễn Trãi');
/*!40000 ALTER TABLE `School` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `School_Owner`
--

DROP TABLE IF EXISTS `School_Owner`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `School_Owner` (
  `User_ID` int NOT NULL,
  `School_ID` int NOT NULL,
  `Phone` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `Gender` bit(1) NOT NULL,
  `Fullname` varchar(255) NOT NULL,
  `DOB` date NOT NULL,
  KEY `SO_Account_idx` (`User_ID`),
  KEY `FK_School_SO` (`School_ID`),
  CONSTRAINT `FK_School_SO` FOREIGN KEY (`School_ID`) REFERENCES `School` (`id`),
  CONSTRAINT `FK_User_SO` FOREIGN KEY (`User_ID`) REFERENCES `User` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `School_Owner`
--

LOCK TABLES `School_Owner` WRITE;
/*!40000 ALTER TABLE `School_Owner` DISABLE KEYS */;
/*!40000 ALTER TABLE `School_Owner` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `User`
--

DROP TABLE IF EXISTS `User`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `User` (
  `id` int NOT NULL AUTO_INCREMENT,
  `Username` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `Password` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `Email` varchar(255) NOT NULL,
  `Status` bit(1) NOT NULL DEFAULT b'1',
  `Role` char(10) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Email_UNIQUE` (`Email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `User`
--

LOCK TABLES `User` WRITE;
/*!40000 ALTER TABLE `User` DISABLE KEYS */;
INSERT INTO `User` VALUES (1,'parent1','Pass1234','john.doe@example.com',_binary '','0'),(2,'school_owner','Secure456','jane.smith@example.com',_binary '','1'),(3,'admin','Hello789','alice.wonder@example.com',_binary '','2');
/*!40000 ALTER TABLE `User` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Utilities_of_School`
--

DROP TABLE IF EXISTS `Utilities_of_School`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Utilities_of_School` (
  `UID` tinyint NOT NULL,
  `School_ID` int NOT NULL,
  PRIMARY KEY (`UID`,`School_ID`),
  KEY `FK_School_Utilities` (`School_ID`),
  CONSTRAINT `FK_School_Utilities` FOREIGN KEY (`School_ID`) REFERENCES `School` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Utilities_of_School`
--

LOCK TABLES `Utilities_of_School` WRITE;
/*!40000 ALTER TABLE `Utilities_of_School` DISABLE KEYS */;
/*!40000 ALTER TABLE `Utilities_of_School` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-02-21 16:34:21
