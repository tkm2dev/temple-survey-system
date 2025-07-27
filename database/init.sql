-- ระบบสำรวจข้อมูลวัด - Database Schema
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
    idcard VARCHAR(50),
    email VARCHAR(100) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE COMMENT 'สถานะการใช้งาน',
    approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' COMMENT 'สถานะการอนุมัติผู้ใช้งาน',
    approved_by INT NULL COMMENT 'ผู้อนุมัติ (FK to users.user_id)',
    approved_at DATETIME NULL COMMENT 'วันเวลาที่อนุมัติ',
    rank VARCHAR(50) COMMENT 'ยศ',
    position VARCHAR(100) COMMENT 'ตำแหน่งงาน',
    department VARCHAR(150) COMMENT 'หน่วยงาน',
    station VARCHAR(100) COMMENT 'สถานีตำรวจ (สำหรับเจ้าหน้าที่ตำรวจ)',
    phone VARCHAR(20) COMMENT 'เบอร์โทรศัพท์',
    line_id VARCHAR(50) COMMENT 'Line ID',
    notes TEXT COMMENT 'หมายเหตุ',
    last_login TIMESTAMP NULL COMMENT 'วันเวลาที่เข้าสู่ระบบล่าสุด',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    identity_verified BOOLEAN DEFAULT FALSE COMMENT 'สถานะการยืนยันตัวตน',
    identity_verification_method VARCHAR(50) NULL COMMENT 'วิธีการยืนยันตัวตน',
    identity_verified_at DATETIME NULL COMMENT 'วันเวลาที่ยืนยันตัวตน',
    verification_token VARCHAR(64) NULL COMMENT 'Token สำหรับการยืนยันตัวตน'


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
-- ตารางระบบยืนยันตัวตนแบบ DGA (DGA Identity Verification System)
-- =================================================================

-- ตารางการตั้งค่าระบบ (System Settings)
CREATE TABLE system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'รหัสการตั้งค่า (อัตโนมัติ)',
    setting_key VARCHAR(100) NOT NULL UNIQUE COMMENT 'คีย์การตั้งค่า (ไม่ซ้ำ)',
    setting_value TEXT NOT NULL COMMENT 'ค่าการตั้งค่า (รองรับข้อมูลขนาดใหญ่)',
    setting_type ENUM('boolean', 'string', 'number', 'json') DEFAULT 'string' COMMENT 'ประเภทข้อมูล: boolean/string/number/json',
    description TEXT NULL COMMENT 'คำอธิบายการตั้งค่าภาษาไทย',
    category VARCHAR(50) DEFAULT 'general' COMMENT 'หมวดหมู่: general/verification/registration/security/notification',
    is_public BOOLEAN DEFAULT FALSE COMMENT 'เปิดให้เข้าถึงได้โดยไม่ต้องล็อกอิน (สำหรับหน้า Login)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'วันที่สร้างการตั้งค่า',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'วันที่อัปเดตล่าสุด'
) COMMENT='ตารางเก็บการตั้งค่าระบบที่สามารถปรับแต่งได้';

-- ตารางการยืนยัน OTP (OTP Verification)
CREATE TABLE verification_otps (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'รหัสการยืนยัน OTP',
    session_token VARCHAR(255) NOT NULL COMMENT 'โทเค็นเซสชันการยืนยัน',
    otp_code VARCHAR(6) NOT NULL COMMENT 'รหัส OTP 6 หลัก',
    otp_type ENUM('email', 'sms') NOT NULL COMMENT 'ประเภท OTP: อีเมลหรือ SMS',
    contact_info VARCHAR(255) NOT NULL COMMENT 'ข้อมูลติดต่อ (อีเมลหรือเบอร์โทร)',
    attempts INT DEFAULT 0 COMMENT 'จำนวนครั้งที่พยายามกรอก OTP',
    is_used BOOLEAN DEFAULT FALSE COMMENT 'สถานะการใช้งาน OTP',
    expires_at DATETIME NOT NULL COMMENT 'วันเวลาหมดอายุ',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'วันที่สร้าง'
) COMMENT='ตารางเก็บรหัส OTP สำหรับการยืนยันตัวตน';

