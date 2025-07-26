# Database Migration Instructions

## เพื่อแก้ไขปัญหา "Unknown column 'approval_status' in 'field list'"

### วิธีที่ 1: ใช้ MySQL Command Line

```bash
mysql -u root -p temple_survey_db_v2 < migration_add_user_fields.sql
```

### วิธีที่ 2: ใช้ phpMyAdmin หรือ MySQL Workbench

1. เปิดโปรแกรม phpMyAdmin หรือ MySQL Workbench
2. เลือกฐานข้อมูล `temple_survey_db_v2`
3. ไปที่แท็บ SQL
4. Copy และ Paste โค้ดจากไฟล์ `migration_add_user_fields.sql`
5. กดปุ่ม Execute/Run

### วิธีที่ 3: ใช้ XAMPP Control Panel

1. เปิด XAMPP Control Panel
2. กดปุ่ม "Admin" ของ MySQL เพื่อเปิด phpMyAdmin
3. ทำตามขั้นตอนในวิธีที่ 2

### วิธีที่ 4: ใช้ VS Code Extension

หากติดตั้ง MySQL Extension ใน VS Code แล้ว:

1. เชื่อมต่อกับฐานข้อมูล
2. เปิดไฟล์ `migration_add_user_fields.sql`
3. เลือกทั้งหมดและกด Ctrl+Shift+E (Execute)

## ตรวจสอบการติดตั้ง

หลังจากรัน Migration แล้ว ให้ตรวจสอบด้วยคำสั่ง:

```sql
DESCRIBE users;
```

คุณควรเห็นคอลัมน์ใหม่:

- approval_status
- rank
- position
- department
- phone
- line_id
- notes
- last_login
- updated_at

## หากยังมีปัญหา

1. ตรวจสอบว่าใช้ฐานข้อมูลที่ถูกต้อง: `USE temple_survey_db_v2;`
2. ตรวจสอบสิทธิ์ในการแก้ไขตาราง
3. Restart Node.js server หลังจากอัปเดตฐานข้อมูลแล้ว

## SQL Commands ที่สำคัญ

```sql
-- ดูโครงสร้างตาราง users
DESCRIBE users;

-- ดูข้อมูลผู้ใช้ทั้งหมด
SELECT user_id, username, approval_status, rank, position FROM users;

-- อัปเดตสถานะผู้ใช้เป็น approved (หากจำเป็น)
UPDATE users SET approval_status = 'approved' WHERE approval_status IS NULL;
```
