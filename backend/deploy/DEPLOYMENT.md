# AMRUT Peth Stall Booker — AWS EC2 Deployment Guide

## Prerequisites

| Component | Version |
|-----------|---------|
| AWS EC2   | Amazon Linux 2023 or Ubuntu 22.04 LTS |
| Java      | 21 (Corretto or OpenJDK) |
| MySQL     | 8.0 (RDS or on-instance) |
| Nginx     | 1.24+ |
| Maven     | 3.9+ (build machine only) |

---

## 1. EC2 Instance Setup

### 1.1 Recommended instance type

- **Minimum**: `t3.small` (2 vCPU, 2 GB RAM)
- **Production**: `t3.medium` (2 vCPU, 4 GB RAM)

### 1.2 Security Group inbound rules

| Port | Source       | Purpose         |
|------|-------------|-----------------|
| 22   | Your IP only | SSH             |
| 80   | 0.0.0.0/0   | HTTP (→ HTTPS redirect) |
| 443  | 0.0.0.0/0   | HTTPS           |
| 3306 | EC2 SG only  | MySQL (if RDS)  |

### 1.3 Install dependencies (Amazon Linux 2023)

```bash
sudo dnf update -y

# Java 21
sudo dnf install -y java-21-amazon-corretto-headless

# MySQL 8 client + server (skip if using RDS)
sudo dnf install -y mysql-server
sudo systemctl enable --now mysqld

# Nginx
sudo dnf install -y nginx
sudo systemctl enable nginx

# Certbot (Let's Encrypt)
sudo dnf install -y python3-certbot-nginx
```

---

## 2. Database Setup

### 2.1 Create database and user

```sql
-- as MySQL root
CREATE DATABASE stall_booker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'stallbooker_user'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON stall_booker.* TO 'stallbooker_user'@'localhost';
FLUSH PRIVILEGES;
```

> Flyway runs `V1__init_schema.sql` automatically on first startup — no manual schema import needed.

---

## 3. Application User and Directories

```bash
sudo useradd -r -s /usr/sbin/nologin stallbooker

sudo mkdir -p /opt/stall-booker
sudo mkdir -p /var/log/stall-booker

sudo chown stallbooker:stallbooker /opt/stall-booker
sudo chown stallbooker:stallbooker /var/log/stall-booker
```

---

## 4. Build and Deploy

### 4.1 Build WAR on your machine

```bash
cd backend
mvn clean package -DskipTests -Pprod
# Output: target/stall-booker-0.0.1-SNAPSHOT.war
```

> Note: The project is configured as a self-executable JAR/WAR — `spring-boot-maven-plugin` repackages it.
> You can run it directly with `java -jar` (no external Tomcat needed).

### 4.2 Upload to EC2

```bash
scp -i your-key.pem \
  target/stall-booker-0.0.1-SNAPSHOT.war \
  ec2-user@<EC2_IP>:/opt/stall-booker/stall-booker.jar
```

### 4.3 Create environment file

```bash
sudo cp /path/to/env.example /opt/stall-booker/.env
sudo nano /opt/stall-booker/.env        # Fill in real values
sudo chmod 600 /opt/stall-booker/.env
sudo chown stallbooker:stallbooker /opt/stall-booker/.env
```

### 4.4 Install systemd service

```bash
sudo cp stall-booker.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable stall-booker
sudo systemctl start stall-booker

# Verify
sudo systemctl status stall-booker
sudo journalctl -u stall-booker -f
```

---

## 5. Nginx Configuration

```bash
# Copy config
sudo cp nginx.conf /etc/nginx/sites-available/stall-booker
sudo ln -s /etc/nginx/sites-available/stall-booker /etc/nginx/sites-enabled/

# Obtain TLS certificate
sudo certbot --nginx -d api.amrutpeth.com

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

---

## 6. AWS S3 Bucket Setup

1. Create bucket `stall-booker-prod` in `ap-south-1`
2. **Block all public access** (files are served via signed URLs or direct CDN — not public)
   - If you want public image access, set a bucket policy allowing `s3:GetObject` for your CloudFront OAI
3. Create an IAM user with policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:DeleteObject", "s3:GetObject"],
      "Resource": "arn:aws:s3:::stall-booker-prod/*"
    }
  ]
}
```

4. Generate access key + secret → put in `/opt/stall-booker/.env`

---

## 7. AWS SES Setup

1. Verify sender domain `amrutpeth.com` in SES
2. Request production access (exit sandbox) via AWS Support
3. Create SMTP credentials in SES → put in `.env` as `MAIL_USERNAME` / `MAIL_PASSWORD`

---

## 8. Zero-Downtime Redeploy

```bash
# Upload new jar
scp -i key.pem stall-booker-NEW.jar ec2-user@<EC2_IP>:/opt/stall-booker/stall-booker-new.jar

# Atomic swap
sudo mv /opt/stall-booker/stall-booker.jar /opt/stall-booker/stall-booker.jar.bak
sudo mv /opt/stall-booker/stall-booker-new.jar /opt/stall-booker/stall-booker.jar

# Restart
sudo systemctl restart stall-booker
sudo journalctl -u stall-booker -f   # watch logs
```

---

## 9. Log Rotation

Logback already rotates logs daily and caps total at 1 GB (see `logback-spring.xml`).
Additionally install `logrotate`:

```
# /etc/logrotate.d/stall-booker
/var/log/stall-booker/*.log {
    daily
    rotate 30
    compress
    missingok
    notifempty
    copytruncate
}
```
