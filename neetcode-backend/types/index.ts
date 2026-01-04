import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  email?: string;
  role?: 'admin' | 'user';
}

export interface User {
  _id: string;
  firebaseUid: string;
  email: string;
  displayName?: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

export interface Problem {
  _id: string;
  title: string;
  description: string;
  type: 'dsa' | 'practice';
  difficulty?: 'easy' | 'medium' | 'hard';
  tags: string[];
  timeLimit: number;
  memoryLimit: number;
  languages: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TestCase {
  _id: string;
  problemId: string;
  version: number;
  input: string;
  expectedOutput: string;
  isSample: boolean;
  createdAt: Date;
}

export interface MCQ {
  _id: string;
  question: string;
  language: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  tags: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  createdAt: Date;
  updatedAt: Date;
}

export interface Submission {
  _id: string;
  userId: string;
  problemId?: string;
  mcqId?: string;
  code?: string;
  language?: string;
  answer?: number;
  status: 'pending' | 'running' | 'accepted' | 'wrong_answer' | 'time_limit_exceeded' | 'memory_limit_exceeded' | 'compile_error' | 'runtime_error';
  testCasesPassed?: number;
  totalTestCases?: number;
  executionTime?: number;
  memoryUsed?: number;
  score?: number;
  createdAt: Date;
  completedAt?: Date;
}

export interface Community {
  _id: string;
  name: string;
  description: string;
  ownerId: string;
  type: 'open' | 'domain_restricted';
  domain?: string;
  memberCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommunityMember {
  _id: string;
  communityId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
}

export interface LeaderboardEntry {
  userId: string;
  totalScore: number;
  solvedCount: number;
  lastSolvedAt: Date;
}

export interface UserStats {
  totalSubmissions: number;
  dsaSubmissions: number;
  practiceSubmissions: number;
  mcqAttempts: number;
  problemsSolved: number;
  score: number;
  rank: number;
}
