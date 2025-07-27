# ระบบสำรวจข้อมูลวัด (Field Survey Data Collection System)

ระบบเว็บแอปพลิเคชันกลางสำหรับหน่วยงานราชการ เพื่อใช้ในการสำรวจ, จัดเก็บ, ตรวจทาน, และจัดการข้อมูลภาคสนาม

## 🔧 เทคโนโลยีหลัก

- **Backend**: Node.js (Express.js)
- **Frontend**: Vue 3 (Composition API)
- **UI Library**: Bootstrap 5
- **Database**: MySQL 8+
- **Authentication**: JSON Web Tokens (JWT)

## 🚀 Quick Start

### ขั้นตอนที่ 1: ติดตั้ง Dependencies

#### Backend

```bash
cd server
npm install
```

#### Frontend

```bash
cd client
npm install
```

### ขั้นตอนที่ 2: ตั้งค่าฐานข้อมูล

1. สร้างฐานข้อมูล MySQL ชื่อ `temple_survey_db_v2`
2. รัน migration script:

```bash
cd server
node fix_database.js
```

### ขั้นตอนที่ 3: เริ่มใช้งาน

#### Backend Server

```bash
cd server
npm run dev
```

#### Frontend Development Server

```bash
cd client
npm run dev
```

เปิดเบราว์เซอร์ไปที่ `http://localhost:5173`

## 👤 บัญชีผู้ใช้เริ่มต้น

| Username  | Password | Role     | สถานะ       |
| --------- | -------- | -------- | ----------- |
| admin     | admin123 | Admin    | อนุมัติแล้ว |
| surveyor1 | admin123 | Surveyor | อนุมัติแล้ว |
| reviewer1 | admin123 | Reviewer | อนุมัติแล้ว |

## 🔄 Git Workflow

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat`: คุณสมบัติใหม่
- `fix`: แก้ไข bug
- `docs`: เปลี่ยนแปลงเอกสาร
- `style`: การจัดรูปแบบโค้ด
- `refactor`: ปรับปรุงโค้ด
- `test`: เพิ่มการทดสอบ
- `chore`: งานบำรุงรักษา

**ตัวอย่าง:**

```bash
feat(auth): เพิ่มระบบการอนุมัติผู้ใช้งาน

- เพิ่มฟิลด์ approval_status ในตาราง users
- เพิ่มการแสดงสถานะการอนุมัติในหน้า UserList
- เพิ่มปุ่มเปลี่ยนสถานะในหน้า UserDetail

Closes #123
```

## โครงสร้างโปรเจกต์

```
temple-survey-system/
├── server/          # Backend API
├── client/          # Frontend Vue.js
├── database/        # Database scripts
└── docs/           # Documentation
```

## การติดตั้งและรันระบบ

### 1. ติดตั้ง Dependencies ทั้งหมด

```bash
npm run install:all
```

### 2. ตั้งค่าฐานข้อมูล

```bash
# สร้างฐานข้อมูลใน MySQL
mysql -u root -p < database/init.sql
```

### 3. ตั้งค่า Environment Variables

```bash
# คัดลอกไฟล์ตัวอย่าง
cp server/.env.example server/.env
# แก้ไขค่าตัวแปรในไฟล์ .env
```

### 4. รันระบบ Development

```bash
npm run dev
```

- Backend API: http://localhost:3000
- Frontend: http://localhost:8080

## User Roles

- **Admin**: จัดการผู้ใช้และข้อมูลหลักทั้งหมด
- **Reviewer**: ตรวจทานและอนุมัติข้อมูลสำรวจ
- **Surveyor**: สร้างและบันทึกข้อมูลภาคสนาม

## ฟีเจอร์หลัก

- ✅ ระบบ Authentication และ Authorization
- ✅ Mobile-responsive design
- ✅ การจัดการข้อมูลสำรวจหลายมิติ
- ✅ อัปโหลดไฟล์และรูปภาพ
- ✅ ระบบ Notification
- ✅ Audit Trail
- ✅ ค้นหาและกรองข้อมูลขั้นสูง
- ✅ นำเข้า/ส่งออกข้อมูล
