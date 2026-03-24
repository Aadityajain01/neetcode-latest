import { api } from '@/lib/api';

export interface User {
  id: string;
  email: string;
  displayName?: string;
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  totalSubmissions: number;
  dsaSubmissions: number;
  practiceSubmissions: number;
  mcqAttempts: number;
  problemsSolved: number;
  dsaSolvedBreakdown?: {
    easy: number;
    medium: number;
    hard: number;
    total: number;
  };
  mcqSolvedBreakdown?: {
    easy: number;
    medium: number;
    hard: number;
    total: number;
  };
  score: number;
  rank: number;
}

export interface DashboardPayload {
  stats: UserStats;
  totalProblems: number;
  dsaCounts: { easy: number; medium: number; hard: number; total: number };
  mcqCounts: { easy: number; medium: number; hard: number; total: number };
}

export const userApi = {
  getMe: async () => {
    const response = await api.get<{ user: User }>('/users/me');
    return response.data.user;
  },

  getUserById: async (userId: string) => {
    const response = await api.get<{ user: User }>(`/users/${userId}`);
    return response.data.user;
  },

  updateMe: async (data: { displayName?: string }) => {
    const response = await api.patch<{ user: User }>('/users/me', data);
    return response.data.user;
  },

  getStats: async (userId?: string) => {
    const url = userId ? `/users/${userId}/stats` : '/users/me/stats';
    const response = await api.get<{ stats: UserStats }>(url);
    return response.data.stats;
  },

  getDashboard: async () => {
    const response = await api.get<DashboardPayload>('/users/me/dashboard');
    return response.data;
  },

// api-modules/user.api.ts
// ... inside userApi object ...
getCommunities: async (userId?: string) => {
  const url = userId ? `/users/${userId}/communities` : '/users/me/communities';
  // This matches the response structure we expect in the page above
  const response = await api.get<{ communities: any[] }>(url);
  return response.data.communities;
},
};
