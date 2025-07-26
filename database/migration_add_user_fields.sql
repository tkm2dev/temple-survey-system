-- Migration script to add new fields to users table
-- เพิ่มฟิลด์ใหม่ในตาราง users
-- วันที่: 27 กรกฎาคม 2568

USE temple_survey_db_v2;

-- Add new columns to users table
ALTER TABLE users 
ADD COLUMN approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' COMMENT 'สถานะการอนุมัติผู้ใช้งาน' AFTER is_active,
ADD COLUMN rank VARCHAR(50) COMMENT 'ยศ' AFTER approval_status,
ADD COLUMN position VARCHAR(100) COMMENT 'ตำแหน่ง' AFTER rank,
ADD COLUMN department VARCHAR(150) COMMENT 'หน่วยงาน' AFTER position,
ADD COLUMN phone VARCHAR(20) COMMENT 'เบอร์โทรศัพท์' AFTER department,
ADD COLUMN line_id VARCHAR(50) COMMENT 'Line ID' AFTER phone,
ADD COLUMN notes TEXT COMMENT 'หมายเหตุ' AFTER line_id,
ADD COLUMN last_login TIMESTAMP NULL COMMENT 'วันเวลาที่เข้าสู่ระบบล่าสุด' AFTER notes,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER last_login;

-- Update existing users to have approved status by default
UPDATE users SET approval_status = 'approved' WHERE approval_status IS NULL;

-- Create index for approval_status for better performance
CREATE INDEX idx_users_approval_status ON users(approval_status);

SELECT 'Migration completed successfully' as status;