-- ตารางโทเค็นการยืนยัน (Verification Tokens)
CREATE TABLE verification_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'รหัสโทเค็นการยืนยัน',
    token VARCHAR(255) NOT NULL UNIQUE COMMENT 'โทเค็นเฉพาะสำหรับการยืนยัน',
    user_data JSON NOT NULL COMMENT 'ข้อมูลผู้ใช้ที่รอการยืนยัน (JSON)',
    verification_step ENUM('terms', 'method', 'identity', 'otp', 'complete') DEFAULT 'terms' COMMENT 'ขั้นตอนการยืนยัน',
    is_completed BOOLEAN DEFAULT FALSE COMMENT 'สถานะการยืนยันเสร็จสิ้น',
    expires_at DATETIME NOT NULL COMMENT 'วันเวลาหมดอายุ',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'วันที่สร้าง',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'วันที่อัปเดตล่าสุด'
) COMMENT='ตารางเก็บโทเค็นและข้อมูลการยืนยันตัวตน';

-- ตารางการยืนยันเลขบัตรประชาชน (National ID Verification)
CREATE TABLE national_id_verifications (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'รหัสการยืนยันบัตรประชาชน',
    session_token VARCHAR(255) NOT NULL COMMENT 'โทเค็นเซสชันการยืนยัน',
    national_id VARCHAR(13) NOT NULL COMMENT 'หมายเลขบัตรประชาชน 13 หลัก',
    first_name VARCHAR(100) NOT NULL COMMENT 'ชื่อ',
    last_name VARCHAR(100) NOT NULL COMMENT 'นามสกุล',
    is_verified BOOLEAN DEFAULT FALSE COMMENT 'สถานะการยืนยันผ่านระบบภาครัฐ',
    verification_result JSON COMMENT 'ผลการยืนยันจากระบบภาครัฐ (JSON)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'วันที่ยืนยัน'
) COMMENT='ตารางเก็บข้อมูลการยืนยันบัตรประชาชน';

-- =================================================================
-- Foreign Key Constraints & Indexes
-- =================================================================

-
-- =================================================================
-- ข้อมูลเริ่มต้น (Master Data Initialization)
-- =================================================================

-- ข้อมูลประเภทการสำรวจ (Survey Target Types)
INSERT INTO survey_target_types (type_name) VALUES
('วัด'),
('โรงเรียน'),
('โรงพยาบาล'),
('ศูนย์พัฒนาเด็กเล็ก'),
('วิทยาลัย/มหาวิทยาลัย'),
('สำนักงานเขตการศึกษา'),
('สำนักงานสาธารณสุข'),
('องค์การบริหารส่วนท้องถิ่น'),
('หน่วยงานราชการ'),
('องค์กรเอกชน');

-- ข้อมูลประเภทวัด (Temple Types)
INSERT INTO master_temple_types (name) VALUES
('พระอารามหลวง'),
('พระราชวรวิหาร'),
('วรวิหาร'),
('วัดราษฎร์'),
('สำนักสงฆ์'),
('วัดป่า'),
('วัดเก่า'),
('วัดใหม่'),
('วัดร่วง'),
('อารามใหม่');

-- ข้อมูลสังกัดทางศาสนา (Religious Denominations)
INSERT INTO master_denominations (name) VALUES
('มหานิกาย'),
('ธรรมยุตนิกาย'),
('วัดป่า (ฝ่ายมหานิกาย)'),
('วัดป่า (ฝ่ายธรรมยุต)'),
('สำนักปฏิบัติธรรม'),
('วัดต่างชาติ'),
('ไม่ระบุสังกัด');

