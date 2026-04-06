# Smart Job Application Tracker

> **Automated Job Application Management with Gmail Integration and AI-Powered Parsing**

A full-stack web application that automatically tracks job applications by parsing emails from your Gmail, extracting key information, and providing an intuitive dashboard to manage your job search.

![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)
![React](https://img.shields.io/badge/React-18+-blue?logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-6+-green?logo=mongodb)
![Express](https://img.shields.io/badge/Express-4+-black?logo=express)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## 🎯 Features

### ✨ Core Features
- **🔐 Google OAuth Integration** - Secure login with Google accounts
- **📧 Gmail Synchronization** - Automatically sync job-related emails
- **🤖 AI Email Parsing** - OpenAI-powered extraction of job details
- **📊 Smart Dashboard** - Real-time statistics and application tracking
- **🏢 Application Management** - Create, edit, and track job applications
- **📅 Interview Tracking** - Schedule and manage interview details
- **🔍 Advanced Search & Filters** - Find applications by company, role, status
- **📱 Responsive Design** - Works on desktop, tablet, and mobile
- **🔄 Auto-Sync** - Background synchronization of emails

### 🛡️ Security
- Secure session management with MongoDB store
- OAuth 2.0 for authentication
- Environment-based configuration
- HTTPS ready for production

### 🚀 Performance
- Optimized database queries with indexes
- Pagination for large datasets
- Caching strategies
- Asynchronous operations

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.0.0 or higher ([Download](https://nodejs.org/))
- **npm** 9.0.0 or higher (comes with Node.js)
- **MongoDB** 5.0+ (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

### Optional but Recommended
- **Docker & Docker Compose** (for containerized deployment)
- **Git** (for version control)

---

## 🚀 Quick Start (5 Minutes)

### Option 1: Local Development

#### 1️⃣ Clone & Install
```bash
npm run install:all
```

#### 2️⃣ Setup Configuration
**Windows:**
```bash
setup.bat
```

**macOS/Linux:**
```bash
bash setup.sh
```

Or manually:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

#### 3️⃣ Configure Credentials
Edit `backend/.env` and add:
```env
MONGODB_URI=mongodb://localhost:27017/job-tracker
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-secret
OPENAI_API_KEY=your-api-key
```

See [Credentials Setup Guide](#-credentials-setup) below.

#### 4️⃣ Start MongoDB
```bash
# Windows
net start MongoDB

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:6.0-alpine
```

#### 5️⃣ Run Development Servers
```bash
npm run dev
```

Visit:
- 🌐 Frontend: http://localhost:3000
- 🔌 Backend API: http://localhost:5000/api

---

### Option 2: Docker (Recommended for Production)

```bash
docker-compose up -d
```

Then visit http://localhost:3000

---

## 🔑 Credentials Setup

### Google OAuth 2.0

1. **Create Google Cloud Project**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Enable "Gmail API"

2. **Create OAuth Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Choose "Web application"
   - Add Authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
   - Copy **Client ID** and **Client Secret**

3. **Add to `.env`**
   ```env
   GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-xxx
   ```

### OpenAI API Key

1. **Create OpenAI Account**
   - Visit [OpenAI Platform](https://platform.openai.com/)
   - Sign up and verify email
   - Go to "API keys" section

2. **Generate API Key**
   - Click "Create new secret key"
   - Copy the key

3. **Add to `.env`**
   ```env
   OPENAI_API_KEY=sk-xxx
   ```

### MongoDB

**Option A: Local MongoDB**
```env
MONGODB_URI=mongodb://localhost:27017/job-tracker
```

**Option B: MongoDB Atlas (Cloud)**
1. Create free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string
4. Add to `.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/job-tracker
   ```

---

## 📚 Project Structure

```
job-tracker-app/
├── backend/                    # Express.js backend
│   ├── config/                # Configuration files
│   │   ├── db.js              # MongoDB connection
│   │   └── passport.js        # OAuth configuration
│   ├── models/                # Mongoose models
│   │   ├── User.js            # User schema
│   │   └── JobApplication.js  # Job application schema
│   ├── routes/                # API routes
│   │   ├── auth.js            # Authentication endpoints
│   │   ├── applications.js    # CRUD operations
│   │   └── sync.js            # Gmail sync endpoints
│   ├── middleware/            # Express middleware
│   │   └── auth.js            # Authentication checks
│   ├── services/              # Business logic services
│   │   ├── gmailService.js    # Gmail API interactions
│   │   ├── aiParserService.js # OpenAI parsing
│   │   └── syncService.js     # Background synchronization
│   ├── server.js              # Entry point
│   └── package.json           # Dependencies
│
├── frontend/                  # React frontend
│   ├── public/                # Static files
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── context/           # React context (auth)
│   │   ├── services/          # API client
│   │   ├── App.js             # Main component
│   │   └── index.js           # Entry point
│   ├── package.json           # Dependencies
│   └── tailwind.config.js     # Tailwind CSS config
│
├── docker-compose.yml         # Docker composition
├── Dockerfile                 # Container setup
├── DEPLOYMENT.md              # Deployment guide
└── README.md                  # This file
```

---

## 🛠️ Development

### Available Scripts

**Root Directory:**
```bash
npm run install:all       # Install all dependencies
npm run dev               # Start both frontend and backend
npm run dev:backend       # Start only backend
npm run dev:frontend      # Start only frontend
npm run build             # Build frontend for production
npm run setup             # Complete setup
```

**Backend Only:**
```bash
cd backend
npm run dev               # Development with auto-reload (nodemon)
npm start                 # Production mode
npm test                  # Run tests (if configured)
```

**Frontend Only:**
```bash
cd frontend
npm start                 # Development server
npm run build             # Production build
npm test                  # Run tests
```

---

## 🔌 API Endpoints

### Authentication
```
GET    /api/auth/google              # Initiate Google login
GET    /api/auth/google/callback     # OAuth callback
GET    /api/auth/me                  # Get current user
GET    /api/auth/logout              # Logout user
GET    /api/auth/login               # Check auth status
PUT    /api/auth/preferences         # Update preferences
```

### Applications
```
GET    /api/applications             # Get all applications (paginated)
GET    /api/applications/stats       # Get dashboard statistics
GET    /api/applications/:id         # Get single application
POST   /api/applications             # Create new application
PUT    /api/applications/:id         # Update application
DELETE /api/applications/:id         # Delete application
```

### Gmail Sync
```
POST   /api/sync/trigger             # Trigger manual sync
GET    /api/sync/status              # Get sync status
POST   /api/sync/toggle              # Enable/disable auto-sync
GET    /api/sync/preview             # Preview emails
```

---

## 🚀 Deployment

### Quick Deployment Options

1. **Docker (Recommended)**
   ```bash
   docker-compose up -d
   ```

2. **Heroku**
   See [DEPLOYMENT.md](./DEPLOYMENT.md#heroku)

3. **Azure App Service**
   See [DEPLOYMENT.md](./DEPLOYMENT.md#azure-app-service)

4. **AWS ECS**
   See [DEPLOYMENT.md](./DEPLOYMENT.md#aws-ecs)

### Production Checklist
- [ ] Set unique `SESSION_SECRET`
- [ ] Update all credentials in `.env`
- [ ] Set `NODE_ENV=production`
- [ ] Use HTTPS URLs
- [ ] Configure proper CORS origins
- [ ] Setup database backups
- [ ] Enable application monitoring
- [ ] Configure error logging

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Ensure MongoDB is running
```bash
# Windows
net start MongoDB

# Docker
docker run -d -p 27017:27017 --name mongodb mongo:6.0-alpine
```

### Google OAuth Error
```
Error: invalid_grant or Token has been expired
```
**Solution:** 
1. Verify redirect URI matches exactly
2. Check Client ID and Secret are correct
3. Ensure Gmail API is enabled

### Port Already in Use
```bash
# Kill process on port 5000
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

### CORS Errors
**Solution:** Ensure `FRONTEND_URL` in `backend/.env` matches your frontend URL

### Cannot find module errors
```bash
# Reinstall dependencies
npm run install:all
```

---

## 📖 Key Features Walkthrough

### 1. Gmail Sync
- Automatically fetches job-related emails from Gmail
- Uses AI to extract: company name, role, application date, interview details
- Updates application status based on email content

### 2. Dashboard
- View statistics: Total applications, interviews scheduled, offers received
- Status breakdown: Applied, Interview, Offer, Rejected, Withdrawn
- Quick actions for common tasks

### 3. Application Management
- Add/edit/delete job applications manually
- Track interview details: date, time, type, notes
- Save salary information and company links
- Add custom tags and notes

### 4. Search & Filter
- Search by company name or job role
- Filter by application status
- Sort by date applied, last updated, etc.
- Pagination for large datasets

---

## 🔐 Security Best Practices

The application follows these security practices:

✅ **Authentication**
- OAuth 2.0 for secure login
- Session-based authentication
- Passport.js integration

✅ **Data Protection**
- Passwords never stored (OAuth only)
- Secure session cookies
- HTTPS ready for production

✅ **Configuration**
- Sensitive data in environment variables
- No secrets in version control
- .gitignore protects .env files

✅ **Database**
- MongoDB connection validated
- Indexed queries for performance
- User data isolation (userId checks)

---

## 🐳 Docker Support

### Build Your Own Image
```bash
docker build -t job-tracker .
docker run -p 5000:5000 -p 3000:3000 \
  -e MONGODB_URI=mongodb://... \
  -e GOOGLE_CLIENT_ID=... \
  -e GOOGLE_CLIENT_SECRET=... \
  -e OPENAI_API_KEY=... \
  job-tracker
```

### Using Docker Compose
```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## 📊 Performance Tips

1. **Database Indexing** - Already configured on userId, status, email
2. **Pagination** - Default 20 items per page
3. **Caching** - Implement Redis for session store in production
4. **Email Batching** - Sync processes are queued and batched
5. **API Rate Limiting** - Configure based on your needs

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 💬 Support & Issues

- 📖 **Documentation**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- 🐛 **Bug Reports**: Create an issue in the repository
- 💡 **Feature Requests**: Start a discussion

---

## 🎓 Learning Resources

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Google APIs](https://developers.google.com/docs)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)

---

## 📅 Roadmap

### v1.1.0 (Planned)
- [ ] Email notification system
- [ ] Salary insights and analytics
- [ ] Interview preparation materials
- [ ] Job market trends
- [ ] Export applications to PDF

### v1.2.0 (Planned)
- [ ] OAuth integration with LinkedIn
- [ ] Calendar view for interviews
- [ ] Collaborative features (shared job boards)
- [ ] Mobile application

---

## 🎉 Acknowledgments

Built with:
- ❤️ [Express.js](https://expressjs.com/)
- ⚛️ [React](https://react.dev/)
- 🗄️ [MongoDB](https://www.mongodb.com/)
- 🔐 [Passport.js](http://www.passportjs.org/)
- 🤖 [OpenAI](https://openai.com/)
- 🎨 [Tailwind CSS](https://tailwindcss.com/)

---

**Made with ❤️ for better job hunting**

Last Updated: 2024 | Version: 1.0.0
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Gmail API
   - Google+ API (for profile info)

4. Go to **APIs & Services > Credentials**
5. Click **Create Credentials > OAuth 2.0 Client ID**
6. Configure the OAuth consent screen:
   - User Type: External
   - Fill in required fields
   - Add scopes: `profile`, `email`, `gmail.readonly`

7. Create OAuth 2.0 Client ID:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:5000/api/auth/google/callback`
   - Note the Client ID and Client Secret

### Step 3: Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click **Create new secret key**
4. Copy and save the key securely

### Step 4: Configure Environment Variables

**Backend** (`backend/.env`):

```bash
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/job-tracker

# Session
SESSION_SECRET=your-secret-key-change-in-production

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key
```

**Frontend** (`frontend/.env`):

```bash
REACT_APP_API_URL=http://localhost:5000/api
```

### Step 5: Start MongoDB

**Local MongoDB:**
```bash
# Windows (if installed as service)
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

**Or use MongoDB Atlas:**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get connection string
4. Update `MONGODB_URI` in backend `.env`

### Step 6: Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

Backend will start on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

Frontend will start on `http://localhost:3000`

### Step 7: Test the Application

1. Open `http://localhost:3000` in your browser
2. Click **Sign in with Google**
3. Grant permissions for Gmail access
4. You'll be redirected to the dashboard
5. Click **Sync Gmail** to fetch job-related emails

## Project Structure

```
job-tracker-app/
├── backend/
│   ├── config/
│   │   ├── passport.js      # Google OAuth configuration
│   │   └── db.js            # MongoDB connection
│   ├── controllers/         # Request handlers
│   ├── models/
│   │   ├── User.js          # User schema
│   │   └── JobApplication.js # Application schema
│   ├── routes/
│   │   ├── auth.js          # Auth routes
│   │   ├── applications.js  # Application CRUD routes
│   │   └── sync.js          # Sync routes
│   ├── services/
│   │   ├── gmailService.js  # Gmail API integration
│   │   ├── aiParserService.js # OpenAI email parsing
│   │   └── syncService.js   # Background sync logic
│   ├── middleware/
│   │   └── auth.js          # Auth middleware
│   ├── server.js            # Express server entry
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.js
│   │   │   ├── StatCard.js
│   │   │   ├── StatusBadge.js
│   │   │   ├── ApplicationCard.js
│   │   │   ├── Modal.js
│   │   │   └── AddApplicationModal.js
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Applications.js
│   │   │   └── Settings.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── utils/
│   │   │   └── helpers.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   └── tailwind.config.js
│
└── README.md
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/google` | Initiate Google OAuth |
| GET | `/api/auth/google/callback` | OAuth callback |
| GET | `/api/auth/login` | Check login status |
| GET | `/api/auth/logout` | Logout user |
| GET | `/api/auth/me` | Get current user |

### Applications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/applications` | Get all applications |
| GET | `/api/applications/stats` | Get dashboard stats |
| GET | `/api/applications/:id` | Get single application |
| POST | `/api/applications` | Create application |
| PUT | `/api/applications/:id` | Update application |
| PATCH | `/api/applications/:id/status` | Update status |
| DELETE | `/api/applications/:id` | Delete application |

### Sync
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sync/trigger` | Manual sync trigger |
| GET | `/api/sync/status` | Get sync status |
| POST | `/api/sync/toggle` | Toggle sync |

## Database Schema

### User Collection
```javascript
{
  googleId: String,
  email: String,
  name: String,
  avatar: String,
  googleToken: String,
  refreshToken: String,
  preferences: {
    syncEnabled: Boolean,
    syncInterval: Number,
    emailFilters: [String]
  },
  lastSyncAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### JobApplication Collection
```javascript
{
  userId: ObjectId,
  company: String,
  role: String,
  status: String, // Applied, Interview, Offer, Rejected, Withdrawn
  appliedDate: Date,
  lastUpdated: Date,
  emailSource: {
    messageId: String,
    threadId: String,
    from: String,
    subject: String,
    snippet: String,
    receivedAt: Date
  },
  interviewDetails: {
    scheduled: Boolean,
    date: Date,
    time: String,
    type: String,
    notes: String
  },
  location: String,
  salary: {
    min: Number,
    max: Number,
    currency: String
  },
  jobUrl: String,
  notes: String,
  tags: [String],
  aiParsed: Boolean,
  rawEmailContent: String,
  createdAt: Date,
  updatedAt: Date
}
```

## AI Email Parsing

The AI parser uses OpenAI's GPT-4o-mini to extract structured data from emails:

- **Company Name** - Extracted from email content and signatures
- **Job Role** - Position title from subject and body
- **Application Status** - Determined from email context
- **Interview Details** - Date, time, type if scheduled
- **Location** - Remote or office location
- **Salary** - Compensation range if mentioned

## Troubleshooting

### Gmail API Errors
- Ensure Gmail API is enabled in Google Cloud Console
- Check OAuth scopes include `gmail.readonly`
- Re-authorize by disconnecting and reconnecting Gmail

### MongoDB Connection Errors
- Verify MongoDB is running
- Check connection string format
- For Atlas, ensure IP whitelist includes your IP

### OpenAI API Errors
- Verify API key is valid
- Check account has available credits
- Ensure model name is correct

### CORS Errors
- Verify `FRONTEND_URL` matches your frontend URL
- Check browser console for specific errors

## Security Considerations

- Change `SESSION_SECRET` in production
- Use HTTPS in production
- Store environment variables securely
- Implement rate limiting for production
- Regular dependency updates

## License

MIT License - feel free to use this project for learning or production.
