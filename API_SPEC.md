# API Specification for Web Temples v2

## Backend API Endpoints

### Temple Management

#### GET /master-data/temples

- **Description**: Get all temples with optional filtering
- **Parameters**:
  - `page` (optional): Page number for pagination
  - `limit` (optional): Number of items per page
  - `search` (optional): Search term for temple name
  - `province_id` (optional): Filter by province
- **Response**:

```json
{
  "success": true,
  "data": {
    "temples": [
      {
        "id": 1,
        "name": "วัดพระแก้ว",
        "address": "ถนนนาพระลาน เขตพระนคร",
        "province_name": "กรุงเทพฯ",
        "district_name": "พระนคร",
        "sub_district_name": "พระบรมมหาราชวัง",
        "postal_code": "10200",
        "latitude": 13.7508,
        "longitude": 100.4925,
        "phone": "02-224-3290",
        "abbot_name": "พระอาจารย์สมชาย",
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total": 100,
      "last_page": 5
    }
  }
}
```

#### POST /master-data/temples/import

- **Description**: Import temples from CSV file
- **Content-Type**: multipart/form-data
- **Body**:
  - `file`: CSV file
  - `columnMappings`: JSON string of column mappings
  - `importOptions`: JSON string of import options
- **Response**:

```json
{
  "success": true,
  "data": {
    "imported_count": 50,
    "failed_count": 2,
    "errors": ["Row 5: Invalid province name", "Row 12: Missing required field"]
  },
  "message": "Import completed successfully"
}
```

#### GET /master-data/temples/template

- **Description**: Download temple import template CSV
- **Response**: CSV content as text

```csv
Name,TAM_NAM_T,AMP_NAM_T,PROV_NAM_T,Latitude,Longitude,Address,Phone,AbbotName
วัดตัวอย่าง,ตำบลตัวอย่าง,อำเภอตัวอย่าง,จังหวัดตัวอย่าง,13.7563,100.5018,123 ถนนตัวอย่าง,02-123-4567,พระอาจารย์ตัวอย่าง
```

### User Management

#### GET /master-data/users

- **Description**: Get all users with optional filtering
- **Parameters**:
  - `page` (optional): Page number for pagination
  - `limit` (optional): Number of items per page
  - `search` (optional): Search term for user name or email
  - `department` (optional): Filter by department
  - `status` (optional): Filter by status (active, inactive, pending)
- **Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "POL001",
      "first_name": "สมชาย",
      "last_name": "ใจดี",
      "full_name": "สมชาย ใจดี",
      "email": "somchai.j@police.go.th",
      "rank": "สารวัตร",
      "position": "หัวหน้าหน่วย",
      "department": "สถานีตำรวจนครบาลบางซื่อ",
      "phone": "02-123-4567",
      "line_id": "@police123",
      "status": "active",
      "approved_at": "2024-01-02T00:00:00Z",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /master-data/users

- **Description**: Create a new user
- **Body**:

```json
{
  "code": "POL002",
  "first_name": "วิไล",
  "last_name": "สุขใส",
  "email": "wilai.s@police.go.th",
  "rank": "รองสารวัตร",
  "position": "เจ้าหน้าที่",
  "department": "สถานีตำรวจนครบาลห้วยขวาง",
  "phone": "02-234-5678",
  "line_id": "@wilai123",
  "status": "pending"
}
```

- **Response**:

```json
{
  "success": true,
  "data": {
    "id": 2,
    "code": "POL002",
    "message": "User created successfully"
  }
}
```

#### PUT /master-data/users/{id}

- **Description**: Update user information
- **Body**: Same as POST /master-data/users
- **Response**:

```json
{
  "success": true,
  "message": "User updated successfully"
}
```

#### DELETE /master-data/users/{id}

- **Description**: Delete a user
- **Response**:

```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

#### POST /master-data/users/import

- **Description**: Import users from CSV file
- **Content-Type**: multipart/form-data
- **Body**:
  - `file`: CSV file
- **Response**:

```json
{
  "success": true,
  "data": {
    "imported_count": 25,
    "failed_count": 1,
    "errors": ["Row 3: Invalid email format"]
  },
  "message": "User import completed successfully"
}
```

#### GET /master-data/users/template

- **Description**: Download user import template CSV
- **Response**: CSV content as text

```csv
Code,FirstName,LastName,Email,Rank,Position,Department,Phone,LineID,Status
POL001,สมชาย,ใจดี,somchai.j@police.go.th,สารวัตร,หัวหน้าหน่วย,สถานีตำรวจนครบาลบางซื่อ,02-123-4567,@police123,pending
```

### Audit System

#### GET /audit/logs

- **Description**: Get audit logs with optional filtering
- **Parameters**:
  - `page` (optional): Page number for pagination
  - `limit` (optional): Number of items per page
  - `search` (optional): Search term
  - `action` (optional): Filter by action (approve, reject, activate, deactivate)
  - `date` (optional): Filter by date (YYYY-MM-DD)
- **Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "target_user_id": 1,
      "target_user_name": "สมชาย ใจดี",
      "target_user_code": "POL001",
      "action": "approve",
      "details": "อนุมัติการใช้งานระบบ",
      "performed_by_id": 1,
      "performed_by_name": "ผู้ดูแลระบบ",
      "performed_by_code": "ADMIN001",
      "created_at": "2024-01-01T10:00:00Z"
    }
  ]
}
```

