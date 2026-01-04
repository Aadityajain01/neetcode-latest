import { api } from '@/lib/api';

export const adminApi = {
  // Problems
  createProblem: async (data: {
    title: string;
    description: string;
    type: 'dsa' | 'practice';
    difficulty?: 'easy' | 'medium' | 'hard';
    tags?: string[];
    timeLimit?: number;
    memoryLimit?: number;
    languages?: string[];
  }) => {
    const response = await api.post<{ problem: any }>('/admin/problems', data);
    return response.data.problem;
  },

  updateProblem: async (problemId: string, data: any) => {
    const response = await api.patch<{ problem: any }>(
      `/admin/problems/${problemId}`,
      data
    );
    return response.data.problem;
  },

  deleteProblem: async (problemId: string) => {
    const response = await api.delete(`/admin/problems/${problemId}`);
    return response.data;
  },

  // Test Cases
  createTestCases: async (problemId: string, testCases: any[]) => {
    const response = await api.post<{ testCases: any[]; version: number }>(
      `/admin/problems/${problemId}/testcases`,
      { testCases }
    );
    return response.data;
  },

  updateTestCases: async (problemId: string, version: number, testCases: any[]) => {
    const response = await api.patch<{ testCases: any[]; version: number }>(
      `/admin/problems/${problemId}/testcases`,
      { version, testCases }
    );
    return response.data;
  },

  // MCQs
  createMCQ: async (data: {
    question: string;
    language: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
    tags?: string[];
    difficulty?: 'easy' | 'medium' | 'hard';
  }) => {
    const response = await api.post<{ mcq: any }>('/admin/mcqs', data);
    return response.data.mcq;
  },

  updateMCQ: async (mcqId: string, data: any) => {
    const response = await api.patch<{ mcq: any }>(`/admin/mcqs/${mcqId}`, data);
    return response.data.mcq;
  },

  deleteMCQ: async (mcqId: string) => {
    const response = await api.delete(`/admin/mcqs/${mcqId}`);
    return response.data;
  },

  // Rejudge
  rejudgeSubmission: async (submissionId: string) => {
    const response = await api.post(`/admin/rejudge/${submissionId}`);
    return response.data;
  },
};
