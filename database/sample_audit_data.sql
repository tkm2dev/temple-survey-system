-- เพิ่มข้อมูลตัวอย่างสำหรับ Audit Logs
USE temple_survey_db_v2;

-- เพิ่มข้อมูลตัวอย่างใน activity_logs
INSERT INTO activity_logs (user_id, action_type, target_table, target_id, details, ip_address, timestamp) VALUES
(1, 'LOGIN', NULL, NULL, '{"login_method": "username", "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}', '192.168.1.100', '2024-12-27 08:30:00'),
(1, 'CREATE', 'survey_targets', 1, '{"target_name": "วัดพระแก้ว", "status": "Draft"}', '192.168.1.100', '2024-12-27 08:35:00'),
(2, 'LOGIN', NULL, NULL, '{"login_method": "username", "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}', '192.168.1.101', '2024-12-27 09:00:00'),
(2, 'UPDATE', 'survey_targets', 1, '{"old_status": "Draft", "new_status": "Pending Review"}', '192.168.1.101', '2024-12-27 09:15:00'),
(1, 'APPROVE', 'survey_targets', 1, '{"old_status": "Pending Review", "new_status": "Approved"}', '192.168.1.100', '2024-12-27 10:00:00'),
(3, 'LOGIN', NULL, NULL, '{"login_method": "username", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"}', '192.168.1.102', '2024-12-27 10:30:00'),
(3, 'CREATE', 'temple_details', 1, '{"temple_type": "วัดราษฎร์", "monk_count": 5}', '192.168.1.102', '2024-12-27 10:45:00'),
(1, 'DELETE', 'attachments', 5, '{"file_name": "old_document.pdf", "reason": "outdated"}', '192.168.1.100', '2024-12-27 11:00:00'),
(2, 'EXPORT', 'survey_targets', NULL, '{"export_format": "CSV", "record_count": 25}', '192.168.1.101', '2024-12-27 11:30:00'),
(1, 'LOGOUT', NULL, NULL, '{"session_duration": "180 minutes"}', '192.168.1.100', '2024-12-27 12:00:00'),
(3, 'UPDATE', 'personnel', 3, '{"old_role": "เจ้าอาวาส", "new_role": "รองเจ้าอาวาส"}', '192.168.1.102', '2024-12-27 14:15:00'),
(2, 'CREATE', 'bank_accounts', 2, '{"bank_name": "ธนาคารกรุงเทพ", "account_number": "123-456-789"}', '192.168.1.101', '2024-12-27 15:00:00'),
(1, 'PROFILE_UPDATE', 'users', 1, '{"updated_fields": ["phone", "email"]}', '192.168.1.100', '2024-12-27 16:00:00'),
(2, 'PASSWORD_CHANGE', 'users', 2, '{"password_strength": "strong"}', '192.168.1.101', '2024-12-27 16:30:00'),
(3, 'VIEW', 'survey_targets', 1, '{"accessed_sections": ["basic_info", "personnel"]}', '192.168.1.102', '2024-12-27 17:00:00'),
(1, 'BULK_UPDATE', 'survey_targets', NULL, '{"updated_count": 15, "field": "status", "new_value": "Approved"}', '192.168.1.100', '2024-12-27 17:30:00'),
(2, 'REJECT', 'survey_targets', 8, '{"reason": "ข้อมูลไม่ครบถ้วน", "old_status": "Pending Review"}', '192.168.1.101', '2024-12-27 18:00:00'),
(1, 'LOGIN', NULL, NULL, '{"login_method": "username", "user_agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)"}', '192.168.1.200', '2024-12-27 18:30:00'),
(3, 'EXPORT', 'personnel', NULL, '{"export_format": "Excel", "record_count": 45}', '192.168.1.102', '2024-12-27 19:00:00'),
(1, 'LOGOUT', NULL, NULL, '{"session_duration": "60 minutes"}', '192.168.1.200', '2024-12-27 19:30:00');

-- เพิ่มข้อมูล activity สำหรับวันนี้
INSERT INTO activity_logs (user_id, action_type, target_table, target_id, details, ip_address) VALUES
(1, 'LOGIN', NULL, NULL, '{"login_method": "username", "today": true}', '192.168.1.100'),
(1, 'UPDATE', 'survey_targets', 2, '{"today_activity": true}', '192.168.1.100'),
(2, 'LOGIN', NULL, NULL, '{"login_method": "username", "today": true}', '192.168.1.101'),
(2, 'CREATE', 'survey_targets', 10, '{"today_activity": true}', '192.168.1.101'),
(3, 'LOGIN', NULL, NULL, '{"login_method": "username", "today": true}', '192.168.1.102'),
(3, 'VIEW', 'survey_targets', 5, '{"today_activity": true}', '192.168.1.102'),
(1, 'APPROVE', 'survey_targets', 10, '{"today_activity": true}', '192.168.1.100');
