-- Migration script with corrected user data
-- This will fix the database structure and add admin user with correct password
-- Password: admin123

USE temple_survey_db_v2;

-- Add missing columns (this will show errors if columns already exist, but that's OK)
ALTER TABLE users ADD COLUMN approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'approved' COMMENT 'สถานะการอนุมัติผู้ใช้งาน';
ALTER TABLE users ADD COLUMN rank VARCHAR(50) COMMENT 'ยศ';
ALTER TABLE users ADD COLUMN position VARCHAR(100) COMMENT 'ตำแหน่ง';
ALTER TABLE users ADD COLUMN department VARCHAR(150) COMMENT 'หน่วยงาน';
ALTER TABLE users ADD COLUMN line_id VARCHAR(50) COMMENT 'Line ID';
ALTER TABLE users ADD COLUMN notes TEXT COMMENT 'หมายเหตุ';
ALTER TABLE users ADD COLUMN last_login TIMESTAMP NULL COMMENT 'วันเวลาที่เข้าสู่ระบบล่าสุด';
ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE COMMENT 'สถานะการใช้งาน';

-- Fix role enum values
UPDATE users SET role = 'Admin' WHERE role = 'admin';
UPDATE users SET role = 'Surveyor' WHERE role = 'surveyor';
ALTER TABLE users MODIFY COLUMN role ENUM('Admin', 'Reviewer', 'Surveyor') NOT NULL;

-- Delete existing admin user if exists
DELETE FROM users WHERE username = 'admin';

-- Insert admin user with correct password hash (password: admin123)
INSERT INTO users (
    username, password_hash, role, first_name, last_name, email, is_active, approval_status, 
    rank, position, department, phone, line_id, notes
) VALUES 
('admin', '$2a$10$1e1Hmxh34prETKo1uu6iheaulAUTu1D/bnzkVEk/8005Vlwsuq8YCjs', 'Admin', 'ผู้ดูแล', 'ระบบ', 'admin@survey.gov.th', TRUE, 'approved', 
'ผู้อำนวยการ', 'ผู้บริหารระบบ', 'ศูนย์เทคโนโลยีสารสนเทศ', '02-111-2222', 'admin_line', 'ผู้ดูแลระบบหลัก');

-- Add additional test users
INSERT INTO users (
    username, password_hash, role, first_name, last_name, email, is_active, approval_status, 
    rank, position, department, phone, line_id, notes
) VALUES 
('surveyor1', '$2a$10$1e1Hmxh34prETKo1uu6iheaulAUTu1D/bnzkVEk/8005Vlwsuq8YCjs', 'Surveyor', 'นายสำรวจ', 'ข้อมูล', 'surveyor1@survey.gov.th', TRUE, 'approved', 
'เจ้าพนักงาน', 'นักสำรวจ', 'ฝ่ายสำรวจภาคสนาม', '02-333-4444', 'surveyor_line', 'พื้นที่รับผิดชอบ: กรุงเทพมหานคร'),

('reviewer1', '$2a$10$1e1Hmxh34prETKo1uu6iheaulAUTu1D/bnzkVEk/8005Vlwsuq8YCjs', 'Reviewer', 'นายตรวจ', 'สอบ', 'reviewer1@survey.gov.th', TRUE, 'approved', 
'นักวิชาการ', 'ผู้ตรวจสอบข้อมูล', 'ฝ่ายตรวจสอบและประเมินผล', '02-222-3333', 'reviewer_line', 'ผู้ตรวจสอบข้อมูลประจำเขตกรุงเทพฯ');

-- Create indexes
CREATE INDEX idx_users_approval_status ON users(approval_status);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Show current users
SELECT 'Current users after migration:' as info;
SELECT user_id, username, role, approval_status, is_active FROM users;

SELECT 'Migration completed! You can now login with username: admin, password: admin123' as status;
