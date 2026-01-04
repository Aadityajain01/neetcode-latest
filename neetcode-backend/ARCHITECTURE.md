# NeetCode Backend API - System Architecture & Implementation Guide

## 📋 Overview

This document describes the complete backend architecture and implementation for the NeetCode competitive coding platform backend.

## 🏗️ Architecture Overview

### Technology Stack
- **Runtime**: Node.js with Bun
- **Framework**: Express.js 4.x
- **Language**: TypeScript 5.x
- **Database**: MongoDB 6.0+ (Primary Storage)
- **Cache**: Redis 7.0+ (Score Calculation & Leaderboard)
- **Authentication**: Firebase Authentication
- **Code Execution**: Judge0 API
- **Validation**: Zod schemas
- **Security**: Helmet, CORS, Rate Limiting

### System Design

```
┌─────────────────────────────────────────────────────────────┐
│                    NeetCode Platform                      │
└──────────────────────┬──────────────────────────────────┘
                       │ REST API
┌──────────────────────▼──────────────────────────────────┐
│              Express.js Server (Port 3001)              │
│  ┌──────────────────────────────────────────────────┐   │
│  │             Middleware Layer                      │   │
│  │  • Helmet (Security)                           │   │
│  │  • CORS (Cross-Origin)                         │   │
│  │  • Rate Limiting                               │   │
│  │  • Authentication (Firebase)                     │   │
│  │  • Error Handling                              │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │            Route Handlers (52 endpoints)         │   │
│  │  • Auth (6)                                  │   │
│  │  • Users (5)                                  │   │
│  │  • Communities (9)                             │   │
│  │  • Problems (6)                               │   │
│  │  • MCQs (5)                                   │   │
│  │  • Submissions (6)                             │   │
│  │  • Execute (2)                                 │   │
│  │  • Leaderboard (4)                             │   │
│  │  • Admin (9)                                  │   │
│  └──────────────────────────────────────────────────┘   │
└────┬─────────────┬─────────────┬─────────────┬────────┘
     │             │             │             │
┌────▼────┐  ┌───▼────┐  ┌────▼───┐  ┌───▼──────┐
│ MongoDB │  │  Redis  │  │ Firebase│  │  Judge0   │
│         │  │         │  │         │  │           │
│ Users   │  │ ZSET:   │  │ Auth    │  │ Code      │
│ Problems│  │ Global  │  │ Tokens  │  │ Execution │
│ TestCases│ │Score    │  │         │  │           │
│ MCQs    │  │ Cache:  │  │         │  │           │
│ Subs    │  │ Solved  │  │         │  │           │
│ Communities│         │  │         │  │           │
│ Members │          │  │         │  │           │
└─────────┘  └─────────┘  └─────────┘  └───────────┘
```

## 📊 Data Models

### MongoDB Collections

#### 1. Users
```typescript
interface User {
  _id: ObjectId;
  firebaseUid: string;           // Firebase user ID
  email: string;                 // User email (indexed)
  displayName?: string;          // Display name
  role: 'admin' | 'user';       // User role
  createdAt: Date;
  updatedAt: Date;
}

Indexes:
  - firebaseUid (unique)
  - email (unique)
```

#### 2. Problems
```typescript
interface Problem {
  _id: ObjectId;
  title: string;
  description: string;
  type: 'dsa' | 'practice';     // DSA gives score, practice doesn't
  difficulty?: 'easy' | 'medium' | 'hard';  // Required for DSA
  tags: string[];
  timeLimit: number;              // Time limit in seconds
  memoryLimit: number;            // Memory limit in MB
  languages: string[];            // Supported programming languages
  createdBy?: ObjectId;           // Reference to User
  createdAt: Date;
  updatedAt: Date;
}

Indexes:
  - type
  - difficulty
  - tags
  - { type, difficulty }
```

#### 3. TestCases
```typescript
interface TestCase {
  _id: ObjectId;
  problemId: ObjectId;            // Reference to Problem
  version: number;                // Version for updates
  input: string;                 // Test input
  expectedOutput: string;         // Expected output
  isSample: boolean;             // Show to users?
  createdAt: Date;
}

Indexes:
  - { problemId, version }
  - { problemId, isSample }
```