-- ข้อมูลผู้ใช้งานเริ่มต้น (Default Users)
INSERT INTO users (username, password_hash, role, first_name, last_name, email, is_active, approval_status, rank, position, department) VALUES
('admin', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/YwjnCw9k9t4kV6K6e', 'Admin', 'ผู้ดูแลระบบ', 'หลัก', 'admin@temple-survey.go.th', TRUE, 'approved', 'นาย', 'ผู้ดูแลระบบ', 'กองเทคโนโลยีสารสนเทศ'),
('reviewer01', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/YwjnCw9k9t4kV6K6e', 'Reviewer', 'สมชาย', 'ตรวจสอบ', 'reviewer01@temple-survey.go.th', TRUE, 'approved', 'นาย', 'เจ้าหน้าที่ตรวจสอบ', 'กองศาสนศึกษา'),
('surveyor01', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/YwjnCw9k9t4kV6K6e', 'Surveyor', 'สมศรี', 'สำรวจ', 'surveyor01@temple-survey.go.th', TRUE, 'approved', 'นาง', 'เจ้าหน้าที่สำรวจ', 'กองศาสนศึกษา');

-- การตั้งค่าระบบเริ่มต้น (Default System Settings)
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, category, is_public) VALUES
-- หมวดหมู่การยืนยันตัวตน (Verification Settings)
('enable_dga_verification', 'false', 'boolean', 'เปิดใช้งานระบบยืนยันตัวตนแบบ DGA (Digital Government Agency)', 'verification', TRUE),
('require_identity_verification', 'false', 'boolean', 'บังคับยืนยันตัวตนสำหรับการลงทะเบียนใหม่', 'verification', FALSE),
('max_otp_attempts', '5', 'number', 'จำนวนครั้งสูงสุดในการกรอก OTP ผิดก่อนถูกล็อก', 'verification', FALSE),
('otp_expiry_minutes', '10', 'number', 'ระยะเวลาหมดอายุของรหัส OTP (นาที)', 'verification', FALSE),

-- หมวดหมู่การลงทะเบียน (Registration Settings)
('allow_registration', 'true', 'boolean', 'อนุญาตให้ผู้ใช้ใหม่ลงทะเบียนเข้าใช้งานระบบ', 'registration', TRUE),
('auto_approve_police', 'false', 'boolean', 'อนุมัติเจ้าหน้าที่ตำรวจอัตโนมัติโดยไม่ต้องรอผู้ดูแลระบบ', 'registration', FALSE),
('require_email_verification', 'false', 'boolean', 'บังคับยืนยันอีเมลก่อนเปิดใช้งานบัญชี', 'registration', FALSE),

-- หมวดหมู่ทั่วไป (General Settings)
('system_name', 'ระบบสำรวจข้อมูลวัด', 'string', 'ชื่อของระบบที่แสดงในหน้าเว็บไซต์', 'general', TRUE),
('maintenance_mode', 'false', 'boolean', 'โหมดปิดปรับปรุงระบบ (ห้ามผู้ใช้เข้าใช้งาน)', 'general', TRUE),

-- หมวดหมู่ความปลอดภัย (Security Settings)
('max_login_attempts', '5', 'number', 'จำนวนครั้งสูงสุดในการเข้าสู่ระบบผิดก่อนถูกล็อก', 'security', FALSE),
('session_timeout_minutes', '480', 'number', 'หมดเวลาเซสชันการใช้งาน (นาที) - ค่าเริ่มต้น 8 ชั่วโมง', 'security', FALSE),
('enable_audit_logging', 'true', 'boolean', 'เปิดใช้งานการบันทึกประวัติการใช้งานระบบ', 'security', FALSE)

ON DUPLICATE KEY UPDATE
setting_value = VALUES(setting_value),
description = VALUES(description),
updated_at = CURRENT_TIMESTAMP;

-- หมายเหตุ: รหัสผ่านทั้งหมดคือ "password123" (ใช้สำหรับทดสอบเท่านั้น)
-- ============================================================================
-- ตารางการตั้งค่าระบบ (System Settings Table)
-- ============================================================================
-- วัตถุประสงค์: เก็บการกำหนดค่าต่างๆ ของระบบที่สามารถปรับเปลี่ยนได้โดย Admin
-- ใช้สำหรับ: ควบคุมฟีเจอร์ต่างๆ เช่น การยืนยันตัวตน DGA, การลงทะเบียน, ความปลอดภัย
-- ============================================================================

CREATE TABLE system_settings (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'รหัสการตั้งค่า (อัตโนมัติ)',
  setting_key VARCHAR(100) NOT NULL UNIQUE COMMENT 'คีย์การตั้งค่า (ไม่ซ้ำ)',
  setting_value TEXT NOT NULL COMMENT 'ค่าการตั้งค่า (รองรับข้อมูลขนาดใหญ่)',
  setting_type ENUM('boolean', 'string', 'number', 'json') DEFAULT 'string' COMMENT 'ประเภทข้อมูล: boolean/string/number/json',
  description TEXT NULL COMMENT 'คำอธิบายการตั้งค่าภาษาไทย',
  category VARCHAR(50) DEFAULT 'general' COMMENT 'หมวดหมู่: general/verification/registration/security/notification',
  is_public BOOLEAN DEFAULT FALSE COMMENT 'เปิดให้เข้าถึงได้โดยไม่ต้องล็อกอิน (สำหรับหน้า Login)',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'วันที่สร้างการตั้งค่า',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'วันที่อัปเดตล่าสุด'
) COMMENT='ตารางเก็บการตั้งค่าระบบที่สามารถปรับแต่งได้';

-- ============================================================================
-- ข้อมูลเริ่มต้นการตั้งค่าระบบ (Default System Settings)
-- ============================================================================
-- การตั้งค่าเริ่มต้นสำหรับระบบใหม่ที่สามารถปรับแต่งได้ในภายหลัง
-- หมวดหมู่การตั้งค่า:
-- - verification: การยืนยันตัวตน
-- - registration: การลงทะเบียน
-- - general: ทั่วไป
-- - security: ความปลอดภัย
-- ============================================================================

INSERT INTO system_settings (setting_key, setting_value, setting_type, description, category, is_public) VALUES
-- หมวดหมู่การยืนยันตัวตน (Verification Settings)
('enable_dga_verification', 'false', 'boolean', 'เปิดใช้งานระบบยืนยันตัวตนแบบ DGA (Digital Government Agency)', 'verification', TRUE),
('require_identity_verification', 'false', 'boolean', 'บังคับยืนยันตัวตนสำหรับการลงทะเบียนใหม่', 'verification', FALSE),
('max_otp_attempts', '5', 'number', 'จำนวนครั้งสูงสุดในการกรอก OTP ผิดก่อนถูกล็อก', 'verification', FALSE),
('otp_expiry_minutes', '10', 'number', 'ระยะเวลาหมดอายุของรหัส OTP (นาที)', 'verification', FALSE),

-- หมวดหมู่การลงทะเบียน (Registration Settings)
('allow_registration', 'true', 'boolean', 'อนุญาตให้ผู้ใช้ใหม่ลงทะเบียนเข้าใช้งานระบบ', 'registration', TRUE),
('auto_approve_police', 'false', 'boolean', 'อนุมัติเจ้าหน้าที่ตำรวจอัตโนมัติโดยไม่ต้องรอผู้ดูแลระบบ', 'registration', FALSE),
('require_email_verification', 'false', 'boolean', 'บังคับยืนยันอีเมลก่อนเปิดใช้งานบัญชี', 'registration', FALSE),

-- หมวดหมู่ทั่วไป (General Settings)
('system_name', 'ระบบสำรวจข้อมูลวัด', 'string', 'ชื่อของระบบที่แสดงในหน้าเว็บไซต์', 'general', TRUE),
('maintenance_mode', 'false', 'boolean', 'โหมดปิดปรับปรุงระบบ (ห้ามผู้ใช้เข้าใช้งาน)', 'general', TRUE),

-- หมวดหมู่ความปลอดภัย (Security Settings)
('max_login_attempts', '5', 'number', 'จำนวนครั้งสูงสุดในการเข้าสู่ระบบผิดก่อนถูกล็อก', 'security', FALSE),
('session_timeout_minutes', '480', 'number', 'หมดเวลาเซสชันการใช้งาน (นาที) - ค่าเริ่มต้น 8 ชั่วโมง', 'security', FALSE),
('enable_audit_logging', 'true', 'boolean', 'เปิดใช้งานการบันทึกประวัติการใช้งานระบบ', 'security', FALSE)

ON DUPLICATE KEY UPDATE
setting_value = VALUES(setting_value),
description = VALUES(description),
updated_at = CURRENT_TIMESTAMP;