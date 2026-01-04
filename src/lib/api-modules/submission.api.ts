import { api } from '@/lib/api';

export interface Submission {
  _id: string;
  userId: string;
  problemId?: string;
  mcqId?: string;
  code?: string;
  language?: string;
  answer?: number;
  status:
    | 'pending'
    | 'running'
    | 'accepted'
    | 'wrong_answer'
    | 'time_limit_exceeded'
    | 'memory_limit_exceeded'
    | 'compile_error'
    | 'runtime_error';
  testCasesPassed?: number;
  totalTestCases?: number;
  executionTime?: number;
  memoryUsed?: number;
  score?: number;
  createdAt: string;
  completedAt?: string;
}

export const submissionApi = {
  submitCode: async (data: {
    problemId: string;
    code: string;
    language: string;
  }) => {
    const response = await api.post<{ submission: Submission }>('/submissions', data);
    return response.data.submission;
  },

  submitMCQ: async (data: { mcqId: string; answer: number }) => {
    const response = await api.post<{ submission: Submission }>('/submissions', data);
    return response.data.submission;
  },

  getSubmissionById: async (submissionId: string) => {
    const response = await api.get<{ submission: Submission }>(
      `/submissions/${submissionId}`
    );
    return response.data.submission;
  },

  getMySubmissions: async (params?: {
    type?: 'dsa' | 'practice' | 'mcq';
    limit?: number;
    offset?: number;
  }) => {
    const response = await api.get<{
      submissions: Submission[];
      pagination: { total: number; offset: number; limit: number };
    }>('/submissions/me', { params });
    return response.data;
  },

  getDSASubmissions: async (params?: {
    limit?: number;
    offset?: number;
  }) => {
    const response = await api.get<{
      submissions: Submission[];
      pagination: { total: number; offset: number; limit: number };
    }>('/submissions/me/dsa', { params });
    return response.data;
  },

  getPracticeSubmissions: async (params?: {
    limit?: number;
    offset?: number;
  }) => {
    const response = await api.get<{
      submissions: Submission[];
      pagination: { total: number; offset: number; limit: number };
    }>('/submissions/me/practice', { params });
    return response.data;
  },

  retrySubmission: async (submissionId: string) => {
    const response = await api.post(`/submissions/${submissionId}/retry`);
    return response.data;
  },
};
