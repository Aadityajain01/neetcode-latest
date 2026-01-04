import { api } from '@/lib/api';

// --- Shared Types ---
export interface Community {
  _id: string;
  name: string;
  description: string;
  ownerId: string;
  type: 'open' | 'domain_restricted';
  domain?: string;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityMember {
  _id: string;
  communityId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
}

// --- Community API ---
export const communityApi = {
  getCommunities: async (params?: { search?: string }) => {
    // 🛡️ CRITICAL FIX: Default to [] if data is undefined to prevent crashes
    const response = await api.get<{ communities: Community[] }>('/communities', { params });
    return response.data?.communities || [];
  },

  getCommunityById: async (communityId: string) => {
    const response = await api.get<{
      community: Community;
      isMember: boolean;
      userRole?: string;
    }>(`/communities/${communityId}`);
    return response.data;
  },

  createCommunity: async (data: {
    name: string;
    description: string;
    type: 'open' | 'domain_restricted';
    domain?: string;
  }) => {
    const response = await api.post<{ community: Community }>('/communities', data);
    return response.data.community;
  },

  joinCommunity: async (communityId: string) => {
    const response = await api.post(`/communities/${communityId}/join`);
    return response.data;
  },

  leaveCommunity: async (communityId: string) => {
    const response = await api.delete(`/communities/${communityId}/leave`);
    return response.data;
  },

  getMembers: async (communityId: string, params?: { limit?: number; offset?: number }) => {
    const response = await api.get<{ members: CommunityMember[] }>(
      `/communities/${communityId}/members`,
      { params }
    );
    return response.data?.members || [];
  },

  removeMember: async (communityId: string, userId: string) => {
    const response = await api.delete(`/communities/${communityId}/members/${userId}`);
    return response.data;
  },

  getMyRole: async (communityId: string) => {
    const response = await api.get<{ role: string | null }>(`/communities/${communityId}/my-role`);
    return response.data.role;
  },
};