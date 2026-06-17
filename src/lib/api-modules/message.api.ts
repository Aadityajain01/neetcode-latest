import api from '../api';

export const messageApi = {
  getMessages: async (communityId: string, limit: number = 50, since?: string, groupId?: string) => {
    const query = new URLSearchParams({ limit: String(limit) });
    if (since) query.set("since", since);
    const path = groupId ? `/messages/${communityId}/${groupId}` : `/messages/${communityId}`;
    const res = await api.get(`${path}?${query.toString()}`);
    return res.data;
  },
  
  sendMessage: async (communityId: string, text: string, groupId?: string) => {
    const res = await api.post('/messages', { communityId, groupId, text });
    return res.data;
  }
};
