เอกสารข้อกำหนดโครงการ (Project Specification): ระบบสำรวจข้อมูลภาคสนาม
เวอร์ชัน: 1.1 (Final)
วันที่: 26 กรกฎาคม 2568

1. บทสรุปสำหรับผู้บริหาร (Project Overview)
   โครงการนี้มีเป้าหมายเพื่อพัฒนาระบบเว็บแอปพลิเคชันกลางสำหรับหน่วยงานราชการ เพื่อใช้ในการสำรวจ, จัดเก็บ, ตรวจทาน, และจัดการข้อมูลภาคสนามได้อย่างเป็นระบบ, มีประสิทธิภาพ, และโปร่งใสสูงสุด โดยเจ้าหน้าที่ภาคสนาม สามารถเข้าใช้งานได้อย่างเต็มรูปแบบผ่านอุปกรณ์พกพา (Mobile Device) จากทุกที่ ระบบถูกออกแบบด้วยสถาปัตยกรรมที่ยืดหยุ่น โดยมี "ข้อมูลวัด" เป็นโครงการนำร่อง และสามารถขยายผลไปสู่การสำรวจประเภทอื่นๆ ในอนาคตได้

2. เทคโนโลยีหลัก (Core Technology Stack)
   Backend: Node.js (Express.js)

Frontend: Vue 3 (Composition API) (Vite) - font Sarabun (สำหรับภาษาไทย) - font Awesome (สำหรับไอคอน)

UI Library: Bootstrap 5 (เน้นการใช้งาน Responsive Grid System)

Database: MySQL (เวอร์ชัน 8+) รองรับ JSON Data Type

Authentication: JSON Web Tokens (JWT)

3. โครงสร้างผู้ใช้งานและสิทธิ์ (User Roles & Permissions)
   Admin (ผู้ดูแลระบบ):

การจัดการผู้ใช้: มีสิทธิ์เต็มในการจัดการบัญชีผู้ใช้ทั้งหมด (สร้าง/แก้ไข/ลบ/เปลี่ยนบทบาท/กำหนดสถานะ)

การจัดการข้อมูล: เข้าถึงและจัดการข้อมูลการสำรวจและข้อมูลหลัก (Master Data) ได้ทุกส่วน

การตรวจสอบ: เข้าถึง Audit Trail และ Log การใช้งานทั้งหมด

Reviewer (ผู้ตรวจทานข้อมูล):

หน้าที่หลัก: ตรวจสอบ, แก้ไข, และอนุมัติข้อมูลที่ Surveyor ส่งมา

ข้อจำกัด: ไม่สามารถสร้างหรือลบรายการสำรวจ และไม่สามารถจัดการผู้ใช้ได้

Surveyor (ผู้สำรวจ):

หน้าที่หลัก: สร้างรายการสำรวจและบันทึกข้อมูลภาคสนามที่ตนรับผิดชอบ

ข้อจำกัด: เข้าถึงได้เฉพาะข้อมูลของตนเอง

4. สถาปัตยกรรมและฟังก์ชันระบบ (System Architecture & Functionality)
   หลักการเชิงสถาปัตยกรรม:

ความยืดหยุ่นเพื่ออนาคต (Future-Proof): ระบบถูกสร้างบนโมเดลกลาง "Survey Target" ทำให้สามารถเพิ่มประเภทการสำรวจใหม่ๆ ได้โดยไม่ต้องรื้อโครงสร้าง

การจัดการข้อมูลหลัก (Master Data): ข้อมูลที่เป็นตัวเลือก (เช่น ประเภทวัด, สังกัด) จะถูกแยกไปเก็บในตาราง Master Data เพื่อให้ Admin จัดการได้เอง

กระบวนการทำงานหลัก (Core Workflow):

Surveyor สร้างและกรอกข้อมูล → สถานะ รอตรวจสอบ

ระบบส่ง Notification แจ้งเตือน Reviewer ที่เกี่ยวข้อง

Reviewer ตรวจสอบข้อมูล → เปลี่ยนสถานะเป็น อนุมัติ หรือ ส่งกลับแก้ไข

ระบบส่ง Notification แจ้งเตือน Surveyor เจ้าของงานให้ทราบผล

ฟังก์ชันสำคัญของระบบ (Key Features):

การจัดการข้อมูลสำรวจ:

บันทึกข้อมูลได้หลากหลายมิติ (ข้อมูลพื้นฐาน, บุคลากร, บัญชี)

