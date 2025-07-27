-- สคริปต์อัปเดตตาราง users เพื่อเพิ่มระบบการแจ้งเตือนและการอนุมัติ
-- วันที่: 27 กรกฎาคม 2568
-- วัตถุประสงค์: เพิ่มคอลัมน์สำหรับติดตามผู้อนุมัติและวันที่อนุมัติ

USE temple_survey_db_v2;

-- ตรวจสอบและเพิ่มคอลัมน์ approved_by ถ้ายังไม่มี
SET @sql = (
    SELECT IF(
        (SELECT COUNT(*) 
         FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = 'temple_survey_db_v2' 
         AND TABLE_NAME = 'users' 
         AND COLUMN_NAME = 'approved_by') = 0,
        'ALTER TABLE users ADD COLUMN approved_by INT NULL COMMENT ''ผู้อนุมัติ (FK to users.user_id)'' AFTER approval_status;',
        'SELECT ''Column approved_by already exists'' as result;'
    )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ตรวจสอบและเพิ่มคอลัมน์ approved_at ถ้ายังไม่มี
SET @sql = (
    SELECT IF(
        (SELECT COUNT(*) 
         FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = 'temple_survey_db_v2' 
         AND TABLE_NAME = 'users' 
         AND COLUMN_NAME = 'approved_at') = 0,
        'ALTER TABLE users ADD COLUMN approved_at DATETIME NULL COMMENT ''วันเวลาที่อนุมัติ'' AFTER approved_by;',
        'SELECT ''Column approved_at already exists'' as result;'
    )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- เพิ่ม Foreign Key constraint สำหรับ approved_by (ถ้ายังไม่มี)
SET @sql = (
    SELECT IF(
        (SELECT COUNT(*) 
         FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
         WHERE TABLE_SCHEMA = 'temple_survey_db_v2' 
         AND TABLE_NAME = 'users' 
         AND CONSTRAINT_NAME = 'fk_users_approved_by') = 0,
        'ALTER TABLE users ADD CONSTRAINT fk_users_approved_by FOREIGN KEY (approved_by) REFERENCES users(user_id) ON DELETE SET NULL;',
        'SELECT ''Foreign key constraint fk_users_approved_by already exists'' as result;'
    )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- สร้างการแจ้งเตือนตัวอย่างสำหรับ Admin เกี่ยวกับการใช้งานระบบการแจ้งเตือนใหม่
INSERT IGNORE INTO notifications (user_id, title, message, type, is_read, created_at)
SELECT 
    u.user_id,
    'ระบบการแจ้งเตือนใหม่เปิดใช้งานแล้ว! 🎉',
    'ระบบการแจ้งเตือนอัตโนมัติได้เปิดใช้งานแล้ว คุณจะได้รับการแจ้งเตือนเมื่อ:
    
✅ มีผู้ใช้งานใหม่ลงทะเบียน
✅ มีการเปลี่ยนแปลงสถานะการสำรวจ
✅ มีกิจกรรมสำคัญในระบบ

การแจ้งเตือนจะช่วยให้คุณติดตามความเคลื่อนไหวของระบบได้ง่ายขึ้น',
    'info',
    FALSE,
    NOW()
FROM users u 
WHERE u.role = 'Admin' 
AND u.is_active = TRUE
AND u.approval_status = 'approved';

-- แสดงผลลัพธ์
SELECT 
    'Notification system setup completed successfully!' as status,
    COUNT(*) as admin_notifications_created
FROM notifications 
WHERE title LIKE '%ระบบการแจ้งเตือนใหม่%';

-- แสดงโครงสร้างตารางที่อัปเดตแล้ว
SHOW COLUMNS FROM users WHERE Field IN ('approved_by', 'approved_at');

COMMIT;
