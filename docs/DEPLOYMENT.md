# DEPLOYMENT GUIDE

## Production Deployment Strategies

This guide covers deploying the AI LinkedIn Job Application Automation System to production environments.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [AWS Deployment](#aws-deployment)
3. [DigitalOcean Deployment](#digitalocean-deployment)
4. [Heroku Deployment](#heroku-deployment)
5. [Azure Deployment](#azure-deployment)
6. [Google Cloud Deployment](#google-cloud-deployment)
7. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Pre-Deployment Checklist

### Security
- [ ] Generate new JWT_SECRET (32+ characters)
- [ ] Generate new ENCRYPTION_KEY (32+ characters)
- [ ] Review and update all environment variables
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure firewall rules
- [ ] Set up DDoS protection (if needed)
- [ ] Enable database authentication
- [ ] Configure rate limiting
- [ ] Review CORS settings
- [ ] Enable CSRF protection

### Performance
- [ ] Set up CDN for static assets
- [ ] Configure caching headers
- [ ] Enable database indexing
- [ ] Set up monitoring and alerts
- [ ] Configure auto-scaling
- [ ] Set up log aggregation
- [ ] Configure backup strategy
- [ ] Load testing completed

### Compliance
- [ ] Privacy policy reviewed
- [ ] GDPR compliance verified
- [ ] Data retention policies set
- [ ] Terms of service prepared
- [ ] Security audit completed

---

## AWS Deployment

### Option 1: AWS ECS (Elastic Container Service)

#### Prerequisites
```bash
# Install AWS CLI
pip install awscli

# Configure credentials
aws configure
```

#### Deployment Steps

1. **Create ECR Repository**
```bash
aws ecr create-repository --repository-name job-automation-backend
aws ecr create-repository --repository-name job-automation-frontend
```

2. **Build and Push Docker Images**
```bash
# Backend
docker build -f docker/Dockerfile.backend -t job-automation-backend:latest .
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
docker tag job-automation-backend:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/job-automation-backend:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/job-automation-backend:latest

# Frontend
docker build -f docker/Dockerfile.frontend -t job-automation-frontend:latest .
docker tag job-automation-frontend:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/job-automation-frontend:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/job-automation-frontend:latest
```

3. **Create ECS Task Definition**
```bash
# Update docker/ecs-task-definition.json with image URIs
aws ecs register-task-definition --cli-input-json file://docker/ecs-task-definition.json
```

4. **Create ECS Service**
```bash
aws ecs create-service \
  --cluster job-automation-cluster \
  --service-name job-automation-service \
  --task-definition job-automation-task:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx]}"
```

### Option 2: AWS Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli

# Initialize application
eb init -p docker job-automation-app

# Create environment
eb create job-automation-env

# Deploy
eb deploy

# View logs
eb logs

# Monitor
eb open
```

---

## DigitalOcean Deployment

### Using App Platform

1. **Push to GitHub**
```bash
git remote add origin https://github.com/youruser/job-automation.git
git push -u origin main
```

2. **Connect via DigitalOcean App Platform**
- Go to Apps > Create App
- Connect GitHub repository
- Select branch: main
- Configure components:
  - Backend: Node.js, port 5000
  - Frontend: Node.js, port 3000
  - MongoDB: Managed Database

3. **Set Environment Variables**
```bash
MONGODB_URI=your_mongodb_uri
OPENAI_API_KEY=your_key
GMAIL_CLIENT_ID=your_id
```

4. **Deploy**
- Click "Create Resources"
- Monitor deployment progress
- Access via provided domain

### Using Droplets

```bash
# SSH into droplet
ssh root@your_droplet_ip

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Clone repository
git clone https://github.com/youruser/job-automation.git
cd job-automation

# Create .env file
nano .env

# Deploy
docker-compose up -d

# View logs
docker-compose logs -f
```

---

## Heroku Deployment

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create job-automation-app

# Add MongoDB add-on
heroku addons:create mongolab:sandbox

# Add environment variables
heroku config:set OPENAI_API_KEY=your_key
heroku config:set GMAIL_CLIENT_ID=your_id
heroku config:set JWT_SECRET=$(openssl rand -base64 32)

# Deploy
git push heroku main

# View logs
heroku logs --tail

# Monitor
heroku status
```

---

## Azure Deployment

### Using Azure Container Instances

```bash
# Create resource group
az group create \
  --name job-automation-rg \
  --location eastus

# Create container registry
az acr create \
  --resource-group job-automation-rg \
  --name jobautomationregistry \
  --sku Basic

# Build image
az acr build \
  --registry jobautomationregistry \
  --image job-automation:latest \
  --file docker/Dockerfile.backend .

# Create container instance
az container create \
  --resource-group job-automation-rg \
  --name job-automation-container \
  --image jobautomationregistry.azurecr.io/job-automation:latest \
  --dns-name-label job-automation \
  --ports 5000 \
  --environment-variables MONGODB_URI="$MONGODB_URI"
```

---

## Google Cloud Deployment

### Using Cloud Run

```bash
# Create project
gcloud projects create job-automation

# Set project
gcloud config set project job-automation

# Enable APIs
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Build image
gcloud builds submit --tag gcr.io/job-automation/backend

# Deploy
gcloud run deploy job-automation-backend \
  --image gcr.io/job-automation/backend \
  --platform managed \
  --region us-central1 \
  --set-env-vars MONGODB_URI="$MONGODB_URI"

# View deployment
gcloud run services list
```

---

## Monitoring & Maintenance

### Health Checks

```bash
# Check backend health
curl -X GET http://your-domain/api/health

# Check database
curl -X GET http://your-domain/api/health/db

# Response
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": 3600
}
```

### Monitoring Tools

- **DataDog**: Application Performance Monitoring
- **New Relic**: Full-stack monitoring
- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **Prometheus**: Metrics collection

### Scaling Strategy

| Component | Initial | Peak | Auto-scale |
|-----------|---------|------|-----------|
| Backend   | 2       | 10   | CPU > 70% |
| Frontend  | 2       | 5    | CPU > 80% |
| Database  | 1       | 3    | Connections > 1000 |

### Backup Strategy

```bash
# Daily MongoDB backup
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/job_automation_db" \
  --out /backups/daily/$(date +%Y-%m-%d)

# Upload to S3
aws s3 sync /backups s3://job-automation-backups/
```

---

## Troubleshooting

### Common Deployment Issues

**Issue**: Database connection timeout
```bash
# Solution: Check security groups and VPC settings
aws ec2 describe-security-groups --group-names default
```

**Issue**: Out of memory
```bash
# Solution: Increase container memory
docker update --memory 2g container_name
```

**Issue**: High latency
```bash
# Solution: Enable caching and CDN
# Configure Redis for session caching
```

---

## Performance Optimization

### Database Optimization

```javascript
// Create indexes
db.users.createIndex({ email: 1 })
db.applications.createIndex({ userId: 1, createdAt: -1 })
db.jobs.createIndex({ userId: 1, isDuplicate: 1 })
```

### Application Optimization

- Enable gzip compression
- Implement caching (Redis)
- Use CDN for static assets
- Optimize database queries
- Implement rate limiting
- Use connection pooling

---

For more information, refer to the main [README.md](../README.md)
