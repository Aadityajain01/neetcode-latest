import api from '../api';

export const messageApi = {
  getMessages: async (communityId: string, limit: number = 50, since?: string) => {
    const query = new URLSearchParams({ limit: String(limit) });
    if (since) query.set("since", since);
    const res = await api.get(`/messages/${communityId}?${query.toString()}`);
    return res.data;
  },
  
  sendMessage: async (communityId: string, text: string) => {
    const res = await api.post('/messages', { communityId, text });
    return res.data;
  }
};
