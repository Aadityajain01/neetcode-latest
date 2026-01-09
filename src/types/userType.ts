// src/types/user.ts

export interface User {
  _id: string;
  email: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  role: 'admin' | 'user';
  socialLinks?: {
    github?: string;
    linkedin?: string;
    website?: string;
    twitter?: string;
  };
  createdAt: string;
}

export interface ProfileStats {
  score: number;
  rank: number;
  totalSubmissions: number;
  solvedBreakdown: {
    easy: number;
    medium: number;
    hard: number;
    total: number;
  };
}

export interface ActivityData {
  heatmap: Array<{ _id: string; count: number }>; // { _id: "2025-01-09", count: 5 }
  recent: Array<{
    _id: string;
    problemId: {
      title: string;
      difficulty: 'Easy' | 'Medium' | 'Hard';
      slug: string;
    };
    status: string;
    createdAt: string;
  }>;
}

export interface CommunityMembership {
  id: string;
  name: string;
  role: string;
}

// The full response from GET /api/user/profile/:id
export interface ProfileResponse {
  profile: {
    details: User;
    stats: ProfileStats;
    activity: ActivityData;
    communities: CommunityMembership[];
  };
}