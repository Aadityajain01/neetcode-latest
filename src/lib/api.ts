import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ;

export const api: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});


// Attach token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { token } = useAuthStore.getState();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);

// ❗ NO AUTH LOGIC HERE
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const serverMessage = error.response?.data?.error;

    // Avoid duplicate toasts: local pages already surface detailed API errors.
    // Global interceptor only handles fallbacks (network/unexpected errors).
    if (!serverMessage) {
      if (status === 401) {
        toast.error('Unauthorized request', { id: 'api-error-401' });
      } else if (status === 403) {
        toast.error('Access denied', { id: 'api-error-403' });
      } else if (!status) {
        toast.error('Network error. Please check your connection.', {
          id: 'api-error-network',
        });
      } else {
        toast.error('Something went wrong. Please try again.', {
          id: `api-error-${status}`,
        });
      }
    }

    return Promise.reject(error);
  }
);

export default api;
