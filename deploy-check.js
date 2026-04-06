#!/usr/bin/env node

/**
 * Quick Deploy Helper Script
 * Provides information and guidance for deployment
 */

const fs = require('fs');
const path = require('path');

console.log('\n🚀 Smart Job Tracker - Deployment Helper\n');
console.log('===============================================\n');

// Check project structure
console.log('📋 Project Structure Check:');
const requiredDirs = [
  'backend',
  'frontend',
  'backend/config',
  'backend/models',
  'backend/routes',
  'backend/services',
  'backend/middleware',
  'frontend/src',
  'frontend/public'
];

let allPresent = true;
requiredDirs.forEach(dir => {
  const exists = fs.existsSync(path.join(__dirname, dir));
  console.log(`  ${exists ? '✅' : '❌'} ${dir}`);
  if (!exists) allPresent = false;
});

console.log('\n📦 Environment Files Check:');
const envFiles = [
  'backend/.env',
  'backend/.env.example',
  'frontend/.env',
];

envFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
});

console.log('\n🐳 Docker Files Check:');
const dockerFiles = ['Dockerfile', 'docker-compose.yml', '.gitignore'];
dockerFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
});

console.log('\n📚 Documentation Check:');
const docFiles = ['README.md', 'DEPLOYMENT.md', 'QUICKSTART.md'];
docFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
});

console.log('\n===============================================\n');
console.log('🎯 Next Steps:\n');
console.log('1. LOCAL DEVELOPMENT:');
console.log('   Windows: run setup.bat');
console.log('   macOS/Linux: bash setup.sh');
console.log('   or: npm run install:all\n');

console.log('2. CONFIGURE CREDENTIALS:');
console.log('   Edit backend/.env with your credentials:');
console.log('   - MONGODB_URI');
console.log('   - GOOGLE_CLIENT_ID');
console.log('   - GOOGLE_CLIENT_SECRET');
console.log('   - OPENAI_API_KEY\n');

console.log('3. START DEVELOPMENT:');
console.log('   npm run dev\n');

console.log('4. PRODUCTION DEPLOYMENT:');
console.log('   Docker: docker-compose up -d');
console.log('   Heroku: See DEPLOYMENT.md');
console.log('   Azure: See DEPLOYMENT.md');
console.log('   AWS: See DEPLOYMENT.md\n');

console.log('📖 For detailed info: cat README.md');
console.log('🚀 For deployment: cat DEPLOYMENT.md\n');

console.log('===============================================\n');
