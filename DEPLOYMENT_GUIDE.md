# 🚀 Smart BloodBank - Deployment Guide

## Pre-Deployment Checklist

- [x] Fix hardcoded localhost URLs
- [x] Configure CORS for production
- [x] Disable Flask debug mode
- [x] Set up environment variables
- [ ] Remove/disable console.log statements
- [ ] Configure database (PostgreSQL recommended for production)
- [ ] Set up email service (SMTP)
- [ ] Configure secure JWT secret
- [ ] Set up HTTPS certificates
- [ ] Configure domain and DNS
- [ ] Set up automated backups

---

## Backend Deployment

### 1. **Install Dependencies**

```bash
cd backend
pip install -r requirements.txt
```

### 2. **Configure Environment Variables**

Create `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Update `.env` with production values:
```
FLASK_ENV=production
FLASK_PORT=5000
DATABASE_URL=postgresql://user:password@localhost/smartblood
JWT_SECRET=your-secure-random-secret-min-32-chars
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
FRONTEND_URL=https://yourdomain.com
```

### 3. **Database Setup**

For production, use PostgreSQL instead of SQLite:

```bash
# Install PostgreSQL
# Create database and user
psql -U postgres -c "CREATE DATABASE smartblood;"
psql -U postgres -c "CREATE USER smartblood WITH PASSWORD 'secure_password';"
psql -U postgres -c "ALTER ROLE smartblood WITH SUPERUSER;"

# Initialize database
python -c "from app import create_app, db; app = create_app()  with app.app_context(): db.create_all()"
```

### 4. **Running with Production Server**

Do **NOT** use Flask's built-in server in production. Use Gunicorn:

```bash
pip install gunicorn

# Run with Gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 "app:create_app()"
```

Or use as a systemd service:

```ini
[Unit]
Description=Smart BloodBank Backend
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/smartbloodbank/backend
ExecStart=/var/www/smartbloodbank/backend/venv/bin/gunicorn -w 4 -b 0.0.0.0:5000 "app:create_app()"
Restart=always

[Install]
WantedBy=multi-user.target
```

---

## Frontend Deployment

### 1. **Install Dependencies**

```bash
cd frontend
npm install
```

### 2. **Configure Environment for Production**

The `.env.production` file will be used automatically during build:

```env
VITE_API_BASE=https://yourdomain.com/api
```

### 3. **Build for Production**

```bash
npm run build
```

This creates an optimized build in the `dist/` directory.

### 4. **Deploy Static Files**

Option A: **nginx**

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    root /var/www/smartbloodbank/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # HTTPS (after setting up SSL certificates)
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
}
```

Option B: **Vercel** (recommended for beginners)

- Connect your GitHub repository
- Set `VITE_API_BASE` in Vercel environment variables
- Deploy automatically

### 5. **Enable HTTPS**

Use Let's Encrypt (free SSL certificates):

```bash
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
```

---

## Docker Deployment (Optional)

### Backend Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV FLASK_ENV=production

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:create_app()"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      FLASK_ENV: production
      DATABASE_URL: postgresql://user:password@db:5432/smartblood
      JWT_SECRET: ${JWT_SECRET}
      ALLOWED_ORIGINS: https://yourdomain.com
    depends_on:
      - db

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    environment:
      VITE_API_BASE: http://localhost:5000

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: smartblood
      POSTGRES_USER: smartblood
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## Security Checklist

- [ ] JWT_SECRET is a random 32+ character string
- [ ] FLASK_ENV=production
- [ ] CORS configured to specific domains only
- [ ] HTTPS enabled (all traffic redirected from HTTP)
- [ ] Database password is strong and unique
- [ ] Email credentials stored securely
- [ ] Regular database backups enabled
- [ ] Monitor logs for errors/attacks
- [ ] Update dependencies regularly
- [ ] Implement rate limiting on API endpoints
- [ ] Set up security headers (HSTS, CSP, X-Frame-Options)

---

## Monitoring & Maintenance

- Monitor server logs: `tail -f /var/log/smartbloodbank/backend.log`
- Check database health regularly
- Update dependencies: `pip install --upgrade -r requirements.txt`
- Monitor API response times
- Set up email alerts for critical errors

---

## Troubleshooting

**Issue: "404 Not Found" on API calls**
- Check ALLOWED_ORIGINS in backend .env
- Verify backend is running on correct port
- Check vite.config.ts proxy settings

**Issue: CORS errors in browser console**
- Update ALLOWED_ORIGINS to match your frontend domain
- Restart backend service

**Issue: Database connection error**
- Verify DATABASE_URL in .env
- Ensure PostgreSQL is running and accessible
- Check database user permissions

---

## Support & Questions

For more help, refer to:
- Flask: https://flask.palletsprojects.com/
- Vite: https://vitejs.dev/
- PostgreSQL: https://www.postgresql.org/docs/
