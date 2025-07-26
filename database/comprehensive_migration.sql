-- Comprehensive migration script to fix all database issues
-- This script will:
-- 1. Add missing columns to users table
-- 2. Fix the role enum values
-- 3. Update existing data to match new schema
-- วันที่: 27 กรกฎาคม 2568

USE temple_survey_db_v2;

-- First, let's see current table structure
SELECT 'Current table structure:' as info;
DESCRIBE users;

-- Add missing columns to users table
SELECT 'Adding missing columns...' as info;

-- Add approval_status column
ALTER TABLE users 
ADD COLUMN approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'approved' COMMENT 'สถานะการอนุมัติผู้ใช้งาน' AFTER phone;

-- Add rank column
ALTER TABLE users 
ADD COLUMN rank VARCHAR(50) COMMENT 'ยศ' AFTER approval_status;

-- Add position column
ALTER TABLE users 
ADD COLUMN position VARCHAR(100) COMMENT 'ตำแหน่ง' AFTER rank;

-- Add department column
ALTER TABLE users 
ADD COLUMN department VARCHAR(150) COMMENT 'หน่วยงาน' AFTER position;

-- Add line_id column
ALTER TABLE users 
ADD COLUMN line_id VARCHAR(50) COMMENT 'Line ID' AFTER department;

-- Add notes column
ALTER TABLE users 
ADD COLUMN notes TEXT COMMENT 'หมายเหตุ' AFTER line_id;

-- Add last_login column
ALTER TABLE users 
ADD COLUMN last_login TIMESTAMP NULL COMMENT 'วันเวลาที่เข้าสู่ระบบล่าสุด' AFTER notes;

-- Add is_active column (if it doesn't exist)
ALTER TABLE users 
ADD COLUMN is_active BOOLEAN DEFAULT TRUE COMMENT 'สถานะการใช้งาน' AFTER last_login;

-- Fix the role enum to match code expectations
SELECT 'Fixing role enum values...' as info;

-- First update existing data to match new enum values
UPDATE users SET role = 'Admin' WHERE role = 'admin';
UPDATE users SET role = 'Surveyor' WHERE role = 'surveyor';

-- Modify the role column to have correct enum values
ALTER TABLE users 
MODIFY COLUMN role ENUM('Admin', 'Reviewer', 'Surveyor') NOT NULL;

-- Update existing users with default approval status
UPDATE users SET approval_status = 'approved' WHERE approval_status IS NULL;

-- Create indexes for better performance
CREATE INDEX idx_users_approval_status ON users(approval_status);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Show updated table structure
SELECT 'Updated table structure:' as info;
DESCRIBE users;

-- Show current users
SELECT 'Current users in database:' as info;
SELECT user_id, username, role, approval_status, is_active, created_at FROM users;

SELECT 'Migration completed successfully!' as status;
