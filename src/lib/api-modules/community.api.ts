import { api } from '@/lib/api';

// --- Shared Types ---
export interface Community {
  _id: string;
  name: string;
  description: string;
  ownerId: string | { _id: string; displayName: string; email: string }; // Expanded to handle populated owner
  type: 'open' | 'domain_restricted';
  domain?: string;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityMember {
  _id: string;
  communityId: string;
  userId: string | { _id: string; displayName: string; email: string; avatarUrl?: string }; // Expanded to handle populated user
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
}

// --- Community API ---
export const communityApi = {
  getCommunities: async (params?: { search?: string }) => {



    // Matches backend: res.json({ communities: [...] })
   const response = await api.get<Community[]>('/communities');
return response.data || [];


  },

  getCommunityById: async (communityId: string) => {
    // Matches backend: res.json({ community, isMember, userRole })
    const response = await api.get<{
      community: Community;
      isMember: boolean;
      userRole: string | null; // Fixed: Backend returns null, not undefined
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
    // Matches backend: res.json({ members: [...] })
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

  // --- 🚨 ADDED MISSING METHODS BELOW ---

  // 1. Promote Member (Owner only)
  promoteMember: async (communityId: string, userId: string) => {
    const response = await api.post(`/communities/${communityId}/promote`, { userId });
    return response.data;
  },

  // 2. Transfer Ownership (Owner only)
  transferOwnership: async (communityId: string, newOwnerId: string) => {
    const response = await api.post(`/communities/${communityId}/transfer-owner`, { newOwnerId });
    return response.data;
  },

  // 3. Update Settings (Owner only)
  updateSettings: async (communityId: string, data: { name: string; description: string }) => {
    const response = await api.patch(`/communities/${communityId}/settings`, data);
    return response.data;
  },

  // 4. Delete Community (Owner only)
  deleteCommunity: async (communityId: string) => {
    const response = await api.delete(`/communities/${communityId}`);
    return response.data;
  }
};