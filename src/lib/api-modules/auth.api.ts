"use client"
import { api } from "@/lib/api";
import axios, { AxiosInstance } from "axios";

const AuthApiInstance: AxiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
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
      "/auth/login",
      { idToken }
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

  verifyToken: async (idToken: string) => {
    const response = await api.post<{
      valid: boolean;
      uid: string;
      email: string;
    }>("/auth/verify-token", { idToken });
    return response.data;
  },
};
