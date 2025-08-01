เอกสารข้อกำหนดโครงการ (Project Specification): ระบบสำรวจข้อมูลวัด
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

---

## 🔒 ระบบยืนยันตัวตนแบบ DGA และการตั้งค่าระบบ (DGA Identity Verification & System Settings)

### ระบบยืนยันตัวตนแบบ DGA (DGA Identity Verification System)

เป็นระบบยืนยันตัวตนที่เทียบเท่ากับระบบของ Digital Government Agency (DGA) ประกอบด้วย:

**ขั้นตอนการยืนยันตัวตน:**

1. **ยอมรับข้อตกลง**: ผู้ใช้ยืนยันการยอมรับเงื่อนไขการใช้งาน
2. **เลือกวิธีการยืนยัน**: อีเมล, SMS, หรือหมายเลขบัตรประชาชน
3. **ยืนยันตัวตน**: กรอกข้อมูลส่วนตัวและหมายเลขบัตรประชาชน
4. **ยืนยัน OTP**: กรอกรหัสยืนยันที่ได้รับทาง SMS หรืออีเมล
5. **สมบูรณ์**: การยืนยันตัวตนเสร็จสิ้น

**ฟีเจอร์หลัก:**

- รองรับการยืนยันผ่าน Email OTP และ SMS OTP
- ตรวจสอบหมายเลขบัตรประชาชนกับฐานข้อมูลภาครัฐ (จำลอง)
- ระบบนับถอยหลังสำหรับ OTP และการส่งใหม่
- UI ที่เป็นมิตรกับมือถือและสอดคล้องกับมาตรฐาน Government Design System
- บันทึก Audit Log ทุกขั้นตอนการยืนยัน

### ระบบการตั้งค่าระบบ (System Settings Management)

ระบบจัดการการตั้งค่าที่ให้ Admin สามารถควบคุมฟีเจอร์ต่างๆ ของระบบได้:

**หมวดหมู่การตั้งค่า:**

1. **การยืนยันตัวตน (Verification)**

   - `enable_dga_verification`: เปิด/ปิดระบบยืนยันตัวตน DGA
   - `require_identity_verification`: บังคับยืนยันตัวตนสำหรับการลงทะเบียนใหม่
   - `max_otp_attempts`: จำนวนครั้งสูงสุดในการกรอก OTP ผิด
   - `otp_expiry_minutes`: ระยะเวลาหมดอายุของรหัส OTP

2. **การลงทะเบียน (Registration)**

   - `allow_registration`: อนุญาตให้ผู้ใช้ใหม่ลงทะเบียน
   - `auto_approve_police`: อนุมัติเจ้าหน้าที่ตำรวจอัตโนมัติ
   - `require_email_verification`: บังคับยืนยันอีเมลก่อนใช้งาน

3. **ความปลอดภัย (Security)**

   - `max_login_attempts`: จำนวนครั้งสูงสุดในการเข้าสู่ระบบผิด
   - `session_timeout_minutes`: หมดเวลาเซสชันการใช้งาน
   - `enable_audit_logging`: เปิดใช้งานการบันทึกประวัติ

4. **ทั่วไป (General)**
   - `system_name`: ชื่อของระบบ
   - `maintenance_mode`: โหมดปิดปรับปรุงระบบ

**ฟีเจอร์ระบบการตั้งค่า:**

- หน้าจัดการการตั้งค่าสำหรับ Admin เท่านั้น
- แบ่งหมวดหมู่การตั้งค่าที่ชัดเจน
- รองรับการตั้งค่าประเภท: boolean, string, number, JSON
- การตั้งค่าแบบ Public Settings (เช่น การแสดงปุ่มลงทะเบียน DGA ในหน้า Login)
- Bulk Update สำหรับการบันทึกการตั้งค่าหลายรายการพร้อมกัน
- Audit Trail สำหรับการเปลี่ยนแปลงการตั้งค่า

**ตารางฐานข้อมูลเพิ่มเติม:**

