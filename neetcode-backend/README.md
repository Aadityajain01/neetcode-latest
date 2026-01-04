# NeetCode Backend API

A production-ready, scalable backend for a competitive coding and learning platform built with Node.js, Express, MongoDB, and Redis.

## 🏗️ Architecture

### Technology Stack
- **Runtime**: Node.js with Bun
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB (primary storage)
- **Cache/Leaderboard**: Redis (score calculation & ranking)
- **Authentication**: Firebase Authentication
- **Code Execution**: Judge0 API
- **Validation**: Zod

### System Design
```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ HTTP/REST
┌──────▼──────┐
│   Express   │
│   Server    │
└──────┬──────┘
       │
       ├─────────────┬─────────────┬─────────────┐
       │             │             │             │
┌──────▼──────┐ ┌──▼─────┐ ┌────▼────┐ ┌─────▼─────┐
│  MongoDB    │ │  Redis │ │ Firebase │ │  Judge0   │
│  (Primary)  │ │ (Cache)│ │   Auth   │ │ (Execute) │
└─────────────┘ └────────┘ └─────────┘ └───────────┘
```

## 📁 Project Structure

```
mini-services/neetcode-backend/
├── config/           # Configuration files
│   └── index.ts      # Environment variables and config
├── logger/           # Logging utilities
│   └── index.ts      # Logger implementation
├── middleware/       # Express middleware
│   ├── auth.ts       # Firebase authentication
│   ├── errorHandler.ts    # Error handling
│   └── rateLimiter.ts    # Rate limiting
├── models/           # MongoDB models
│   ├── User.ts
│   ├── Problem.ts
│   ├── TestCase.ts
│   ├── MCQ.ts
│   ├── Submission.ts
│   ├── Community.ts
│   └── CommunityMember.ts
├── routes/           # API routes
│   ├── auth.ts       # 6 endpoints
│   ├── users.ts      # 5 endpoints
│   ├── communities.ts # 9 endpoints
│   ├── problems.ts    # 6 endpoints
│   ├── mcqs.ts       # 5 endpoints
│   ├── submissions.ts # 6 endpoints
│   ├── execute.ts    # 2 endpoints
│   ├── leaderboard.ts # 4 endpoints
│   └── admin.ts      # 9 endpoints
├── services/         # Business logic
│   ├── executionService.ts    # Judge0 wrapper
│   └── leaderboardService.ts  # Leaderboard management
├── types/            # TypeScript types
│   └── index.ts
├── utils/            # Utility functions
│   ├── database.ts    # MongoDB connection
│   ├── redis.ts      # Redis connection
│   └── validators.ts # Zod schemas
├── .env.example      # Environment variables template
├── package.json      # Dependencies
├── tsconfig.json     # TypeScript configuration
├── index.ts          # Server entry point
└── README.md         # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (or Bun)
- MongoDB 6.0+
- Redis 7.0+
- Firebase project with Authentication enabled
- Judge0 API access (free tier available at judge0.com)

### Installation

1. Install dependencies:
```bash
bun install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your actual configuration:
```env
PORT=3001
NODE_ENV=development

MONGODB_URI=mongodb://localhost:27017/neetcode
MONGODB_DATABASE=neetcode

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Here\n-----END PRIVATE KEY-----

JUDGE0_API_URL=https://api.judge0.com
JUDGE0_API_KEY=your-judge0-api-key
JUDGE0_POLLING_INTERVAL=1000
JUDGE0_MAX_POLLING_ATTEMPTS=60

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

CORS_ORIGIN=http://localhost:3000
```

3. Start the development server:
```bash
bun run dev
```

4. Verify the server is running:
```bash
curl http://localhost:3001/health
```

## 📊 Database Schema

### MongoDB Collections

#### Users
```javascript
{
  firebaseUid: String (unique, indexed)
  email: String (unique, indexed)
  displayName: String
  role: 'admin' | 'user'
  createdAt: Date
  updatedAt: Date
}
```

#### Problems
```javascript
{
  title: String
  description: String
  type: 'dsa' | 'practice'
  difficulty: 'easy' | 'medium' | 'hard' (for DSA)
  tags: [String]
  timeLimit: Number (seconds)
  memoryLimit: Number (MB)
  languages: [String]
  createdBy: ObjectId (ref: User)
  createdAt: Date
  updatedAt: Date
}
```

#### TestCases
```javascript
{
  problemId: ObjectId (ref: Problem)
  version: Number
  input: String
  expectedOutput: String
  isSample: Boolean
  createdAt: Date
}
```