การแนบไฟล์สำหรับ Mobile: ผู้ใช้สามารถอัปโหลดไฟล์รูปภาพจากคลังภาพในมือถือ หรือ เปิดกล้องเพื่อถ่ายภาพใหม่ ประกอบการสำรวจได้โดยตรง

ระบบค้นหาและกรองข้อมูลขั้นสูง: ค้นหาข้อมูลจากหลายเงื่อนไข โดยตัวเลือกใน Filter จะถูกดึงมาจากตาราง Master Data

ระบบตรวจสอบย้อนกลับ (Advanced Audit Trail): ทุกการกระทำที่สำคัญ (สร้าง, แก้ไข, ลบ, ล็อกอิน) จะถูกบันทึกลงในตาราง activity_logs โดยอัตโนมัติ

ระบบแจ้งเตือน (Notification System): แจ้งเตือนผู้ใช้ภายในแอปพลิเคชันตามขั้นตอนการทำงาน

การนำเข้าข้อมูล (Data Import): Admin สามารถนำเข้าข้อมูลตั้งต้นจำนวนมากผ่านไฟล์ Excel หรือ CSV (ฟังก์ชันสำหรับ Desktop)

การส่งออกข้อมูล (Data Export): ผู้ใช้ที่มีสิทธิ์สามารถส่งออกข้อมูลในรูปแบบไฟล์ต่างๆ ได้ (ฟังก์ชันสำหรับ Desktop)

5. แนวทางการออกแบบ UI/UX (UI/UX Design Guidelines)
   ยึดตามรูปแบบดีไซน์ที่สะอาดตา, ทันสมัย, และเป็นทางการ โดยให้ความสำคัญกับ Mobile-First เป็นอันดับแรก

Layout & Style:

ใช้ Layout แบบ Admin Dashboard ประกอบด้วย Sidebar (พับได้), Header, และ Content Area

ใช้ Card Design ที่มีเงา, เน้นพื้นที่ว่าง, และใช้โทนสีหลักเป็นสีน้ำเงิน

ส่วนประกอบหลัก (Desktop View):

Dashboard: การ์ดสรุปข้อมูล (KPIs), กราฟแท่ง, และกราฟโดนัท

ตารางข้อมูล: มี Filter, ป้ายสถานะ (Badges), ปุ่มจัดการ (Action Buttons), และการแบ่งหน้า (Pagination)

แนวทางสำหรับ Mobile (Mobile-First & Responsive Design):

Responsive Layout: ทุกหน้าต้องใช้ Bootstrap 5 Grid System เพื่อให้เนื้อหาจัดเรียงตัวเองในแนวตั้งคอลัมน์เดียวบนจอมือถือ

Navigation: Sidebar จะต้องถูกซ่อนเป็นค่าเริ่มต้น และเรียกใช้งานผ่าน "ปุ่ม Hamburger" บน Header เท่านั้น

การแสดงผลตารางข้อมูล: ทำให้ตารางสามารถ เลื่อนซ้าย-ขวาได้ (Horizontally Scrollable) หรือออกแบบให้แต่ละแถวยุบรวมเป็น "Card View" บนจอมือถือ

ฟอร์ม: ต้องเป็นแบบ 1 คอลัมน์ และมีปุ่ม/ช่อง Input ที่ ใช้นิ้วกดได้สะดวก (Touch-Friendly)

Dashboard: การ์ดสรุปข้อมูลและกราฟต่างๆ จะต้องเรียงซ้อนกันในแนวตั้ง

6. โครงสร้างฐานข้อมูลฉบับสมบูรณ์ (Final Database Schema)
   SQL

-- =================================================================
-- ตารางข้อมูลหลัก (Master Data & System)
-- =================================================================

CREATE TABLE users (
user_id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'รหัสผู้ใช้งาน',
username VARCHAR(50) NOT NULL UNIQUE, password_hash VARCHAR(255) NOT NULL,
role ENUM('Admin', 'Reviewer', 'Surveyor') NOT NULL,
first_name VARCHAR(100), last_name VARCHAR(100), email VARCHAR(100) NOT NULL UNIQUE,
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
user_id INT NOT NULL, action_type VARCHAR(50) NOT NULL COMMENT 'ประเภทการกระทำ (CREATE, UPDATE, LOGIN)',
target_table VARCHAR(50), target_id INT,
details TEXT COMMENT 'รายละเอียดการเปลี่ยนแปลง (JSON: old_data, new_data)',
ip_address VARCHAR(45), timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (user_id) REFERENCES users(user_id)
) COMMENT 'ตารางบันทึกประวัติการใช้งานและแก้ไขข้อมูลทั้งหมด (Audit Trail)';