```sql
-- ตารางการตั้งค่าระบบ
CREATE TABLE system_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  setting_type ENUM('boolean', 'string', 'number', 'json') DEFAULT 'string',
  description TEXT NULL,
  category VARCHAR(50) DEFAULT 'general',
  is_public BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ตารางการยืนยัน OTP
CREATE TABLE verification_otps (
  id INT PRIMARY KEY AUTO_INCREMENT,
  session_token VARCHAR(255) NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  otp_type ENUM('email', 'sms') NOT NULL,
  contact_info VARCHAR(255) NOT NULL,
  attempts INT DEFAULT 0,
  is_used BOOLEAN DEFAULT FALSE,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ตารางโทเค็นการยืนยัน
CREATE TABLE verification_tokens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  token VARCHAR(255) NOT NULL UNIQUE,
  user_data JSON NOT NULL,
  verification_step ENUM('terms', 'method', 'identity', 'otp', 'complete') DEFAULT 'terms',
  is_completed BOOLEAN DEFAULT FALSE,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ตารางการยืนยันบัตรประชาชน
CREATE TABLE national_id_verifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  session_token VARCHAR(255) NOT NULL,
  national_id VARCHAR(13) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_result JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**API Endpoints เพิ่มเติม:**

- `GET /api/settings/public` - ดึงการตั้งค่าสาธารณะ
- `GET /api/settings` - ดึงการตั้งค่าทั้งหมด (Admin เท่านั้น)
- `PUT /api/settings/:key` - อัปเดตการตั้งค่าเดี่ยว
- `POST /api/settings/bulk-update` - อัปเดตการตั้งค่าหลายรายการ
- `POST /api/verification/start` - เริ่มกระบวนการยืนยันตัวตน
- `POST /api/verification/send-otp` - ส่งรหัส OTP
- `POST /api/verification/verify-otp` - ยืนยันรหัส OTP
- `POST /api/verification/verify-national-id` - ยืนยันบัตรประชาชน

---

เพิ่มเติม: ใช้ toasts แทน alerts

#### เมื่อมีการ แก้ไขฟีเจอร์ใหม่ ให้ เพิ่ม commit message ที่ชัดเจนและมีรายละเอียด เช่น:

```bash
git commit -m "เพิ่มฟีเจอร์การนำทางระหว่างขั้นตอนในแบบฟอร์มสร้างแบบสำรวจ"
```

- โครงสร้างโปรเจคเริ่มต้น (Backend: Node.js/Express, Frontend: Vue 3)
- ระบบ authentication ด้วย JWT
- การจัดการผู้ใช้งาน (CRUD operations)
- ระบบ role-based access control (Admin, Reviewer, Surveyor)
- หน้าจัดการข้อมูลการสำรวจ
- ระบบแจ้งเตือน (Notification System)
- การอัปโหลดไฟล์แนบ
- ระบบ audit trail สำหรับติดตาม���ารเปลี่ยนแปลง
- หน้า dashboard แสดงสถิติ
- ระบบค้นหาและกรองข้อมูลขั้นสูง
- การส่งออกข้อมูลเป็น Excel/CSV
- Responsive design สำหรับ mobile device
- Database schema สำหรับข้อมูลวัด (Master Data)
- ระบบจัดการข้อมูลหลัก (Master Data Management)

### ความปลอดภัย (Security)

- Password hashing ด้วย bcrypt
- JWT token authentication
- Rate limiting สำหรับ API endpoints
- Input validation และ sanitization
- CORS configuration
- Helmet.js สำหรับ security headers

### ประสิทธิภาพ (Performance)

- Database connection pooling
- API response caching
- Image optimization สำหรับไฟล์แนบ
- Code splitting ใน frontend
- Lazy loading สำหรับ components

### การพัฒนา (Development)

- Environment configuration
- Error handling middleware
- Logging system
- Development และ production builds
- Hot reload สำหรับ development

---

## 🔧 ระบบการตั้งค่าขั้นสูง (Enhanced Settings System) - Phase 2

**วันที่อัปเดต**: 27 กรกฎาคม 2568  
**สถานะ**: ✅ เสร็จสมบูรณ์ (Frontend + Backend Integration)

### ฟีเจอร์ที่พัฒนาเสร็จแล้ว

#### 1. หน้าการตั้งค่าแบบครบถ้วน (Enhanced Settings Page)

- **ไฟล์หลัก**: `client/src/views/EnhancedSettingsPageBootstrap.vue`
- **UI Framework**: Bootstrap 5 (สไตล์เหมือนหน้า Audit Logs)
- **การออกแบบ**: Responsive design, Mobile-first approach
- **แท็บการตั้งค่า**:
  1. **การตั้งค่าส่วนตัว**: โปรไฟล์, การแจ้งเตือน
  2. **ความปลอดภัย**: เปลี่ยนรหัสผ่าน, 2FA, Session timeout
  3. **ภาษาและการแสดงผล**: เขตเวลา, รูปแบบวันที่/เวลา, ภาษา
  4. **ประสิทธิภาพ**: จำนวนรายการต่อหน้า, การโหลดข้อมูล, แคช
  5. **สำรองข้อมูล**: การส่งออกข้อมูลส่วนตัว, การสำรอง
  6. **การตั้งค่าระบบ**: สำหรับ Admin เท่านั้น (การจัดการระบบ)

#### 2. Backend API ที่สมบูรณ์

- **ไฟล์หลัก**:
  - `server/routes/user-settings.js` - การตั้งค่าผู้ใช้
  - `server/routes/settings.js` - การตั้งค่าระบบ (Admin only)
- **ฟีเจอร์**:
  - ✅ การจัดการโปรไฟล์ (แก้ไข schema compatibility: `first_name`/`last_name`)
  - ✅ การตั้งค่าส่วนตัว (การแจ้งเตือน, การแสดงผล)
  - ✅ การเปลี่ยนรหัสผ่าน
  - ✅ การส่งออกข้อมูลส่วนตัว (JSON/CSV)
  - ✅ การตั้งค่าระบบ (Admin only)
  - ✅ Role-based access control
  - ✅ Audit logging ทุกการเปลี่ยนแปลง

#### 3. Database Schema

- **ตาราง `user_settings`**:
  ```sql
  CREATE TABLE user_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT NOT NULL,
    setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_setting (user_id, setting_key),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
  );
  ```
- **ตาราง `system_settings`**: สำหรับการตั้งค่าระบบ (ใช้ schema เดิม)

#### 4. Service Layer

- **ไฟล์**: `client/src/services/enhancedSettingsService.js`
- **ฟีเจอร์**:
  - API communication กับ backend
  - การจัดการ error handling
  - การตั้งค่าส่วนตัว
  - การตั้งค่าระบบ
  - การส่งออกข้อมูล

#### 5. ปัญหาที่แก้ไขแล้ว

- ✅ **Database Schema Mismatch**: แก้ไขปัญหา `full_name` vs `first_name`/`last_name`
- ✅ **API Integration**: เชื่อมต่อ frontend กับ backend สำเร็จ
- ✅ **Role-based Access**: ควบคุมสิทธิ์การเข้าถึงการตั้งค่าระบบ
- ✅ **UI Consistency**: ใช้ Bootstrap styling เหมือนหน้า Audit Logs
- ✅ **Mobile Responsiveness**: ปรับให้ใช้งานบนมือถือได้

### การใช้งาน

- **URL**: `http://localhost:5173/settings`
- **สิทธิ์**: ผู้ใช้ทุกคนสามารถเข้าถึงการตั้งค่าส่วนตัว
- **Admin Only**: แท็บ "การตั้งค่าระบบ" สำหรับผู้ดูแลระบบเท่านั้น

