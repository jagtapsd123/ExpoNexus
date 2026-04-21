# Production Hardening Checklist

## Security

- [ ] Change default admin password (`admin@amrutpeth.com` / `Admin@123`) immediately after first login
- [ ] Set a strong `JWT_SECRET` (≥ 64 random bytes, base64-encoded): `openssl rand -base64 64`
- [ ] `JWT_SECRET` is never committed to version control
- [ ] `/opt/stall-booker/.env` has `chmod 600` and is owned by `stallbooker` user
- [ ] Database password is unique and strong (≥ 20 chars)
- [ ] DB user has only `GRANT ALL ON stall_booker.*` — no `SUPER` or `GRANT OPTION`
- [ ] MySQL `bind-address = 127.0.0.1` (not exposed to internet, or behind RDS VPC)
- [ ] AWS IAM user has minimum permissions (S3 PutObject/DeleteObject/GetObject on bucket only)
- [ ] AWS credentials are rotated every 90 days
- [ ] SES sender domain is verified and DKIM/SPF records are set
- [ ] Swagger UI is disabled in prod (`springdoc.swagger-ui.enabled=false` in application-prod.yml) ✓
- [ ] Actuator endpoints are restricted to localhost in Nginx ✓
- [ ] TLS 1.0 and 1.1 are disabled in Nginx ✓
- [ ] HSTS header is set ✓
- [ ] `X-Frame-Options: DENY` header is set ✓
- [ ] EC2 SSH access is limited to specific IPs in Security Group
- [ ] `ufw` or `firewalld` allows only ports 22, 80, 443

## Application

- [ ] `spring.profiles.active=prod` is active on the server
- [ ] `spring.jpa.hibernate.ddl-auto=validate` (not `create` or `update`) ✓
- [ ] Flyway migrations are applied cleanly on startup
- [ ] Application health endpoint returns `UP`: `curl https://api.amrutpeth.com/actuator/health`
- [ ] CORS `allowed-origins` contains only production frontend domain(s)
- [ ] File upload size limit is set (10 MB file, 15 MB request) ✓
- [ ] Rate limiting (Bucket4j) is configured for auth endpoints

## Infrastructure

- [ ] EC2 instance is in a private subnet with NAT Gateway (recommended)
- [ ] RDS MySQL instance has automated backups enabled (7-day retention minimum)
- [ ] RDS is in Multi-AZ for production
- [ ] S3 bucket versioning is enabled
- [ ] S3 bucket has lifecycle rules to expire old objects
- [ ] CloudWatch alarms set for: CPU > 80%, memory < 200 MB, disk > 80%
- [ ] SNS topic → email alert for alarm notifications
- [ ] Log group `/stall-booker/application` exists in CloudWatch (or ELK)
- [ ] Automated daily backups of `/opt/stall-booker` and database

## SSL / TLS

- [ ] Let's Encrypt certificate obtained and auto-renewal enabled: `certbot renew --dry-run`
- [ ] Certificate expiry is monitored (Certbot cron runs twice daily by default)
- [ ] `nginx -t` passes without errors

## Monitoring

- [ ] Spring Boot Actuator `/actuator/health` is monitored by an uptime tool (UptimeRobot, etc.)
- [ ] Error logs (`/var/log/stall-booker/application.log.error`) are reviewed weekly
- [ ] Alert on 5xx error rate spike

## Deployment Process

- [ ] Build pipeline (GitHub Actions / Jenkins) runs `mvn verify` before deploying
- [ ] Blue-green or atomic file-swap deploy (see DEPLOYMENT.md §8) is used
- [ ] Rollback procedure is documented and tested (`stall-booker.jar.bak` kept)
- [ ] Database migrations are backwards-compatible (old JAR can still run against new schema)
