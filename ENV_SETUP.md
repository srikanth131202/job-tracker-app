# Environment Configuration Guide

## What Was Fixed & Created

### ✅ Backend Fixes
- **server.js**: Complete rewrite with proper Express setup, middleware configuration, error handling  
- **config/db.js**: Verified MongoDB connection configuration
- **config/passport.js**: Google OAuth 2.0 configuration
- **middleware/auth.js**: Authentication middleware (isAuthenticated, isOwner)
- **routes/**: All API routes configured (auth.js, applications.js, sync.js)
- **models/**: User and JobApplication schemas with proper indexes
- **services/**: Gmail, AI Parser, and Sync services properly configured

### ✅ Frontend
- **public/index.html**: HTML5 setup with proper meta tags
- **src/App.js**: React routing with protected routes
- **Environmental setup**: Frontend .env configuration

### ✅ Deployment & DevOps
- **Dockerfile**: Multi-stage Docker build for production
- **docker-compose.yml**: Complete Docker Compose setup with MongoDB
- **DEPLOYMENT.md**: Comprehensive deployment guide for all platforms
- **setup.bat** (Windows): Automated setup script
- **setup.sh** (macOS/Linux): Automated setup script
- **.gitignore**: Security - prevents committing sensitive files
- **README.md**: Complete project documentation

---

## Environment Variables Setup

### Backend (.env)

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/job-tracker

# Session
SESSION_SECRET=your-unique-secret-key-here

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Google OAuth (get from console.cloud.google.com)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# OpenAI (get from platform.openai.com)
OPENAI_API_KEY=sk-your-api-key
```

### Frontend (.env)

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_APP_NAME=Smart Job Tracker
```

---

## How to Get Required Credentials

### 1. Google OAuth Credentials

**Step 1**: Go to [Google Cloud Console](https://console.cloud.google.com/)

**Step 2**: Create a new project
- Click "Select a Project" → "New Project"
- Name: "Job Tracker" (or your choice)
- Click "Create"

**Step 3**: Enable Gmail API
- Go to "APIs & Services" → "Library"
- Search for "Gmail API"
- Click on it, then click "Enable"

**Step 4**: Create OAuth 2.0 Credentials
- Go to "APIs & Services" → "Credentials"
- Click "Create Credentials" → "OAuth client ID"
- Choose "Web application"
- Add Authorized redirect URIs:
  - `http://localhost:5000/api/auth/google/callback` (local)
  - `https://your-domain.com/api/auth/google/callback` (production)
- Click "Create"
- Copy the Client ID and Client Secret

**Step 5**: Update .env
```env
GOOGLE_CLIENT_ID=paste-here
GOOGLE_CLIENT_SECRET=paste-here
```

### 2. OpenAI API Key

**Step 1**: Go to [OpenAI Platform](https://platform.openai.com/)

**Step 2**: Sign up or log in

**Step 3**: Go to "API keys" section
- Click "Create new secret key"
- Name it "Job Tracker"
- Copy the key (you won't see it again!)

**Step 4**: Update .env
```env
OPENAI_API_KEY=sk-paste-here
```

### 3. MongoDB

**Local Development:**
```env
MONGODB_URI=mongodb://localhost:27017/job-tracker
```

**Production (MongoDB Atlas):**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster (FREE tier available)
3. Get connection string
4. Update .env:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/job-tracker
```

---

## Security Checklist

### Do NOT Commit to Git
- ❌ .env (contains secrets)
- ❌ API keys
- ❌ Database passwords
- ❌ node_modules/

### Commit to Git
- ✅ .env.example (template only)
- ✅ .gitignore (prevents commits)
- ✅ Code files
- ✅ Configuration templates

### Production Setup
- [ ] Use strong `SESSION_SECRET` (min 32 characters)
- [ ] Change all PASSWORD values
- [ ] Use SSL/HTTPS certificates
- [ ] Enable database authentication
- [ ] Setup backup schedules
- [ ] Enable application monitoring

---

## Local Development Quick Commands

```bash
# Install everything
npm run install:all

# Start development servers
npm run dev

# Start only backend
npm run dev:backend

# Start only frontend
npm run dev:frontend

# Build frontend for production
npm run build
```

---

## Docker Deployment

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose down

# Stop and remove everything
docker-compose down -v
```

---

## Production Deployment Steps

### Deploy to Heroku (Easiest for Beginners)

```bash
# 1. Create Heroku account (free)
# 2. Install Heroku CLI

# 3. Login
heroku login

# 4. Create app
heroku create your-app-name

# 5. Add MongoDB addon
heroku addons:create mongolab:sandbox

# 6. Set environment variables
heroku config:set SESSION_SECRET="your-secret"
heroku config:set GOOGLE_CLIENT_ID="your-id"
heroku config:set GOOGLE_CLIENT_SECRET="your-secret"
heroku config:set OPENAI_API_KEY="your-key"
heroku config:set NODE_ENV="production"

# 7. Deploy
git push heroku main

# 8. View app
heroku open
```

### Deploy to Docker Registry (Docker Hub)

```bash
# Build image
docker build -t your-username/job-tracker:latest .

# Push to Docker Hub
docker login
docker push your-username/job-tracker:latest

# Pull and run
docker pull your-username/job-tracker:latest
docker run -p 5000:5000 -e MONGODB_URI=... your-username/job-tracker
```

### Deploy to Azure App Service

```bash
# Create resource group
az group create --name mygroup --location eastus

# Create App Service plan
az appservice plan create --name myplan --resource-group mygroup --sku F1

# Create web app
az webapp create --resource-group mygroup --plan myplan --name myapp --runtime "NODE|18-lts"

# Set environment variables
az webapp config appsettings set --resource-group mygroup --name myapp \
  --settings PORT=8080 MONGODB_URI="..." GOOGLE_CLIENT_ID="..."

# Deploy from Git
git remote add azure https://myapp.scm.azurewebsites.net:443/myapp.git
git push azure main
```

---

## Troubleshooting

### Error: "Cannot connect to MongoDB"
- Ensure MongoDB is running: `net start MongoDB` (Windows)
- Or use Docker: `docker run -d -p 27017:27017 mongo`

### Error: "Google OAuth redirect_uri_mismatch"
- **Cause**: Redirect URI doesn't match exactly
- **Fix**: Ensure it's `http://localhost:5000/api/auth/google/callback` in both:
  - Google Cloud Console
  - backend/.env `GOOGLE_CALLBACK_URL`

### Error: "Port 5000 already in use"
```bash
# Windows: Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux: Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

### Error: "CORS error"
- **Cause**: Frontend URL doesn't match `FRONTEND_URL` in .env
- **Fix**: Update backend/.env:
```env
FRONTEND_URL=http://your-frontend-url.com
```

### Error: "OpenAI API error"
- Check API key is correct
- Check account has credits
- Check API quota limits

---

## Monitoring & Logs

### Local Development
```bash
# View all logs
docker-compose logs -f

# Backend logs only
docker-compose logs -f backend

# Frontend logs only
docker-compose logs -f frontend

# Follow new logs
docker-compose logs --follow
```

### Production Monitoring
- Setup application monitoring (New Relic, DataDog, etc.)
- Enable error tracking (Sentry, Rollbar, etc.)
- Monitor database performance
- Setup alerts for failures

---

## Support & Resources

**Documentation:**
- [README.md](./README.md) - Project overview and features
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Complete deployment guide
- [QUICKSTART.md](./QUICKSTART.md) - Quick setup guide

**External Resources:**
- [Express.js Docs](https://expressjs.com/)
- [React Docs](https://react.dev/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [Google OAuth Docs](https://developers.google.com/identity/protocols/oauth2)
- [OpenAI API Docs](https://platform.openai.com/docs)

---

## Next Steps

1. ✅ **Setup Local Development**
   - Run setup.bat (Windows) or setup.sh (macOS/Linux)
   - Configure .env files with credentials

2. ✅ **Test Locally**
   - Run `npm run dev`
   - Test at http://localhost:3000

3. ✅ **Deploy to Production**
   - Choose platform (Heroku, Azure, AWS, Docker)
   - Follow deployment guide
   - Setup monitoring and backups

4. ✅ **Maintain & Monitor**
   - Monitor application logs
   - Update dependencies regularly
   - Backup database regularly

---

Last Updated: 2024
Version: 1.0.0