### API Endpoints

```
GET    /api/user-settings/profile           - ดึงข้อมูลโปรไฟล์
PUT    /api/user-settings/profile           - อัปเดตโปรไฟล์
GET    /api/user-settings                   - ดึงการตั้งค่าผู้ใช้
PUT    /api/user-settings                   - อัปเดตการตั้งค่า
POST   /api/user-settings/change-password   - เปลี่ยนรหัสผ่าน
GET    /api/user-settings/export-data       - ส่งออกข้อมูลส่วนตัว
GET    /api/settings                        - ดึงการตั้งค่าระบบ (Admin)
PUT    /api/settings/bulk-update            - อัปเดตการตั้งค่าระบบ (Admin)
```

### Git Commit

- **Branch**: `main`
- **Commit**: `Enhanced Settings System - Complete Frontend Backend Integration`
- **Files Updated**:
  - Frontend: Settings pages, services, routing
  - Backend: API routes, database compatibility fixes
  - Database: Schema updates

---

## 🏛️ ระบบสำรวจวัดสำหรับเจ้าหน้าที่ตำรวจ - Phase 3

**วันที่อัปเดต**: 28 กรกฎาคม 2568  
**สถานะ**: ✅ เสร็จสมบูรณ์ (Police Officer Field Survey System)

