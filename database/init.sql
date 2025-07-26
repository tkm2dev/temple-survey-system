-- ระบบสำรวจข้อมูลภาคสนาม - Database Schema
-- เวอร์ชัน: 1.1 (Final)
-- วันที่: 26 กรกฎาคม 2568

DROP DATABASE IF EXISTS temple_survey_db_v2;
CREATE DATABASE temple_survey_db_v2 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE temple_survey_db_v2;

-- =================================================================
-- ตารางข้อมูลหลัก (Master Data & System)
-- =================================================================

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
) COMMENT 'ตารางผู้ใช้งานระบบ';

CREATE TABLE activity_logs (
    log_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    action_type VARCHAR(50) NOT NULL COMMENT 'ประเภทการกระทำ (CREATE, UPDATE, LOGIN)',
    target_table VARCHAR(50),
    target_id INT,
    details TEXT COMMENT 'รายละเอียดการเปลี่ยนแปลง (JSON: old_data, new_data)',
    ip_address VARCHAR(45),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
) COMMENT 'ตารางบันทึกประวัติการใช้งานและแก้ไขข้อมูลทั้งหมด (Audit Trail)';

CREATE TABLE survey_target_types (
    type_id INT PRIMARY KEY AUTO_INCREMENT,
    type_name VARCHAR(100) NOT NULL UNIQUE COMMENT 'ชื่อประเภทการสำรวจ (เช่น วัด, โรงเรียน)'
) COMMENT 'ตารางประเภทเป้าหมายการสำรวจ (Master Data)';

CREATE TABLE master_temple_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE
) COMMENT 'ตารางข้อมูลหลัก: ประเภทวัด';

CREATE TABLE master_denominations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE
) COMMENT 'ตารางข้อมูลหลัก: สังกัด';

-- =================================================================
-- ตารางข้อมูลการสำรวจ (Core Survey Data)
-- =================================================================

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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (type_id) REFERENCES survey_target_types(type_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id),
    FOREIGN KEY (reviewed_by) REFERENCES users(user_id)
) COMMENT 'ตารางข้อมูลเป้าหมายการสำรวจ (หัวใจของระบบ)';

CREATE TABLE temple_details (
    temple_detail_id INT PRIMARY KEY AUTO_INCREMENT,
    target_id INT NOT NULL UNIQUE COMMENT 'FK to survey_targets',
    temple_type_id INT COMMENT 'FK to master_temple_types',
    denomination_id INT COMMENT 'FK to master_denominations',
    monk_count INT DEFAULT 0,
    history_summary TEXT,
    FOREIGN KEY (target_id) REFERENCES survey_targets(target_id) ON DELETE CASCADE,
    FOREIGN KEY (temple_type_id) REFERENCES master_temple_types(id),
    FOREIGN KEY (denomination_id) REFERENCES master_denominations(id)
) COMMENT 'ตารางข้อมูลเฉพาะของวัด';

CREATE TABLE personnel (
    personnel_id INT PRIMARY KEY AUTO_INCREMENT,
    target_id INT NOT NULL,
    role VARCHAR(100) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    FOREIGN KEY (target_id) REFERENCES survey_targets(target_id) ON DELETE CASCADE
) COMMENT 'ตารางบุคลากรที่เกี่ยวข้องกับเป้าหมาย';

CREATE TABLE bank_accounts (
    account_id INT PRIMARY KEY AUTO_INCREMENT,
    target_id INT NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    signatories TEXT COMMENT 'รายนามผู้มีอำนาจเบิกจ่าย',
    FOREIGN KEY (target_id) REFERENCES survey_targets(target_id) ON DELETE CASCADE
) COMMENT 'ตารางบัญชีธนาคาร';

CREATE TABLE attachments (
    attachment_id INT PRIMARY KEY AUTO_INCREMENT,
    target_id INT NOT NULL,
    uploader_user_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    description TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (target_id) REFERENCES survey_targets(target_id) ON DELETE CASCADE,
    FOREIGN KEY (uploader_user_id) REFERENCES users(user_id)
) COMMENT 'ตารางเก็บไฟล์แนบของการสำรวจ';

-- =================================================================
-- ตารางระบบแจ้งเตือน (Notification System)
-- =================================================================

CREATE TABLE notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    related_target_id INT COMMENT 'FK to survey_targets',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (related_target_id) REFERENCES survey_targets(target_id)
) COMMENT 'ตารางแจ้งเตือนในระบบ';

-- =================================================================
-- สร้าง Index เพื่อเพิ่มประสิทธิภาพ
-- =================================================================

CREATE INDEX idx_survey_targets_status ON survey_targets(status);
CREATE INDEX idx_survey_targets_created_by ON survey_targets(created_by);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_timestamp ON activity_logs(timestamp);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_users_approval_status ON users(approval_status);
