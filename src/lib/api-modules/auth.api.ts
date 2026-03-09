"use client"
import { api } from "@/lib/api";
import axios, { AxiosInstance } from "axios";

const AuthApiInstance: AxiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // required for the nc_session cookie to be sent/received
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

  // Restore session from the server-side Redis session (no Firebase token needed).
  // Returns { user } if a valid session cookie exists, throws otherwise.
  getSession: async () => {
    const response = await AuthApiInstance.get<{ user: any }>("/auth/session", {
      params: { t: Date.now() },
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
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
