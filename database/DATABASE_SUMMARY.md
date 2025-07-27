# 🏛️ Temple S```

database/
├── 📄 init.sql # ไฟล์สร้างฐานข้อมูลหลัก (มีคำอธิบายภาษาไทยครบถ้วน)
├── 📄 seed.sql # ข้อมูลเริ่มต้น (Master Data + Users)
├── 📄 setup.bat # Auto Setup (Windows)
├── 📄 README.md # คู่มือการติดตั้งและใช้งาน
├── 📄 DATABASE_SUMMARY.md # สรุปนี้
└── 📄 MIGRATION_GUIDE.md # คู่มือการเพิ่มเติมตาราง/คอลัมน์

```stem - Database Summary

## 📊 **Database Overview**

### **Database Name:** `temple_survey_db_v2`

### **Character Set:** UTF8MB4 (รองรับภาษาไทยเต็มรูปแบบ)

### **Engine:** InnoDB (รองรับ Transactions และ Foreign Keys)

---

## 📁 **Files Structure**

```

database/
├── 📄 init.sql # ไฟล์สร้างฐานข้อมูลหลัก (มีคำอธิบายภาษาไทยครบถ้วน)
├── 📄 seed.sql # ข้อมูลเริ่มต้น (Master Data + Users + Sample Data)
├── 📄 setup.bat # Auto Setup (Windows)
├── 📄 README.md # คู่มือการติดตั้งและใช้งาน
├── 📄 DATABASE_SUMMARY.md # สรุปนี้
├── 📄 MIGRATION_GUIDE.md # คู่มือการเพิ่มเติมตาราง/คอลัมน์
└── 📄 SAMPLE_DATA_GUIDE.md # รายละเอียดข้อมูลตัวอย่างสำหรับทดสอบ

````

---

## 🗄️ **Database Schema**

### **Core Tables** (4 ตาราง)

| ตาราง                 | จำนวนฟิลด์ | หน้าที่                                   |
| --------------------- | ---------- | ----------------------------------------- |
| `users`               | 18 ฟิลด์   | ผู้ใช้งานระบบ (Admin, Reviewer, Surveyor) |
| `survey_targets`      | 25+ ฟิลด์  | เป้าหมายการสำรวจ (วัด, โรงเรียน, etc.)    |
| `activity_logs`       | 8 ฟิลด์    | บันทึกการใช้งาน (Audit Trail)             |
| `survey_target_types` | 2 ฟิลด์    | ประเภทการสำรวจ                            |

### **Master Data Tables** (6 ตาราง)

| ตาราง                  | จำนวนเร็คคอร์ด | หน้าที่                             |
| ---------------------- | -------------- | ----------------------------------- |
| `master_temple_types`  | 5 ประเภท       | ประเภทวัด (ราชวรวิหาร, สามัญ, etc.) |
| `master_denominations` | 3 สังกัด       | สังกัด (มหานิกาย, ธรรมยุต, อื่นๆ)   |
| `provinces`            | 77 จังหวัด     | ข้อมูลจังหวัด                       |
| `districts`            | 928 อำเภอ      | ข้อมูลอำเภอ                         |
| `subdistricts`         | 7,255 ตำบล     | ข้อมูลตำบล                          |
| `location_data`        | ไม่จำกัด       | ข้อมูลพิกัด GPS                     |

---

## 👤 **Default Users**

| Username    | Password   | Role     | สถานะ     | หมายเหตุ                    |
| ----------- | ---------- | -------- | --------- | --------------------------- |
| `admin`     | `admin123` | Admin    | ✅ Active | ผู้ดูแลระบบหลัก             |
| `surveyor1` | `admin123` | Surveyor | ✅ Active | นักสำรวจพื้นที่กทม.และปริมณฑล |
| `reviewer1` | `admin123` | Reviewer | ✅ Active | ผู้ตรวจสอบข้อมูลประจำเขต     |
| `pending_user1` | `admin123` | Surveyor | ⏳ Pending | รออนุมัติจากผู้ดูแลระบบ      |
| `rejected_user1` | `admin123` | Surveyor | ❌ Rejected | ข้อมูลไม่ครบถ้วน           |

---

## 🚀 **Quick Setup**

### **Method 1: Auto Setup (Recommended)**

```bash
cd database
setup.bat
````

### **Method 2: Manual Setup**

```sql
-- 1. สร้างฐานข้อมูล
mysql -u root -p123456 < init.sql

-- 2. ใส่ข้อมูลเริ่มต้น
mysql -u root -p123456 temple_survey_db_v2 < seed.sql
```

---

## 🔑 **Key Features**

### **Security**

- ✅ Password hashing (bcrypt)
- ✅ Role-based access control
- ✅ User approval system
- ✅ Activity logging (Audit trail)

### **Data Management**

- ✅ รองรับข้อมูลภาษาไทย (UTF8MB4)
- ✅ Auto timestamps
- ✅ Soft deletes support
- ✅ No indexes และ foreign keys (flexible for future development)

### **Survey System**

- ✅ หลายประเภทการสำรวจ (วัด, โรงเรียน, โรงพยาบาล)
- ✅ GPS coordinates tracking
- ✅ File attachments support
- ✅ Status workflow management

---

## 📈 **Database Statistics**

| Metric             | Value                   |
| ------------------ | ----------------------- |
| **Total Tables**   | 10+ ตาราง               |
| **Indexes**        | None (flexible for dev) |
| **Foreign Keys**   | None (flexible for dev) |
| **Estimated Size** | ~50MB (with basic data) |
| **Max Users**      | ไม่จำกัด                |
| **Max Surveys**    | ไม่จำกัด                |

---

## 🛠️ **Maintenance**

### **Backup Command**

```bash
mysqldump -u root -p temple_survey_db_v2 > backup_$(date +%Y%m%d).sql
```

### **Restore Command**

```bash
mysql -u root -p temple_survey_db_v2 < backup_20250727.sql
```

### **Health Check**

```sql
-- ตรวจสอบขนาดฐานข้อมูล
SELECT
    table_schema as 'Database',
    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) as 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = 'temple_survey_db_v2';

-- ตรวจสอบจำนวนผู้ใช้
SELECT role, COUNT(*) as count FROM users GROUP BY role;
```

---

## 🆘 **Troubleshooting**

### **Common Issues**

1. **Connection refused** → ตรวจสอบ MySQL service
2. **Access denied** → ตรวจสอบ username/password
3. **Character encoding** → ใช้ UTF8MB4
4. **Foreign key errors** → ตรวจสอบ data integrity

### **Support Commands**

```sql
-- ดูโครงสร้างตาราง
DESCRIBE users;

-- ตรวจสอบข้อมูลผู้ใช้
SELECT username, role, is_active FROM users;

-- ตรวจสอบการเชื่อมต่อ
SELECT CONNECTION_ID(), USER(), DATABASE();
```

---

## 📞 **Contact**

- **System:** Temple Survey Database v2
- **Created:** July 2025
- **Environment:** Development
- **MySQL Version:** 8.0+ (Recommended)

---

**Database is ready for production use!** 🎉
