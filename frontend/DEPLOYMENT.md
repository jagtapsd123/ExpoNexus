# AMRUT Peth — Production Deployment Guide

## Architecture

```
[Browser] → [Nginx :80/443] → static files (React)
                             → /api/* → [Spring Boot :8081] → [MySQL]
```

---

## 1. Environment Setup (CentOS + AWS)

### Create `.env.production` in the React project root:

```env
VITE_API_BASE_URL=/api
VITE_APP_NAME=AMRUT Peth Stall Booking Platform
```

> Using `/api` (relative) so Nginx proxies to Spring Boot. No CORS issues.

---

## 2. Build the Frontend

```bash
# Install dependencies
npm install

# Build for production
npm run build
```

Output goes to `dist/` folder. This contains all static files.

---

## 3. Nginx Configuration

Create `/etc/nginx/conf.d/amrutpeth.conf`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # React SPA — serve static files
    root /var/www/amrutpeth/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
    gzip_min_length 256;

    # Cache static assets (JS/CSS/images)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Proxy API requests to Spring Boot
    location /api/ {
        proxy_pass http://127.0.0.1:8081;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 90;
    }

    # SPA fallback — all non-file routes serve index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Deploy:

```bash
# Copy build output
sudo mkdir -p /var/www/amrutpeth
sudo cp -r dist/* /var/www/amrutpeth/

# Test and reload Nginx
sudo nginx -t
sudo systemctl reload nginx
```

---

## 4. Spring Boot CORS Configuration

In your Spring Boot backend, add this configuration class:

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins(
                "http://localhost:8080",      // Dev
                "https://yourdomain.com"      // Production
            )
            .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true)
            .maxAge(3600);
    }
}
```

> **Note:** When Nginx proxies `/api/*`, CORS headers are less critical since same-origin. But keep them for flexibility.

---

## 5. Spring Boot `application.properties`

```properties
server.port=8081
spring.datasource.url=jdbc:mysql://localhost:3306/amrutpeth?useSSL=false&serverTimezone=UTC
spring.datasource.username=amrut_user
spring.datasource.password=YOUR_SECURE_PASSWORD
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
```

---

## 6. Data Persistence Strategy

| Data | Current | Production |
|------|---------|------------|
| Users / Auth | localStorage | Spring Boot + MySQL + JWT |
| Exhibitions | mockData.ts | REST API → MySQL |
| Bookings | mockData.ts | REST API → MySQL |
| Landing Settings | localStorage | REST API → MySQL |
| Gallery Images | localStorage | REST API + file storage (S3 or disk) |

### Migration Steps:
1. Replace `mockData.ts` imports with `useApiQuery` hook calls
2. Replace `localStorage` auth with JWT token-based auth
3. Store landing settings in a `landing_settings` MySQL table

---

## 7. Migrating from Mock Data to API

Replace mock data calls with the provided API client:

```tsx
// Before (mock):
import { exhibitions } from '@/data/mockData';

// After (API):
import { useApiQuery } from '@/hooks/useApiQuery';
const { data: exhibitions, isLoading, error } = useApiQuery<Exhibition[]>('/exhibitions');

if (isLoading) return <LoadingSkeleton />;
if (error) return <ErrorMessage message={error} />;
```

---

## 8. Deployment Checklist

- [ ] `.env.production` created with `VITE_API_BASE_URL=/api`
- [ ] `npm run build` succeeds without errors
- [ ] `dist/` contents copied to `/var/www/amrutpeth/`
- [ ] Nginx configured with `try_files` SPA fallback
- [ ] Nginx proxies `/api/` to Spring Boot `:8081`
- [ ] Spring Boot running with production MySQL credentials
- [ ] HTTPS configured (use Let's Encrypt / certbot)
- [ ] Console logs stripped from production build (automatic via terser config)
- [ ] Firewall allows ports 80, 443 only (8081 internal only)

---

## 9. Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| Blank page on refresh | Missing SPA fallback | `try_files $uri $uri/ /index.html` in Nginx |
| API 502 errors | Spring Boot not running | Check `systemctl status springboot` |
| CORS errors | Direct API access (not via Nginx) | Use relative `/api` URL, not absolute |
| Large bundle size | No code splitting | Already configured in `vite.config.ts` |
| Stale cache after deploy | Browser caching old JS | Vite adds content hashes to filenames automatically |

---

## 10. SSL with Let's Encrypt

```bash
sudo yum install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
sudo systemctl reload nginx
```

---

## 11. Security Hardening

```nginx
# Add to Nginx server block
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```
