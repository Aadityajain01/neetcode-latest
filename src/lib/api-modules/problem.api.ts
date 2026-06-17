import { api } from '@/lib/api';

// --- Type Definitions ---
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
  functionName?: string;
  returnType?: string;
  parameters?: Array<{ name: string; type: string }>;
  codeSnippets?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface TestCase {
  _id: string;
  problemId: string;
  input: string;
  expectedOutput: string;
  isSample: boolean;
}

export interface Submission {
  _id: string;
  status: string;
  testCasesPassed: number;
  totalTestCases: number;
  executionTime?: number;
}

// --- Problem API ---
export const problemApi = {
  // Fetch DSA problem counts by difficulty
  getCounts: async (params?: { type?: string }) => {
    const response = await api.get<{
      counts: { easy: number; medium: number; hard: number; total: number };
    }>('/problems/counts', { params });
    return response.data.counts;
  },

  getProblems: async (params?: {
    type?: string;
    difficulty?: string;
    search?: string;
    limit?: number;
    offset?: number;
    tags?: string | string[];
  }) => {
    // Matches backend response structure
    const response = await api.get<{
      problems: Problem[];
      pagination: { total: number; offset: number; limit: number };
    }>('/problems', { params });
    return response.data;
  },

  getProblemById: async (problemId: string) => {
    const response = await api.get<{
      problem: Problem;
      sampleTestCases: TestCase[];
    }>(`/problems/${problemId}`);
    return response.data;
  },
};

// --- Submission API ---
export const submissionApi = {
  submitCode: async (data: {
    problemId: string;
    code: string;
    language: string;
  }) => {
    const response = await api.post<Submission>('/submissions', data);
    return response.data;
  },

  getSubmissionById: async (submissionId: string) => {
    const response = await api.get<Submission>(`/submissions/${submissionId}`);
    return response.data;
  },
};