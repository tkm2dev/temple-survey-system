-- Create user_settings table for storing individual user preferences
CREATE TABLE IF NOT EXISTS `user_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `setting_key` VARCHAR(100) NOT NULL,
  `setting_value` TEXT NOT NULL,
  `setting_type` ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_setting` (`user_id`, `setting_key`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_setting_key` (`setting_key`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert some default system settings if they don't exist
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `category`, `is_public`) VALUES
('site_name', 'ระบบสำรวจข้อมูลวัด', 'string', 'ชื่อของเว็บไซต์', 'general', 1),
('site_description', 'ระบบบริหารจัดการและสำรวจข้อมูลวัดในประเทศไทย', 'string', 'คำอธิบายเว็บไซต์', 'general', 1),
('maintenance_mode', 'false', 'boolean', 'โหมดบำรุงรักษาระบบ', 'system', 0),
('registration_enabled', 'true', 'boolean', 'เปิดให้สมัครสมาชิกใหม่', 'users', 1),
('email_verification', 'true', 'boolean', 'จำเป็นต้องยืนยันอีเมล', 'users', 1),
('max_file_size', '10485760', 'number', 'ขนาดไฟล์สูงสุด (bytes)', 'uploads', 0),
('session_timeout', '3600', 'number', 'เวลาหมดอายุเซสชัน (วินาที)', 'security', 0),
('backup_enabled', 'true', 'boolean', 'เปิดใช้งานการสำรองข้อมูลอัตโนมัติ', 'backup', 0),
('backup_frequency', 'daily', 'string', 'ความถี่ในการสำรองข้อมูล', 'backup', 0),
('api_rate_limit', '100', 'number', 'จำกัดการเรียก API ต่อนาที', 'api', 0),
('default_language', 'th', 'string', 'ภาษาเริ่มต้นของระบบ', 'localization', 1),
('default_timezone', 'Asia/Bangkok', 'string', 'เขตเวลาเริ่มต้น', 'localization', 1),
('allow_user_registration', 'true', 'boolean', 'อนุญาตให้ผู้ใช้สมัครสมาชิกเอง', 'users', 1),
('require_admin_approval', 'true', 'boolean', 'ต้องได้รับการอนุมัติจากผู้ดูแลระบบ', 'users', 1),
('notification_email_enabled', 'true', 'boolean', 'เปิดใช้งานการแจ้งเตือนทางอีเมล', 'notifications', 1),
('notification_retention_days', '30', 'number', 'จำนวนวันเก็บการแจ้งเตือน', 'notifications', 0);
