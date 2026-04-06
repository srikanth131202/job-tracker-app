@echo off
REM Smart Job Tracker - Development Setup Script for Windows
REM This script helps setup the project for local development

echo.
echo 🚀 Smart Job Application Tracker - Setup Script
echo =============================================
echo.

REM Check if Node is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/
    exit /b 1
)

echo ✅ Node.js and npm detected
echo.

REM Install dependencies
echo 📦 Installing dependencies...
call npm run install:all

echo.
echo ✅ Dependencies installed successfully
echo.

REM Create .env files if they don't exist
if not exist "backend\.env" (
    echo 📝 Creating backend\.env...
    copy backend\.env.example backend\.env
    echo ⚠️  Please update backend\.env with your credentials:
    echo    - MONGODB_URI
    echo    - GOOGLE_CLIENT_ID
    echo    - GOOGLE_CLIENT_SECRET
    echo    - OPENAI_API_KEY
)

if not exist "frontend\.env" (
    echo 📝 Creating frontend\.env...
    (
        echo REACT_APP_API_URL=http://localhost:5000/api
        echo REACT_APP_APP_NAME=Smart Job Tracker
    ) > frontend\.env
    echo ✅ frontend\.env created
)

echo.
echo =============================================
echo ✅ Setup Complete!
echo.
echo 📋 Next Steps:
echo 1. Update backend\.env with your credentials
echo 2. Start MongoDB (if running locally):
echo    - Windows: net start MongoDB
echo    - Docker: docker run -d -p 27017:27017 --name mongodb mongo:6.0-alpine
echo 3. Run: npm run dev
echo.
echo 🌐 Once started:
echo    - Frontend: http://localhost:3000
echo    - Backend:  http://localhost:5000
echo.
echo 📚 For more info, see README.md and DEPLOYMENT.md
echo.
