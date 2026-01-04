# NeetCode Backend - Quick Start Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd /home/z/my-project/mini-services/neetcode-backend
bun install
```

### 2. Configure Environment
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your actual configuration
nano .env
```

### Minimum Required Configuration:
```env
PORT=3001
NODE_ENV=development

# MongoDB (local)
MONGODB_URI=mongodb://localhost:27017/neetcode

# Redis (local)
REDIS_HOST=localhost
REDIS_PORT=6379

# Firebase (get from Firebase Console)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYourKeyHere\n-----END PRIVATE KEY-----

# Judge0 (free tier)
JUDGE0_API_URL=https://api.judge0.com
# JUDGE0_API_KEY= (optional for free tier)

# CORS
CORS_ORIGIN=http://localhost:3000
```

### 3. Start the Server
```bash
# Development mode with hot reload
bun run dev

# Or production mode
bun run start
```

### 4. Verify Server is Running
```bash
# Health check
curl http://localhost:3001/health

# Should return:
# {
#   "status": "healthy",
#   "timestamp": "2024-01-01T00:00:00.000Z",
#   "environment": "development"
# }

# API info
curl http://localhost:3001/

# Should return list of all available endpoints
```

## 📝 Testing the API

### Test 1: Register a User
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firebaseUid": "test-user-123",
    "email": "test@example.com",
    "displayName": "Test User"
  }'
```

### Test 2: Login (with Firebase Token)
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "idToken": "your-firebase-id-token"
  }'
```

### Test 3: Get Problems
```bash
# You'll need to create problems first via admin endpoints
curl http://localhost:3001/problems \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔍 Troubleshooting

### MongoDB Connection Failed
```bash
# Check if MongoDB is running
sudo systemctl status mongodb

# Start MongoDB
sudo systemctl start mongodb

# Or run MongoDB with Docker
docker run -d -p 27017:27017 --name mongodb mongo:6.0
```

### Redis Connection Failed
```bash
# Check if Redis is running
redis-cli ping

# Start Redis
sudo systemctl start redis

# Or run Redis with Docker
docker run -d -p 6379:6379 --name redis redis:7.0
```

### Firebase Initialization Failed
```bash
# Verify your Firebase credentials:
# 1. Go to Firebase Console
# 2. Go to Project Settings > Service Accounts
# 3. Generate new private key
# 4. Copy the JSON file contents to .env

# Make sure the private key is properly formatted with \n
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nActualKeyHere...\n-----END PRIVATE KEY-----"
```

### Judge0 Not Working
```bash
# Test Judge0 API directly
curl -X POST https://api.judge0.com/submissions \
  -H "Content-Type: application/json" \
  -d '{
    "source_code": "print(\"Hello\")",
    "language_id": 71
  }'

# If rate limited, wait a few minutes (free tier limits)
```

### Port Already in Use
```bash
# Find process using port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>

# Or change port in .env
PORT=3002
```

## 📚 Next Steps

### 1. Setup Firebase
- Create a Firebase project
- Enable Authentication (Email/Password)
- Create a service account
- Download private key
- Configure in .env

### 2. Setup MongoDB
- Install MongoDB locally
- Or use MongoDB Atlas (cloud)
- Configure connection string in .env

### 3. Setup Redis
- Install Redis locally
- Or use Redis Cloud
- Configure connection in .env

### 4. Get Judge0 API Key (Optional)
- Register at judge0.com
- Get API key
- Configure in .env (optional for free tier)

### 5. Create Admin User
```bash
# Register a user
POST /auth/register

# Manually update role to admin in MongoDB
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

### 6. Create First Problem
```bash
# Use admin endpoints with admin token
POST /admin/problems
  Body: {
    title: "Two Sum",
    description: "Find two numbers that add up to target",
    type: "dsa",
    difficulty: "easy",
    languages: ["python", "javascript"],
    timeLimit: 1,
    memoryLimit: 256
  }

# Add test cases
POST /admin/problems/:problemId/testcases
  Body: {
    version: 1,
    testCases: [
      {
        input: "2\n7 11 15\n",
        expectedOutput: "2\n",
        isSample: true
      }
    ]
  }
```

## 📖 Documentation

- **README.md**: Detailed setup and API documentation
- **ARCHITECTURE.md**: Complete system architecture
- **IMPLEMENTATION_COMPLETE.md**: Implementation summary

## 🎯 Key Points

1. **Server runs on port 3001** (configurable in .env)
2. **All endpoints require authentication** except `/health` and `/`
3. **Use Firebase tokens** for authentication (Bearer token)
4. **MongoDB & Redis required** for full functionality
5. **Judge0 API** for code execution (free tier available)

## 🔒 Security Notes

- Never commit .env file to version control
- Use strong passwords for MongoDB and Redis
- Use Firebase service accounts, not user accounts
- Enable HTTPS in production
- Configure CORS properly for your domain
- Review rate limits for your use case

## 🚢 Deployment

### Development
```bash
bun run dev
```

### Production
```bash
# 1. Build (optional)
bun run build

# 2. Set production env vars
NODE_ENV=production

# 3. Start server
bun run start

# 4. Use PM2 for process management
pm2 start bun --name neetcode-backend -- index.ts
pm2 save
pm2 startup
```

## 📞 Support

For issues or questions:
1. Check ARCHITECTURE.md for detailed docs
2. Check logs in console
3. Verify all environment variables are set
4. Ensure MongoDB and Redis are running
5. Test each component independently

---

**Happy Coding! 🎉**
