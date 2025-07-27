# Database Setup Guide

## 📋 ไฟล์สำคัญ

### 1. `init.sql` - ไฟล์สร้างฐานข้อมูลหลัก

- สร้างฐานข้อมูล `temple_survey_db_v2`
- สร้างตารางทั้งหมด (users, survey_targets, master_data)
- กำหนด schema พื้นฐาน (ไม่มี relationships)
- ไม่มี indexes และ foreign keys (เพื่อให้ยืดหยุ่นในการพัฒนาต่อ)

### 2. `seed.sql` - ข้อมูลเริ่มต้นและตัวอย่าง

- ข้อมูลหลัก (Master Data): ประเภทการสำรวจ, ประเภทวัด, สังกัด
- ผู้ใช้งานระบบ: admin, surveyor1, reviewer1 (รหัสผ่าน: admin123)
- ข้อมูลตัวอย่าง: วัดสำคัญ 3 แห่ง พร้อมรายละเอียดครบถ้วน
- สถานะการสำรวจต่างๆ: Draft, Pending Review, Approved

## 🚀 วิธีติดตั้ง

### Method 1: Auto Setup (แนะนำ)

```bash
# รันคำสั่งเดียว (Windows)
setup.bat

# หรือ รันด้วยมือ
mysql -u root -p123456 < init.sql
mysql -u root -p123456 temple_survey_db_v2 < seed.sql
```

### Method 2: Manual Setup

Mysql Config
user: root
password:123456

```sql
-- 1. สร้างฐานข้อมูลและตาราง
mysql -u root -p123456 < init.sql

-- 2. ใส่ข้อมูลเริ่มต้น
mysql -u root -p123456 temple_survey_db_v2 < seed.sql
```

## 🔑 ข้อมูลการเข้าสู่ระบบ

### Admin User

- **Username:** admin
- **Password:** admin123
- **Role:** Admin

### Test Users

- **Username:** surveyor1, Password: admin123, Role: Surveyor
- **Username:** reviewer1, Password: admin123, Role: Reviewer

## 📊 Schema Overview

### Core Tables

- `users` - ผู้ใช้งานระบบ
- `survey_targets` - เป้าหมายการสำรวจ
- `survey_target_types` - ประเภทการสำรวจ
- `activity_logs` - บันทึกการใช้งาน

### Master Data Tables

- `master_temple_types` - ประเภทวัด
- `master_denominations` - สังกัด
- `provinces`, `districts`, `subdistricts` - ข้อมูลที่อยู่

## 🛠️ Database Configuration

### MySQL Settings

- Character Set: `utf8mb4`
- Collation: `utf8mb4_unicode_ci`
- Default Engine: InnoDB

### Required Permissions

```sql
GRANT ALL PRIVILEGES ON temple_survey_db_v2.* TO 'temple_user'@'localhost';
FLUSH PRIVILEGES;
```

## 🔍 Troubleshooting

### Connection Issues

1. ตรวจสอบ MySQL service ทำงานหรือไม่
2. ตรวจสอบ database name และ credentials
3. ตรวจสอบ port (default: 3306)

### Schema Issues

1. รัน `DESCRIBE users;` เพื่อดูโครงสร้างตาราง
2. ตรวจสอบ foreign key constraints
3. รัน migration script หากมีปัญหา

## 📝 Notes

- Database ออกแบบให้รองรับการสำรวจหลายประเภท
- มี audit trail สำหรับติดตามการเปลี่ยนแปลง
- รองรับ role-based access control
- ใช้ UUID สำหรับ primary keys ในตารางสำคัญ
