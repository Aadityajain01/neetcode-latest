import api from '../api';

export const messageApi = {
  getMessages: async (communityId: string, limit: number = 50) => {
    const res = await api.get(`/messages/${communityId}?limit=${limit}`);
    return res.data;
  },
  
  sendMessage: async (communityId: string, text: string) => {
    const res = await api.post('/messages', { communityId, text });
    return res.data;
  }
};
