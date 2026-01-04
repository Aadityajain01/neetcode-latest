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
}

// --- API Client ---
export const mcqApi = {
  // Fetch list of MCQs with pagination
  getMCQs: async (params?: {
    language?: string;
    difficulty?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) => {
    // Expecting backend to return: { mcqs: [], pagination: {} }
    const response = await api.get<{
      mcqs: MCQ[];
      pagination: { total: number; offset: number; limit: number };
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

  // Get user history
  getMyAttempts: async (params?: { limit?: number; offset?: number }) => {
    const response = await api.get<{
      submissions: any[];
      pagination: { total: number; offset: number; limit: number };
    }>('/mcqs/me/attempts', { params });
    return response.data;
  },
};