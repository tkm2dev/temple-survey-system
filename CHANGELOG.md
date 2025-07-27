# Changelog

รายการการเปลี่ยนแปลงทั้งหมดของโปรเจค ระบบสำรวจข้อมูลวัด

## [Unreleased]

### เพิ่มใหม่ (Added)

- ระบบ logging แบบละเอียดสำหรับ backend server
- ระบบการอนุมัติผู้ใช้งาน (User Approval System)
- ฟิลด์ข้อมูลเพิ่มเติมสำหรับผู้ใช้: ยศ, ตำแหน่ง, หน่วยงาน, เบอร์โทร, Line ID
- การแสดงสถานะการอนุมัติในหน้ารายการผู้ใช้
- ปุ่มเปลี่ยนสถานะการอนุมัติในหน้ารายละเอียดผู้ใช้
- Request/Response logging middleware
- Database query execution logging
- Login process step-by-step logging

### แก้ไข (Fixed)

- ปัญหา 401 Unauthorized error ตอนเข้าสู่ระบบ
- Database schema ไม่ตรงกับ application code
- Password hash ไม่ถูกต้องสำหรับบัญชี admin
- Role enum values ไม่ตรงกัน (admin/surveyor vs Admin/Surveyor)
- ฟิลด์ approval_status ขาดหายไปในตาราง users

### เปลี่ยนแปลง (Changed)

- ปรับปรุงการแสดงผลตารางผู้ใช้งานให้มีข้อมูลเพิ่มเติม
- เพิ่มการค้นหาผู้ใช้ตามฟิลด์ใหม่ (ยศ, ตำแหน่ง, หน่วยงาน)
- ปรับปรุง UI ของฟอร์มสร้างและแก้ไขผู้ใช้งาน

### เอกสาร (Documentation)

- เพิ่ม Git Workflow guide
- อัปเดต README.md ให้ครบถ้วนขึ้น
- เพิ่มคำแนะนำการแก้ไขปัญหา
- เพิ่มเอกสารการติดตั้งและใช้งาน

## [1.0.0] - 2025-07-26

### เพิ่ม (Added)

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

## บันทึกการเปลี่ยนแปลงรายวัน

### 2025-07-27

- **10:00** - เพิ่มระบบ logging แบบละเอียด
- **11:30** - แก้ไขปัญหา database migration
- **14:00** - เพิ่มระบบการอนุมัติผู้ใช้งาน
- **16:30** - อัปเดตเอกสารและ Git workflow

### 2025-07-26

- **09:00** - เริ่มต้นโปรเจค
- **10:30** - ตั้งค่า backend server และ database
- **13:00** - พัฒนา frontend Vue.js application
- **15:30** - เพิ่มระบบ authentication
- **17:00** - ทดสอบและ debug ระบบ

## การวางแผนในอนาคต (Roadmap)

### v1.2.0 (วางแผน)

- [ ] ระบบแจ้งเตือนแบบ real-time ด้วย WebSocket
- [ ] การสำรองข้อมูลอัตโนมัติ
- [ ] Multi-language support (ไทย/อังกฤษ)
- [ ] Mobile app (React Native)
- [ ] Advanced reporting และ analytics

### v1.3.0 (วางแผน)

- [ ] Integration กับ Google Maps API
- [ ] QR Code generation สำหรับข้อมูลสำรวจ
- [ ] Offline mode สำหรับ mobile
- [ ] Bulk import/export ขั้นสูง
- [ ] Custom dashboard builder

## รายการ Contributors

- **Lead Developer**: ทีมพัฒนาระบบ
- **Database Design**: ทีมฐานข้อมูล
- **UI/UX Design**: ทีมออกแบบ
- **Testing**: ทีม QA

## การติดต่อและรายงานปัญหา

หากพบปัญหาหรือต้องการเสนอแนะ กรุณา:

1. สร้าง Issue ใน repository
2. ใช้ format การรายงานปัญหาที่กำหนด
3. แนบ screenshot หรือ log ไฟล์ถ้าเป็นไปได้
4. ระบุขั้นตอนการทำงานที่ทำให้เกิดปัญหา

---

**หมายเหตุ**: รายการการเปลี่ยนแปลงนี้เรียงตามรูปแบบ [Keep a Changelog](https://keepachangelog.com/)
