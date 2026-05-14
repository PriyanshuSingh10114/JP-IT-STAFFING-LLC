# 🤖 AI LinkedIn Job Application Automation System

> A production-grade, enterprise-ready platform for automating LinkedIn job searches and applications using AI-powered email generation and Playwright browser automation.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running Locally](#running-locally)
- [Docker Deployment](#docker-deployment)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)
- [Security Considerations](#security-considerations)
- [Future Improvements](#future-improvements)

---

## ✨ Features

### 🔐 **LinkedIn Automation**
- ✅ Persistent session management with cookie storage
- ✅ Anti-detection measures (randomized delays, user-agent rotation)
- ✅ Headless and headed browser modes
- ✅ Proxy support for enhanced privacy
- ✅ Automatic OTP handling
- ✅ Screenshot capture for debugging

### 🔍 **Job Search & Filtering**
- ✅ Search LinkedIn POSTS section for recent job postings
- ✅ Advanced filtering by keywords, role, job type, location
- ✅ Support for 24-hour, week, and month timeframes
- ✅ Infinite scroll automation
- ✅ Duplicate job detection
- ✅ Blacklist/whitelist company support

### 👥 **Recruiter Email Extraction**
- ✅ Multi-strategy email extraction:
  - Direct extraction from posts
  - Comments analysis
  - Company domain matching
  - Hunter.io API integration
  - Apollo.io API integration
- ✅ Email confidence scoring
- ✅ Validation and deduplication

### 🤖 **AI-Powered Email Generation**
- ✅ OpenAI GPT-4 integration
- ✅ Personalized email templates
- ✅ Job description analysis
- ✅ Skill matching
- ✅ Multiple tone options (professional, casual, formal)
- ✅ HTML and plain text support

### 📧 **Gmail Integration**
- ✅ OAuth 2.0 authentication
- ✅ Gmail API for reliable sending
- ✅ Nodemailer fallback
- ✅ Email attachment support
- ✅ Draft creation
- ✅ Email thread tracking

### 📊 **Application Tracking**
- ✅ Real-time application status updates
- ✅ Recruiter reply tracking
- ✅ Email open/click tracking
- ✅ Response time analysis
- ✅ Success rate metrics

### 📈 **Dashboard & Analytics**
- ✅ Professional dark-mode UI
- ✅ Real-time statistics
- ✅ Performance charts
- ✅ Activity timeline
- ✅ Responsive design

### ⚙️ **Advanced Features**
- ✅ Automated scheduling
- ✅ Comprehensive logging
- ✅ Error recovery with retry logic
- ✅ Database for persistent storage
- ✅ WebSocket for real-time updates
- ✅ Encrypted credential storage

---

## 🏗️ Tech Stack

### **Frontend**
- Next.js 14 (React Framework)
- Tailwind CSS (Styling)
- Recharts (Charts & Graphs)
- Axios (HTTP Client)
- Socket.io-client (Real-time)

### **Backend**
- Node.js
- Express.js
- MongoDB (Database)
- Mongoose (ODM)
- Playwright (Browser Automation)
- OpenAI API (AI/ML)
- Gmail API (Email)

### **Infrastructure**
- Docker & Docker Compose
- MongoDB Atlas (or Local MongoDB)

### **Automation**
- Playwright (Headless Browser)
- Winston (Logging)
- Node Schedule (Cron Jobs)

---

## 📁 Project Structure

```
jp-it-staffing-llc/
│
├── backend/                          # Node.js Express Backend
│   ├── src/
│   │   ├── index.js                 # Main server entry point
│   │   ├── controllers/             # Request handlers
│   │   ├── services/                # Business logic
│   │   │   ├── AuthService.js
│   │   │   ├── EmailGenerationService.js
│   │   │   ├── GmailService.js
│   │   │   └── ...
│   │   ├── models/                  # MongoDB schemas
│   │   │   ├── User.js
│   │   │   ├── Job.js
│   │   │   ├── Application.js
│   │   │   ├── Recruiter.js
│   │   │   ├── Resume.js
│   │   │   ├── EmailLog.js
│   │   │   ├── Settings.js
│   │   │   └── AutomationLog.js
│   │   ├── routes/                  # API endpoints
│   │   │   ├── auth.routes.js
│   │   │   ├── job.routes.js
│   │   │   ├── recruiter.routes.js
│   │   │   ├── application.routes.js
│   │   │   ├── resume.routes.js
│   │   │   ├── settings.routes.js
│   │   │   ├── dashboard.routes.js
│   │   │   └── automation.routes.js
│   │   ├── middleware/              # Custom middleware
│   │   │   ├── authMiddleware.js
│   │   │   ├── errorHandler.js
│   │   │   └── validationHandler.js
│   │   ├── utils/
│   │   │   └── logger.js            # Winston logger config
│   │   └── config/
│   │       └── database.js          # DB config
│   └── package.json
│
├── frontend/                         # Next.js React Dashboard
│   ├── src/
│   │   ├── pages/
│   │   │   ├── index.jsx            # Landing page
│   │   │   ├── login.jsx            # Login page
│   │   │   ├── register.jsx         # Registration page
│   │   │   ├── dashboard.jsx        # Dashboard
│   │   │   ├── jobs.jsx             # Jobs list
│   │   │   ├── applications.jsx     # Applications tracking
│   │   │   ├── recruiters.jsx       # Recruiters list
│   │   │   ├── resumes.jsx          # Resume management
│   │   │   ├── settings.jsx         # Settings page
│   │   │   └── _app.jsx             # App wrapper
│   │   └── components/
│   │       ├── Layout.jsx           # Main layout
│   │       ├── DashboardStats.jsx   # Stats cards
│   │       ├── PerformanceChart.jsx # Charts
│   │       └── RecentActivity.jsx   # Activity feed
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── automation/                       # Automation Scripts
│   ├── linkedin/
│   │   ├── LinkedInAutomationService.js  # LinkedIn browser automation
│   │   ├── sessionManager.js        # Session persistence
│   │   └── emailExtraction.js       # Email extraction strategies
│   ├── gmail/
│   │   └── index.js                 # Gmail integration
│   └── ai/
│       └── emailGenerator.js        # AI email generation
│
├── shared/                           # Shared Code
│   ├── utils/
│   ├── constants/
│   │   └── index.js                 # Application constants
│   └── helpers/
│
├── database/                         # Database
│   └── models/                       # Schema definitions
│
├── logs/                             # Application Logs
│   ├── app.log
│   ├── error.log
│   ├── automation.log
│   └── combined.log
│
├── resumes/                          # User Resume Storage
├── screenshots/                      # Playwright Screenshots
├── sessions/                         # LinkedIn Session Storage
│
├── docker/                           # Docker Files
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── docker-compose.dev.yml
│
├── docs/                             # Documentation
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── TROUBLESHOOTING.md
│
├── .env.example                      # Environment template
├── docker-compose.yml                # Production Docker Compose
├── package.json                      # Root package
└── README.md                         # This file
```

---

## 📦 Prerequisites

Before installation, ensure you have:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **MongoDB** 6.0+ ([Download](https://www.mongodb.com/try/download/community) or [Atlas](https://www.mongodb.com/cloud/atlas))
- **Docker** & **Docker Compose** (optional, for containerization)
- **Git**

### API Keys Required
- **OpenAI API Key** (for email generation)
- **Gmail OAuth Credentials** (for sending emails)
- **LinkedIn Account** (for automation)
- **Hunter.io API Key** (optional, for email extraction)
- **Apollo.io API Key** (optional, for email extraction)

---

## 🚀 Installation

### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/ai-linkedin-job-automation.git
cd ai-linkedin-job-automation
```

### Step 2: Setup Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```bash
nano .env.local  # or use your favorite editor
```

### Step 3: Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

### Step 4: Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

---

## ⚙️ Configuration

### 1. **MongoDB Setup**

#### Option A: Local MongoDB
```bash
# Install MongoDB Community Edition
# https://docs.mongodb.com/manual/installation/

# Start MongoDB
mongod
```

#### Option B: MongoDB Atlas (Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create account and cluster
3. Get connection string
4. Update `.env.local`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/job_automation_db
```

### 2. **Gmail OAuth Setup**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project
3. Enable Gmail API
4. Create OAuth 2.0 credentials (OAuth Consent Screen)
5. Add scopes:
   - `https://www.googleapis.com/auth/gmail.send`
   - `https://www.googleapis.com/auth/gmail.readonly`
6. Download credentials JSON
7. Add to `.env.local`:
```
GMAIL_CLIENT_ID=your_client_id
GMAIL_CLIENT_SECRET=your_client_secret
GMAIL_USER_EMAIL=your_email@gmail.com
```

### 3. **OpenAI API Setup**

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create API key
3. Add to `.env.local`:
```
OPENAI_API_KEY=sk-your_key_here
OPENAI_MODEL=gpt-4
```

### 4. **LinkedIn Credentials**

Add to `.env.local`:
```
LINKEDIN_EMAIL=your_email@gmail.com
LINKEDIN_PASSWORD=your_password
```

### 5. **Optional: Email Extraction APIs**

For better email extraction, add:
```
# Hunter.io
HUNTER_API_KEY=your_hunter_key

# Apollo.io
APOLLO_API_KEY=your_apollo_key
```

---

## 🏃 Running Locally

### Terminal 1: Start Backend

```bash
cd backend
npm run dev
```

Expected output:
```
╔════════════════════════════════════════════════════════════╗
║   AI LINKEDIN JOB APPLICATION AUTOMATION SYSTEM            ║
║   Backend Server                                           ║
╠════════════════════════════════════════════════════════════╣
║   Server Status: ✓ RUNNING                                 ║
║   Port: 5000                                               ║
║   Environment: development                                 ║
║   MongoDB: ✓ Connected                                     ║
╚════════════════════════════════════════════════════════════╝
```

### Terminal 2: Start Frontend

```bash
cd frontend
npm run dev
```

Expected output:
```
  ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

### Access Application

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **API Docs**: http://localhost:5000/api

---

## 🐳 Docker Deployment

### Development with Docker

```bash
# Build and start containers
docker-compose -f docker/docker-compose.dev.yml up --build

# Access
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# MongoDB: localhost:27017
```

### Production Deployment

```bash
# Build production images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Docker Commands

```bash
# Build specific service
docker-compose build backend

# Rebuild without cache
docker-compose build --no-cache

# Restart services
docker-compose restart

# Remove volumes
docker-compose down -v

# Scale services
docker-compose up --scale backend=2
```

---

## 📡 API Documentation

### Authentication Endpoints

#### Register
```bash
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}

Response:
{
  "success": true,
  "user": {
    "id": "userId",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### Get Profile
```bash
GET /api/auth/profile
Authorization: Bearer {token}
```

### Job Endpoints

#### Get Jobs
```bash
GET /api/jobs?page=1&limit=20&status=new&searchTerm=Java
Authorization: Bearer {token}
```

#### Create Job
```bash
POST /api/jobs
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Senior Java Developer",
  "company": "Tech Company",
  "description": "Job description here",
  "jobType": "Fulltime",
  "location": "Remote"
}
```

### Application Endpoints

#### Get Applications
```bash
GET /api/applications?page=1&limit=20&status=sent
Authorization: Bearer {token}
```

#### Get Application Stats
```bash
GET /api/applications/stats/overview
Authorization: Bearer {token}
```

### Dashboard Endpoints

#### Get Dashboard Stats
```bash
GET /api/dashboard/stats
Authorization: Bearer {token}
```

#### Get Performance Metrics
```bash
GET /api/dashboard/performance
Authorization: Bearer {token}
```

### Resume Endpoints

#### Upload Resume
```bash
POST /api/resumes/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

Form Data:
- resume: [PDF file]
- title: "My Resume"
- isPrimary: true
```

#### Get Resumes
```bash
GET /api/resumes
Authorization: Bearer {token}
```

### Automation Endpoints

#### Start Job Search
```bash
POST /api/automation/start-search
Authorization: Bearer {token}
Content-Type: application/json

{
  "keywords": ["Java Developer"],
  "maxJobs": 20
}
```

#### Get Automation Status
```bash
GET /api/automation/status/{automationId}
Authorization: Bearer {token}
```

---

## 🔧 Troubleshooting

### Common Issues

#### **MongoDB Connection Failed**
```
Error: MongooseError: Cannot connect to MongoDB
```

**Solution:**
1. Verify MongoDB is running: `mongod` or check MongoDB Atlas
2. Check MONGODB_URI in `.env.local`
3. Ensure network access (if using Atlas)
4. Check firewall settings

#### **Gmail Authentication Error**
```
Error: Invalid authentication token
```

**Solution:**
1. Re-authenticate with Gmail OAuth
2. Check refresh token expiry
3. Verify GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET
4. Ensure Gmail API is enabled in Google Cloud Console

#### **Playwright Browser Not Starting**
```
Error: Executable doesn't exist at /path/to/chrome
```

**Solution:**
```bash
# Install Playwright browsers
npx playwright install

# Or in Docker
docker-compose build --no-cache
```

#### **Port Already in Use**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or use different port
BACKEND_PORT=5001 npm run dev
```

#### **LinkedIn Login Fails**
```
Error: LinkedIn login error
```

**Solution:**
1. Check LinkedIn credentials in `.env.local`
2. Verify no 2FA enabled on LinkedIn
3. Check if IP is blocked (try with proxy)
4. Clear LinkedIn sessions: `rm -rf ./sessions/linkedin`

---

## 🔒 Security Considerations

### Best Practices Implemented

✅ **JWT Authentication**: Secure token-based auth
✅ **Environment Variables**: Sensitive data not hardcoded
✅ **HTTPS Ready**: Production deployment uses SSL/TLS
✅ **Rate Limiting**: 100 requests per 15 minutes per IP
✅ **Input Validation**: All inputs validated with express-validator
✅ **Password Hashing**: bcryptjs for secure password storage
✅ **CORS Protection**: Cross-origin requests restricted
✅ **Helmet.js**: Security headers protection

### Production Checklist

- [ ] Generate strong JWT_SECRET (32+ characters)
- [ ] Generate strong ENCRYPTION_KEY (32+ characters)
- [ ] Use HTTPS only
- [ ] Enable CORS for specific domains only
- [ ] Use environment variables for all secrets
- [ ] Set NODE_ENV=production
- [ ] Enable database authentication
- [ ] Use MongoDB connection string with SSL
- [ ] Setup rate limiting appropriately
- [ ] Enable logging and monitoring
- [ ] Regular security audits
- [ ] Keep dependencies updated

### Generate Secure Keys

```bash
# Generate JWT_SECRET
openssl rand -base64 32

# Generate ENCRYPTION_KEY
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📈 Monitoring & Logging

### Log Files

Located in `./logs/`:

- **app.log**: Application events
- **error.log**: Error stack traces
- **combined.log**: All logs
- **automation.log**: Automation specific logs

### View Logs

```bash
# Real-time logs
tail -f logs/app.log

# Last 100 lines
tail -100 logs/app.log

# Search for errors
grep "ERROR" logs/error.log
```

### Log Level Configuration

Set in `.env.local`:
```
LOG_LEVEL=debug  # debug, info, warn, error
```

---

## 🚀 Production Deployment

### AWS Deployment

```bash
# Build Docker image
docker build -f docker/Dockerfile.backend -t job-automation-backend .

# Push to ECR
aws ecr push job-automation-backend:latest

# Deploy to ECS/Fargate
aws ecs create-service --cluster my-cluster ...
```

### Heroku Deployment

```bash
# Login to Heroku
heroku login

# Create app
heroku create job-automation-app

# Add buildpacks
heroku buildpacks:add heroku/nodejs

# Deploy
git push heroku main
```

### DigitalOcean Deployment

```bash
# SSH into droplet
ssh root@your_droplet_ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Clone and deploy
git clone your_repo
cd your_repo
docker-compose -f docker-compose.yml up -d
```

---

## 🔄 Automation Workflow

### Default Schedule

By default, automation runs:
- **Interval**: Every 60 minutes (configurable)
- **Max Jobs**: 20 per run (configurable)
- **Time Filter**: Last 24 hours (configurable)

### Manual Trigger

```bash
# Start automation via API
curl -X POST http://localhost:5000/api/automation/start-search \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "keywords": ["Java Developer"],
    "maxJobs": 30
  }'
```

### Customize Automation

Edit `.env.local`:
```
SCHEDULER_ENABLED=true
SCHEDULER_INTERVAL_MINUTES=60
SCHEDULER_MAX_JOBS_PER_RUN=20
LINKEDIN_SEARCH_KEYWORDS=Java Developer,Backend Engineer
LINKEDIN_JOB_TYPE=Contract,Fulltime
```

---

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [Next.js Documentation](https://nextjs.org/docs)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Gmail API Guide](https://developers.google.com/gmail/api)

---

## 🎯 Future Improvements

### Planned Features

- [ ] **Telegram Bot Integration**: Notifications via Telegram
- [ ] **Slack Integration**: Slack channel notifications
- [ ] **Browser Extension**: One-click apply from LinkedIn
- [ ] **AI Resume Tailoring**: Auto-tailor resume to job description
- [ ] **Video Interview**: Prepare AI coach for interviews
- [ ] **Multi-language Support**: Support 10+ languages
- [ ] **Advanced Analytics**: ML-powered insights
- [ ] **Team Collaboration**: Multi-user workspace
- [ ] **Mobile App**: React Native mobile app
- [ ] **API Webhooks**: Custom integrations
- [ ] **Plugin System**: Extensibility framework

### Roadmap

```
Q1 2024: MVP with core features ✅
Q2 2024: Browser extension + Telegram bot
Q3 2024: Mobile app + Team collaboration
Q4 2024: Advanced AI features + Analytics
Q1 2025: Enterprise features + API marketplace
```

---

## 🤝 Contributing

Contributions are welcome! Please follow our guidelines:

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📝 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**JP IT Staffing**
- Website: [JP IT Staffing](https://example.com)
- Email: contact@jpitstaff.com

---

## ⭐ Show Your Support

If this project helped you, please give it a star! ⭐

---

## 📞 Support & Feedback

For issues, suggestions, or feedback:
- **Issues**: [GitHub Issues](https://github.com/yourusername/ai-linkedin-job-automation/issues)
- **Email**: support@jpitstaff.com
- **Discord**: [Join Community](https://discord.gg/example)

---

**Made with ❤️ by JP IT Staffing**
