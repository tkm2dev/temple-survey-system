# การทดสอบโปรเจค (Testing Guide)

คู่มือการทดสอบระบบสำรวจข้อมูลวัด

## ขั้นตอนการทดสอบหลังจากติดตั้ง

### 1. การตรวจสอบ Database Connection

```bash
cd server
node -e "const db = require('./config/database'); db.executeQuery('SELECT 1 as test', []).then(result => console.log('Database connected:', result)).catch(err => console.error('Database error:', err));"
```

### 2. การทดสอบ Authentication

1. **ทดสอบการ Login**

   - URL: `POST http://localhost:3000/api/auth/login`
   - Body:
     ```json
     {
       "username": "admin",
       "password": "admin123"
     }
     ```
   - Expected Response: JWT token + user data

2. **ทดสอบ Token Validation**
   - Header: `Authorization: Bearer <token>`
   - URL: `GET http://localhost:3000/api/auth/me`
   - Expected Response: User profile data

### 3. การทดสอบ API Endpoints

#### User Management APIs

1. **รายการผู้ใช้ทั้งหมด**

   ```bash
   curl -X GET http://localhost:3000/api/users \
   -H "Authorization: Bearer <token>"
   ```

2. **สร้างผู้ใช้ใหม่**

   ```bash
   curl -X POST http://localhost:3000/api/users \
   -H "Content-Type: application/json" \
   -H "Authorization: Bearer <token>" \
   -d '{
     "username": "testuser",
     "password": "password123",
     "full_name": "ผู้ทดสอบระบบ",
     "email": "test@example.com",
     "role": "surveyor"
   }'
   ```

3. **อัปเดตข้อมูลผู้ใช้**
   ```bash
   curl -X PUT http://localhost:3000/api/users/1 \
   -H "Content-Type: application/json" \
   -H "Authorization: Bearer <token>" \
   -d '{
     "full_name": "ผู้ทดสอบระบบ (แก้ไขแล้ว)",
     "approval_status": "approved"
   }'
   ```

### 4. การทดสอบ Frontend

1. **เข้าสู่ระบบ**

   - ไปที่ `http://localhost:5173`
   - กรอก username: `admin`, password: `admin123`
   - ตรวจสอบการ redirect ไปหน้า dashboard

2. **การจัดการผู้ใช้**

   - ไปที่หน้า "จัดการผู้ใช้งาน"
   - ทดสอบสร้าง/แก้ไข/ลบผู้ใช้
   - ทดสอบการอนุมัติผู้ใช้

3. **การทำงานแบบ Responsive**
   - ทดสอบในหน้าจอ Desktop, Tablet, Mobile
   - ตรวจสอบ navigation menu
   - ตรวจสอบการแสดงผลตาราง

### 5. การทดสอบ Database Operations

```sql
-- ทดสอบการดึงข้อมูลผู้ใช้
SELECT * FROM users WHERE username = 'admin';

-- ทดสอบการค้นหาผู้ใช้ที่รออนุมัติ
SELECT * FROM users WHERE approval_status = 'pending';

-- ทดสอบ audit trail
SELECT * FROM user_activities WHERE user_id = 1 ORDER BY created_at DESC LIMIT 10;
```

### 6. การทดสอบ Error Handling

1. **ทดสอบ Invalid Login**

   ```json
   {
     "username": "wronguser",
     "password": "wrongpass"
   }
   ```

   Expected: 401 Unauthorized

2. **ทดสอบ Missing Token**

   - เข้าถึง protected endpoint โดยไม่มี Authorization header
   - Expected: 401 Unauthorized

3. **ทดสอบ Invalid Data**
   ```json
   {
     "username": "",
     "email": "invalid-email"
   }
   ```
   Expected: 400 Bad Request with validation errors

## Test Cases สำหรับ User Approval System

### Scenario 1: การสร้างผู้ใช้ใหม่

- **Input**: ข้อมูลผู้ใช้ครบถ้วน
- **Expected**: ผู้ใช้ถูกสร้างด้วย status = 'pending'
- **Test**: ตรวจสอบใน database และ UI

### Scenario 2: การอนุมัติผู้ใช้

- **Precondition**: มีผู้ใช้ที่ status = 'pending'
- **Action**: Admin เปลี่ยน status เป็น 'approved'
- **Expected**: ผู้ใช้สามารถ login ได้

### Scenario 3: การปฏิเสธผู้ใช้

- **Precondition**: มีผู้ใช้ที่ status = 'pending'
- **Action**: Admin เปลี่ยน status เป็น 'rejected'
- **Expected**: ผู้ใช้ไม่สามารถ login ได้

## การทดสอบ Performance

### 1. Load Testing

```bash
# ใช้ Apache Bench (ab) ทดสอบ login endpoint
ab -n 100 -c 10 -p login_data.json -T "application/json" http://localhost:3000/api/auth/login
```

### 2. Database Performance

```sql
-- ทดสอบ query performance
EXPLAIN SELECT * FROM users WHERE approval_status = 'approved';

-- ตรวจสอบ index usage
SHOW INDEX FROM users;
```

### 3. Memory Usage

```bash
# ตรวจสอบ memory usage ของ Node.js process
ps aux | grep node
```

## Logging และ Monitoring

### 1. การตรวจสอบ Logs

```bash
# Server logs
tail -f server/logs/app.log

# Console logs (ระหว่าง development)
# ดู console output ในเทอร์มินัลที่รัน server
```

### 2. Debug Mode

```bash
# เปิด debug mode
DEBUG=app:* npm start
```

### 3. Database Query Logs

- ตรวจสอบ console output ใน server
- จะแสดง SQL queries และ execution time

## Troubleshooting

### ปัญหาที่พบบ่อย

1. **Database Connection Error**

   - ตรวจสอบ MySQL service
   - ตรวจสอบ credentials ใน `.env`

2. **401 Unauthorized**

   - ตรวจสอบ JWT token expiry
   - ตรวจสอบ user approval status

3. **Port Already in Use**

   ```bash
   # หา process ที่ใช้ port
   netstat -ano | findstr :3000
   # Kill process
   taskkill /PID <process_id> /F
   ```

4. **CORS Errors**
   - ตรวจสอบ frontend URL ใน server CORS config
   - ตรวจสอบ proxy setting ใน Vite config

## Automated Testing (แนะนำสำหรับอนาคต)

### Unit Tests

- ใช้ Jest สำหรับ Node.js
- ใช้ Vue Test Utils สำหรับ Vue components

### Integration Tests

- ใช้ Supertest สำหรับ API testing
- ใช้ Cypress สำหรับ E2E testing

### Example Test Structure

```javascript
// server/tests/auth.test.js
describe("Authentication", () => {
  test("should login with valid credentials", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ username: "admin", password: "admin123" });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
  });
});
```

## Best Practices

1. **ทดสอบก่อน Deploy**

   - รัน test suite ทั้งหมด
   - ตรวจสอบ build process
   - ทดสอบใน environment ที่คล้าย production

2. **ใช้ Sample Data**

   - สร้าง seed data สำหรับ testing
   - ใช้ข้อมูลจริงใน staging environment

3. **Monitor Performance**

   - ติดตาม response time
   - ตรวจสอบ memory leaks
   - วัดความเร็วในการ query database

4. **Security Testing**
   - ทดสอบ SQL injection
   - ทดสอบ XSS attacks
   - ทดสอบ authentication bypass
