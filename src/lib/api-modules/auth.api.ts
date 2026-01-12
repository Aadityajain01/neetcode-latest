"use client"
import { api } from "@/lib/api";
import axios, { AxiosInstance } from "axios";
// import { User } from "firebase/auth";
const AuthApiInstance : AxiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}`,
  headers: {
    'Content-Type': 'application/json',
  },
});
export const authApi = {
  register: async (data: {
    firebaseUid: string;
    email: string;
    displayName?: string;
  }) => {
    const response = await AuthApiInstance.post<{ user: any }>("/auth/register", data);
    return response.data.user;
  },

  login: async (idToken: string) => {
    const response = await AuthApiInstance.post<{ user: any; idToken: string }>(
      "/auth/login",{idToken}
    
      // {
      //   headers: {
      //     "Content-Type": "application/json",
      //     "Authorization": `Bearer ${idToken}`,
      //   },
      // }
    );
    return response.data;
  },

  logout: async () => {
    const response = await AuthApiInstance.post("/auth/logout");
    return response.data;
  },

  getMe: async () => {
    const response = await AuthApiInstance.get<{ user: any }>("/auth/me");
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
    const response = await api.post<{
      valid: boolean;
      uid: string;
      email: string;
    }>("/auth/verify-token", { idToken });
    return response.data;
  },
};