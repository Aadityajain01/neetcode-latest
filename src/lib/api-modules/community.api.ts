import { api } from "@/lib/api";

export interface Community {
  _id: string;
  name: string;
  description: string;
  ownerId: string | { _id: string; displayName: string; email: string };
  type: "open" | "domain_restricted";
  domain?: string;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityMember {
  _id: string;
  communityId: string;
  userId: string | { _id: string; displayName: string; email: string; avatarUrl?: string };
  role: "owner" | "admin" | "member";
  joinedAt: string;
}

export const communityApi = {
  getCommunities: async (): Promise<Community[]> => {
    const response = await api.get<{ communities: Community[] }>("/communities");
    return response.data.communities ?? [];
  },

  getCommunityById: async (communityId: string) => {
    // ✅ This expects the exact object structure returned by the route above
    const res = await api.get<{ 
      community: Community; 
      isMember: boolean; 
      userRole: string | null 
    }>(`/communities/${communityId}`);
    return res.data;
  },

  createCommunity: async (data: {
    name: string;
    description: string;
    type: "open" | "domain_restricted";
    domain?: string;
  }) => {
    const response = await api.post<{ community: Community }>("/communities", data);
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
    const response = await api.get<{ members: CommunityMember[] }>(`/communities/${communityId}/members`, { params });
    return response.data;
  },

  updateSettings: async (communityId: string, data: { name: string; description: string }) => {
    const response = await api.patch(`/communities/${communityId}/settings`, data);
    return response.data;
  },

  deleteCommunity: async (communityId: string) => {
    const response = await api.delete(`/communities/${communityId}`);
    return response.data;
  },

  removeMember: async (communityId: string, userId: string) => {
    const response = await api.delete(`/communities/${communityId}/members/${userId}`);
    return response.data;
  },

  promoteMember: async (communityId: string, userId: string) => {
    const response = await api.post(`/communities/${communityId}/promote`, { userId });
    return response.data;
  },

  transferOwnership: async (communityId: string, newOwnerId: string) => {
    const response = await api.post(`/communities/${communityId}/transfer-owner`, { newOwnerId });
    return response.data;
  },
};