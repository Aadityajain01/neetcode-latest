import { api } from '@/lib/api';

// --- Type Definitions ---
export interface MCQ {
  _id: string;
  question: string;
  language: string;
  options: string[];
  correctOption?: number; // Optional because we might hide it in the list view
  explanation?: string;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: string;
  updatedAt: string;
}

export interface SubmissionResult {
  id: string;
  status: string;
  isCorrect: boolean;
  score?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  correctAnswer?: number;
  explanation?: string;
  alreadySolved?: boolean;
}

// --- API Client ---
export const mcqApi = {
  getMeta: async () => {
    return api.get<{ languages: string[]; difficulties: string[] }>("/mcqs/meta");
  },

  // Fetch total MCQ counts by difficulty
  getCounts: async (params?: { language?: string }) => {
    const response = await api.get<{
      counts: { easy: number; medium: number; hard: number; total: number };
    }>('/mcqs/counts', { params });
    return response.data.counts;
  },

  // Fetch list of MCQs with pagination
  getMCQs: async (params?: {
    language?: string;
    difficulty?: string;
    search?: string;
    limit?: number;
    offset?: number;
    excludeSolved?: string;
    unsolvedFirst?: string;
  }) => {
    // Expecting backend to return: { mcqs: [], pagination: {}, meta?: {} }
    const response = await api.get<{
      mcqs: MCQ[];
      pagination: { total: number; offset: number; limit: number };
      meta?: { unsolvedCount: number };
    }>('/mcqs', { params });
    return response.data;
  },

  // Fetch single MCQ details
  getMCQById: async (mcqId: string) => {
    // Expecting backend to return: { mcq: {} }
    const response = await api.get<{ mcq: MCQ }>(`/mcqs/${mcqId}`);
    return response.data.mcq;
  },

  // Submit an answer
  submitAnswer: async (data: { mcqId: string; answer: number }) => {
    // Expecting backend to return: { submission: { isCorrect: true, ... } }
    const response = await api.post<{
      submission: SubmissionResult;
    }>('/mcqs/submit', data);
    return response.data.submission;
  },

  // Submit all answers as a batch
  submitBatch: async (data: { answers: { mcqId: string; answer: number }[] }) => {
    const response = await api.post<{
      results: Array<{
        mcqId: string;
        status: string;
        isCorrect: boolean;
        alreadySolved: boolean;
        score: number;
        difficulty: string;
        correctAnswer: number;
        explanation?: string;
        error?: string;
      }>;
      summary: {
        total: number;
        correct: number;
        newCorrect: number;
        wrong: number;
        score: number;
      };
    }>('/mcqs/submit-batch', data);
    return response.data;
  },

  // Get user history
  getMyAttempts: async (params?: { limit?: number; offset?: number }) => {
    const response = await api.get<{
      submissions: any[];
      pagination: { total: number; offset: number; limit: number };
    }>('/mcqs/me/attempts', { params });
    return response.data;
  },
};