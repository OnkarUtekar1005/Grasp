# Grasp Electric - Setup & Run Guide

This guide will help you set up and run the Grasp Electric e-commerce platform locally.

## Prerequisites

- **Node.js** 18.0.0 or higher
- **PostgreSQL** 14 or higher
- **npm** (comes with Node.js)

## Project Structure

```
Grasp/
├── grasp-react/      # Frontend (React + Vite)
├── grasp-backend/    # Backend (Node.js + Express + Prisma)
└── index2.html       # Static landing page
```

---

## Quick Start

### 1. Clone and Navigate

```bash
cd /path/to/Grasp
```

### 2. Set Up PostgreSQL Database

#### Option A: Using psql (Command Line)

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE grasp_electric;

# Exit
\q
```

#### Option B: Using pgAdmin

1. Open pgAdmin
2. Right-click "Databases" → "Create" → "Database"
3. Name: `grasp_electric`
4. Click "Save"

---

## Backend Setup

### 1. Navigate to Backend

```bash
cd grasp-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Edit the `.env` file with your credentials:

```bash
# Open .env in your editor
```

Update these values:

```env
# Database - UPDATE WITH YOUR POSTGRESQL CREDENTIALS
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/grasp_electric"

# JWT - CHANGE IN PRODUCTION (minimum 32 characters)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# SMTP - UPDATE WITH YOUR EMAIL CREDENTIALS
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="Grasp Electric <noreply@graspelectric.com>"

# Admin notification emails
ADMIN_EMAILS=your-email@example.com
```

#### Gmail SMTP Setup (Optional)

If using Gmail:
1. Enable 2-Factor Authentication on your Google account
2. Go to Google Account → Security → App passwords
3. Generate an app password for "Mail"
4. Use that password as `SMTP_PASS`

### 4. Initialize Database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed initial data (admin user + categories)
npm run db:seed
```

### 5. Start Backend Server

```bash
# Development mode (with auto-restart)
npm run dev

# OR Production mode
npm start
```

Backend will be running at: `http://localhost:5000`

### 6. Verify Backend

Open in browser or use curl:

```bash
curl http://localhost:5000/api/v1/health
```

Expected response:
```json
{"status":"ok","timestamp":"2024-..."}
```

---

## Frontend Setup

### 1. Navigate to Frontend

```bash
cd ../grasp-react
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment (Optional)

The `.env` file is pre-configured. Update only if backend runs on different port:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

### 4. Start Frontend Server

```bash
npm run dev
```

Frontend will be running at: `http://localhost:5173`

---

## Access the Application

| URL | Description |
|-----|-------------|
| http://localhost:5173 | Public website |
| http://localhost:5173/admin/login | Admin login |
| http://localhost:5000/api/v1/health | API health check |

### Default Admin Credentials

```
Email: admin@graspelectric.com
Password: admin123
```

**Important:** Change this password after first login!

---

## Running Both Servers

You need two terminal windows:

**Terminal 1 - Backend:**
```bash
cd grasp-backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd grasp-react
npm run dev
```

---

## Common Commands

### Backend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm start` | Start production server |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:push` | Push schema changes to DB |
| `npm run db:seed` | Seed database |
| `npm run db:studio` | Open Prisma Studio (DB GUI) |

### Frontend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## Database Management

### View Database with Prisma Studio

```bash
cd grasp-backend
npm run db:studio
```

Opens a GUI at `http://localhost:5555` to browse/edit data.

### Reset Database

```bash
cd grasp-backend

# Drop all tables and recreate
npx prisma db push --force-reset

# Re-seed data
npm run db:seed
```

---

## Troubleshooting

### Backend won't start

1. **Check PostgreSQL is running:**
   ```bash
   # Windows
   net start postgresql-x64-14

   # Linux/Mac
   sudo service postgresql start
   ```

2. **Check database connection:**
   - Verify `DATABASE_URL` in `.env`
   - Ensure database `grasp_electric` exists
   - Check PostgreSQL username/password

3. **Regenerate Prisma client:**
   ```bash
   npx prisma generate
   ```

### Frontend can't connect to backend

1. **Ensure backend is running** on port 5000
2. **Check CORS:** Backend allows `http://localhost:5173` by default
3. **Check browser console** for errors

### "Invalid token" or "Unauthorized" errors

1. Clear browser localStorage:
   - Open DevTools → Application → Local Storage
   - Delete `authToken`
2. Login again

### Port already in use

