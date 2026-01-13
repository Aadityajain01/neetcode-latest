import { api } from "@/lib/api";
import { Problem } from "./problem.api";
// import { Problem } from "./problem.api";

export const premiumApi = {
  getRoadmap: async () => {
    const res = await api.get('/premium/roadmap');
    return res.data.roadmap;
  },
  getProblem: async (params?: {
      type?: string;
      difficulty?: string;
      search?: string;
      limit?: number;
      offset?: number;
    }) => {
      // Matches backend response structure
      const response = await api.get<{
        problems: Problem[];
        pagination: { total: number; offset: number; limit: number };
      }>('/problems', { params });
      return response.data;
    },
//   getProblem: async (slug: string) => {
//     const res = await api.get(`/premium/problem/${slug}`);
//     return res.data;
//   }
};