#### 4. MCQs
```typescript
interface MCQ {
  _id: ObjectId;
  question: string;
  language: string;              // Programming language
  options: string[];             // Multiple choice options
  correctAnswer: number;          // Index of correct option
  explanation?: string;          // Explanation of answer
  tags: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  createdBy?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

Indexes:
  - language
  - difficulty
  - tags
```

#### 5. Submissions
```typescript
interface Submission {
  _id: ObjectId;
  userId: ObjectId;              // Reference to User
  problemId?: ObjectId;          // Reference to Problem (code submissions)
  mcqId?: ObjectId;            // Reference to MCQ (MCQ submissions)
  code?: string;                // Code submitted
  language?: string;            // Programming language
  answer?: number;              // MCQ answer
  status: 'pending' | 'running' | 'accepted' |
          'wrong_answer' | 'time_limit_exceeded' |
          'memory_limit_exceeded' | 'compile_error' |
          'runtime_error';
  testCasesPassed?: number;
  totalTestCases?: number;
  executionTime?: number;        // Execution time in seconds
  memoryUsed?: number;           // Memory used in MB
  score?: number;                // Score earned (DSA only)
  completedAt?: Date;
  createdAt: Date;
}

Indexes:
  - { userId, createdAt: -1 }
  - problemId
  - mcqId
  - status
  - { userId, status }
```

#### 6. Communities
```typescript
interface Community {
  _id: ObjectId;
  name: string;
  description: string;
  ownerId: ObjectId;             // Owner user ID
  type: 'open' | 'domain_restricted';  // Join type
  domain?: string;               // Required for domain_restricted
  memberCount: number;          // Total members
  createdAt: Date;
  updatedAt: Date;
}

Indexes:
  - ownerId
  - type
  - name
```

#### 7. CommunityMembers
```typescript
interface CommunityMember {
  _id: ObjectId;
  communityId: ObjectId;         // Reference to Community
  userId: ObjectId;             // Reference to User
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
}

Indexes:
  - { communityId, userId } (unique)
  - userId
  - communityId
```

### Redis Data Structures

```
1. Global Leaderboard (Sorted Set)
   Key: leaderboards:global
   Type: ZSET
   Score: Total score
   Member: userId

2. User Problem Tracking (String markers)
   Key: user:{userId}:problem:{problemId}
   Value: "1" (if problem solved)

3. User Solved Count (String)
   Key: user:{userId}:solved
   Value: number of problems solved

4. User Last Solved (String)
   Key: user:{userId}:lastSolved
   Value: timestamp in milliseconds
```

## 🔐 Authentication & Authorization

### Firebase Authentication Flow

```
1. Frontend: User signs in with Firebase
   ↓
2. Frontend: Receives Firebase ID token
   ↓
3. Frontend: Sends ID token in Authorization header
   ↓
4. Backend: Verifies token with Firebase Admin SDK
   ↓
5. Backend: Retrieves user from MongoDB by firebaseUid
   ↓
6. Backend: Sets req.userId, req.email, req.role
   ↓
7. Route Handler: Access to authenticated user data
```

### Role-Based Access Control (RBAC)

```typescript
// Standard user endpoints
router.get('/users/me', authMiddleware, handler);

// Admin-only endpoints
router.post('/admin/problems', authMiddleware, adminMiddleware, handler);

// Optional authentication
router.get('/problems', optionalAuthMiddleware, handler);
```

## 🏆 Scoring System

### Score Calculation Rules

1. **Only DSA problems contribute to scores**
   - Easy: 20 points
   - Medium: 30 points
   - Hard: 50 points

2. **One-time scoring per problem**
   - First successful submission earns points
   - Re-submissions do not increase score
   - Score is persisted in MongoDB (Submission collection)

3. **Redis for real-time aggregation**
   - Scores stored in Redis ZSET
   - Fast rank calculation
   - Efficient leaderboard queries

### Scoring Flow

```
User submits DSA solution
  ↓
Judge0 executes code
  ↓
All test cases pass?
  ↓ YES
Status: accepted
  ↓
Problem already solved by user?
  ↓ NO
Redis: ZADD leaderboard:global {score} {userId}
Redis: SET user:{userId}:problem:{problemId} "1"
Redis: SET user:{userId}:solved "1"
Redis: INCRBY user:{userId}:solved 1
  ↓
MongoDB: Update submission with score
  ↓
Leaderboard reflects new score
```

### Score Values by Difficulty