```bash
# Find process using port 5000 (Windows)
netstat -ano | findstr :5000

# Kill process (replace PID)
taskkill /PID <PID> /F

# Find process (Linux/Mac)
lsof -i :5000
kill -9 <PID>
```

---

## VPS Deployment (Hostinger / Ubuntu)

This section covers deploying Grasp Electric on a Hostinger VPS (or any Ubuntu server).

**Server Info:**
- VPS IP: `72.61.243.83` (update with your IP)
- Project path on server: `/var/www/Grasp`
- Backend port: `5000`
- OS: Ubuntu

---

### Connecting to Your VPS

Open a terminal (Command Prompt, PowerShell, or any terminal app) and run:

```bash
ssh root@72.61.243.83
```

- It will ask for your **VPS password** (the one from Hostinger dashboard).
- The password **won't show** as you type — that's normal. Just type it and press Enter.
- If it's your first time connecting, type `yes` when it asks about fingerprint.

---

### First-Time Server Setup (Only Once)

Run these commands one by one after connecting to VPS:

#### 1. Update the server

```bash
apt update && apt upgrade -y
```

#### 2. Install Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
```

Verify:
```bash
node -v
npm -v
```

#### 3. Install PM2 (keeps backend running 24/7)

```bash
npm install -g pm2
```

#### 4. Install Nginx (serves the website)

```bash
apt install -y nginx
systemctl enable nginx
systemctl start nginx
```

#### 5. Install PostgreSQL

```bash
apt install -y postgresql postgresql-contrib
systemctl enable postgresql
systemctl start postgresql
```

#### 6. Create the database

```bash
sudo -u postgres psql
```

Inside the PostgreSQL prompt:
```sql
CREATE DATABASE grasp_electric;
CREATE USER graspuser WITH PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE grasp_electric TO graspuser;
\q
```

---

### Deploying the Project (First Time)

#### 1. Upload project to VPS

From your **local machine** (not VPS), run:

```bash
scp -r /path/to/Grasp root@72.61.243.83:/var/www/
```

Or use Git on the VPS:
```bash
cd /var/www
git clone <your-repo-url> Grasp
```

#### 2. Set up the backend

```bash
cd /var/www/Grasp/grasp-backend
npm install
```

#### 3. Configure backend environment

```bash
nano .env
```

Update these values for production:
```env
PORT=5000
NODE_ENV=production
DATABASE_URL="postgresql://graspuser:your_secure_password_here@localhost:5432/grasp_electric"
JWT_SECRET=change-this-to-a-long-random-string-at-least-32-chars
CORS_ORIGIN=https://yourdomain.com
UPLOAD_DIR=./uploads
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="Grasp Electric <noreply@graspelectric.com>"
ADMIN_EMAILS=your-email@example.com
```

Save: press `Ctrl + X`, then `Y`, then `Enter`.

#### 4. Initialize the database

```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

#### 5. Create uploads directory

```bash
mkdir -p /var/www/Grasp/grasp-backend/uploads
```

#### 6. Build the frontend

```bash
cd /var/www/Grasp/grasp-react
npm install
```

Edit the `.env` for production:
```bash
nano .env
```

Set:
```env
VITE_API_URL=/api/v1
VITE_BACKEND_URL=
```

Save and build:
```bash
npm run build
```

This creates a `dist/` folder with the production files.

#### 7. Configure Nginx

```bash
nano /etc/nginx/sites-available/grasp
```

Paste this config (replace `yourdomain.com` with your actual domain or IP):

```nginx
server {
    listen 80;
    server_name yourdomain.com 72.61.243.83;

    # Frontend - serve the built React app
    root /var/www/Grasp/grasp-react/dist;
    index index.html;

    # API - forward to backend
    location /api/v1 {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 10M;
    }

    # Uploaded files
    location /uploads {
        proxy_pass http://localhost:5000/uploads;
    }

    # React Router - all other routes serve index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Save, then enable the site:
```bash
ln -s /etc/nginx/sites-available/grasp /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

#### 8. Start the backend with PM2

```bash
cd /var/www/Grasp/grasp-backend
pm2 start src/index.js --name grasp-backend
pm2 save
pm2 startup
```

The `pm2 startup` command will print a command — **copy and run it**. This makes PM2 auto-start after server reboots.

#### 9. Verify everything works

```bash
curl http://localhost:5000/api/v1/categories
```

If you get JSON back, the backend is running. Visit `http://72.61.243.83` in your browser to see the site.

---

### Day-to-Day Commands (Cheat Sheet)

#### Connect to VPS
```bash
ssh root@72.61.243.83
```

