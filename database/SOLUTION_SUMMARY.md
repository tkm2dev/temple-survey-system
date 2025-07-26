# 401 Login Error - Complete Solution

## ปัญหาที่เกิดขึ้น

```
http://localhost:5173/api/auth/login error 401
```

## สาเหตุหลัก

ผลการตรวจสอบพบปัญหา 2 ข้อหลัก:

1. **ฟิลด์ในฐานข้อมูลไม่ครบ**: ตาราง `users` ขาดฟิลด์ที่จำเป็น เช่น `approval_status`, `rank`, `position` เป็นต้น

2. **รหัสผ่านผิด**: ค่า hash ของรหัสผ่านในฐานข้อมูลไม่ตรงกับ "admin123"

3. **Role enum ไม่ตรง**: ฐานข้อมูลมี role เป็น 'admin', 'surveyor' แต่โค้ดต้องการ 'Admin', 'Reviewer', 'Surveyor'

## ฟิลด์ใหม่ที่ต้องเพิ่ม

- `approval_status` - สถานะการอนุมัติ (pending/approved/rejected)
- `rank` - ยศ
- `position` - ตำแหน่ง
- `department` - หน่วยงาน
- `phone` - เบอร์โทรศัพท์
- `line_id` - Line ID
- `notes` - หมายเหตุ
- `last_login` - เข้าสู่ระบบล่าสุด
- `updated_at` - วันที่อัปเดต

## วิธีแก้ไข

### ขั้นตอนที่ 1: รัน Migration Script

เลือกวิธีใดวิธีหนึ่ง:

**วิธีที่ 1: ใช้ Batch File (Windows)**

```bash
cd database
run_migration.bat
```

**วิธีที่ 2: ใช้ MySQL Command Line**

```bash
mysql -u root -p temple_survey_db_v2 < migration_add_user_fields.sql
```

**วิธีที่ 3: ใช้ phpMyAdmin**

1. เปิด phpMyAdmin
2. เลือกฐานข้อมูล `temple_survey_db_v2`
3. ไปที่แท็บ SQL
4. Copy โค้ดจาก `migration_add_user_fields.sql` และรัน

### ขั้นตอนที่ 2: ตรวจสอบการติดตั้ง

รันคำสั่งนี้เพื่อตรวจสอบ:

```sql
DESCRIBE users;
```

หรือใช้ Node.js test script:

```bash
cd database
node test_db_connection.js
```

### ขั้นตอนที่ 3: Restart Server

หลังจากอัปเดตฐานข้อมูลแล้ว ให้ restart Node.js server:

```bash
npm run dev
# หรือ
node server.js
```

## ไฟล์ที่เกี่ยวข้อง

- `migration_add_user_fields.sql` - Migration script หลัก
- `run_migration.bat` - Batch file สำหรับ Windows
- `test_db_connection.js` - ทดสอบการเชื่อมต่อ
- `test_structure.sql` - ตรวจสอบโครงสร้างตาราง
- `MIGRATION_INSTRUCTIONS.md` - คำแนะนำโดยละเอียด

## การแก้ไขปัญหาเพิ่มเติม

### หากยังเกิดข้อผิดพลาด

1. ตรวจสอบว่าใช้ฐานข้อมูลที่ถูกต้อง
2. ตรวจสอบสิทธิ์การแก้ไขตาราง
3. ตรวจสอบการเชื่อมต่อฐานข้อมูลในไฟล์ config

### ตรวจสอบข้อมูลหลังการ Migration

```sql
-- ดูผู้ใช้ทั้งหมดพร้อมสถานะใหม่
SELECT user_id, username, approval_status, rank, position, department
FROM users;

-- นับจำนวนผู้ใช้ตามสถานะการอนุมัติ
SELECT approval_status, COUNT(*) as count
FROM users
GROUP BY approval_status;
```

## หมายเหตุ

- ผู้ใช้เดิมจะมีสถานะ `approved` โดยอัตโนมัติ
- ผู้ใช้ใหม่จะมีสถานะ `pending` เป็นค่าเริ่มต้น
- ระบบจะทำงานปกติหลังจากการ Migration เสร็จสิ้น