```typescript
const SCORE_VALUES = {
  easy: 20,
  medium: 30,
  hard: 50,
};
```

## 🏘️ Community System

### Community Types

1. **Open Communities**
   - Anyone can join
   - No email restrictions

2. **Domain-Restricted Communities**
   - Only users with matching email domain can join
   - Example: @tmu.ac.in
   - Domain checked at join time only

### Community Leaderboard

**Critical Design Decision**: Community leaderboards are **NOT** stored separately.

- Derived from global leaderboard
- Filtered by community members
- No duplicate data
- Real-time filtering

```typescript
// Community leaderboard query:
1. Get all community member IDs
2. Query global leaderboard
3. Filter results to only include members
4. Return filtered leaderboard
```

## 🧪 Code Execution (Judge0)

### Supported Languages

```typescript
const LANGUAGE_MAP = {
  javascript: 63,
  python: 71,
  python3: 71,
  java: 62,
  c: 11,
  cpp: 54,
  'c++': 54,
  csharp: 51,
  go: 60,
  rust: 73,
  ruby: 72,
  php: 68,
  swift: 83,
  kotlin: 79,
  typescript: 74,
};
```

### Execution Flow

```
1. Receive submission (code + language + problemId)
2. Retrieve problem details (timeLimit, memoryLimit)
3. Fetch all test cases for problem
4. For each test case:
   - Send to Judge0 API
   - Poll for completion
   - Check result
   - Update status
5. If all pass: status = 'accepted'
6. If any fail: status = 'wrong_answer'
7. Store results in MongoDB
8. If DSA & accepted: Update leaderboard
```

### Judge0 Status Mapping

```typescript
const STATUS_MAP = {
  1: 'pending',              // Queued
  2: 'running',              // Processing
  3: 'accepted',             // Success
  4: 'wrong_answer',         // Wrong output
  5: 'time_limit_exceeded',   // Too slow
  6: 'compile_error',        // Compilation failed
  7: 'runtime_error',        // Runtime error
  8: 'memory_limit_exceeded', // Too much memory
  9: 'runtime_error',        // Internal error
  10: 'runtime_error',       // Output limit exceeded
  11: 'compile_error',      // Compilation error
  12: 'runtime_error',      // Runtime error
};
```

## 📈 Leaderboard System

### Global Leaderboard

```typescript
// Redis ZSET structure:
ZADD leaderboard:global {totalScore} {userId}

// Query top N:
ZREVRANGE leaderboard:global 0 N-1 WITHSCORES

// Get user rank:
ZRANK leaderboard:global {userId}

// Get user score:
ZSCORE leaderboard:global {userId}
```

### Community Leaderboard

```typescript
// Derived from global:
1. Get community members from MongoDB
2. Query global leaderboard
3. Filter by member IDs
4. Return filtered results

// No separate storage!
```

### Leaderboard Rebuild

If Redis data is corrupted or lost, rebuild from MongoDB:

```typescript
async function rebuildLeaderboard() {
  // 1. Clear Redis
  await redisClient.del('leaderboard:global');

  // 2. Aggregate from MongoDB
  const solvedProblems = await Submission.aggregate([
    { $match: { problemId: { $exists: true }, status: 'accepted' } },
    { $lookup: { from: 'problems', localField: 'problemId', foreignField: '_id', as: 'problem' } },
    { $unwind: '$problem' },
    { $match: { 'problem.type': 'dsa' } },
    {
      $group: {
        _id: {
          userId: '$userId',
          problemId: '$problemId',
        },
        firstSubmission: { $min: '$createdAt' },
        difficulty: { $first: '$problem.difficulty' },
      },
    },
    {
      $group: {
        _id: '$_id.userId',
        solvedCount: { $sum: 1 },
        totalScore: {
          $sum: {
            $switch: {
              branches: [
                { case: { $eq: ['$difficulty', 'easy'] }, then: 20 },
                { case: { $eq: ['$difficulty', 'medium'] }, then: 30 },
                { case: { $eq: ['$difficulty', 'hard'] }, then: 50 },
              ],
              default: 0,
            },
          },
        },
        lastSolvedAt: { $max: '$firstSubmission' },
      },
    },
  ]);

  // 3. Repopulate Redis
  for (const entry of solvedProblems) {
    await redisClient.zAdd('leaderboard:global', entry.totalScore, entry._id);
    await redisClient.set(`user:${entry._id}:solved`, entry.solvedCount);
    await redisClient.set(`user:${entry._id}:lastSolved`, entry.lastSolvedAt.getTime());
  }
}
```

