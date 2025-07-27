-- ระบบสำรวจข้อมูลภาคสนาม - Database Schema
-- เวอร์ชัน: 1.1 (Final)
-- วันที่: 26 กรกฎาคม 2568

DROP DATABASE IF EXISTS temple_survey_db_v2;
CREATE DATABASE temple_survey_db_v2 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE temple_survey_db_v2;

-- =================================================================
-- ตารางข้อมูลหลัก (Master Data & System Tables)
-- =================================================================

-- ตารางผู้ใช้งานระบบ (System Users)
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'รหัสผู้ใช้งาน',
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'Reviewer', 'Surveyor') NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(100) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE COMMENT 'สถานะการใช้งาน',
    approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' COMMENT 'สถานะการอนุมัติผู้ใช้งาน',
    rank VARCHAR(50) COMMENT 'ยศ',
    position VARCHAR(100) COMMENT 'ตำแหน่ง',
    department VARCHAR(150) COMMENT 'หน่วยงาน',
    phone VARCHAR(20) COMMENT 'เบอร์โทรศัพท์',
    line_id VARCHAR(50) COMMENT 'Line ID',
    notes TEXT COMMENT 'หมายเหตุ',
    last_login TIMESTAMP NULL COMMENT 'วันเวลาที่เข้าสู่ระบบล่าสุด',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT 'ตารางผู้ใช้งานระบบ - เก็บข้อมูลผู้ใช้งานทั้งหมด (Admin, Reviewer, Surveyor)';

-- ตารางบันทึกประวัติการใช้งาน (Activity Logs / Audit Trail)
CREATE TABLE activity_logs (
    log_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    action_type VARCHAR(50) NOT NULL COMMENT 'ประเภทการกระทำ (CREATE, UPDATE, LOGIN)',
    target_table VARCHAR(50),
    target_id INT,
    details TEXT COMMENT 'รายละเอียดการเปลี่ยนแปลง (JSON: old_data, new_data)',
    ip_address VARCHAR(45),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) COMMENT 'ตารางบันทึกประวัติการใช้งาน - เก็บ log การกระทำทั้งหมดของผู้ใช้งาน';

-- ตารางประเภทการสำรวจ (Survey Target Types)
CREATE TABLE survey_target_types (
    type_id INT PRIMARY KEY AUTO_INCREMENT,
    type_name VARCHAR(100) NOT NULL UNIQUE COMMENT 'ชื่อประเภทการสำรวจ (เช่น วัด, โรงเรียน)'
) COMMENT 'ตารางประเภทการสำรวจ - กำหนดชนิดของเป้าหมายที่จะสำรวจ (วัด, โรงเรียน, โรงพยาบาล)';

-- ตารางประเภทวัด (Temple Types Master Data)
CREATE TABLE master_temple_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE
) COMMENT 'ตารางประเภทวัด - ราชวรวิหาร, วรวิหาร, วัดราษฎร์ ฯลฯ';

-- ตารางสังกัดทางศาสนา (Religious Denominations)
CREATE TABLE master_denominations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE
) COMMENT 'ตารางสังกัดทางศาสนา - มหานิกาย, ธรรมยุตนิกาย, อื่นๆ';

-- =================================================================
-- ตารางข้อมูลการสำรวจ (Core Survey Data)
-- =================================================================

-- ตารางเป้าหมายการสำรวจหลัก (Main Survey Targets)
CREATE TABLE survey_targets (
    target_id INT PRIMARY KEY AUTO_INCREMENT,
    type_id INT NOT NULL COMMENT 'FK to survey_target_types',
    target_name VARCHAR(255) NOT NULL,
    address TEXT,
    subdistrict VARCHAR(100),
    district VARCHAR(100),
    province VARCHAR(100),
    postal_code VARCHAR(5),
    gps_latitude DECIMAL(10, 8),
    gps_longitude DECIMAL(11, 8),
    status ENUM('Draft', 'Pending Review', 'Approved', 'Needs Revision') NOT NULL DEFAULT 'Draft',
    created_by INT NOT NULL COMMENT 'FK to users.user_id',
    reviewed_by INT COMMENT 'FK to users.user_id',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT 'ตารางเป้าหมายการสำรวจหลัก - เก็บข้อมูลพื้นฐานของทุกประเภทการสำรวจ (วัด, โรงเรียน, โรงพยาบาล)';

-- ตารางรายละเอียดเฉพาะวัด (Temple Specific Details)
CREATE TABLE temple_details (
    temple_detail_id INT PRIMARY KEY AUTO_INCREMENT,
    target_id INT NOT NULL UNIQUE COMMENT 'FK to survey_targets',
    temple_type_id INT COMMENT 'FK to master_temple_types',
    denomination_id INT COMMENT 'FK to master_denominations',
    monk_count INT DEFAULT 0,
    history_summary TEXT
) COMMENT 'ตารางรายละเอียดเฉพาะวัด - เก็บข้อมูลเฉพาะที่เกี่ยวกับวัด (ประเภทวัด, สังกัด, จำนวนพระ)';

-- ตารางบุคลากรที่เกี่ยวข้อง (Related Personnel)
CREATE TABLE personnel (
    personnel_id INT PRIMARY KEY AUTO_INCREMENT,
    target_id INT NOT NULL,
    role VARCHAR(100) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20)
) COMMENT 'ตารางบุคลากรที่เกี่ยวข้อง - เก็บข้อมูลคนสำคัญ (เจ้าอาวาส, ผู้อำนวยการ, ประธานกรรมการ)';

-- ตารางบัญชีธนาคาร (Bank Accounts)
CREATE TABLE bank_accounts (
    account_id INT PRIMARY KEY AUTO_INCREMENT,
    target_id INT NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    signatories TEXT COMMENT 'รายนามผู้มีอำนาจเบิกจ่าย'
) COMMENT 'ตารางบัญชีธนาคาร - เก็บข้อมูลบัญชีธนาคารของหน่วยงานที่สำรวจ';

-- ตารางไฟล์แนบ (File Attachments)
CREATE TABLE attachments (
    attachment_id INT PRIMARY KEY AUTO_INCREMENT,
    target_id INT NOT NULL,
    uploader_user_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    description TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) COMMENT 'ตารางไฟล์แนบ - เก็บไฟล์เอกสาร รูปภาพ ที่เกี่ยวข้องกับการสำรวจ';

-- =================================================================
-- ตารางระบบแจ้งเตือน (Notification System)
-- =================================================================

-- ตารางการแจ้งเตือน (System Notifications)
CREATE TABLE notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    related_target_id INT COMMENT 'FK to survey_targets',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) COMMENT 'ตารางการแจ้งเตือน - เก็บข้อความแจ้งเตือนสำหรับผู้ใช้งานแต่ละคน';

-- =================================================================
-- Indexes จะถูกสร้างภายหลังเมื่อโครงสร้างตารางสมบูรณ์
-- =================================================================

-- Indexes will be added later when table structure is finalized
