import { api } from '@/lib/api';

export const authApi = {
  register: async (data: {
    firebaseUid: string;
    email: string;
    displayName?: string;
  }) => {
    const response = await api.post<{ user: any }>('/auth/register', data);
    return response.data.user;
  },

  login: async (idToken: string) => {
    const response = await api.post<{ user: any; idToken: string }>(
      '/auth/login',
      { idToken }
    );
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getMe: async () => {
    const response = await api.get<{ user: any }>('/auth/me');
    return response.data.user;
  },

  // refreshToken: async (idToken: string) => {
  //   const response = await api.post<{ idToken: string }>(
  //     '/auth/refresh-token',
  //     { idToken }
  //   );
  //   return response.data;
  // },

  verifyToken: async (idToken: string) => {
    const response = await api.post<{ valid: boolean; uid: string; email: string }>(
      '/auth/verify-token',
      { idToken }
    );
    return response.data;
  },
};