#### MCQs
```javascript
{
  question: String
  language: String
  options: [String]
  correctAnswer: Number (index)
  explanation: String
  tags: [String]
  difficulty: 'easy' | 'medium' | 'hard'
  createdBy: ObjectId (ref: User)
  createdAt: Date
  updatedAt: Date
}
```

#### Submissions
```javascript
{
  userId: ObjectId (ref: User)
  problemId: ObjectId (ref: Problem)
  mcqId: ObjectId (ref: MCQ)
  code: String
  language: String
  answer: Number (for MCQ)
  status: 'pending' | 'running' | 'accepted' | 'wrong_answer' |
          'time_limit_exceeded' | 'memory_limit_exceeded' |
          'compile_error' | 'runtime_error'
  testCasesPassed: Number
  totalTestCases: Number
  executionTime: Number
  memoryUsed: Number
  score: Number
  completedAt: Date
  createdAt: Date
}
```

#### Communities
```javascript
{
  name: String
  description: String
  ownerId: ObjectId (ref: User)
  type: 'open' | 'domain_restricted'
  domain: String (for domain_restricted)
  memberCount: Number
  createdAt: Date
  updatedAt: Date
}
```

#### CommunityMembers
```javascript
{
  communityId: ObjectId (ref: Community)
  userId: ObjectId (ref: User)
  role: 'owner' | 'admin' | 'member'
  joinedAt: Date
}
```

### Redis Data Structures

```
leaderboard:global                    - Sorted Set (userId -> score)
  Key: "leaderboard:global"
  Type: ZSET
  Score: totalScore
  Member: userId

user:{userId}:score:problem:{problemId} - String (marker for solved problems)
user:{userId}:solved                 - String (count of solved problems)
user:{userId}:lastSolved            - String (timestamp)
```

## 🔐 Authentication

### Firebase Integration

The backend uses Firebase Authentication for user authentication:

1. **Frontend**: Obtains Firebase ID token
2. **Backend**: Verifies token using Firebase Admin SDK
3. **User**: Retrieved/created in MongoDB based on Firebase UID
4. **Middleware**: Sets `req.userId`, `req.email`, `req.role` for protected routes

### Role-Based Access Control

- `user`: Standard user access
- `admin`: Full access including admin endpoints

## 📋 API Endpoints

### 1. Auth Service (6 endpoints)
```
POST   /auth/register         - Register new user
POST   /auth/login            - Login with Firebase token
POST   /auth/logout           - Logout
GET    /auth/me               - Get current user
POST   /auth/refresh-token    - Refresh Firebase token
POST   /auth/verify-token     - Verify Firebase token
```

### 2. User Service (5 endpoints)
```
GET    /users/me              - Get current user profile
GET    /users/:userId         - Get user by ID
PATCH  /users/me              - Update current user
GET    /users/:userId/stats   - Get user statistics
GET    /users/:userId/communities  - Get user communities
```

### 3. Community Service (9 endpoints)
```
POST   /communities           - Create community
GET    /communities           - List communities
GET    /communities/:id       - Get community details
POST   /communities/:id/join  - Join community
DELETE /communities/:id/leave - Leave community
GET    /communities/:id/members  - Get community members
DELETE /communities/:id/members/:userId  - Remove member
GET    /communities/:id/my-role  - Get my role in community
PATCH  /communities/:id/settings  - Update community settings
```

### 4. Problem Service (6 endpoints)
```
GET    /problems              - List problems (with filters)
GET    /problems/:id          - Get problem details
GET    /problems/:id/languages  - Get supported languages
GET    /problems?type=dsa     - Filter by type
GET    /problems?difficulty=easy  - Filter by difficulty
GET    /problems/:id/sample-testcases  - Get sample test cases
```

### 5. MCQ Service (5 endpoints)
```
GET    /mcqs                  - List MCQs (with filters)
GET    /mcqs/:id              - Get MCQ details
POST   /mcqs/submit           - Submit MCQ answer
GET    /mcqs/me/attempts      - Get my MCQ attempts
GET    /mcqs/stats            - Get MCQ statistics
```

### 6. Submission Service (6 endpoints)
```
POST   /submissions           - Submit code/MCQ
GET    /submissions/:id        - Get submission details
GET    /submissions/me         - Get my submissions
GET    /submissions/me/dsa     - Get my DSA submissions
GET    /submissions/me/practice  - Get my practice submissions
POST   /submissions/:id/retry - Retry submission
```

### 7. Execution Service (2 endpoints) - Admin Only
```
POST   /execute               - Execute code (Judge0)
GET    /execute/:token/status  - Get execution status
```

