-- ข้อมูลตั้งต้นสำหรับระบบ (Initial Data)

USE temple_survey_db_v2;

-- =================================================================
-- ใส่ข้อมูล Master Data
-- =================================================================

-- ประเภทการสำรวจ
INSERT INTO survey_target_types (type_name) VALUES 
('วัด'),
('โรงเรียน'),
('สำนักงานเขต'),
('โรงพยาบาล');

-- ประเภทวัด
INSERT INTO master_temple_types (name) VALUES 
('วัดราชวรวิหาร'),
('วัดราชวรมหาวิหาร'),
('วัดวรวิหาร'),
('วัดวรมหาวิหาร'),
('วัดสามัญ');

-- สังกัด
INSERT INTO master_denominations (name) VALUES 
('มหานิกาย'),
('ธรรมยุตินิกาย'),
('อื่นๆ');

-- =================================================================
-- สร้างผู้ใช้ตั้งต้น
-- =================================================================

-- รหัสผ่าน: admin123 (hashed)
INSERT INTO users (
    username, password_hash, role, first_name, last_name, email, is_active, approval_status, 
    rank, position, department, phone, line_id, notes
) VALUES 
('admin', '$2b$10$rOH7vT8FKZgCzN7Nz8jMuOuLJKHx7GJ9BvQhGzKNmKhJ6YzJq5K5m', 'Admin', 'ผู้ดูแล', 'ระบบ', 'admin@survey.gov.th', TRUE, 'approved', 
'ผู้อำนวยการ', 'ผู้บริหารระบบ', 'ศูนย์เทคโนโลยีสารสนเทศ', '02-111-2222', 'admin_line', 'ผู้ดูแลระบบหลัก'),

('reviewer1', '$2b$10$rOH7vT8FKZgCzN7Nz8jMuOuLJKHx7GJ9BvQhGzKNmKhJ6YzJq5K5m', 'Reviewer', 'นายตรวจ', 'สอบ', 'reviewer1@survey.gov.th', TRUE, 'approved', 
'นักวิชาการ', 'ผู้ตรวจสอบข้อมูล', 'ฝ่ายตรวจสอบและประเมินผล', '02-222-3333', 'reviewer_line', 'ผู้ตรวจสอบข้อมูลประจำเขตกรุงเทพฯ'),

('surveyor1', '$2b$10$rOH7vT8FKZgCzN7Nz8jMuOuLJKHx7GJ9BvQhGzKNmKhJ6YzJq5K5m', 'Surveyor', 'นายสำรวจ', 'ข้อมูล', 'surveyor1@survey.gov.th', TRUE, 'approved', 
'เจ้าพนักงาน', 'นักสำรวจ', 'ฝ่ายสำรวจภาคสนาม', '02-333-4444', 'surveyor_line', 'พื้นที่รับผิดชอบ: กรุงเทพมหานคร'),

-- ผู้ใช้ที่อยู่ระหว่างรออนุมัติ
('pending_user1', '$2b$10$rOH7vT8FKZgCzN7Nz8jMuOuLJKHx7GJ9BvQhGzKNmKhJ6YzJq5K5m', 'Surveyor', 'นายรอ', 'อนุมัติ', 'pending1@survey.gov.th', TRUE, 'pending', 
'ร้อยตรี', 'เจ้าหน้าที่สำรวจ', 'ฝ่ายภูมิศาสตร์สารสนเทศ', '02-444-5555', 'pending_line1', 'สมัครใช้งานเมื่อ 3 วันที่แล้ว'),

-- ผู้ใช้ที่ถูกปฏิเสธ
('rejected_user1', '$2b$10$rOH7vT8FKZgCzN7Nz8jMuOuLJKHx7GJ9BvQhGzKNmKhJ6YzJq5K5m', 'Surveyor', 'นางสาวถูก', 'ปฏิเสธ', 'rejected1@survey.gov.th', TRUE, 'rejected', 
'พนักงาน', 'ผู้ช่วยสำรวจ', 'ฝ่ายข้อมูลศาสนสถาน', '02-555-6666', 'rejected_line1', 'ข้อมูลไม่ครบถ้วน');

-- =================================================================
-- ข้อมูลตัวอย่างสำหรับทดสอบ
-- =================================================================

-- ข้อมูลวัดตัวอย่าง
INSERT INTO survey_targets (type_id, target_name, address, subdistrict, district, province, postal_code, gps_latitude, gps_longitude, status, created_by) VALUES 
(1, 'วัดพระแก้ว', '2 ถนนนาพระลาน แขวงพระบรมมหาราชวัง', 'พระนคร', 'พระนคร', 'กรุงเทพมหานคร', '10200', 13.7510, 100.4923, 'Approved', 3),
(1, 'วัดอรุณราชวราราม', '34 ถนนอรุณอมรินทร์ แขวงวัดอรุณ', 'บางกอกใหญ่', 'บางกอกใหญ่', 'กรุงเทพมหานคร', '10600', 13.7437, 100.4887, 'Pending Review', 3),
(1, 'วัดพระศรีรัตนศาสดาราม', '2 ถนนนาพระลาน แขวงพระบรมมหาราชวัง', 'พระนคร', 'พระนคร', 'กรุงเทพมหานคร', '10200', 13.7515, 100.4925, 'Draft', 3);

-- ข้อมูลรายละเอียดวัด
INSERT INTO temple_details (target_id, temple_type_id, denomination_id, monk_count, history_summary) VALUES 
(1, 1, 1, 25, 'วัดพระแก้วเป็นวัดที่สำคัญที่สุดในประเทศไทย สร้างขึ้นในสมัยพระบาทสมเด็จพระพุทธยอดฟ้าจุฬาโลกมหาราช'),
(2, 3, 1, 15, 'วัดอรุณราชวรารามเป็นวัดโบราณที่มีประวัติศาสตร์ยาวนาน มีพระปรางค์ที่สูงและสวยงาม'),
(3, 1, 1, 30, 'วัดพระศรีรัตนศาสดารามเป็นวัดหลวงที่สำคัญ ตั้งอยู่ในพระบรมมหาราชวัง');

-- ข้อมูลบุคลากร
INSERT INTO personnel (target_id, role, first_name, last_name, phone) VALUES 
(1, 'เจ้าอาวาส', 'พระมหา', 'สมชาย', '02-123-4567'),
(1, 'รองเจ้าอาวาส', 'พระครู', 'สมศักดิ์', '02-123-4568'),
(2, 'เจ้าอาวาส', 'พระมหา', 'สมปอง', '02-234-5678'),
(3, 'เจ้าอาวาส', 'พระราช', 'คณะ', '02-345-6789');

-- ข้อมูลบัญชีธนาคาร
INSERT INTO bank_accounts (target_id, bank_name, account_number, account_name, signatories) VALUES 
(1, 'ธนาคารกรุงเทพ', '123-4-56789-0', 'วัดพระแก้ว', 'พระมหาสมชาย, พระครูสมศักดิ์'),
(2, 'ธนาคารไทยพาณิชย์', '234-5-67890-1', 'วัดอรุณราชวราราม', 'พระมหาสมปอง'),
(3, 'ธนาคารกสิกรไทย', '345-6-78901-2', 'วัดพระศรีรัตนศาสดาราม', 'พระราชคณะ');