### ภาพรวมการพัฒนา Phase 3

Phase นี้เน้นการปรับปรุงระบบให้เหมาะสมกับการใช้งานของเจ้าหน้าที่ตำรวจในการบันทึกข้อมูลวัดภาคสนาม โดยมีการปรับเมนูและสร้างฟอร์มที่เหมาะกับการทำงานในสภาพแวดล้อมจริง

### ฟีเจอร์ที่พัฒนาเสร็จแล้ว

#### 1. เมนูหลักที่ปรับปรุงใหม่ (Police-Focused Navigation)

- **ไฟล์หลัก**: `client/src/layouts/DashboardLayout.vue`
- **การออกแบบ**: เน้นการใช้งานสำหรับเจ้าหน้าที่ตำรวจภาคสนาม
- **โครงสร้างเมนูใหม่**:

  **🏛️ สำรวจข้อมูลวัด**
  - 📋 รายการวัด (`/surveys/temples`) - ดูรายการวัดทั้งหมด
  - ➕ บันทึกวัดใหม่ (`/surveys/temples/create`) - สร้างการสำรวจใหม่
  - ⏱️ รอตรวจสอบ (`/surveys/pending`) - รายการที่ส่งตรวจสอบแล้ว

  **🛡️ จัดการระบบ** (Admin เท่านั้น)
  - 👥 จัดการผู้ใช้
  - 📊 ข้อมูลหลัก
  - 📝 ประวัติการใช้งาน

#### 2. หน้าฟอร์มบันทึกวัดใหม่ (Temple Survey Form)

- **ไฟล์หลัก**: `client/src/views/surveys/TempleFormCreate.vue`
- **การออกแบบ**: ฟอร์ม 5 ขั้นตอนที่เหมาะกับการทำงานภาคสนาม
- **ขั้นตอนการบันทึก**:

  **ขั้นตอนที่ 1: ข้อมูลพื้นฐาน**
  - ชื่อวัด (จำเป็น)
  - ประเภทวัด (วัดราชวรวิหาร, วัดวรวิหาร, วัดราชมงคล, วัดทั่วไป)
  - สังกัดนิกาย (มหานิกาย, ธรรมยุตนิกาย)
  - จำนวนพระประจำวัด
  - ประวัติและความสำคัญ

  **ขั้นตอนที่ 2: ที่อยู่และตำแหน่ง**
  - ที่อยู่ (จำเป็น)
  - ตำบล/แขวง, อำเภอ/เขต, จังหวัด (จำเป็น)
  - รหัสไปรษณีย์
  - 🗺️ **พิกัด GPS อัตโนมัติ** - กดปุ่มเดียวได้ตำแหน่งปัจจุบัน
  - ดูตำแหน่งใน Google Maps

  **ขั้นตอนที่ 3: บุคลากร**
  - เพิ่ม/ลบบุคลากรได้
  - ตำแหน่ง (เจ้าอาวาส, รองเจ้าอาวาส, เจ้าคณะ, กรรมการ, เหรัญญิก, เลขานุการ)
  - ชื่อ-นามสกุล, เบอร์โทรศัพท์

  **ขั้นตอนที่ 4: บัญชีธนาคาร**
  - เพิ่ม/ลบบัญชีได้หลายบัญชี
  - ธนาคาร (รายการธนาคารหลัก)
  - เลขที่บัญชี, ชื่อบัญชี
  - ผู้มีอำนาจเบิกจ่าย

  **ขั้นตอนที่ 5: ไฟล์แนบ**
  - 📸 **ถ่ายภาพจากกล้องมือถือ** - เปิดกล้องถ่ายรูปได้โดยตรง
  - อัปโหลดไฟล์จากเครื่อง
  - รองรับ JPG, PNG, PDF (ขนาดไม่เกิน 10MB)
  - เพิ่มคำอธิบายไฟล์