### 8. Leaderboard Service (4 endpoints)
```
GET    /leaderboard/global     - Get global leaderboard
GET    /leaderboard/global/me  - Get my global rank
GET    /leaderboard/community/:id  - Get community leaderboard
GET    /leaderboard/community/:id/me  - Get my community rank
```

### 9. Admin Service (9 endpoints) - Admin Only
```
POST   /admin/problems         - Create problem
PATCH  /admin/problems/:id    - Update problem
DELETE /admin/problems/:id     - Delete problem
POST   /admin/problems/:id/testcases  - Create test cases
PATCH  /admin/problems/:id/testcases  - Update test cases
POST   /admin/mcqs            - Create MCQ
PATCH  /admin/mcqs/:id        - Update MCQ
DELETE /admin/mcqs/:id        - Delete MCQ
POST   /admin/rejudge/:id      - Rejudge submission
```

## 🏆 Scoring & Leaderboard System

### Score Calculation

Only DSA (Data Structures & Algorithms) problems contribute to scores:
- **Easy**: 20 points
- **Medium**: 30 points
- **Hard**: 50 points

### Rules
1. Score is awarded only once per problem per user
2. Re-submissions do not increase score
3. Redis handles real-time score aggregation
4. MongoDB persists final results via submissions

### Leaderboard Flow
```
User submits DSA solution → Judge0 executes
↓
All test cases pass → Status: accepted
↓
Redis updates score (ZSET)
↓
MongoDB persists submission
↓
Leaderboard reflects new score
```

### Community Leaderboard
- Derived from global leaderboard
- Filtered by community members
- No separate storage
- Real-time filtering

## 🧪 Code Execution (Judge0)

### Supported Languages
- JavaScript (63)
- Python (71)
- Java (62)
- C (11)
- C++ (54)
- C# (51)
- Go (60)
- Rust (73)
- Ruby (72)
- PHP (68)
- Swift (83)
- Kotlin (79)
- TypeScript (74)

### Execution Flow
1. Receive submission with code
2. Send to Judge0 API
3. Poll for completion
4. Normalize status codes
5. Store results in MongoDB
6. Update leaderboard (if DSA & accepted)

## 🔒 Security Features

### Rate Limiting
- General: 100 requests per 15 minutes
- Auth endpoints: 5 requests per 5 minutes
- Code execution: 10 requests per 1 minute

### Authentication
- Firebase ID token verification
- Role-based access control (RBAC)
- Protected admin endpoints

### Data Validation
- Zod schema validation for all inputs
- Type-safe with TypeScript

### CORS
- Configurable origin whitelist
- Credentials support enabled

## 🚢 Deployment

### Environment Variables

Production environment requires:
```env
PORT=3001
NODE_ENV=production
MONGODB_URI=mongodb://prod-mongodb:27017/neetcode
REDIS_HOST=prod-redis
# ... other production configs
```

### Recommended Stack
- **Server**: Node.js 18+ / Bun
- **Process Manager**: PM2 or systemd
- **Reverse Proxy**: Nginx or Traefik
- **MongoDB**: MongoDB Atlas or self-hosted replica set
- **Redis**: Redis Enterprise or self-hosted cluster

### Deployment Steps

1. Build TypeScript (optional):
```bash
bun run build
```

2. Set production environment variables

3. Start server:
```bash
bun run start
```

4. Use PM2 for production:
```bash
pm2 start bun --name neetcode-backend -- index.ts
pm2 save
pm2 startup
```

## 📝 Development

### Running Tests
```bash
bun run lint
```

### Code Style
- ESLint for linting
- Prettier for formatting
- TypeScript strict mode enabled

### Adding New Endpoints

1. Define route in appropriate file under `routes/`
2. Add validation schema in `utils/validators.ts`
3. Implement business logic in route handler or service
4. Update README with new endpoint

## 🔄 Redis Leaderboard Rebuild

To rebuild leaderboard from MongoDB (in case of data corruption):

```typescript
import { leaderboardService } from './services/leaderboardService.js';
await leaderboardService.rebuildLeaderboard();
```

Or add an admin endpoint:
```typescript
router.post('/admin/rebuild-leaderboard', async (req, res) => {
  await leaderboardService.rebuildLeaderboard();
  res.json({ message: 'Leaderboard rebuilt' });
});
```

## 📚 Additional Resources

- [Judge0 API Documentation](https://judge0.com/api)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Node.js Driver](https://mongodb.github.io/node-mongodb-native/)
- [Redis Node.js Client](https://github.com/redis/node-redis)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

## 📄 License

MIT License - feel free to use this for your projects!

## 🙏 Acknowledgments

- Judge0 for code execution API
- Firebase for authentication
- MongoDB for database
- Redis for caching
- Express.js for framework
