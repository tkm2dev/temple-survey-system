# การจัดการ Git และ Changelog

## 🔄 Git Workflow สำหรับโปรเจค

### 1. เริ่มต้น Git Repository

```bash
# Initialize git (ถ้ายังไม่ได้ทำ)
git init

# เพิ่มไฟล์ทั้งหมด
git add .

# First commit
git commit -m "chore: initial project setup

- เพิ่มโครงสร้างโปรเจค backend (Node.js/Express)
- เพิ่มโครงสร้างโปรเจค frontend (Vue 3/Vite)
- เพิ่มการตั้งค่าฐานข้อมูล MySQL
- เพิ่มระบบ authentication ด้วย JWT
- เพิ่ม .gitignore และ README.md"
```

### 2. การ Commit การเปลี่ยนแปลงใหม่

#### ตัวอย่างการ commit ล่าสุด:

```bash
# เพิ่มระบบ logging
git add server/server.js server/routes/auth.js server/config/database.js
git commit -m "feat(logging): เพิ่มระบบ logging แบบละเอียดสำหรับ backend

- เพิ่ม request/response logging middleware
- เพิ่ม detailed logging ในกระบวนการ login
- เพิ่ม database query logging
- เพิ่ม server startup logging
- ช่วยให้ debug และติดตามปัญหาได้ง่ายขึ้น

สิ่งที่เพิ่ม:
- 🌐 Request logging พร้อม timestamp
- 🔐 Login process step-by-step logging
- 📊 Database query execution logging
- ✅/❌ Success/Error status logging
- 🚀 Server startup status logging"

# เพิ่มระบบการอนุมัติผู้ใช้งาน
git add server/routes/users.js client/src/views/users/ database/
git commit -m "feat(user-approval): เพิ่มระบบการอนุมัติผู้ใช้งาน

เพิ่มฟีเจอร์ใหม่:
- เพิ่มฟิลด์ approval_status ในตาราง users (pending/approved/rejected)
- เพิ่มฟิลด์ข้อมูลเพิ่มเติม: rank, position, department, phone, line_id, notes
- เพิ่มหน้าจัดการสถานะการอนุมัติใน UserDetail.vue
- เพิ่มการแสดงสถานะการอนุมัติใน UserList.vue
- เพิ่ม endpoint API สำหรับอัปเดตสถานะการอนุมัติ

ไฟล์ที่แก้ไข:
- server/routes/users.js: เพิ่ม PATCH /users/:id/approval
- client/src/views/users/UserDetail.vue: เพิ่มปุ่มเปลี่ยนสถานะ
- client/src/views/users/UserList.vue: เพิ่มฟิลเตอร์สถานะการอนุมัติ
- database/: เพิ่ม migration scripts

Closes #USER-APPROVAL-001"

# แก้ไข bug การเข้าสู่ระบบ
git add server/fix_database.js database/fix_database_complete.sql
git commit -m "fix(auth): แก้ไขปัญหา 401 Unauthorized error ตอน login

ปัญหาที่แก้ไข:
- Database schema ไม่ตรงกับโค้ด (missing approval_status field)
- Password hash ไม่ถูกต้องในฐานข้อมูล
- Role enum values ไม่ตรงกัน (admin/surveyor vs Admin/Surveyor)

วิธีแก้ไข:
- สร้าง fix_database.js สำหรับ migrate database schema
- เพิ่มฟิลด์ที่ขาดหายไปในตาราง users
- อัปเดต password hash ให้ถูกต้องสำหรับ admin123
- แก้ไข role enum values ให้ตรงกับโค้ด

ผลลัพธ์:
- สามารถ login ด้วย admin/admin123 ได้แล้ว
- ระบบแสดง detailed logging เพื่อ debug
- Database schema ตรงกับ application code

Fixes #LOGIN-BUG-001"
```

### 3. Branch Strategy

