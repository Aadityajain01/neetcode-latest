// src/lib/profile.api.ts
import { api } from "@/lib/api";

export const profileApi = {
  getMyProfile: () => api<{ profile: any }>("/users/profile/me"),
  getProfileById: (userId: string) =>
    api<{ profile: any }>(`/users/profile/${userId}`),

  updateProfile: (data: {
    displayName?: string;
    bio?: string;
    socialLinks?: any;
  }) =>
    api("/users/me", {
      method: "PATCH",
      data: data,
    }),
};
