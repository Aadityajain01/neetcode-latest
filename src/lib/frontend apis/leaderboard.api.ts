import { api } from '@/lib/api';

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  score: number;
  rank: number;
}

export const leaderboardApi = {
  getGlobal: async (params?: { limit?: number; offset?: number }) => {
    const response = await api.get<{ leaderboard: LeaderboardEntry[] }>(
      '/leaderboard/global',
      { params }
    );
    return response.data.leaderboard;
  },

  getGlobalMe: async () => {
    const response = await api.get<{
      me: { userId: string; score: number; solvedCount: number; rank: number };
    }>('/leaderboard/global/me');
    return response.data.me;
  },

  getCommunity: async (
    communityId: string,
    params?: { limit?: number; offset?: number }
  ) => {
    const response = await api.get<{ leaderboard: LeaderboardEntry[] }>(
      `/leaderboard/community/${communityId}`,
      { params }
    );
    return response.data.leaderboard;
  },

  getCommunityMe: async (communityId: string) => {
    const response = await api.get<{
      me: { userId: string; score: number; solvedCount: number; rank: number };
    }>(`/leaderboard/community/${communityId}/me`);
    return response.data.me;
  },
};
