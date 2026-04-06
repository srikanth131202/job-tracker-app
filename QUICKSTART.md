# Smart Job Application Tracker - Quick Start Guide

## Quick Setup (5 minutes)

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Create Environment Files

**backend/.env:**
```bash
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/job-tracker
SESSION_SECRET=change-this-to-random-string
FRONTEND_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
OPENAI_API_KEY=your-openai-api-key
```

**frontend/.env:**
```bash
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Google Cloud Setup

1. Visit https://console.cloud.google.com/
2. Create new project
3. Enable Gmail API
4. Create OAuth 2.0 credentials
5. Add redirect URI: `http://localhost:5000/api/auth/google/callback`
6. Copy Client ID and Secret to backend/.env

### 4. OpenAI Setup

1. Visit https://platform.openai.com/api-keys
2. Create new API key
3. Copy to backend/.env as OPENAI_API_KEY

### 5. Start MongoDB

```bash
# Windows (if MongoDB installed)
net start MongoDB

# Or use MongoDB Atlas cloud database
```

### 6. Run the App

```bash
npm run dev
```

This starts both backend (port 5000) and frontend (port 3000).

### 7. Open Browser

Visit http://localhost:3000 and sign in with Google!

---

## Testing Without Gmail

You can manually add applications without syncing Gmail:
1. Sign in with Google
2. Go to Applications page
3. Click "Add Application"
4. Fill in company and role details

---

## Common Issues

**"Cannot connect to MongoDB"**
- Start MongoDB service or use MongoDB Atlas connection string

**"Google OAuth error"**
- Verify redirect URI matches exactly
- Ensure Gmail API is enabled

**"OpenAI API error"**
- Check API key is correct
- Verify account has credits

---

For detailed documentation, see README.md
