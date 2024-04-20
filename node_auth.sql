-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Apr 19, 2024 at 08:00 PM
-- Server version: 8.0.36-0ubuntu0.20.04.1
-- PHP Version: 7.4.3-4ubuntu2.20

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `node_auth`
--

-- --------------------------------------------------------

--
-- Table structure for table `sys_user`
--

CREATE TABLE `sys_user` (
  `iAdminId` int NOT NULL,
  `vName` varchar(255) DEFAULT NULL,
  `vEmail` varchar(255) DEFAULT NULL,
  `vUserName` varchar(255) DEFAULT NULL,
  `vPassword` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `vPhoneNo` varchar(255) DEFAULT NULL,
  `vProfileImage` varchar(255) DEFAULT NULL,
  `iGroupId` int DEFAULT NULL,
  `dtLastLogin` datetime DEFAULT NULL,
  `vSystemCode` varchar(255) DEFAULT NULL,
  `eIsDeleted` enum('0','1') DEFAULT '0',
  `iAddedBy` int DEFAULT NULL,
  `dtAddedDate` datetime DEFAULT NULL,
  `iUpdatedBy` int DEFAULT NULL,
  `dtUpdateDate` datetime DEFAULT NULL,
  `eStatus` enum('Active','InActive') DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `sys_user`
--

INSERT INTO `sys_user` (`iAdminId`, `vName`, `vEmail`, `vUserName`, `vPassword`, `vPhoneNo`, `vProfileImage`, `iGroupId`, `dtLastLogin`, `vSystemCode`, `eIsDeleted`, `iAddedBy`, `dtAddedDate`, `iUpdatedBy`, `dtUpdateDate`, `eStatus`) VALUES
(1, 'Lalit Raghav', 'lalitraghav@yopmail.com', 'lalitraghav', 'admin123', '7894561230', 'sdfgfdfgfddfdf', 3, NULL, NULL, '0', NULL, '2023-06-13 00:00:00', NULL, NULL, 'Active'),
(2, 'raghav user', 'raghav.user@yopmail.com', NULL, '$2b$10$LFf564.8OLuqkPCxLQO5ROLPZS4MDrLniuJjnTLACOodWnk6oGp02', '9685741236', NULL, NULL, NULL, NULL, '0', NULL, NULL, NULL, NULL, 'Active'),
(3, 'raghav user', 'raghav.user@yopmail.com', NULL, '$2b$10$dErLUdPnanTams9hii/2YOrMfeaX9yCRSn6UT1AOIpGWSap452Ey2', '9685741236', NULL, NULL, NULL, NULL, '0', NULL, NULL, NULL, NULL, 'Active');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `sys_user`
--
ALTER TABLE `sys_user`
  ADD PRIMARY KEY (`iAdminId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `sys_user`
--
ALTER TABLE `sys_user`
  MODIFY `iAdminId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
