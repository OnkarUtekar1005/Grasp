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

## Production Deployment

### Build Frontend

```bash
cd grasp-react
npm run build
```

Output in `dist/` folder - deploy to any static host (Nginx, Vercel, Netlify).

### Backend Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start src/index.js --name grasp-backend
   ```
3. Set up Nginx as reverse proxy
4. Configure SSL with Let's Encrypt

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