## 🔒 Security Features

### Rate Limiting

```typescript
// General: 100 requests per 15 minutes
const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

// Strict: 10 requests per 1 minute (code execution)
const strictRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
});

// Auth: 5 requests per 5 minutes
const authRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
});
```

### Input Validation

All inputs validated using Zod schemas:

```typescript
import { z } from 'zod';

export const createProblemSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  type: z.enum(['dsa', 'practice']),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  tags: z.array(z.string()).default([]),
  timeLimit: z.number().positive().default(1),
  memoryLimit: z.number().positive().default(256),
  languages: z.array(z.string()).min(1),
});

// Apply to route:
router.post('/problems', validateRequest(createProblemSchema), handler);
```

### Error Handling

```typescript
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

// In development: include stack trace
// In production: only error message
```

## 🚀 Deployment

### Environment Configuration

Required environment variables:

```env
# Server
PORT=3001
NODE_ENV=production

# MongoDB
MONGODB_URI=mongodb://prod-mongodb:27017/neetcode
MONGODB_DATABASE=neetcode

# Redis
REDIS_HOST=prod-redis
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_DB=0

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----

# Judge0
JUDGE0_API_URL=https://api.judge0.com
JUDGE0_API_KEY=your-api-key
JUDGE0_POLLING_INTERVAL=1000
JUDGE0_MAX_POLLING_ATTEMPTS=60

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN=https://your-domain.com
```

### Deployment Steps

1. **Build (optional)**
   ```bash
   bun install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with production values
   ```

3. **Start Server**
   ```bash
   bun run start
   ```

4. **Process Management (PM2)**
   ```bash
   pm2 start bun --name neetcode-backend -- index.ts
   pm2 save
   pm2 startup
   ```

### Scaling Considerations

1. **Horizontal Scaling**
   - Stateless server design
   - Share Redis instance across instances
   - MongoDB replica set

2. **Caching Strategy**
   - Leaderboard: Redis ZSET (O(log N) operations)
   - Problem data: Cache frequently accessed
   - MCQ data: Cache frequently accessed

3. **Database Optimization**
   - Indexes on frequently queried fields
   - Aggregation pipelines for complex queries
   - Connection pooling

## 📝 API Endpoint Summary

### 1. Auth Service (6 endpoints)
- POST /auth/register
- POST /auth/login
- POST /auth/logout
- GET /auth/me
- POST /auth/refresh-token
- POST /auth/verify-token

### 2. User Service (5 endpoints)
- GET /users/me
- GET /users/:userId
- PATCH /users/me
- GET /users/:userId/stats
- GET /users/:userId/communities

### 3. Community Service (9 endpoints)
- POST /communities
- GET /communities
- GET /communities/:communityId
- POST /communities/:communityId/join
- DELETE /communities/:communityId/leave
- GET /communities/:communityId/members
- DELETE /communities/:communityId/members/:userId
- GET /communities/:communityId/my-role
- PATCH /communities/:communityId/settings

### 4. Problem Service (6 endpoints)
- GET /problems
- GET /problems/:problemId
- GET /problems/:problemId/languages
- GET /problems?type=dsa
- GET /problems?difficulty=easy
- GET /problems/:problemId/sample-testcases

### 5. MCQ Service (5 endpoints)
- GET /mcqs
- GET /mcqs/:mcqId
- POST /mcqs/submit
- GET /mcqs/me/attempts
- GET /mcqs/stats

### 6. Submission Service (6 endpoints)
- POST /submissions
- GET /submissions/:submissionId
- GET /submissions/me
- GET /submissions/me/dsa
- GET /submissions/me/practice
- POST /submissions/:submissionId/retry

### 7. Execution Service (2 endpoints) - Admin Only
- POST /execute
- GET /execute/:token/status

### 8. Leaderboard Service (4 endpoints)
- GET /leaderboard/global
- GET /leaderboard/global/me
- GET /leaderboard/community/:communityId
- GET /leaderboard/community/:communityId/me