CREATE TABLE survey_target_types (
type_id INT PRIMARY KEY AUTO_INCREMENT,
type_name VARCHAR(100) NOT NULL UNIQUE COMMENT 'ชื่อประเภทการสำรวจ (เช่น วัด, โรงเรียน)'
) COMMENT 'ตารางประเภทเป้าหมายการสำรวจ (Master Data)';

CREATE TABLE master_temple_types (
id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(100) NOT NULL UNIQUE
) COMMENT 'ตารางข้อมูลหลัก: ประเภทวัด';

CREATE TABLE master_denominations (
id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(100) NOT NULL UNIQUE
) COMMENT 'ตารางข้อมูลหลัก: สังกัด';

-- =================================================================
-- ตารางข้อมูลการสำรวจ (Core Survey Data)
-- =================================================================

CREATE TABLE survey_targets (
target_id INT PRIMARY KEY AUTO_INCREMENT,
type_id INT NOT NULL COMMENT 'FK to survey_target_types',
target_name VARCHAR(255) NOT NULL,
address TEXT, subdistrict VARCHAR(100), district VARCHAR(100), province VARCHAR(100), postal_code VARCHAR(5),
gps_latitude DECIMAL(10, 8), gps_longitude DECIMAL(11, 8),
status ENUM('Draft', 'Pending Review', 'Approved', 'Needs Revision') NOT NULL DEFAULT 'Draft',
created_by INT NOT NULL COMMENT 'FK to users.user_id',
reviewed_by INT COMMENT 'FK to users.user_id',
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
FOREIGN KEY (type_id) REFERENCES survey_target_types(type_id)
) COMMENT 'ตารางข้อมูลเป้าหมายการสำรวจ (หัวใจของระบบ)';

CREATE TABLE temple_details (
temple_detail_id INT PRIMARY KEY AUTO_INCREMENT,
target_id INT NOT NULL UNIQUE COMMENT 'FK to survey_targets',
temple_type_id INT COMMENT 'FK to master_temple_types',
denomination_id INT COMMENT 'FK to master_denominations',
monk_count INT DEFAULT 0, history_summary TEXT,
FOREIGN KEY (target_id) REFERENCES survey_targets(target_id) ON DELETE CASCADE,
FOREIGN KEY (temple_type_id) REFERENCES master_temple_types(id),
FOREIGN KEY (denomination_id) REFERENCES master_denominations(id)
) COMMENT 'ตารางข้อมูลเฉพาะของวัด';

CREATE TABLE personnel (
personnel_id INT PRIMARY KEY AUTO_INCREMENT,
target_id INT NOT NULL, role VARCHAR(100) NOT NULL,
first_name VARCHAR(100), last_name VARCHAR(100), phone VARCHAR(20),
FOREIGN KEY (target_id) REFERENCES survey_targets(target_id) ON DELETE CASCADE
) COMMENT 'ตารางบุคลากรที่เกี่ยวข้องกับเป้าหมาย';

CREATE TABLE bank_accounts (
account_id INT PRIMARY KEY AUTO_INCREMENT,
target_id INT NOT NULL, bank_name VARCHAR(100) NOT NULL,
account_number VARCHAR(50) NOT NULL, account_name VARCHAR(255) NOT NULL,
signatories TEXT COMMENT 'รายนามผู้มีอำนาจเบิกจ่าย',
FOREIGN KEY (target_id) REFERENCES survey_targets(target_id) ON DELETE CASCADE
) COMMENT 'ตารางบัญชีธนาคาร';

CREATE TABLE attachments (
attachment_id INT PRIMARY KEY AUTO_INCREMENT,
target_id INT NOT NULL, uploader_user_id INT NOT NULL,
file_name VARCHAR(255) NOT NULL, file_path VARCHAR(255) NOT NULL,
file_type VARCHAR(100), description TEXT,
uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (target_id) REFERENCES survey_targets(target_id) ON DELETE CASCADE,
FOREIGN KEY (uploader_user_id) REFERENCES users(user_id)
) COMMENT 'ตารางเก็บไฟล์แนบของการสำรวจ';
