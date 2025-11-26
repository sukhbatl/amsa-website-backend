# AMSA Website Backend

Express.js backend API for the AMSA member site, blog, and announcements. Uses PostgreSQL (Supabase) for database storage.

## Stack
- **Runtime**: Node.js 18+
- **Framework**: Express 5
- **Database**: PostgreSQL (Supabase compatible)
- **ORM**: Sequelize 6
- **Authentication**: JWT with bcryptjs
- **Logging**: Winston
- **Validation**: express-validator, envalid

## Security Features
- ✅ JWT authentication with secure token handling
- ✅ Rate limiting on authentication endpoints (5 attempts per 15 min)
- ✅ CORS configuration with allowed origins
- ✅ XSS protection with input sanitization
- ✅ Password complexity requirements
- ✅ HTTPS enforcement in production
- ✅ Centralized error handling
- ✅ Structured logging with Winston

## Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (Supabase account recommended)

## Local Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the project root. You have two options:

#### Option A: Using Supabase DATABASE_URL (Recommended)

```env
# Database Configuration (Supabase)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# JWT Authentication
JWT_SECRET=your_secure_random_string_here_change_in_production

# Server Configuration
PORT=4000
NODE_ENV=development

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,https://your-frontend-domain.vercel.app
```

To get your Supabase DATABASE_URL:
1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project (or create a new one)
3. Go to Project Settings → Database
4. Copy the "Connection string" under "Connection pooling"
5. Replace `[YOUR-PASSWORD]` with your database password

#### Option B: Using Individual Database Variables (Local PostgreSQL)

```env
# Database Configuration (Local)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=amsa_website
DB_USER=postgres
DB_PASS=your_password

# JWT Authentication
JWT_SECRET=your_secure_random_string_here_change_in_production

# Server Configuration
PORT=4000
NODE_ENV=development

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173
```

### 3. Run Development Server
```bash
npm run dev
```

The server will run on `http://localhost:4000` (or your specified PORT).

### 4. Database Sync

The application will automatically sync database models in development mode. Tables will be created/updated on server start.

## Connecting to the Same Supabase Database as amsa-backend-vercel

To use the same Supabase database as your `amsa-backend-vercel` project:

1. Get the DATABASE_URL from your existing amsa-backend-vercel project
2. Use the same DATABASE_URL in this project's `.env` file
3. The database connection string format is:
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

**Note**: Both projects can share the same database. The Sequelize models will create separate tables as needed (User, Blog, Announcement, MemberProfile).

## Data Models

### User
Core authentication data:
- eduEmail (unique, validated)
- password (hashed with bcrypt)
- firstName, lastName
- role (member/admin)
- emailVerified, verificationToken

### MemberProfile
Extended member information (one-to-one with User):
- Personal: personalEmail, phone, birthDate, address
- School: schoolName, degree, gradYear, major, etc.
- Social: facebook, instagram, linkedin

### Blog & Announcement
Content management with author tracking and slug-based URLs.

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user (rate limited)
- `POST /api/auth/login` - Login (rate limited)
- `GET /api/auth/me` - Get current user (requires auth)

### Blogs
- `GET /api/blogs` - List all blogs
- `GET /api/blogs/:slug` - Get blog by slug
- `POST /api/blogs` - Create blog (admin only)
- `PUT /api/blogs/:id` - Update blog (admin only)
- `DELETE /api/blogs/:id` - Delete blog (admin only)

### Announcements
- `GET /api/announcements` - List all announcements
- `GET /api/announcements/:id` - Get announcement by ID
- `POST /api/announcements` - Create announcement (admin only)
- `PUT /api/announcements/:id` - Update announcement (admin only)
- `DELETE /api/announcements/:id` - Delete announcement (admin only)

### Health Check
- `GET /api/health` - Server health check

## Production Deployment

### Deployment Options

This backend can be deployed to various platforms:

1. **Railway** (Recommended for Node.js + PostgreSQL)
2. **Render**
3. **Heroku**
4. **DigitalOcean App Platform**
5. **AWS Elastic Beanstalk**
6. **Any VPS with Node.js**