```bash
# สร้าง feature branch
git checkout -b feature/user-management
git checkout -b feature/survey-module
git checkout -b fix/database-migration

# Merge กลับไป main
git checkout main
git merge feature/user-management
git branch -d feature/user-management
```

### 4. การใช้ Git Hooks

สร้างไฟล์ `.git/hooks/commit-msg` (ถ้าต้องการ validation):

```bash
#!/bin/sh
# Validate commit message format

commit_regex='^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .{1,50}'

if ! grep -qE "$commit_regex" "$1"; then
    echo "Invalid commit message format!"
    echo "Format: <type>(<scope>): <subject>"
    echo "Example: feat(auth): เพิ่มระบบ login"
    exit 1
fi
```

## 📝 Changelog Management

### รูปแบบการเขียน CHANGELOG.md

```markdown
# Changelog

## [Unreleased]

### เพิ่ม (Added)

- ระบบ logging แบบละเอียดสำหรับ backend
- ระบบการอนุมัติผู้ใช้งาน

### แก้ไข (Fixed)

- ปัญหา 401 error ตอน login
- Database schema ไม่ตรงกับโค้ด

### เปลี่ยนแปลง (Changed)

- ปรับปรุง UI ของหน้า UserList
- เพิ่ม validation ในฟอร์มสร้างผู้ใช้

## [1.0.0] - 2025-07-27

### เพิ่ม (Added)

- โครงสร้างโปรเจคเริ่มต้น
- ระบบ authentication ด้วย JWT
- หน้าจัดการผู้ใช้งาน
- หน้าจัดการข้อมูลการสำรวจ
```

### ตัวอย่างการอัปเดต CHANGELOG.md

```bash
# หลังจาก commit แต่ละครั้ง ให้อัปเดต CHANGELOG.md
git add CHANGELOG.md
git commit -m "docs: อัปเดต CHANGELOG.md สำหรับ v1.1.0

- เพิ่มรายการ features ใหม่
- เพิ่มรายการ bug fixes
- เพิ่มรายการการเปลี่ยนแปลง"
```

## 🏷️ Version Tagging

```bash
# สร้าง version tag
git tag -a v1.0.0 -m "Release version 1.0.0

คุณสมบัติหลัก:
- ระบบจัดการผู้ใช้งาน
- ระบบการสำรวจข้อมูล
- ระบบ authentication
- ระบบ notification"

# Push tags ไป remote
git push origin --tags
```

## 📊 การติดตาม Issues

### การสร้าง Issue Labels

```bash
# Feature labels
enhancement     # คุณสมบัติใหม่
bug            # ข้อผิดพลาด
documentation  # เอกสาร
question       # คำถาม
help wanted    # ต้องการความช่วยเหลือ
good first issue # เหมาะสำหรับผู้เริ่มต้น

# Priority labels
priority: high   # ความสำคัญสูง
priority: medium # ความสำคัญปานกลาง
priority: low    # ความสำคัญต่ำ

# Component labels
backend         # Backend issues
frontend        # Frontend issues
database        # Database issues
ui/ux          # UI/UX issues
```

### การเชื่อมโยง Commits กับ Issues

```bash
# ใน commit message
git commit -m "fix(auth): แก้ไขปัญหา login timeout

- เพิ่ม session timeout handling
- ปรับปรุง error messages

Fixes #123
Closes #124"
```

## 🚀 การ Deploy และ Release

### Pre-release Checklist

```bash
# 1. ตรวจสอบการทำงาน
npm test
npm run build

# 2. อัปเดต version
npm version patch  # หรือ minor, major

# 3. อัปเดต CHANGELOG.md
# 4. สร้าง release commit
git commit -m "chore: release v1.1.0"

# 5. สร้าง tag
git tag -a v1.1.0 -m "Release v1.1.0"

# 6. Push ทุกอย่าง
git push origin main --tags
```

นี่คือระบบการจัดการ Git และ Changelog ที่ครอบคลุมสำหรับโปรเจคของคุณ!