- **ฟีเจอร์พิเศษ**:
  - แสดงข้อมูลเจ้าหน้าที่ผู้บันทึก (ยศ, ชื่อ, หน่วยงาน)
  - ระบบ Validation แบบขั้นตอน
  - Progress Bar แสดงความคืบหน้า
  - Mobile-First Design เหมาะกับการใช้บนมือถือ

#### 3. หน้ารายการรอตรวจสอบ (Pending Reviews Management)

- **ไฟล์หลัก**: `client/src/views/surveys/PendingReviewsList.vue`
- **เป้าหมาย**: จัดการรายการวัดที่ส่งตรวจสอบแล้ว
- **ฟีเจอร์หลัก**:

  **การแสดงข้อมูล**
  - แสดงสถิติรายการรอตรวจสอบ
  - การ์ดแสดงข้อมูลวัดแต่ละรายการ
  - แสดงสถานะ: ร่าง, รอตรวจสอบ, กำลังตรวจสอบ, ต้องแก้ไข

  **การกรองและค้นหา**
  - ค้นหาชื่อวัดหรือที่อยู่
  - กรองตามสถานะ
  - กรองตามช่วงเวลา (วันนี้, สัปดาห์นี้, เดือนนี้)

  **การจัดการสำหรับผู้บังคับบัญชา**
  - ✅ ปุ่มอนุมัติ (สำหรับ Admin/Supervisor)
  - ❌ ปุ่มไม่อนุมัติ พร้อมระบุเหตุผล
  - 👁️ ดูรายละเอียด
  - ✏️ แก้ไข (เจ้าของงานเท่านั้น)

#### 4. การปรับปรุงระบบ (System Enhancements)

- **Routes Management**: `client/src/router/index.js`
  - เพิ่ม Route `/surveys/temples/create` สำหรับฟอร์มบันทึกวัด
  - เพิ่ม Route `/surveys/pending` สำหรับรายการรอตรวจสอบ
  - ปรับ Breadcrumb navigation

- **CSS และ UI Fixes**:
  - แก้ไข Bootstrap Icons ใน `client/index.html`
  - ปรับปรุง Navigation CSS ใน `DashboardLayout.vue`
  - เพิ่ม CSS เสริมใน `client/src/assets/css/app.css`
  - แก้ไข Vue Compiler Error (v-model + :value conflict)

#### 5. จุดเด่นสำหรับเจ้าหน้าที่ตำรวจ

**👮‍♂️ การระบุตัวตนผู้บันทึก**
- แสดงยศ, ชื่อ-นามสกุล, หน่วยงานของเจ้าหน้าที่
- บันทึกประวัติผู้สร้างข้อมูลทุกรายการ

**🗺️ ระบบ GPS อัตโนมัติ**
- กดปุ่มเดียวได้พิกัดตำแหน่งปัจจุบัน
- เชื่อมโยงกับ Google Maps ตรวจสอบตำแหน่ง
- รองรับการทำงานบนมือถือ