### Example: Deploying to Railway

1. Create a [Railway](https://railway.app) account
2. Create a new project
3. Connect your Git repository
4. Railway will auto-detect Node.js
5. Add environment variables in Railway dashboard:
   - `DATABASE_URL`: Your Supabase connection string
   - `JWT_SECRET`: Strong random string
   - `NODE_ENV`: `production`
   - `ALLOWED_ORIGINS`: Your frontend URL(s)
   - `PORT`: Railway will set this automatically
6. Deploy!

### Example: Deploying to Render

1. Create a [Render](https://render.com) account
2. Create a new Web Service
3. Connect your Git repository
4. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add environment variables:
   - `DATABASE_URL`: Your Supabase connection string
   - `JWT_SECRET`: Strong random string
   - `NODE_ENV`: `production`
   - `ALLOWED_ORIGINS`: Your frontend URL(s)
6. Deploy!

### Environment Variables for Production

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://postgres:pass@db.xxx.supabase.co:5432/postgres` |
| `JWT_SECRET` | Yes | Secret for JWT tokens | Use a strong random string (32+ chars) |
| `NODE_ENV` | Yes | Environment mode | `production` |
| `ALLOWED_ORIGINS` | Yes | CORS allowed origins | `https://your-frontend.vercel.app,https://www.your-domain.com` |
| `PORT` | No | Server port (auto-set by most platforms) | `4000` |

### Security Checklist for Production

- [ ] Set strong `JWT_SECRET` (use a password generator)
- [ ] Configure `ALLOWED_ORIGINS` with your production frontend domain(s)
- [ ] Set `NODE_ENV=production`
- [ ] Use HTTPS (most platforms enable this automatically)
- [ ] Use Supabase or managed PostgreSQL with SSL
- [ ] Store secrets securely (use platform's env var system, never commit .env)
- [ ] Enable database backups in Supabase
- [ ] Set up monitoring and alerting
- [ ] Review and rotate JWT_SECRET periodically

### Logging

Logs are stored in `logs/`:
- `combined.log` - All logs
- `error.log` - Error logs only

Configure log rotation and monitoring in production.

## Development Notes

### Password Requirements
- Minimum 8 characters
- Must contain: uppercase, lowercase, number, special character (@$!%*?&)

### Rate Limiting
- Login/Signup: 5 attempts per 15 minutes per IP
- Customize in `server.js` if needed

### Database Sync
- Development: Auto-sync with `{ alter: true }`
- Production: Manual migrations recommended (sync disabled by default)

## Testing the API

### Using cURL

```bash
# Health check
curl http://localhost:4000/api/health

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get blogs
curl http://localhost:4000/api/blogs
```

### Using Postman

Import the following endpoints:
- Base URL: `http://localhost:4000` (development) or your production URL
- See "API Endpoints" section above for available routes

## Troubleshooting

### Database Connection Issues

1. Verify your `DATABASE_URL` is correct
2. Check that your Supabase project is active
3. Ensure your IP is allowed in Supabase (usually not required)
4. Check database logs in Supabase dashboard

### "JWT_SECRET is required" Error

Make sure you have `JWT_SECRET` set in your `.env` file with a strong random value.

### CORS Issues

Add your frontend URL to `ALLOWED_ORIGINS` in your `.env` file:
```
ALLOWED_ORIGINS=http://localhost:5173,https://your-frontend.vercel.app
```

### Port Already in Use

Change the `PORT` in your `.env` file or kill the process using port 4000:

**Windows**:
```bash
netstat -ano | findstr :4000
taskkill /PID <PID> /F
```

**Mac/Linux**:
```bash
lsof -ti:4000 | xargs kill -9
```

## License

Private - AMSA Organization

## Related Projects

- **Frontend**: `amsa-website-frontend` - React/Vite frontend deployed on Vercel
- **Main AMSA Backend**: `amsa-backend-vercel` - Main AMSA platform backend

