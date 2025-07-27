# คู่มือการ Deploy (Deployment Guide)

คำแนะนำการ deploy ระบบสำรวจข้อมูลวัด

## การเตรียม Production Environment

### 1. Server Requirements

**ขั้นต่ำ:**

- CPU: 2 cores
- RAM: 4 GB
- Storage: 20 GB SSD
- OS: Ubuntu 20.04 LTS หือ CentOS 8

**แนะนำ:**

- CPU: 4 cores
- RAM: 8 GB
- Storage: 50 GB SSD
- Load Balancer สำหรับ high availability

### 2. Software Dependencies

```bash
# อัปเดต system packages
sudo apt update && sudo apt upgrade -y

# ติดตั้ง Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# ติดตั้ง MySQL 8.0
sudo apt install mysql-server mysql-client

# ติดตั้ง Nginx
sudo apt install nginx

# ติดตั้ง PM2 สำหรับ process management
sudo npm install -g pm2

# ติดตั้ง Git
sudo apt install git
```

## การ Deploy Backend

### 1. เตรียม Database

```sql
-- สร้าง production database
CREATE DATABASE temple_survey_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- สร้าง user สำหรับ production
CREATE USER 'temple_app'@'localhost' IDENTIFIED BY 'secure_password_here';
GRANT ALL PRIVILEGES ON temple_survey_prod.* TO 'temple_app'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Deploy Backend Code

```bash
# Clone repository
git clone <repository-url> /var/www/temple-survey
cd /var/www/temple-survey

# ติดตั้ง dependencies
cd server
npm install --production

# สร้าง .env file สำหรับ production
cp .env.example .env.production
```

### 3. การตั้งค่า Environment Variables

สร้างไฟล์ `/var/www/temple-survey/server/.env.production`:

```env
NODE_ENV=production
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=temple_survey_prod
DB_USER=temple_app
DB_PASSWORD=secure_password_here

# JWT
JWT_SECRET=your-super-secure-jwt-secret-min-32-characters
JWT_EXPIRES_IN=1d

# Upload settings
UPLOAD_DIR=/var/www/temple-survey/uploads
MAX_FILE_SIZE=10485760

# Logging
LOG_LEVEL=info
LOG_FILE=/var/www/logs/temple-survey.log

# CORS
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

### 4. การตั้งค่า PM2

สร้าง `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: "temple-survey-api",
      script: "server.js",
      cwd: "/var/www/temple-survey/server",
      instances: 2,
      exec_mode: "cluster",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "/var/www/logs/temple-survey-error.log",
      out_file: "/var/www/logs/temple-survey-out.log",
      log_file: "/var/www/logs/temple-survey-combined.log",
      time: true,
      max_restarts: 10,
      min_uptime: "10s",
    },
  ],
};
```

### 5. เริ่มต้น Backend Service

```bash
# สร้าง logs directory
sudo mkdir -p /var/www/logs
sudo chown -R $USER:$USER /var/www/logs

# รัน database migration
NODE_ENV=production node fix_database.js

# Start PM2 process
pm2 start ecosystem.config.js --env production

# ตั้งค่าให้ PM2 start ตอน boot
pm2 startup
pm2 save
```

## การ Deploy Frontend

### 1. Build Production Assets

```bash
cd /var/www/temple-survey/client

# ติดตั้ง dependencies
npm install

# Build สำหรับ production
npm run build
```

### 2. การตั้งค่า Nginx

