-- Test script to verify users table structure
-- ตรวจสอบโครงสร้างตาราง users

USE temple_survey_db_v2;

-- Show current table structure
DESCRIBE users;

-- Show sample of current data
SELECT user_id, username, approval_status, rank, position, department, phone 
FROM users 
LIMIT 5;

-- Count users by approval status
SELECT 
    approval_status, 
    COUNT(*) as count 
FROM users 
GROUP BY approval_status;

-- Check if indexes exist
SHOW INDEX FROM users;
