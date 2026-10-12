-- =============================================================
-- Database Schema: University Research Opportunity Portal
-- Computer Networks (CN) Assignment 01
-- =============================================================

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS `research_portal` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `research_portal`;

-- Drop table if exists for clean re-initialization
DROP TABLE IF EXISTS `research_opportunities`;

-- Create Table: research_opportunities
CREATE TABLE `research_opportunities` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `research_area` VARCHAR(255) NOT NULL,
  `faculty_name` VARCHAR(255) NOT NULL,
  `department` VARCHAR(255) NOT NULL,
  `required_skills` TEXT NOT NULL,
  `available_positions` INT NOT NULL DEFAULT 1,
  `application_deadline` DATE NOT NULL,
  `status` ENUM('Open', 'Closed') NOT NULL DEFAULT 'Open',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample Seed Data for testing and demonstration
INSERT INTO `research_opportunities` 
  (`title`, `description`, `research_area`, `faculty_name`, `department`, `required_skills`, `available_positions`, `application_deadline`, `status`) 
VALUES 
  (
    'Quantum Network Protocol Design',
    'Investigating quantum key distribution (QKD) and repeater placement strategies in next-generation high-speed university backbones.',
    'Quantum Networking & Cryptography',
    'Dr. Aris Thorne',
    'Computer Science & Engineering',
    'Python, C++, Network Simulation (NS-3), Quantum Mechanics Basics',
    3,
    '2026-11-15',
    'Open'
  ),
  (
    'Edge Computing for Autonomous Drones',
    'Developing low-latency MEC offloading algorithms for swarm coordination in GPS-denied environments.',
    'Distributed Systems & Mobile Computing',
    'Prof. Elena Rostova',
    'Electrical & Computer Engineering',
    'C++, ROS2, Linux Kernel, Docker, Socket Programming',
    2,
    '2026-12-01',
    'Open'
  ),
  (
    'AI-Driven BGP Anomaly Detection',
    'Building real-time deep learning pipelines to monitor inter-domain routing instabilities and prevent prefix hijacking attacks.',
    'Network Security & Machine Learning',
    'Dr. Marcus Vance',
    'Cybersecurity & Network Systems',
    'Python, PyTorch, Wireshark, BGP Routing, Data Analysis',
    4,
    '2026-10-30',
    'Open'
  ),
  (
    '6G Terahertz Communication Channels',
    'Experimental channel modeling and beamforming optimization for short-range indoor THz wireless links.',
    'Wireless Communications',
    'Dr. Sophia Patel',
    'Telecommunication Engineering',
    'MATLAB, Signal Processing, Radio Frequency (RF), Electromagnetics',
    1,
    '2026-09-15',
    'Closed'
  );