### 9. Admin Service (9 endpoints) - Admin Only
- POST /admin/problems
- PATCH /admin/problems/:problemId
- DELETE /admin/problems/:problemId
- POST /admin/problems/:problemId/testcases
- PATCH /admin/problems/:problemId/testcases
- POST /admin/mcqs
- PATCH /admin/mcqs/:mcqId
- DELETE /admin/mcqs/:mcqId
- POST /admin/rejudge/:submissionId

**Total: 52 endpoints**

## 🔄 Data Flow Examples

### Example 1: User Solves DSA Problem

```
1. User: GET /problems?type=dsa&difficulty=easy
   → Returns list of easy DSA problems

2. User: GET /problems/:problemId
   → Returns problem details + sample test cases

3. User: POST /submissions
   Body: { problemId, code, language }
   → Creates submission with status: 'pending'
   → Queues async processing

4. Backend (Async): Processes submission
   a. Fetches problem details
   b. Fetches all test cases
   c. Sends to Judge0
   d. Polls for completion
   e. Updates status in MongoDB
   f. If accepted: Updates leaderboard in Redis

5. User: GET /submissions/me/dsa
   → Returns submission with final status
```

### Example 2: User Joins Domain-Restricted Community

```
1. User: POST /communities
   Body: { name, description, type: 'domain_restricted', domain: 'tmu.ac.in' }
   → Creates community with owner = user

2. Another User (@student.tmu.ac.in): POST /communities/:id/join
   → Checks email domain matches 'tmu.ac.in'
   → Creates community member record
   → Increments memberCount

3. User (@gmail.com): POST /communities/:id/join
   → Email domain doesn't match
   → Returns 403 Forbidden

4. Member: GET /leaderboard/community/:id
   → Returns leaderboard filtered to community members
   (Derived from global leaderboard)
```

### Example 3: Admin Creates Problem with Test Cases

```
1. Admin: POST /admin/problems
   Body: { title, description, type: 'dsa', difficulty: 'medium', languages: ['python', 'javascript'] }
   → Creates problem in MongoDB

2. Admin: POST /admin/problems/:id/testcases
   Body: {
     version: 1,
     testCases: [
       { input: "1 2\n", expectedOutput: "3\n", isSample: true },
       { input: "5 7\n", expectedOutput: "12\n", isSample: false },
       { input: "10 20\n", expectedOutput: "30\n", isSample: false },
     ]
   }
   → Creates test cases in MongoDB

3. User: GET /problems/:id
   → Returns problem + sample test cases (isSample: true only)
```

## 🧪 Testing

### Manual Testing

```bash
# Health check
curl http://localhost:3001/health

# Register user
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firebaseUid":"test123","email":"test@example.com","displayName":"Test User"}'

# Login with Firebase token
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"idToken":"firebase-id-token"}'

# Get problems (requires auth)
curl http://localhost:3001/problems \
  -H "Authorization: Bearer firebase-id-token"
```

## 📚 Additional Resources

- [Judge0 API Docs](https://judge0.com/api)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [MongoDB Node.js Driver](https://mongodb.github.io/node-mongodb-native/)
- [Redis Node.js Client](https://github.com/redis/node-redis)
- [Express.js Guide](https://expressjs.com/)

## 🎯 Key Design Decisions

1. **Community Leaderboards**: Not stored separately, derived from global leaderboard
   - Reduces data duplication
   - Single source of truth
   - Simplifies data consistency

2. **Score Persistence**: Stored in MongoDB (Submissions), aggregated in Redis
   - MongoDB is source of truth
   - Redis can be rebuilt from MongoDB
   - Prevents data loss

3. **Firebase for Auth**: Tokens verified, users stored in MongoDB
   - Leverages Firebase's auth system
   - Maintains control over user data
   - Easy to integrate with Firebase auth

4. **Judge0 for Execution**: External service for code execution
   - Security: Code runs in isolated environment
   - Scalability: External service handles load
   - Maintenance: No need to manage sandboxes

5. **Modular Architecture**: Each service in separate file
   - Easy to maintain
   - Easy to test
   - Easy to scale

## 📈 Future Enhancements (Out of Scope)

- Weekly contests
- Real-time chat (WebSocket)
- Community-specific problems
- Discussion forums
- Code collaboration features
- Gamification features (badges, achievements)
- Analytics dashboard for admins

---

**Document Version**: 1.0.0
**Last Updated**: 2024
**Backend Version**: 1.0.0
**Total Endpoints**: 52
