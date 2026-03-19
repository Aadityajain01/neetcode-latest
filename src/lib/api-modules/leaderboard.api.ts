import { api } from '@/lib/api';

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  score: number;
  rank: number;
  mcqScore?: number;
  programmingScore?: number;
  evaluatedAt?: string;
  averageScore?: number;
  totalScore?: number;
  testCount?: number;
}

export interface CommunityAverageLeaderboardMe {
  userId: string;
  score: number;
  averageScore: number;
  totalScore: number;
  testCount: number;
  rank: number;
}

export interface CommunityAverageLeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  availableYears: number[];
  summary: {
    participants: number;
    testsConsidered: number;
  };
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

  getCommunityAverageLeaderboard: async (
    communityId: string,
    params?: { years?: number[]; limit?: number; offset?: number }
  ) => {
    const queryParams: Record<string, string | number> = {};
    if (params?.years?.length) {
      queryParams.years = params.years.join(',');
    }
    if (typeof params?.limit === 'number') {
      queryParams.limit = params.limit;
    }
    if (typeof params?.offset === 'number') {
      queryParams.offset = params.offset;
    }

    const response = await api.get<CommunityAverageLeaderboardResponse>(
      `/leaderboard/community/${communityId}/average`,
      { params: queryParams }
    );
    return response.data;
  },

  getCommunityAverageMe: async (
    communityId: string,
    params?: { years?: number[] }
  ) => {
    const queryParams: Record<string, string> = {};
    if (params?.years?.length) {
      queryParams.years = params.years.join(',');
    }

    const response = await api.get<{ me: CommunityAverageLeaderboardMe }>(
      `/leaderboard/community/${communityId}/average/me`,
      { params: queryParams }
    );
    return response.data.me;
  },
};