**📸 การจัดการไฟล์ภาคสนาม**
- ถ่ายภาพจากกล้องมือถือได้โดยตรง
- อัปโหลดไฟล์จากคลังภาพ
- เพิ่มคำอธิบายไฟล์แต่ละรูป

**📱 Mobile-First Design**
- ออกแบบให้ใช้งานบนมือถือเป็นหลัก
- ฟอร์มแบ่งขั้นตอนไม่ให้กรอกข้อมูลมากเกินไป
- ปุ่มและช่องกรอกข้อมูลขนาดเหมาะกับนิ้ว

**✅ ระบบ Validation ขั้นตอน**
- ตรวจสอบข้อมูลก่อนไปขั้นตอนถัดไป
- แสดงสถานะความคืบหน้า
- ป้องกันการสูญหายของข้อมูล

### การใช้งาน

**สำหรับเจ้าหน้าที่ตำรวจ (Surveyor Role)**:
1. เข้าสู่ระบบ → หน้าแรก
2. คลิก "บันทึกวัดใหม่" → กรอกข้อมูล 5 ขั้นตอน
3. บันทึกเป็น "ร่าง" หรือ "ส่งตรวจสอบ"
4. ติดตามสถานะใน "รอตรวจสอบ"

**สำหรับผู้บังคับบัญชา (Admin/Reviewer Role)**:
1. ตรวจสอบรายการใน "รอตรวจสอบ"
2. อนุมัติ/ไม่อนุมัติ พร้อมระบุเหตุผล
3. ส่งแจ้งเตือนกลับไปยังเจ้าหน้าที่

### สถานะข้อมูลการสำรวจ

- **Draft**: ร่าง - ยังไม่ได้ส่งตรวจสอบ
- **Pending Review**: รอตรวจสอบ - ส่งให้ผู้บังคับบัญชาแล้ว
- **Under Review**: กำลังตรวจสอบ - ผู้บังคับบัญชาเปิดดูแล้ว
- **Approved**: อนุมัติแล้ว - ผ่านการตรวจสอบ
- **Needs Revision**: ต้องแก้ไข - ไม่ผ่านการตรวจสอบ

### Files ที่เกี่ยวข้อง

```
📁 Frontend (Vue.js)
├── client/src/views/surveys/
│   ├── TempleFormCreate.vue        # ฟอร์มบันทึกวัดใหม่
│   ├── PendingReviewsList.vue      # รายการรอตรวจสอบ
│   └── SurveyTempleList.vue        # รายการวัด (เดิม)
├── client/src/layouts/
│   └── DashboardLayout.vue         # เมนูหลัก
├── client/src/router/index.js      # Routes
├── client/src/assets/css/app.css   # CSS เสริม
└── client/index.html               # Bootstrap Icons

📁 Backend (Node.js) - รอการพัฒนา
├── server/routes/surveys.js        # API สำหรับการสำรวจ
└── server/routes/temples.js        # API เฉพาะข้อมูลวัด

📁 Database
└── database/init.sql               # Schema ข้อมูลวัด
```

### การพัฒนาต่อไป

**ในอนาคต**:
- 🔄 API Integration กับ Backend
- 📊 Dashboard สถิติสำหรับผู้บังคับบัญชา  
- 🔔 ระบบแจ้งเตือน Real-time
- 📋 รายงานและสถิติการสำรวจ
- 🗺️ แผนที่แสดงตำแหน่งวัดทั้งหมด

### Git Information

- **Branch**: `main`
- **Commit**: `feat: เพิ่มระบบสำรวจวัดสำหรับเจ้าหน้าที่ตำรวจ - Phase 3`
- **Files Added**: TempleFormCreate.vue, PendingReviewsList.vue
- **Files Modified**: DashboardLayout.vue, router/index.js, app.css, index.html

---