#### POST /audit/logs

- **Description**: Create audit log entry
- **Body**:

```json
{
  "target_user_id": 1,
  "target_user_name": "สมชาย ใจดี",
  "target_user_code": "POL001",
  "action": "approve",
  "details": "อนุมัติการใช้งานระบบ",
  "performed_by_id": 1,
  "performed_by_name": "ผู้ดูแลระบบ",
  "performed_by_code": "ADMIN001"
}
```

- **Response**:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "message": "Audit log created successfully"
  }
}
```

#### GET /audit/statistics

- **Description**: Get audit statistics
- **Response**:

```json
{
  "success": true,
  "data": {
    "pending_users": 5,
    "approved_users": 25,
    "rejected_users": 2,
    "total_users": 32,
    "recent_approvals": 3,
    "recent_rejections": 1
  }
}
```

### Location Data

#### GET /master-data/provinces

- **Description**: Get all provinces
- **Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "กรุงเทพมหานคร",
      "code": "10"
    }
  ]
}
```

#### GET /master-data/districts

- **Description**: Get districts by province
- **Parameters**:
  - `province_id` (optional): Filter by province ID
- **Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "เขตบางรัก",
      "province_id": 1
    }
  ]
}
```

#### GET /master-data/sub-districts

- **Description**: Get sub-districts by district
- **Parameters**:
  - `district_id` (optional): Filter by district ID
- **Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "แขวงบางรัก",
      "district_id": 1
    }
  ]
}
```

### Import History

#### GET /master-data/import-history

- **Description**: Get import history
- **Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "filename": "temples_import.csv",
      "total_records": 100,
      "imported_records": 98,
      "failed_records": 2,
      "status": "completed",
      "type": "temples",
      "imported_by": "admin@example.com",
      "created_at": "2024-01-01T10:00:00Z"
    }
  ]
}
```

## Database Schema

### temples table

```sql
CREATE TABLE temples (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  province_name VARCHAR(100),
  district_name VARCHAR(100),
  sub_district_name VARCHAR(100),
  postal_code VARCHAR(10),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone VARCHAR(20),
  abbot_name VARCHAR(255),
  province_id INT,
  district_id INT,
  sub_district_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_province (province_id),
  INDEX idx_district (district_id),
  INDEX idx_name (name)
);
```

### users table

```sql
CREATE TABLE users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  full_name VARCHAR(201) GENERATED ALWAYS AS (CONCAT(first_name, ' ', last_name)) STORED,
  email VARCHAR(255) UNIQUE NOT NULL,
  rank VARCHAR(100),
  position VARCHAR(100),
  department VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  line_id VARCHAR(50),
  status ENUM('pending', 'active', 'inactive', 'rejected') DEFAULT 'pending',
  approved_at TIMESTAMP NULL,
  approved_by INT NULL,
  rejected_at TIMESTAMP NULL,
  rejected_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_code (code),
  INDEX idx_email (email),
  INDEX idx_status (status),
  INDEX idx_department (department),
  INDEX idx_full_name (full_name)
);
```

### audit_logs table

```sql
CREATE TABLE audit_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  target_user_id BIGINT NOT NULL,
  target_user_name VARCHAR(201) NOT NULL,
  target_user_code VARCHAR(20) NOT NULL,
  action ENUM('approve', 'reject', 'activate', 'deactivate', 'create', 'update', 'delete') NOT NULL,
  details TEXT,
  performed_by_id BIGINT NOT NULL,
  performed_by_name VARCHAR(201) NOT NULL,
  performed_by_code VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_target_user (target_user_id),
  INDEX idx_action (action),
  INDEX idx_performed_by (performed_by_id),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (performed_by_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### provinces table

```sql
CREATE TABLE provinces (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### districts table

```sql
CREATE TABLE districts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  province_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (province_id) REFERENCES provinces(id),
  INDEX idx_province (province_id)
);
```

### sub_districts table

```sql
CREATE TABLE sub_districts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  district_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (district_id) REFERENCES districts(id),
  INDEX idx_district (district_id)
);
```

### import_history table

```sql
CREATE TABLE import_history (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  total_records INT NOT NULL,
  imported_records INT NOT NULL,
  failed_records INT NOT NULL,
  status ENUM('processing', 'completed', 'failed') NOT NULL,
  type ENUM('temples', 'users') NOT NULL,
  imported_by VARCHAR(255) NOT NULL,
  error_details JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_type (type),
  INDEX idx_created_at (created_at)
);
```

## Error Handling

All API endpoints should return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field_name": ["Field specific error message"]
  }
}
```

## File Upload Requirements

- **Supported formats**: CSV only (UTF-8 encoding with BOM)
- **Max file size**: 10MB
- **Required headers**: Must match template format
- **Validation**: Server-side validation for all required fields
- **Error reporting**: Detailed error messages with row numbers

## Authentication

All API endpoints require authentication via Bearer token:

```
Authorization: Bearer <token>
```

## Rate Limiting

- **Import endpoints**: 5 requests per minute per user
- **Other endpoints**: 100 requests per minute per user