#### Restart backend
```bash
pm2 restart grasp-backend
```

#### Stop backend
```bash
pm2 stop grasp-backend
```

#### View backend logs (live)
```bash
pm2 logs grasp-backend
```

#### View last 50 lines of logs
```bash
pm2 logs grasp-backend --lines 50
```

#### Check backend status
```bash
pm2 list
```

#### Restart Nginx
```bash
sudo systemctl restart nginx
```

#### Restart PostgreSQL
```bash
sudo systemctl restart postgresql
```

#### Test if backend is responding
```bash
curl http://localhost:5000/api/v1/categories
```

---

### Updating the Site (After Code Changes)

#### 1. Connect to VPS
```bash
ssh root@72.61.243.83
```

#### 2. Pull latest code
```bash
cd /var/www/Grasp
git pull
```

#### 3. Update backend (if backend code changed)
```bash
cd /var/www/Grasp/grasp-backend
npm install
npx prisma generate
npx prisma db push
pm2 restart grasp-backend
```

#### 4. Update frontend (if frontend code changed)
```bash
cd /var/www/Grasp/grasp-react
npm install
npm run build
```

No need to restart Nginx — it serves the new files automatically.

---

### Troubleshooting on VPS

#### Backend won't start
```bash
# Check logs for the error
pm2 logs grasp-backend --lines 50

# Check if PostgreSQL is running
systemctl status postgresql

# Check if port 5000 is in use
lsof -i :5000
```

#### 502 Bad Gateway
This means Nginx can't reach the backend. Fix:
```bash
# Check if backend is running
pm2 list

# If stopped/errored, restart it
pm2 restart grasp-backend

# If not in the list at all, start it
cd /var/www/Grasp/grasp-backend
pm2 start src/index.js --name grasp-backend
```

#### Website not loading at all
```bash
# Check Nginx status
systemctl status nginx

# Check Nginx config for errors
nginx -t

# Restart Nginx
systemctl restart nginx
```

#### Database connection error
```bash
# Check PostgreSQL is running
systemctl status postgresql

# Restart PostgreSQL
systemctl restart postgresql

# Test database connection
sudo -u postgres psql -d grasp_electric -c "SELECT 1;"
```

#### Server rebooted and nothing works
```bash
# Start everything back up
systemctl start postgresql
systemctl start nginx
pm2 resurrect
```

If `pm2 resurrect` doesn't work:
```bash
cd /var/www/Grasp/grasp-backend
pm2 start src/index.js --name grasp-backend
pm2 save
```

---

### SSL Setup (HTTPS) - Optional but Recommended

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com
```

Follow the prompts. Certbot auto-renews the certificate.

---

### Default Admin Credentials

```
Email: admin@graspelectric.com
Password: admin123
```

**Change this password immediately after first login!**

---

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | Admin login |
| POST | `/api/v1/auth/logout` | Admin logout |
| GET | `/api/v1/auth/me` | Get current admin |
| PUT | `/api/v1/auth/change-password` | Change password |

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/categories` | List all categories |
| GET | `/api/v1/categories/:slug` | Get category |
| GET | `/api/v1/products` | List products (paginated) |
| GET | `/api/v1/products/featured` | Featured products |
| GET | `/api/v1/products/search` | Search products |
| GET | `/api/v1/products/:slug` | Get product details |
| GET | `/api/v1/products/category/:slug` | Products by category |
| POST | `/api/v1/inquiries` | Submit inquiry |
| POST | `/api/v1/quotes` | Submit quote request |

### Admin Endpoints (require authentication)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/products` | Create product |
| PUT | `/api/v1/products/:id` | Update product |
| DELETE | `/api/v1/products/:id` | Delete product |
| POST | `/api/v1/categories` | Create category |
| PUT | `/api/v1/categories/:id` | Update category |
| DELETE | `/api/v1/categories/:id` | Delete category |
| GET | `/api/v1/inquiries` | List inquiries |
| GET | `/api/v1/quotes` | List quote requests |
| GET | `/api/v1/dashboard/stats` | Dashboard statistics |

---

## Support

For issues or questions:
- Check the troubleshooting section above
- Review server logs in terminal
- Check browser DevTools console

---

## Tech Stack

**Frontend:**
- React 19
- Vite 7
- React Router 7

**Backend:**
- Node.js 20 LTS
- Express.js 5
- Prisma ORM
- PostgreSQL

**Other:**
- JWT Authentication
- Nodemailer (SMTP)
- Sharp (Image Processing)
- Zod (Validation)