สร้าง `/etc/nginx/sites-available/temple-survey`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL Configuration (ใช้ Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Frontend static files
    location / {
        root /var/www/temple-survey/client/dist;
        try_files $uri $uri/ /index.html;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API proxy
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # File upload handling
    location /api/upload {
        proxy_pass http://localhost:3000;
        client_max_body_size 10M;
        proxy_request_buffering off;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
```

### 3. เปิดใช้งาน Nginx Configuration

```bash
# เปิดใช้งาน site
sudo ln -s /etc/nginx/sites-available/temple-survey /etc/nginx/sites-enabled/

# ทดสอบ configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## SSL Certificate (Let's Encrypt)

```bash
# ติดตั้ง Certbot
sudo apt install certbot python3-certbot-nginx

# สร้าง SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# ตั้งค่า auto-renewal
sudo crontab -e
# เพิ่มบรรทัด: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Database Backup และ Monitoring

### 1. Automated Database Backup

สร้าง script `/usr/local/bin/backup-temple-db.sh`:

```bash
#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/var/backups/mysql"
DB_NAME="temple_survey_prod"
DB_USER="temple_app"
DB_PASS="secure_password_here"

# สร้าง backup directory
mkdir -p $BACKUP_DIR

# Create backup
mysqldump -u$DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/temple_survey_$TIMESTAMP.sql

# Compress backup
gzip $BACKUP_DIR/temple_survey_$TIMESTAMP.sql

# ลบ backup เก่าที่เก็บไว้เกิน 30 วัน
find $BACKUP_DIR -name "temple_survey_*.sql.gz" -mtime +30 -delete

echo "Backup completed: temple_survey_$TIMESTAMP.sql.gz"
```

### 2. ตั้งค่า Cron Job

```bash
sudo chmod +x /usr/local/bin/backup-temple-db.sh

# เพิ่ม cron job (backup ทุกวันเวลา 2:00 AM)
sudo crontab -e
# เพิ่ม: 0 2 * * * /usr/local/bin/backup-temple-db.sh >> /var/log/backup.log 2>&1
```

## Monitoring และ Logging

### 1. System Monitoring

```bash
# ติดตั้ง htop สำหรับ monitoring
sudo apt install htop

# ติดตั้ง logrotate สำหรับ log management
sudo apt install logrotate
```

### 2. Application Logs

สร้าง `/etc/logrotate.d/temple-survey`:

```
/var/www/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reload temple-survey-api
    endscript
}
```

### 3. Health Check Script

สร้าง `/usr/local/bin/health-check.sh`:

```bash
#!/bin/bash
API_URL="https://your-domain.com/api/health"
LOG_FILE="/var/log/health-check.log"

# Check API health
response=$(curl -s -o /dev/null -w "%{http_code}" $API_URL)

if [ $response -eq 200 ]; then
    echo "$(date): API is healthy" >> $LOG_FILE
else
    echo "$(date): API is down (HTTP $response)" >> $LOG_FILE
    # ส่ง alert email หรือ notification
fi

# Check PM2 processes
pm2_status=$(pm2 jlist | jq '.[0].pm2_env.status' -r)
if [ "$pm2_status" != "online" ]; then
    echo "$(date): PM2 process is not online" >> $LOG_FILE
    pm2 restart temple-survey-api
fi
```

## Security Checklist

### 1. Server Security

- [ ] ปิด unnecessary ports ด้วย UFW firewall
- [ ] ตั้งค่า fail2ban สำหรับ SSH protection
- [ ] อัปเดต system packages เป็นประจำ
- [ ] ใช้ SSH key แทน password authentication
- [ ] ตั้งค่า automatic security updates

### 2. Application Security

- [ ] ใช้ HTTPS สำหรับ production
- [ ] ตั้งค่า strong JWT secret
- [ ] เปิดใช้งาน rate limiting
- [ ] validate และ sanitize input data
- [ ] ตั้งค่า proper CORS origins

### 3. Database Security

- [ ] ใช้ dedicated database user
- [ ] ตั้งค่า strong passwords
- [ ] จำกัด database access จาก specific hosts
- [ ] เปิดใช้งาน MySQL security features
- [ ] สำรองข้อมูลเป็นประจำ

## Performance Optimization

### 1. Database Optimization

```sql
-- เพิ่ม indexes สำหรับ performance
CREATE INDEX idx_users_approval_status ON users(approval_status);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_activities_user_id ON user_activities(user_id);
```

### 2. Application Optimization

- ใช้ database connection pooling
- เพิ่ม caching layer (Redis)
- Optimize image uploads
- Implement pagination สำหรับ large datasets

### 3. Server Optimization

```bash
# ตั้งค่า swap file
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# เพิ่มใน /etc/fstab
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## Rollback Strategy

### 1. Application Rollback

```bash
# เก็บ current version
cp -r /var/www/temple-survey /var/www/temple-survey.backup

# Rollback to previous version
git checkout <previous-commit>
npm install --production
pm2 restart temple-survey-api
```

### 2. Database Rollback

```bash
# Restore จาก backup
mysql -u temple_app -p temple_survey_prod < /var/backups/mysql/temple_survey_YYYYMMDD_HHMMSS.sql
```

## Support และ Maintenance

### 1. Regular Maintenance Tasks

- อัปเดต dependencies เป็นประจำ
- ตรวจสอบ logs และ performance metrics
- ทำความสะอาด temporary files
- backup database และ application files

### 2. Emergency Procedures

1. **Application Down**: ตรวจสอบ PM2 status และ logs
2. **Database Issues**: ตรวจสอบ MySQL status และ disk space
3. **High Load**: ตรวจสอบ resource usage และ scale ถ้าจำเป็น
4. **Security Breach**: ปิด application ชั่วคราวและตรวจสอบ logs

### 3. Update Procedures

1. ทดสอบใน staging environment
2. สำรอง database และ application
3. Deploy ใน maintenance window
4. ตรวจสอบ functionality หลัง deploy
5. Monitor performance และ errors
