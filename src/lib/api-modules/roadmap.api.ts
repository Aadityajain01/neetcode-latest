import { api } from '@/lib/api';

// --- Type Definitions ---
export interface RoadmapMetadata {
  _id: string;
  slug: string;
  title: string;
  description?: string;
  icon?: string;
  level: string;
  estimatedTime: string;
  totalTopics: number;
  resourcesCount: number;
}

export interface RoadmapDetail extends RoadmapMetadata {
  layoutType: 'metromap' | 'tree';
  metroLines: any[];
  topics: any[];
  isAvailable: boolean;
}

// --- Roadmap API ---
export const roadmapApi = {
  // Fetch all available roadmaps metadata
  getRoadmaps: async () => {
    const response = await api.get<RoadmapMetadata[]>('/roadmaps');
    return response.data;
  },

  // Fetch full details of a specific roadmap by slug
  getRoadmapBySlug: async (slug: string) => {
    const response = await api.get<RoadmapDetail>(`/roadmaps/${slug}`);
    return response.data;
  },
};
