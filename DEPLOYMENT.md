# Deployment Guide - Smart Job Application Tracker

## Prerequisites

- Node.js 18+ or Docker + Docker Compose
- MongoDB (local or Atlas)
- Google OAuth credentials
- OpenAI API key

---

## Option 1: Local Development

### Setup

1. **Install Dependencies**
   ```bash
   npm run install:all
   ```

2. **Create Environment Files**
   - Update `backend/.env` with your credentials
   - Update `frontend/.env` if needed

3. **Start MongoDB**
   ```bash
   # Windows
   net start MongoDB
   
   # Or use Docker
   docker run -d -p 27017:27017 --name mongodb mongo:6.0-alpine
   ```

4. **Run Development Servers**
   ```bash
   npm run dev
   ```

   - Backend: http://localhost:5000
   - Frontend: http://localhost:3000

---

## Option 2: Docker (Recommended for Deployment)

### Quick Start

1. **Setup Environment**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your credentials
   ```

2. **Build and Run**
   ```bash
   docker-compose up -d
   ```

3. **Access Application**
   - Frontend: http://localhost:3000
   - API: http://localhost:5000/api

4. **View Logs**
   ```bash
   docker-compose logs -f backend
   docker-compose logs -f frontend
   ```

5. **Stop Services**
   ```bash
   docker-compose down
   ```

---

## Option 3: Production Deployment

### Azure App Service

1. **Create App Service**
   ```bash
   # Create resource group
   az group create --name jobtracker-rg --location eastus
   
   # Create App Service Plan
   az appservice plan create --name jobtracker-plan \
     --resource-group jobtracker-rg --sku B2 --is-linux
   
   # Create Web App
   az webapp create --resource-group jobtracker-rg \
     --plan jobtracker-plan --name jobtracker --runtime "NODE|18-lts"
   ```

2. **Configure Environment Variables**
   ```bash
   az webapp config appsettings set \
     --resource-group jobtracker-rg \
     --name jobtracker \
     --settings PORT=8080 NODE_ENV=production \
     MONGODB_URI="your-mongodb-url" \
     SESSION_SECRET="your-secret" \
     FRONTEND_URL="your-frontend-url" \
     GOOGLE_CLIENT_ID="your-client-id" \
     GOOGLE_CLIENT_SECRET="your-secret" \
     OPENAI_API_KEY="your-key"
   ```

3. **Deploy Code**
   ```bash
   # Using Git
   git init
   git add .
   git commit -m "Initial commit"
   
   # Configure Azure remote
   az webapp deployment source config-local-git \
     --resource-group jobtracker-rg --name jobtracker
   
   # Deploy
   git push azure main
   ```

### Heroku

1. **Create App**
   ```bash
   heroku create jobtracker-app
   ```

2. **Add MongoDB**
   ```bash
   heroku addons:create mongolab:sandbox
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set SESSION_SECRET="your-secret"
   heroku config:set GOOGLE_CLIENT_ID="your-id"
   heroku config:set GOOGLE_CLIENT_SECRET="your-secret"
   heroku config:set OPENAI_API_KEY="your-key"
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

### AWS (ECS + RDS)

1. **Build Docker Image**
   ```bash
   docker build -t jobtracker:latest .
   aws ecr create-repository --repository-name jobtracker
   docker tag jobtracker:latest [ACCOUNT_ID].dkr.ecr.[REGION].amazonaws.com/jobtracker:latest
   docker push [ACCOUNT_ID].dkr.ecr.[REGION].amazonaws.com/jobtracker:latest
   ```

2. **Create ECS Cluster and Task Definition**
   - Use AWS CloudFormation or Console
   - Configure environment variables
   - Set MongoDB connection string

3. **Create Service and Load Balancer**
   - Configure ALB for routing
   - Setup auto-scaling policies

---

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check connection string in `.env`
- For Atlas, whitelist your IP address

### Google OAuth Error
- Verify redirect URI matches exactly: `http://your-domain/api/auth/google/callback`
- Ensure Gmail API is enabled
- Check Client ID and Secret

### CORS Issues
- Update `FRONTEND_URL` in `backend/.env`
- Ensure frontend and backend URLs match exactly

### Memory Issues
- Increase container limits in docker-compose.yml
- Check application logs for memory leaks

---

## Database Backups

### MongoDB Atlas
- Automated backups available in free tier
- Configure backup window in Atlas console

### Local MongoDB Backup
```bash
mongodump --out backup_folder
mongorestore --dir backup_folder
```

---

## Performance Optimization

1. **Enable Caching**
   - Redis for session store (production)
   - Implement API response caching

2. **Database Indexing**
   - Already configured in models
   - Monitor query performance in production

3. **CDN Setup**
   - Serve static files via CDN
   - Configure CloudFlare or similar

4. **Load Balancing**
   - Deploy multiple backend instances
   - Use load balancer for distribution

---

## Security Checklist

- [ ] Change `SESSION_SECRET` to random value
- [ ] Use HTTPS in production
- [ ] Set `NODE_ENV=production`
- [ ] Enable CORS only for your domain
- [ ] Regular security updates for dependencies
- [ ] Use environment variables for all secrets
- [ ] Enable database authentication
- [ ] Setup rate limiting middleware
- [ ] Regular backups of database
- [ ] Monitor application logs

---

## Monitoring & Logs

### Docker
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### Application Metrics
- Monitor at: http://your-domain/api/health
- Setup APM tool (New Relic, DataDog, etc.)

---

## Updating Application

1. **Pull latest code**
   ```bash
   git pull origin main
   ```

2. **Update dependencies**
   ```bash
   docker-compose down
   docker-compose build --no-cache
   docker-compose up -d
   ```

3. **Run migrations if needed**
   ```bash
   # Scripts available in backend/scripts/
   ```

---

## Support

For issues or questions:
1. Check application logs
2. Verify environment variables
3. Consult README.md for features
4. Check GitHub Issues

---

Last Updated: 2024
Version: 1.0.0
